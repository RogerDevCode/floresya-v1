/**
 * Simple Product Verification Script
 * Verifies if products were seeded correctly
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
)

async function verifyProducts() {
  try {
    console.log('🔍 Verifying products in database...')

    const { data, error } = await supabase
      .from('products')
      .select('id, name, active, price_usd')
      .limit(10)

    if (error) {
      throw error
    }

    console.log(`\n📦 Products found: ${data.length}`)

    if (data.length > 0) {
      console.log('\n📋 Products:')
      data.forEach(product => {
        console.log(
          `  - ${product.name} ($${product.price_usd}) - ${product.active ? 'ACTIVE' : 'INACTIVE'}`
        )
      })
    }

    // Count active products
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('active', true)

    if (countError) {
      throw countError
    }

    console.log(`\n✅ Active products: ${count.length}`)
  } catch (error) {
    console.error('❌ Error verifying products:', error.message)
    process.exit(1)
  }
}

verifyProducts()
