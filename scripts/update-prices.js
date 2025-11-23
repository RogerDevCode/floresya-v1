import { supabase } from '../config/supabase.js'

async function updatePrices() {
  console.log('🌱 Updating product prices...')

  // Get all products
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .eq('is_active', true)

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
      console.log(`✅ ${product.id}: $${price_usd}, ⭐${rating}`)
    }
  }

  console.log('\n✅ Complete!')
}

updatePrices()
