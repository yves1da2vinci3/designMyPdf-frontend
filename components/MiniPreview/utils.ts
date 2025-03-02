export const importFontCreation = (fonts: string[]): string => {
  if (fonts.length === 0) return '';
  try {
    const encodedFont = encodeURIComponent(fonts[0]);
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@100;200;300;400;500;600;700;800;900${fonts
      .slice(1)
      .map((font) => `&display=swap&family=${encodeURIComponent(font)}`)
      .join('')}`;
    return `<link rel="stylesheet" href="${fontUrl}" />`;
  } catch {
    return '';
  }
};

export const fontCssCreation = (fonts: string[]): string => {
  if (fonts.length === 0) return '';
  return `
    body {
      font-family: "${fonts[0]}", sans-serif;
    }
  `;
};
