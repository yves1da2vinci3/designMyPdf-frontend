import type { ProcessedImage } from '@/services/agent/types';
import { getOrientationFromDimensions, isLandscapeDimensions } from '@/utils/imageDimensions';

export function detectLandscapeFromImages(images: ProcessedImage[]): boolean {
  const withSize = images.filter((i) => i.width && i.height);
  if (withSize.length === 0) return false;
  const landscapeCount = withSize.filter((i) => isLandscapeDimensions(i.width!, i.height!)).length;
  return landscapeCount >= Math.ceil(withSize.length / 2);
}

/**
 * Checkbox coché → paysage forcé.
 * Sinon, si images → détection majorité.
 * Sinon portrait.
 */
export function resolveEffectiveLandscape(
  isLandscapeCheckbox: boolean,
  hasImages: boolean,
  detectedLandscape: boolean,
): boolean {
  if (isLandscapeCheckbox) return true;
  if (hasImages) return detectedLandscape;
  return false;
}

export function buildLayoutSummaryFromPlan(plan: {
  recommendedPageOrientation?: string;
  imageAnalysis?: { layout?: string; components?: string[] };
  sections?: { name: string; components: string[] }[];
}): string {
  const lines: string[] = [];
  const orient = plan.recommendedPageOrientation;
  if (orient === 'landscape') {
    lines.push('- **Orientation** : paysage (mise en page horizontale)');
  } else if (orient === 'portrait') {
    lines.push('- **Orientation** : portrait');
  }
  if (plan.imageAnalysis?.layout) {
    lines.push(`- **Structure** : ${plan.imageAnalysis.layout}`);
  }
  for (const section of plan.sections || []) {
    lines.push(`- **${section.name}** : ${section.components.slice(0, 6).join(', ')}`);
  }
  return lines.length > 0 ? lines.join('\n') : '- Mise en page générée à partir de votre demande.';
}
