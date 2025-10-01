import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Environment
    environment: 'node', // Backend tests use node, frontend tests will use happy-dom
    globals: true, // Use global test APIs (describe, it, expect)

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '*.config.js',
        'test-*.js',
        'cleanup-*.js',
        'check-*.js',
        'insert-*.js',
        'populate-*.js',
        '.husky/',
        'api/docs/'
      ]
    },

    // Test patterns
    include: ['**/__tests__/**/*.test.js', '**/*.test.js'],
    exclude: ['node_modules', 'dist'],

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Reporters
    reporters: ['verbose']
  }
})
