import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
// import prettier from 'prettier';
import prettierConfig from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

/**@type {import('eslint').Linter.config[]} */
export default defineConfig([
  { ignores: ['dist/**', 'node_modules/**'] },
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts}'] },
  { languageOptions: { globals: globals.node } },
  js.configs.recommended,
  tseslint.configs.recommended,
  prettierConfig,
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
]);
