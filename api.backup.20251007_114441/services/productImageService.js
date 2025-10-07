/**
 * Product Image Service
 * CRUD operations for product images
 * Uses stored functions for atomic multi-image operations
 * Uses indexed columns (product_id, size, is_primary)
 */

import { supabase, DB_SCHEMA } from './supabaseClient.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  DatabaseConstraintError,
  BadRequestError
} from '../errors/AppError.js'

const TABLE = DB_SCHEMA.product_images.table
const VALID_SIZES = DB_SCHEMA.product_images.enums.size

/**
 * Validate image data
 */
function validateImageData(data, isUpdate = false) {
  if (!isUpdate) {
    if (!data.product_id || typeof data.product_id !== 'number') {
      throw new ValidationError('Image validation failed', { product_id: 'must be a number' })
    }
    if (!data.image_index || typeof data.image_index !== 'number' || data.image_index <= 0) {
      throw new ValidationError('Image validation failed', {
        image_index: 'must be a positive number'
      })
    }
    if (!data.size || !VALID_SIZES.includes(data.size)) {
      throw new ValidationError('Image validation failed', {
        size: `must be one of ${VALID_SIZES.join(', ')}`
      })
    }
    if (!data.url || typeof data.url !== 'string') {
      throw new ValidationError('Image validation failed', { url: 'must be a non-empty string' })
    }
    if (!data.file_hash || typeof data.file_hash !== 'string') {
      throw new ValidationError('Image validation failed', {
        file_hash: 'must be a non-empty string'
      })
    }
  }

  if (data.size !== undefined && !VALID_SIZES.includes(data.size)) {
    throw new ValidationError('Image validation failed', {
      size: `must be one of ${VALID_SIZES.join(', ')}`
    })
  }

  if (
    data.image_index !== undefined &&
    (typeof data.image_index !== 'number' || data.image_index <= 0)
  ) {
    throw new ValidationError('Image validation failed', {
      image_index: 'must be a positive number'
    })
  }
}

/**
 * Get all images for a product
 */
