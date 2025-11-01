#!/usr/bin/env node

/**
 * CI Script for Running E2E Tests with Playwright
 * Complete isolation from Vitest - uses isolated config only
 */

const { execSync } = require('child_process')

console.log('🎭 Starting Playwright E2E tests in complete isolation...')

// Set environment variables for isolation
process.env.NODE_ENV = 'test'
process.env.PLAYWRIGHT_CI = 'true'
process.env.CI = 'true'

try {
  // Run Playwright with completely isolated config - no Vitest contact
  console.log('🚀 Executing Playwright with zero Vitest integration...')
  execSync('npx playwright test --config=playwright.config.ci.cjs', {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_OPTIONS: '--no-warnings',
      PLAYWRIGHT_CI: 'true',
      CI: 'true'
    }
  })

  console.log('✅ Playwright E2E tests completed successfully')

} catch (error) {
  console.error(`❌ Playwright E2E tests failed with exit code ${error.status}`)
  process.exit(error.status || 1)
}