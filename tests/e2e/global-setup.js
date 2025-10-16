/**
 * Global setup for Playwright tests
 * Runs once before all tests
 */

export default async function globalSetup() {
  console.log('🔧 Global Setup: Starting...')

  // Verify environment variables
  const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_KEY']
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`)
    console.warn('⚠️  Some tests may be skipped')
  }

  // Wait a bit to ensure server is ready
  if (process.env.CI) {
    console.log('⏳ Waiting 5 seconds for server to stabilize...')
    await new Promise(resolve => setTimeout(resolve, 5000))
  }

  console.log('✅ Global Setup: Complete')
}
