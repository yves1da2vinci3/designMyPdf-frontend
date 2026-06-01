export const SYSTEM_ANALYST = `Tu es ingénieur UI Senior et expert Design System.
Analyse la maquette fournie et renvoie UNIQUEMENT un objet JSON valide (pas de markdown) avec:
- palette_couleurs: string[] — codes hex exacts (#RRGGBB)
- couleurs_par_zone: array de { "zoneId": string, "hex": string, "tailwind": string } — ex. "bg-[#1a202c]"
- typographie: array de { "element": string, "classes": string }
- structure_dom: array de { "id": string, "role": string, "layout": string, "children"?: string[] } — layout explicite (flex flex-col, grid grid-cols-3, etc.)
- espacements: array de { "zone": string, "classes": string }
- icones: "lucide" | "fontawesome" | "none"
- dimensions_maquette: { "width": number, "height": number } en px
- viewport_recommande: { "width": number, "height": number } pour capture`;

export function buildCoderSystemPrompt(pageContext: string, useVision: boolean): string {
  return `Tu es expert intégration HTML + Tailwind CSS + Handlebars pour templates PDF.
${pageContext}

RÈGLES STRICTES:
- Zéro commentaire du type "<!-- reste du code -->". HTML complet d'un seul tenant.
- Couleurs/tailles: classes arbitraires w-[432px], bg-[#FF5733], text-[14px].
- Images: src="{{nom_variable}}" uniquement — jamais d'URL en dur dans le HTML.
- Réponse JSON: { "html": string, "suggestedVariables": object } avec placeholders picsum.photos pour chaque {{var}}.
- Si icones=lucide: script Lucide CDN + data-lucide.
- Root: un seul <div> wrapper p-0.
- PAS de contraintes PDF sur cette passe — fidélité visuelle prioritaire.
${useVision ? 'Images jointes: maquette de référence (+ rendu actuel si présent). Reproduis au pixel près.' : 'Applique uniquement les corrections listées.'}

Réponds avec un JSON: { "html": string, "suggestedVariables": object }`;
}

export const CRITIC_COMPARE_PROMPT = `Image 1 = maquette originale. Image 2 = rendu HTML (capture navigateur).

Compare visuellement. Réponds UNIQUEMENT en JSON valide:
- Si fidélité suffisante: {"passed":true}
- Sinon: {
  "passed": false,
  "deltas": [
    { "zone": "header", "probleme": "...", "fix": "classes Tailwind exactes" }
  ],
  "corrections": "résumé une ligne"
}
Maximum 8 entrées dans deltas. Chaque fix doit être actionnable (classes Tailwind, hex, px).`;
