import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration for FloresYa E2E Tests
 * Modern, fast, and reliable E2E testing
 */
export default defineConfig({
  // Test directory - Solo smoke tests por defecto
  testDir: './e2e-tests',
  testMatch: 'smoke.spec.js', // Solo tests realistas

  // Maximum time one test can run
  timeout: 30000,

  // Run tests in files in parallel
  fullyParallel: false, // Secuencial para debugging

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  // Global setup simplificado
  globalSetup: './e2e-tests/global-setup.minimal.js',

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://127.0.0.1:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Emulate viewport
    viewport: { width: 1280, height: 720 }
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]

  // NOTA: El servidor debe estar corriendo manualmente con: npm run dev
  // No intentamos auto-iniciar el servidor (KISS principle)
})
