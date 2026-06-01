/** Indique si les images jointes déclenchent le pipeline vision. */
export function willSendImagesToModel(attachedImageCount: number): boolean {
  return attachedImageCount > 0;
}

export function getChatImageModeHint(attachedImageCount: number): string {
  if (!willSendImagesToModel(attachedImageCount)) {
    return 'Mode édition texte — aucune image ne sera envoyée au modèle.';
  }
  return 'Génération depuis image : une passe vision (maquette → HTML).';
}

/** Affichage budget IA : API renvoie des crédits (plafond typique 1000 / mois). */
export function formatAiBudgetLabel(remaining: number, limit: number): string {
  const fmt = (n: number) => n.toFixed(2);
  return `${fmt(remaining)} crédits restants / ${fmt(limit)} ce mois`;
}
