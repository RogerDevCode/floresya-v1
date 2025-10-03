/**
 * Simple Verification Script
 * Checks if data was seeded correctly
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
)

async function simpleVerify() {
  try {
    console.log('🔍 Simple verification of seeded data...\n')

    // Check products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price_usd, active')
      .limit(3)

    if (productsError) {
      throw productsError
    }

    console.log(`📦 Products found: ${products.length}`)
    if (products.length > 0) {
      products.forEach(p => {
        console.log(`  - ${p.name}: $${p.price_usd} (${p.active ? 'ACTIVE' : 'INACTIVE'})`)
      })
    }

    // Check orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, customer_name, total_amount_usd, status')
      .limit(3)

    if (ordersError) {
      throw ordersError
    }

    console.log(`\n🛒 Orders found: ${orders.length}`)
    if (orders.length > 0) {
      orders.forEach(o => {
        console.log(`  - Order #${o.id}: ${o.customer_name} - $${o.total_usd} (${o.status})`)
      })
    }

    // Check order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('id, order_id, product_id, quantity')
      .limit(3)

    if (itemsError) {
      throw itemsError
    }

    console.log(`\n🛍️ Order items found: ${orderItems.length}`)
    if (orderItems.length > 0) {
      orderItems.forEach(i => {
        console.log(
          `  - Item #${i.id}: Order ${i.order_id}, Product ${i.product_id}, Qty ${i.quantity}`
        )
      })
    }

    console.log('\n✅ Simple verification completed!')
  } catch (error) {
    console.error('❌ Error in verification:', error.message)
    process.exit(1)
  }
}

simpleVerify()
