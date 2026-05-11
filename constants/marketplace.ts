export const MARKETPLACE_CATEGORIES = [
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'FINANCIAL REPORT', label: 'Financial Report' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'LEGAL', label: 'Legal' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const MIN_MARKETPLACE_DESCRIPTION_LENGTH = 80;

export function validateMarketplaceListingInput(params: {
  title: string;
  category: string | null;
  description: string;
  /** URL distante déjà enregistrée (pas blob:) */
  coverImageUrl: string;
  /** Image choisie en local, upload Backblaze au submit */
  hasPendingCoverFile?: boolean;
  featuresRaw: string;
}): string[] {
  const errors: string[] = [];
  if (!params.title.trim()) {
    errors.push('Le titre est obligatoire.');
  }
  if (!params.category) {
    errors.push('La catégorie est obligatoire.');
  }
  if (params.description.trim().length < MIN_MARKETPLACE_DESCRIPTION_LENGTH) {
    errors.push(
      `La description doit contenir au moins ${MIN_MARKETPLACE_DESCRIPTION_LENGTH} caractères (actuellement ${params.description.trim().length}).`,
    );
  }
  if (!params.coverImageUrl.trim() && !params.hasPendingCoverFile) {
    errors.push("L'image de couverture est obligatoire.");
  }
  const feats = params.featuresRaw
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);
  if (feats.length === 0) {
    errors.push('Au moins une fonctionnalité est requise (liste séparée par des virgules).');
  }
  return errors;
}
