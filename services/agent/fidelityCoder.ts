import { createAnthropicSdk } from './anthropicClient';
import { getAiVisionModel } from '@/lib/aiGeneration/models';
import { buildPageContextPrompt } from '@/lib/aiGeneration/pdfPromptContext';
import { normalizeEditorHtmlFragment } from '@/lib/aiGeneration/cleanHtml';
import type { UsageRecord } from '@/services/ai/usageTypes';
import { usageFromAnthropicResponse } from '@/services/ai/usageTypes';
import type { AgentGenerationOptions, CriticDelta, ProcessedImage, UiAnalysis } from './types';
import { buildCoderSystemPrompt } from './fidelityPrompts';
import { buildAnalysisChecklist } from './fidelityChecklist';
import { formatDeltasForCoder, parseCoderResponse } from './fidelityJson';

type VisionMime = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

function visionMime(mimeType: string): VisionMime {
  if (mimeType === 'image/jpeg' || mimeType === 'image/gif' || mimeType === 'image/webp') {
    return mimeType;
  }
  return 'image/png';
}

function imageBlockFromBase64(base64: string, mimeType: VisionMime = 'image/png') {
  return {
    type: 'image' as const,
    source: {
      type: 'base64' as const,
      media_type: mimeType,
      data: base64,
    },
  };
}

function imageBlocks(images: ProcessedImage[]) {
  return images.map((img) => imageBlockFromBase64(img.base64, visionMime(img.mimeType)));
}

export async function runFidelityCoder(params: {
  prompt: string;
  analysis: UiAnalysis;
  images: ProcessedImage[];
  generationOptions: AgentGenerationOptions;
  criticNotes?: string;
  criticDeltas?: CriticDelta[];
  previousCode?: string;
  renderPngBase64?: string;
  iteration: number;
}): Promise<{
  html: string;
  suggestedVariables: Record<string, unknown>;
  usage: UsageRecord;
}> {
  const {
    prompt,
    analysis,
    images,
    generationOptions,
    criticNotes,
    criticDeltas,
    previousCode,
    renderPngBase64,
    iteration,
  } = params;
  const sdk = createAnthropicSdk();
  const isRefine = Boolean(criticNotes || criticDeltas?.length || renderPngBase64);
  const useVision = iteration === 0 || isRefine;
  const model = getAiVisionModel();

  const pageContext = buildPageContextPrompt(
    generationOptions.format || 'a4',
    generationOptions.isLandscape ?? false,
    generationOptions.pdfContentPadding,
  );

  const system = buildCoderSystemPrompt(pageContext, useVision);

  let userText = `Demande: ${prompt}\n\n${buildAnalysisChecklist(analysis)}\n\nAnalyse JSON:\n${JSON.stringify(analysis, null, 2)}`;

  if (isRefine && previousCode) {
    const deltaText = criticDeltas?.length
      ? formatDeltasForCoder(criticDeltas)
      : (criticNotes ?? '');
    userText += `\n\nHTML actuel:\n\`\`\`html\n${previousCode}\n\`\`\`\n\nCorrections (appliquer UNIQUEMENT):\n${deltaText}`;
    userText +=
      '\n\nImage 1 = maquette originale. Image 2 (si présente) = rendu actuel à corriger.';
  }

  const content: Array<ReturnType<typeof imageBlockFromBase64> | { type: 'text'; text: string }> =
    [];

  if (useVision) {
    content.push(...imageBlocks(images));
    if (renderPngBase64) {
      content.push(imageBlockFromBase64(renderPngBase64, 'image/png'));
    }
  }
  content.push({ type: 'text', text: userText });

  const response = await sdk.messages.create({
    model,
    max_tokens: 8192,
    system,
    messages: [{ role: 'user', content }],
  });

  if (response.content[0]?.type !== 'text') {
    throw new Error('Réponse coder invalide');
  }

  const parsed = parseCoderResponse(response.content[0].text);
  const html = normalizeEditorHtmlFragment(parsed.html);
  return {
    html,
    suggestedVariables: parsed.suggestedVariables,
    usage: usageFromAnthropicResponse(model, response.usage),
  };
}
