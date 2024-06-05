import React, { useEffect } from 'react';
import Head from 'next/head';
interface PreviewProps {
  htmlContent: string;
}

const Preview: React.FC<PreviewProps> = ({ htmlContent }) => {
  useEffect(() => {
    // Check if Tailwind CSS CDN is already loaded
    if (!document.getElementById('tailwind-cdn')) {
      const link = document.createElement('link');
      link.id = 'tailwind-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="prose" dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
};

export default Preview;
