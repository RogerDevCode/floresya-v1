/**
 * Test script to check product_images table
 * Usage: node test-product-images.js
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

async function testProductImages() {
  console.log('🔍 Checking product_images for product_id=67...\n')

  // Get all images for product 67
  const { data: allImages, error: allError } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', 67)
    .order('image_index', { ascending: true })

  if (allError) {
    console.error('❌ Error fetching images:', allError.message)
    return
  }

  console.log(`📊 Total images for product 67: ${allImages?.length || 0}`)

  if (allImages && allImages.length > 0) {
    console.log('\n📋 Images found:')
    allImages.forEach(img => {
      console.log(
        `  - ID: ${img.id}, index: ${img.image_index}, size: ${img.size}, primary: ${img.is_primary}`
      )
      console.log(`    URL: ${img.url}`)
    })
  } else {
    console.log('⚠️  No images found for product_id=67')
  }

  // Check specifically for primary small image
  console.log('\n🎯 Checking for primary small image...')
  const { data: primarySmall, error: primaryError } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', 67)
    .eq('is_primary', true)
    .eq('size', 'small')
    .single()

  if (primaryError) {
    if (primaryError.code === 'PGRST116') {
      console.log('❌ No primary small image found (expected for carousel)')
    } else {
      console.error('❌ Error:', primaryError.message)
    }
  } else {
    console.log('✅ Primary small image found:', primarySmall.url)
  }

  // Check count by size
  console.log('\n📏 Count by size:')
  const sizes = ['thumb', 'small', 'medium', 'large']
  for (const size of sizes) {
    const { data, error } = await supabase
      .from('product_images')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', 67)
      .eq('size', size)

    console.log(`  ${size}: ${data?.length || 0}`)
  }
}

testProductImages().catch(console.error)
