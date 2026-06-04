import { createAnthropicSdk } from '@/services/agent/anthropicClient';
import { parseCoderResponse } from '@/services/agent/fidelityJson';
import { getAiVisionModel } from '@/lib/aiGeneration/models';
import {
  buildImageGenerationSystemPrompt,
  buildImageGenerationUserText,
  IMAGE_VISION_MAX_OUTPUT_TOKENS,
} from '@/lib/aiGeneration/imageGenerationPrompt';
import { normalizeEditorHtmlFragment } from '@/lib/aiGeneration/cleanHtml';
import type { AiStepEmitter } from '@/lib/aiGeneration/types';
import { runStep } from '@/lib/aiGeneration/steps';
import type { ProcessedImage } from '@/services/agent/types';
import type { UsageRecord } from '@/services/ai/usageTypes';
import { usageFromAnthropicResponse } from '@/services/ai/usageTypes';

type VisionMime = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

function visionMime(mimeType: string): VisionMime {
  if (mimeType === 'image/jpeg' || mimeType === 'image/gif' || mimeType === 'image/webp') {
    return mimeType;
  }
  return 'image/png';
}

export async function runSinglePassImageGeneration(params: {
  prompt: string;
  processedImages: ProcessedImage[];
  viewportHint: string;
  emit?: AiStepEmitter;
}): Promise<{
  html: string;
  suggestedVariables: Record<string, unknown>;
  usage: UsageRecord;
}> {
  const { prompt, processedImages, viewportHint, emit } = params;
  const anthropic = createAnthropicSdk();
  const model = getAiVisionModel();
  const system = buildImageGenerationSystemPrompt(viewportHint);
  const userText = buildImageGenerationUserText(prompt);

  const imageParts = processedImages.map((img) => ({
    type: 'image' as const,
    source: {
      type: 'base64' as const,
      media_type: visionMime(img.mimeType),
      data: img.base64,
    },
  }));

  return runStep(emit, 'generate_html', "Génération du HTML depuis l'image", async () => {
    const msg = await anthropic.messages.create({
      model,
      max_tokens: IMAGE_VISION_MAX_OUTPUT_TOKENS,
      system,
      messages: [
        {
          role: 'user',
          content: [...imageParts, { type: 'text', text: userText }],
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
      suggestedVariables: parsed.suggestedVariables ?? {},
      usage: usageFromAnthropicResponse(model, msg.usage),
    };
  });
}
