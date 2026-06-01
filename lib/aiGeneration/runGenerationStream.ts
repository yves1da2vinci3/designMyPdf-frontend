import { authJsonHeaders } from '@/lib/authFetch';
import type { AiStep, AiStreamEvent, TemplateGenerationRequest } from './types';

export interface StreamGenerationResult {
  content: string;
  suggestedVariables: Record<string, unknown>;
  recommendedLandscape: boolean;
  layoutSummary?: string;
  warnings?: string[];
}

export async function runGenerationStream(
  request: TemplateGenerationRequest,
  onStepsUpdate: (steps: AiStep[]) => void,
  onLayoutSummary?: (summary: string) => void,
): Promise<StreamGenerationResult> {
  const stepMap = new Map<string, AiStep>();

  const upsertStep = (event: Extract<AiStreamEvent, { type: 'step' }>) => {
    stepMap.set(event.id, {
      id: event.id,
      label: event.label,
      status: event.status,
      detail: event.detail,
    });
    onStepsUpdate(Array.from(stepMap.values()));
  };

  const response = await fetch('/api/generate-template-stream', {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const message =
      (errBody as { error?: string }).error ||
      (errBody as { message?: string }).message ||
      'Failed to generate template';
    throw new Error(message);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response stream');
  }

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
      } else if (event.type === 'error') {
        throw new Error(event.message);
      } else if (event.type === 'done') {
        if (event.layoutSummary) {
          onLayoutSummary?.(event.layoutSummary);
        }
        return {
          content: event.content,
          suggestedVariables: event.suggestedVariables,
          recommendedLandscape: event.recommendedLandscape,
          layoutSummary: event.layoutSummary,
          warnings: event.warnings,
        };
      }
    }
  }

  throw new Error('Stream ended without result');
}
