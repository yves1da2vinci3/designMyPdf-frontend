import { consumeUsageLog } from './consumeUsageLog';

/** @deprecated Préférer consumeUsageLog pour plusieurs modèles. */
export async function consumeAiCredits(
  authHeader: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
): Promise<void> {
  await consumeUsageLog(authHeader, [{ model, inputTokens, outputTokens }], {
    bestEffort: true,
    allowPartial: true,
  });
}
