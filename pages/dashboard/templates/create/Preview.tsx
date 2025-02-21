import React, { useEffect, useState, useRef } from 'react';
import Handlebars from 'handlebars';

export type FormatType = 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6';

interface PreviewProps {
  htmlContent: string;
  format?: FormatType;
  data?: Record<string, any>;
  fonts: string[];
  isLandscape?: boolean;
  setTemplateContent?: (string: string) => void;
}

const importFontCreation = (fonts: string[]) => {
  try {
    const encodedFont = encodeURIComponent(fonts[0]);
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@100;200;300;400;500;600;700;800;900${fonts
      .slice(1)
      .map((font) => `&display=swap&family=${encodeURIComponent(font)}`)}`;
    return `<link key="font-import" rel="stylesheet" href="${fontUrl}" />`;
  } catch (error) {
    console.error('Error generating font import:', error);
    return '';
  }
};

const fontCssCreation = (fonts: string[]) => {
  return `
    body {
      font-family: '${fonts[0]}', sans-serif;
    }
  `;
};

const Preview: React.FC<PreviewProps> = ({
  htmlContent,
  format = 'a4',
  data = {},
  fonts,
  isLandscape = false,
  setTemplateContent,
}) => {
  const [renderedContent, setRenderedContent] = useState('');
  const [fontImport, setFontImport] = useState<string>('');
  const [fontStyle, setFontStyle] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  const formatToSize = {
    a1: { width: 841, height: 1189 },
    a2: { width: 594, height: 841 },
    a3: { width: 420, height: 594 },
    a4: { width: 210, height: 297 },
    a5: { width: 148, height: 210 },
    a6: { width: 105, height: 148 },
  };

  useEffect(() => {
    setFontImport(importFontCreation(fonts));
    setFontStyle(fontCssCreation(fonts));
  }, [fonts]);

  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const link = document.createElement('link');
      link.id = 'tailwind-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
      document.head.appendChild(link);
    }

    try {
      const template = Handlebars.compile(htmlContent);
      const rendered = template(data);

      // Create the preview content with rendered variables and Chart.js
      const previewContent = `<!doctype html>
      <html>
      <head>
          <title>Preview</title>
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
            }
            .content {
              width: 100%;
              height: auto;
              min-height: 100vh;
              padding: 2rem;
            }
            canvas {
              max-width: 100%;
              margin: 0 auto;
            }
          </style>
      </head>
      <body>
        <div class="content">${rendered}</div>
        <script>
          // Wait for both DOM and Chart.js to be ready
          window.onload = function() {
            if (typeof Chart === 'undefined') {
              console.error('Chart.js not loaded');
              return;
            }

            const chartElements = document.querySelectorAll('canvas[data-chart-type]');
            chartElements.forEach(element => {
              try {
                const type = element.getAttribute('data-chart-type');
                const rawData = element.getAttribute('data-chart-data');
                
                if (!type || !rawData) {
                  console.error('Missing chart type or data attributes');
                  return;
                }

                let data;
                try {
                  data = JSON.parse(rawData);
                } catch (e) {
                  console.error('Invalid chart data JSON:', e);
                  return;
                }

                // Default options for all charts
                const defaultOptions = {
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        padding: 20,
                        font: {
                          size: 12,
                          family: "'${fonts[0]}', sans-serif"
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      titleFont: {
                        size: 14,
                        family: "'${fonts[0]}', sans-serif"
                      },
                      bodyFont: {
                        size: 12,
                        family: "'${fonts[0]}', sans-serif"
                      }
                    }
                  }
                };

                // Create and render the chart
                const chart = new Chart(element, {
                  type,
                  data,
                  options: defaultOptions
                });

                // Store chart instance for cleanup
                element.chart = chart;
              } catch (error) {
                console.error('Error initializing chart:', error);
                const ctx = element.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = '#FF4444';
                  ctx.font = '14px Arial';
                  ctx.fillText('Error loading chart', 10, 30);
                }
              }
            });
          };

          // Cleanup old charts before reinitializing
          document.addEventListener('beforeunload', function() {
            const chartElements = document.querySelectorAll('canvas[data-chart-type]');
            chartElements.forEach(element => {
              if (element.chart) {
                element.chart.destroy();
              }
            });
          });
        </script>
      </body>
      </html>`;

      // Store the template content for download
      const templateContent = `<!doctype html>
      <html>
      <head>
          <title>Preview</title>
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
            }
            .content {
              width: 100%;
              height: auto;
              min-height: 100vh;
              padding: 2rem;
            }
            canvas {
              max-width: 100%;
              margin: 0 auto;
            }
          </style>
      </head>
      <body>
        <div class="content">${htmlContent}</div>
        <script>
          // Wait for both DOM and Chart.js to be ready
          window.onload = function() {
            if (typeof Chart === 'undefined') {
              console.error('Chart.js not loaded');
              return;
            }

            const chartElements = document.querySelectorAll('canvas[data-chart-type]');
            chartElements.forEach(element => {
              try {
                const type = element.getAttribute('data-chart-type');
                const rawData = element.getAttribute('data-chart-data');
                
                if (!type || !rawData) {
                  console.error('Missing chart type or data attributes');
                  return;
                }

                let data;
                try {
                  data = JSON.parse(rawData);
                } catch (e) {
                  console.error('Invalid chart data JSON:', e);
                  return;
                }

                // Default options for all charts
                const defaultOptions = {
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        padding: 20,
                        font: {
                          size: 12,
                          family: "'${fonts[0]}', sans-serif"
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      titleFont: {
                        size: 14,
                        family: "'${fonts[0]}', sans-serif"
                      },
                      bodyFont: {
                        size: 12,
                        family: "'${fonts[0]}', sans-serif"
                      }
                    }
                  }
                };

                // Create and render the chart
                const chart = new Chart(element, {
                  type,
                  data,
                  options: defaultOptions
                });

                // Store chart instance for cleanup
                element.chart = chart;
              } catch (error) {
                console.error('Error initializing chart:', error);
                const ctx = element.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = '#FF4444';
                  ctx.font = '14px Arial';
                  ctx.fillText('Error loading chart', 10, 30);
                }
              }
            });
          };

          // Cleanup old charts before reinitializing
          document.addEventListener('beforeunload', function() {
            const chartElements = document.querySelectorAll('canvas[data-chart-type]');
            chartElements.forEach(element => {
              if (element.chart) {
                element.chart.destroy();
              }
            });
          });
        </script>
      </body>
      </html>`;

      if (setTemplateContent) {
        setTemplateContent(templateContent);
      }

      setRenderedContent(previewContent);

      // Force iframe refresh
      if (iframeRef.current) {
        const iframe = iframeRef.current;
        iframe.srcdoc = previewContent;
      }
    } catch (error: any) {
      console.error('Error rendering Handlebars template:', error);
      // Show error in preview
      setRenderedContent(`
        <html>
          <body style="color: red; padding: 1rem;">
            Error rendering template: ${error.message}
          </body>
        </html>
      `);
    }
  }, [htmlContent, data, fontImport, fontStyle]);

  const getSize = () => {
    const selectedSize = formatToSize[format];
    if (isLandscape) {
      return { width: selectedSize.height, height: selectedSize.width };
    }
    return selectedSize;
  };

  const a4AspectRatio = getSize().height / getSize().width;

  useEffect(() => {
    const updatePaperSize = () => {
      if (containerRef.current && paperRef.current) {
        const containerWidth = containerRef.current.clientWidth * 0.8;
        const containerHeight = containerRef.current.clientHeight * 0.8;

        let paperWidth = containerWidth;
        let paperHeight = containerWidth * a4AspectRatio;

        if (paperHeight > containerHeight) {
          paperHeight = containerHeight;
          paperWidth = containerHeight / a4AspectRatio;
        }

        paperRef.current.style.width = `${paperWidth}px`;
        paperRef.current.style.height = `${paperHeight}px`;

        const scale = paperWidth / (getSize().width * (96 / 25.4));
        if (iframeRef.current) {
          iframeRef.current.style.transform = `scale(${scale})`;
          iframeRef.current.style.transformOrigin = 'top left';
        }
      }
    };

    updatePaperSize();
    window.addEventListener('resize', updatePaperSize);

    return () => window.removeEventListener('resize', updatePaperSize);
  }, [a4AspectRatio]);

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col items-center justify-center overflow-visible">
      <div ref={paperRef} className="shadow-lg bg-white rounded overflow-visible relative">
        <iframe
          ref={iframeRef}
          title="Preview"
          srcDoc={renderedContent}
          style={{
            width: `${getSize().width}mm`,
            height: `${getSize().height}mm`,
            border: 'none',
          }}
          sandbox="allow-popups-to-escape-sandbox allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-modals"
        />
      </div>
    </div>
  );
};

export default Preview;
