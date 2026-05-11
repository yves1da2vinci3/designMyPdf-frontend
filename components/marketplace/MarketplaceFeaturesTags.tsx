import { TagsInput } from '@mantine/core';

export interface MarketplaceFeaturesTagsProps {
  label?: string;
  description?: string;
  placeholder?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}

/**
 * Saisie des fonctionnalités marketplace : une puce par entrée (Entrée, virgule ou point-virgule).
 */
export function MarketplaceFeaturesTags({
  label = 'Fonctionnalités',
  description = 'Validez chaque entrée avec Entrée, ou séparez par virgule / point-virgule.',
  placeholder = 'Ex. Tableaux dynamiques',
  value,
  onChange,
  disabled,
}: MarketplaceFeaturesTagsProps) {
  return (
    <TagsInput
      label={label}
      description={description}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      splitChars={[',', ';']}
      clearable
      disabled={disabled}
      maxTags={20}
    />
  );
}
