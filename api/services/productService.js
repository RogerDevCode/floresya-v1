/**
 * Product Service
 * Full CRUD operations with soft-delete (active flag)
 * Uses stored functions for atomic operations
 * Uses indexed columns (sku, active, featured, carousel_order)
 * ENTERPRISE FAIL-FAST: All errors use custom error classes with metadata
 */

import { supabase, DB_SCHEMA } from './supabaseClient.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  DatabaseConstraintError,
  InsufficientStockError,
  BadRequestError
} from '../errors/AppError.js'
import { buildSearchCondition } from '../utils/normalize.js'
import { sanitizeProductData } from '../utils/sanitize.js'

const TABLE = DB_SCHEMA.products.table
const SEARCH_COLUMNS = DB_SCHEMA.products.search

/**
 * Validate product data (ENTERPRISE FAIL-FAST)
 * @throws {ValidationError} With detailed field-level validation errors
 */
function validateProductData(data, isUpdate = false) {
  const errors = {}

  // Required fields for creation
  if (!isUpdate) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      errors.name = 'Name is required and must be a non-empty string'
    }
    if (!data.price_usd || typeof data.price_usd !== 'number' || data.price_usd <= 0) {
      errors.price_usd = 'Price USD is required and must be a positive number'
    }
  }

  // Optional/update fields
  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim() === '') {
      errors.name = 'Name must be a non-empty string'
    } else if (data.name.length > 255) {
      errors.name = 'Name must not exceed 255 characters'
    }
  }

  if (data.price_usd !== undefined) {
    if (typeof data.price_usd !== 'number' || data.price_usd <= 0) {
      errors.price_usd = 'Price USD must be a positive number'
    }
  }

  if (data.price_ves !== undefined && data.price_ves !== null) {
    if (typeof data.price_ves !== 'number' || data.price_ves < 0) {
      errors.price_ves = 'Price VES must be a non-negative number'
    }
  }

  if (data.stock !== undefined) {
    if (typeof data.stock !== 'number' || data.stock < 0 || !Number.isInteger(data.stock)) {
      errors.stock = 'Stock must be a non-negative integer'
    }
  }

  if (data.carousel_order !== undefined && data.carousel_order !== null) {
    if (
      typeof data.carousel_order !== 'number' ||
      data.carousel_order < 0 ||
      !Number.isInteger(data.carousel_order)
    ) {
      errors.carousel_order = 'Carousel order must be a non-negative integer'
    }
  }

  if (data.sku !== undefined && data.sku !== null) {
    if (typeof data.sku !== 'string' || data.sku.trim() === '') {
      errors.sku = 'SKU must be a non-empty string'
    } else if (data.sku.length > 50) {
      errors.sku = 'SKU must not exceed 50 characters'
    }
  }

  // Throw if validation errors exist
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Product validation failed', errors)
  }
}

/**
 * Get all products with filters
 * @param {Object} filters - Filter options
 * @param {boolean} includeInactive - Include inactive products (default: false, admin only)
 */
