import React, { useEffect, useState, useRef } from 'react';
import Handlebars from 'handlebars';
import '../../../../utils/handlebarsHelpers';
import {
  processChartData,
  replaceChartDataPlaceholders,
  CHART_DATA_VALIDATION_SCRIPT_SNIPPET,
} from '@/utils/chartUtils';
import { sanitizePdfBackgroundColor } from '@/utils/sanitizePdfBackgroundColor';
import { CSS_PX_PER_MM } from '@/utils/paperDimensions';
import { resolvedPdfContentPaddingCss } from '@/utils/pdfContentPadding';
import {
  getContentAreaHeightPx,
  getContentAreaWidthPx,
  PDF_EXPORT_RESET_CSS,
  PDF_PRINT_BREAK_CSS,
} from '@/utils/pdfPageLayout';
import {
  CODE_HIGHLIGHT_FIT_BODY_CLASS,
  codeHighlightFitCss,
  codeHighlightHeadTags,
  codeHighlightInitScript,
} from '@/utils/codeHighlightShell';
import { Switch, Tooltip } from '@mantine/core';

// Define the FormatType directly in this file
type FormatType = 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6';

interface PreviewProps {
  htmlContent: string;
  /** Pre-rendered body HTML with PDF page-break hints (WYSIWYG with export). */
  renderedBodyHtml?: string | null;
  format?: FormatType;
  data?: Record<string, any>;
  fonts: string[];
  isLandscape?: boolean;
  setTemplateContent?: (string: string) => void;
  backgroundColor?: string;
  pdfContentPadding?: string;
  viewMode?: 'single' | 'book';
  isFullscreen?: boolean;
}

