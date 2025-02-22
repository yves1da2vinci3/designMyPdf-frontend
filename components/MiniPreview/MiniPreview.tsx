import React, { useEffect, useState } from 'react';
import Handlebars from 'handlebars';

interface MiniPreviewProps {
  htmlContent: string;
  data: any;
  fonts: string[];
}

const importFontCreation = (fonts: string[]) => {
  if (fonts.length === 0) return '';
  try {
    const encodedFont = encodeURIComponent(fonts[0]);
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@100;200;300;400;500;600;700;800;900${fonts
      .slice(1)
      .map((font) => `&display=swap&family=${encodeURIComponent(font)}`)
      .join('')}`;
    return `<link rel="stylesheet" href="${fontUrl}" />`;
  } catch {
    return '';
  }
};

const fontCssCreation = (fonts: string[]) => `
  body {
    font-family: '${fonts[0]}', sans-serif;
  }
`;

const MiniPreview: React.FC<MiniPreviewProps> = ({ htmlContent, data, fonts }) => {
  const [renderedContent, setRenderedContent] = useState('');
  const [fontImport, setFontImport] = useState('');
  const [fontStyle, setFontStyle] = useState('');

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
    } catch {
      setRenderedContent('');
    }
  }, [htmlContent, data, fontImport, fontStyle]);

  return (
    <div style={{ width: '100%', height: '100px', overflow: 'hidden', position: 'relative' }}>
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
};

export default MiniPreview;
