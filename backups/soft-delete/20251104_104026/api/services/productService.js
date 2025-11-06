/**
 * Product Service
 * Full CRUD operations with soft-delete (active flag)
 * Uses stored functions for atomic operations
 * Uses indexed columns (sku, active, featured, carousel_order)
 * ENTERPRISE FAIL-FAST: All errors use custom error classes with metadata
 *
 * REPOSITORY PATTERN: Uses ProductRepository for data access
 * Following Service Layer Exclusive principle
 */

import { DB_SCHEMA, supabase } from './supabaseClient.js'
import DIContainer from '../architecture/di-container.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  DatabaseConstraintError,
  InsufficientStockError,
  BadRequestError,
  InternalServerError
} from '../errors/AppError.js'
import { sanitizeProductData } from '../utils/sanitize.js'
import { PAGINATION, CAROUSEL } from '../config/constants.js'
import { withErrorMapping } from '../middleware/error/index.js'
import { validateProduct, validateId } from '../utils/validation.js'

const TABLE = DB_SCHEMA.products.table

/**
 * Get ProductRepository instance from DI Container
 * @returns {ProductRepository} Repository instance
 */
function getProductRepository() {
  return DIContainer.resolve('ProductRepository')
}

/**
 * Validate product ID (ENTERPRISE FAIL-FAST)
 * @param {number} id - Product ID to validate
 * @param {string} operation - Operation name for error context
 */
function _validateProductId(id, operation = 'operation') {
  validateId(id, 'Product', operation)
}

/**
 * Get all products with filters
 * @param {Object} filters - Filter options
 * @param {number} [filters.limit] - Number of items to return
 * @param {number} [filters.offset] - Number of items to skip
 * @param {boolean} [filters.featured] - Filter by featured products
 * @param {string} [filters.sku] - Filter by SKU
 * @param {string} [filters.search] - Search in name and description (accent-insensitive)
 * @param {string} [filters.sortBy] - Sort field with direction
 * @param {string} [filters.occasion] - Filter by occasion slug
 * @param {boolean} includeDeactivated - Include inactive products (default: false, admin only)
 * @param {string} [includeImageSize] - Include specific image size (thumb, small, medium, large)
 * @returns {Object[]} - Array of products
 * @throws {DatabaseError} When database query fails
 */
export const getAllProducts = withErrorMapping(
  async (filters = {}, includeDeactivated = false, includeImageSize = null) => {
    const productRepository = getProductRepository()

    // If filtering by occasion slug, first resolve it to occasion_id
    let occasionId = null
    if (filters.occasion) {
      // Note: Direct database access for cross-entity lookup (occasion)
      // This is acceptable as it's a lookup, not a core product operation
      const { supabase } = await import('./supabaseClient.js')
      const { data: occasionData, error: occasionError } = await supabase
        .from(DB_SCHEMA.occasions.table)
        .select('id')
        .eq('slug', filters.occasion)
        .eq('is_active', true)
        .single()

      // Fail Fast: Check for database error first
      if (occasionError) {
        console.error('Error fetching occasion:', occasionError)
        throw occasionError
      }

      // Fail Fast: Check for no data
      if (!occasionData) {
        console.warn(`Occasion not found for slug: ${filters.occasion}`)
        return []
      }

      occasionId = occasionData.id
      console.log(`🔍 Resolved occasion slug "${filters.occasion}" to ID ${occasionId}`)
    }

    // Prepare repository filters
    const repositoryFilters = {
      ...filters,
      occasion: occasionId,
      includeDeactivated
    }

    // Prepare repository options
    const repositoryOptions = {}

    // Handle sorting
    if (filters.sortBy === 'carousel_order') {
      repositoryFilters.sortBy = 'carousel_order'
      repositoryOptions.ascending = true
    } else if (filters.sortBy === 'price_asc') {
      repositoryFilters.sortBy = 'price'
      repositoryOptions.ascending = true
    } else if (filters.sortBy === 'price_desc') {
      repositoryFilters.sortBy = 'price'
      repositoryOptions.ascending = false
    } else if (filters.sortBy === 'name_asc') {
      repositoryFilters.sortBy = 'name'
      repositoryOptions.ascending = true
    } else {
      repositoryFilters.sortBy = 'created_at'
      repositoryOptions.ascending = false
    }

    // Apply pagination
    if (filters.limit) {
      repositoryOptions.limit = filters.limit
    }

    if (filters.offset) {
      repositoryOptions.offset = filters.offset
    }

    console.log(`🔍 Query filters:`, {
      ...filters,
      occasionId,
      includeDeactivated,
      includeImageSize
    })

    // Use repository to get products
    const products = await productRepository.findAllWithFilters(
      repositoryFilters,
      repositoryOptions
    )

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
  },
  'SELECT',
  TABLE
)

