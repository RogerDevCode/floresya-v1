import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

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
        price_ves: (price_usd * 36).toFixed(2),
        rating
      })
      .eq('id', product.id)

    if (error) {
      console.log(`❌ ${product.id}: ${error.message}`)
    } else {
      console.log(`✅ ${product.id} (${product.name.substring(0, 30)}): $${price_usd}, ⭐${rating}`)
    }
  }

  console.log('\n✅ Complete! Testing sort...\n')

  const { data: sorted } = await supabase
    .from('products')
    .select('name, price_usd')
    .eq('is_active', true)
    .order('price_usd', { ascending: true })
    .limit(3)

  console.log('💰 Cheapest:')
  sorted?.forEach(p => console.log(`   ${p.name}: $${p.price_usd}`))
}

updatePrices()
