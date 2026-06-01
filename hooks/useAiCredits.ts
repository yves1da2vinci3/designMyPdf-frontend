import { useCallback, useEffect, useState } from 'react';
import { authApi } from '@/api/authApi';

export interface UseAiCreditsResult {
  used: number;
  limit: number;
  remaining: number;
  month: string;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAiCredits(): UseAiCreditsResult {
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(1000);
  const [remaining, setRemaining] = useState(1000);
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = authApi.getUserSession()?.accessToken;
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-credits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setError('Impossible de charger les crédits IA');
        return;
      }
      const data = await res.json();
      const creditsUsed = data.creditsUsed ?? data.used ?? 0;
      const creditsLimit = data.creditsLimit ?? data.limit ?? 1000;
      const creditsRemaining =
        data.creditsRemaining ?? data.remaining ?? Math.max(0, creditsLimit - creditsUsed);
      setUsed(creditsUsed);
      setLimit(creditsLimit);
      setRemaining(creditsRemaining);
      setMonth(data.month ?? '');
    } catch {
      setError('Impossible de charger les crédits IA');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { used, limit, remaining, month, loading, error, refresh };
}
