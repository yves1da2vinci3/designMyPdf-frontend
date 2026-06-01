export interface AiCreditsBalance {
  used: number;
  limit: number;
  remaining: number;
  creditsUsed: number;
  creditsLimit: number;
  creditsRemaining: number;
  month: string;
}

export async function getAiCredits(authHeader: string): Promise<AiCreditsBalance | null> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  try {
    const response = await fetch(`${apiBase}/ai/credits`, {
      method: 'GET',
      headers: { Authorization: authHeader },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}
