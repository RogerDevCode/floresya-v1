import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.js',
        '**/types/**'
      ]
    },
    include: ['src/**/*.{test,spec}.js'],
    setupFiles: []
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})