/**
 * Get product by ID
 * @param {number} id - Product ID
 * @param {boolean} includeDeactivated - Include inactive products (default: false, admin only)
 * @param {string} [includeImageSize] - Include specific image size (thumb, small, medium, large)
 * @returns {Object} - Product object
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When product is not found
 * @throws {DatabaseError} When database query fails
 */
export const getProductById = withErrorMapping(
  async (id, includeDeactivated = false, includeImageSize = null) => {
    const productRepository = getProductRepository()

    // Fail-fast: Validate ID
    if (id === null || id === undefined || typeof id !== 'number' || id <= 0) {
      throw new BadRequestError('Invalid product ID: must be a positive number', { productId: id })
    }

    // Use repository to get product
    const data = await productRepository.findByIdWithImages(id, includeDeactivated)

    if (!data) {
      throw new NotFoundError('Product', id, { includeDeactivated })
    }

    // If no image size requested, return product without additional image
    if (!includeImageSize) {
      return data
    }

    // Filter images by size if needed
    if (data.product_images && includeImageSize) {
      data.product_images = data.product_images.filter(img => img.size === includeImageSize)
    }

    // Use the new specialized service function to get product with specific image size
    const { getProductWithImageSize } = await import('./productImageService.js')
    return await getProductWithImageSize(id, includeImageSize)
  },
  'SELECT',
  TABLE
)

/**
 * Get product by SKU (indexed column)
 * @param {string} sku - Product SKU to search for
 * @returns {Object} - Product object
 * @throws {BadRequestError} When SKU is invalid
 * @throws {NotFoundError} When product with SKU is not found
 * @throws {DatabaseError} When database query fails
 * @example
 * const product = await getProductBySku('ROS-001')
 */
export async function getProductBySku(sku) {
  try {
    const productRepository = getProductRepository()

    if (!sku || typeof sku !== 'string') {
      throw new BadRequestError('Invalid SKU: must be a string', { sku })
    }

    // Use repository to get product by SKU
    const data = await productRepository.findBySku(sku)

    if (!data) {
      throw new NotFoundError('Product', sku, { sku })
    }

    return data
  } catch (error) {
    console.error(`getProductBySku(${sku}) failed:`, error)
    throw error
  }
}

/**
 * Get products with occasions (using join query instead of stored function)
 * @param {number} [limit=50] - Maximum number of products to return
 * @param {number} [offset=0] - Number of products to skip
 * @returns {Object[]} - Array of products with their associated occasions
 * @throws {DatabaseError} When database query fails
 * @throws {NotFoundError} When no products are found
 * @example
 * const products = await getProductsWithOccasions(20, 0)
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
      .limit(limit !== undefined ? limit : PAGINATION.DEFAULT_LIMIT)
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
 * @param {number} occasionId - Occasion ID to filter products by
 * @param {number} [limit=50] - Maximum number of products to return
 * @returns {Object[]} - Array of products for the specified occasion
 * @throws {BadRequestError} When occasion ID is invalid
 * @throws {DatabaseError} When database query fails
 * @throws {NotFoundError} When no products are found for the occasion
 * @example
 * const products = await getProductsByOccasion(1, 25)
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
      .limit(limit !== undefined ? limit : PAGINATION.DEFAULT_LIMIT)

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
 * Includes primary image in 'small' size (300x300px) for carousel display
 * @returns {Object[]} - Array of carousel products with images
 * @throws {DatabaseError} When database query fails
 * @throws {NotFoundError} When no carousel products are found
 * @example
 * const carouselProducts = await getCarouselProducts()
 */
