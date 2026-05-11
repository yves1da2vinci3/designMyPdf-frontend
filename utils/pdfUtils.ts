import { TemplateDTO } from '@/api/templateApi';
import { notifications } from '@mantine/notifications';
import { FormatType } from './types';

/**
 * Exports a PDF document with proper pagination and chart rendering
 */
export async function exportPdfDocument({
  template,
  format,
  isLandScape,
  pageWidth,
  pageHeight,
  fontsSelected,
  variables,
  renderedContent,
}: {
  template: TemplateDTO | null;
  format: FormatType;
  isLandScape: boolean;
  pageWidth: number;
  pageHeight: number;
  fontsSelected: string[];
  variables: Record<string, any>;
  renderedContent: string;
}): Promise<void> {
  const exportNotificationId = `export-pdf-${Date.now()}`;
  try {
    notifications.show({
      id: exportNotificationId,
      title: 'Exportation PDF',
      message: `Préparation du document ${format.toUpperCase()}...`,
      color: 'blue',
      loading: true,
      autoClose: false,
    });

    const PIXELS_PER_MM = 3.779527559;

    const iframe = document.createElement('iframe');
    // Fixed + visibility:hidden → browser renders fully (Tailwind JIT needs a visible viewport)
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = `${pageWidth * PIXELS_PER_MM}px`;
    iframe.style.height = `${pageHeight * PIXELS_PER_MM}px`;
    iframe.style.visibility = 'hidden';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-1';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    document.body.appendChild(iframe);

    const primaryFont = fontsSelected[0] || 'system-ui';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${fontsSelected
            .map(
              (font) =>
                `<link href="https://fonts.googleapis.com/css2?family=${font.replace(
                  / /g,
                  '+',
                )}&display=swap" rel="stylesheet">`,
            )
            .join('')}
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
          <style>
            @page {
              size: ${format} ${isLandScape ? 'landscape' : 'portrait'};
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              font-family: '${primaryFont}', sans-serif;
              background-color: white;
              width: 100%;
            }
            /* Match Preview.tsx scaffold exactly — no box-sizing override, same .content class */
            .content {
              padding: 2rem;
            }
            .page-break {
              page-break-after: always;
              break-after: page;
            }
            .preview-only {
              display: none !important;
            }
            @media print {
              .preview-only { display: none !important; }
            }
            canvas {
              max-width: 100%;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div class="content">
            ${renderedContent}
          </div>
          <script>
            function waitForTailwind() {
              return new Promise((resolve) => {
                const checkTailwind = () => {
                  const testDiv = document.createElement('div');
                  testDiv.className = 'bg-blue-500';
                  document.body.appendChild(testDiv);
                  const hasStyles = window.getComputedStyle(testDiv).backgroundColor !== 'rgba(0, 0, 0, 0)';
                  document.body.removeChild(testDiv);
                  if (hasStyles) {
                    resolve(true);
                  } else {
                    setTimeout(checkTailwind, 100);
                  }
                };
                checkTailwind();
              });
            }

            async function initCharts() {
              await waitForTailwind();

              // Wait for fonts to be ready
              if (document.fonts && document.fonts.ready) {
                await document.fonts.ready;
              }

              if (!window.Chart) {
                await new Promise(resolve => setTimeout(resolve, 500));
              }

              const canvases = document.querySelectorAll('canvas[data-chart-type]');

              canvases.forEach(canvas => {
                const type = canvas.getAttribute('data-chart-type');
                const chartDataAttr = canvas.getAttribute('data-chart-data');

                if (!type || !chartDataAttr) {
                  drawChartWarning(canvas, 'Attributs manquants');
                  return;
                }

                let chartData;
                try {
                  chartData = JSON.parse(chartDataAttr);
                } catch (e) {
                  drawChartWarning(canvas, 'JSON invalide');
                  return;
                }

                if (!chartData || !chartData.labels || !Array.isArray(chartData.datasets)) {
                  drawChartWarning(canvas, 'Données manquantes');
                  return;
                }

                try {
                  if (window.Chart) {
                    new Chart(canvas, {
                      type: type,
                      data: chartData,
                      options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        animation: false,
                        plugins: {
                          legend: {
                            position: 'top',
                            labels: {
                              padding: 20,
                              font: { size: 12, family: "'${primaryFont}', sans-serif" }
                            }
                          },
                          tooltip: { enabled: false }
                        }
                      }
                    });
                  }
                } catch (error) {
                  drawChartWarning(canvas, 'Erreur rendu');
                }
              });

              // Small paint-flush buffer, then signal ready
              await new Promise(resolve => setTimeout(resolve, 300));
              window.parent.postMessage('contentLoaded', '*');
            }

            function drawChartWarning(canvas, msg) {
              const ctx = canvas.getContext('2d');
              if (!ctx) return;
              ctx.fillStyle = '#fef3c7';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#92400e';
              ctx.font = '12px sans-serif';
              ctx.fillText('⚠ ' + msg, 8, 24);
            }

            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', initCharts);
            } else {
              initCharts();
            }
          </script>
        </body>
      </html>
    `;

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('Could not access iframe document');
    }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    (iframe.contentWindow as any).templateVariables = variables;

    // Wait for contentLoaded message (chart init + paint flush)
    await new Promise<void>((resolve) => {
      let resolved = false;

      const handler = (event: MessageEvent) => {
        if (event.data === 'contentLoaded' && !resolved) {
          resolved = true;
          window.removeEventListener('message', handler);
          // Small extra buffer to ensure final paint
          setTimeout(resolve, 200);
        }
      };

      window.addEventListener('message', handler);

      // Hard timeout fallback — 10s max
      setTimeout(() => {
        if (!resolved) {
          window.removeEventListener('message', handler);
          resolve();
        }
      }, 10000);
    });

    notifications.update({
      id: exportNotificationId,
      title: 'Exportation PDF',
      message: 'Capture du contenu...',
      color: 'blue',
      loading: true,
      autoClose: false,
    });

    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const pdf = new jsPDF({
      orientation: isLandScape ? 'landscape' : 'portrait',
      unit: 'mm',
      format,
    });

    // Use .content class, matching Preview.tsx scaffold
    const contentEl = iframeDoc.querySelector('.content') as HTMLElement;
    if (!contentEl) {
      throw new Error('Content container not found');
    }

    const fullCanvas = await html2canvas(contentEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: 'white',
      logging: false,
      imageTimeout: 0,
      removeContainer: false,
      foreignObjectRendering: false,
      width: contentEl.offsetWidth,
      windowWidth: iframe.clientWidth,
      windowHeight: contentEl.scrollHeight,
      height: contentEl.scrollHeight,
      onclone: (clonedDoc) => {
        const canvases = clonedDoc.querySelectorAll('canvas');
        const originalCanvases = contentEl.querySelectorAll('canvas');
        canvases.forEach((canvas, index) => {
          const originalCanvas = originalCanvases[index] as HTMLCanvasElement;
          if (originalCanvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(originalCanvas, 0, 0);
            }
          }
        });
      },
    });

    // Margins: 10mm each side
    const imgWidth = pageWidth - 20;
    const imgHeight = (fullCanvas.height * imgWidth) / fullCanvas.width;

    const pageHeightMm = pageHeight - 20;
    // Multiply by 2 to match html2canvas scale: 2
    const pageHeightPx = pageHeightMm * PIXELS_PER_MM * 2;

    let heightLeft = fullCanvas.height;
    let position = 0;
    let pageNum = 0;

    notifications.update({
      id: exportNotificationId,
      title: 'Exportation PDF',
      message: 'Génération des pages...',
      color: 'blue',
      loading: true,
      autoClose: false,
    });

    while (heightLeft > 0) {
      if (pageNum > 0) {
        pdf.addPage();
      }

      const sourceY = position;
      const sourceHeight = Math.min(pageHeightPx, heightLeft);

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = fullCanvas.width;
      pageCanvas.height = sourceHeight;

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          fullCanvas,
          0, sourceY, fullCanvas.width, sourceHeight,
          0, 0, fullCanvas.width, sourceHeight,
        );
      }

      // PNG for lossless text quality
      const pageImgData = pageCanvas.toDataURL('image/png');
      const pageImgHeight = (sourceHeight * imgWidth) / fullCanvas.width;

      pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, pageImgHeight, undefined, 'FAST');

      heightLeft -= sourceHeight;
      position += sourceHeight;
      pageNum += 1;
    }

    const totalPages = pageNum;
    document.body.removeChild(iframe);

    pdf.save(`${template?.name || 'template'}_${format.toUpperCase()}.pdf`);

    notifications.update({
      id: exportNotificationId,
      title: 'Export terminé',
      message: `Document exporté en ${format.toUpperCase()} — ${totalPages} page${totalPages > 1 ? 's' : ''}.`,
      color: 'green',
      loading: false,
      autoClose: 3000,
    });
  } catch (error) {
    console.error('Error exporting PDF:', error);
    notifications.update({
      id: exportNotificationId,
      title: 'Échec export',
      message: 'Impossible d\'exporter le document. Réessayez.',
      color: 'red',
      loading: false,
      autoClose: 5000,
    });
  }
}
