const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/', 'client/'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'app.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      eqeqeq: 'error',
      'no-var': 'error',
      'prefer-const': 'warn',
    },
  },
];
