const DEFAULT_TEXT = 'claude-3-5-sonnet-latest';
const DEFAULT_VISION = 'claude-3-5-sonnet-latest';

/** Modèle pour prompt texte seul. */
export function getAiTextModel(): string {
  return process.env.AI_MODEL_TEXT?.trim() || DEFAULT_TEXT;
}

/** Modèle pour vision / images / agent. */
export function getAiVisionModel(): string {
  return process.env.AI_MODEL_VISION?.trim() || process.env.AI_MODEL_TEXT?.trim() || DEFAULT_VISION;
}
