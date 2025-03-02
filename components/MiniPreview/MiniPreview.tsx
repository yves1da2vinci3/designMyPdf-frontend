import React, { useEffect, useState } from 'react';
import Handlebars from 'handlebars';

interface MiniPreviewProps {
  htmlContent: string;
  data: any;
  fonts: string[];
}

function MiniPreview({ htmlContent, data, fonts }: MiniPreviewProps) {
  const [renderedContent, setRenderedContent] = useState('');
  const [fontImport, setFontImport] = useState('');
  const [fontStyle, setFontStyle] = useState('');

  // Local utility functions
  function createFontImport(fontList: string[]): string {
    if (fontList.length === 0) return '';
    try {
      const encodedFont = encodeURIComponent(fontList[0]);
      const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@100;200;300;400;500;600;700;800;900${fontList
        .slice(1)
        .map((font) => `&display=swap&family=${encodeURIComponent(font)}`)
        .join('')}`;
      return `<link rel="stylesheet" href="${fontUrl}" />`;
    } catch {
      return '';
    }
  }

  function createFontStyle(fontList: string[]): string {
    if (fontList.length === 0) return '';
    return `
      body {
        font-family: '${fontList[0]}', sans-serif;
      }
    `;
  }

  useEffect(() => {
    setFontImport(createFontImport(fonts));
    setFontStyle(createFontStyle(fonts));
  }, [fonts]);

  useEffect(() => {
    try {
      // Compile the Handlebars template with provided data
      const template = Handlebars.compile(htmlContent);
      const rendered = template(data);

      // Chart initialization script
      const chartScript = `
        (function() {
          function initializeCharts() {
            if (!window.Chart) {
              // Chart.js library not loaded
              return;
            }
            var chartElements = document.querySelectorAll('canvas[data-chart-type]');
            chartElements.forEach(function(element) {
              try {
                var type = element.getAttribute('data-chart-type');
                var rawData = element.getAttribute('data-chart-data');
                
                if (!type || !rawData) {
                  // Missing required chart attributes
                  return;
                }

                var chartData;
                try {
                  // The data is already JSON stringified in the attribute
                  chartData = JSON.parse(rawData);
                } catch (e) {
                  // Invalid chart data format
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

                // Create and render the chart
                var chartInstance = new Chart(element, {
                  type: type,
                  data: chartData,
                  options: defaultOptions
                });

                // Store chart instance for cleanup
                element.chart = chartInstance;
              } catch (error) {
                console.error('Error initializing chart:', error);
              }
            });
          }

          // Initialize charts when DOM is ready
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeCharts);
          } else {
            initializeCharts();
          }

          // Cleanup charts before unloading
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
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              width: 100%;
              background-color: white;
            }
            .content {
              width: 100%;
              align-self: flex-start;
              height: 100%;
              padding: 1rem;
            }
            canvas {
              max-width: 100%;
              margin: 0 auto;
            }
          </style>
        </head>
        <body class="overflow-x-hidden overflow-y-auto">
          <div class="content">${rendered}</div>
          <script>
            ${chartScript}
          </script>
        </body>
        </html>`;
      setRenderedContent(fullContent);
    } catch (error: any) {
      // Provide error feedback in the preview
      setRenderedContent(`
        <html>
          <body style="color: red; padding: 1rem; font-family: sans-serif; font-size: 12px;">
            Error rendering template: ${error.message || 'Unknown error'}
          </body>
        </html>
      `);
      console.error('Error rendering mini preview:', error);
    }
  }, [htmlContent, data, fontImport, fontStyle]);

  return (
    <div style={{ width: '100%', height: '100px', overflow: 'hidden', position: 'relative', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <iframe
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
