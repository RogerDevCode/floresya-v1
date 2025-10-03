/**
 * Verify Orders Script
 * Checks if orders were seeded correctly
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
)

async function verifyOrders() {
  try {
    console.log('🔍 Verifying orders in database...')

    // Check orders count
    const { count: ordersCount, error: ordersCountError } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })

    if (ordersCountError) {
      throw ordersCountError
    }

    console.log(`\n📦 Total orders: ${ordersCount.length}`)

    // Check order items count
    const { count: itemsCount, error: itemsCountError } = await supabase
      .from('order_items')
      .select('*', { count: 'exact' })

    if (itemsCountError) {
      throw itemsCountError
    }

    console.log(`📦 Total order items: ${itemsCount.length}`)

    // Check payments count
    const { count: paymentsCount, error: paymentsCountError } = await supabase
      .from('payments')
      .select('*', { count: 'exact' })

    if (paymentsCountError) {
      throw paymentsCountError
    }

    console.log(`💳 Total payments: ${paymentsCount.length}`)

    // Check status history count
    const { count: historyCount, error: historyCountError } = await supabase
      .from('order_status_history')
      .select('*', { count: 'exact' })

    if (historyCountError) {
      throw historyCountError
    }

    console.log(`📊 Total status changes: ${historyCount.length}`)

    // Show sample orders if any exist
    if (ordersCount.length > 0) {
      console.log('\n📋 Sample orders:')
      const { data: sampleOrders, error: sampleError } = await supabase
        .from('orders')
        .select('id, customer_name, total_usd, status, created_at')
        .limit(5)
        .order('created_at', { ascending: false })

      if (!sampleError && sampleOrders) {
        sampleOrders.forEach(order => {
          console.log(
            `  - Order #${order.id}: ${order.customer_name} - $${order.total_usd} (${order.status})`
          )
        })
      }
    }

    console.log('\n✅ Verification completed!')
  } catch (error) {
    console.error('❌ Error verifying orders:', error.message)
    process.exit(1)
  }
}

verifyOrders()
