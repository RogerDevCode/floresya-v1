/** @type {import('@playwright/test').PlaywrightTestConfig} */
import { devices } from '@playwright/test'

const config = {
  use: {
    baseURL: 'https://floresya-v1.vercel.app',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 30000,
    navigationTimeout: 60000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Additional options for remote testing
    ignoreHTTPSErrors: true
  },
  testDir: './tests/e2e',
  fullyParallel: false, // Sequential execution for stability when testing remote site
  forbidOnly: false,
  retries: 2,
  workers: 1, // Single worker when testing remote site
  reporter: [['html', { outputFolder: 'playwright-vercel-report' }], ['list']],
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ],
  // Limit to specific tests for Vercel if needed
  grep: /vercel/, // Only run tests with 'vercel' in the name
  grepInvert: undefined
}

export default config
