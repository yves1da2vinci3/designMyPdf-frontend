import React, { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@mantine/core';
import Handlebars from 'handlebars';
import '../../utils/handlebarsHelpers';
import { CSS_PX_PER_MM } from '@/utils/paperDimensions';
import {
  CODE_HIGHLIGHT_FIT_BODY_CLASS,
  codeHighlightFitCss,
  codeHighlightHeadTags,
  codeHighlightInitScript,
} from '@/utils/codeHighlightShell';
import { fontCssCreation, importFontCreation } from './utils';

interface MiniPreviewProps {
  htmlContent: string;
  data: any;
  fonts: string[];
  /** cover = fill card (crop). contain = full page visible (letterbox). */
  fit?: 'cover' | 'contain';
  /** false = render immediately (modal fullscreen). */
  lazy?: boolean;
}

const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const PAGE_WIDTH_PX = PAGE_WIDTH_MM * CSS_PX_PER_MM;
const PAGE_HEIGHT_PX = PAGE_HEIGHT_MM * CSS_PX_PER_MM;

function MiniPreview({ htmlContent, data, fonts, fit = 'cover', lazy = true }: MiniPreviewProps) {
  const [renderedContent, setRenderedContent] = useState('');
  const [fontImport, setFontImport] = useState('');
  const [fontStyle, setFontStyle] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const [isVisible, setIsVisible] = useState(!lazy);
  const [scale, setScale] = useState(0.2);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lazy) {
      setIsVisible(true);
      return;
    }
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [lazy]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const updateScale = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      const scaleW = width / PAGE_WIDTH_PX;
      const scaleH = height / PAGE_HEIGHT_PX;
      const next = fit === 'contain' ? Math.min(scaleW, scaleH) : Math.max(scaleW, scaleH);
      setScale(next);
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);

  useEffect(() => {
    if (!isVisible) return;
    setFontImport(importFontCreation(fonts));
    setFontStyle(fontCssCreation(fonts));
  }, [fonts, isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    try {
      const template = Handlebars.compile(htmlContent || '');
      const rendered = template(data || {});
      setRenderedContent(rendered);
      setIframeKey((k) => k + 1);
    } catch {
      setRenderedContent('<p style="color:red;padding:8px;font-size:12px;">Preview error</p>');
    }
  }, [htmlContent, data, isVisible]);

  const previewHtml = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <script src="https://cdn.tailwindcss.com"></script>
    ${codeHighlightHeadTags()}
    ${fontImport}
    <style>
      ${fontStyle}
      ${codeHighlightFitCss()}
      html, body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background: #fff;
      }
    </style>
  </head>
  <body class="${CODE_HIGHLIGHT_FIT_BODY_CLASS}">
    ${renderedContent}
    <script>${codeHighlightInitScript()}</script>
  </body>
</html>`;

  return (
    <div
      ref={rootRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: fit === 'contain' ? '#e9ecef' : '#fff',
      }}
    >
      {!isVisible ? (
        <Skeleton height="100%" width="100%" radius={0} />
      ) : (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: PAGE_WIDTH_PX,
            height: PAGE_HEIGHT_PX,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: 'center center',
            pointerEvents: 'none',
          }}
        >
          <iframe
            key={iframeKey}
            title="Mini preview"
            srcDoc={previewHtml}
            style={{
              width: `${PAGE_WIDTH_MM}mm`,
              height: `${PAGE_HEIGHT_MM}mm`,
              border: 'none',
              display: 'block',
              background: '#fff',
            }}
            sandbox="allow-same-origin allow-scripts"
            scrolling="no"
          />
        </div>
      )}
    </div>
  );
}

export default MiniPreview;