function Preview({
  htmlContent,
  renderedBodyHtml = null,
  format = 'a4',
  data = {},
  fonts,
  isLandscape = false,
  setTemplateContent,
  backgroundColor,
  pdfContentPadding,
  viewMode = 'single',
  isFullscreen = false,
}: PreviewProps) {
  const [renderedContent, setRenderedContent] = useState('');
  const [pageCount, setPageCount] = useState(1);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [fontImport, setFontImport] = useState<string>('');
  const [fontStyle, setFontStyle] = useState<string>('');
  const [bookPageDims, setBookPageDims] = useState({ width: 0, height: 0, scale: 1 });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [showPageDelimiters, setShowPageDelimiters] = useState(true);

  // Local utility functions
  function createFontImport(fontList: string[]): string {
    try {
      const encodedFont = encodeURIComponent(fontList[0]);
      const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@100;200;300;400;500;600;700;800;900${fontList
        .slice(1)
        .map((font) => `&display=swap&family=${encodeURIComponent(font)}`)}`;
      return `<link key="font-import" rel="stylesheet" href="${fontUrl}" />`;
    } catch (error) {
      return '';
    }
  }

  function createFontStyle(fontList: string[]): string {
    return `
      body {
        font-family: '${fontList[0]}', sans-serif;
      }
    `;
  }

  const formatToSize = {
    a1: { width: 841, height: 1189 },
    a2: { width: 594, height: 841 },
    a3: { width: 420, height: 594 },
    a4: { width: 210, height: 297 },
    a5: { width: 148, height: 210 },
    a6: { width: 105, height: 148 },
  };

  useEffect(() => {
    setFontImport(createFontImport(fonts));
    setFontStyle(createFontStyle(fonts));
  }, [fonts]);

  // Update delimiters visibility when the toggle changes
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'togglePageDelimiters', show: showPageDelimiters },
        '*',
      );
    }
  }, [showPageDelimiters]);

  // Listen for pageCount from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'pageCount') {
        setPageCount(e.data.count);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Reset spread when switching view modes
  useEffect(() => {
    setCurrentSpread(0);
  }, [viewMode]);

  // Send showSpread to iframe in book mode
  useEffect(() => {
    if (viewMode === 'book' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'showSpread', startPage: currentSpread },
        '*',
      );
    }
  }, [viewMode, currentSpread, renderedContent]);

  useEffect(() => {
    // Append Tailwind CSS if not already present in the parent document.
    if (!document.getElementById('tailwind-cdn')) {
      const link = document.createElement('link');
      link.id = 'tailwind-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
      document.head.appendChild(link);
    }

    try {
      let finalHtml: string;
      if (renderedBodyHtml != null && renderedBodyHtml.trim()) {
        finalHtml = renderedBodyHtml;
      } else {
        const processedHtml = processChartData(htmlContent);
        const template = Handlebars.compile(processedHtml);
        const rendered = template(data);
        finalHtml = replaceChartDataPlaceholders(rendered, data);
      }

      // Chart initialization script.
      const chartScript = `
        ${CHART_DATA_VALIDATION_SCRIPT_SNIPPET}
        (function() {
          function toChartJsType(raw) {
            var t = String(raw == null ? '' : raw).trim();
            var k = t.toLowerCase();
            if (k === 'polararea') return 'polarArea';
            return k;
          }
          function drawWarning(canvas, msg) {
            var ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#92400e';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('⚠ ' + msg, 8, 24);
            ctx.fillStyle = '#b45309';
            ctx.font = '11px sans-serif';
            ctx.fillText('Vérifiez la variable charts.*', 8, 42);
          }

          function initializeCharts() {
            if (!window.Chart) {
              return;
            }
            var chartElements = document.querySelectorAll('canvas[data-chart-type]');
            chartElements.forEach(function(element) {
              try {
                var typeRaw = element.getAttribute('data-chart-type');
                var rawData = element.getAttribute('data-chart-data');

                if (!typeRaw || !rawData) {
                  drawWarning(element, 'Attributs manquants (data-chart-type / data-chart-data)');
                  return;
                }

                var type = toChartJsType(typeRaw);

                var chartData;
                try {
                  chartData = JSON.parse(rawData);
                } catch (e) {
                  drawWarning(element, 'JSON invalide dans data-chart-data');
                  return;
                }

                if (!isChartDataValidForType(chartData, typeRaw)) {
                  drawWarning(element, 'Structure invalide — datasets requis ; labels non vides sauf scatter/bubble');
                  return;
                }

                var defaultOptions = {
                  responsive: true,
                  maintainAspectRatio: true,
                  animation: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        padding: 20,
                        font: {
                          size: 12,
                          family: "'${fonts[0]}', sans-serif"
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      padding: 12,
                      titleFont: {
                        size: 14,
                        family: "'${fonts[0]}', sans-serif"
                      },
                      bodyFont: {
                        size: 12,
                        family: "'${fonts[0]}', sans-serif"
                      }
                    }
                  }
                };

                if (type === 'line' || type === 'bar') {
                  defaultOptions.scales = {
                    y: { beginAtZero: true, grid: { drawBorder: false } },
                    x: { grid: { display: false } }
                  };
                }

                if (type === 'pie' || type === 'doughnut') {
                  defaultOptions.cutout = type === 'doughnut' ? '60%' : '0%';
                  defaultOptions.radius = '90%';
                }

                var chartInstance = new Chart(element, {
                  type: type,
                  data: chartData,
                  options: defaultOptions
                });

                element.chart = chartInstance;
              } catch (error) {
                drawWarning(element, 'Erreur de rendu : ' + (error && error.message ? error.message : 'inconnue'));
              }
            });
          }

          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeCharts);
          } else {
            initializeCharts();
          }

          window.addEventListener('beforeunload', function() {
            var chartElements = document.querySelectorAll('canvas[data-chart-type]');
            chartElements.forEach(function(element) {
              if (element.chart) {
                element.chart.destroy();
              }
            });
          });
        })();
      `;

      // Script to calculate and add page breaks
      const pageBreakScript = `
        (function() {
          // Initial visibility state
          let showDelimiters = ${showPageDelimiters};
          
          // Listen for messages from parent window
          window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'togglePageDelimiters') {
              showDelimiters = event.data.show;
              updateDelimitersVisibility(showDelimiters);
            }
          });
          
          function updateDelimitersVisibility(show) {
            const elements = document.querySelectorAll('.page-delimiter, .preview-only');
            elements.forEach(el => {
              el.style.display = show ? 'block' : 'none';
            });
          }
          
          function addPageBreakIndicators() {
            // Get content container
            const contentContainer = document.querySelector('.content');
            if (!contentContainer) return;
            
            const availableHeightPx = ${getContentAreaHeightPx(format, isLandscape, pdfContentPadding)};
            
            document.querySelectorAll('.page-delimiter, .page-break-tooltip').forEach(el => el.remove());
            
            // Page boundaries: forced breaks (.pdf-page-break-before) + flow segments (same as export)
            const containerTop = contentContainer.getBoundingClientRect().top;
            const scrollHeight = contentContainer.scrollHeight;
            const forcedBreaks = [];
            contentContainer.querySelectorAll('.pdf-page-break-before').forEach(function(el) {
              var top = el.getBoundingClientRect().top - containerTop;
              if (top > 0) forcedBreaks.push(top);
            });
            forcedBreaks.sort(function(a, b) { return a - b; });
            
            const pageBreaks = [];
            var segmentStart = 0;
            var segmentEnds = forcedBreaks.concat([scrollHeight]);
            segmentEnds.forEach(function(segmentEnd) {
              var y = segmentStart;
              while (y + availableHeightPx < segmentEnd - 0.5) {
                y += availableHeightPx;
                pageBreaks.push(y);
              }
              segmentStart = segmentEnd;
            });
            
            // Add page break indicators
            pageBreaks.forEach((height, index) => {
              const delimiter = document.createElement('div');
              delimiter.className = 'page-delimiter preview-only';
              delimiter.style.position = 'absolute';
              delimiter.style.top = height + 'px';
              delimiter.style.left = '0';
              delimiter.style.width = '100%';
              delimiter.style.height = '2px';
              delimiter.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
              delimiter.style.zIndex = '1000';
              delimiter.style.boxShadow = '0 0 4px rgba(255, 0, 0, 0.5)';
              delimiter.style.display = showDelimiters ? 'block' : 'none';
              
              // Add page end label
              const endLabel = document.createElement('div');
              endLabel.className = 'preview-only';
              endLabel.style.position = 'absolute';
              endLabel.style.right = '10px';
              endLabel.style.top = '-12px';
              endLabel.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
              endLabel.style.color = 'white';
              endLabel.style.padding = '3px 8px';
              endLabel.style.borderRadius = '4px';
              endLabel.style.fontSize = '11px';
              endLabel.style.fontWeight = 'bold';
              endLabel.style.whiteSpace = 'nowrap';
              endLabel.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';
              endLabel.textContent = 'Page ' + (index + 1) + ' end';
              endLabel.style.display = showDelimiters ? 'block' : 'none';
              
              // Add page start label
              const startLabel = document.createElement('div');
              startLabel.className = 'preview-only';
              startLabel.style.position = 'absolute';
              startLabel.style.left = '10px';
              startLabel.style.top = '4px';
              startLabel.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
              startLabel.style.color = 'white';
              startLabel.style.padding = '3px 8px';
              startLabel.style.borderRadius = '4px';
              startLabel.style.fontSize = '11px';
              startLabel.style.fontWeight = 'bold';
              startLabel.style.whiteSpace = 'nowrap';
              startLabel.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';
              startLabel.textContent = 'Page ' + (index + 2) + ' start';
              startLabel.style.display = showDelimiters ? 'block' : 'none';
              
              delimiter.appendChild(endLabel);
              delimiter.appendChild(startLabel);
              contentContainer.appendChild(delimiter);
            });
            
            // Add info tooltip if there are page breaks
            if (pageBreaks.length > 0) {
              const infoTooltip = document.createElement('div');
              infoTooltip.className = 'preview-only page-break-tooltip';
              infoTooltip.style.position = 'fixed';
              infoTooltip.style.top = '10px';
              infoTooltip.style.right = '10px';
              infoTooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
              infoTooltip.style.color = 'white';
              infoTooltip.style.padding = '8px 12px';
              infoTooltip.style.borderRadius = '6px';
              infoTooltip.style.fontSize = '12px';
              infoTooltip.style.maxWidth = '200px';
              infoTooltip.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
              infoTooltip.style.zIndex = '1000';
              infoTooltip.style.display = showDelimiters ? 'block' : 'none';
              
              const tooltipTitle = document.createElement('div');
              tooltipTitle.style.fontWeight = 'bold';
              tooltipTitle.style.marginBottom = '4px';
              tooltipTitle.textContent = 'Page Breaks';
              
              const tooltipContent = document.createElement('div');
              tooltipContent.innerHTML = 'Red lines show page breaks in preview only.<br>They won\\'t appear in the exported PDF.';
              
              infoTooltip.appendChild(tooltipTitle);
              infoTooltip.appendChild(tooltipContent);
              document.body.appendChild(infoTooltip);
              
              // Add page count info
              const pageCountInfo = document.createElement('div');
              pageCountInfo.className = 'preview-only page-break-tooltip';
              pageCountInfo.style.position = 'fixed';
              pageCountInfo.style.bottom = '10px';
              pageCountInfo.style.right = '10px';
              pageCountInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
              pageCountInfo.style.color = 'white';
              pageCountInfo.style.padding = '8px 12px';
              pageCountInfo.style.borderRadius = '6px';
              pageCountInfo.style.fontSize = '12px';
              pageCountInfo.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
              pageCountInfo.style.zIndex = '1000';
              pageCountInfo.style.display = showDelimiters ? 'block' : 'none';
              pageCountInfo.textContent = 'Total pages: ' + (pageBreaks.length + 1);
              document.body.appendChild(pageCountInfo);
              
              // Send page count to parent window
              window.parent.postMessage({
                type: 'pageCount',
                count: pageBreaks.length + 1
              }, '*');
            } else {
              window.parent.postMessage({ type: 'pageCount', count: 1 }, '*');
            }
          }
          
          // Add page break indicators when DOM is fully loaded and after a short delay for rendering
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => setTimeout(addPageBreakIndicators, 500));
          } else {
            setTimeout(addPageBreakIndicators, 500);
          }
          
          // Recalculate on window resize
          window.addEventListener('resize', () => {
            setTimeout(addPageBreakIndicators, 500);
          });
        })();
      `;

      const pageBg = sanitizePdfBackgroundColor(backgroundColor);
      const contentPadCss = resolvedPdfContentPaddingCss(pdfContentPadding);
      const contentWidthPx = getContentAreaWidthPx(format, isLandscape);

      // Build the complete preview HTML.
      const previewContent = `<!doctype html>
