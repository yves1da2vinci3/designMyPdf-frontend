import type { UiAnalysis } from './types';

/** Checklist textuelle injectée dans le 1er Coder pour forcer l’application de l’analyse. */
export function buildAnalysisChecklist(analysis: UiAnalysis): string {
  const lines: string[] = ['CHECKLIST OBLIGATOIRE (appliquer avant de répondre):'];
  if (analysis.dimensions_maquette) {
    lines.push(
      `- Dimensions cible: ${analysis.dimensions_maquette.width}×${analysis.dimensions_maquette.height}px`,
    );
  }
  if (analysis.couleurs_par_zone?.length) {
    lines.push('- Couleurs par zone:');
    for (const c of analysis.couleurs_par_zone) {
      lines.push(`  • ${c.zoneId}: ${c.hex} → ${c.tailwind}`);
    }
  } else if (analysis.palette_couleurs.length) {
    lines.push(`- Palette: ${analysis.palette_couleurs.join(', ')}`);
  }
  if (analysis.structure_dom.length) {
    lines.push('- Structure (ordre DOM):');
    for (const s of analysis.structure_dom) {
      lines.push(`  • ${s.id} (${s.role}): ${s.layout}`);
    }
  }
  if (analysis.espacements.length) {
    lines.push('- Espacements:');
    for (const e of analysis.espacements) {
      lines.push(`  • ${e.zone}: ${e.classes}`);
    }
  }
  if (analysis.bordures_et_ombres?.length) {
    lines.push('- Bordures et Ombres:');
    for (const b of analysis.bordures_et_ombres) {
      lines.push(`  • ${b.zone}: ${b.classes}`);
    }
  }
  if (analysis.icones && analysis.icones !== 'none') {
    lines.push(`- Icônes: ${analysis.icones} (CDN, data-lucide)`);
  }
  return lines.join('\n');
}
