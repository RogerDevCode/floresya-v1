#!/usr/bin/env node

/**
 * Cleanup Test Data Script
 *
 * This script removes test data created by the seed-test-data.js script.
 * It's designed to safely remove only test data (prefixed with 'test_').
 *
 * Usage: node cleanup-test-data.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env.local') })

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   SUPABASE_URL:', !!SUPABASE_URL)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_ROLE_KEY)
  process.exit(1)
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Test data prefix
const TEST_PREFIX = 'test_'

// Helper functions
async function cleanupTestData(tableName, nameColumn = 'name') {
  console.log(`🧹 Cleaning up test data in ${tableName}...`)

  const { data: records, error } = await supabase
    .from(tableName)
    .select('*')
    .like(nameColumn, `${TEST_PREFIX}%`)

  if (error) {
    console.error(`❌ Error querying ${tableName}:`, error)
    return false
  }

  if (records && records.length > 0) {
    const ids = records.map(item => item.id)
    const { error: deleteError } = await supabase.from(tableName).delete().in('id', ids)

    if (deleteError) {
      console.error(`❌ Error deleting from ${tableName}:`, deleteError)
      return false
    }

    console.log(`✅ Deleted ${records.length} test records from ${tableName}`)
  } else {
    console.log(`ℹ️ No test data found in ${tableName}`)
  }

  return true
}

async function cleanupTestUsers() {
  console.log('👥 Cleaning up test users...')

  // Get test users from database
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .like('email', '%@floresya.test')

  if (error) {
    console.error('❌ Error querying users:', error)
    return false
  }

  if (users && users.length > 0) {
    // Delete users from auth system first
    for (const user of users) {
      try {
        const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(user.id)
        if (deleteAuthError) {
          console.error(`❌ Error deleting auth user ${user.email}:`, deleteAuthError)
          continue
        }
        console.log(`✅ Deleted auth user: ${user.email}`)
      } catch (err) {
        console.error(`❌ Error deleting auth user ${user.email}:`, err)
      }
    }

    // Delete user records from database
    const userIds = users.map(user => user.id)
    const { error: deleteError } = await supabase.from('users').delete().in('id', userIds)

    if (deleteError) {
      console.error('❌ Error deleting user records:', deleteError)
      return false
    }

    console.log(`✅ Deleted ${users.length} user records from database`)
  } else {
    console.log('ℹ️ No test users found')
  }

  return true
}

// Main execution
async function main() {
  console.log('🧹 Starting test data cleanup...')
  console.log('=====================================')

  try {
    // Clean up in order of dependencies (child tables first)
    await cleanupTestData('order_items', 'product_name')
    await cleanupTestData('order_status_history')
    await cleanupTestData('orders', 'notes')
    await cleanupTestData('product_images')
    await cleanupTestData('product_occasions')
    await cleanupTestData('products')
    await cleanupTestData('payment_methods')
    await cleanupTestData('occasions')
    await cleanupTestUsers()

    console.log('=====================================')
    console.log('✅ Test data cleanup completed successfully!')
    console.log('')
    console.log('🎯 All test data has been removed from the database.')
  } catch (error) {
    console.error('❌ Error during test data cleanup:', error)
    process.exit(1)
  }
}

// Run the script
main()