<html>
  <head>
    <title>Preview</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
    ${codeHighlightHeadTags()}
    ${fontImport}
    <style>
      ${fontStyle}
      ${codeHighlightFitCss()}
      body {
        margin: 0;
        padding: 0;
        width: 100%;
        min-height: ${getContentAreaHeightPx(format, isLandscape, pdfContentPadding)}px;
        overflow-x: hidden;
        background: ${pageBg};
        position: relative;
      }
      .content {
        width: ${contentWidthPx}px;
        max-width: 100%;
        box-sizing: border-box;
        height: auto;
        min-height: 0;
        padding: ${contentPadCss};
        position: relative;
      }
      canvas {
        max-width: 100%;
        margin: 0 auto;
      }
      ${PDF_PRINT_BREAK_CSS}
      ${PDF_EXPORT_RESET_CSS}
      @media print {
        .preview-only {
          display: none !important;
        }
      }
    </style>
  </head>
  <body class="${CODE_HIGHLIGHT_FIT_BODY_CLASS}">
    <div class="content">
      ${finalHtml}
    </div>
    <script>
      ${codeHighlightInitScript()}
      ${chartScript}
      ${pageBreakScript}
      // Book view spread listener
      window.addEventListener('message', function(e) {
        if (e.data && e.data.type === 'showSpread') {
          var pages = document.querySelectorAll('.page');
          if (pages.length === 0) return;
          pages.forEach(function(p, i) {
            p.style.display = (i === e.data.startPage || i === e.data.startPage + 1) ? '' : 'none';
          });
        }
        if (e.data && e.data.type === 'togglePageDelimiters') {
          // handled by pageBreakScript already
        }
      });
    </script>
  </body>
