export function importFontCreation(fonts: string[]): string {
  try {
    const encodedFont = encodeURIComponent(fonts[0]);
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@100;200;300;400;500;600;700;800;900${fonts
      .slice(1)
      .map((font) => `&display=swap&family=${encodeURIComponent(font)}`)}`;
    return `<link key="font-import" rel="stylesheet" href="${fontUrl}" />`;
  } catch (error) {
    return '';
  }
}

export function fontCssCreation(fonts: string[]): string {
  return `
    body {
      font-family: '${fonts[0]}', sans-serif;
    }
  `;
} 