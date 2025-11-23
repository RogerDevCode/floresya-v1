/**
 * Check Products Script
 * Verifies if there are products in the database
 */
// @ts-nocheck

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

async function checkProducts() {
  try {
    console.log('🔍 Checking products in database...')

    // Check all products
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('id, name, active, created_at')
      .limit(10)

    if (allError) {
      throw allError
    }

    console.log(`\n📦 Total products found: ${allProducts ? allProducts.length : 0}`)

    if (allProducts && allProducts.length > 0) {
      console.log('\n📋 Sample products:')
      allProducts.forEach(product => {
        console.log(
          `  - ${product.name} (ID: ${product.id}) - ${product.active ? 'ACTIVE' : 'INACTIVE'}`
        )
      })
    }

    // Check active products specifically
    const { data: activeProducts, error: activeError } = await supabase
      .from('products')
      .select('id, name, active')
      .eq('active', true)
      .limit(5)

    if (activeError) {
      throw activeError
    }

    const activeCount = activeProducts ? activeProducts.length : 0
    console.log(`\n✅ Active products: ${activeCount}`)

    if (activeCount === 0) {
      console.log('\n💡 Recommendation: Run product seeding script first')
      console.log('   Try: node scripts/seed-products.js')
    } else {
      console.log('\n🎉 Ready to seed orders!')
    }
  } catch (error) {
    console.error('❌ Error checking products:', error.message)
    process.exit(1)
  }
}

checkProducts()