export async function getCarouselProducts() {
  try {
    const productRepository = getProductRepository()

    // Use repository to get featured products
    const products = await productRepository.findFeatured(CAROUSEL.MAX_SIZE)

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
 * @param {Object} productData - Product data to create
 * @param {string} productData.name - Product name (required)
 * @param {number} productData.price_usd - Price in USD (required)
 * @param {string} [productData.summary] - Product summary
 * @param {string} [productData.description] - Product description
 * @param {number} [productData.price_ves] - Price in VES
 * @param {number} [productData.stock] - Available stock
 * @param {string} [productData.sku] - Product SKU
 * @param {boolean} [productData.featured] - Whether product is featured
 * @param {number} [productData.carousel_order] - Order in carousel display
 * @returns {Object} - Created product
 * @throws {ValidationError} When product data is invalid
 * @throws {DatabaseConstraintError} When product violates database constraints (e.g., duplicate SKU)
 * @throws {DatabaseError} When database insert fails
 */
export async function createProduct(productData) {
  try {
    validateProduct(productData, false)

    // Sanitize data before database operations
    const sanitizedData = sanitizeProductData(productData, false)

    const newProduct = {
      name: sanitizedData.name,
      summary: sanitizedData.summary !== undefined ? sanitizedData.summary : null,
      description: sanitizedData.description !== undefined ? sanitizedData.description : null,
      price_usd: sanitizedData.price_usd,
      price_ves: sanitizedData.price_ves !== undefined ? sanitizedData.price_ves : null,
      stock: sanitizedData.stock !== undefined ? sanitizedData.stock : 0,
      sku: sanitizedData.sku !== undefined ? sanitizedData.sku : null,
      active: true,
      featured: sanitizedData.featured !== undefined ? sanitizedData.featured : false,
      carousel_order:
        sanitizedData.carousel_order !== undefined ? sanitizedData.carousel_order : null
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
      throw new DatabaseError(
        'INSERT',
        TABLE,
        new InternalServerError('No data returned after insert'),
        {
          productData: newProduct
        }
      )
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
 * @param {Object} productData - Product data to create
 * @param {string} productData.name - Product name (required)
 * @param {number} productData.price_usd - Price in USD (required)
 * @param {string} [productData.summary] - Product summary
 * @param {string} [productData.description] - Product description
 * @param {number} [productData.price_ves] - Price in VES
 * @param {number} [productData.stock] - Available stock
 * @param {string} [productData.sku] - Product SKU
 * @param {boolean} [productData.featured] - Whether product is featured
 * @param {number} [productData.carousel_order] - Order in carousel display
 * @param {number[]} [occasionIds=[]] - Array of occasion IDs to associate with the product
 * @returns {Object} - Created product
 * @throws {ValidationError} When product data is invalid
 * @throws {BadRequestError} When occasionIds is not an array
 * @throws {DatabaseError} When database operations fail
 * @example
 * const product = await createProductWithOccasions({
 *   name: 'Rosas para Aniversario',
 *   price_usd: 45.99,
 *   stock: 5
 * }, [1, 3]) // Associate with occasions 1 and 3
 */
export async function createProductWithOccasions(productData, occasionIds = []) {
  try {
    validateProduct(productData, false)

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
 * @param {number} id - Product ID
 * @param {Object} updates - Updated product data
 * @param {string} [updates.name] - Product name
 * @param {string} [updates.summary] - Product summary
 * @param {string} [updates.description] - Product description
 * @param {number} [updates.price_usd] - Price in USD
 * @param {number} [updates.price_ves] - Price in VES
 * @param {number} [updates.stock] - Available stock
 * @param {string} [updates.sku] - Product SKU
 * @param {boolean} [updates.featured] - Whether product is featured
 * @param {number} [updates.carousel_order] - Order in carousel display
 * @returns {Object} - Updated product
 * @throws {BadRequestError} When ID is invalid or no updates are provided
 * @throws {ValidationError} When product data is invalid
 * @throws {NotFoundError} When product is not found
 * @throws {DatabaseConstraintError} When product violates database constraints (e.g., duplicate SKU)
 * @throws {DatabaseError} When database update fails
 */
export async function updateProduct(id, updates) {
  try {
    if (!id || typeof id !== 'number' || id <= 0) {
      throw new BadRequestError('Invalid product ID: must be a positive number', { productId: id })
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new BadRequestError('No updates provided', { productId: id })
    }

    validateProduct(updates, true)

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
      throw new NotFoundError('Product', id, { includeDeactivated: false })
    }

    return data
  } catch (error) {
    console.error(`updateProduct(${id}) failed:`, error)
    throw error
  }
}

/**
 * Update carousel order (direct update)
 * @param {number} productId - Product ID to update
 * @param {number|null} newOrder - New carousel order (0-7) or null to remove from carousel
 * @returns {Object} - Updated product
 * @throws {BadRequestError} When productId is invalid or newOrder is out of range
 * @throws {DatabaseError} When database update fails
 * @example
 * // Set product to position 1 in carousel
 * await updateCarouselOrder(123, 1)
 *
 * // Remove product from carousel
 * await updateCarouselOrder(123, null)
 */
export async function updateCarouselOrder(productId, newOrder) {
  try {
    const productRepository = getProductRepository()

    if (!productId || typeof productId !== 'number') {
      throw new BadRequestError('Invalid product ID: must be a number', { productId })
    }

    if (newOrder !== null && (typeof newOrder !== 'number' || newOrder < 0 || newOrder > 7)) {
      throw new BadRequestError('Invalid carousel_order: must be between 0-7 or null', { newOrder })
    }

    // Use repository to update carousel order
    const data = await productRepository.updateCarouselOrder(productId, newOrder)

    return data
  } catch (error) {
    console.error(`updateCarouselOrder(${productId}) failed:`, error)
    throw error
  }
}

/**
 * Soft-delete product
 * @param {number} id - Product ID to delete
 * @returns {Object} - Deactivated product
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When product is not found or already inactive
 * @throws {DatabaseError} When database update fails
 */
export async function deleteProduct(id) {
  try {
    const productRepository = getProductRepository()

    if (!id || typeof id !== 'number' || id <= 0) {
      throw new BadRequestError('Invalid product ID: must be a positive number', { productId: id })
    }

    // Use repository's delete method (soft-delete)
    const data = await productRepository.delete(id)

    return data
  } catch (error) {
    console.error(`deleteProduct(${id}) failed:`, error)
    throw error
  }
}

/**
 * Reactivate product (reverse soft-delete)
 * @param {number} id - Product ID to reactivate
 * @returns {Object} - Reactivated product
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When product is not found or already active
 * @throws {DatabaseError} When database update fails
 * @example
 * const product = await reactivateProduct(123)
 */
export async function reactivateProduct(id) {
  try {
    const productRepository = getProductRepository()

    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid product ID: must be a number', { productId: id })
    }

    // Use repository's reactivate method
    const data = await productRepository.reactivate(id)

    return data
  } catch (error) {
    console.error(`reactivateProduct(${id}) failed:`, error)
    throw error
  }
}

/**
 * Update stock (direct update)
 * @param {number} id - Product ID to update
 * @param {number} quantity - New stock quantity (must be non-negative)
 * @returns {Object} - Updated product
 * @throws {BadRequestError} When ID is invalid or quantity is negative
 * @throws {NotFoundError} When product is not found or inactive
 * @throws {DatabaseError} When database update fails
 * @example
 * const product = await updateStock(123, 50)
 */
export async function updateStock(id, quantity) {
  try {
    const productRepository = getProductRepository()

    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid product ID: must be a number', { productId: id })
    }

    if (typeof quantity !== 'number' || quantity < 0) {
      throw new BadRequestError('Invalid quantity: must be a non-negative number', { quantity })
    }

    // Use repository to update stock
    const data = await productRepository.updateStock(id, quantity)

    return data
  } catch (error) {
    console.error(`updateStock(${id}) failed:`, error)
    throw error
  }
}

/**
 * Decrement stock (for orders) - ENTERPRISE FAIL-FAST with insufficient stock check
 * @param {number} id - Product ID to decrement stock for
 * @param {number} quantity - Quantity to decrement (must be positive)
 * @returns {Object} - Updated product
 * @throws {BadRequestError} When ID is invalid or quantity is not positive
 * @throws {NotFoundError} When product is not found or inactive
 * @throws {InsufficientStockError} When current stock is less than requested decrement
 * @throws {DatabaseError} When database operations fail
 * @example
 * // Decrement stock by 2 for order processing
 * const product = await decrementStock(123, 2)
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

/**
 * Replace all occasions for a product (TRANSACTIONAL)
 * Uses PostgreSQL stored function for atomic DELETE + INSERT
 * @param {number} productId - Product ID
 * @param {number[]} occasionIds - Array of occasion IDs to link
 * @returns {Promise<Object>} Operation result with counts
 * @throws {ValidationError} Invalid parameters
 * @throws {NotFoundError} Product not found
 * @throws {DatabaseError} Database error
 */
export async function replaceProductOccasions(productId, occasionIds = []) {
  try {
    // Validate parameters
    if (!productId || typeof productId !== 'number') {
      throw new ValidationError('Invalid product ID', { productId })
    }

    if (!Array.isArray(occasionIds)) {
      throw new ValidationError('occasion_ids must be an array', { occasionIds })
    }

    // Validate all occasion IDs are numbers
    const invalidIds = occasionIds.filter(id => typeof id !== 'number' || id <= 0)
    if (invalidIds.length > 0) {
      throw new ValidationError('Invalid occasion IDs', { invalidIds })
    }

    console.log(`Replacing occasions for product ${productId}:`, occasionIds)

    // Call PostgreSQL stored function (TRANSACTIONAL)
    const { data, error } = await supabase.rpc('replace_product_occasions', {
      p_product_id: productId,
      p_occasion_ids: occasionIds
    })

    if (error) {
      // Check for specific error types
      if (error.message && error.message.includes('not found')) {
        throw new NotFoundError('Product', productId)
      }
      if (error.message && error.message.includes('invalid or inactive')) {
        throw new ValidationError('One or more occasion IDs are invalid or inactive', {
          occasionIds
        })
      }
      throw new DatabaseError('RPC', 'replace_product_occasions', error, {
        productId,
        occasionIds
      })
    }

    console.log(`✓ Occasions replaced for product ${productId}:`, data)
    return data
  } catch (error) {
    console.error(`replaceProductOccasions(${productId}) failed:`, error)
    if (error.isOperational) {
      throw error
    }
    throw new InternalServerError('Failed to replace product occasions', {
      productId,
      occasionIds,
      error
    })
  }
}