export async function getAllProducts(
  filters = {},
  includeInactive = false,
  includeImageSize = null
) {
  try {
    // If filtering by occasion slug, first resolve it to occasion_id
    let occasionId = null
    if (filters.occasion) {
      const { data: occasionData, error: occasionError } = await supabase
        .from(DB_SCHEMA.occasions.table)
        .select('id')
        .eq('slug', filters.occasion)
        .eq('is_active', true)
        .single()

      if (occasionError || !occasionData) {
        console.warn(`Occasion not found for slug: ${filters.occasion}`)
        return []
      }

      occasionId = occasionData.id
      console.log(`🔍 Resolved occasion slug "${filters.occasion}" to ID ${occasionId}`)
    }

    let query

    // If filtering by occasion, join with product_occasions
    if (occasionId) {
      query = supabase
        .from(TABLE)
        .select(`*, product_occasions!inner(occasion_id)`)
        .eq('product_occasions.occasion_id', occasionId)
    } else {
      query = supabase.from(TABLE).select('*')
    }

    // By default, only return active products
    if (!includeInactive) {
      query = query.eq('active', true)
    }

    // Indexed filters
    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }

    if (filters.sku) {
      query = query.eq('sku', filters.sku)
    }

    // Text search (uses indexed normalized columns for accent-insensitive search)
    const searchCondition = buildSearchCondition(SEARCH_COLUMNS, filters.search)
    if (searchCondition) {
      query = query.or(searchCondition)
    }

    // Sorting
    if (filters.sortBy === 'carousel_order') {
      query = query.order('carousel_order', { ascending: true, nullsLast: true })
    } else if (filters.sortBy === 'price_asc') {
      query = query.order('price_usd', { ascending: true })
    } else if (filters.sortBy === 'price_desc') {
      query = query.order('price_usd', { ascending: false })
    } else if (filters.sortBy === 'name_asc') {
      query = query.order('name', { ascending: true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    if (filters.limit) {
      console.log(`🔧 Applying limit: ${filters.limit} (type: ${typeof filters.limit})`)
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      console.log(`🔧 Applying offset: ${filters.offset}`)
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    console.log(`🔍 Query filters:`, { ...filters, occasionId, includeInactive, includeImageSize })

    const { data: products, error } = await query

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error, { filters, includeInactive })
    }
    if (!products || products.length === 0) {
      console.log('No products found for filters:', filters)
      return []
    }

    console.log(`📦 getAllProducts: Found ${products.length} products before fetching images`)

    // If no image size requested, return products without images (to maintain current behavior)
    if (!includeImageSize) {
      return products
    }

    // Extract product IDs for batch processing to avoid N+1 problem
    const productIds = products.map(p => p.id)

    // Use the new specialized service function to get products with requested image size
    const { getProductsBatchWithImageSize } = await import('./productImageService.js')
    return await getProductsBatchWithImageSize(productIds, includeImageSize)
  } catch (error) {
    console.error('getAllProducts failed:', error)
    throw error
  }
}

/**
 * Get product by ID
 * @param {number} id - Product ID
 * @param {boolean} includeInactive - Include inactive products (default: false, admin only)
 */
export async function getProductById(id, includeInactive = false, includeImageSize = null) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid product ID: must be a number', { productId: id })
    }

    let query = supabase.from(TABLE).select('*').eq('id', id)

    // By default, only return active products
    if (!includeInactive) {
      query = query.eq('active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Product', id, { includeInactive })
      }
      throw new DatabaseError('SELECT', TABLE, error, { productId: id })
    }

    if (!data) {
      throw new NotFoundError('Product', id, { includeInactive })
    }

    // If no image size requested, return product without additional image
    if (!includeImageSize) {
      return data
    }

    // Use the new specialized service function to get product with specific image size
    const { getProductWithImageSize } = await import('./productImageService.js')
    return await getProductWithImageSize(id, includeImageSize)
  } catch (error) {
    // Re-throw AppError instances as-is (fail-fast)
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    // Wrap unexpected errors
    console.error(`getProductById(${id}) failed:`, error)
    throw new DatabaseError('SELECT', TABLE, error, { productId: id })
  }
}

/**
 * Get product by SKU (indexed column)
 */
export async function getProductBySku(sku) {
  try {
    if (!sku || typeof sku !== 'string') {
      throw new BadRequestError('Invalid SKU: must be a string', { sku })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('sku', sku)
      .eq('active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Product', sku, { sku })
      }
      throw new DatabaseError('SELECT', TABLE, error, { sku })
    }

    return data
  } catch (error) {
    console.error(`getProductBySku(${sku}) failed:`, error)
    throw error
  }
}

/**
 * Get products with occasions (using join query instead of stored function)
 */
export async function getProductsWithOccasions(limit = 50, offset = 0) {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select(
        `
        *,
        product_occasions (
          occasion_id,
          occasions (
            id,
            name,
            slug
          )
        )
      `
      )
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error)
    }
    if (!data) {
      throw new NotFoundError('Products')
    }

    return data
  } catch (error) {
    console.error('getProductsWithOccasions failed:', error)
    throw error
  }
}

/**
 * Get products by occasion ID (using join query instead of stored function)
 */
