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
      exclude: [
        'node_modules/',
        'dist/',
        'cypress/',
        '*.config.js',
        'test/supabase-client/mocks/'
      ]
    },
    testTimeout: 10000,
    hookTimeout: 10000
  }
})
