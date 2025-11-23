/**
 * Cleanup Script for Test Data
 * Cleans all test data in the correct order (child tables first)
 *
 * Usage: node scripts/setup/cleanup-test-data.js
 */
// @ts-nocheck

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
)

async function cleanupTestData() {
  try {
    console.log('🧹 Starting test data cleanup...\n')

    // Delete in reverse dependency order (child tables first)
    const tables = ['order_items', 'orders', 'product_images', 'products', 'occasions']

    for (const table of tables) {
      console.log(`Deleting from ${table}...`)
      const { error } = await supabase.from(table).delete().neq('id', 0)

      if (error) {
        console.warn(`⚠️ Warning: Could not delete from ${table}:`, error.message)
      } else {
        console.log(`✓ Cleaned ${table}`)
      }
    }

    console.log('\n✅ Test data cleanup completed successfully!')
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error)
    process.exit(1)
  }
}

cleanupTestData()
