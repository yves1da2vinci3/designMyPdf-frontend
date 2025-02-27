import React, { useEffect, useRef } from 'react';
import { Box } from '@mantine/core';

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
                  width: 100%;
                  height: 100%;
                  overflow: hidden;
                }
                .page {
                  width: 100%;
                  height: 100%;
                  display: flex;
                  flex-direction: column;
                  box-sizing: border-box;
                }
              </style>
            </head>
            <body>
              <div class="page">
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
  }, [htmlContent, data, fonts, format, isLandscape, setTemplateContent]);

  return (
    <Box
      component="iframe"
      ref={iframeRef}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        backgroundColor: 'white',
        aspectRatio: `${paperSize.width} / ${paperSize.height}`,
      }}
      title="Template Preview"
    />
  );
};

export default Preview;
