// Note: In production, this would import from @npm-questionpro/eslint-config-backend
// For this assignment, we provide a standard ESLint configuration

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: '.',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': '@typescript-eslint/eslint-plugin',
      prettier: 'eslint-plugin-prettier',
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
      'prettier/prettier': 'error',
      'no-console': ['warn', {allow: ['warn', 'error']}],
    },
  },
  {
    ignores: ['node_modules', 'dist', 'coverage', 'coverage-e2e'],
  },
];
