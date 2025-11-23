import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dcbavpdlkcjdtjdkntde.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjYmF2cGRsa2NqZHRqZGtudGRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTc5MjU0OSwiZXhwIjoyMDQ3MzY4NTQ5fQ.J0yZTHJVBP-UGWo3QfYwVOeGgmsjVZLEBklhsXfhRaA'
)

async function updatePrices() {
  console.log('🌱 Updating product prices...')

  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, name')
    .eq('is_active', true)

  if (fetchError) {
    console.error('❌ Fetch error:', fetchError)
    return
  }

  console.log(`📦 Found ${products.length} products`)

  for (const product of products) {
    const price_usd = parseFloat((Math.random() * 95 + 25).toFixed(2))
    const rating = parseFloat((Math.random() * 1.5 + 3.5).toFixed(1))

    const { error } = await supabase
      .from('products')
      .update({
        price_usd,
        price_ves: price_usd * 36,
        rating
      })
      .eq('id', product.id)

    if (error) {
      console.log(`❌ ${product.id}: ${error.message}`)
    } else {
      console.log(`✅ ${product.id} (${product.name}): $${price_usd}, ⭐${rating}`)
    }

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Price update complete!')
  console.log('🧪 Now testing sort filters...\n')

  // Test price_asc
  const { data: sortedAsc } = await supabase
    .from('products')
    .select('id, name, price_usd')
    .eq('is_active', true)
    .order('price_usd', { ascending: true })
    .limit(3)

  console.log('💰 Cheapest products (price_asc):')
  sortedAsc.forEach(p => console.log(`   ${p.name}: $${p.price_usd}`))

  // Test price_desc
  const { data: sortedDesc } = await supabase
    .from('products')
    .select('id, name, price_usd')
    .eq('is_active', true)
    .order('price_usd', { ascending: false })
    .limit(3)

  console.log('\n💎 Most expensive products (price_desc):')
  sortedDesc.forEach(p => console.log(`   ${p.name}: $${p.price_usd}`))

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

updatePrices()
