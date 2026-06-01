import type { AgentGenerationOptions, TemplatePlan, UiAnalysis } from './types';
import { reviewAndCorrect } from './reviewer';

export function analysisToTemplatePlan(
  analysis: UiAnalysis,
  options: AgentGenerationOptions,
): TemplatePlan {
  const primary = analysis.palette_couleurs[0] || '#111827';
  const secondary = analysis.palette_couleurs[1] || '#6B7280';
  return {
    documentType: 'other',
    sections: analysis.structure_dom.map((s) => ({
      name: s.id,
      components: s.children ?? [],
      style: {},
    })),
    colorPalette: {
      primary,
      secondary,
      accent: analysis.palette_couleurs[2],
      background: analysis.palette_couleurs.find((c) => c.toLowerCase().includes('f')) || '#FFFFFF',
      text: primary,
    },
    typography: {
      headers: analysis.typographie[0]?.classes || 'text-2xl font-bold',
      subheaders: analysis.typographie[1]?.classes || 'text-lg font-semibold',
      body: analysis.typographie[2]?.classes || 'text-base',
    },
    pdfConstraints: {
      avoidFlexGap: true,
      useMargins: true,
      avoidSticky: true,
      useExplicitWidths: true,
    },
    recommendedPageOrientation: options.isLandscape ? 'landscape' : 'portrait',
    imageAnalysis: {
      detectedColors: analysis.palette_couleurs,
      layout: analysis.structure_dom.map((s) => s.layout).join(', '),
      components: analysis.structure_dom.map((s) => s.role),
    },
  };
}

export async function runFidelityPdfHarden(
  html: string,
  analysis: UiAnalysis,
  options: AgentGenerationOptions,
): Promise<{
  code: string;
  warnings: string[];
  usage?: { model: string; inputTokens: number; outputTokens: number };
}> {
  const plan = analysisToTemplatePlan(analysis, options);
  const review = await reviewAndCorrect(html, plan, options);
  const warnings = [...(review.warnings ?? [])];
  return { code: review.correctedCode, warnings, usage: review.usage };
}
