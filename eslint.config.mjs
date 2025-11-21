import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import tsdoc from 'eslint-plugin-tsdoc';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import js from '@eslint/js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // Global ignores
  {
    ignores: ['**/dist/', '**/node_modules/', '**/coverage/', '**/*.md', '**/jest.config.js'],
  },
  // ESLint recommended for all files
  js.configs.recommended,
  // TypeScript ESLint configs only for TypeScript files
  {
    files: ['**/*.ts'],
    ...typescriptEslint.configs['flat/recommended'][0],
    ...typescriptEslint.configs['flat/recommended-type-checked'][0],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier,
      tsdoc,
    },
    rules: {
      // Disable standard rules that have TypeScript equivalents
      'no-unused-vars': 'off',

      // Prettier
      'prettier/prettier': 'error',

      // TypeScript ESLint rules
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  // JavaScript files (like .mjs configs)
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];
