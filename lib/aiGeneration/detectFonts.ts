/** Extrait noms de polices Google/fonts depuis HTML généré pour libellé stepper. */
export function detectFontNamesFromHtml(html: string): string[] {
  const fonts = new Set<string>();
  const familyRe = /font-family:\s*['"]?([^;'"]+)['"]?/gi;
  let m: RegExpExecArray | null;
  while ((m = familyRe.exec(html)) !== null) {
    const name = m[1].split(',')[0].trim().replace(/['"]/g, '');
    if (name && !/inherit|sans-serif|serif|monospace/i.test(name)) {
      fonts.add(name);
    }
  }
  const classRe = /font-\[family-name:['"]?([^'"\]]+)['"]?\]/gi;
  while ((m = classRe.exec(html)) !== null) {
    fonts.add(m[1].trim());
  }
  return Array.from(fonts).slice(0, 4);
}

export function fontsStepLabel(html: string): string {
  const names = detectFontNamesFromHtml(html);
  if (names.length === 0) return 'Polices du template';
  return `Ajout des polices ${names.join(', ')}`;
}
