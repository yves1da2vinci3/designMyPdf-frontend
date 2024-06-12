import React, { useEffect, useState, useRef } from 'react';
import ejs from 'ejs-browser';

export type FormatType = 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6';

interface PreviewProps {
  htmlContent: string;
  format?: FormatType;
  data?: Record<string, any>;
  font: string;
}

const importFontCreation = (font: string) => {
  try {
    const encodedFont = encodeURIComponent(font);
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
    return `<link key="font-import" rel="stylesheet" href="${fontUrl}" />`;
  } catch (error) {
    console.error('Error generating font import:', error);
    return '';
  }
};

const fontCssCreation = (font: string) => {
  return `
    body {
      font-family: '${font}', sans-serif;
    }
  `;
};

const Preview: React.FC<PreviewProps> = ({ htmlContent, format = 'a4', data = {}, font }) => {
  const [renderedContent, setRenderedContent] = useState('');
  const [fontImport, setFontImport] = useState<string>('');
  const [fontStyle, setFontStyle] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFontImport(importFontCreation(font));
    setFontStyle(fontCssCreation(font));
  }, [font]);

  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const link = document.createElement('link');
      link.id = 'tailwind-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
      document.head.appendChild(link);
    }
    try {
      const rendered = ejs.render(htmlContent, data);
      const fullContent = `<!doctype html>
      <html>
      <head>
          <title>Preview</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
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
            }
            .content {
              width: 100%;
              align-self: flex-start;
              height: 100%;
            }
          </style>
      </head>
      <body>
        <div class="content">${rendered}</div>
      </body>
      </html>`;
      setRenderedContent(fullContent);
    } catch (error) {
      console.error('Error rendering EJS template:', error);
    }
  }, [htmlContent, data, fontImport, fontStyle]);

  // Convert mm to pixels (96 DPI)
  const mmToPx = (mm: number) => Math.round(mm * (96 / 25.4));

  const formatToSize = {
    a1: { width: mmToPx(841), height: mmToPx(1189) },
    a2: { width: mmToPx(594), height: mmToPx(841) },
    a3: { width: mmToPx(420), height: mmToPx(594) },
    a4: { width: mmToPx(297), height: mmToPx(420) },
    a5: { width: mmToPx(210), height: mmToPx(297) },
    a6: { width: mmToPx(148), height: mmToPx(210) },
  };

  const a4Size = { width: mmToPx(210), height: mmToPx(297) }; // A4 size in pixels
  const size = formatToSize[format];
  const [scale, setScale] = useState(1);

  const getScale = (containerWidth: number, containerHeight: number) => {
    const widthScale = containerWidth / a4Size.width;
    const heightScale = containerHeight / a4Size.height;
    return Math.min(widthScale, heightScale);
  };

  useEffect(() => {
    const updateScale = () => {
      if (paperRef.current) {
        const containerWidth = paperRef.current.clientWidth;
        const containerHeight = paperRef.current.clientHeight;
        const scale = getScale(containerWidth, containerHeight);
        setScale(scale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <div
        ref={paperRef}
        className="shadow-lg h-4/5 w-4/5 mx-3 bg-white rounded overflow-hidden relative"
      >
        <iframe
          ref={iframeRef}
          className="absolute top-0 left-0"
          title="Preview"
          srcDoc={renderedContent}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: `${size.width}px`,
            height: `${size.height}px`,
            border: 'none',
            overflow: 'auto', // Ensure iframe is scrollable if content exceeds height
          }}
          sandbox="allow-popups-to-escape-sandbox allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-modals"
        />
      </div>
    </div>
  );
};

export default Preview;
