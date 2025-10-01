import js from '@eslint/js'
import globals from 'globals'

/**
 * ESLint 9 Flat Config - Code Quality Only
 * Formatting is handled by Prettier (no overlap)
 */
export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      }
    },
    rules: {
      // Code Quality & Best Practices
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off', // Allowed for backend logging
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-imports': 'error',
      'no-self-compare': 'error',
      'no-throw-literal': 'error',
      'no-useless-return': 'warn',
      'require-await': 'warn',
      'no-implicit-globals': 'error'
    }
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      'public/css/tailwind.css', // Generated file
      '*.config.js',
      'cleanup-test-products.js',
      'check-products.js',
      'insert-test-image.js',
      'populate-product-images.js',
      'test-product-images.js'
    ]
  }
]
