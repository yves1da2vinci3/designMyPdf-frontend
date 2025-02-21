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
    // Append Tailwind CSS if not already present in the parent document.
    if (!document.getElementById('tailwind-cdn')) {
      const link = document.createElement('link');
      link.id = 'tailwind-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
      document.head.appendChild(link);
    }

    try {
      // Compile the Handlebars template with provided data.
      const template = Handlebars.compile(htmlContent);
      const rendered = template(data);

      // Chart initialization script.
      const chartScript = `
        (function() {
          function initializeCharts() {
            if (typeof Chart === 'undefined') {
              console.error('Chart.js not loaded');
              return;
            }
            var chartElements = document.querySelectorAll('canvas[data-chart-type]');
            chartElements.forEach(function(element) {
              try {
                var type = element.getAttribute('data-chart-type');
                var rawData = element.getAttribute('data-chart-data');
                
                if (!type || !rawData) {
                  console.error('Missing chart type or data attributes');
                  return;
                }

                var chartData;
                try {
                  // The data is already JSON stringified in the attribute
                  chartData = JSON.parse(rawData);
                } catch (e) {
                  console.error('Invalid chart data JSON:', e);
                  return;
                }

                var defaultOptions = {
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

                // Add type-specific options
                if (type === 'line' || type === 'bar') {
                  defaultOptions.scales = {
                    y: {
                      beginAtZero: true,
                      grid: {
                        drawBorder: false
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  };
                }

                if (type === 'pie' || type === 'doughnut') {
                  defaultOptions.cutout = type === 'doughnut' ? '60%' : '0%';
                  defaultOptions.radius = '90%';
                }

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
                var ctx = element.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = '#FF4444';
                  ctx.font = '14px Arial';
                  ctx.fillText('Error loading chart: ' + error.message, 10, 30);
                }
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

      // Build the complete preview HTML.
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
    <div class="content">
      ${rendered}
    </div>
    <script>
      ${chartScript}
    </script>
  </body>
</html>`;

      // Build template content for download using the raw htmlContent.
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
    <div class="content">
      ${htmlContent}
    </div>
    <script>
      ${chartScript}
    </script>
  </body>
</html>`;

      // Pass the template content back if required.
      if (setTemplateContent) {
        setTemplateContent(templateContent);
      }

      setRenderedContent(previewContent);

      // Force iframe refresh.
      if (iframeRef.current) {
        iframeRef.current.srcdoc = previewContent;
      }
    } catch (error: any) {
      console.error('Error rendering Handlebars template:', error);
      setRenderedContent(`
<html>
  <body style="color: red; padding: 1rem;">
    Error rendering template: ${error.message}
  </body>
</html>
      `);
    }
  }, [htmlContent, data, fontImport, fontStyle, fonts, setTemplateContent]);

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
  }, [a4AspectRatio, getSize]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full flex flex-col items-center justify-center overflow-visible"
    >
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
