import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.js'],
    include: ['test/**/*.test.js', 'api/controllers/__tests__/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['api/**/*.js'],
      exclude: [
        'node_modules/',
        'dist/',
        'cypress/',
        'public/',
        'scripts/',
        'test/',
        'test_backup*/',
        'config/',
        '*.config.js',
        'test/supabase-client/mocks/',
        'api/docs/**',
        'api/server.js',
        'api/app.js'
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80
      }
    },
    testTimeout: 10000,
    hookTimeout: 10000
  }
})
