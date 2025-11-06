/**
 * @fileoverview Playwright Configuration for Firefox E2E Tests
 * Optimized specifically for Firefox browser testing
 */

const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results/firefox',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for Firefox stability
  reporter: [
    ['html', { outputFolder: 'playwright-report-firefox' }],
    ['list'],
    ['json', { outputFile: 'test-results/firefox-results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    navigationTimeout: 30000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            'network.cookie.cookieBehavior': 0, // Accept all cookies
            'dom.disable_beforeunload': true,
            'browser.popups.showBrowserConsole': true
          }
        }
      }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
})
