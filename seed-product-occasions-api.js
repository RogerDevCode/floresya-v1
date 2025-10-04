/**
 * Seed product_occasions via API
 * Each product gets 1-3 random occasions
 */

async function seedProductOccasions() {
  try {
    console.log('🌱 Seeding product_occasions via API...\n')

    const authHeader = { Authorization: 'Bearer admin:1:admin' }

    // 1. Get all products
    const productsRes = await fetch('http://localhost:3000/api/products?includeInactive=true', {
      headers: authHeader
    })
    const productsData = await productsRes.json()
    const products = productsData.data.filter(p => p.active)
    console.log(`✓ Found ${products.length} active products`)

    // 2. Get all occasions
    const occasionsRes = await fetch('http://localhost:3000/api/occasions', {
      headers: authHeader
    })
    const occasionsData = await occasionsRes.json()
    const occasions = occasionsData.data.filter(o => o.is_active)
    console.log(`✓ Found ${occasions.length} active occasions\n`)

    if (occasions.length === 0) {
      console.log('⚠ No active occasions found. Cannot seed.')
      return
    }

    // 3. Generate random product-occasion relationships
    const productOccasions = []

    products.forEach(product => {
      // Random number of occasions (1-3)
      const occasionCount = Math.floor(Math.random() * 3) + 1
      const selectedOccasions = new Set()

      // Select random unique occasions
      while (selectedOccasions.size < occasionCount) {
        const randomOccasion = occasions[Math.floor(Math.random() * occasions.length)]
        selectedOccasions.add(randomOccasion.id)
      }

      selectedOccasions.forEach(occasionId => {
        productOccasions.push({
          product_id: product.id,
          occasion_id: occasionId
        })
      })
    })

    console.log(`📊 Generated ${productOccasions.length} product-occasion relationships`)
    console.log(
      `   Average: ${(productOccasions.length / products.length).toFixed(1)} occasions per product\n`
    )

    // 4. Use Supabase client to insert directly (with service role key to bypass RLS)
    const { createClient } = await import('@supabase/supabase-js')
    const dotenv = await import('dotenv')

    dotenv.config({ path: '.env.local' })

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Clear existing relationships (optional)
    const { error: deleteError } = await supabase
      .from('product_occasions')
      .delete()
      .neq('product_id', 0) // Delete all

    if (deleteError) {
      console.warn('Warning clearing table:', deleteError.message)
    }

    // Insert in batches of 100
    const batchSize = 100
    let inserted = 0
    const errors = []

    for (let i = 0; i < productOccasions.length; i += batchSize) {
      const batch = productOccasions.slice(i, i + batchSize)
      const { error: insertError } = await supabase.from('product_occasions').insert(batch)

      if (insertError) {
        console.error('Error inserting batch:', insertError)
        errors.push(insertError.message)
      } else {
        inserted += batch.length
        console.log(`✓ Inserted ${inserted}/${productOccasions.length}`)
      }
    }

    const totalCreated = inserted

    console.log(`\n✅ Completed!`)
    console.log(`   Total relationships created: ${totalCreated}`)
    console.log(`   Average: ${(totalCreated / products.length).toFixed(1)} occasions per product`)

    if (errors.length > 0) {
      console.log(`\n⚠ Errors: ${errors.length}`)
      errors.slice(0, 5).forEach(e => console.log(`   ${e.product}: ${e.error}`))
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

seedProductOccasions()
