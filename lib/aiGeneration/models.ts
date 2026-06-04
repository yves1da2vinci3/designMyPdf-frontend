/** Édition texte / génération sans image — Haiku (coût faible). */
const DEFAULT_TEXT = 'claude-haiku-4-5-20251001';

/** Maquette → HTML, vision, mode qualité — Sonnet (meilleure fidélité image). */
const DEFAULT_VISION = 'claude-sonnet-4-20250514';

/** Modèle pour prompt texte seul (modif HTML, génération sans image, improve-template). */
export function getAiTextModel(): string {
  return process.env.AI_MODEL_TEXT?.trim() || DEFAULT_TEXT;
}

/** Modèle pour vision / images (repli sur AI_MODEL_TEXT seulement si VISION est vide). */
export function getAiVisionModel(): string {
  return process.env.AI_MODEL_VISION?.trim() || process.env.AI_MODEL_TEXT?.trim() || DEFAULT_VISION;
}
