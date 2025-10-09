/**
 * Vitest Configuration for FloresYa
 * Configuración para entorno de testing con ES modules
 */

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Entorno de testing
    environment: 'node',

    // Configuración de módulos ES
    esbuild: {
      target: 'node20'
    },

    // Setup global para tests
    setupFiles: ['./tests/setup.js'],

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
        '**/*.d.ts',
        '**/*.config.js',
        '**/*.config.mjs',
        'api/config/',
        'public/js/components/__tests__/',
        'api/controllers/__tests__/',
        'api/services/__tests__/'
      ],
      include: ['api/**/*.js', 'public/**/*.js'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },

    // Test timeout
    testTimeout: 15000,

    // Hook timeout (for beforeAll, afterAll, beforeEach, afterEach)
    hookTimeout: 20000,

    // Reporter configuration
    reporter: ['verbose', 'json', 'html'],

    // Output file for test results
    outputFile: 'test-results/.last-run.json',

    // Global test configuration
    globals: true,

    // Include patterns
    include: [
      'tests/**/*.test.js',
      'tests/**/*.test.mjs',
      'api/**/*.test.js',
      'api/**/*.test.mjs',
      'public/**/*.test.js',
      'public/**/*.test.mjs'
    ],

    // Exclude patterns
    exclude: [
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
      'coverage/**',
      'tests/e2e/**' // E2E tests should be run with Playwright, not Vitest
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
