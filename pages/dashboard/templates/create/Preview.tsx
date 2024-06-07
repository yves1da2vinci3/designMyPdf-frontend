import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import styles from './create.module.css';
import ejs from 'ejs-browser';

export type FormatType = 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6';

interface PreviewProps {
  htmlContent: string;
  format?: FormatType; // Add the format prop
  data?: Record<string, any>; // Add a data prop for EJS
  font: string;
}

const importFontCreation = (font: string) => {
  try {
    // Generate the import statement for the font
    const encodedFont = encodeURIComponent(font); // Encode font name
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
    return `<link key="font-import" rel="stylesheet" href="${fontUrl}" />`;
  } catch (error) {
    console.error('Error generating font import:', error);
    return ''; // Return empty string in case of error
  }
};



const fontCssCreation = (font: string) => {
  // Generate the CSS rule to apply the font to the body
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

  useEffect(() => {
    // Generate font import statement and font CSS
    console.log(font)
    setFontImport(importFontCreation(font));
    setFontStyle(fontCssCreation(font));
  }, [font]);

  useEffect(() => {
    // Check if Tailwind CSS CDN is already loaded
    if (!document.getElementById('tailwind-cdn')) {
      const link = document.createElement('link');
      link.id = 'tailwind-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
      document.head.appendChild(link);
    }

    // Render the EJS template
    try {
      const rendered = ejs.render(htmlContent, data);
      const fullContent = `<!doctype html>
      <html>
      <head>
          <title></title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
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

  return (
    <iframe
      className={`bg-white ${styles[`${format}-format`]}`} // Apply Tailwind CSS class for background color
      title="Preview"
      srcDoc={renderedContent}
      sandbox="allow-popups-to-escape-sandbox allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-modals"
    />
  );
};

export default Preview;
