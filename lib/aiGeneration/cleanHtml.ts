import { formatEditorHtml } from './formatHtml';

export function cleanHtmlFromModel(raw: string): string {
  let template = raw.trim();
  if (template.startsWith('```html')) {
    template = template
      .replace(/^```html\n?/g, '')
      .replace(/```\s*$/g, '')
      .trim();
  } else if (template.startsWith('```')) {
    template = template
      .replace(/^```\n?/g, '')
      .replace(/```\s*$/g, '')
      .trim();
  }
  return template;
}

/** Extrait le contenu intérieur de <body> si le modèle renvoie un document complet. */
export function extractBodyInnerHtml(html: string): string {
  const trimmed = html.trim();
  if (!/<html[\s>]/i.test(trimmed) && !/<body[\s>]/i.test(trimmed)) {
    return trimmed;
  }

  const bodyMatch = trimmed.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch?.[1]) {
    return bodyMatch[1].trim();
  }

  return trimmed
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<\/?html[^>]*>/gi, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<\/?body[^>]*>/gi, '')
    .trim();
}

export function normalizeEditorHtmlFragment(raw: string): string {
  const fragment = extractBodyInnerHtml(cleanHtmlFromModel(raw));
  return formatEditorHtml(fragment);
}
