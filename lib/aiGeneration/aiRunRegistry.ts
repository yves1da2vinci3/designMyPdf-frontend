const TTL_MS = 10 * 60 * 1000;
const activeRuns = new Map<string, number>();

function runKey(authHeader: string): string {
  return authHeader.trim();
}

export function beginAiRun(authHeader: string): void {
  activeRuns.set(runKey(authHeader), Date.now());
}

export function endAiRun(authHeader: string): void {
  activeRuns.delete(runKey(authHeader));
}

export function hasActiveAiRun(authHeader: string): boolean {
  const key = runKey(authHeader);
  const started = activeRuns.get(key);
  if (!started) return false;
  if (Date.now() - started > TTL_MS) {
    activeRuns.delete(key);
    return false;
  }
  return true;
}
