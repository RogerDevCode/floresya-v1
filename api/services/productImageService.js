/**
 * Product Image Service
 * CRUD operations for product images
 * Uses stored functions for atomic multi-image operations
 * Uses indexed columns (product_id, size, is_primary)
 */

import { supabase, DB_SCHEMA } from './supabaseClient.js'

const TABLE = DB_SCHEMA.product_images.table
const VALID_SIZES = DB_SCHEMA.product_images.enums.size

/**
 * Validate image data
 */
function validateImageData(data, isUpdate = false) {
  if (!isUpdate) {
    if (!data.product_id || typeof data.product_id !== 'number') {
      throw new Error('Invalid product_id: must be a number')
    }
    if (!data.image_index || typeof data.image_index !== 'number' || data.image_index <= 0) {
      throw new Error('Invalid image_index: must be a positive number')
    }
    if (!data.size || !VALID_SIZES.includes(data.size)) {
      throw new Error(`Invalid size: must be one of ${VALID_SIZES.join(', ')}`)
    }
    if (!data.url || typeof data.url !== 'string') {
      throw new Error('Invalid url: must be a non-empty string')
    }
    if (!data.file_hash || typeof data.file_hash !== 'string') {
      throw new Error('Invalid file_hash: must be a non-empty string')
    }
  }

  if (data.size !== undefined && !VALID_SIZES.includes(data.size)) {
    throw new Error(`Invalid size: must be one of ${VALID_SIZES.join(', ')}`)
  }

  if (
    data.image_index !== undefined &&
    (typeof data.image_index !== 'number' || data.image_index <= 0)
  ) {
    throw new Error('Invalid image_index: must be a positive number')
  }
}

/**
 * Get all images for a product
 */
export async function getProductImages(productId, filters = {}) {
  try {
    if (!productId || typeof productId !== 'number' || productId <= 0) {
      throw new Error('Invalid product ID: must be a number')
    }

    let query = supabase.from(TABLE).select('*').eq('product_id', productId)

    if (filters.size && VALID_SIZES.includes(filters.size)) {
      query = query.eq('size', filters.size)
    }

    if (filters.is_primary !== undefined) {
      query = query.eq('is_primary', filters.is_primary)
    }

    query = query.order('image_index', { ascending: true })

    const { data, error } = await query

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error('No images found')
    }

    return data
  } catch (error) {
    console.error(`getProductImages(${productId}) failed:`, error)
    throw error
  }
}

/**
 * Get primary image for a product (indexed query)
 */
