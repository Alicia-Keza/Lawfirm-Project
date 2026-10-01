const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['server.js', 'eslint.config.js', 'src/**/*.js', 'scripts/**/*.js', 'tests/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node
    }
  },
  {
    files: ['public/js/**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: globals.browser
    }
  },
  {
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_|^next$' }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always']
    }
  }
];
