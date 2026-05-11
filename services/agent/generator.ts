/**
 * Générateur - Phase 2: Génère le code HTML/Tailwind basé sur le plan
 */
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage } from '@langchain/core/messages';
import type { TemplatePlan, ProcessedImage } from './types';
import { PDF_SURVIVAL_GUIDE, TEMPLATE_DESIGN_GUIDE } from './pdfConstraints';
import { getTemplateById } from './templateLibrary';
import { formatImagesForClaude } from './imageProcessor';

/**
 * Modèle Claude configuré pour la génération
 */
const model = new ChatAnthropic({
  modelName: 'claude-haiku-4-5-20251001',
  temperature: 0.3,
  maxTokens: 8192,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Génère le code HTML/Tailwind à partir du plan
 */
export async function generateCode(
  plan: TemplatePlan,
  processedImages?: ProcessedImage[],
): Promise<string> {
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

CRITICAL REQUIREMENTS:
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
${
  plan.imageAnalysis
    ? `11. Match the detected layout and components from image analysis: ${plan.imageAnalysis.components.join(', ')}`
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
