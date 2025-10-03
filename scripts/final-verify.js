/**
 * Final Verification Script
 * Comprehensive check of all seeded data
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
)

async function finalVerification() {
  try {
    console.log('🔍 Final verification of all seeded data...\n')

    // Check products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, active')
      .eq('active', true)

    if (productsError) {
      throw productsError
    }

    console.log(`📦 Active Products: ${products.length}`)

    // Check all products
    const { data: allProducts, error: allProductsError } = await supabase
      .from('products')
      .select('id')

    if (allProductsError) {
      throw allProductsError
    }

    console.log(`📦 Total Products: ${allProducts.length}`)

    // Check orders
    const { data: orders, error: ordersError } = await supabase.from('orders').select('id')

    if (ordersError) {
      console.log(`🛒 Orders: Error - ${ordersError.message}`)
    } else {
      console.log(`🛒 Orders: ${orders.length}`)
    }

    // Check order items
    const { data: orderItems, error: itemsError } = await supabase.from('order_items').select('id')

    if (itemsError) {
      console.log(`🛍️ Order Items: Error - ${itemsError.message}`)
    } else {
      console.log(`🛍️ Order Items: ${orderItems.length}`)
    }

    // Check payments
    const { data: payments, error: paymentsError } = await supabase.from('payments').select('id')

    if (paymentsError) {
      console.log(`💳 Payments: Error - ${paymentsError.message}`)
    } else {
      console.log(`💳 Payments: ${payments.length}`)
    }

    // Check status history
    const { data: statusHistory, error: historyError } = await supabase
      .from('order_status_history')
      .select('id')

    if (historyError) {
      console.log(`📊 Status History: Error - ${historyError.message}`)
    } else {
      console.log(`📊 Status History: ${statusHistory.length}`)
    }

    // Show sample active products
    console.log('\n🌸 Sample Active Products:')
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('products')
      .select('id, name, price_usd, stock, active')
      .eq('active', true)
      .limit(5)

    if (!sampleError && sampleProducts) {
      sampleProducts.forEach(p => {
        console.log(`  - ${p.name}: ${p.price_usd} (${p.stock} in stock)`)
      })
    }

    // Show sample orders if any exist
    console.log('\n🛒 Sample Orders:')
    const { data: sampleOrders, error: sampleOrdersError } = await supabase
      .from('orders')
      .select('id, customer_name, total_amount_usd, status')
      .limit(3)

    if (!sampleOrdersError && sampleOrders && sampleOrders.length > 0) {
      sampleOrders.forEach(o => {
        console.log(`  - Order #${o.id}: ${o.customer_name} - ${o.total_amount_usd} (${o.status})`)
      })
    } else {
      console.log('  No orders found')
    }

    console.log('\n✅ Final verification completed!')
  } catch (error) {
    console.error('❌ Error in final verification:', error.message)
    process.exit(1)
  }
}

finalVerification()
