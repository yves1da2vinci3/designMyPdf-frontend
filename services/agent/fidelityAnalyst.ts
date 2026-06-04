import { createAnthropicSdk } from './anthropicClient';
import { getAiVisionModel } from '@/lib/aiGeneration/models';
import type { UsageRecord } from '@/services/ai/usageTypes';
import { usageFromAnthropicResponse } from '@/services/ai/usageTypes';
import type { ProcessedImage, UiAnalysis } from './types';
import { SYSTEM_ANALYST } from './fidelityPrompts';
import { parseUiAnalysis } from './fidelityJson';

type VisionMime = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

function visionMime(mimeType: string): VisionMime {
  if (mimeType === 'image/jpeg' || mimeType === 'image/gif' || mimeType === 'image/webp') {
    return mimeType;
  }
  return 'image/png';
}

function imageBlocks(images: ProcessedImage[]) {
  return images.map((img) => ({
    type: 'image' as const,
    source: {
      type: 'base64' as const,
      media_type: visionMime(img.mimeType),
      data: img.base64,
    },
  }));
}

export async function runFidelityAnalyst(
  prompt: string,
  images: ProcessedImage[],
): Promise<{ analysis: UiAnalysis; usage: UsageRecord }> {
  const sdk = createAnthropicSdk();
  const model = getAiVisionModel();
  const img = images[0];
  const dimHint =
    img?.width && img?.height
      ? `\nDimensions image analysée: ${img.width}×${img.height}px. Renseigne dimensions_maquette en cohérence.`
      : '';

  const runOnce = async () => {
    const response = await sdk.messages.create({
      model,
      max_tokens: 4096,
      system: SYSTEM_ANALYST,
      messages: [
        {
          role: 'user',
          content: [
            ...imageBlocks(images),
            {
              type: 'text',
              text: `Demande utilisateur: ${prompt}${dimHint}\nAnalyse la maquette et renvoie le JSON.`,
            },
          ],
        },
      ],
    });
    if (response.content[0]?.type !== 'text') {
      throw new Error('Réponse analyste invalide');
    }
    return response;
  };

  let response;
  try {
    response = await runOnce();
  } catch {
    response = await runOnce();
  }

  const firstBlock = response.content[0];
  if (!firstBlock || firstBlock.type !== 'text') {
    throw new Error('Réponse analyste invalide');
  }

  let analysis = parseUiAnalysis(firstBlock.text);
  if (!analysis.dimensions_maquette && img?.width && img?.height) {
    analysis = {
      ...analysis,
      dimensions_maquette: { width: img.width, height: img.height },
    };
  }
  if (!analysis.viewport_recommande && analysis.dimensions_maquette) {
    analysis.viewport_recommande = { ...analysis.dimensions_maquette };
  }

  return {
    analysis,
    usage: usageFromAnthropicResponse(model, response.usage, response.model),
  };
}

export function buildLayoutSummaryFromAnalysis(analysis: UiAnalysis): string {
  const colors = analysis.palette_couleurs.slice(0, 6).join(', ');
  const sections = analysis.structure_dom.map((s) => s.role || s.id).join(' → ');
  return `Palette: ${colors || 'n/a'}\nStructure: ${sections || 'n/a'}`;
}
