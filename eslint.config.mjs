import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/.next/**',
    '**/.turbo/**',
    '**/dist/**',
    '**/coverage/**',
    '**/build/**',
    'next-env.d.ts',
  ]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/access-state-in-render': 'off',
      'react-hooks/use-lazy-value': 'off',
      'react-hooks/no-destructured-state-setter': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/disabled-component-ref': 'off',
      'react-hooks/hook-references-in-render': 'off',
      'react-hooks/initialized-state-in-render': 'off',
      'react-hooks/check-render-stability': 'off',
      'react-hooks/render-stability': 'off',
      'react-hooks/no-declarative-identifiers': 'off',
    },
  },
]);
