import { TemplateDTO } from '@/api/templateApi';
import notificationService from '@/services/NotificationService';
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
  try {
    // Show loading notification
    notificationService.showInformationNotification(
      `Exporting document as ${format.toUpperCase()}...`,
    );

    // Create a hidden iframe to render the template
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '1000px';
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);

    // Prepare the HTML content with proper CSS for pagination
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
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            @page {
              size: ${format} ${isLandScape ? 'landscape' : 'portrait'};
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              font-family: ${fontsSelected[0] || 'system-ui'}, sans-serif;
              background-color: white;
            }
            #content-container {
              width: ${pageWidth}mm;
              background-color: white;
              margin: 0 auto;
              padding: 10mm;
              box-sizing: border-box;
            }
            /* Any page break elements will still work as manual breaks */
            .page-break {
              page-break-after: always;
              break-after: page;
            }
          </style>
        </head>
        <body>
          <div id="content-container">
            ${renderedContent}
          </div>
          <script>
            // Initialize charts if any
            document.querySelectorAll('canvas[data-chart-type]').forEach(canvas => {
              const type = canvas.getAttribute('data-chart-type');
              const chartDataAttr = canvas.getAttribute('data-chart-data');
              
              // Skip if no chart data is available
              if (!type || !chartDataAttr) return;
              
              let chartData;
              try {
                // Try to parse as JSON first
                chartData = JSON.parse(chartDataAttr);
              } catch (e) {
                console.error('Error parsing chart data:', e);
                // Use empty data as fallback
                chartData = { labels: [], datasets: [] };
              }
              
              try {
                new Chart(canvas, {
                  type,
                  data: chartData,
                  options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    animation: false // Disable animations for PDF export
                  }
                });
              } catch (error) {
                console.error('Error initializing chart:', error);
              }
            });
            // Signal that content is loaded
            window.parent.postMessage('contentLoaded', '*');
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

    // Wait for content to be fully loaded and charts to render
    await new Promise<void>((resolve) => {
      window.addEventListener('message', function handler(event) {
        if (event.data === 'contentLoaded') {
          window.removeEventListener('message', handler);
          // Give charts and fonts more time to render
          setTimeout(resolve, 3000); // Increased timeout for chart rendering
        }
      });
    });

    // Import required libraries
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    // Create jsPDF instance with the correct dimensions
    const JsPDF = jsPDF;
    const pdf = new JsPDF({
      orientation: isLandScape ? 'landscape' : 'portrait',
      unit: 'mm',
      format,
    });

    // Get the content container
    const contentContainer = iframeDoc.getElementById('content-container');
    if (!contentContainer) {
      throw new Error('Content container not found');
    }

    // Calculate the scale factor to convert pixels to mm
    const PIXELS_PER_MM = 3.779527559; // Approximately 96 DPI / 25.4 mm per inch

    // Get the total height of the content in pixels
    const contentHeightPx = contentContainer.scrollHeight;

    // Convert to mm
    const contentHeightMm = contentHeightPx / PIXELS_PER_MM;

    // Calculate available height per page (accounting for margins)
    const availableHeightMm = pageHeight - 20; // 10mm margin top and bottom

    // Calculate how many pages we need
    const totalPages = Math.ceil(contentHeightMm / availableHeightMm);

    // For each page, render a portion of the content
    for (let pageNum = 0; pageNum < totalPages; pageNum += 1) {
      // If not the first page, add a new page
      if (pageNum > 0) {
        pdf.addPage();
      }

      // Calculate the portion of the content to render for this page
      const startY = pageNum * availableHeightMm * PIXELS_PER_MM;
      const heightToRender = Math.min(availableHeightMm * PIXELS_PER_MM, contentHeightPx - startY);

      // Create a canvas for this portion
      const canvas = await html2canvas(contentContainer, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: 'white',
        windowHeight: contentHeightPx,
        y: startY,
        height: heightToRender,
        logging: false, // Disable logging
      });

      // Add the canvas to the PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(
        imgData,
        'PNG',
        10, // X position (10mm margin)
        10, // Y position (10mm margin)
        pageWidth - 20, // Width (accounting for margins)
        heightToRender / PIXELS_PER_MM, // Height in mm
        '', // Alias
        'FAST', // Compression
      );
    }

    // Clean up
    document.body.removeChild(iframe);

    // Save the PDF with the template name and paper size
    pdf.save(`${template?.name || 'template'}_${format.toUpperCase()}.pdf`);

    // Show success notification
    notificationService.showSuccessNotification(
      `Document exported as ${format.toUpperCase()} PDF with ${totalPages} page${
        totalPages > 1 ? 's' : ''
      }!`,
    );
  } catch (error) {
    console.error('Error exporting PDF:', error);
    notificationService.showErrorNotification('Failed to export document. Please try again.');
  }
}
