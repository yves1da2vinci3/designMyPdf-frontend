import React, { useEffect, useState } from 'react';
import Handlebars from 'handlebars';
import '../../utils/handlebarsHelpers';

interface MiniPreviewProps {
  htmlContent: string;
  data: any;
  fonts: string[];
}

function MiniPreview({ htmlContent, data, fonts }: MiniPreviewProps) {
  const [renderedContent, setRenderedContent] = useState('');
  const [fontImport, setFontImport] = useState('');
  const [fontStyle, setFontStyle] = useState('');
  const [iframeKey, setIframeKey] = useState(0);

  function createFontImport(fontList: string[]): string {
    if (!fontList || fontList.length === 0) return '';
    try {
      const encodedFont = encodeURIComponent(fontList[0]);
      const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@100;200;300;400;500;600;700;800;900${fontList
        .slice(1)
        .map((font) => `&display=swap&family=${encodeURIComponent(font)}`)
        .join('')}`;
      return `<link rel="stylesheet" href="${fontUrl}" />`;
    } catch (error) {
      return '';
    }
  }

  function createFontStyle(fontList: string[]): string {
    if (!fontList || fontList.length === 0) return '';
    return `
      body {
        font-family: '${fontList[0]}', sans-serif;
      }
    `;
  }

  useEffect(() => {
    if (fonts && fonts.length > 0) {
      setFontImport(createFontImport(fonts));
      setFontStyle(createFontStyle(fonts));
    }
  }, [fonts]);

  useEffect(() => {
    try {
      if (!htmlContent || htmlContent.trim() === '') {
        setRenderedContent(
          '<html><body style="padding: 1rem; color: #999;">No content</body></html>',
        );
        return;
      }

      const templateData = Array.isArray(data) ? {} : data || {};

      const template = Handlebars.compile(htmlContent);
      const rendered = template(templateData);

      setIframeKey((prev) => prev + 1);

      const chartScript = `
        (function() {
          function initializeCharts() {
            if (!window.Chart) {
              return;
            }
            var chartElements = document.querySelectorAll('canvas[data-chart-type]');
            chartElements.forEach(function(element) {
              try {
                var type = element.getAttribute('data-chart-type');
                var rawData = element.getAttribute('data-chart-data');
                
                if (!type || !rawData) {
                  return;
                }

                var chartData;
                try {
                  chartData = JSON.parse(rawData);
                } catch (e) {
                  return;
                }

                var defaultOptions = {
                  responsive: true,
                  maintainAspectRatio: true,
                  animation: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      enabled: false
                    }
                  }
                };

                var chartInstance = new Chart(element, {
                  type: type,
                  data: chartData,
                  options: defaultOptions
                });

                element.chart = chartInstance;
              } catch (error) {
              }
            });
          }

          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeCharts);
          } else {
            initializeCharts();
          }

          window.addEventListener('beforeunload', function() {
            var chartElements = document.querySelectorAll('canvas[data-chart-type]');
            chartElements.forEach(function(element) {
              if (element.chart) {
                element.chart.destroy();
              }
            });
          });
        })();
      `;

      const fullContent = `<!doctype html>
<html>
  <head>
    <title>Mini Preview</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
    ${fontImport}
    <style>
      ${fontStyle}
      body {
        margin: 0;
        padding: 0;
        min-height: 100vh;
        width: 100%;
        background: white;
        position: relative;
      }
      .content {
        width: 100%;
        height: auto;
        min-height: 100vh;
        padding: 2rem;
        position: relative;
      }
      canvas {
        max-width: 100%;
        margin: 0 auto;
      }
    </style>
  </head>
  <body>
    <div class="content">
      ${rendered}
    </div>
    <script>
      ${chartScript}
    </script>
  </body>
</html>`;
      setRenderedContent(fullContent);
    } catch (error: any) {
      setRenderedContent(`
        <html>
          <body style="color: red; padding: 1rem; font-family: sans-serif; font-size: 10px;">
            <strong>Error rendering template:</strong><br/>
            ${error.message || 'Unknown error'}
          </body>
        </html>
      `);
    }
  }, [htmlContent, data, fontImport, fontStyle]);

  return (
    <div
      style={{
        width: '100%',
        height: '100px',
        overflow: 'hidden',
        position: 'relative',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        backgroundColor: 'white',
      }}
    >
      <iframe
        key={iframeKey}
        title="mini-Preview"
        srcDoc={renderedContent}
        style={{
          transform: 'scale(0.25)',
          transformOrigin: 'top left',
          width: '400%',
          height: '400%',
          border: 'none',
        }}
        sandbox="allow-popups-to-escape-sandbox allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-modals"
      />
    </div>
  );
}

export default MiniPreview;
