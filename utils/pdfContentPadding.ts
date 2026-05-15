/** Aligné sur `dmd_backend/utils/pdf_padding.go`. */

export const DEFAULT_PDF_CONTENT_PADDING = '2rem';

const PDF_CONTENT_PADDING_VALUE_RE = /^(\d+(\.\d+)?|\.\d+)(px|rem|mm|cm|%)$/i;

export function isPdfContentPaddingValid(input: string | undefined): boolean {
  if (input === undefined || input.trim() === '') return true;
  const t = input.trim();
  const low = t.toLowerCase();
  if (low === '0' || low === 'none') return true;
  return PDF_CONTENT_PADDING_VALUE_RE.test(t);
}

/** Valeur CSS sûre pour `padding` sur `.content` (export + preview). */
export function resolvedPdfContentPaddingCss(input: string | undefined): string {
  if (input === undefined || input.trim() === '') return DEFAULT_PDF_CONTENT_PADDING;
  const t = input.trim();
  const low = t.toLowerCase();
  if (low === '0' || low === 'none') return '0';
  if (PDF_CONTENT_PADDING_VALUE_RE.test(t)) return t;
  return DEFAULT_PDF_CONTENT_PADDING;
}
