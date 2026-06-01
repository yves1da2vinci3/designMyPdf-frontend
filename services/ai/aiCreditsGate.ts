import { getAiCredits } from './getAiCredits';
import { consumeUsageLog, type ConsumeUsageLogResult } from './consumeUsageLog';
import type { UsageRecord } from './usageTypes';
import { beginAiRun, endAiRun, hasActiveAiRun } from '@/lib/aiGeneration/aiRunRegistry';
import { getAiVisionModel } from '@/lib/aiGeneration/models';

const PARTIAL_CREDIT_WARNING =
  'Décompte partiel : plafond mensuel atteint pendant cette génération.';

export async function assertCanStartAiRun(authHeader: string): Promise<void> {
  const credits = await getAiCredits(authHeader);
  if (!credits) {
    throw new Error('Authentication required');
  }
  if (credits.remaining <= 0 && !hasActiveAiRun(authHeader)) {
    const err = new Error('Monthly credit limit reached');
    (err as Error & { statusCode?: number }).statusCode = 429;
    throw err;
  }
}

export async function runWithAiRunLock<T>(authHeader: string, fn: () => Promise<T>): Promise<T> {
  beginAiRun(authHeader);
  try {
    return await fn();
  } finally {
    endAiRun(authHeader);
  }
}

export async function consumeGenerationCredits(
  authHeader: string,
  result: {
    usageLog?: UsageRecord[];
    model?: string;
    inputTokens?: number;
    outputTokens?: number;
    warnings?: string[];
  },
): Promise<{ warnings: string[] }> {
  const warnings = [...(result.warnings ?? [])];
  const entries: UsageRecord[] = result.usageLog?.length
    ? result.usageLog
    : [
        {
          model: result.model ?? getAiVisionModel(),
          inputTokens: result.inputTokens ?? 0,
          outputTokens: result.outputTokens ?? 0,
        },
      ];

  const outcomes: ConsumeUsageLogResult[] = await consumeUsageLog(authHeader, entries, {
    bestEffort: true,
    allowPartial: true,
  });

  if (outcomes.some((o) => o.partial)) {
    if (!warnings.includes(PARTIAL_CREDIT_WARNING)) {
      warnings.push(PARTIAL_CREDIT_WARNING);
    }
  }

  return { warnings };
}
