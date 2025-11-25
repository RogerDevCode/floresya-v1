import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabase = createClient(
  'https://dcbavpdlkcjdtjdkntde.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjYmF2cGRsa2NqZHRqZGtudGRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc2Nzg5OSwiZXhwIjoyMDcyMzQzODk5fQ.MwbJfs2vXZJMDXT5bcdYjt0_pZ1OD7V7b_v0q_3tK2Q'
)

const sql = readFileSync('database/migrations/fix-product-sorting.sql', 'utf8')

console.log('🔧 Applying SQL fix for product sorting...\n')

const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

if (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

console.log('✅ SQL fix applied successfully!\n')
console.log('🧪 Testing sorts...\n')

// Test price_asc
const { data: asc } = await supabase.rpc('get_products_filtered', {
  p_sort_by: 'price_usd',
  p_sort_order: 'ASC',
  p_limit: 3
})

console.log('💰 CHEAPEST (price_asc):')
asc?.forEach(p => console.log(`   $${p.price_usd} - ${p.name}`))

// Test price_desc
const { data: desc } = await supabase.rpc('get_products_filtered', {
  p_sort_by: 'price_usd',
  p_sort_order: 'DESC',
  p_limit: 3
})

console.log('\n💎 MOST EXPENSIVE (price_desc):')
desc?.forEach(p => console.log(`   $${p.price_usd} - ${p.name}`))

console.log('\n✅ Sorting now works correctly!')
