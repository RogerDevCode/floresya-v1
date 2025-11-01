/**
 * Vitest Configuration for FloresYa
 * Unified configuration for all unit and integration tests
 */

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Environment
    environment: 'node', // Backend tests use node, frontend tests will use happy-dom

    // Setup files
    setupFiles: ['./tests/setup.js'],

    // Global test configuration - disable to avoid conflicts with Playwright
    globals: false, // Changed to false to avoid Symbol conflicts

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'test-results/',
        'playwright-report/',
        'coverage/',
        '*.d.ts',
        '*.config.js',
        '*.config.mjs',
        'api/config/',
        'api/docs/',
        'mcp-*.js',
        'public/js/components-standalone.js',
        'public/js/demo-*.js',
        'public/js/utils-standalone.js'
      ],
      include: ['api/**/*.js', 'public/**/*.js'],
      thresholds: {
        global: {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60
        }
      }
    },

    // Test timeout
    testTimeout: 15000,

    // Hook timeout
    hookTimeout: 20000,

    // Reporter configuration
    reporters: ['verbose'],

    // Include patterns
    include: [
      'tests/**/*.test.js',
      'tests/**/*.test.mjs',
      'api/**/*.test.js',
      'api/**/*.test.mjs',
      'public/**/*.test.js'
    ],

    // Exclude patterns - IMPORTANT: Exclude E2E tests
    exclude: [
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
      'coverage/**',
      'tests/e2e/**', // E2E tests should be run with Playwright only
      'tests/integration/**/*.test.mjs', // Use .js files instead
      '**/*.integration.test.mjs'
    ]
  },

  // Resolver configuration for ES modules
  resolve: {
    alias: {
      '@': './',
      '@api': './api',
      '@public': './public'
    }
  }
})
