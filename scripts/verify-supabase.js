import 'dotenv/config'
import { initializeDIContainer, DIContainer } from '../api/architecture/di-container.js'
import { logger } from '../api/utils/logger.js'

async function verifySupabase() {
  console.log('🚀 Starting Supabase Verification...')

  try {
    // 1. Initialize DI Container
    console.log('📦 Initializing DI Container...')
    await initializeDIContainer()
    console.log('✅ DI Container Initialized')

    // 2. Check Supabase Client Health
    console.log('🏥 Checking Supabase Client Health...')

    // Force immediate health check
    if (DIContainer.instance.healthMonitor) {
      await DIContainer.instance.healthMonitor.performHealthCheck('SupabaseClient')
    }

    const supabaseStatus = DIContainer.instance.getServiceStatus('SupabaseClient')
    console.log('Supabase Status:', supabaseStatus)

    if (supabaseStatus.health.status !== 'HEALTHY' && supabaseStatus.health.status !== 'DEGRADED') {
      console.error('❌ Supabase Client is NOT healthy:', supabaseStatus.health)
      process.exit(1)
    }
    console.log(`✅ Supabase Client is ${supabaseStatus.health.status} (Connection Successful)`)

    // 3. Verify ProductRepository
    console.log('🔍 Verifying ProductRepository...')
    const productRepo = await DIContainer.resolve('ProductRepository')

    console.log('📊 Fetching products...')
    const products = await productRepo.findAll({}, { limit: 5 })

    console.log(`✅ Successfully fetched ${products.length} products`)
    if (products.length > 0) {
      console.log('Sample Product:', JSON.stringify(products[0], null, 2))
    } else {
      console.warn('⚠️ No products found in database')
    }

    // 4. Verify OrderRepository (optional, just to be sure)
    console.log('🔍 Verifying OrderRepository...')
    const orderRepo = await DIContainer.resolve('OrderRepository')
    const orders = await orderRepo.findAll({}, { limit: 1 })
    console.log(`✅ Successfully fetched ${orders.length} orders`)

    console.log('🎉 Verification Complete: Backend <-> Supabase connection is working correctly!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Verification Failed:', error)
    process.exit(1)
  }
}

verifySupabase()
