/**
 * Schema Verification Script
 * Checks the actual database schema
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
)

async function verifySchema() {
  try {
    console.log('🔍 Verifying database schema...\n')

    // Check orders table structure
    console.log('📋 Orders table columns:')
    const { data: ordersColumns, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1)

    if (ordersError) {
      console.log(`❌ Error querying orders: ${ordersError.message}`)
    } else if (ordersColumns && ordersColumns.length > 0) {
      const order = ordersColumns[0]
      Object.keys(order).forEach(key => {
        console.log(
          `  - ${key}: ${typeof order[key]} ${order[key] !== null ? `[${String(order[key]).substring(0, 30)}${String(order[key]).length > 30 ? '...' : ''}]` : '[null]'}`
        )
      })
    } else {
      console.log('  No orders found')
    }

    console.log('')

    // Check products table structure
    console.log('🌸 Products table columns:')
    const { data: productsColumns, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1)

    if (productsError) {
      console.log(`❌ Error querying products: ${productsError.message}`)
    } else if (productsColumns && productsColumns.length > 0) {
      const product = productsColumns[0]
      Object.keys(product).forEach(key => {
        console.log(
          `  - ${key}: ${typeof product[key]} ${product[key] !== null ? `[${String(product[key]).substring(0, 30)}${String(product[key]).length > 30 ? '...' : ''}]` : '[null]'}`
        )
      })
    } else {
      console.log('  No products found')
    }

    console.log('')

    // Check if specific columns exist
    console.log('🔍 Checking for specific columns:')

    // Check orders table for common columns
    const commonOrderColumns = [
      'id',
      'customer_name',
      'customer_email',
      'customer_phone',
      'status',
      'total_amount_usd',
      'total_amount_ves',
      'created_at',
      'updated_at'
    ]
    console.log('  Orders table:')
    for (const column of commonOrderColumns) {
      try {
        const { data, error } = await supabase.from('orders').select(column).limit(1)

        if (error) {
          console.log(`    ❌ ${column}: Error - ${error.message}`)
        } else {
          console.log(`    ✅ ${column}: Exists`)
        }
      } catch (e) {
        console.log(`    ❌ ${column}: Error - ${e.message}`)
      }
    }

    console.log('')

    // Check products table for common columns
    const commonProductColumns = [
      'id',
      'name',
      'price_usd',
      'price_ves',
      'stock',
      'sku',
      'active',
      'created_at',
      'updated_at'
    ]
    console.log('  Products table:')
    for (const column of commonProductColumns) {
      try {
        const { data, error } = await supabase.from('products').select(column).limit(1)

        if (error) {
          console.log(`    ❌ ${column}: Error - ${error.message}`)
        } else {
          console.log(`    ✅ ${column}: Exists`)
        }
      } catch (e) {
        console.log(`    ❌ ${column}: Error - ${e.message}`)
      }
    }

    console.log('\n✅ Schema verification completed!')
  } catch (error) {
    console.error('❌ Error in schema verification:', error.message)
    process.exit(1)
  }
}

verifySchema()
