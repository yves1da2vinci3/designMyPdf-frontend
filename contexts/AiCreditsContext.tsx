import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '@/api/authApi';

export interface AiCreditsBalance {
  used: number;
  limit: number;
  remaining: number;
  month: string;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const AiCreditsContext = createContext<AiCreditsBalance | null>(null);

function parseCreditsBalance(data: Record<string, unknown>): {
  used: number;
  limit: number;
  remaining: number;
  month: string;
} {
  if (typeof data.creditsUsed === 'number' && typeof data.creditsLimit === 'number') {
    const used = data.creditsUsed;
    const limit = data.creditsLimit;
    const remaining =
      typeof data.creditsRemaining === 'number' ? data.creditsRemaining : Math.max(0, limit - used);
    return { used, limit, remaining, month: String(data.month ?? '') };
  }
  const usedMicro = typeof data.used === 'number' ? data.used : 0;
  const limitMicro = typeof data.limit === 'number' ? data.limit : 1_000_000;
  const remainingMicro =
    typeof data.remaining === 'number' ? data.remaining : Math.max(0, limitMicro - usedMicro);
  return {
    used: usedMicro / 1000,
    limit: limitMicro / 1000,
    remaining: remainingMicro / 1000,
    month: String(data.month ?? ''),
  };
}

export function AiCreditsProvider({ children }: { children: React.ReactNode }) {
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
      const data = (await res.json()) as Record<string, unknown>;
      const balance = parseCreditsBalance(data);
      setUsed(balance.used);
      setLimit(balance.limit);
      setRemaining(balance.remaining);
      setMonth(balance.month);
    } catch {
      setError('Impossible de charger les crédits IA');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ used, limit, remaining, month, loading, error, refresh }),
    [used, limit, remaining, month, loading, error, refresh],
  );

  return <AiCreditsContext.Provider value={value}>{children}</AiCreditsContext.Provider>;
}

export function useAiCreditsContext(): AiCreditsBalance {
  const ctx = useContext(AiCreditsContext);
  if (!ctx) {
    throw new Error('useAiCreditsContext must be used within AiCreditsProvider');
  }
  return ctx;
}