export async function getProductImages(productId, filters = {}) {
  try {
    if (!productId || typeof productId !== 'number' || productId <= 0) {
      throw new BadRequestError('Invalid product ID: must be a number', { productId })
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
      throw new DatabaseError('SELECT', TABLE, error, { productId })
    }
    if (!data) {
      throw new NotFoundError('Product images', productId, { productId })
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
/**\n * Get primary image for a product (indexed query)\n * Falls back to first available image if no primary image exists\n */
export async function getPrimaryImage(productId) {
  try {
    if (!productId || typeof productId !== 'number' || productId <= 0) {
      throw new BadRequestError('Invalid product ID: must be a number', { productId })
    }

    // First, try to get the actual primary image
    const { data: primaryImage, error: primaryError } = await supabase
      .from(TABLE)
      .select('*')
      .eq('product_id', productId)
      .eq('is_primary', true)
      .eq('size', 'medium')
      .single()

    if (primaryError) {
      if (primaryError.code === 'PGRST116') {
        // No primary image found, try to get the first available image as fallback
        const { data: fallbackImage, error: fallbackError } = await supabase
          .from(TABLE)
          .select('*')
          .eq('product_id', productId)
          .order('image_index', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (fallbackError) {
          throw new DatabaseError('SELECT', TABLE, fallbackError, { productId })
        }

        if (fallbackImage) {
          // Return the fallback image (first available)
          return fallbackImage
        } else {
          // No images at all for this product
          throw new NotFoundError('Primary image', productId, { productId })
        }
      } else {
        throw new DatabaseError('SELECT', TABLE, primaryError, { productId })
      }
    }

    return primaryImage
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
      throw new BadRequestError('Invalid image ID: must be a number', { imageId: id })
    }

    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single()

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error, { imageId: id })
    }
    if (!data) {
      throw new NotFoundError('Image', id)
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
      throw new BadRequestError('Invalid file_hash: must be a string', { fileHash })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('file_hash', fileHash)
      .limit(1)

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error)
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
        throw new DatabaseConstraintError('unique_image', TABLE, {
          product_id: imageData.product_id,
          image_index: imageData.image_index,
          size: imageData.size,
          message: `Image already exists for product ${imageData.product_id}, index ${imageData.image_index}, size ${imageData.size}`
        })
      }
      throw new DatabaseError('INSERT', TABLE, error, { imageData })
    }

    if (!data) {
      throw new DatabaseError('INSERT', TABLE, new Error('No data returned after insert'), {
        imageData
      })
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
      throw new BadRequestError('Invalid product ID: must be a number', { productId })
    }

    if (!imageIndex || typeof imageIndex !== 'number' || imageIndex <= 0) {
      throw new BadRequestError('Invalid image_index: must be a positive number', { imageIndex })
    }

    if (!Array.isArray(imagesData) || imagesData.length === 0) {
      throw new BadRequestError('Invalid imagesData: must be a non-empty array', { imagesData })
    }

    // Validate and prepare each image
    const imagesToInsert = imagesData.map(img => {
      if (!img.size || !VALID_SIZES.includes(img.size)) {
        throw new ValidationError('Image validation failed', {
          size: `must be one of ${VALID_SIZES.join(', ')}`
        })
      }
      if (!img.url || typeof img.url !== 'string') {
        throw new ValidationError('Image validation failed', { url: 'must be a non-empty string' })
      }
      if (!img.file_hash || typeof img.file_hash !== 'string') {
        throw new ValidationError('Image validation failed', {
          file_hash: 'must be a non-empty string'
        })
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
      throw new DatabaseError('INSERT', TABLE, error, { productId, imageIndex })
    }
    if (!data) {
      throw new DatabaseError('INSERT', TABLE, new Error('No data returned after insert'), {
        productId,
        imageIndex
      })
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
      throw new BadRequestError('Invalid image ID: must be a number', { imageId: id })
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new BadRequestError('No updates provided', { imageId: id })
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
      throw new BadRequestError('No valid fields to update', { imageId: id })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(sanitized)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { imageId: id })
    }
    if (!data) {
      throw new NotFoundError('Image', id)
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
      throw new BadRequestError('Invalid product ID: must be a number', { productId })
    }

    if (!imageIndex || typeof imageIndex !== 'number' || imageIndex <= 0) {
      throw new BadRequestError('Invalid image_index: must be a positive number', { imageIndex })
    }

    // Unset all primary images for this product
    const { error: unsetError } = await supabase
      .from(TABLE)
      .update({ is_primary: false })
      .eq('product_id', productId)
      .eq('is_primary', true)

    if (unsetError) {
      throw new DatabaseError('UPDATE', TABLE, unsetError, { productId })
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
      throw new DatabaseError('UPDATE', TABLE, error, { productId, imageIndex })
    }
    if (!data) {
      throw new NotFoundError('Image', `${productId}/${imageIndex}`, { productId, imageIndex })
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
      throw new BadRequestError('Invalid image ID: must be a number', { imageId: id })
    }

    const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select().single()

    if (error) {
      throw new DatabaseError('DELETE', TABLE, error, { imageId: id })
    }
    if (!data) {
      throw new NotFoundError('Image', id)
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
      throw new BadRequestError('Invalid product ID: must be a number', { productId })
    }

    const { data, error } = await supabase.from(TABLE).delete().eq('product_id', productId).select()

    if (error) {
      throw new DatabaseError('DELETE', TABLE, error, { productId })
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
      throw new BadRequestError('Invalid product ID: must be a number', { productId })
    }

    if (!imageIndex || typeof imageIndex !== 'number' || imageIndex <= 0) {
      throw new BadRequestError('Invalid image_index: must be a positive number', { imageIndex })
    }

    // 1. Get images to delete (we need URLs to delete from storage)
    const { data: images, error: selectError } = await supabase
      .from(TABLE)
      .select('*')
      .eq('product_id', productId)
      .eq('image_index', imageIndex)

    if (selectError) {
      throw new DatabaseError('SELECT', TABLE, selectError, { productId, imageIndex })
    }
    if (!images || images.length === 0) {
      throw new NotFoundError('Images', `${productId}/${imageIndex}`, { productId, imageIndex })
    }

    // 2. Extract filename from URL to delete from storage
    // URL format: https://.../storage/v1/object/public/product-images/medium/product_1_1_abc123.webp
    // We need: product_1_1_abc123 (without size prefix and extension)
    const firstImageUrl = images[0].url
    const urlParts = firstImageUrl.split('/')
    const filename = urlParts[urlParts.length - 1] // e.g., product_1_1_abc123.webp
    const filenameBase = filename.replace('.webp', '') // Remove extension

    // 3. Delete from Supabase Storage (all sizes: thumb, small, medium, large)
    const { deleteImageSizes } = await import('./supabaseStorageService.js')
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
      throw new DatabaseError('DELETE', TABLE, error, { productId, imageIndex })
    }

    return data
  } catch (error) {
    console.error(`deleteImagesByIndex(${productId}, ${imageIndex}) failed:`, error)
    throw error
  }
}

/**
 * Get image by product ID and size
 * Fail-fast if product has no image of requested size
 */
export async function getProductImageBySize(productId, size) {
  try {
    if (!productId || typeof productId !== 'number' || productId <= 0) {
      throw new BadRequestError('Invalid product ID: must be a positive number', { productId })
    }

    if (!size || !VALID_SIZES.includes(size)) {
      throw new ValidationError('Invalid size: must be one of ' + VALID_SIZES.join(', '), { size })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('product_id', productId)
      .eq('size', size)
      .order('image_index', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error, { productId, size })
    }

    if (!data) {
      throw new NotFoundError(`No ${size} image found for product`, productId, {
        productId,
        size,
        availableSizes: VALID_SIZES
      })
    }

    return data
  } catch (error) {
    console.error(`getProductImageBySize(${productId}, ${size}) failed:`, error)
    throw error
  }
}

