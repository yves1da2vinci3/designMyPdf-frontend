/**
 * Reviewer - Phase 3: Valide et corrige le code généré
 */
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage } from '@langchain/core/messages';
import type { TemplatePlan, ReviewedCode } from './types';
import {
  validatePDFConstraints,
  generateCorrectionPrompt,
  PDF_SURVIVAL_GUIDE,
} from './pdfConstraints';

/**
 * Modèle Claude configuré pour la révision
 */
const model = new ChatAnthropic({
  modelName: 'claude-3-haiku-20240307',
  temperature: 0.2, // Plus déterministe pour la correction
  maxTokens: 8192,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Révision et correction du code généré
 */
export async function reviewAndCorrect(code: string, plan: TemplatePlan): Promise<ReviewedCode> {
  // Validation automatique des contraintes PDF
  const validation = validatePDFConstraints(code);

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
