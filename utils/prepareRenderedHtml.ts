import { applyPdfPageBreakHints } from './applyPdfPageBreakHints';
import { processChartData, replaceChartDataPlaceholders } from './chartUtils';

export interface PrepareRenderedHtmlOptions {
  paperSize: string;
  isLandscape: boolean;
  pdfContentPadding?: string;
  pdfBackgroundColor?: string;
  fonts?: string[];
}

/**
 * Handlebars compile + chart placeholders + PDF page-break hints (same pipeline as export).
 */
export async function prepareRenderedHtml(
  templateCode: string,
  data: Record<string, unknown>,
  options: PrepareRenderedHtmlOptions,
): Promise<string> {
  const { default: Handlebars } = await import('handlebars');
  await import('@/utils/handlebarsHelpers');

  const processedCode = processChartData(templateCode);
  const compiled = Handlebars.compile(processedCode);
  let html = compiled(data);
  html = replaceChartDataPlaceholders(html, data);

  return applyPdfPageBreakHints(html, {
    paperSize: options.paperSize,
    isLandscape: options.isLandscape,
    pdfContentPadding: options.pdfContentPadding,
    pdfBackgroundColor: options.pdfBackgroundColor,
    fonts: options.fonts,
  });
}
