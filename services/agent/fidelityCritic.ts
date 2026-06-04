import { createAnthropicSdk } from './anthropicClient';
import { getAiVisionModel } from '@/lib/aiGeneration/models';
import type { UsageRecord } from '@/services/ai/usageTypes';
import { usageFromAnthropicResponse } from '@/services/ai/usageTypes';
import type { CriticDelta, ProcessedImage } from './types';
import { CRITIC_COMPARE_PROMPT } from './fidelityPrompts';
import { parseCriticResponse } from './fidelityJson';

export async function runFidelityCritic(
  referenceImages: ProcessedImage[],
  renderPngBase64: string,
): Promise<{
  passed: boolean;
  corrections?: string;
  deltas?: CriticDelta[];
  usage: UsageRecord;
}> {
  const sdk = createAnthropicSdk();
  const model = getAiVisionModel();
  const ref = referenceImages[0];
  if (!ref) {
    return {
      passed: true,
      usage: { model, inputTokens: 0, outputTokens: 0 },
    };
  }

  const response = await sdk.messages.create({
    model,
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: CRITIC_COMPARE_PROMPT },
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: ref.mimeType === 'image/jpeg' ? 'image/jpeg' : 'image/png',
              data: ref.base64,
            },
          },
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: renderPngBase64,
            },
          },
        ],
      },
    ],
  });

  if (response.content[0]?.type !== 'text') {
    throw new Error('Réponse critic invalide');
  }

  const usage = usageFromAnthropicResponse(model, response.usage, response.model);

  try {
    const parsed = parseCriticResponse(response.content[0].text);
    return { ...parsed, usage };
  } catch {
    return {
      passed: false,
      corrections: response.content[0].text,
      usage,
    };
  }
}
