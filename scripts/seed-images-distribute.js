#!/usr/bin/env node
/**
 * Product Images Seeding Script - DISTRIBUTE MODE
 * Distributes images from img-temp randomly to specified product range
 *
 * Usage: node scripts/seed-images-distribute.js 179 190
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '..')

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const IMG_TEMP_DIR = path.join(PROJECT_ROOT, 'img-temp')
const BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/product-images`

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Get all image files from img-temp directory
 */
function getAllImageUrls() {
  const images = []
  const sizes = ['large', 'medium', 'small']

  for (const size of sizes) {
    const sizeDir = path.join(IMG_TEMP_DIR, size)
    if (!fs.existsSync(sizeDir)) {
      continue
    }

    const files = fs.readdirSync(sizeDir).filter(f => f.endsWith('.webp'))

    console.log(`📂 Found ${files.length} files in ${size}/`)

    for (const file of files) {
      const url = `${BASE_URL}/${size}/${file}`
      images.push({ size, url, filename: file })
    }
  }

  return images
}

/**
 * Group images by size
 */
function groupImagesBySize(images) {
  const grouped = {}

  for (const img of images) {
    if (!grouped[img.size]) {
      grouped[img.size] = []
    }
    grouped[img.size].push(img.url)
  }

  return grouped
}

/**
 * Distribute images to products
 */
async function distributeImages(minProduct, maxProduct) {
  console.log('🌱 Starting image distribution...\n')

  // Validate environment
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing environment variables')
    process.exit(1)
  }

  if (!fs.existsSync(IMG_TEMP_DIR)) {
    console.error(`❌ Directory not found: ${IMG_TEMP_DIR}`)
    process.exit(1)
  }

  console.log(`📂 Reading images from: ${IMG_TEMP_DIR}\n`)

  // Get all images
  const allImages = getAllImageUrls()
  const imagesBySize = groupImagesBySize(allImages)

  const largeImages = imagesBySize.large || []
  const mediumImages = imagesBySize.medium || []
  const smallImages = imagesBySize.small || []

  console.log(`\n✅ Found ${largeImages.length} large images`)
  console.log(`✅ Found ${mediumImages.length} medium images`)
  console.log(`✅ Found ${smallImages.length} small images\n`)

  if (largeImages.length === 0) {
    console.error('❌ No large images found')
    process.exit(1)
  }

  // Create product range
  const productIds = []
  for (let i = minProduct; i <= maxProduct; i++) {
    productIds.push(i)
  }

  console.log(`🎯 Target products: ${productIds.join(', ')} (${productIds.length} products)`)
  console.log(`🎲 Distributing ${largeImages.length} images across ${productIds.length} products\n`)

  // Confirmation
  console.log('⚠️  This will insert images into product_images table.')
  console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...\n')
  await new Promise(resolve => setTimeout(resolve, 3000))

  // Shuffle images for random distribution
  const shuffled = [...largeImages].sort(() => Math.random() - 0.5)

  let inserted = 0
  let errors = 0

  // Distribute images
  for (let i = 0; i < shuffled.length; i++) {
    const productId = productIds[i % productIds.length]
    const sequenceInProduct = Math.floor(i / productIds.length) + 1

    const largeUrl = shuffled[i]
    const mediumUrl = mediumImages[i] || null
    const smallUrl = smallImages[i] || null

    try {
      const { error } = await supabase.from('product_images').insert({
        product_id: productId,
        image_url: largeUrl,
        medium_url: mediumUrl,
        thumbnail_url: smallUrl,
        display_order: sequenceInProduct,
        is_primary: sequenceInProduct === 1,
        active: true
      })

      if (error) {
        console.error(`❌ Error for product ${productId}:`, error.message)
        errors++
      } else {
        console.log(
          `✅ [${i + 1}/${shuffled.length}] Product ${productId} - Image ${sequenceInProduct}`
        )
        inserted++
      }
    } catch (err) {
      console.error(`❌ Exception for product ${productId}:`, err.message)
      errors++
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Distribution Summary')
  console.log('='.repeat(60))
  console.log(`✅ Successfully inserted: ${inserted}`)
  console.log(`❌ Errors: ${errors}`)
  console.log(`📋 Total images: ${shuffled.length}`)
  console.log(`🎯 Products affected: ${productIds.length}`)
  console.log(`📊 Images per product: ~${Math.ceil(shuffled.length / productIds.length)}`)
  console.log('='.repeat(60) + '\n')
}

// Parse arguments
const args = process.argv.slice(2)
if (args.length !== 2) {
  console.error('❌ Usage: node seed-images-distribute.js <minProduct> <maxProduct>')
  console.error('   Example: node seed-images-distribute.js 179 190')
  process.exit(1)
}

const minProduct = parseInt(args[0])
const maxProduct = parseInt(args[1])

if (isNaN(minProduct) || isNaN(maxProduct) || minProduct > maxProduct) {
  console.error('❌ Invalid product range')
  process.exit(1)
}

// Run distribution
distributeImages(minProduct, maxProduct).catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
