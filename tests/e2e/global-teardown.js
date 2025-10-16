/**
 * Global teardown for Playwright tests
 * Runs once after all tests complete
 */

export default async function globalTeardown() {
  console.log('🧹 Global Teardown: Cleaning up...')

  // Add any cleanup logic here
  // For example: close database connections, cleanup test data, etc.

  console.log('✅ Global Teardown: Complete')
}
