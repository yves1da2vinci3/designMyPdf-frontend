import { createAnthropicSdk } from '@/services/agent/anthropicClient';
import { processImagesForAnalysis } from '@/services/agent/imageProcessor';
import { parseCoderResponse } from '@/services/agent/fidelityJson';
import { TEMPLATE_DESIGN_GUIDE } from '@/services/agent/pdfConstraints';
import {
  extractVariablesFromTemplate,
  buildVariableStructure,
} from '@/services/agent/templateUtils';
import { getAiTextModel, getAiVisionModel } from '@/lib/aiGeneration/models';
import {
  detectLandscapeFromImages,
  resolveEffectiveLandscape,
} from '@/lib/aiGeneration/orientation';
import { buildPageContextPrompt } from '@/lib/aiGeneration/pdfPromptContext';
import { buildSinglePassImagePrompt } from '@/lib/aiGeneration/imageGenerationPrompt';
import { fontsStepLabel } from '@/lib/aiGeneration/detectFonts';
import type {
  AiStepEmitter,
  TemplateGenerationRequest,
  TemplateGenerationResult,
} from '@/lib/aiGeneration/types';
import type { ProcessedImage } from '@/services/agent/types';
import { emitStep, runStep } from '@/lib/aiGeneration/steps';
import { cleanHtmlFromModel, normalizeEditorHtmlFragment } from '@/lib/aiGeneration/cleanHtml';

function buildTextOnlyPrompt(prompt: string, pageContext: string): string {
  return `You are an EXPERT UI/UX designer. Create a PROFESSIONAL template for: ${prompt}
${pageContext}
${TEMPLATE_DESIGN_GUIDE}
OUTPUT: ONLY inner HTML (no DOCTYPE). Semantic HTML5. Tailwind CSS. Handlebars for all dynamic content.
Return HTML now:`;
}

async function runSinglePassImageGeneration(params: {
  prompt: string;
  processedImages: ProcessedImage[];
  pageContext: string;
  emit?: AiStepEmitter;
}): Promise<{ html: string; inputTokens: number; outputTokens: number; model: string }> {
  const { prompt, processedImages, pageContext, emit } = params;
  const anthropic = createAnthropicSdk();
  const model = getAiVisionModel();

  const imageParts = processedImages.map((img) => ({
    type: 'image' as const,
    source: {
      type: 'base64' as const,
      media_type: img.mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
      data: img.base64,
    },
  }));

  return runStep(emit, 'generate_html', "Génération du HTML depuis l'image", async () => {
    const msg = await anthropic.messages.create({
      model,
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: [
            ...imageParts,
            { type: 'text', text: buildSinglePassImagePrompt(prompt, pageContext) },
          ],
        },
      ],
    });
    if (msg.content.length === 0 || msg.content[0].type !== 'text') {
      throw new Error('Invalid response from AI model');
    }
    const parsed = parseCoderResponse(msg.content[0].text);
    const html = normalizeEditorHtmlFragment(parsed.html);
    return {
      html,
      inputTokens: msg.usage?.input_tokens ?? 0,
      outputTokens: msg.usage?.output_tokens ?? 0,
      model,
    };
  });
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

  let template: string;
  let inputTokens = 0;
  let outputTokens = 0;
  let model = getAiTextModel();

  if (hasImages && processedImages) {
    const single = await runSinglePassImageGeneration({
      prompt: req.prompt,
      processedImages,
      pageContext,
      emit,
    });
    template = single.html;
    inputTokens = single.inputTokens;
    outputTokens = single.outputTokens;
    model = single.model;
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
      return buildVariableStructure(extractedVars, template);
    },
  );

  emitStep(emit, 'fonts', fontsStepLabel(template), 'done');

  const usageEntry =
    inputTokens > 0 || outputTokens > 0 ? [{ model, inputTokens, outputTokens }] : undefined;

  return {
    content: template,
    suggestedVariables,
    recommendedLandscape: effectiveLandscape,
    layoutSummary: hasImages
      ? `- **Orientation** : ${effectiveLandscape ? 'paysage' : 'portrait'}\n- Template généré à partir de ${imageUrls.length} image(s) de référence.`
      : undefined,
    inputTokens,
    outputTokens,
    model,
    usageLog: usageEntry,
  };
}
