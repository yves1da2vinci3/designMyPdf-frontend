/**
 * Générateur - Phase 2: Génère le code HTML/Tailwind basé sur le plan
 */
import { HumanMessage } from '@langchain/core/messages';
import type { TemplatePlan, ProcessedImage, AgentGenerationOptions } from './types';
import { PDF_SURVIVAL_GUIDE, TEMPLATE_DESIGN_GUIDE } from './pdfConstraints';
import { getTemplateById } from './templateLibrary';
import { formatImagesForClaude } from './imageProcessor';
import { createChatAnthropic } from './anthropicClient';
import { buildPageContextPrompt } from '@/lib/aiGeneration/pdfPromptContext';

/**
 * Génère le code HTML/Tailwind à partir du plan
 */
export async function generateCode(
  plan: TemplatePlan,
  processedImages?: ProcessedImage[],
  options?: AgentGenerationOptions,
): Promise<string> {
  const model = createChatAnthropic(true, options?.apiKey);
  const pageLandscape =
    plan.recommendedPageOrientation === 'landscape' || options?.isLandscape === true;
  const pageContext = options?.format
    ? buildPageContextPrompt(options.format, pageLandscape, options.pdfContentPadding)
    : '';
  // Récupérer le template de référence si disponible
  const referenceTemplate = plan.selectedTemplate ? getTemplateById(plan.selectedTemplate) : null;

  // Construire le contenu du message
  const content: Array<{ type: string; text?: string; image_url?: string }> = [];

  // Ajouter les images si présentes (pour référence visuelle)
  if (processedImages && processedImages.length > 0) {
    const imageFormats = formatImagesForClaude(processedImages);
    content.push(...imageFormats);
  }

  // Construire le prompt de génération
  const generationPrompt = `You are an expert HTML/Tailwind CSS developer specialized in PDF template generation. Generate production-ready HTML code based on the provided plan.

${
  processedImages && processedImages.length > 0
    ? `REFERENCE IMAGES: ${processedImages.length} image(s) provided for visual reference. Match the design as closely as possible.`
    : ''
}

TEMPLATE PLAN:
${JSON.stringify(plan, null, 2)}

${
  referenceTemplate
    ? `REFERENCE TEMPLATE (use as inspiration, but adapt to the plan):
\`\`\`html
${referenceTemplate.code}
\`\`\`

Variables used in reference: ${referenceTemplate.variables.join(', ')}
`
    : ''
}

${PDF_SURVIVAL_GUIDE}
${TEMPLATE_DESIGN_GUIDE}
${pageContext}

CRITICAL REQUIREMENTS:
0. QUALITY: Generate a STUNNING, HIGH-END design. Use generous whitespace, professional typography, and a refined color palette.
1. Generate COMPLETE HTML code from start to finish (no ellipsis, no placeholders)
2. Use ONLY Tailwind CSS utility classes
3. Use semantic HTML5 tags (h1-h6 for headings, not div)
4. ALL dynamic content MUST use Handlebars variables: {{variable}}, {{object.property}}, {{#each items}}...{{/each}}
5. For images, use: <img src="{{imageUrl}}" alt="..." class="...">
6. NEVER hardcode values - use Handlebars variables for:
   - Text content (names, addresses, dates, numbers)
   - Images (logos, avatars, etc.)
   - Lists and arrays
   - Conditional sections ({{#if condition}}...{{/if}})
7. Follow the color palette exactly: ${Object.values(plan.colorPalette).join(', ')}
8. Use the typography classes specified: ${Object.values(plan.typography).join(', ')}
9. Structure the code according to the sections: ${plan.sections.map((s) => s.name).join(', ')}
10. Apply the style properties for each section
11. PADDING: The root <div> wrapper MUST be p-0 — the preview scaffold already provides outer padding (2rem editor / 10mm catalog); inner sections use py-3 or py-4 at most; NEVER stack p-6+ on any nested container
12. CHARTS: For any chart, use <canvas data-chart-type="bar|line|pie|doughnut" data-chart-data='{{charts.chartName}}'></canvas> — NEVER put raw JSON in the attribute; the variable charts.chartName MUST exist with structure { labels: string[], datasets: [{ label, data: number[], backgroundColor, borderColor }] }
${
  plan.recommendedPageOrientation === 'landscape'
    ? '13. LANDSCAPE: use horizontal multi-column layout; do NOT use a single narrow vertical column.'
    : ''
}
${
  plan.imageAnalysis
    ? `14. Match the detected layout and components from image analysis: ${plan.imageAnalysis.components.join(', ')}`
    : ''
}

OUTPUT FORMAT:
- Start with <div class="...">
- End with </div>
- NO DOCTYPE, NO <html>, NO <head>, NO <body>
- NO JavaScript
- NO markdown code fences
- Clean, indented HTML
- Include brief HTML comments for major sections

Generate the HTML code now:`;

  content.push({
    type: 'text',
    text: generationPrompt,
  });

  // Appel au modèle
  const message = new HumanMessage({ content });
  const response = await model.invoke([message]);

  let generatedCode = response.content.toString().trim();

  // Nettoyer le code (enlever markdown code blocks si présents)
  if (generatedCode.startsWith('```html')) {
    generatedCode = generatedCode
      .replace(/^```html\n?/g, '')
      .replace(/```\s*$/g, '')
      .trim();
  } else if (generatedCode.startsWith('```')) {
    generatedCode = generatedCode
      .replace(/^```\n?/g, '')
      .replace(/```\s*$/g, '')
      .trim();
  }

  return generatedCode;
}
