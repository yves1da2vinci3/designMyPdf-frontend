import type { UsageRecord } from './usageTypes';

export interface ConsumeUsageLogOptions {
  bestEffort?: boolean;
  allowPartial?: boolean;
}

export interface ConsumeUsageLogResult {
  partial: boolean;
  message?: string;
  deductedMicro?: number;
  skipped?: boolean;
}

export interface ConsumeUsageLogAggregateResult {
  outcomes: ConsumeUsageLogResult[];
  totalDeductedMicro: number;
  allSkipped: boolean;
}

export async function consumeUsageLog(
  authHeader: string,
  entries: UsageRecord[],
  options: ConsumeUsageLogOptions = {},
): Promise<ConsumeUsageLogAggregateResult> {
  const { bestEffort = false, allowPartial = false } = options;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const outcomes: ConsumeUsageLogResult[] = [];
  let totalDeductedMicro = 0;
  let billableCount = 0;

  for (const e of entries) {
    if (e.inputTokens <= 0 && e.outputTokens <= 0) {
      outcomes.push({ partial: false, skipped: true });
      continue;
    }
    billableCount += 1;

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
      deducted?: number;
      deductedCredits?: number;
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

    const deductedMicro =
      typeof body.deducted === 'number'
        ? body.deducted
        : typeof body.deductedCredits === 'number'
          ? Math.round(body.deductedCredits * 1000)
          : 0;
    totalDeductedMicro += deductedMicro;
    outcomes.push({ partial: Boolean(body.capped), deductedMicro });
  }

  return {
    outcomes,
    totalDeductedMicro,
    allSkipped: billableCount === 0,
  };
}
