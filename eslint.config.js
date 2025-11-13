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
      'no-implicit-globals': 'error',
      'no-unused-vars': ['error', { vars: 'all', args: 'none', ignoreRestSiblings: false }]
    }
  },
  {
    // Configuration for test files and backend files with underscore pattern
    files: [
      'tests/**/*.js',
      'tests/**/*.mjs',
      '**/*.test.js',
      '**/*.test.mjs',
      '**/*.spec.js',
      'test-*.js',
      'seed-*.js',
      'api/**/*.js',
      'scripts/**/*.js',
      'run-*.js'
    ],
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
      'no-restricted-globals': 'off', // Allow fetch in tests and backend
      'require-await': 'off' // Allow async functions without await in tests
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
    // Frontend contract enforcement
    files: [
      'public/**/*.js',
      '!public/js/shared/api-client.js',
      '!public/js/shared/api-types.js',
      '!public/sw.js'
    ],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message:
            'Direct fetch() calls are prohibited in frontend. Use api.getProducts(), api.createOrder(), etc. from the generated client.'
        },
        {
          name: 'XMLHttpRequest',
          message: 'XMLHttpRequest is prohibited. Use the generated API client instead.'
        }
      ],
      // 'no-restricted-syntax': [
      //   'error',
      //   {
      //     selector: 'Literal[value=/^https?:\\/\\//]',
      //     message:
      //       'Hardcoded API URLs are prohibited. Use the generated API client methods instead.'
      //   }
      // ],
      'no-restricted-imports': [
        'error',
        {
          name: 'axios',
          message: 'External HTTP libraries are prohibited. Use the generated API client instead.'
        }
      ]
    }
  },
  {
    // Service worker configuration - allow fetch and importScripts
    files: ['public/sw.js'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        importScripts: 'readonly',
        self: 'readonly'
      }
    },
    rules: {
      'no-restricted-globals': 'off',
      'no-restricted-imports': 'off'
    }
  },
  {
    // API client exception - allow fetch and HTTP patterns
    files: ['public/js/shared/api-client.js'],
    rules: {
      'no-restricted-globals': 'off',
      'no-restricted-syntax': 'off',
      'no-restricted-imports': 'off'
    }
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      'public/css/tailwind.css', // Generated file
      'public/js/shared/api-types.js', // TypeScript types file
      '*.config.js',
      'cleanup-test-products.js',
      'check-products.js',
      'insert-test-image.js',
      'populate-product-images.js',
      'test-product-images.js',
      'public/js/chart.min.js', // Minified chart.js file
      'public.backup.20251007_114453/', // Backup files
      'backups/**', // All backup files
      'backup/**', // Backup files (no 's')
      '**/*.backup', // Generic backup files
      'test-*.js', // Test files at root
      'seed-product-occasions-api.js', // Seed scripts
      'tests/**/*.mjs', // Test files using fetch (integration tests)
      'tests/orders.integration.test.js' // Integration test with fetch
    ]
  }
]
