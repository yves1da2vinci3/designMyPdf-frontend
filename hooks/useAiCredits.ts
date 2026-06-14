import { useAiCreditsContext, type AiCreditsBalance } from '@/contexts/AiCreditsContext';

export type UseAiCreditsResult = AiCreditsBalance;

export function useAiCredits(): UseAiCreditsResult {
  return useAiCreditsContext();
}
