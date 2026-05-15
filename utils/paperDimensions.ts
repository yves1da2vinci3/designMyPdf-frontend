/** Aligné sur le calcul des sauts de page dans Preview (96 CSS px / inch). */
export const CSS_PX_PER_MM = 96 / 25.4;

const PAPER_MM: Record<string, { widthMm: number; heightMm: number }> = {
  a1: { widthMm: 841, heightMm: 1189 },
  a2: { widthMm: 594, heightMm: 841 },
  a3: { widthMm: 420, heightMm: 594 },
  a4: { widthMm: 210, heightMm: 297 },
  a5: { widthMm: 148, heightMm: 210 },
  a6: { widthMm: 105, heightMm: 148 },
};

export function paperViewportCssPixels(
  paperSize: string,
  isLandscape: boolean,
): { width: number; height: number } {
  const key = (paperSize || 'a4').toLowerCase();
  const d = PAPER_MM[key] ?? PAPER_MM.a4;
  const widthMm = isLandscape ? d.heightMm : d.widthMm;
  const heightMm = isLandscape ? d.widthMm : d.heightMm;
  return {
    width: Math.round(widthMm * CSS_PX_PER_MM),
    height: Math.round(heightMm * CSS_PX_PER_MM),
  };
}
