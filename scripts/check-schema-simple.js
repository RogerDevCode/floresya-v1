import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dcbavpdlkcjdtjdkntde.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjYmF2cGRsa2NqZHRqZGtudGRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc2Nzg5OSwiZXhwIjoyMDcyMzQzODk5fQ.MwbJfs2vXZJMDXT5bcdYjt0_pZ1OD7V7b_v0q_3tK2Q'
)

console.log('🔍 SCHEMA VERIFICATION - Comparing floresya.sql vs Live DB\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

// Test products table access
const { data: products, error } = await supabase
  .from('products')
  .select('*')
  .limit(1)

if (error) {
  console.log('❌ Error accessing products:', error.message)
} else {
  console.log('✅ Products table accessible\n')
  console.log('📋 PRODUCTS TABLE COLUMNS (from live query):\n')
  
  const columns = Object.keys(products[0] || {})
  columns.forEach(col => {
    const value = products[0][col]
    const type = typeof value === 'number' ? 'numeric' : 
                 value instanceof Date ? 'timestamp' :
                 typeof value === 'boolean' ? 'boolean' : 'text'
    console.log(`   ${col.padEnd(25)} ${type}`)
  })
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log('📄 EXPECTED COLUMNS (from floresya.sql):\n')

const expectedCols = [
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
  'description_normalized',
  'search_vector'
]

expectedCols.forEach(col => console.log(`   ${col}`))

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

// Check critical tables
const criticalTables = [
  'products',
  'product_images', 
  'occasions',
  'product_occasions',
  'orders',
  'order_items',
  'users',
  'payment_methods'
]

console.log('🔍 CHECKING CRITICAL TABLES:\n')

for (const table of criticalTables) {
  const { data, error } = await supabase.from(table).select('*').limit(1)
  
  if (error) {
    console.log(`   ❌ ${table.padEnd(20)} - ${error.message}`)
  } else {
    const count = data ? 1 : 0
    console.log(`   ✅ ${table.padEnd(20)} - Accessible`)
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
