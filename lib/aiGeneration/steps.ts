import type { AiStepEmitter } from './types';

export function emitStep(
  emit: AiStepEmitter | undefined,
  id: string,
  label: string,
  status: 'running' | 'done' | 'error',
  detail?: string,
): void {
  emit?.({ type: 'step', id, label, status, detail });
}

export async function runStep<T>(
  emit: AiStepEmitter | undefined,
  id: string,
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  emitStep(emit, id, label, 'running');
  try {
    const result = await fn();
    emitStep(emit, id, label, 'done');
    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    emitStep(emit, id, label, 'error', message);
    throw e;
  }
}
