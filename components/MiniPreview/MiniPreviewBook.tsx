import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Center, Group, Loader, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
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

interface MiniPreviewBookProps {
  htmlContent: string;
  data: Record<string, unknown>;
  fonts: string[];
}

const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const PAGE_WIDTH_PX = PAGE_WIDTH_MM * CSS_PX_PER_MM;
const PAGE_HEIGHT_PX = PAGE_HEIGHT_MM * CSS_PX_PER_MM;
const SPREAD_GAP = 12;

function MiniPreviewBook({ htmlContent, data, fonts }: MiniPreviewBookProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [pageCount, setPageCount] = useState(1);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [ready, setReady] = useState(false);
  const [framesReady, setFramesReady] = useState(0);
  const [bookPageDims, setBookPageDims] = useState<{
    width: number;
    height: number;
    scale: number;
  } | null>(null);

  useEffect(() => {
    setReady(false);
    setFramesReady(0);
    setBookPageDims(null);
    setCurrentSpread(0);
    setPageCount(1);

    try {
      const template = Handlebars.compile(htmlContent || '');
      const rendered = template(data || {});
      const fontImport = importFontCreation(fonts);
      const fontStyle = fontCssCreation(fonts);

      const pageReportScript = `
        (function() {
          function countPages() {
            var el = document.querySelector('.content') || document.body;
            var h = Math.max(el.scrollHeight, el.offsetHeight, document.documentElement.scrollHeight);
            var breaks = document.querySelectorAll('.page-break, hr.page-break, .pdf-page-break-before');
            var byBreak = breaks.length + 1;
            var byHeight = Math.max(1, Math.ceil(h / ${PAGE_HEIGHT_PX}));
            var count = Math.max(byBreak, byHeight);
            window.parent.postMessage({ type: 'miniPreviewPageCount', count: count }, '*');
          }
          function schedule() {
            countPages();
            setTimeout(countPages, 600);
            setTimeout(countPages, 1500);
          }
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', schedule);
          } else {
            schedule();
          }
        })();
      `;

      setPreviewHtml(`<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <script src="https://cdn.tailwindcss.com"></script>
    ${codeHighlightHeadTags()}
    ${fontImport}
    <style>
      ${fontStyle}
      ${codeHighlightFitCss()}
      html, body { margin: 0; padding: 0; background: #fff; }
      .content { width: ${PAGE_WIDTH_PX}px; max-width: 100%; box-sizing: border-box; }
    </style>
  </head>
  <body class="${CODE_HIGHLIGHT_FIT_BODY_CLASS}">
    <div class="content">${rendered}</div>
    <script>${codeHighlightInitScript()}</script>
    <script>${pageReportScript}</script>
  </body>
</html>`);
      setReady(true);
    } catch {
      setPreviewHtml('');
      setReady(true);
    }
  }, [htmlContent, data, fonts]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'miniPreviewPageCount' && typeof e.data.count === 'number') {
        setPageCount(Math.max(1, e.data.count));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const updateDims = useCallback(() => {
    const el = containerRef.current;
    if (!el) return false;

    const { width, height } = el.getBoundingClientRect();
    if (width < 40 || height < 40) return false;

    const maxW = width * 0.96;
    const maxH = height * 0.86;
    const aspect = PAGE_WIDTH_PX / PAGE_HEIGHT_PX;

    let pageH = maxH;
    let pageW = pageH * aspect;
    const spreadW = pageW * 2 + SPREAD_GAP;

    if (spreadW > maxW) {
      pageW = (maxW - SPREAD_GAP) / 2;
      pageH = pageW / aspect;
    }

    const scale = pageW / PAGE_WIDTH_PX;
    setBookPageDims({ width: pageW, height: pageH, scale });
    return true;
  }, []);

  useLayoutEffect(() => {
    if (!ready) return;

    let cancelled = false;
    let attempts = 0;

    const tryMeasure = () => {
      if (cancelled) return;
      if (updateDims() || attempts > 40) return;
      attempts += 1;
      requestAnimationFrame(tryMeasure);
    };

    tryMeasure();
    const ro = new ResizeObserver(() => updateDims());
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [ready, updateDims]);

  const spreadPages = useMemo(
    () => [0, 1].map((offset) => currentSpread + offset),
    [currentSpread],
  );

  const onFrameLoad = () => setFramesReady((n) => n + 1);

  if (!ready || !bookPageDims) {
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 320 }}>
        <Center h="100%">
          <Loader size="md" />
        </Center>
      </div>
    );
  }

  if (!previewHtml) {
    return (
      <Center h="100%">
        <Text c="dimmed" size="sm">
          Aperçu indisponible
        </Text>
      </Center>
    );
  }

  const { width: pageW, height: pageH, scale } = bookPageDims;
  const pageStep = PAGE_HEIGHT_PX * scale;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#e9ecef',
        gap: 16,
        position: 'relative',
      }}
    >
      {framesReady < 1 ? (
        <Center style={{ position: 'absolute', inset: 0, zIndex: 2, background: '#e9ecef' }}>
          <Loader size="md" />
        </Center>
      ) : null}

      <div style={{ display: 'flex', gap: SPREAD_GAP, alignItems: 'center' }}>
        {spreadPages.map((pageIdx) => (
          <div
            key={pageIdx}
            style={{
              width: pageW,
              height: pageH,
              overflow: 'hidden',
              position: 'relative',
              flexShrink: 0,
              background: '#fff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              borderRadius: 4,
              opacity: pageIdx >= pageCount ? 0.25 : 1,
            }}
          >
            {pageIdx < pageCount ? (
              <iframe
                title={`page-${pageIdx + 1}`}
                srcDoc={previewHtml}
                onLoad={onFrameLoad}
                style={{
                  width: `${PAGE_WIDTH_MM}mm`,
                  height: `${PAGE_HEIGHT_MM * Math.max(pageCount, 1)}mm`,
                  border: 'none',
                  position: 'absolute',
                  top: -(pageIdx * pageStep),
                  left: 0,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  pointerEvents: 'none',
                }}
                sandbox="allow-same-origin allow-scripts"
                scrolling="no"
              />
            ) : null}
          </div>
        ))}
      </div>

      {pageCount > 1 ? (
        <Group
          gap="md"
          style={{
            background: 'rgba(0,0,0,0.65)',
            borderRadius: 24,
            padding: '8px 16px',
            color: '#fff',
          }}
        >
          <button
            type="button"
            aria-label="Pages précédentes"
            disabled={currentSpread === 0}
            onClick={() => setCurrentSpread((s) => Math.max(0, s - 2))}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: currentSpread === 0 ? 'default' : 'pointer',
              opacity: currentSpread === 0 ? 0.4 : 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <IconChevronLeft size={18} />
          </button>
          <Text size="sm" c="white">
            {currentSpread + 1}–{Math.min(currentSpread + 2, pageCount)} / {pageCount}
          </Text>
          <button
            type="button"
            aria-label="Pages suivantes"
            disabled={currentSpread + 2 >= pageCount}
            onClick={() => setCurrentSpread((s) => Math.min(Math.max(0, pageCount - 1), s + 2))}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: currentSpread + 2 >= pageCount ? 'default' : 'pointer',
              opacity: currentSpread + 2 >= pageCount ? 0.4 : 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <IconChevronRight size={18} />
          </button>
        </Group>
      ) : (
        <Text size="xs" c="dimmed">
          1 page
        </Text>
      )}
    </div>
  );
}

export default MiniPreviewBook;
