import { CSS_PX_PER_MM, paperViewportCssPixels } from './paperDimensions';
import { resolvedPdfContentPaddingCss } from './pdfContentPadding';

export { CSS_PX_PER_MM };

/** Parse vertical padding (top+bottom) from a CSS padding shorthand for `.content`. */
export function parseVerticalPaddingPx(paddingCss: string): number {
  const t = paddingCss.trim().toLowerCase();
  if (!t || t === '0' || t === 'none') return 0;

  const toPx = (token: string): number => {
    const m = token.match(/^([\d.]+)(px|rem|mm|cm|%)?$/);
    if (!m) return 0;
    const n = parseFloat(m[1]);
    const unit = m[2] || 'px';
    switch (unit) {
      case 'rem':
        return n * 16;
      case 'mm':
        return n * CSS_PX_PER_MM;
      case 'cm':
        return n * CSS_PX_PER_MM * 10;
      case '%':
        return 0;
      default:
        return n;
    }
  };

  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const v = toPx(parts[0]);
    return v * 2;
  }
  if (parts.length === 2) {
    return toPx(parts[0]) + toPx(parts[1]);
  }
  if (parts.length === 3) {
    return toPx(parts[0]) + toPx(parts[2]);
  }
  if (parts.length >= 4) {
    return toPx(parts[0]) + toPx(parts[2]);
  }
  return 0;
}

/** Hauteur utile du contenu par page (px CSS), alignée export @page margin 0 + padding `.content`. */
export function getContentAreaHeightPx(
  paperSize: string,
  isLandscape: boolean,
  pdfContentPadding?: string,
): number {
  const { height } = paperViewportCssPixels(paperSize, isLandscape);
  const padCss = resolvedPdfContentPaddingCss(pdfContentPadding);
  const verticalPad = parseVerticalPaddingPx(padCss);
  return Math.max(1, height - verticalPad);
}

export function getContentAreaWidthPx(paperSize: string, isLandscape: boolean): number {
  return paperViewportCssPixels(paperSize, isLandscape).width;
}

/** CSS print partagé preview + export + générateur Go. */
export const PDF_PRINT_BREAK_CSS = `
  .pdf-page-break-before {
    break-before: page;
    page-break-before: always;
  }
  .pdf-avoid-break-inside {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  table,
  .pdf-keep-together,
  canvas[data-chart-type] {
    break-inside: avoid;
    page-break-inside: avoid;
  }
`;

/** Évite les pages fantômes (min-h-screen, body 100vh) à l’export Puppeteer. */
export const PDF_EXPORT_RESET_CSS = `
  html, body {
    min-height: auto !important;
    height: auto !important;
  }
  .content {
    min-height: auto !important;
    height: auto !important;
  }
  .page-break {
    display: none !important;
  }
  [class~="min-h-screen"],
  [class~="h-screen"] {
    min-height: auto !important;
    height: auto !important;
  }
`;
