/** Seuils d'avertissement budget IA (% du plafond mensuel consommé). */
export const AI_CREDITS_WARNING_THRESHOLDS = [50, 75, 95] as const;

export type AiCreditsWarningTier = (typeof AI_CREDITS_WARNING_THRESHOLDS)[number];

export function getAiCreditsUsedPercent(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

/** Palier le plus élevé atteint, ou null si moins de 50 % utilisés. */
export function getAiCreditsWarningTier(usedPercent: number): AiCreditsWarningTier | null {
  if (usedPercent >= 95) return 95;
  if (usedPercent >= 75) return 75;
  if (usedPercent >= 50) return 50;
  return null;
}

export interface AiCreditsWarningBannerStyle {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  message: string;
}

export function getAiCreditsWarningBanner(tier: AiCreditsWarningTier): AiCreditsWarningBannerStyle {
  switch (tier) {
    case 50:
      return {
        backgroundColor: '#1a2332',
        borderColor: '#2d4a6f',
        textColor: 'blue.3',
        message: '50 % du budget IA mensuel utilisé.',
      };
    case 75:
      return {
        backgroundColor: '#2C2400',
        borderColor: '#4A3900',
        textColor: 'yellow.5',
        message: '75 % du budget IA mensuel utilisé.',
      };
    case 95:
      return {
        backgroundColor: '#3B1C1C',
        borderColor: '#6B2D2D',
        textColor: 'red.4',
        message: '95 % du budget IA mensuel utilisé — limite proche.',
      };
  }
}

/** Couleur badge / barre de progression selon le % consommé. */
export function getAiCreditsProgressColor(usedPercent: number): string {
  const tier = getAiCreditsWarningTier(usedPercent);
  if (tier === 95) return 'red';
  if (tier === 75) return 'orange';
  if (tier === 50) return 'yellow';
  return 'green';
}
