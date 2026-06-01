export async function checkAiQuota(
  authHeader: string,
  withImage: boolean,
): Promise<{ ok: boolean; status: number; body: object }> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const response = await fetch(`${apiBase}/ai/quota/check`, {
    method: 'POST',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ withImage }),
  });
  const body = await response.json();
  return { ok: response.ok, status: response.status, body };
}
