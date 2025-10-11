import { TemplateDTO } from '@/api/templateApi';
import notificationService from '@/services/NotificationService';
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
      title: 'Exporting PDF',
      message: `Preparing document as ${format.toUpperCase()}...`,
      color: 'blue',
      loading: true,
      autoClose: false,
    });

    const iframe = document.createElement('iframe');
    iframe.style.width = `${pageWidth * 3.779527559}px`;
    iframe.style.height = `${pageHeight * 3.779527559}px`;
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    document.body.appendChild(iframe);

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
              font-family: '${fontsSelected[0] || 'system-ui'}', sans-serif;
              background-color: white;
              min-height: 100vh;
              width: 100%;
            }
            #content-container {
              width: 100%;
              min-height: 100vh;
              background-color: white;
              padding: 2rem;
              box-sizing: border-box;
              position: relative;
            }
            .page-break {
              page-break-after: always;
              break-after: page;
            }
            .preview-only {
              display: none !important;
            }
            @media print {
              .preview-only {
                display: none !important;
              }
            }
            canvas {
              max-width: 100%;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div id="content-container">
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
              
              if (!window.Chart) {
                await new Promise(resolve => setTimeout(resolve, 500));
                if (!window.Chart) {
                  window.parent.postMessage('contentLoaded', '*');
                  return;
                }
              }
              
              document.querySelectorAll('canvas[data-chart-type]').forEach(canvas => {
                const type = canvas.getAttribute('data-chart-type');
                const chartDataAttr = canvas.getAttribute('data-chart-data');
                
                if (!type || !chartDataAttr) return;
                
                let chartData;
                try {
                  chartData = JSON.parse(chartDataAttr);
                } catch (e) {
                  chartData = { labels: [], datasets: [] };
                }
                
                try {
                  new Chart(canvas, {
                    type,
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
                            font: {
                              size: 12,
                              family: "'${fontsSelected[0] || 'system-ui'}', sans-serif"
                            }
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          padding: 12,
                          titleFont: {
                            size: 14,
                            family: "'${fontsSelected[0] || 'system-ui'}', sans-serif"
                          },
                          bodyFont: {
                            size: 12,
                            family: "'${fontsSelected[0] || 'system-ui'}', sans-serif"
                          }
                        }
                      }
                    }
                  });
                } catch (error) {
                  console.error('Error initializing chart:', error);
                }
              });
              
              await new Promise(resolve => setTimeout(resolve, 2000));
              window.parent.postMessage('contentLoaded', '*');
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

    // Set the content to the iframe
    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('Could not access iframe document');
    }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Pass variables to the iframe for chart data access
    (iframe.contentWindow as any).templateVariables = variables;

    await new Promise<void>((resolve) => {
      let contentLoaded = false;

      const handler = (event: MessageEvent) => {
        if (event.data === 'contentLoaded' && !contentLoaded) {
          contentLoaded = true;
          window.removeEventListener('message', handler);
          setTimeout(resolve, 3000);
        }
      };

      window.addEventListener('message', handler);

      setTimeout(() => {
        if (!contentLoaded) {
          window.removeEventListener('message', handler);
          resolve();
        }
      }, 15000);
    });

    notifications.update({
      id: exportNotificationId,
      title: 'Exporting PDF',
      message: 'Rendering charts and content...',
      color: 'blue',
      loading: true,
      autoClose: false,
    });

    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    // Create jsPDF instance with the correct dimensions
    const JsPDF = jsPDF;
    const pdf = new JsPDF({
      orientation: isLandScape ? 'landscape' : 'portrait',
      unit: 'mm',
      format,
    });

    const contentContainer = iframeDoc.getElementById('content-container');
    if (!contentContainer) {
      throw new Error('Content container not found');
    }

    const PIXELS_PER_MM = 3.779527559;

    notifications.update({
      id: exportNotificationId,
      title: 'Exporting PDF',
      message: 'Capturing document content...',
      color: 'blue',
      loading: true,
      autoClose: false,
    });

    const fullCanvas = await html2canvas(contentContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: 'white',
      logging: false,
      imageTimeout: 0,
      removeContainer: false,
      foreignObjectRendering: false,
      windowHeight: contentContainer.scrollHeight,
      height: contentContainer.scrollHeight,
      onclone: (clonedDoc) => {
        const canvases = clonedDoc.querySelectorAll('canvas');
        const originalCanvases = contentContainer.querySelectorAll('canvas');
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

    const imgWidth = pageWidth - 20;
    const imgHeight = (fullCanvas.height * imgWidth) / fullCanvas.width;

    const pageHeightMm = pageHeight - 20;
    const pageHeightPx = pageHeightMm * PIXELS_PER_MM * 2;

    let heightLeft = fullCanvas.height;
    let position = 0;
    let pageNum = 0;

    notifications.update({
      id: exportNotificationId,
      title: 'Exporting PDF',
      message: 'Generating PDF pages...',
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
          0,
          sourceY,
          fullCanvas.width,
          sourceHeight,
          0,
          0,
          fullCanvas.width,
          sourceHeight,
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      const pageImgHeight = (sourceHeight * imgWidth) / fullCanvas.width;

      pdf.addImage(pageImgData, 'JPEG', 10, 10, imgWidth, pageImgHeight, undefined, 'SLOW');

      heightLeft -= sourceHeight;
      position += sourceHeight;
      pageNum += 1;
    }

    const totalPages = pageNum;

    document.body.removeChild(iframe);

    notifications.update({
      id: exportNotificationId,
      title: 'Exporting PDF',
      message: 'Saving document...',
      color: 'blue',
      loading: true,
      autoClose: false,
    });

    pdf.save(`${template?.name || 'template'}_${format.toUpperCase()}.pdf`);

    notifications.update({
      id: exportNotificationId,
      title: 'Export Complete',
      message: `Document exported as ${format.toUpperCase()} PDF with ${totalPages} page${
        totalPages > 1 ? 's' : ''
      }!`,
      color: 'green',
      loading: false,
      autoClose: 3000,
    });
  } catch (error) {
    console.error('Error exporting PDF:', error);
    notifications.update({
      id: exportNotificationId,
      title: 'Export Failed',
      message: 'Failed to export document. Please try again.',
      color: 'red',
      loading: false,
      autoClose: 5000,
    });
  }
}
