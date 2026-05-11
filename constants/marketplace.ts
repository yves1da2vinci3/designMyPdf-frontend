export const MARKETPLACE_CATEGORIES = [
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'FINANCIAL REPORT', label: 'Financial Report' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'LEGAL', label: 'Legal' },
  { value: 'OTHER', label: 'Other' },
] as const;

/** @deprecated conservé pour compat ; la description marketplace n’a plus de longueur minimale. */
export const MIN_MARKETPLACE_DESCRIPTION_LENGTH = 0;

export function validateMarketplaceListingInput(params: {
  title: string;
  category: string | null;
}): string[] {
  const errors: string[] = [];
  if (!params.title.trim()) {
    errors.push('Le titre est obligatoire.');
  }
  if (!params.category) {
    errors.push('La catégorie est obligatoire.');
  }
  return errors;
}