export async function getProductsByOccasion(occasionId, limit = 50) {
  try {
    if (!occasionId || typeof occasionId !== 'number') {
      throw new BadRequestError('Invalid occasion ID: must be a number', { occasionId })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select(`*, product_occasions!inner(occasion_id)`)
      .eq('product_occasions.occasion_id', occasionId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error, { occasionId })
    }
    if (!data) {
      throw new NotFoundError('Products for occasion', occasionId, { occasionId })
    }

    return data
  } catch (error) {
    console.error(`getProductsByOccasion(${occasionId}) failed:`, error)
    throw error
  }
}

/**
 * Get products in carousel (carousel_order IS NOT NULL)
 * Includes primary image in 'thumb' size (150x150px) for carousel display
 */
export async function getCarouselProducts() {
  try {
    const { data: products, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('active', true)
      .not('carousel_order', 'is', null)
      .order('carousel_order', { ascending: true })
      .limit(7)

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error)
    }
    if (!products || products.length === 0) {
      throw new NotFoundError('Carousel products')
    }

    // Extract product IDs for batch processing to avoid N+1 problem
    const productIds = products.map(p => p.id)

    // Use the new specialized service function to get products with small images (300x300px)
    const { getProductsBatchWithImageSize } = await import('./productImageService.js')
    return await getProductsBatchWithImageSize(productIds, 'small')
  } catch (error) {
    console.error('getCarouselProducts failed:', error)
    throw error
  }
}

/**
 * Create product (simple)
 */
export async function createProduct(productData) {
  try {
    validateProductData(productData, false)

    // Sanitize data before database operations
    const sanitizedData = sanitizeProductData(productData, false)

    const newProduct = {
      name: sanitizedData.name,
      summary: sanitizedData.summary || null,
      description: sanitizedData.description || null,
      price_usd: sanitizedData.price_usd,
      price_ves: sanitizedData.price_ves || null,
      stock: sanitizedData.stock || 0,
      sku: sanitizedData.sku || null,
      active: true,
      featured: sanitizedData.featured || false,
      carousel_order: sanitizedData.carousel_order || null
    }

    const { data, error } = await supabase.from(TABLE).insert(newProduct).select().single()

    if (error) {
      // PostgreSQL unique constraint violation (duplicate SKU)
      if (error.code === '23505') {
        throw new DatabaseConstraintError('unique_sku', TABLE, {
          sku: productData.sku,
          message: `Product with SKU ${productData.sku} already exists`
        })
      }
      throw new DatabaseError('INSERT', TABLE, error, { productData: newProduct })
    }

    if (!data) {
      throw new DatabaseError('INSERT', TABLE, new Error('No data returned after insert'), {
        productData: newProduct
      })
    }

    return data
  } catch (error) {
    // Re-throw AppError instances as-is (fail-fast)
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error('createProduct failed:', error)
    throw new DatabaseError('INSERT', TABLE, error, { productData })
  }
}

/**
 * Create product with occasions (manual transaction)
 */
export async function createProductWithOccasions(productData, occasionIds = []) {
  try {
    validateProductData(productData, false)

    if (!Array.isArray(occasionIds)) {
      throw new BadRequestError('Invalid occasionIds: must be an array', { occasionIds })
    }

    // Step 1: Create product
    const product = await createProduct(productData)

    // Step 2: Create product_occasions entries if occasionIds provided
    if (occasionIds.length > 0) {
      const occasionEntries = occasionIds.map(occasionId => ({
        product_id: product.id,
        occasion_id: occasionId
      }))

      const { error: occasionError } = await supabase
        .from('product_occasions')
        .insert(occasionEntries)

      if (occasionError) {
        // Rollback: delete product
        await supabase.from(TABLE).delete().eq('id', product.id)
        throw new DatabaseError('INSERT', 'product_occasions', occasionError, {
          productId: product.id,
          occasionIds
        })
      }
    }

    return product
  } catch (error) {
    console.error('createProductWithOccasions failed:', error)
    throw error
  }
}

/**
 * Update product
 */
