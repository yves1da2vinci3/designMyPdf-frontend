import { createAnthropicSdk } from '@/services/agent/anthropicClient';
import { processImagesForAnalysis } from '@/services/agent/imageProcessor';
import { TEMPLATE_DESIGN_GUIDE } from '@/services/agent/pdfConstraints';
import {
  extractVariablesFromTemplate,
  buildVariableStructure,
} from '@/services/agent/templateUtils';
import { getAiTextModel } from '@/lib/aiGeneration/models';
import {
  detectLandscapeFromImages,
  resolveEffectiveLandscape,
} from '@/lib/aiGeneration/orientation';
import {
  buildImageViewportHint,
  buildPageContextPrompt,
} from '@/lib/aiGeneration/pdfPromptContext';
import { fontsStepLabel } from '@/lib/aiGeneration/detectFonts';
import type {
  AiStepEmitter,
  TemplateGenerationRequest,
  TemplateGenerationResult,
} from '@/lib/aiGeneration/types';
import { emitStep, runStep } from '@/lib/aiGeneration/steps';
import { normalizeEditorHtmlFragment } from '@/lib/aiGeneration/cleanHtml';
import { runSinglePassImageGeneration } from './imageVisionGeneration';

function buildTextOnlyPrompt(prompt: string, pageContext: string): string {
  return `You are an EXPERT UI/UX designer. Create a PROFESSIONAL template for: ${prompt}
${pageContext}
${TEMPLATE_DESIGN_GUIDE}
OUTPUT: ONLY inner HTML (no DOCTYPE). Semantic HTML5. Tailwind CSS. Handlebars for all dynamic content.
Return HTML now:`;
}

function formatImageDimensionsDetail(
  images: Awaited<ReturnType<typeof processImagesForAnalysis>>,
): string {
  return images.map((img, i) => `img${i + 1}: ${img.width}×${img.height}px`).join(', ');
}

export async function runTemplateGeneration(
  req: TemplateGenerationRequest,
  emit?: AiStepEmitter,
): Promise<TemplateGenerationResult> {
  const format = (req.format || 'a4').toLowerCase();
  const imageUrls = req.imageUrls?.filter(Boolean) ?? [];
  const hasImages = imageUrls.length > 0;
  const useAgent = req.useAgent === true;
  const useFidelityGraph = hasImages && req.useFidelityGraph === true;
  const useVisualQualityMode = hasImages && req.useVisualQualityMode === true;

  let processedImages: Awaited<ReturnType<typeof processImagesForAnalysis>> | undefined;
  if (hasImages) {
    processedImages = await runStep(
      emit,
      'analyze_images',
      'Préparation des images de référence',
      () => processImagesForAnalysis(imageUrls),
    );
    if (!processedImages?.length) {
      throw new Error(
        'Impossible de charger les images de référence pour l’analyse visuelle. Vérifiez les URLs ou réessayez.',
      );
    }
    emitStep(
      emit,
      'analyze_images',
      'Préparation des images de référence',
      'done',
      formatImageDimensionsDetail(processedImages),
    );
  }

  const detectedLandscape = processedImages ? detectLandscapeFromImages(processedImages) : false;

  const effectiveLandscape = resolveEffectiveLandscape(
    req.isLandscape === true,
    hasImages,
    detectedLandscape,
  );

  emitStep(
    emit,
    'detect_orientation',
    effectiveLandscape ? 'Orientation paysage détectée / appliquée' : 'Orientation portrait',
    'done',
    effectiveLandscape ? 'landscape' : 'portrait',
  );

  const agentOptions = {
    format,
    isLandscape: effectiveLandscape,
    pdfContentPadding: req.pdfContentPadding,
  };

  if (useFidelityGraph && processedImages?.length) {
    const { runFidelityGraph } = await import('@/services/agent/fidelityGraph');
    return runFidelityGraph(req, processedImages, emit);
  }

  if (useVisualQualityMode && processedImages?.length) {
    const { runVisualQualityGraph } = await import('@/services/agent/visualQualityGraph');
    return runVisualQualityGraph(req, processedImages, emit);
  }

  if (useAgent) {
    const { generateTemplateWithAgent } = await import('@/services/agent/agentGraph');
    const result = await generateTemplateWithAgent(
      req.prompt,
      hasImages ? imageUrls : undefined,
      agentOptions,
      emit,
    );
    emitStep(emit, 'fonts', fontsStepLabel(result.content), 'done');
    return {
      content: result.content,
      suggestedVariables: result.suggestedVariables,
      recommendedLandscape: result.recommendedLandscape ?? effectiveLandscape,
      layoutSummary: result.layoutSummary,
      warnings: result.warnings,
    };
  }

  const pageContext = buildPageContextPrompt(format, effectiveLandscape, req.pdfContentPadding);
  const viewportHint = buildImageViewportHint(format, effectiveLandscape, req.pdfContentPadding);

  let template: string;
  let inputTokens = 0;
  let outputTokens = 0;
  let model = getAiTextModel();
  let draftVariables: Record<string, unknown> = {};

  if (hasImages && processedImages) {
    const single = await runSinglePassImageGeneration({
      prompt: req.prompt,
      processedImages,
      viewportHint,
      emit,
    });
    template = single.html;
    draftVariables = single.suggestedVariables;
    inputTokens = single.usage.inputTokens;
    outputTokens = single.usage.outputTokens;
    model = single.usage.model;
  } else {
    const anthropic = createAnthropicSdk();
    template = await runStep(emit, 'generate_html', 'Génération du HTML', async () => {
      const msg = await anthropic.messages.create({
        model,
        max_tokens: 8192,
        messages: [
          {
            role: 'user',
            content: buildTextOnlyPrompt(req.prompt, pageContext),
          },
        ],
      });
      if (msg.content.length === 0 || msg.content[0].type !== 'text') {
        throw new Error('Invalid response from AI model');
      }
      inputTokens += msg.usage?.input_tokens ?? 0;
      outputTokens += msg.usage?.output_tokens ?? 0;
      return normalizeEditorHtmlFragment(msg.content[0].text);
    });
  }

  const suggestedVariables = await runStep(
    emit,
    'extract_variables',
    "Mise à jour des variables d'exemple",
    async () => {
      const extractedVars = extractVariablesFromTemplate(template);
      const built = buildVariableStructure(extractedVars, template);
      return { ...draftVariables, ...built };
    },
  );

  emitStep(emit, 'fonts', fontsStepLabel(template), 'done');

  const usageEntry =
    inputTokens > 0 || outputTokens > 0 ? [{ model, inputTokens, outputTokens }] : undefined;

  const modeLabel = useVisualQualityMode
    ? 'mode qualité'
    : hasImages
      ? '1 passe vision'
      : 'texte';

  return {
    content: template,
    suggestedVariables,
    recommendedLandscape: effectiveLandscape,
    layoutSummary: hasImages
      ? `- **${modeLabel}** : ${effectiveLandscape ? 'paysage' : 'portrait'} (layout = maquette).\n- ${imageUrls.length} image(s) de référence.`
      : undefined,
    inputTokens,
    outputTokens,
    model,
    usageLog: usageEntry,
    warnings:
      outputTokens >= 16000
        ? [
            'La sortie du modèle est proche de la limite — le HTML peut être tronqué. Réessayez avec une maquette plus simple ou activez le mode qualité.',
          ]
        : undefined,
  };
}
