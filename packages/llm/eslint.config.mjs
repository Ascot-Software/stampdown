import rootConfig from '../../eslint.config.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  ...rootConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['src/__tests__/*.test.ts'],
        },
        tsconfigRootDir: __dirname,
      },
    },
  },
];
