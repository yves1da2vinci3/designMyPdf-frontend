/** max_tokens sortie pour passes vision (HTML volumineux). */
export const IMAGE_VISION_MAX_OUTPUT_TOKENS = 16384;

const DEFAULT_BODY_ONLY_INSTRUCTION =
  "Reproduis l'UI de l'image en HTML Tailwind, fragment intérieur body uniquement, ni plus ni moins.";

/** Consigne par défaut si le message chat est vague (aligné test Claude direct). */
export function defaultBodyOnlyVisionInstruction(): string {
  return DEFAULT_BODY_ONLY_INSTRUCTION;
}

const VAGUE_MESSAGE_MAX_LEN = 48;
const BODY_KEYWORDS = /\b(body|corps|fragment|inside\s+body|intérieur)\b/i;

export function isVagueVisionMessage(message: string): boolean {
  const t = message.trim();
  if (t.length === 0) return true;
  if (t.length <= VAGUE_MESSAGE_MAX_LEN && !BODY_KEYWORDS.test(t)) return true;
  return false;
}

export function buildVisionUserPromptFromMessage(message: string): string {
  const trimmed = message.trim();
  if (isVagueVisionMessage(trimmed)) {
    return `${DEFAULT_BODY_ONLY_INSTRUCTION}\n\n${trimmed || 'Reproduis fidèlement la maquette.'}`;
  }
  return trimmed;
}

export function buildImageGenerationSystemPrompt(viewportHint: string): string {
  return `Tu es expert intégration HTML + Tailwind CSS + Handlebars pour templates PDF.

${viewportHint}

PROCÉDURE (obligatoire) :
1. Lis la ou les image(s) jointes : la maquette est la vérité pour layout, couleurs, typo, espacements.
2. Reproduis zone par zone (header, bandes, grilles, footer) sans simplifier ni réinventer la structure.
3. Couleurs : reprends les hex/rgb visibles ; typo : tailles et graisses proches de la maquette.
4. Fragment éditeur = contenu qui irait DANS <body> uniquement : pas de <!DOCTYPE>, <html>, <head>, ni balise <body>.
5. Un seul wrapper racine <div class="p-0"> … </div>.
6. HTML complet d'un seul tenant — zéro ellipse, zéro « reste du code ».
7. Handlebars {{variable}} seulement pour champs clairement dynamiques (noms, montants, dates) ; pas de picsum/placeholder forcé.
8. Tailwind libre (grid, gap, flex) si la maquette le montre.

SORTIE — à la fin de ta réponse, JSON valide uniquement (pas de markdown autour) :
{
  "html": "<fragment HTML complet non tronqué>",
  "suggestedVariables": { "nom_var": "valeur_exemple" }
}
Le champ html doit contenir tout le markup ; ne tronque pas pour tenir dans le JSON.`;
}

export function buildImageGenerationUserText(userPrompt: string): string {
  return `${userPrompt}

Rappel : priorité absolue à la fidélité visuelle de la maquette. Réponds avec le JSON demandé en fin de message.`;
}
