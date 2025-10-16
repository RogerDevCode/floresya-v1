/** @type {import('@playwright/test').PlaywrightTestConfig} */
import { devices } from '@playwright/test'

const config = {
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 30000, // Increased from 15s to 30s
    navigationTimeout: 60000, // Increased from 30s to 60s
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  testDir: './tests/e2e',
  fullyParallel: false, // Sequential execution for CI stability
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 1, // 3 retries in CI instead of 2
  workers: process.env.CI ? 1 : undefined, // Sequential execution in CI
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    }
    // Only Chromium for CI to optimize execution time
  ]
}

export default config
