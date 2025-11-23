/**
 * Quick fix for carousel images
 * Adds placeholder images to featured products
 */
// @ts-nocheck

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Featured product IDs
const featuredProductIds = [168, 170, 172, 173, 176]

async function addCarouselImages() {
  console.log('🎠 Adding placeholder images to carousel products...')

  try {
    for (const productId of featuredProductIds) {
      console.log(`\n📸 Adding image to product ID: ${productId}`)

      // Check if image already exists
      const { data } = await supabase
        .from('product_images')
        .select('id')
        .eq('product_id', productId)
        .limit(1)

      if (data && data.length > 0) {
        console.log(`⚠️  Product ${productId} already has an image, skipping`)
        continue
      }

      // Insert placeholder image
      // file_hash must be 64 hex characters (SHA-256 format)
      // image_index must be > 0
      const fileHash = 'a'.repeat(64) // placeholder hash
      const { error } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          url: '/images/placeholder-flower.svg',
          size: 'small',
          image_index: 1,
          is_primary: true,
          file_hash: fileHash
        })
        .select()

      if (error) {
        console.error(`❌ Failed to add image for product ${productId}:`, error.message)
      } else {
        console.log(`✅ Successfully added image for product ${productId}`)
      }
    }

    console.log('\n✅ Carousel images setup complete!')
    console.log('🔄 Please refresh your browser to see the carousel.')
  } catch (error) {
    console.error('❌ Error setting up carousel images:', error)
    process.exit(1)
  }
}

// Run the script
addCarouselImages()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
