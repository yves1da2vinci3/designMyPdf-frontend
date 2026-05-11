import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import { ExportTemplateDto, templateApi } from '@/api/templateApi';
import { CHART_DATA_VALIDATION_SCRIPT_SNIPPET } from '@/utils/chartUtils';

function buildExportPageHtml(bodyInner: string, data: ExportTemplateDto, sampleText: string): string {
  const fontLinks = data.fonts
    .map((font) => {
      const family = font.replace(/ /g, '+');
      const suffix = sampleText
        ? `&display=swap&text=${encodeURIComponent(sampleText)}`
        : '&display=swap';
      return `<link href="https://fonts.googleapis.com/css2?family=${family}:wght@100;200;300;400;500;600;700;800;900${suffix}" rel="stylesheet">`;
    })
    .join('');

  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${fontLinks}
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
          <style>
            @page {
              size: ${data.paperSize} ${data.isLandscape ? 'landscape' : 'portrait'};
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              font-family: ${data.fonts[0] || 'system-ui'}, sans-serif;
            }
            .content {
              padding: 2rem;
              box-sizing: border-box;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            canvas {
              max-width: 100%;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
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
              async function initCharts() {
                await waitForTailwind();
                if (document.fonts && document.fonts.ready) {
                  await document.fonts.ready;
                }
                if (!window.Chart) {
                  await new Promise(function(r) { setTimeout(r, 400); });
                }
                document.querySelectorAll('canvas[data-chart-type]').forEach(function(canvas) {
                  try {
                    var type = canvas.getAttribute('data-chart-type');
                    var raw = canvas.getAttribute('data-chart-data');
                    if (!type || !raw) return;
                    var chartData = JSON.parse(raw);
                    if (!isChartDataValidForType(chartData, type)) return;
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
    });
    try {
      const page = await browser.newPage();

      const htmlContent = buildExportPageHtml(templateContent, data, sampleText);

      await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 45_000 });

      const paperSizes = {
        a1: { width: 1684, height: 2384 },
        a2: { width: 1191, height: 1684 },
        a3: { width: 842, height: 1191 },
        a4: { width: 595, height: 842 },
        a5: { width: 420, height: 595 },
        a6: { width: 298, height: 420 },
      };

      const paperSize = paperSizes[data.paperSize as keyof typeof paperSizes] || paperSizes.a4;
      const { width, height } = data.isLandscape
        ? { width: paperSize.height, height: paperSize.width }
        : paperSize;

      await page.setViewport({ width, height, deviceScaleFactor: useRendered ? 2 : 1 });

      const hasCharts = /<canvas[^>]*data-chart-type/i.test(templateContent);
      const postRenderMs = hasCharts ? 2200 : useRendered ? 1200 : 400;
      await new Promise((r) => setTimeout(r, postRenderMs));

      let output: Buffer | Uint8Array;
      if (data.format === 'pdf') {
        output = await page.pdf({
          format: data.paperSize as 'a4' | 'a3' | 'a2' | 'a1' | 'a5' | 'a6',
          landscape: data.isLandscape,
          printBackground: true,
          preferCSSPageSize: true,
          margin: { top: '0', right: '0', bottom: '0', left: '0' },
          scale: useRendered ? 1 : 0.95,
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

