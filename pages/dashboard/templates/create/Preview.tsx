import React, { useEffect, useState, useRef } from 'react';
import Handlebars from 'handlebars';

// Define the FormatType directly in this file
type FormatType = 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6';

interface PreviewProps {
  htmlContent: string;
  format?: FormatType;
  data?: Record<string, any>;
  fonts: string[];
  isLandscape?: boolean;
  setTemplateContent?: (string: string) => void;
}

function Preview({
  htmlContent,
  format = 'a4',
  data = {},
  fonts,
  isLandscape = false,
  setTemplateContent,
}: PreviewProps) {
  const [renderedContent, setRenderedContent] = useState('');
  const [fontImport, setFontImport] = useState<string>('');
  const [fontStyle, setFontStyle] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  // Local utility functions
  function createFontImport(fontList: string[]): string {
    try {
      const encodedFont = encodeURIComponent(fontList[0]);
      const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@100;200;300;400;500;600;700;800;900${fontList
        .slice(1)
        .map((font) => `&display=swap&family=${encodeURIComponent(font)}`)}`;
      return `<link key="font-import" rel="stylesheet" href="${fontUrl}" />`;
    } catch (error) {
      return '';
    }
  }

  function createFontStyle(fontList: string[]): string {
    return `
      body {
        font-family: '${fontList[0]}', sans-serif;
      }
    `;
  }

  const formatToSize = {
    a1: { width: 841, height: 1189 },
    a2: { width: 594, height: 841 },
    a3: { width: 420, height: 594 },
    a4: { width: 210, height: 297 },
    a5: { width: 148, height: 210 },
    a6: { width: 105, height: 148 },
  };

  useEffect(() => {
    setFontImport(createFontImport(fonts));
    setFontStyle(createFontStyle(fonts));
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
                var ctx = element.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = '#FF4444';
                  ctx.font = '14px Arial';
                  ctx.fillText('Error loading chart', 10, 30);
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

      // Script to calculate and add page breaks
      const pageBreakScript = `
        (function() {
          function addPageBreakIndicators() {
            // Get content container
            const contentContainer = document.querySelector('.content');
            if (!contentContainer) return;
            
            // Get the total height of the content
            const contentHeight = contentContainer.scrollHeight;
            
            // Get the page height in pixels (minus padding)
            const pageHeightMm = ${getSize().height};
            const PIXELS_PER_MM = 3.779527559; // Approximately 96 DPI / 25.4 mm per inch
            const pageHeightPx = pageHeightMm * PIXELS_PER_MM;
            const availableHeightPx = pageHeightPx - (20 * PIXELS_PER_MM); // 10mm margin top and bottom
            
            // Calculate page breaks
            const pageBreaks = [];
            let currentHeight = availableHeightPx;
            
            while (currentHeight < contentHeight) {
              pageBreaks.push(currentHeight);
              currentHeight += availableHeightPx;
            }
            
            // Add page break indicators
            pageBreaks.forEach((height, index) => {
              const delimiter = document.createElement('div');
              delimiter.className = 'page-delimiter preview-only';
              delimiter.style.position = 'absolute';
              delimiter.style.top = height + 'px';
              delimiter.style.left = '0';
              delimiter.style.width = '100%';
              delimiter.style.height = '2px';
              delimiter.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
              delimiter.style.zIndex = '1000';
              delimiter.style.boxShadow = '0 0 4px rgba(255, 0, 0, 0.5)';
              
              // Add page end label
              const endLabel = document.createElement('div');
              endLabel.className = 'preview-only';
              endLabel.style.position = 'absolute';
              endLabel.style.right = '10px';
              endLabel.style.top = '-12px';
              endLabel.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
              endLabel.style.color = 'white';
              endLabel.style.padding = '3px 8px';
              endLabel.style.borderRadius = '4px';
              endLabel.style.fontSize = '11px';
              endLabel.style.fontWeight = 'bold';
              endLabel.style.whiteSpace = 'nowrap';
              endLabel.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';
              endLabel.textContent = 'Page ' + (index + 1) + ' end';
              
              // Add page start label
              const startLabel = document.createElement('div');
              startLabel.className = 'preview-only';
              startLabel.style.position = 'absolute';
              startLabel.style.left = '10px';
              startLabel.style.top = '4px';
              startLabel.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
              startLabel.style.color = 'white';
              startLabel.style.padding = '3px 8px';
              startLabel.style.borderRadius = '4px';
              startLabel.style.fontSize = '11px';
              startLabel.style.fontWeight = 'bold';
              startLabel.style.whiteSpace = 'nowrap';
              startLabel.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';
              startLabel.textContent = 'Page ' + (index + 2) + ' start';
              
              delimiter.appendChild(endLabel);
              delimiter.appendChild(startLabel);
              contentContainer.appendChild(delimiter);
            });
            
            // Add info tooltip if there are page breaks
            if (pageBreaks.length > 0) {
              const infoTooltip = document.createElement('div');
              infoTooltip.className = 'preview-only';
              infoTooltip.style.position = 'fixed';
              infoTooltip.style.top = '10px';
              infoTooltip.style.right = '10px';
              infoTooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
              infoTooltip.style.color = 'white';
              infoTooltip.style.padding = '8px 12px';
              infoTooltip.style.borderRadius = '6px';
              infoTooltip.style.fontSize = '12px';
              infoTooltip.style.maxWidth = '200px';
              infoTooltip.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
              infoTooltip.style.zIndex = '1000';
              
              const tooltipTitle = document.createElement('div');
              tooltipTitle.style.fontWeight = 'bold';
              tooltipTitle.style.marginBottom = '4px';
              tooltipTitle.textContent = 'Page Breaks';
              
              const tooltipContent = document.createElement('div');
              tooltipContent.innerHTML = 'Red lines show page breaks in preview only.<br>They won\\'t appear in the exported PDF.';
              
              infoTooltip.appendChild(tooltipTitle);
              infoTooltip.appendChild(tooltipContent);
              document.body.appendChild(infoTooltip);
            }
          }
          
          // Add page break indicators when DOM is fully loaded and after a short delay for rendering
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => setTimeout(addPageBreakIndicators, 500));
          } else {
            setTimeout(addPageBreakIndicators, 500);
          }
          
          // Recalculate on window resize
          window.addEventListener('resize', () => {
            // Remove existing delimiters
            document.querySelectorAll('.page-delimiter').forEach(el => el.remove());
            document.querySelectorAll('.preview-only').forEach(el => el.remove());
            
            // Add new ones
            setTimeout(addPageBreakIndicators, 500);
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
      /* This class will be used to hide elements during export */
      @media print {
        .preview-only {
          display: none !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="content">
      ${rendered}
    </div>
    <script>
      ${chartScript}
      ${pageBreakScript}
    </script>
  </body>
</html>`;

      // Build template content for download using the raw htmlContent.
      // Note: We don't include the page break script in the template content
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
      /* Hide preview-only elements in the exported PDF */
      @media print {
        .preview-only {
          display: none !important;
        }
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
}

export default Preview;