export async function getPrimaryImage(productId) {
  try {
    if (!productId || typeof productId !== 'number' || productId <= 0) {
      throw new Error('Invalid product ID: must be a number')
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('product_id', productId)
      .eq('is_primary', true)
      .eq('size', 'medium')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`No primary image found for product ${productId}`)
      }
      throw new Error(`Database error: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error(`getPrimaryImage(${productId}) failed:`, error)
    throw error
  }
}

/**
 * Get image by ID
 */
export async function getImageById(id) {
  try {
    if (!id || typeof id !== 'number') {
      throw new Error('Invalid image ID: must be a number')
    }

    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error(`Image ${id} not found`)
    }

    return data
  } catch (error) {
    console.error(`getImageById(${id}) failed:`, error)
    throw error
  }
}

/**
 * Get images by file hash (deduplication check)
 */
export async function getImagesByHash(fileHash) {
  try {
    if (!fileHash || typeof fileHash !== 'string') {
      throw new Error('Invalid file_hash: must be a string')
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('file_hash', fileHash)
      .limit(1)

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error(`getImagesByHash(${fileHash}) failed:`, error)
    throw error
  }
}

/**
 * Create single image
 */
export async function createImage(imageData) {
  try {
    validateImageData(imageData, false)

    const newImage = {
      product_id: imageData.product_id,
      image_index: imageData.image_index,
      size: imageData.size,
      url: imageData.url,
      file_hash: imageData.file_hash,
      mime_type: imageData.mime_type || 'image/webp',
      is_primary: imageData.is_primary || false
    }

    const { data, error } = await supabase.from(TABLE).insert(newImage).select().single()

    if (error) {
      if (error.code === '23505') {
        throw new Error(
          `Image already exists for product ${imageData.product_id}, index ${imageData.image_index}, size ${imageData.size}`
        )
      }
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data) {
      throw new Error('Failed to create image')
    }

    return data
  } catch (error) {
    console.error('createImage failed:', error)
    throw error
  }
}

/**
 * Create multiple images atomically (manual batch insert)
 * Creates all sizes for a single image_index
 */
export async function createProductImagesAtomic(
  productId,
  imageIndex,
  imagesData,
  isPrimary = false
) {
  try {
    if (!productId || typeof productId !== 'number') {
      throw new Error('Invalid product ID: must be a number')
    }

    if (!imageIndex || typeof imageIndex !== 'number' || imageIndex <= 0) {
      throw new Error('Invalid image_index: must be a positive number')
    }

    if (!Array.isArray(imagesData) || imagesData.length === 0) {
      throw new Error('Invalid imagesData: must be a non-empty array')
    }

    // Validate and prepare each image
    const imagesToInsert = imagesData.map(img => {
      if (!img.size || !VALID_SIZES.includes(img.size)) {
        throw new Error(`Invalid size: must be one of ${VALID_SIZES.join(', ')}`)
      }
      if (!img.url || typeof img.url !== 'string') {
        throw new Error('Invalid url: must be a non-empty string')
      }
      if (!img.file_hash || typeof img.file_hash !== 'string') {
        throw new Error('Invalid file_hash: must be a non-empty string')
      }

      return {
        product_id: productId,
        image_index: imageIndex,
        size: img.size,
        url: img.url,
        file_hash: img.file_hash,
        mime_type: img.mime_type || 'image/webp',
        // IMPORTANT: Only ONE image can be primary per product (DB constraint)
        // Mark only the 'medium' size as primary when isPrimary=true
        is_primary: isPrimary && img.size === 'medium'
      }
    })

    const { data, error } = await supabase.from(TABLE).insert(imagesToInsert).select()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error('Failed to create product images')
    }

    return data
  } catch (error) {
    console.error(`createProductImagesAtomic(${productId}) failed:`, error)
    throw error
  }
}

/**
 * Update image
 */
export async function updateImage(id, updates) {
  try {
    if (!id || typeof id !== 'number') {
      throw new Error('Invalid image ID: must be a number')
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('No updates provided')
    }

    validateImageData(updates, true)

    const allowedFields = ['url', 'file_hash', 'mime_type', 'is_primary']
    const sanitized = {}

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        sanitized[key] = updates[key]
      }
    }

    if (Object.keys(sanitized).length === 0) {
      throw new Error('No valid fields to update')
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(sanitized)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error(`Image ${id} not found`)
    }

    return data
  } catch (error) {
    console.error(`updateImage(${id}) failed:`, error)
    throw error
  }
}

/**
 * Set primary image
 */
export async function setPrimaryImage(productId, imageIndex) {
  try {
    if (!productId || typeof productId !== 'number') {
      throw new Error('Invalid product ID: must be a number')
    }

    if (!imageIndex || typeof imageIndex !== 'number' || imageIndex <= 0) {
      throw new Error('Invalid image_index: must be a positive number')
    }

    // Unset all primary images for this product
    const { error: unsetError } = await supabase
      .from(TABLE)
      .update({ is_primary: false })
      .eq('product_id', productId)
      .eq('is_primary', true)

    if (unsetError) {
      throw new Error(`Failed to unset primary images: ${unsetError.message}`)
    }

    // Set new primary image (only medium size)
    const { data, error } = await supabase
      .from(TABLE)
      .update({ is_primary: true })
      .eq('product_id', productId)
      .eq('image_index', imageIndex)
      .eq('size', 'medium')
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error(`Image not found for product ${productId}, index ${imageIndex}`)
    }

    return data
  } catch (error) {
    console.error(`setPrimaryImage(${productId}, ${imageIndex}) failed:`, error)
    throw error
  }
}

/**
 * Delete single image
 */
export async function deleteImage(id) {
  try {
    if (!id || typeof id !== 'number') {
      throw new Error('Invalid image ID: must be a number')
    }

    const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select().single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error(`Image ${id} not found`)
    }

    return data
  } catch (error) {
    console.error(`deleteImage(${id}) failed:`, error)
    throw error
  }
}

/**
 * Delete all images for a product (direct delete)
 */
export async function deleteProductImagesSafe(productId) {
  try {
    if (!productId || typeof productId !== 'number') {
      throw new Error('Invalid product ID: must be a number')
    }

    const { data, error } = await supabase.from(TABLE).delete().eq('product_id', productId).select()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return { success: true, deleted_count: data?.length || 0, product_id: productId }
  } catch (error) {
    console.error(`deleteProductImagesSafe(${productId}) failed:`, error)
    throw error
  }
}

/**
 * Delete images by image_index (all sizes)
 */
export async function deleteImagesByIndex(productId, imageIndex) {
  try {
    if (!productId || typeof productId !== 'number') {
      throw new Error('Invalid product ID: must be a number')
    }

    if (!imageIndex || typeof imageIndex !== 'number' || imageIndex <= 0) {
      throw new Error('Invalid image_index: must be a positive number')
    }

    // 1. Get images to delete (we need URLs to delete from storage)
    const { data: images, error: selectError } = await supabase
      .from(TABLE)
      .select('*')
      .eq('product_id', productId)
      .eq('image_index', imageIndex)

    if (selectError) {
      throw new Error(`Database error: ${selectError.message}`)
    }
    if (!images || images.length === 0) {
      throw new Error(`No images found for product ${productId}, index ${imageIndex}`)
    }

    // 2. Extract filename from URL to delete from storage
    // URL format: https://.../storage/v1/object/public/product-images/medium/product_1_1_abc123.webp
    // We need: product_1_1_abc123 (without size prefix and extension)
    const firstImageUrl = images[0].url
    const urlParts = firstImageUrl.split('/')
    const filename = urlParts[urlParts.length - 1] // e.g., product_1_1_abc123.webp
    const filenameBase = filename.replace('.webp', '') // Remove extension

    // 3. Delete from Supabase Storage (all sizes: thumb, small, medium, large)
    const { deleteImageSizes } = await import('../utils/supabaseStorage.js')
    try {
      await deleteImageSizes(filenameBase)
      console.log(`✓ Deleted ${filenameBase} from storage (all sizes)`)
    } catch (storageError) {
      console.warn('Failed to delete from storage:', storageError.message)
      // Continue to delete from database even if storage deletion fails
    }

    // 4. Delete from database
    const { data, error } = await supabase
      .from(TABLE)
      .delete()
      .eq('product_id', productId)
      .eq('image_index', imageIndex)
      .select()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error(`deleteImagesByIndex(${productId}, ${imageIndex}) failed:`, error)
    throw error
  }
}