export async function updateProduct(id, updates) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid product ID: must be a number', { productId: id })
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new BadRequestError('No updates provided', { productId: id })
    }

    validateProductData(updates, true)

    // Sanitize data before database operations
    const sanitizedData = sanitizeProductData(updates, true)

    const allowedFields = [
      'name',
      'summary',
      'description',
      'price_usd',
      'price_ves',
      'stock',
      'sku',
      'featured',
      'carousel_order'
    ]
    const sanitized = {}

    for (const key of allowedFields) {
      if (sanitizedData[key] !== undefined) {
        sanitized[key] = sanitizedData[key]
      }
    }

    if (Object.keys(sanitized).length === 0) {
      throw new BadRequestError('No valid fields to update', { productId: id })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(sanitized)
      .eq('id', id)
      .eq('active', true)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new DatabaseConstraintError('unique_sku', TABLE, {
          sku: updates.sku,
          message: `Product with SKU ${updates.sku} already exists`
        })
      }
      throw new DatabaseError('UPDATE', TABLE, error, { productId: id })
    }

    if (!data) {
      throw new NotFoundError('Product', id, { includeInactive: false })
    }

    return data
  } catch (error) {
    console.error(`updateProduct(${id}) failed:`, error)
    throw error
  }
}

/**
 * Update carousel order (direct update)
 */
export async function updateCarouselOrder(productId, newOrder) {
  try {
    if (!productId || typeof productId !== 'number') {
      throw new BadRequestError('Invalid product ID: must be a number', { productId })
    }

    if (newOrder !== null && (typeof newOrder !== 'number' || newOrder < 0 || newOrder > 7)) {
      throw new BadRequestError('Invalid carousel_order: must be between 0-7 or null', { newOrder })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ carousel_order: newOrder })
      .eq('id', productId)
      .eq('active', true)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { productId })
    }
    if (!data) {
      throw new DatabaseError('UPDATE', TABLE, new Error('No data returned'), { productId })
    }

    return data
  } catch (error) {
    console.error(`updateCarouselOrder(${productId}) failed:`, error)
    throw error
  }
}

/**
 * Soft-delete product
 */
export async function deleteProduct(id) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid product ID: must be a number', { productId: id })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ active: false })
      .eq('id', id)
      .eq('active', true)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { productId: id })
    }
    if (!data) {
      throw new NotFoundError('Product', id, { active: true })
    }

    return data
  } catch (error) {
    console.error(`deleteProduct(${id}) failed:`, error)
    throw error
  }
}

/**
 * Reactivate product
 */
export async function reactivateProduct(id) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid product ID: must be a number', { productId: id })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ active: true })
      .eq('id', id)
      .eq('active', false)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { productId: id })
    }
    if (!data) {
      throw new NotFoundError('Product', id, { active: false })
    }

    return data
  } catch (error) {
    console.error(`reactivateProduct(${id}) failed:`, error)
    throw error
  }
}

/**
 * Update stock
 */
export async function updateStock(id, quantity) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid product ID: must be a number', { productId: id })
    }

    if (typeof quantity !== 'number' || quantity < 0) {
      throw new BadRequestError('Invalid quantity: must be a non-negative number', { quantity })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ stock: quantity })
      .eq('id', id)
      .eq('active', true)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { productId: id })
    }
    if (!data) {
      throw new NotFoundError('Product', id, { active: true })
    }

    return data
  } catch (error) {
    console.error(`updateStock(${id}) failed:`, error)
    throw error
  }
}

/**
 * Decrement stock (for orders)
 */
export async function decrementStock(id, quantity) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid product ID: must be a number', { productId: id })
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      throw new BadRequestError('Invalid quantity: must be a positive number', { quantity })
    }

    // Get current stock (may throw NotFoundError)
    const product = await getProductById(id)

    // ENTERPRISE FAIL-FAST: Insufficient stock = specific business error
    if (product.stock < quantity) {
      throw new InsufficientStockError(id, quantity, product.stock)
    }

    const newStock = product.stock - quantity

    return await updateStock(id, newStock)
  } catch (error) {
    // Re-throw AppError instances as-is (fail-fast)
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    // Wrap unexpected errors
    console.error(`decrementStock(${id}) failed:`, error)
    throw new DatabaseError('UPDATE', TABLE, error, { productId: id, quantity })
  }
}