/**
 * Get product with specific image size attached
 * Fail-fast approach - throws error if image doesn't exist
 */
export async function getProductWithImageSize(productId, size) {
  try {
    if (!productId || typeof productId !== 'number' || productId <= 0) {
      throw new BadRequestError('Invalid product ID: must be a positive number', { productId })
    }

    if (!size || !VALID_SIZES.includes(size)) {
      throw new ValidationError('Invalid size: must be one of ' + VALID_SIZES.join(', '), { size })
    }

    // Get the product
    const { data: product, error: productError } = await supabase
      .from(DB_SCHEMA.products.table)
      .select('*')
      .eq('id', productId)
      .single()

    if (productError) {
      throw new DatabaseError('SELECT', DB_SCHEMA.products.table, productError, { productId })
    }

    if (!product) {
      throw new NotFoundError('Product', productId, { productId })
    }

    // Get the specific image
    // Try to get the image but don't fail if it doesn't exist
    const { data: image, error: _imageError } = await supabase
      .from(DB_SCHEMA.product_images.table)
      .select('url')
      .eq('product_id', productId)
      .eq('size', size)
      .order('image_index', { ascending: true })
      .limit(1)
      .maybeSingle()

    // Return product with image URL (null if not found)
    return {
      ...product,
      [`image_url_${size}`]: image?.url || null
    }
  } catch (error) {
    console.error(`getProductWithImageSize(${productId}, ${size}) failed:`, error)
    throw error
  }
}

/**
 * Get multiple products with specific image size attached
 * Uses efficient batch query to avoid N+1 problem
 */
export async function getProductsBatchWithImageSize(productIds, size) {
  try {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new BadRequestError('Invalid product IDs: must be a non-empty array', { productIds })
    }

    if (!size || !VALID_SIZES.includes(size)) {
      throw new ValidationError('Invalid size: must be one of ' + VALID_SIZES.join(', '), { size })
    }

    // Validate all product IDs
    for (const id of productIds) {
      if (!id || typeof id !== 'number' || id <= 0) {
        throw new BadRequestError('Invalid product ID in array: all must be positive numbers', {
          invalidId: id,
          productIds
        })
      }
    }

    // Get products
    const { data: products, error: productError } = await supabase
      .from(DB_SCHEMA.products.table)
      .select('*')
      .in('id', productIds)

    if (productError) {
      throw new DatabaseError('SELECT', DB_SCHEMA.products.table, productError, { productIds })
    }

    if (!products || products.length === 0) {
      throw new NotFoundError('Products', null, { productIds })
    }

    // Find unique product IDs to compare with requested IDs
    const retrievedProductIds = products.map(p => p.id)
    const missingIds = productIds.filter(id => !retrievedProductIds.includes(id))

    if (missingIds.length > 0) {
      throw new NotFoundError('Some products not found', missingIds, {
        missingIds,
        requested: productIds
      })
    }

    // Get images for the specific size for all products
    const { data: images, error: imageError } = await supabase
      .from(TABLE)
      .select('*')
      .in('product_id', productIds)
      .eq('size', size)
      .order('image_index', { ascending: true })

    if (imageError) {
      throw new DatabaseError('SELECT', TABLE, imageError, { productIds, size })
    }

    // Create a map for quick lookup
    const imageMap = new Map()
    for (const img of images || []) {
      imageMap.set(img.product_id, img)
    }

    // Attach the appropriate image to each product
    return products.map(product => {
      const image = imageMap.get(product.id)
      return {
        ...product,
        [`image_url_${size}`]: image?.url || null
      }
    })
  } catch (error) {
    console.error(
      `getProductsBatchWithImageSize(${productIds.length} products, ${size}) failed:`,
      error
    )
    throw error
  }
}

/**
 * Delete all images of specific size for a product
 */
export async function deleteProductImagesBySize(productId, size) {
  try {
    if (!productId || typeof productId !== 'number' || productId <= 0) {
      throw new BadRequestError('Invalid product ID: must be a positive number', { productId })
    }

    if (!size || !VALID_SIZES.includes(size)) {
      throw new ValidationError('Invalid size: must be one of ' + VALID_SIZES.join(', '), { size })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .delete()
      .eq('product_id', productId)
      .eq('size', size)
      .select()

    if (error) {
      throw new DatabaseError('DELETE', TABLE, error, { productId, size })
    }

    return {
      success: true,
      deleted_count: data?.length || 0,
      product_id: productId,
      size: size
    }
  } catch (error) {
    console.error(`deleteProductImagesBySize(${productId}, ${size}) failed:`, error)
    throw error
  }
}
