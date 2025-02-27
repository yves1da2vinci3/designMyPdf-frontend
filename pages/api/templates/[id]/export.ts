import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import { ExportTemplateDto, templateApi } from '@/api/templateApi';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const data: ExportTemplateDto = req.body;

    // Get the template
    const template = await templateApi.getTemplateById(id as string);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Launch a headless browser
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();

    // Generate HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${data.fonts
            .map(
              (font) =>
                `<link href="https://fonts.googleapis.com/css2?family=${font.replace(
                  / /g,
                  '+'
                )}&display=swap" rel="stylesheet">`
            )
            .join('')}
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            @page {
              size: ${data.paperSize} ${data.isLandscape ? 'landscape' : 'portrait'};
              margin: 0;
            }
            body {
              margin: 0;
              font-family: ${data.fonts[0] || 'system-ui'}, sans-serif;
            }
            .page {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
            }
          </style>
        </head>
        <body>
          <div class="page">
            ${template.content}
          </div>
          <script>
            // Initialize charts if any
            document.querySelectorAll('canvas[data-chart-type]').forEach(canvas => {
              const type = canvas.getAttribute('data-chart-type');
              const data = JSON.parse(canvas.getAttribute('data-chart-data'));
              new Chart(canvas, {
                type,
                data,
                options: {
                  responsive: true,
                  maintainAspectRatio: true,
                }
              });
            });
          </script>
        </body>
      </html>
    `;

    // Set content to the page
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Set viewport size based on paper size
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

    await page.setViewport({ width, height });

    // Generate output based on format
    let output;
    if (data.format === 'pdf') {
      output = await page.pdf({
        format: data.paperSize as any,
        landscape: data.isLandscape,
        printBackground: true,
      });
    } else if (data.format === 'png' || data.format === 'jpg') {
      const format = data.format === 'jpg' ? 'jpeg' : data.format;
      output = await page.screenshot({
        type: format,
        fullPage: true,
      });
    } else {
      await browser.close();
      return res.status(400).json({ message: 'Invalid export format' });
    }

    // Close the browser
    await browser.close();

    // Set appropriate headers
    const contentType =
      data.format === 'pdf' ? 'application/pdf' :
      data.format === 'png' ? 'image/png' : 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=template.${data.format}`);

    // Send the output
    res.send(output);
    return res.status(200).end();
  } catch (error) {
    console.error('Error exporting template:', error);
    return res.status(500).json({ message: 'Error exporting template', error: String(error) });
  }
} 