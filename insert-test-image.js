/**
 * Insert test image for product 67
 * Usage: node insert-test-image.js <image_url>
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const imageUrl = process.argv[2]

if (!imageUrl) {
  console.error('❌ Usage: node insert-test-image.js <image_url>')
  console.error(
    '   Example: node insert-test-image.js "https://your-bucket.supabase.co/storage/v1/object/public/products/image.jpg"'
  )
  process.exit(1)
}

async function insertTestImage() {
  console.log('📸 Inserting test image for product_id=67...')
  console.log(`   URL: ${imageUrl}\n`)

  const testImages = [
    {
      product_id: 67,
      image_index: 1,
      size: 'thumb',
      url: imageUrl,
      file_hash: 'test-hash-thumb',
      mime_type: 'image/jpeg',
      is_primary: true
    },
    {
      product_id: 67,
      image_index: 1,
      size: 'small',
      url: imageUrl,
      file_hash: 'test-hash-small',
      mime_type: 'image/jpeg',
      is_primary: true
    },
    {
      product_id: 67,
      image_index: 1,
      size: 'medium',
      url: imageUrl,
      file_hash: 'test-hash-medium',
      mime_type: 'image/jpeg',
      is_primary: true
    },
    {
      product_id: 67,
      image_index: 1,
      size: 'large',
      url: imageUrl,
      file_hash: 'test-hash-large',
      mime_type: 'image/jpeg',
      is_primary: true
    }
  ]

  for (const img of testImages) {
    console.log(`   Inserting ${img.size} image...`)
    const { data, error } = await supabase.from('product_images').insert(img).select().single()

    if (error) {
      console.error(`   ❌ Error inserting ${img.size}:`, error.message)
    } else {
      console.log(`   ✅ Inserted ${img.size} image (id: ${data.id})`)
    }
  }

  console.log('\n✅ Done! Run test-product-images.js to verify.')
}

insertTestImage().catch(console.error)
