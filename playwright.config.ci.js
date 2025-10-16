/** @type {import('@playwright/test').PlaywrightTestConfig} */
import { devices } from '@playwright/test'

/**
 * Playwright configuration optimized for CI/CD environments
 *
 * Key differences from local config:
 * - Only Chromium (faster, most compatible)
 * - Increased timeouts for slower CI machines
 * - Sequential execution (workers: 1)
 * - More retries
 * - Artifacts always saved
 */
const config = {
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },

    // Increased timeouts for CI
    actionTimeout: 30000, // 30s (vs 15s locally)
    navigationTimeout: 60000, // 60s (vs 30s locally)

    // Always capture on failure
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  },

  testDir: './tests/e2e',

  // Sequential execution to avoid database conflicts
  fullyParallel: false,

  // Fail CI if test.only is present
  forbidOnly: true,

  // More retries in CI
  retries: 3,

  // Sequential execution (1 worker)
  workers: 1,

  // Increased global timeout for CI
  timeout: 120000, // 2 minutes per test

  // Enhanced reporting for CI
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],

  // Only run Chromium in CI for speed
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Extra Chromium args for CI
        launchOptions: {
          args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ]
        }
      }
    }
  ],

  // Global setup/teardown hooks
  globalSetup: './tests/e2e/global-setup.js',
  globalTeardown: './tests/e2e/global-teardown.js'
}

export default config
