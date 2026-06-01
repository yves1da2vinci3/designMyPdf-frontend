import { ChatAnthropic } from '@langchain/anthropic';
import Anthropic from '@anthropic-ai/sdk';
import { getAiTextModel, getAiVisionModel } from '@/lib/aiGeneration/models';

export function createAnthropicSdk(apiKey?: string): Anthropic {
  return new Anthropic({
    apiKey: apiKey || process.env.ANTHROPIC_API_KEY || '',
  });
}

export function createChatAnthropic(vision = false, apiKey?: string): ChatAnthropic {
  return new ChatAnthropic({
    modelName: vision ? getAiVisionModel() : getAiTextModel(),
    temperature: vision ? 0.3 : 0.3,
    maxTokens: 8192,
    anthropicApiKey: apiKey || process.env.ANTHROPIC_API_KEY || '',
  });
}
