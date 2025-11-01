/**
 * Playwright Config for E2E Tests - Complete Isolation from Vitest
 * This config is used specifically for CI/CD to avoid Symbol conflicts
 */

const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],

  // Completely ignore any test setup files that might load Vitest
  globalSetup: undefined,
  globalTeardown: undefined,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 30000,
    navigationTimeout: 60000
  },

  // Exclude all files that might load Vitest or test frameworks
  testIgnore: [
    '**/*.unit.test.js',
    '**/*.integration.test.js',
    '**/unit/**',
    '**/integration/**',
    'node_modules/**',
    '**/setup.js',
    '**/vitest.config.*',
    '**/tests/setup.js',
    '**/tests/unit/**',
    '**/tests/integration/**'
  ],

  // Only run E2E test files
  testMatch: [
    'tests/e2e/**/*.test.js',
    'tests/e2e/**/*.spec.js'
  ],

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: [
        '**/*.unit.test.js',
        '**/*.integration.test.js',
        '**/unit/**',
        '**/integration/**',
        'node_modules/**',
        '**/setup.js',
        '**/vitest*',
        '**/tests/setup.js',
        '**/tests/unit/**',
        '**/tests/integration/**'
      ]
    }
  ],

  // Completely disable any web server
  webServer: undefined
})