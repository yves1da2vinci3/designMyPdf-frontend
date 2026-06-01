import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import { buildFidelityPreviewHtml } from './buildFidelityPreviewHtml';
import type { AgentGenerationOptions, UiAnalysis } from './types';

async function compileHandlebars(
  html: string,
  variables: Record<string, unknown>,
): Promise<string> {
  try {
    await import('@/utils/handlebarsHelpers');
  } catch {
    // helpers optional for fidelity preview
  }
  const compiled = Handlebars.compile(html);
  return compiled(variables);
}

export async function renderFidelityHtmlToPng(
  html: string,
  variables: Record<string, unknown>,
  options: AgentGenerationOptions,
  analysis?: UiAnalysis,
): Promise<string> {
  const renderedBody = await compileHandlebars(html, variables);
  const fullHtml = buildFidelityPreviewHtml(renderedBody, options, analysis);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  });

  try {
    const page = await browser.newPage();
    const format = (options.format || 'a4').toLowerCase();
    const paper = await import('@/utils/paperDimensions').then((m) =>
      m.paperViewportCssPixels(format, options.isLandscape ?? false),
    );
    const vp = analysis?.viewport_recommande ?? paper;

    await page.setViewport({
      width: vp.width,
      height: Math.min(vp.height, 4000),
      deviceScaleFactor: 2,
    });
    await page.setContent(fullHtml, { waitUntil: 'load', timeout: 45_000 });
    await new Promise((r) => setTimeout(r, 1200));

    const buffer = await page.screenshot({
      type: 'png',
      fullPage: true,
    });

    return Buffer.from(buffer).toString('base64');
  } finally {
    await browser.close();
  }
}
