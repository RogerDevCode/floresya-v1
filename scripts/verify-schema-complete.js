import { readFileSync } from 'fs'

console.log('🔍 SCHEMA VERIFICATION: supabaseClient.js vs floresya.sql\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const sql = readFileSync('floresya.sql', 'utf8')

// Extract table definitions
const tables = [
  'users',
  'occasions',
  'products',
  'product_occasions',
  'product_images',
  'orders',
  'order_items',
  'order_status_history',
  'payment_methods',
  'payments',
  'settings'
]

console.log('📊 CHECKING DB_SCHEMA TABLES:\n')

for (const table of tables) {
  const regex = new RegExp(`CREATE TABLE public\\.${table}`, 'i')
  const exists = regex.test(sql)
  console.log(
    `   ${exists ? '✅' : '❌'} ${table.padEnd(25)} ${exists ? 'EXISTS in floresya.sql' : 'NOT FOUND'}`
  )
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log('🔧 CHECKING DB_FUNCTIONS:\n')

const functions = [
  'create_order_with_items',
  'update_order_status_with_history',
  'create_product_with_occasions',
  'create_product_images_atomic',
  'update_carousel_order_atomic',
  'delete_product_images_safe',
  'get_product_occasions',
  'get_products_by_occasion',
  'get_products_with_occasions',
  'get_existing_image_by_hash',
  'reset_sequence',
  'get_products_filtered' // Added recently
]

for (const fn of functions) {
  const regex = new RegExp(`CREATE.*FUNCTION public\\.${fn}`, 'i')
  const exists = regex.test(sql)
  console.log(`   ${exists ? '✅' : '❌'} ${fn.padEnd(35)} ${exists ? 'EXISTS' : 'NOT FOUND'}`)
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log('📋 CHECKING PRODUCTS COLUMNS:\n')

const clientColumns = [
  'id',
  'name',
  'summary',
  'description',
  'price_usd',
  'price_ves',
  'stock',
  'sku',
  'active',
  'featured',
  'carousel_order',
  'created_at',
  'updated_at',
  'name_normalized',
  'description_normalized'
]

// Extract products table definition
const productsMatch = sql.match(/CREATE TABLE public\.products \(([\s\S]*?)\);/i)
if (productsMatch) {
  const productsDef = productsMatch[1]

  for (const col of clientColumns) {
    const colRegex = new RegExp(`${col}\\s+`, 'i')
    const exists = colRegex.test(productsDef)
    console.log(`   ${exists ? '✅' : '❌'} ${col.padEnd(25)} ${exists ? 'EXISTS' : 'MISSING'}`)
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log('⚠️  CHECKING FOR MISSING COLUMNS:\n')

const missingCols = ['price', 'base_price', 'rating', 'image_url', 'category_id']

for (const col of missingCols) {
  const regex = new RegExp(`${col}\\s+`, 'i')
  const exists = regex.test(sql.match(/CREATE TABLE public\.products[\s\S]*?;/)?.[0] || '')
  console.log(
    `   ${!exists ? '✅' : '❌'} ${col.padEnd(25)} ${!exists ? 'Correctly NOT in schema' : 'FOUND (unexpected!)'}`
  )
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
