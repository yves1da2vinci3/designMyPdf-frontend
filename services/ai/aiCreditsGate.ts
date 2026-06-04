import { getAiCredits } from './getAiCredits';
import { consumeUsageLog } from './consumeUsageLog';
import type { UsageRecord } from './usageTypes';
import {
  hasBillableUsage,
  MISSING_USAGE_WARNING,
  mergeUsageLogs,
  resolveGenerationUsageEntries,
} from './usageTypes';
import { beginAiRun, endAiRun, hasActiveAiRun } from '@/lib/aiGeneration/aiRunRegistry';
import { getAiVisionModel } from '@/lib/aiGeneration/models';

const PARTIAL_CREDIT_WARNING =
  'Décompte partiel : plafond mensuel atteint pendant cette génération.';

export async function assertCanStartAiRun(authHeader: string): Promise<void> {
  const credits = await getAiCredits(authHeader);
  if (!credits) {
    throw new Error('Authentication required');
  }
  const displayRemaining =
    credits.creditsRemaining ??
    (typeof credits.remaining === 'number' ? credits.remaining / 1000 : 0);
  if (displayRemaining <= 0 && !hasActiveAiRun(authHeader)) {
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
): Promise<{ warnings: string[]; creditsDeducted: number }> {
  const warnings = [...(result.warnings ?? [])];
  const entries = resolveGenerationUsageEntries({
    usageLog: result.usageLog,
    model: result.model,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    defaultModel: getAiVisionModel(),
  });

  if (!hasBillableUsage(entries)) {
    console.warn('[ai-credits] Aucun token facturable après génération', {
      model: result.model,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      usageLogLen: result.usageLog?.length ?? 0,
    });
    if (!warnings.includes(MISSING_USAGE_WARNING)) {
      warnings.push(MISSING_USAGE_WARNING);
    }
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(MISSING_USAGE_WARNING);
    }
    return { warnings, creditsDeducted: 0 };
  }

  const merged = mergeUsageLogs(entries);
  const { outcomes, totalDeductedMicro, allSkipped } = await consumeUsageLog(
    authHeader,
    merged,
    {
      bestEffort: true,
      allowPartial: true,
    },
  );

  if (allSkipped) {
    if (!warnings.includes(MISSING_USAGE_WARNING)) {
      warnings.push(MISSING_USAGE_WARNING);
    }
  }

  if (outcomes.some((o) => o.partial)) {
    if (!warnings.includes(PARTIAL_CREDIT_WARNING)) {
      warnings.push(PARTIAL_CREDIT_WARNING);
    }
  }

  const creditsDeducted = totalDeductedMicro / 1000;
  if (creditsDeducted > 0) {
    console.info('[ai-credits] Décompte appliqué', {
      creditsDeducted,
      models: merged.map((e) => e.model),
    });
  }

  return { warnings, creditsDeducted };
}
