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
          <title></title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script  src="https://cdn.tailwindcss.com"></script>
          ${fontImport}
          <style>
            ${fontStyle}
          </style>
      </head>
      <body>
       ${rendered}
      </body>
      </html>
      `;
      setRenderedContent(fullContent);
    } catch (error) {
      console.error('Error rendering EJS template:', error);
    }
  }, [htmlContent, data, fontImport, fontStyle]);

  const formatToSize = {
    a1: { width: 841, height: 594 },
    a2: { width: 594, height: 420 },
    a3: { width: 420, height: 297 },
    a4: { width: 297, height: 210 },
    a5: { width: 210, height: 148 },
    a6: { width: 148, height: 105 },
  };

  const size = formatToSize[format];

  const getScale = () => {
    const containerWidth = 297; // A4 width in mm
    const containerHeight = 210; // A4 height in mm
    const widthScale = containerWidth / size.width;
    const heightScale = containerHeight / size.height;
    return Math.min(widthScale, heightScale);
  };

  const scale = getScale();

  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="shadow-lg h-4/5 w-full mx-3 bg-white rounded overflow-hidden" style={{ position: 'relative' }}>
        <iframe
          ref={iframeRef}
          className="bg-white"
          title="Preview"
          srcDoc={renderedContent}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: `${size.width}mm`,
            height: `${size.height}mm`,
            border: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          sandbox="allow-popups-to-escape-sandbox allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-modals"
        />
      </div>
    </div>
  );
};

export default Preview;