</html>`;

      // Build template content for download using the raw htmlContent.
      // Note: We don't include the page break script in the template content
      const templateContent = `<!doctype html>
<html>
  <head>
    <title>Preview</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
    ${fontImport}
    <style>
      ${fontStyle}
      body {
        margin: 0;
        padding: 0;
        min-height: 100vh;
        width: 100%;
        background: ${pageBg};
      }
      .content {
        width: 100%;
        height: auto;
        min-height: 100vh;
        padding: ${contentPadCss};
      }
      canvas {
        max-width: 100%;
        margin: 0 auto;
      }
      /* Hide preview-only elements in the exported PDF */
      @media print {
        .preview-only {
          display: none !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="content">
      ${htmlContent}
    </div>
    <script>
      ${chartScript}
    </script>
  </body>
</html>`;

      // Pass the template content back if required.
      if (setTemplateContent) {
        setTemplateContent(templateContent);
      }

      setRenderedContent(previewContent);

      // Force iframe refresh.
      if (iframeRef.current) {
        iframeRef.current.srcdoc = previewContent;
      }
    } catch (error: any) {
      setRenderedContent(`
<html>
  <body style="color: red; padding: 1rem;">
    Error rendering template: ${error.message}
  </body>
</html>
      `);
    }
  }, [
    htmlContent,
    renderedBodyHtml,
    data,
    fontImport,
    fontStyle,
    fonts,
    setTemplateContent,
    format,
    isLandscape,
    showPageDelimiters,
    backgroundColor,
    pdfContentPadding,
  ]);

  const getSize = () => {
    const selectedSize = formatToSize[format];
    if (isLandscape) {
      return { width: selectedSize.height, height: selectedSize.width };
    }
    return selectedSize;
  };

  const a4AspectRatio = getSize().height / getSize().width;

  useEffect(() => {
    const updatePaperSize = () => {
      if (!containerRef.current) return;

      // Single view sizing (only when paperRef is mounted)
      if (paperRef.current) {
        const singleMul = isFullscreen ? 0.92 : 0.8;
        const containerWidth = containerRef.current.clientWidth * singleMul;
        const containerHeight = containerRef.current.clientHeight * singleMul;
        let paperWidth = containerWidth;
        let paperHeight = containerWidth * a4AspectRatio;
        if (paperHeight > containerHeight) {
          paperHeight = containerHeight;
          paperWidth = containerHeight / a4AspectRatio;
        }
        paperRef.current.style.width = `${paperWidth}px`;
        paperRef.current.style.height = `${paperHeight}px`;
        const scale = paperWidth / (getSize().width * (96 / 25.4));
        if (iframeRef.current) {
          iframeRef.current.style.transform = `scale(${scale})`;
          iframeRef.current.style.transformOrigin = 'top left';
        }
      }

      // Book view sizing (always computed so it's ready when switching modes)
      const PIXELS_PER_MM = 96 / 25.4;
      const naturalPageW = getSize().width * PIXELS_PER_MM;
      const bookPageMul = isFullscreen ? 0.46 : 0.44;
      const bookMaxW = containerRef.current.clientWidth * bookPageMul;
      const bookMaxH = containerRef.current.clientHeight * (isFullscreen ? 0.92 : 0.85);
      let bw = bookMaxW;
      let bh = bookMaxW * a4AspectRatio;
      if (bh > bookMaxH) {
        bh = bookMaxH;
        bw = bh / a4AspectRatio;
      }
      const bs = bw / naturalPageW;
      setBookPageDims((prev) => {
        if (Math.abs(prev.width - bw) < 0.5 && Math.abs(prev.height - bh) < 0.5) return prev;
        return { width: bw, height: bh, scale: bs };
      });
    };

    updatePaperSize();
    window.addEventListener('resize', updatePaperSize);

    const ro = new ResizeObserver(updatePaperSize);
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      window.removeEventListener('resize', updatePaperSize);
      ro.disconnect();
    };
  }, [a4AspectRatio, isLandscape, isFullscreen, format]);

  // Toggle page delimiters using postMessage
  const togglePageDelimiters = (value: boolean) => {
    setShowPageDelimiters(value);
    // The useEffect hook will handle sending the message to the iframe
  };

  return (
    <div
      ref={containerRef}
      className="h-full w-full flex flex-col items-center justify-center overflow-visible"
    >
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2 bg-gray-800 bg-opacity-70 p-2 rounded">
        <Tooltip label={showPageDelimiters ? 'Hide page breaks' : 'Show page breaks'}>
          <Switch
            style={{
              color: '#fff',
            }}
            checked={showPageDelimiters}
            onChange={(event) => togglePageDelimiters(event.currentTarget.checked)}
            color="red"
            size="sm"
            label="Page breaks"
            labelPosition="left"
          />
        </Tooltip>
      </div>

      {viewMode === 'book' ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            {[0, 1].map((offset) => {
              const pageIdx = currentSpread + offset;
              return (
                <div
                  key={offset}
                  style={{
                    width: bookPageDims.width,
                    height: bookPageDims.height,
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    opacity: pageIdx >= pageCount ? 0.2 : 1,
                  }}
                >
                  <iframe
                    title={`page-${pageIdx}`}
                    srcDoc={renderedContent}
                    style={{
                      width: `${getSize().width}mm`,
                      height: '999999px',
                      border: 'none',
                      position: 'absolute',
                      top: -(pageIdx * bookPageDims.height),
                      left: 0,
                      transform: `scale(${bookPageDims.scale})`,
                      transformOrigin: 'top left',
                    }}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-modals"
                  />
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '12px',
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: '24px',
              padding: '6px 16px',
              color: 'white',
              fontSize: '13px',
            }}
          >
            <button
              onClick={() => setCurrentSpread((s) => Math.max(0, s - 2))}
              disabled={currentSpread === 0}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: currentSpread === 0 ? 'default' : 'pointer',
                opacity: currentSpread === 0 ? 0.4 : 1,
                fontSize: '16px',
              }}
            >
              ‹
            </button>
            <span>
              {currentSpread + 1}–{Math.min(currentSpread + 2, pageCount)} of {pageCount}
            </span>
            <button
              onClick={() => setCurrentSpread((s) => Math.min(pageCount - 1, s + 2))}
              disabled={currentSpread + 2 >= pageCount}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: currentSpread + 2 >= pageCount ? 'default' : 'pointer',
                opacity: currentSpread + 2 >= pageCount ? 0.4 : 1,
                fontSize: '16px',
              }}
            >
              ›
            </button>
          </div>
        </div>
      ) : (
        <div ref={paperRef} className="shadow-lg bg-white rounded overflow-hidden relative">
          <iframe
            ref={iframeRef}
            title="Preview"
            srcDoc={renderedContent}
            scrolling="no"
            style={{
              width: `${getSize().width}mm`,
              height: `${getSize().height}mm`,
              border: 'none',
              overflow: 'hidden',
            }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-modals"
          />
        </div>
      )}
    </div>
  );
}

export default Preview;
