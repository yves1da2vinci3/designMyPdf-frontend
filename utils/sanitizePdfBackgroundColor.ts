/**
 * Valeur sûre pour injection dans du CSS (preview iframe, export PDF HTML).
 * N’accepte que les hex courts / longs ; sinon repli blanc.
 */
export function sanitizePdfBackgroundColor(input: string | undefined): string {
  if (!input || typeof input !== 'string') return '#ffffff';
  const t = input.trim();
  if (/^#[0-9A-Fa-f]{3}$/.test(t)) return t;
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t;
  if (/^#[0-9A-Fa-f]{8}$/.test(t)) return t;
  return '#ffffff';
}
