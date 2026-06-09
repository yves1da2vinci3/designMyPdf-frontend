import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import { ExportTemplateDto, templateApi } from '@/api/templateApi';
import { CHART_DATA_VALIDATION_SCRIPT_SNIPPET } from '@/utils/chartUtils';
import { sanitizePdfBackgroundColor } from '@/utils/sanitizePdfBackgroundColor';
import { paperViewportCssPixels } from '@/utils/paperDimensions';
import { isPdfContentPaddingValid, resolvedPdfContentPaddingCss } from '@/utils/pdfContentPadding';
import {
  PDF_EXPORT_RESET_CSS,
  PDF_PRINT_BREAK_CSS,
  getContentAreaHeightPx,
  getContentAreaWidthPx,
} from '@/utils/pdfPageLayout';
import { ORPHAN_THRESHOLD, pageBreakHintsEvaluate } from '@/utils/pdfPagination';
import {
  CODE_HIGHLIGHT_FIT_BODY_CLASS,
  codeHighlightFitCss,
  codeHighlightHeadTags,
  codeHighlightPdfAwaitScript,
} from '@/utils/codeHighlightShell';

function buildExportPageHtml(
  bodyInner: string,
  data: ExportTemplateDto,
  sampleText: string,
): string {
  const fontLinks = data.fonts
    .map((font) => {
      const family = font.replace(/ /g, '+');
      const suffix = sampleText
        ? `&display=swap&text=${encodeURIComponent(sampleText)}`
        : '&display=swap';
      return `<link href="https://fonts.googleapis.com/css2?family=${family}:wght@100;200;300;400;500;600;700;800;900${suffix}" rel="stylesheet">`;
    })
    .join('');

  const pageBg = sanitizePdfBackgroundColor(data.pdf_background_color);
  const contentPad = resolvedPdfContentPaddingCss(data.pdf_content_padding);
  const contentWidth = getContentAreaWidthPx(data.paperSize, data.isLandscape);

  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${fontLinks}
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
          ${codeHighlightHeadTags()}
          <style>
            ${codeHighlightFitCss()}
            @page {
              size: ${data.paperSize} ${data.isLandscape ? 'landscape' : 'portrait'};
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              font-family: ${data.fonts[0] || 'system-ui'}, sans-serif;
              background: ${pageBg};
              min-height: auto;
              height: auto;
            }
            .content {
              padding: ${contentPad};
              box-sizing: border-box;
              width: ${contentWidth}px;
              min-height: auto;
              height: auto;
              background: ${pageBg};
            }
            ${PDF_EXPORT_RESET_CSS}
            img {
              max-width: 100%;
              height: auto;
            }
            canvas {
              max-width: 100%;
              margin: 0 auto;
            }
            ${PDF_PRINT_BREAK_CSS}
          </style>
        </head>
        <body class="${CODE_HIGHLIGHT_FIT_BODY_CLASS}">
          <div class="content">
            ${bodyInner}
          </div>
          <script>
            ${CHART_DATA_VALIDATION_SCRIPT_SNIPPET}
            (function() {
              function waitForTailwind() {
                return new Promise(function(resolve) {
                  function check() {
                    var testDiv = document.createElement('div');
                    testDiv.className = 'bg-blue-500';
                    document.body.appendChild(testDiv);
                    var ok = window.getComputedStyle(testDiv).backgroundColor !== 'rgba(0, 0, 0, 0)';
                    document.body.removeChild(testDiv);
                    if (ok) resolve();
                    else setTimeout(check, 100);
                  }
                  check();
                });
              }
              function toChartJsType(raw) {
                var t = String(raw == null ? '' : raw).trim();
                var k = t.toLowerCase();
                if (k === 'polararea') return 'polarArea';
                return k;
              }
              async function initCharts() {
                await Promise.race([
                  waitForTailwind(),
                  new Promise(function(r) { setTimeout(r, 2000); }),
                ]);
                await ${codeHighlightPdfAwaitScript().trim()};
                if (document.fonts && document.fonts.ready) {
                  await document.fonts.ready;
                }
                if (!window.Chart) {
                  await new Promise(function(r) { setTimeout(r, 400); });
                }
                document.querySelectorAll('canvas[data-chart-type]').forEach(function(canvas) {
                  try {
                    var typeRaw = canvas.getAttribute('data-chart-type');
                    var raw = canvas.getAttribute('data-chart-data');
                    if (!typeRaw || !raw) return;
                    var type = toChartJsType(typeRaw);
                    var chartData = JSON.parse(raw);
                    if (!isChartDataValidForType(chartData, typeRaw)) return;
                    new Chart(canvas, {
                      type: type,
                      data: chartData,
                      options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        animation: false,
                        devicePixelRatio: 1,
                      }
                    });
                  } catch (e) {
                    console.error(e);
                  }
                });
                await new Promise(function(r) { setTimeout(r, 500); });
              }
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initCharts);
              } else {
                initCharts();
              }
            })();
          </script>
        </body>
      </html>
    `;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const data: ExportTemplateDto = req.body;

    if (!isPdfContentPaddingValid(data.pdf_content_padding)) {
      return res.status(400).json({ message: 'Invalid pdf_content_padding' });
    }

    const useRendered =
      typeof data.renderedHtml === 'string' && data.renderedHtml.trim().length > 0;

    let templateContent = '';
    let sampleText = '';

    if (useRendered) {
      templateContent = data.renderedHtml!.trim();
      sampleText = templateContent.replace(/<[^>]+>/g, '').slice(0, 200);
    } else {
      const template = await templateApi.getTemplateById(id as string);
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      templateContent = template.content || '';
      sampleText = templateContent.substring(0, 100);
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });
    try {
      const page = await browser.newPage();

      const htmlContent = buildExportPageHtml(templateContent, data, sampleText);

      await page.setContent(htmlContent, { waitUntil: 'load', timeout: 45_000 });

      const { width, height } = paperViewportCssPixels(data.paperSize, data.isLandscape);

      await page.setViewport({ width, height, deviceScaleFactor: 1 });

      const hasCharts = /<canvas[^>]*data-chart-type/i.test(templateContent);
      const postRenderMs = hasCharts ? 4000 : useRendered ? 2000 : 400;
      await new Promise((r) => setTimeout(r, postRenderMs));

      const contentAreaHeight = getContentAreaHeightPx(
        data.paperSize,
        data.isLandscape,
        data.pdf_content_padding,
      );

      // Editor sends pre-hinted HTML — trust it (WYSIWYG). Raw template: one Puppeteer pass.
      if (!useRendered) {
        await page.evaluate(pageBreakHintsEvaluate, {
          cah: contentAreaHeight,
          threshold: contentAreaHeight * ORPHAN_THRESHOLD,
          resetExisting: true,
        });
      }

      let output: Buffer | Uint8Array;
      if (data.format === 'pdf') {
        output = await page.pdf({
          format: data.paperSize as 'a4' | 'a3' | 'a2' | 'a1' | 'a5' | 'a6',
          landscape: data.isLandscape,
          printBackground: true,
          preferCSSPageSize: true,
          margin: { top: '0', right: '0', bottom: '0', left: '0' },
          scale: 1,
          omitBackground: false,
        });
      } else if (data.format === 'png' || data.format === 'jpg') {
        const format = data.format === 'jpg' ? 'jpeg' : data.format;
        output = await page.screenshot({
          type: format,
          fullPage: true,
          quality: data.format === 'jpg' ? 92 : undefined,
          omitBackground: false,
        });
      } else {
        return res.status(400).json({ message: 'Invalid export format' });
      }

      const contentType =
        data.format === 'pdf'
          ? 'application/pdf'
          : data.format === 'png'
            ? 'image/png'
            : 'image/jpeg';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename=template.${data.format}`);

      res.status(200).send(Buffer.from(output));
    } finally {
      await browser.close().catch(() => undefined);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error exporting template', error: String(error) });
  }
}
