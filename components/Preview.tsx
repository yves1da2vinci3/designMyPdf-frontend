import React, { useEffect, useRef, useState } from 'react';
import { Box, Text } from '@mantine/core';

interface PreviewProps {
  format?: string;
  htmlContent: string;
  data: any;
  fonts?: string[];
  isLandscape?: boolean;
  setTemplateContent?: (content: string) => void;
}

const Preview: React.FC<PreviewProps> = ({
  format = 'a4',
  htmlContent,
  data,
  fonts = [],
  isLandscape = false,
  setTemplateContent,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pageCount, setPageCount] = useState(1);

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
  const getSize = () => {
    const selectedSize = formatToSize[format as keyof typeof formatToSize] || formatToSize.a4;
    if (isLandscape) {
      return { width: selectedSize.height, height: selectedSize.width };
    }
    return selectedSize;
  };

  const paperSize = getSize();

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const iframeDoc = iframeRef.current.contentWindow.document;

      // Process page breaks to make them visible in the preview
      const processPageBreaks = () => {
        // Find all page break elements
        const pageBreaks = iframeDoc.querySelectorAll('.page-break');

        // Add visual indicators for page breaks
        pageBreaks.forEach((breakEl) => {
          // Create a visual indicator
          const indicator = iframeDoc.createElement('div');
          indicator.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
          indicator.style.color = 'white';
          indicator.style.padding = '4px 8px';
          indicator.style.fontWeight = 'bold';
          indicator.style.fontSize = '12px';
          indicator.style.textAlign = 'center';
          indicator.style.width = '100%';
          indicator.style.marginBottom = '5px';
          indicator.style.borderRadius = '4px';
          indicator.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
          indicator.textContent = 'PAGE BREAK';

          // Insert the indicator before the page break
          breakEl.parentNode?.insertBefore(indicator, breakEl);
        });
      };

      // Initialize charts if any
      const initCharts = () => {
        const chartElements = iframeDoc.querySelectorAll('canvas[data-chart-type]');
        if (chartElements.length > 0) {
          // Load Chart.js if needed
          const script = iframeDoc.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
          script.onload = () => {
            chartElements.forEach((canvas: any) => {
              const type = canvas.getAttribute('data-chart-type');
              const dataStr = canvas.getAttribute('data-chart-data');
              if (type && dataStr) {
                try {
                  const chartData = JSON.parse(dataStr);
                  (window as any).Chart.register(...(window as any).Chart.register);
                  new (window as any).Chart(canvas, {
                    type,
                    data: chartData,
                    options: {
                      responsive: true,
                      maintainAspectRatio: true,
                    },
                  });
                } catch (error) {
                  console.error('Error initializing chart:', error);
                }
              }
            });
          };
          iframeDoc.head.appendChild(script);
        }
      };

      // Apply both functions
      processPageBreaks();
      initCharts();
    }
  }, [htmlContent, data]);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        // Load fonts
        const fontLinks = fonts
          .map(
            (font) =>
              `<link href="https://fonts.googleapis.com/css2?family=${font.replace(
                / /g,
                '+'
              )}&display=swap" rel="stylesheet">`
          )
          .join('');

        // Inject content with fonts and Tailwind CSS
        iframeDoc.open();
        iframeDoc.write(`
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
                  height: 20px;
                  margin: 20px 0;
                  border: none;
                  position: relative;
                  border-top: 3px dashed #FF0000;
                  background-color: rgba(255, 0, 0, 0.1);
                  text-align: center;
                }
                .page-break::before {
                  content: "PAGE BREAK";
                  position: absolute;
                  top: 0;
                  left: 50%;
                  transform: translateX(-50%);
                  background-color: #FF0000;
                  color: white;
                  padding: 2px 8px;
                  font-size: 10px;
                  font-weight: bold;
                  border-radius: 4px;
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
                ${htmlContent}
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

                // Process page breaks and create pages
                function processPageBreaks() {
                  const container = document.getElementById('page-container');
                  const content = container.innerHTML;
                  
                  // Split content at page breaks
                  const parts = content.split('<div class="page-break"></div>');
                  
                  if (parts.length > 1) {
                    // Clear container
                    container.innerHTML = '';
                    
                    // Create pages for each part
                    parts.forEach((part, index) => {
                      // Create page
                      const page = document.createElement('div');
                      page.className = 'page';
                      
                      // Add content
                      const pageContent = document.createElement('div');
                      pageContent.className = 'page-content';
                      pageContent.innerHTML = part;
                      page.appendChild(pageContent);
                      
                      // Add page number
                      const pageNumber = document.createElement('div');
                      pageNumber.className = 'page-number';
                      pageNumber.textContent = 'Page ' + (index + 1);
                      page.appendChild(pageNumber);
                      
                      // Add to container
                      container.appendChild(page);
                      
                      // Add page break indicator after each page (except the last)
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
                    
                    // Send page count to parent
                    window.parent.postMessage({ type: 'pageCount', count: parts.length }, '*');
                  } else {
                    // No page breaks, create a single page
                    const page = document.createElement('div');
                    page.className = 'page';
                    
                    const pageContent = document.createElement('div');
                    pageContent.className = 'page-content';
                    pageContent.innerHTML = content;
                    page.appendChild(pageContent);
                    
                    const pageNumber = document.createElement('div');
                    pageNumber.className = 'page-number';
                    pageNumber.textContent = 'Page 1';
                    page.appendChild(pageNumber);
                    
                    // Clear and add the single page
                    container.innerHTML = '';
                    container.appendChild(page);
                    
                    // Send page count to parent
                    window.parent.postMessage({ type: 'pageCount', count: 1 }, '*');
                  }
                }
                
                // Run after all resources are loaded
                window.addEventListener('load', function() {
                  setTimeout(processPageBreaks, 100);
                });
              </script>
            </body>
          </html>
        `);
        iframeDoc.close();

        // Store the generated content if needed
        if (setTemplateContent) {
          setTemplateContent(htmlContent);
        }
      }
    }

    // Listen for page count message from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'pageCount') {
        setPageCount(event.data.count);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [
    htmlContent,
    data,
    fonts,
    format,
    isLandscape,
    setTemplateContent,
    paperSize.width,
    paperSize.height,
  ]);

  return (
    <>
      <Box
        component="iframe"
        ref={iframeRef}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#f0f0f0',
        }}
        title="Template Preview"
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
};

export default Preview;
