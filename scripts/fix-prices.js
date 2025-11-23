import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dcbavpdlkcjdtjdkntde.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjYmF2cGRsa2NqZHRqZGtudGRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc2Nzg5OSwiZXhwIjoyMDcyMzQzODk5fQ.MwbJfs2vXZJMDXT5bcdYjt0_pZ1OD7V7b_v0q_3tK2Q'
)

async function main() {
  console.log('🌱 Updating product prices...\n')

  const { data: products } = await supabase.from('products').select('id, name').eq('active', true)

  console.log(`📦 Updating ${products.length} products...\n`)

  for (const p of products) {
    const price = parseFloat((Math.random() * 95 + 25).toFixed(2))
    const rating = parseFloat((Math.random() * 1.5 + 3.5).toFixed(1))

    await supabase
      .from('products')
      .update({ price_usd: price, price_ves: price * 36, rating })
      .eq('id', p.id)

    console.log(`✅ ${p.id}: $${price}, ⭐${rating}`)
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Update complete! Testing sorts...\n')

  const { data: asc } = await supabase
    .from('products')
    .select('name, price_usd')
    .eq('active', true)
    .order('price_usd', { ascending: true })
    .limit(3)

  console.log('💰 CHEAPEST (price_asc):')
  asc.forEach(p => console.log(`   $${p.price_usd} - ${p.name}`))

  const { data: desc } = await supabase
    .from('products')
    .select('name, price_usd')
    .eq('active', true)
    .order('price_usd', { ascending: false })
    .limit(3)

  console.log('\n💎 MOST EXPENSIVE (price_desc):')
  desc.forEach(p => console.log(`   $${p.price_usd} - ${p.name}`))

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
