/**
 * Seed product_occasions table with random data
 * Each product gets 1-3 random occasions
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

async function seedProductOccasions() {
  try {
    console.log('🌱 Seeding product_occasions table...\n')

    // 1. Get all active products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .eq('active', true)
      .order('id')

    if (productsError) {
      throw productsError
    }
    console.log(`✓ Found ${products.length} active products`)

    // 2. Get all active occasions
    const { data: occasions, error: occasionsError } = await supabase
      .from('occasions')
      .select('id, name')
      .eq('is_active', true)
      .order('id')

    if (occasionsError) {
      throw occasionsError
    }
    console.log(`✓ Found ${occasions.length} active occasions\n`)

    if (occasions.length === 0) {
      console.log('⚠ No active occasions found. Cannot seed.')
      return
    }

    // 3. Clear existing product_occasions (optional - remove if you want to keep existing)
    const { error: deleteError } = await supabase
      .from('product_occasions')
      .delete()
      .neq('product_id', 0) // Delete all

    if (deleteError) {
      console.warn('Warning clearing table:', deleteError.message)
    }

    // 4. Generate random product-occasion relationships
    const productOccasions = []

    products.forEach(product => {
      // Each product gets 1-3 random occasions
      const occasionCount = Math.floor(Math.random() * 3) + 1 // 1, 2, or 3
      const selectedOccasions = new Set()

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

    // 5. Insert in batches of 100
    const batchSize = 100
    let inserted = 0

    for (let i = 0; i < productOccasions.length; i += batchSize) {
      const batch = productOccasions.slice(i, i + batchSize)
      const { error: insertError } = await supabase.from('product_occasions').insert(batch)

      if (insertError) {
        console.error('Error inserting batch:', insertError)
        throw insertError
      }

      inserted += batch.length
      console.log(`✓ Inserted ${inserted}/${productOccasions.length}`)
    }

    console.log('\n✅ Successfully seeded product_occasions table!')
    console.log(`   Total relationships: ${inserted}`)

    // 6. Show sample data
    console.log('\n📋 Sample data:')
    const { data: sample } = await supabase
      .from('product_occasions')
      .select(
        `
        product_id,
        products(name),
        occasion_id,
        occasions(name)
      `
      )
      .limit(5)

    sample.forEach(rel => {
      console.log(`   Product "${rel.products.name}" → Occasion "${rel.occasions.name}"`)
    })
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  }
}

seedProductOccasions()
