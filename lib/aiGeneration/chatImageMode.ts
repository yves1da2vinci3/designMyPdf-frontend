/** Indique si les images jointes déclenchent le pipeline vision. */
export function willSendImagesToModel(attachedImageCount: number): boolean {
  return attachedImageCount > 0;
}

export function getChatImageModeHint(
  attachedImageCount: number,
  visualQualityEnabled = false,
): string {
  if (!willSendImagesToModel(attachedImageCount)) {
    return 'Mode édition texte — aucune image ne sera envoyée au modèle.';
  }
  if (visualQualityEnabled) {
    return 'Mode qualité : vision + capture + critique visuelle (1 affinage max, plus de crédits).';
  }
  return 'Génération depuis image : 1 passe vision (la maquette prime sur le toggle orientation).';
}

/** Affichage budget IA : API renvoie des crédits (plafond typique 1000 / mois). */
export function formatAiBudgetLabel(remaining: number, limit: number): string {
  const fmt = (n: number) => n.toFixed(2);
  return `${fmt(remaining)} crédits restants / ${fmt(limit)} ce mois`;
}
