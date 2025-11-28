/**
 * Procesado por B
 */

/**
 * Product Image Service
 * CRUD operations for product images with soft-delete pattern
 * Uses stored functions for atomic multi-image operations
 * Uses indexed columns (product_id, size, is_primary)
 * Soft-delete implementation using active flag (inactive images excluded by default)
 */

import { supabase, DB_SCHEMA } from './supabaseClient.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  DatabaseConstraintError,
  BadRequestError,
  InternalServerError
} from '../errors/AppError.js'
import { QUERY_LIMITS } from '../config/constants.js'
import { validateProductImage } from '../utils/validation.js'
// import { logger } from '../utils/logger.js'
import { withErrorMapping } from '../middleware/error/index.js'

const TABLE = DB_SCHEMA.product_images?.table || 'product_images'
const VALID_SIZES = DB_SCHEMA.product_images?.enums?.size || ['thumb', 'small', 'medium', 'large']

/**
 * Get all images for a product with optional filtering by size and primary status
 * @param {number} productId - Product ID to get images for
 * @param {Object} [filters={}] - Filter options
 * @param {string} [filters.size] - Filter by image size
 * @param {boolean} [filters.is_primary] - Filter by primary image status
 * @returns {Object[]} - Array of product images ordered by image_index
 * @throws {BadRequestError} When productId is invalid
 * @throws {NotFoundError} When no images are found for the product
 * @throws {DatabaseError} When database query fails
 */
export const getProductImages = withErrorMapping(
  async (productId, filters = {}) => {
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
  },
  'SELECT',
  TABLE
)

/**
 * Get primary image for a product (indexed query)
 * Falls back to first available image if no primary image exists
 */
export const getPrimaryImage = withErrorMapping(
  async productId => {
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
          .limit(QUERY_LIMITS.SINGLE_RECORD)
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
  },
  'SELECT',
  TABLE
)

/**
 * Get image by ID
 * @param {number} id - Image ID to retrieve
 * @param {boolean} includeDeactivated - Include inactive images (default: false, admin only)
 * @returns {Object} - Image object
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When image is not found
 * @throws {DatabaseError} When database query fails
 */
export const getImageById = withErrorMapping(
  async (id, includeDeactivated = false) => {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid image ID: must be a number', { imageId: id })
    }

    let query = supabase.from(TABLE).select('*').eq('id', id)

    // By default, only return active images
    if (!includeDeactivated) {
      query = query.eq('active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error, { imageId: id })
    }
    if (!data) {
      throw new NotFoundError('Image', id)
    }

    return data
  },
  'SELECT',
  TABLE
)

/**
 * Get images by file hash (deduplication check)
 */
export const getImagesByHash = withErrorMapping(
  async fileHash => {
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
  },
  'SELECT',
  TABLE
)

/**
 * Create single image
 */
export const createImage = withErrorMapping(
  async imageData => {
    validateProductImage(imageData, false)

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
      throw new DatabaseError(
        'INSERT',
        TABLE,
        new InternalServerError('No data returned after insert'),
        {
          imageData
        }
      )
    }

    return data
  },
  'INSERT',
  TABLE
)

/**
 * Create multiple images atomically (manual batch insert)
 * Creates all sizes for a single image_index
 */
export const createProductImagesAtomic = withErrorMapping(
  async (productId, imageIndex, imagesData, isPrimary = false) => {
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
      throw new DatabaseError(
        'INSERT',
        TABLE,
        new InternalServerError('No data returned after insert'),
        {
          productId,
          imageIndex
        }
      )
    }

    return data
  },
  'INSERT',
  TABLE
)

/**
 * Update image
 */
export const updateImage = withErrorMapping(
  async (id, updates) => {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid image ID: must be a number', { imageId: id })
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new BadRequestError('No updates provided', { imageId: id })
    }

    validateProductImage(updates, true)

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
  },
  'UPDATE',
  TABLE
)

/**
 * Set primary image
 */
export const setPrimaryImage = withErrorMapping(
  async (productId, imageIndex) => {
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
  },
  'UPDATE',
  TABLE
)

/**
 * Soft-delete single image
 * @param {number} id - Image ID to delete
 * @returns {Object} - Deactivated image
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When image is not found or already inactive
 * @throws {DatabaseError} When database update fails
 */
export const deleteImage = withErrorMapping(
  async id => {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid image ID: must be a number', { imageId: id })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ active: false })
      .eq('id', id)
      .eq('active', true)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { imageId: id })
    }
    if (!data) {
      throw new NotFoundError('Image', id, { active: true })
    }

    return data
  },
  'DELETE',
  TABLE
)

/**
 * Reactivate image (reverse soft-delete)
 * @param {number} id - Image ID to reactivate
 * @returns {Object} - Reactivated image
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When image is not found or already active
 * @throws {DatabaseError} When database update fails
 */
