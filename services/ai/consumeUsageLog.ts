import type { UsageRecord } from './usageTypes';

export interface ConsumeUsageLogOptions {
  bestEffort?: boolean;
  allowPartial?: boolean;
}

export interface ConsumeUsageLogResult {
  partial: boolean;
  message?: string;
}

export async function consumeUsageLog(
  authHeader: string,
  entries: UsageRecord[],
  options: ConsumeUsageLogOptions = {},
): Promise<ConsumeUsageLogResult[]> {
  const { bestEffort = false, allowPartial = false } = options;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const outcomes: ConsumeUsageLogResult[] = [];

  for (const e of entries) {
    if (e.inputTokens <= 0 && e.outputTokens <= 0) continue;

    const res = await fetch(`${apiBase}/ai/credits/consume`, {
      method: 'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: e.model,
        inputTokens: e.inputTokens,
        outputTokens: e.outputTokens,
        allowPartial: allowPartial || bestEffort,
      }),
    });

    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      capped?: boolean;
    };

    if (!res.ok) {
      if (bestEffort && (res.status === 429 || body.capped)) {
        outcomes.push({
          partial: true,
          message: body.error ?? 'Limite mensuelle de génération IA atteinte.',
        });
        continue;
      }
      if (res.status === 429) {
        throw new Error('Limite mensuelle de génération IA atteinte.');
      }
      throw new Error(body.error ?? 'Échec du décompte des crédits IA');
    }

    outcomes.push({ partial: Boolean(body.capped) });
  }

  return outcomes;
}
