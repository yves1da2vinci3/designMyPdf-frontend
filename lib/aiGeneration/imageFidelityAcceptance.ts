/**
 * Référence A/B : même image + même consigne que test Claude direct.
 * Usage manuel : joindre la maquette, envoyer uniquement ACCEPTANCE_USER_PHRASE (ou message vide).
 */
import {
  buildImageGenerationSystemPrompt,
  buildImageGenerationUserText,
  defaultBodyOnlyVisionInstruction,
  buildVisionUserPromptFromMessage,
} from './imageGenerationPrompt';
import { buildImageViewportHint } from './pdfPromptContext';

/** Phrase canonique du test utilisateur hors produit. */
export const ACCEPTANCE_USER_PHRASE =
  "Reproduis l'UI de l'image en HTML Tailwind, fragment intérieur body uniquement, ni plus ni moins.";

export function getAcceptanceVisionUserPrompt(message = ''): string {
  return buildVisionUserPromptFromMessage(message || ACCEPTANCE_USER_PHRASE);
}

/** Payload texte pour comparer prompts DMP vs Claude (sans images). */
export function getAcceptancePromptSnapshot(options?: {
  format?: string;
  isLandscape?: boolean;
  pdfContentPadding?: string;
  userMessage?: string;
}): {
  system: string;
  userText: string;
  mustNotContain: string[];
} {
  const format = options?.format ?? 'a4';
  const isLandscape = options?.isLandscape ?? false;
  const viewportHint = buildImageViewportHint(format, isLandscape, options?.pdfContentPadding);
  const userPrompt = getAcceptanceVisionUserPrompt(options?.userMessage ?? '');
  return {
    system: buildImageGenerationSystemPrompt(viewportHint),
    userText: buildImageGenerationUserText(userPrompt),
    mustNotContain: ['LANDSCAPE LAYOUT (MANDATORY)', 'grid-cols-2'],
  };
}

export { defaultBodyOnlyVisionInstruction };
