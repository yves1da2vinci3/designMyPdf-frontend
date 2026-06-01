import { authJsonHeaders } from '@/lib/authFetch';
import type { AiStep, AiStreamEvent } from './types';
import type { ChatTurnRequest } from '@/services/ai/templateChatService';

export interface ChatStreamResult {
  content: string;
  suggestedVariables: Record<string, unknown>;
  recommendedLandscape: boolean;
  responseText: string;
  toolCalls: AiStep[];
  warnings?: string[];
}

export async function runChatStream(
  request: ChatTurnRequest,
  onStepsUpdate: (steps: AiStep[]) => void,
  onTextDelta: (fullText: string) => void,
): Promise<ChatStreamResult> {
  const stepMap = new Map<string, AiStep>();
  let accumulatedText = '';

  const upsertStep = (event: Extract<AiStreamEvent, { type: 'step' }>) => {
    stepMap.set(event.id, {
      id: event.id,
      label: event.label,
      status: event.status,
      detail: event.detail,
    });
    onStepsUpdate(Array.from(stepMap.values()));
  };

  const response = await fetch('/api/chat-template', {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const message =
      (errBody as { error?: string }).error ||
      (errBody as { message?: string }).message ||
      'Failed to process request';
    throw new Error(message);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response stream');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (!json) continue;
      const event = JSON.parse(json) as AiStreamEvent;

      if (event.type === 'step') {
        upsertStep(event);
      } else if (event.type === 'text_delta') {
        accumulatedText += event.delta;
        onTextDelta(accumulatedText);
      } else if (event.type === 'text_done') {
        accumulatedText = event.text;
        onTextDelta(accumulatedText);
      } else if (event.type === 'error') {
        throw new Error(event.message);
      } else if (event.type === 'done') {
        return {
          content: event.content,
          suggestedVariables: event.suggestedVariables,
          recommendedLandscape: event.recommendedLandscape,
          responseText: event.responseText || accumulatedText || '',
          toolCalls: Array.from(stepMap.values()),
          warnings: event.warnings,
        };
      }
    }
  }

  throw new Error('Stream ended without result');
}
