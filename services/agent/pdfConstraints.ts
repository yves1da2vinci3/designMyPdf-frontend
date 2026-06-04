/**
 * Contraintes et documentation de survie pour le rendu PDF
 */
import { getContentAreaWidthPx } from '@/utils/pdfPageLayout';

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

export const TEMPLATE_DESIGN_GUIDE = `
DESIGN CONSTRAINTS FOR PDF TEMPLATES:
- Padding: the root wrapper MUST use p-0 (the preview scaffold already adds 2rem/10mm padding around it); inner sections use py-6 to py-12 for better whitespace; NEVER add p-* on the outermost div
- Spacing between sections: use space-y-8 to space-y-12 or margin mb-8 to mb-12 for a premium feel; NEVER gap-*
- Colors: Use professional palettes (e.g., slate-900 for text, blue-600 for accents). Subtle gradients are allowed if they enhance the professional look (e.g., from-slate-50 to-white).
- Typography: Focus on hierarchy. Use font-bold for headings, tracking-tight for titles, and leading-relaxed for body text.
- Hover/animation: NEVER use hover:, transition-, scale-, translate- (not rendered in PDF).
- Container: max-w-4xl or max-w-5xl mx-auto; avoid max-w-7xl (too wide for A4).
- Cards: Use rounded-2xl or rounded-3xl for a modern look. Subtle shadows (shadow-sm or shadow-md) are allowed.
- Quality: Aim for "Apple-style" or "Modern SaaS" aesthetic: generous whitespace, refined typography, and subtle borders (border-slate-100).
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
 * Avertit si le HTML semble trop large pour une page portrait.
 */
export function validateOrientationConstraints(
  code: string,
  targetLandscape: boolean,
  paperSize: string,
  effectiveLandscape: boolean,
): { warnings: string[] } {
  const warnings: string[] = [];
  if (effectiveLandscape || targetLandscape) return { warnings };

  const contentWidth = getContentAreaWidthPx(paperSize, false);
  const threshold = contentWidth * 0.9;
  const minWidthRe = /min-w-\[(\d+)px\]|w-\[(\d+)px\]/g;
  let m: RegExpExecArray | null;
  while ((m = minWidthRe.exec(code)) !== null) {
    const px = parseInt(m[1] || m[2], 10);
    if (px >= threshold) {
      warnings.push(
        `Fixed width ${px}px may overflow portrait page (~${contentWidth}px content width). Use landscape or reduce width.`,
      );
      break;
    }
  }
  if (/grid-cols-3|grid-cols-4/.test(code) && !targetLandscape) {
    warnings.push(
      'Multi-column grid (3+) may be too wide for portrait PDF; consider landscape orientation.',
    );
  }
  return { warnings };
}

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
