import { paperViewportCssPixels } from '@/utils/paperDimensions';
import { sanitizePdfBackgroundColor } from '@/utils/sanitizePdfBackgroundColor';
import { resolvedPdfContentPaddingCss } from '@/utils/pdfContentPadding';
import type { AgentGenerationOptions, UiAnalysis } from './types';

export function buildFidelityPreviewHtml(
  bodyInner: string,
  options: AgentGenerationOptions,
  analysis?: UiAnalysis,
): string {
  const format = (options.format || 'a4').toLowerCase();
  const isLandscape = options.isLandscape ?? false;
  const paper = paperViewportCssPixels(format, isLandscape);
  const viewport = analysis?.viewport_recommande;
  const width = viewport?.width ?? paper.width;
  const height = viewport?.height ?? paper.height;
  const contentPad = resolvedPdfContentPaddingCss(options.pdfContentPadding);
  const pageBg = sanitizePdfBackgroundColor('#FFFFFF');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: ${pageBg};
        width: ${width}px;
        min-height: ${height}px;
      }
      .fidelity-root {
        padding: ${contentPad};
        box-sizing: border-box;
        width: 100%;
        min-height: ${height}px;
        background: ${pageBg};
      }
      img { max-width: 100%; height: auto; }
    </style>
  </head>
  <body>
    <div class="fidelity-root">${bodyInner}</div>
    <script>if (typeof lucide !== 'undefined') lucide.createIcons();</script>
  </body>
</html>`;
}
