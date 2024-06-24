import React, { useEffect, useState } from 'react';
import Handlebars from 'handlebars';

interface MiniPreviewProps {
  htmlContent: string;
  data: any;
  fonts: string[];
}
const importFontCreation = (fonts: string[]) => {
  try {
    const encodedFont = encodeURIComponent(fonts[0]);
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@100;200;300;400;500;600;700;800;900${fonts.slice(1).map((font) => `&display=swap&family=${encodeURIComponent(font)}`)}`;
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

const MiniPreview: React.FC<MiniPreviewProps> = ({ htmlContent, data, fonts }) => {
  const [renderedContent, setRenderedContent] = useState('');
  const [fontImport, setFontImport] = useState<string>('');
  const [fontStyle, setFontStyle] = useState<string>('');
  useEffect(() => {
    setFontImport(importFontCreation(fonts));
    setFontStyle(fontCssCreation(fonts));
  }, [fonts]);

  useEffect(() => {
   
    try {
      const template = Handlebars.compile(htmlContent);
      const rendered = template(data);

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
          <body class="overflow-x-hidden overflow-y-auto">
            <div class="content">${rendered}</div>
          </body>
          </html>`;
      setRenderedContent(fullContent);
    } catch (error) {
      console.error('Error rendering Handlebars template:', error);
    }
  }, [htmlContent, data, fontImport, fontStyle]);
  return (
    <div style={{ width: '100%', height: '100px', overflow: 'hidden', position: 'relative' }}>
      <div
        style={{
          transform: 'scale(0.25)', // Scale down the content
          transformOrigin: 'top left',
          width: '400%',
          height: '400%',
        }}
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    </div>
  );
};

export default MiniPreview;
