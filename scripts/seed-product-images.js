/**
 * @fileoverview Seed product_images table with images from Supabase storage
 * @description Randomly assigns 45 existing images to products 179-190
 * @version 2.0.0
 */

import { createClient } from '@supabase/supabase-js'
import { readdir } from 'fs/promises'
import { join } from 'path'
import dotenv from 'dotenv'

dotenv.config()

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Configuration
const STORAGE_BASE_URL =
  'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images'
const IMAGE_SIZES = ['thumb', 'small', 'medium', 'large']
const PRODUCT_IDS = [179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190]
const IMG_TEMP_PATH = join(process.cwd(), 'img-temp', 'large')

/**
 * Extract image info from filename
 * @param {string} filename - e.g., product_10_1_hash.webp
 * @returns {Object} - { oldProductId, position, hash }
 */
function parseFilename(filename) {
  const match = filename.match(/^product_(\d+)_(\d+)_([a-f0-9]+)\.webp$/)
  if (!match) {
    return null
  }

  return {
    oldProductId: parseInt(match[1], 10),
    position: parseInt(match[2], 10),
    hash: match[3],
    filename: filename
  }
}

/**
 * Shuffle array randomly
 */
function shuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Distribute images across products
 */
function distributeImages(imageFiles, productIds) {
  const assignments = []
  const shuffledImages = shuffle(imageFiles)
  const imagesPerProduct = Math.floor(shuffledImages.length / productIds.length)
  const remainder = shuffledImages.length % productIds.length

  let imageIndex = 0

  productIds.forEach((productId, idx) => {
    const numImages = imagesPerProduct + (idx < remainder ? 1 : 0)

    for (let i = 0; i < numImages; i++) {
      if (imageIndex < shuffledImages.length) {
        const imageInfo = shuffledImages[imageIndex]
        assignments.push({
          productId,
          position: i + 1,
          imageInfo
        })
        imageIndex++
      }
    }
  })

  return assignments
}

/**
 * Build image URLs for all sizes
 */
function buildImageUrls(imageInfo) {
  const urls = {}

  IMAGE_SIZES.forEach(size => {
    const filename = `product_${imageInfo.oldProductId}_${imageInfo.position}_${imageInfo.hash}.webp`
    urls[size] = `${STORAGE_BASE_URL}/${size}/${filename}`
  })

  return urls
}

/**
 * Clear existing product_images for products 179-190
 */
async function clearExistingImages() {
  console.log('\n🗑️  Clearing existing images for products 179-190...')

  const { error } = await supabase.from('product_images').delete().in('product_id', PRODUCT_IDS)

  if (error) {
    console.error('❌ Error clearing images:', error)
    throw error
  }

  console.log('✅ Existing images cleared')
}

/**
 * Insert product images
 */
async function insertProductImages(assignments) {
  console.log('\n📥 Inserting product images...')

  const records = assignments.map(({ productId, position, imageInfo }) => {
    const urls = buildImageUrls(imageInfo)

    return {
      product_id: productId,
      image_index: position,
      size: 'large',
      url: urls.large,
      file_hash: imageInfo.hash,
      mime_type: 'image/webp',
      is_primary: position === 1,
      active: true
    }
  })

  const BATCH_SIZE = 10
  let inserted = 0

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)

    const { data, error } = await supabase.from('product_images').insert(batch).select()

    if (error) {
      console.error(`❌ Error inserting batch ${i / BATCH_SIZE + 1}:`, error)
      throw error
    }

    inserted += data.length
    console.log(`   ✓ Inserted batch ${i / BATCH_SIZE + 1}: ${data.length} images`)
  }

  console.log(`✅ Total inserted: ${inserted} images`)
  return inserted
}

/**
 * Display summary
 */
function displaySummary(assignments) {
  console.log('\n📊 Assignment Summary:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const productCounts = {}
  assignments.forEach(({ productId }) => {
    productCounts[productId] = (productCounts[productId] || 0) + 1
  })

  Object.entries(productCounts).forEach(([productId, count]) => {
    console.log(`   Product ${productId}: ${count} image(s)`)
  })

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`   Total: ${assignments.length} images assigned`)
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting product image seeding...\n')

  try {
    console.log('📂 Reading image files from img-temp/large...')
    const files = await readdir(IMG_TEMP_PATH)
    const imageFiles = files
      .map(parseFilename)
      .filter(Boolean)
      .sort((a, b) => a.oldProductId - b.oldProductId || a.position - b.position)

    console.log(`✅ Found ${imageFiles.length} valid image files`)

    if (imageFiles.length === 0) {
      throw new Error('No valid image files found in img-temp/large')
    }

    console.log('\n🎲 Distributing images randomly across products...')
    const assignments = distributeImages(imageFiles, PRODUCT_IDS)
    displaySummary(assignments)

    await clearExistingImages()
    await insertProductImages(assignments)

    console.log('\n🔍 Verifying insertion...')
    const { data, error } = await supabase
      .from('product_images')
      .select('product_id, url, image_index, is_primary')
      .in('product_id', PRODUCT_IDS)
      .order('product_id')
      .order('image_index')

    if (error) {
      console.error('❌ Verification error:', error)
    } else {
      console.log(`✅ Verification passed: ${data.length} images in database`)

      console.log('\n📋 Sample (first 5 images):')
      data.slice(0, 5).forEach(img => {
        console.log(
          `   Product ${img.product_id} [${img.image_index}]${img.is_primary ? ' 🌟' : ''}: ${img.url.substring(0, 80)}...`
        )
      })
    }

    console.log('\n🎉 Seeding completed successfully!')
    console.log('\n💡 Next steps:')
    console.log('   1. Refresh your application')
    console.log('   2. Check product images display on homepage')
    console.log('   3. Verify image loading in browser DevTools\n')
  } catch (error) {
    console.error('\n💥 Fatal error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

main()