export const reactivateImage = withErrorMapping(
  async id => {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid image ID: must be a number', { imageId: id })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ active: true })
      .eq('id', id)
      .eq('active', false)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { imageId: id })
    }
    if (!data) {
      throw new NotFoundError('Image', id, { active: false })
    }

    return data
  },
  'UPDATE',
  TABLE
)

/**
 * Soft-delete all images for a product
 * @param {number} productId - Product ID to delete images for
 * @returns {Object} - Result with success status and count
 * @throws {BadRequestError} When productId is invalid
 * @throws {DatabaseError} When database update fails
 */
export const deleteProductImagesSafe = withErrorMapping(
  async productId => {
    if (!productId || typeof productId !== 'number') {
      throw new BadRequestError('Invalid product ID: must be a number', { productId })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ active: false })
      .eq('product_id', productId)
      .eq('active', true)
      .select()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { productId })
    }

    return { success: true, deleted_count: data?.length || 0, product_id: productId }
  },
  'DELETE',
  TABLE
)

/**
 * Reactivate all images for a product
 * @param {number} productId - Product ID to reactivate images for
 * @returns {Object} - Result with success status and count
 * @throws {BadRequestError} When productId is invalid
 * @throws {DatabaseError} When database update fails
 */
export const reactivateProductImages = withErrorMapping(
  async productId => {
    if (!productId || typeof productId !== 'number') {
      throw new BadRequestError('Invalid product ID: must be a number', { productId })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ active: true })
      .eq('product_id', productId)
      .eq('active', false)
      .select()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { productId })
    }

    return { success: true, reactivated_count: data?.length || 0, product_id: productId }
  },
  'UPDATE',
  TABLE
)

/**
 * Get image by product ID and size
 * Fail-fast if product has no image of requested size
 */
export const getProductImageBySize = withErrorMapping(
  async (productId, size) => {
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
  },
  'SELECT',
  TABLE
)

/**
 * Get product with specific image size attached
 * Fail-fast approach - throws error if image doesn't exist
 */
export const getProductWithImageSize = withErrorMapping(
  async (productId, size) => {
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
    const { data: image } = await supabase
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
  },
  'SELECT',
  DB_SCHEMA.products.table
)

/**
 * Get multiple products with specific image size attached
 * Uses efficient batch query to avoid N+1 problem
 */
export const getProductsBatchWithImageSize = withErrorMapping(
  async (productIds, size) => {
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
      // Instead of throwing error, just log warning and proceed with found products
      // This prevents partial failures from blocking the entire carousel
      // logger.warn('Some products not found in batch request', { missingIds })
    }

    // Get images for the specific size for all products
    const { data: initialImages, error: imageError } = await supabase
      .from(TABLE)
      .select('*')
      .in('product_id', retrievedProductIds) // Only query for found products
      .eq('size', size)
      .order('image_index', { ascending: true })

    if (imageError) {
      throw new DatabaseError('SELECT', TABLE, imageError, { productIds, size })
    }

    let images = initialImages

    // Fallback to 'large' size if 'small' not found (graceful handling for missing small images)
    if (size === 'small' && (!images || images.length === 0)) {
      const { data: fallbackImages, error: fallbackError } = await supabase
        .from(TABLE)
        .select('*')
        .in('product_id', productIds)
        .eq('size', 'large')
        .order('image_index', { ascending: true })

      if (fallbackError) {
        throw new DatabaseError('SELECT', TABLE, fallbackError, { productIds, size: 'large' })
      }

      images = fallbackImages || []
    }

    // Create a map for quick lookup
    const imageMap = {}
    if (images) {
      images.forEach(img => {
        // Only store the first image found for each product (since we ordered by index)
        if (!imageMap[img.product_id]) {
          imageMap[img.product_id] = img.url
        }
      })
    }

    // Attach image URLs to products
    const productsWithImages = products.map(product => ({
      ...product,
      [`image_url_${size}`]: imageMap[product.id] || null
    }))

    return productsWithImages
  },
  'SELECT',
  DB_SCHEMA.products.table
)

/**
 * Delete all images of specific size for a product
 */
export const deleteProductImagesBySize = withErrorMapping(
  async (productId, size) => {
    if (!productId || typeof productId !== 'number') {
      throw new BadRequestError('Invalid product ID: must be a positive number', { productId })
    }

    if (!size || !VALID_SIZES.includes(size)) {
      throw new ValidationError('Invalid size: must be one of ' + VALID_SIZES.join(', '), { size })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ active: false })
      .eq('product_id', productId)
      .eq('size', size)
      .eq('active', true)
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
  },
  'DELETE',
  TABLE
)
