import React, { useEffect, useState } from 'react';
import { Box, Text } from '@mantine/core';
import Handlebars from 'handlebars';
import '@/utils/handlebarsHelpers';
import { processChartData, replaceChartDataPlaceholders } from '@/utils/chartUtils';

interface PreviewProps {
  format?: string;
  htmlContent: string;
  data: any;
  fonts?: string[];
  isLandscape?: boolean;
}

function Preview({
  format = 'a4',
  htmlContent,
  data,
  fonts = [],
  isLandscape = false,
}: PreviewProps) {
  const [pageCount, setPageCount] = useState(1);
  const [iframeContent, setIframeContent] = useState('');

  // Define paper dimensions in mm
  const formatToSize = {
    a1: { width: 841, height: 1189 },
    a2: { width: 594, height: 841 },
    a3: { width: 420, height: 594 },
    a4: { width: 210, height: 297 },
    a5: { width: 148, height: 210 },
    a6: { width: 105, height: 148 },
  };

  // Get dimensions for the selected format
  const paperSize = (() => {
    const selectedSize = formatToSize[format as keyof typeof formatToSize] || formatToSize.a4;
    return isLandscape ? { width: selectedSize.height, height: selectedSize.width } : selectedSize;
  })();

  useEffect(() => {
    let bodyHtml = htmlContent;
    try {
      const processed = processChartData(htmlContent);
      const compiled = Handlebars.compile(processed);
      bodyHtml = replaceChartDataPlaceholders(compiled(data || {}), data || {});
    } catch {
      bodyHtml = htmlContent;
    }

    const fontLinks = fonts
      .map(
        (font) =>
          `<link href="https://fonts.googleapis.com/css2?family=${font.replace(
            / /g,
            '+',
          )}&display=swap" rel="stylesheet">`,
      )
      .join('');

    // The main script to be executed inside the iframe
    const mainScript = `
      document.addEventListener('DOMContentLoaded', function() {
        // Initialize charts
        function initCharts() {
          document.querySelectorAll('canvas[data-chart-type]').forEach(canvas => {
            const type = canvas.getAttribute('data-chart-type');
            const dataStr = canvas.getAttribute('data-chart-data');
            if (type && dataStr) {
              try {
                const chartData = JSON.parse(dataStr);
                new Chart(canvas, {
                  type,
                  data: chartData,
                  options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    animation: false,
                  }
                });
              } catch (e) {
                console.error('Failed to initialize chart:', e);
              }
            }
          });
        }

        // Process content into pages based on page-break markers
        function processPageBreaks() {
          const container = document.getElementById('page-container');
          if (!container) return;

          const originalContent = container.innerHTML;
          const parts = originalContent.split(/<div class="page-break"[^>]*>\\s*<\\/div>|<hr class="page-break"[^>]*>/i);

          if (parts.length > 1) {
            container.innerHTML = ''; // Clear container

            parts.forEach((part, index) => {
              const page = document.createElement('div');
              page.className = 'page';

              const pageContent = document.createElement('div');
              pageContent.className = 'page-content';
              pageContent.innerHTML = part;
              page.appendChild(pageContent);

              const pageNumber = document.createElement('div');
              pageNumber.className = 'page-number';
              pageNumber.textContent = 'Page ' + (index + 1);
              page.appendChild(pageNumber);

              container.appendChild(page);

              if (index < parts.length - 1) {
                const indicator = document.createElement('div');
                indicator.className = 'page-break-indicator';

                const label = document.createElement('div');
                label.className = 'page-break-label';
                label.textContent = 'PAGE BREAK';
                indicator.appendChild(label);

                container.appendChild(indicator);
              }
            });

            window.parent.postMessage({ type: 'pageCount', count: parts.length }, '*');
          } else {
            container.innerHTML = '';
            const page = document.createElement('div');
            page.className = 'page';

            const pageContent = document.createElement('div');
            pageContent.className = 'page-content';
            pageContent.innerHTML = originalContent;
            page.appendChild(pageContent);

            const pageNumber = document.createElement('div');
            pageNumber.className = 'page-number';
            pageNumber.textContent = 'Page 1';
            page.appendChild(pageNumber);

            container.appendChild(page);

            window.parent.postMessage({ type: 'pageCount', count: 1 }, '*');
          }
        }

        processPageBreaks();
        initCharts();
      });
    `;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${fontLinks}
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            @page {
              size: ${format} ${isLandscape ? 'landscape' : 'portrait'};
              margin: 0;
            }
            body {
              margin: 0;
              font-family: ${fonts[0] || 'system-ui'}, sans-serif;
              background-color: #f0f0f0;
              padding: 20px;
            }
            .page {
              width: ${paperSize.width}mm;
              min-height: ${paperSize.height}mm;
              margin: 10px auto;
              background-color: white;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              position: relative;
              display: flex;
              flex-direction: column;
              box-sizing: border-box;
              page-break-after: always;
            }
            .page-content {
              padding: 10mm;
              flex: 1;
            }
            .page-number {
              position: absolute;
              bottom: 5mm;
              right: 5mm;
              font-size: 8pt;
              color: #888;
              z-index: 1000;
            }
            .page-break {
              display: none;
            }
            .page-break-indicator {
              width: 100%;
              height: 4px;
              background-color: #FF0000;
              margin: 10px 0;
              position: relative;
            }
            .page-break-label {
              position: absolute;
              top: -10px;
              right: 0;
              background-color: #FF0000;
              color: white;
              padding: 2px 6px;
              font-size: 8px;
              border-radius: 2px;
            }
            .page-container {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
          </style>
        </head>
        <body>
          <div class="page-container" id="page-container">
            ${bodyHtml}
          </div>
          <script>${mainScript}</script>
        </body>
      </html>
    `;
    setIframeContent(content);
  }, [htmlContent, data, fonts, format, isLandscape, paperSize.width, paperSize.height]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'pageCount') {
        setPageCount(event.data.count);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <>
      <Box
        component="iframe"
        srcDoc={iframeContent}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#f0f0f0',
        }}
        title="Template Preview"
        sandbox="allow-scripts allow-same-origin"
      />
      {pageCount > 1 && (
        <Text
          size="xs"
          color="dimmed"
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
        >
          {pageCount} pages
        </Text>
      )}
    </>
  );
}

export default Preview;
