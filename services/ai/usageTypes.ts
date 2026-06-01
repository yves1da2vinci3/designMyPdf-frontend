export interface UsageRecord {
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export function usageFromAnthropicResponse(
  model: string,
  usage?: { input_tokens?: number; output_tokens?: number } | null,
): UsageRecord {
  return {
    model,
    inputTokens: usage?.input_tokens ?? 0,
    outputTokens: usage?.output_tokens ?? 0,
  };
}

export function mergeUsageLogs(entries: UsageRecord[]): UsageRecord[] {
  return entries.filter((e) => e.inputTokens > 0 || e.outputTokens > 0);
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
