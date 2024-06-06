import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import styles from './create.module.css';
import ejs from 'ejs-browser';
interface PreviewProps {
  htmlContent: string;
  format?: 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6' | 'default'; // Add the format prop
  data?: Record<string, any>; // Add a data prop for EJS
}

const Preview: React.FC<PreviewProps> = ({ htmlContent, format, data = {} }) => {
  const [renderedContent, setRenderedContent] = useState('');

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
      setRenderedContent(rendered);
    } catch (error) {
      console.error('Error rendering EJS template:', error);
    }
  }, [htmlContent, data]);

  const formatClass = format !== 'default' ? styles[`${format}Format`] : '';
  return (
    <div className={`prose ${formatClass}`} dangerouslySetInnerHTML={{ __html: renderedContent }} />
  );
};

export default Preview;
