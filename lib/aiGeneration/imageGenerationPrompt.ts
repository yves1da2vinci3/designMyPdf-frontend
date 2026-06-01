/** Prompt minimal pour génération image en une passe (sans contraintes PDF lourdes). */
export function buildSinglePassImagePrompt(userPrompt: string, pageContext: string): string {
  return `Tu es expert intégration HTML + Tailwind CSS + Handlebars pour templates.

${pageContext}

Demande utilisateur:
${userPrompt}

OBJECTIF: reproduire fidèlement la ou les maquette(s) jointe(s) (layout, couleurs, typographie, espacements).

SORTIE OBLIGATOIRE — JSON valide uniquement (pas de markdown):
{
  "html": "<fragment HTML>",
  "suggestedVariables": { "nom_var": "valeur_exemple" }
}

RÈGLES HTML:
- Fragment pour l'éditeur = contenu qui irait DANS <body>, PAS de <!DOCTYPE>, <html>, <head> ni <body>.
- Un seul wrapper racine <div class="p-0"> … </div>.
- HTML complet d'un seul tenant, zéro ellipse ou commentaire du type "reste du code".
- Images dynamiques: src="{{nom_variable}}" uniquement (jamais d'URL en dur).
- Handlebars pour tout contenu variable; suggestedVariables avec exemples réalistes.
- Tailwind libre (gap, grid, etc. autorisés si la maquette le demande).
- Pas de contraintes PDF sur cette passe — priorité fidélité visuelle à la maquette.`;
}
