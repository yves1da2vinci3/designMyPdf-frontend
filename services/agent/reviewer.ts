/**
 * Reviewer - Phase 3: Valide et corrige le code généré
 */
import { HumanMessage } from '@langchain/core/messages';
import type { TemplatePlan, ReviewedCode, AgentGenerationOptions } from './types';
import {
  validatePDFConstraints,
  validateOrientationConstraints,
  generateCorrectionPrompt,
} from './pdfConstraints';
import { createChatAnthropic } from './anthropicClient';
import { getAiTextModel } from '@/lib/aiGeneration/models';

/**
 * Révision et correction du code généré
 */
export async function reviewAndCorrect(
  code: string,
  plan: TemplatePlan,
  options?: AgentGenerationOptions,
): Promise<ReviewedCode> {
  const model = createChatAnthropic(false, options?.apiKey);
  const validation = validatePDFConstraints(code);
  const orientationCheck = validateOrientationConstraints(
    code,
    plan.recommendedPageOrientation === 'landscape' || options?.isLandscape === true,
    options?.format || 'a4',
    options?.isLandscape === true || plan.recommendedPageOrientation === 'landscape',
  );
  validation.warnings.push(...orientationCheck.warnings);

  // Si le code est valide, retourner directement
  if (validation.isValid && validation.warnings.length === 0) {
    return {
      correctedCode: code,
      corrections: [],
      isValid: true,
    };
  }

  // Si des erreurs sont détectées, corriger avec LLM
  if (validation.errors.length > 0) {
    const correctionPrompt = generateCorrectionPrompt(code, validation.errors, validation.warnings);

    const message = new HumanMessage({
      content: correctionPrompt,
    });

    const response = await model.invoke([message]);
    const meta = response.response_metadata as
      | { usage?: { input_tokens?: number; output_tokens?: number } }
      | undefined;
    let correctedCode = response.content.toString().trim();

    // Nettoyer le code
    if (correctedCode.startsWith('```html')) {
      correctedCode = correctedCode
        .replace(/^```html\n?/g, '')
        .replace(/```\s*$/g, '')
        .trim();
    } else if (correctedCode.startsWith('```')) {
      correctedCode = correctedCode
        .replace(/^```\n?/g, '')
        .replace(/```\s*$/g, '')
        .trim();
    }

    // Re-valider le code corrigé
    const revalidation = validatePDFConstraints(correctedCode);

    return {
      correctedCode,
      corrections: validation.errors,
      isValid: revalidation.isValid,
      warnings: [...validation.warnings, ...revalidation.warnings],
      usage: {
        model: getAiTextModel(),
        inputTokens: meta?.usage?.input_tokens ?? 0,
        outputTokens: meta?.usage?.output_tokens ?? 0,
      },
    };
  }

  // Seulement des warnings, pas d'erreurs
  return {
    correctedCode: code,
    corrections: [],
    isValid: true,
    warnings: validation.warnings,
  };
}

/**
 * Vérifie la structure sémantique du code
 */
export function validateSemanticStructure(code: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Vérifier l'utilisation de div pour les titres
  const divHeadingPattern = /<div[^>]*>\s*[A-Z][^<]{10,}<\/div>/g;
  const divHeadings = code.match(divHeadingPattern);
  if (divHeadings) {
    issues.push('Found div elements used as headings. Use semantic h1-h6 tags instead.');
  }

  // Vérifier la présence de variables Handlebars
  const handlebarsPattern = /{{[^}]+}}/;
  if (!handlebarsPattern.test(code)) {
    issues.push('No Handlebars variables found. Template should use dynamic variables.');
  }

  // Vérifier les images avec variables
  const imagePattern = /<img[^>]*src=["']{{[^}]+}}["']/;
  const allImages = code.match(/<img[^>]*>/g);
  if (allImages) {
    const imagesWithoutVars = allImages.filter((img) => !imagePattern.test(img));
    if (imagesWithoutVars.length > 0) {
      issues.push('Some images do not use Handlebars variables for src attribute.');
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
