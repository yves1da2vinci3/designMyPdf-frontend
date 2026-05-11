/** ESLint minimal : Next.js + Jest ; style laissé à Prettier / éditeur. */
module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  rules: {
    // Style / formatage (bruyant, peu de valeur sur le bug)
    '@typescript-eslint/quotes': 'off',
    '@typescript-eslint/comma-spacing': 'off',
    'max-len': 'off',
    'react/jsx-first-prop-new-line': 'off',
    'react/jsx-max-props-per-line': 'off',
    'react/jsx-tag-spacing': 'off',
    'react/jsx-curly-brace-presence': 'off',
    'react/jsx-quotes': 'off',
    'react/jsx-no-comment-textnodes': 'off',
    'react/no-unescaped-entities': 'off',
    'import/newline-after-import': 'off',
  },
  overrides: [
    {
      files: ['**/*.test.{ts,tsx}', '**/tests/**/*.{ts,tsx}'],
      env: { jest: true },
    },
  ],
};
