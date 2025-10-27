/**
 * Playwright-specific setup
 * Separated from Vitest to avoid conflicts
 */

function globalSetup() {
  console.log('🎭 Playwright setup completed')

  // Clean up any potential Vitest globals
  delete global.expect
  delete global.describe
  delete global.test
  delete global.it
  delete global.vi

  return () => {
    console.log('🎭 Playwright teardown completed')
  }
}

export default globalSetup
