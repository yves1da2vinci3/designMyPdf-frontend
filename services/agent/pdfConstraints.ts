/**
 * Contraintes et documentation de survie pour le rendu PDF
 */

/**
 * Guide de survie PDF - Contraintes critiques pour le rendu
 */
export const PDF_SURVIVAL_GUIDE = `
CRITICAL PDF RENDERING CONSTRAINTS:
- NEVER use flex-gap (gap-*) → use margin utilities instead (space-*, margin-*)
- NEVER use position: sticky → use absolute or static positioning
- ALWAYS use @page margins for page breaks
- Avoid CSS Grid complex layouts → prefer flexbox with margins
- Use explicit widths/heights for tables
- Avoid backdrop-filter, clip-path (not supported by PDF renderers)
- Use rem/% units, avoid vh/vw for fonts
- Avoid CSS animations and transitions (not rendered in PDF)
- Use explicit colors, avoid CSS variables in some contexts
- Ensure all images have explicit dimensions
`;

/**
 * Patterns interdits dans le code généré
 */
export interface ValidationRule {
  pattern: RegExp;
  error: string;
  fix?: string;
  severity: 'error' | 'warning';
}

export const PDF_VALIDATION_RULES: ValidationRule[] = [
  {
    pattern: /gap-\d+/,
    error: 'flex-gap detected, use margins instead',
    fix: 'Replace gap-* with space-* or margin-* utilities',
    severity: 'error',
  },
  {
    pattern: /position:\s*sticky/i,
    error: 'sticky positioning not supported in PDF',
    fix: 'Use position: absolute or static',
    severity: 'error',
  },
  {
    pattern: /backdrop-filter/i,
    error: 'backdrop-filter not supported in PDF',
    fix: 'Remove or use opacity instead',
    severity: 'error',
  },
  {
    pattern: /clip-path/i,
    error: 'clip-path not supported in PDF',
    fix: 'Remove clip-path property',
    severity: 'error',
  },
  {
    pattern: /<div[^>]*>\s*[A-Z][^<]{10,}<\/div>/,
    error: 'div used for heading, use semantic h1-h6 tags',
    fix: 'Replace div with appropriate heading tag (h1, h2, etc.)',
    severity: 'warning',
  },
  {
    pattern: /vh|vw/,
    error: 'vh/vw units for fonts may cause issues in PDF',
    fix: 'Use rem, px, or % units instead',
    severity: 'warning',
  },
  {
    pattern: /animation:|transition:/i,
    error: 'Animations and transitions not rendered in PDF',
    fix: 'Remove animation/transition properties',
    severity: 'warning',
  },
];

/**
 * Patterns requis dans le code généré
 */
export interface RequiredPattern {
  pattern: RegExp;
  error: string;
  description: string;
}

export const PDF_REQUIRED_PATTERNS: RequiredPattern[] = [
  {
    pattern: /{{[^}]+}}/,
    error: 'missing Handlebars variables',
    description: 'Template must use Handlebars variables for dynamic content',
  },
  {
    pattern: /<img[^>]*src=["']{{[^}]+}}["']/,
    error: 'images should use Handlebars variables for src',
    description: 'All image sources must be dynamic using Handlebars',
  },
];

/**
 * Vérifie si le code respecte les contraintes PDF
 */
export function validatePDFConstraints(code: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fixes: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fixes: string[] = [];

  // Vérifier les patterns interdits
  for (const rule of PDF_VALIDATION_RULES) {
    const matches = code.match(rule.pattern);
    if (matches) {
      const message = `${rule.error} (found: ${matches[0]})`;
      if (rule.severity === 'error') {
        errors.push(message);
      } else {
        warnings.push(message);
      }
      if (rule.fix) {
        fixes.push(rule.fix);
      }
    }
  }

  // Vérifier les patterns requis
  for (const required of PDF_REQUIRED_PATTERNS) {
    if (!required.pattern.test(code)) {
      errors.push(required.error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixes,
  };
}

/**
 * Suggestions de remplacement pour les patterns interdits
 */
export const PDF_REPLACEMENTS: Record<string, string> = {
  'gap-2': 'space-x-2 space-y-2',
  'gap-4': 'space-x-4 space-y-4',
  'gap-6': 'space-x-6 space-y-6',
  'gap-8': 'space-x-8 space-y-8',
  'position: sticky': 'position: absolute',
  'backdrop-filter:': 'opacity:',
};

/**
 * Génère un prompt de correction basé sur les erreurs détectées
 */
export function generateCorrectionPrompt(
  code: string,
  errors: string[],
  warnings: string[],
): string {
  return `The following HTML/Tailwind code has been flagged for PDF compatibility issues:

CURRENT CODE:
\`\`\`html
${code}
\`\`\`

ERRORS TO FIX:
${errors.map((e) => `- ${e}`).join('\n')}

${warnings.length > 0 ? `WARNINGS:\n${warnings.map((w) => `- ${w}`).join('\n')}` : ''}

CRITICAL RULES:
${PDF_SURVIVAL_GUIDE}

Please correct the code to fix all errors while maintaining the same visual design and functionality. Return ONLY the corrected HTML code, no explanations.`;
}
