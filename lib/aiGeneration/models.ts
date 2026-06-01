const DEFAULT_TEXT = 'claude-haiku-4-5-20251001';
const DEFAULT_VISION = 'claude-haiku-4-5-20251001';

/** Modèle pour prompt texte seul. */
export function getAiTextModel(): string {
  return process.env.AI_MODEL_TEXT?.trim() || DEFAULT_TEXT;
}

/** Modèle pour vision / images / agent. */
export function getAiVisionModel(): string {
  return process.env.AI_MODEL_VISION?.trim() || process.env.AI_MODEL_TEXT?.trim() || DEFAULT_VISION;
}
