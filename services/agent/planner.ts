/**
 * Planificateur - Phase 1: Analyse la demande et crée un plan de structure
 */
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage } from '@langchain/core/messages';
import type { TemplatePlan, ProcessedImage } from './types';
import { formatImagesForClaude } from './imageProcessor';
import { findClosestTemplate } from './templateLibrary';

/**
 * Modèle Claude configuré pour la planification
 */
const model = new ChatAnthropic({
  modelName: 'claude-haiku-4-5-20251001',
  temperature: 0.3,
  maxTokens: 4096,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Génère un plan structuré à partir du prompt utilisateur et des images
 */
export async function planTemplate(
  userPrompt: string,
  processedImages?: ProcessedImage[],
): Promise<TemplatePlan> {
  // Construire le contenu du message
  const content: Array<{ type: string; text?: string; image_url?: string }> = [];

  // Ajouter les images si présentes
  if (processedImages && processedImages.length > 0) {
    const imageFormats = formatImagesForClaude(processedImages);
    content.push(...imageFormats);
  }

  // Ajouter le prompt texte
  const planningPrompt = `You are an expert UI/UX designer and system architect. Your task is to analyze the user's request and create a detailed plan for generating a PDF template.

${
  processedImages && processedImages.length > 0
    ? `IMAGES PROVIDED: The user has provided ${processedImages.length} image(s) for reference. Analyze these images carefully to extract:
- Visual structure and layout
- Color palette and dominant colors
- Typography hierarchy
- UI components (headers, tables, cards, etc.)
- Overall design style`
    : ''
}

USER REQUEST: ${userPrompt}

Your task is to create a structured plan in JSON format with the following structure:
{
  "documentType": "invoice" | "resume" | "report" | "other",
  "sections": [
    {
      "name": "header" | "body" | "footer" | "sidebar",
      "components": ["logo", "companyInfo", "table", "items", "totals", etc.],
      "style": {
        "backgroundColor": "tailwind color class",
        "padding": "tailwind padding class (p-0 for root wrapper; py-2 to py-4 for inner sections only)",
        "margin": "tailwind margin class",
        "border": "tailwind border class"
      }
    }
  ],
  "colorPalette": {
    "primary": "tailwind color class (e.g., blue-600)",
    "secondary": "tailwind color class (e.g., gray-900)",
    "accent": "tailwind color class (optional)",
    "background": "tailwind color class (e.g., white or gray-50)",
    "text": "tailwind color class (e.g., gray-900)"
  },
  "typography": {
    "headers": "tailwind text class (e.g., text-4xl font-bold)",
    "subheaders": "tailwind text class (e.g., text-xl font-semibold)",
    "body": "tailwind text class (e.g., text-base)",
    "labels": "tailwind text class (e.g., text-xs font-medium)"
  },
  "pdfConstraints": {
    "avoidFlexGap": true,
    "useMargins": true,
    "avoidSticky": true,
    "useExplicitWidths": true
  }
${
  processedImages && processedImages.length > 0
    ? `,
  "imageAnalysis": {
    "detectedColors": ["array of detected color names"],
    "layout": "description of layout structure",
    "components": ["list of detected UI components"]
  }`
    : ''
}
}

IMPORTANT:
- Use only Tailwind CSS classes
- Be specific about colors (use exact Tailwind classes like "blue-600", not just "blue")
- Identify all sections needed (header, body, footer, etc.)
- List all components that should be in each section
- Always set pdfConstraints to true for all constraints
- PADDING: Root wrapper MUST be p-0 (the preview scaffold already adds outer padding); inner sections use py-2 to py-4 or margin only — never stack p-* on nested containers
- COLORS: Use at most 5 Tailwind color classes (primary/neutral/surface/border/text); no gradients; no opacity modifiers
${
  processedImages && processedImages.length > 0
    ? '- Extract exact colors and layout from the provided images'
    : ''
}

Return ONLY valid JSON, no markdown, no explanations.`;

  content.push({
    type: 'text',
    text: planningPrompt,
  });

  // Appel au modèle
  const message = new HumanMessage({ content });
  const response = await model.invoke([message]);

  // Parser la réponse JSON
  let planData: any;
  try {
    const responseText = response.content.toString();
    // Nettoyer la réponse (enlever markdown code blocks si présents)
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    planData = JSON.parse(cleanedText);
  } catch (error) {
    console.error('Error parsing plan JSON:', error);
    // Plan par défaut en cas d'erreur
    planData = createDefaultPlan(userPrompt);
  }

  // Trouver le template de référence le plus proche
  const selectedTemplate = findClosestTemplate(planData);

  return {
    documentType: planData.documentType || 'other',
    sections: planData.sections || [],
    colorPalette: planData.colorPalette || {
      primary: 'blue-600',
      secondary: 'gray-900',
      background: 'white',
      text: 'gray-900',
    },
    typography: planData.typography || {
      headers: 'text-4xl font-bold',
      subheaders: 'text-xl font-semibold',
      body: 'text-base',
    },
    selectedTemplate: selectedTemplate?.id,
    pdfConstraints: {
      avoidFlexGap: planData.pdfConstraints?.avoidFlexGap ?? true,
      useMargins: planData.pdfConstraints?.useMargins ?? true,
      avoidSticky: planData.pdfConstraints?.avoidSticky ?? true,
      useExplicitWidths: planData.pdfConstraints?.useExplicitWidths ?? true,
    },
    imageAnalysis: planData.imageAnalysis,
  };
}

/**
 * Crée un plan par défaut en cas d'erreur de parsing
 */
function createDefaultPlan(userPrompt: string): any {
  // Détecter le type de document basé sur des mots-clés
  const lowerPrompt = userPrompt.toLowerCase();
  let documentType: 'invoice' | 'resume' | 'report' | 'other' = 'other';

  if (
    lowerPrompt.includes('invoice') ||
    lowerPrompt.includes('facture') ||
    lowerPrompt.includes('bill')
  ) {
    documentType = 'invoice';
  } else if (
    lowerPrompt.includes('resume') ||
    lowerPrompt.includes('cv') ||
    lowerPrompt.includes('curriculum')
  ) {
    documentType = 'resume';
  } else if (lowerPrompt.includes('report') || lowerPrompt.includes('rapport')) {
    documentType = 'report';
  }

  return {
    documentType,
    sections: [
      {
        name: 'header',
        components: ['title', 'subtitle'],
        style: {
          backgroundColor: 'white',
          padding: 'p-0',
          margin: 'mb-4',
        },
      },
      {
        name: 'body',
        components: ['content'],
        style: {
          backgroundColor: 'white',
          padding: 'py-3',
        },
      },
    ],
    colorPalette: {
      primary: 'blue-600',
      secondary: 'gray-900',
      background: 'white',
      text: 'gray-900',
    },
    typography: {
      headers: 'text-4xl font-bold',
      subheaders: 'text-xl font-semibold',
      body: 'text-base',
    },
    pdfConstraints: {
      avoidFlexGap: true,
      useMargins: true,
      avoidSticky: true,
      useExplicitWidths: true,
    },
  };
}
