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
    // Configuration for test files
    files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    },
    rules: {
      'no-undef': 'off', // Disable no-undef for test globals
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },
  {
    // Configuration for minified JS files
    files: ['**/*.min.js'],
    rules: {
      'no-undef': 'off', // Disable no-undef for minified files
      eqeqeq: 'off', // Disable eqeqeq for minified files
      'no-unreachable': 'off', // Disable unreachable code for minified files
      'prefer-const': 'off', // Disable prefer-const for minified files
      'no-var': 'off', // Disable no-var for minified files
      'no-unused-vars': 'off', // Disable unused vars for minified files
      'no-self-assign': 'off', // Disable self-assign for minified files
      'no-empty': 'off', // Disable empty block for minified files
      'no-fallthrough': 'off' // Disable fallthrough for minified files
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
      'test-product-images.js',
      'public/js/chart.min.js' // Minified chart.js file
    ]
  }
]
