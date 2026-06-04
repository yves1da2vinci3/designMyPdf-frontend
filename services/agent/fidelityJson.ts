import type { CriticDelta, UiAnalysis } from './types';

export function stripJsonFences(raw: string): string {
  let text = raw.trim();
  if (text.startsWith('```')) {
    text = text
      .replace(/^```(?:json)?\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim();
  }
  return text;
}

export function parseUiAnalysis(raw: string): UiAnalysis {
  const parsed = JSON.parse(stripJsonFences(raw)) as UiAnalysis;
  if (!Array.isArray(parsed.palette_couleurs)) parsed.palette_couleurs = [];
  if (!Array.isArray(parsed.typographie)) parsed.typographie = [];
  if (!Array.isArray(parsed.structure_dom)) parsed.structure_dom = [];
  if (!Array.isArray(parsed.espacements)) parsed.espacements = [];
  if (!Array.isArray(parsed.couleurs_par_zone)) parsed.couleurs_par_zone = [];
  if (!Array.isArray(parsed.bordures_et_ombres)) parsed.bordures_et_ombres = [];
  return parsed;
}

export function parseCoderResponse(raw: string): {
  html: string;
  suggestedVariables: Record<string, unknown>;
} {
  const text = stripJsonFences(raw);
  try {
    const parsed = JSON.parse(text) as {
      html?: string;
      suggestedVariables?: Record<string, unknown>;
    };
    if (parsed.html) {
      return {
        html: parsed.html,
        suggestedVariables: parsed.suggestedVariables ?? {},
      };
    }
  } catch {
    // raw HTML
  }
  return { html: text, suggestedVariables: {} };
}

export function parseCriticResponse(raw: string): {
  passed: boolean;
  corrections?: string;
  deltas?: CriticDelta[];
} {
  const parsed = JSON.parse(stripJsonFences(raw)) as {
    passed?: boolean;
    corrections?: string;
    deltas?: CriticDelta[];
  };
  const deltas = Array.isArray(parsed.deltas) ? parsed.deltas.slice(0, 8) : undefined;
  return {
    passed: Boolean(parsed.passed),
    corrections: parsed.corrections,
    deltas,
  };
}

export function formatDeltasForCoder(deltas: CriticDelta[]): string {
  return deltas.map((d, i) => `${i + 1}. [${d.zone}] ${d.probleme} → FIX: ${d.fix}`).join('\n');
}
