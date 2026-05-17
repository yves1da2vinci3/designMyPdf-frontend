import {
  getContentAreaHeightPx,
  getContentAreaWidthPx,
  PDF_PRINT_BREAK_CSS,
  PDF_EXPORT_RESET_CSS,
} from './pdfPageLayout';
import { resolvedPdfContentPaddingCss } from './pdfContentPadding';
import { sanitizePdfBackgroundColor } from '@/utils/sanitizePdfBackgroundColor';
import { applyPageBreakHintsToContainer } from './pdfPagination';

function waitForTailwind(doc: Document): Promise<void> {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      const testEl = doc.createElement('div');
      testEl.className = 'bg-blue-500';
      doc.body.appendChild(testEl);
      const ok = doc.defaultView?.getComputedStyle(testEl).backgroundColor !== 'rgba(0, 0, 0, 0)';
      testEl.remove();
      if (ok || Date.now() - start > 2500) resolve();
      else setTimeout(check, 80);
    };
    check();
  });
}

/**
 * Mesure le HTML rendu et applique fusion / sauts (règle 20 %).
 * Retourne le innerHTML de `.content` avec les hints injectés.
 */
export async function applyPdfPageBreakHints(
  bodyInnerHtml: string,
  options: {
    paperSize: string;
    isLandscape: boolean;
    pdfContentPadding?: string;
    pdfBackgroundColor?: string;
    fonts?: string[];
  },
): Promise<string> {
  if (typeof document === 'undefined' || !bodyInnerHtml.trim()) {
    return bodyInnerHtml;
  }

  const contentAreaHeight = getContentAreaHeightPx(
    options.paperSize,
    options.isLandscape,
    options.pdfContentPadding,
  );
  const viewportWidth = getContentAreaWidthPx(options.paperSize, options.isLandscape);
  const contentPad = resolvedPdfContentPaddingCss(options.pdfContentPadding);
  const pageBg = sanitizePdfBackgroundColor(options.pdfBackgroundColor);
  const primaryFont = options.fonts?.[0] || 'system-ui';

  const fontLinks = (options.fonts || [])
    .map((font) => {
      const family = font.replace(/ /g, '+');
      return `<link href="https://fonts.googleapis.com/css2?family=${family}:wght@400;700&display=swap" rel="stylesheet">`;
    })
    .join('');

  const iframe = document.createElement('iframe');
  iframe.style.cssText =
    'position:fixed;left:-9999px;top:0;visibility:hidden;border:none;pointer-events:none;';
  iframe.style.width = `${viewportWidth}px`;
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument;
    if (!doc) return bodyInnerHtml;

    const html = [
      '<!DOCTYPE html><html><head><meta charset="UTF-8">',
      fontLinks,
      '<script src="https://cdn.tailwindcss.com"></script>',
      '<style>',
      `html, body { margin: 0; padding: 0; background: ${pageBg}; font-family: '${primaryFont}', sans-serif; }`,
      `.content { padding: ${contentPad}; box-sizing: border-box; width: ${viewportWidth}px; }`,
      PDF_PRINT_BREAK_CSS,
      PDF_EXPORT_RESET_CSS,
      '</style></head><body>',
      '<div class="content">',
      bodyInnerHtml,
      '</div></body></html>',
    ].join('');

    doc.open();
    doc.write(html);
    doc.close();

    const contentEl = doc.querySelector('.content') as HTMLElement | null;
    if (!contentEl) return bodyInnerHtml;

    await waitForTailwind(doc);
    if (doc.fonts?.ready) {
      await doc.fonts.ready.catch(() => undefined);
    }
    await new Promise((r) => setTimeout(r, 300));

    applyPageBreakHintsToContainer(contentEl, contentAreaHeight);

    return contentEl.innerHTML;
  } finally {
    document.body.removeChild(iframe);
  }
}

/** Estime le nombre de pages après fusion (pour debug / futur alignement UI). */
export function estimatePdfPageCount(
  contentScrollHeight: number,
  contentAreaHeight: number,
): number {
  if (contentAreaHeight <= 0) return 1;
  return Math.max(1, Math.ceil(contentScrollHeight / contentAreaHeight));
}
