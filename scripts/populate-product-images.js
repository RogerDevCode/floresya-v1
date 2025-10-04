/**
 * 🌸 FloresYa Product Images Population Script (KISS Refactored)
 *
 * WHAT: Clears product_images table and assigns image groups to all products
 * HOW: Uses round-robin distribution to assign image groups (4 sizes each) to products
 * WHY: Ensures each product has images with primary large image marked correctly
 *
 * Features:
 * - Deletes all existing product-image relations
 * - Reads from Supabase storage bucket 'product-images' in 4 size folders
 * - Groups images by format: product_{id}_{seq}-{hash}.webp
 * - Each product gets up to 5 image groups (20 total images max)
 * - Large size marked as primary, hash extracted from filename
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('   Expected: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Configuration
const IMAGE_SIZES = ['thumb', 'small', 'medium', 'large']
const BUCKET_NAME = 'product-images'
const MAX_IMAGES_PER_PRODUCT = 5 // 5 groups of 4 images each
const BATCH_SIZE = 50

/**
 * Parse filename to extract metadata
 * Format: product_{id}_{seq}-{hash}.webp
 */
function parseImageFilename(filename) {
  const match = filename.match(/^product_(\d+)_(\d+)_([a-f0-9]{64})\.webp$/)
  if (!match) {
    return null
  }

  const [, productId, seq, hash] = match
  return {
    productId: parseInt(productId),
    seq: parseInt(seq),
    hash,
    filename
  }
}

/**
 * Load all images from Supabase Storage and group by productId and seq
 */
async function loadImagesFromStorage() {
  console.log('📸 Loading images from Supabase Storage...')

  // Map to store images by their group (productId + seq combination)
  const imageGroups = new Map()

  for (const size of IMAGE_SIZES) {
    console.log(`   📁 Reading folder: ${size}/`)

    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(size, { limit: 1000 })

    if (error) {
      console.error(`❌ Error reading folder ${size}:`, error.message)
      throw error
    }

    console.log(`   📋 Found ${files?.length || 0} files in ${size}/`)

    if (files) {
      for (const file of files) {
        const parsed = parseImageFilename(file.name)
        if (parsed) {
          // Create a unique key from productId and seq (this represents an image group)
          const groupKey = `${parsed.productId}-${parsed.seq}`

          if (!imageGroups.has(groupKey)) {
            imageGroups.set(groupKey, {})
          }

          imageGroups.get(groupKey)[size] = {
            filename: file.name,
            url: `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${size}/${file.name}`,
            hash: parsed.hash
          }
        } else {
          console.warn(`⚠️ Unrecognized filename: ${file.name}`)
        }
      }
    }
  }

  // Filter to only complete groups (all 4 sizes present)
  const completeGroups = []
  for (const [groupKey, group] of imageGroups.entries()) {
    if (IMAGE_SIZES.every(size => group[size])) {
      completeGroups.push({
        key: groupKey,
        images: group
      })
    } else {
      const missingSizes = IMAGE_SIZES.filter(size => !group[size])
      console.warn(`⚠️ Incomplete group ${groupKey} - missing: ${missingSizes.join(', ')}`)
    }
  }

  console.log(`✅ Found ${completeGroups.length} complete image groups`)
  return completeGroups
}

/**
 * Get active products from database
 */
async function getProducts() {
  console.log('🌸 Getting active products from database...')

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, sku')
    .eq('active', true)
    .order('id')

  if (error) {
    console.error('❌ Error getting products:', error.message)
    throw error
  }

  if (!products || products.length === 0) {
    throw new Error('No active products found in database')
  }

  console.log(`✅ Found ${products.length} active products`)
  return products
}

/**
 * Clear existing product images
 */
async function clearExistingImages() {
  console.log('🗑️ Clearing existing product images...')

  const { error } = await supabase.from('product_images').delete().neq('id', 0) // Delete all records by using a condition that includes all

  if (error) {
    console.error('❌ Error clearing images:', error.message)
    throw error
  }

  console.log('✅ Existing images cleared')
}

/**
 * Assign image groups to products
 */
async function assignImagesToProducts(products, imageGroups) {
  console.log('🔄 Assigning image groups to products...')

  if (imageGroups.length === 0) {
    console.warn('⚠️ No image groups available')
    return 0
  }

  if (products.length === 0) {
    console.warn('⚠️ No products available')
    return 0
  }

  await clearExistingImages()

  // Create records array
  const records = []

  // Distribute image groups to products using round-robin approach
  for (let i = 0; i < imageGroups.length; i++) {
    const productIndex = i % products.length // Round-robin assignment
    const product = products[productIndex]
    const imageGroup = imageGroups[i]

    // Calculate the image index for this group (1-based, max 5 per product)
    // We need to determine how many images this product already has
    const imageIndex = Math.floor(i / products.length) + 1

    if (imageIndex > MAX_IMAGES_PER_PRODUCT) {
      console.log(
        `⚠️ Max images per product (${MAX_IMAGES_PER_PRODUCT}) reached. Stopping assignment.`
      )
      break
    }

    // Create records for all 4 sizes in this group
    for (const size of IMAGE_SIZES) {
      const imageData = imageGroup.images[size]
      records.push({
        product_id: product.id,
        url: imageData.url,
        size: size,
        image_index: imageIndex,
        is_primary: size === 'large' && imageIndex === 1, // Only first large image is primary
        mime_type: 'image/webp',
        file_hash: imageData.hash, // Use hash from filename as requested
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
  }

  console.log(`📝 Prepared ${records.length} image records for insertion`)

  // Insert records in batches
  let insertedCount = 0
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)

    const { error } = await supabase.from('product_images').insert(batch)

    if (error) {
      console.error('❌ Error inserting batch:', error.message)
      throw error
    }

    insertedCount += batch.length
    console.log(`   ✅ Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} records)`)
  }

  console.log(`🎉 Successfully assigned ${insertedCount} images to products!`)

  // Print summary
  const productsWithImages = Math.min(
    products.length,
    Math.ceil(imageGroups.length / MAX_IMAGES_PER_PRODUCT)
  )
  const groupsAssigned = Math.min(imageGroups.length, products.length * MAX_IMAGES_PER_PRODUCT)

  console.log('\n📊 Assignment Summary:')
  console.log(`   • Total products: ${products.length}`)
  console.log(`   • Image groups available: ${imageGroups.length}`)
  console.log(`   • Products with images: ${productsWithImages}`)
  console.log(`   • Groups assigned: ${groupsAssigned}`)
  console.log(`   • Records inserted: ${insertedCount} (${insertedCount / 4} image groups)`)
  console.log(`   • Max images per product: ${MAX_IMAGES_PER_PRODUCT} groups (4 images each)`)

  return insertedCount
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🌸 Starting product images population...\n')

    // Load images from storage
    const imageGroups = await loadImagesFromStorage()

    if (imageGroups.length === 0) {
      throw new Error('No complete image groups found in storage')
    }

    // Get products from database
    const products = await getProducts()

    if (products.length === 0) {
      throw new Error('No active products found in database')
    }

    // Assign images to products
    const insertedCount = await assignImagesToProducts(products, imageGroups)

    console.log('\n✅ Product images population completed successfully!')
    console.log(`📊 Total records inserted: ${insertedCount}`)
  } catch (error) {
    console.error('💥 Error during image population:', error)
    process.exit(1)
  }
}

// Execute main function
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main as populateProductImages }
