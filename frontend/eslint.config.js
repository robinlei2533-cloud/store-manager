import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'output/**',
      'test-results/**',
      'backup_pre_p0.3/**',
      'manual-upload/**',
      '_*.cjs',
      '_*.js',
      '_*.mjs',
      'fix*.mjs',
      'fix*.jsx',
      'err*.txt',
    ],
  },
  {
    files: ['src/**/*.{js,jsx}', 'mvp-current.cjs', 'vite.config.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/static-components': 'off',
      'no-dupe-keys': 'warn',
      'no-useless-escape': 'warn',
      'react-hooks/set-state-in-effect': 'off',
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_|^React$',
        caughtErrorsIgnorePattern: '^_',
      }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
];
