export interface UsageRecord {
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export const MISSING_USAGE_WARNING =
  'Usage tokens non reçu depuis le modèle — décompte des crédits non appliqué.';

export function usageFromAnthropicResponse(
  fallbackModel: string,
  usage?: { input_tokens?: number; output_tokens?: number } | null,
  responseModel?: string | null,
): UsageRecord {
  const model = (responseModel?.trim() || fallbackModel).trim() || fallbackModel;
  return {
    model,
    inputTokens: usage?.input_tokens ?? 0,
    outputTokens: usage?.output_tokens ?? 0,
  };
}

/** Agrège les entrées par modèle (somme input/output). Ignore les lignes à 0 token. */
export function mergeUsageLogs(entries: UsageRecord[]): UsageRecord[] {
  const byModel = new Map<string, UsageRecord>();
  for (const e of entries) {
    if (e.inputTokens <= 0 && e.outputTokens <= 0) continue;
    const key = e.model?.trim() || 'unknown';
    const prev = byModel.get(key);
    if (prev) {
      prev.inputTokens += e.inputTokens;
      prev.outputTokens += e.outputTokens;
    } else {
      byModel.set(key, {
        model: key,
        inputTokens: e.inputTokens,
        outputTokens: e.outputTokens,
      });
    }
  }
  return Array.from(byModel.values());
}

export function sumUsage(entries: UsageRecord[]): { inputTokens: number; outputTokens: number } {
  return entries.reduce(
    (acc, e) => ({
      inputTokens: acc.inputTokens + e.inputTokens,
      outputTokens: acc.outputTokens + e.outputTokens,
    }),
    { inputTokens: 0, outputTokens: 0 },
  );
}

export function hasBillableUsage(entries: UsageRecord[]): boolean {
  return entries.some((e) => e.inputTokens > 0 || e.outputTokens > 0);
}

export function resolveGenerationUsageEntries(params: {
  usageLog?: UsageRecord[];
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  defaultModel: string;
}): UsageRecord[] {
  const fallback: UsageRecord[] =
    (params.inputTokens ?? 0) > 0 || (params.outputTokens ?? 0) > 0
      ? [
          {
            model: params.model ?? params.defaultModel,
            inputTokens: params.inputTokens ?? 0,
            outputTokens: params.outputTokens ?? 0,
          },
        ]
      : [];
  const raw = params.usageLog?.length ? [...params.usageLog, ...fallback] : fallback;
  return mergeUsageLogs(raw);
}
