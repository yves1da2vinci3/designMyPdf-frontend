import { getContentAreaWidthPx } from '@/utils/pdfPageLayout';

export function buildPageContextPrompt(
  format: string,
  isLandscape: boolean,
  pdfContentPadding?: string,
): string {
  const paper = (format || 'a4').toUpperCase();
  const orientation = isLandscape ? 'landscape' : 'portrait';
  const contentWidthPx = getContentAreaWidthPx(format || 'a4', isLandscape);
  const padNote = pdfContentPadding?.trim()
    ? ` Content padding (applied by preview scaffold): ${pdfContentPadding}.`
    : '';

  const layoutRules = isLandscape
    ? `
LANDSCAPE LAYOUT (MANDATORY):
- Design for a WIDE page (~${contentWidthPx}px content width), not a tall mobile column.
- Prefer 2-column grids (grid grid-cols-2), side-by-side header zones (logo left, hero image right).
- Use max-w-6xl mx-auto on the root inner structure; tables and bands should span full width (w-full).
- Structure like a poster: header row, central band, bottom row, footer — match reference image zones.
- Avoid single narrow centered column that wastes horizontal space.`
    : `
PORTRAIT LAYOUT:
- Design for vertical A-series page (~${contentWidthPx}px content width).
- Stack sections vertically with space-y-4 / space-y-6; max-w-5xl mx-auto.`;

  return `
TARGET PDF PAGE:
- Paper: ${paper}, orientation: ${orientation}.
- Compose HTML for this fixed print viewport (~${contentWidthPx}px wide). NOT an infinite scroll web page.
- Root wrapper MUST be p-0 (outer padding is added by the preview scaffold).${padNote}
${layoutRules}`;
}
