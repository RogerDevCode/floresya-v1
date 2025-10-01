/**
 * Product Service
 * Full CRUD operations with soft-delete (active flag)
 * Uses stored functions for atomic operations
 * Uses indexed columns (sku, active, featured, carousel_order)
 */

import { supabase, DB_SCHEMA, DB_FUNCTIONS } from './supabaseClient.js'

const TABLE = DB_SCHEMA.products.table

/**
 * Validate product data
 */
function validateProductData(data, isUpdate = false) {
  if (!isUpdate) {
    if (!data.name || typeof data.name !== 'string') {
      throw new Error('Invalid name: must be a non-empty string')
    }
    if (!data.price_usd || typeof data.price_usd !== 'number' || data.price_usd <= 0) {
      throw new Error('Invalid price_usd: must be a positive number')
    }
  }

  if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim() === '')) {
    throw new Error('Invalid name: must be a non-empty string')
  }

  if (data.price_usd !== undefined && (typeof data.price_usd !== 'number' || data.price_usd <= 0)) {
    throw new Error('Invalid price_usd: must be a positive number')
  }

  if (data.price_ves !== undefined && data.price_ves !== null) {
    if (typeof data.price_ves !== 'number' || data.price_ves < 0) {
      throw new Error('Invalid price_ves: must be a non-negative number')
    }
  }

  if (data.stock !== undefined && (typeof data.stock !== 'number' || data.stock < 0)) {
    throw new Error('Invalid stock: must be a non-negative number')
  }

  if (data.carousel_order !== undefined && data.carousel_order !== null) {
    if (typeof data.carousel_order !== 'number' || data.carousel_order < 0) {
      throw new Error('Invalid carousel_order: must be a non-negative number')
    }
  }
}

/**
 * Get all products with filters
 * @param {Object} filters - Filter options
 * @param {boolean} includeInactive - Include inactive products (default: false, admin only)
 */
export async function getAllProducts(filters = {}, includeInactive = false) {
  try {
    let query = supabase.from(TABLE).select('*')

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

    // Text search
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Sorting
    if (filters.sortBy === 'carousel_order') {
      query = query.order('carousel_order', { ascending: true, nullsLast: true })
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

    console.log(`🔍 Query filters:`, { ...filters, includeInactive })

    const { data: products, error } = await query

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!products || products.length === 0) {
      throw new Error('No products found')
    }

    console.log(`📦 getAllProducts: Found ${products.length} products before fetching images`)

    // Fetch small image for each product (first image, image_index=1)
    const IMAGES_TABLE = DB_SCHEMA.product_images.table
    const productsWithImages = await Promise.all(
      products.map(async product => {
        const { data: images, error: imgError } = await supabase
          .from(IMAGES_TABLE)
          .select('url')
          .eq('product_id', product.id)
          .eq('size', 'small')
          .order('image_index', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (imgError) {
          console.warn(`Failed to fetch image for product ${product.id}:`, imgError.message)
        }

        return {
          ...product,
          image_url_small: images?.url || null
        }
      })
    )

    return productsWithImages
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
export async function getProductById(id, includeInactive = false) {
  try {
    if (!id || typeof id !== 'number') {
      throw new Error('Invalid product ID: must be a number')
    }

    let query = supabase.from(TABLE).select('*').eq('id', id)

    // By default, only return active products
    if (!includeInactive) {
      query = query.eq('active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error(`Product ${id} not found`)
    }

    return data
  } catch (error) {
    console.error(`getProductById(${id}) failed:`, error)
    throw error
  }
}

/**
 * Get product by SKU (indexed column)
 */
export async function getProductBySku(sku) {
  try {
    if (!sku || typeof sku !== 'string') {
      throw new Error('Invalid SKU: must be a string')
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('sku', sku)
      .eq('active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`Product with SKU ${sku} not found`)
      }
      throw new Error(`Database error: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error(`getProductBySku(${sku}) failed:`, error)
    throw error
  }
}

/**
 * Get products with occasions (stored function)
 */
export async function getProductsWithOccasions(limit = 50, offset = 0) {
  try {
    const { data, error } = await supabase.rpc(DB_FUNCTIONS.getProductsWithOccasions, {
      p_limit: limit,
      p_offset: offset
    })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error('No products found')
    }

    return data
  } catch (error) {
    console.error('getProductsWithOccasions failed:', error)
    throw error
  }
}

/**
 * Get products by occasion ID (stored function)
 */
export async function getProductsByOccasion(occasionId, limit = 50) {
  try {
    if (!occasionId || typeof occasionId !== 'number') {
      throw new Error('Invalid occasion ID: must be a number')
    }

    const { data, error } = await supabase.rpc(DB_FUNCTIONS.getProductsByOccasion, {
      p_occasion_id: occasionId,
      p_limit: limit
    })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error('No products found for this occasion')
    }

    return data
  } catch (error) {
    console.error(`getProductsByOccasion(${occasionId}) failed:`, error)
    throw error
  }
}

/**
 * Get products in carousel (carousel_order IS NOT NULL)
 * Includes primary image in 'small' size (300x300px)
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
      throw new Error(`Database error: ${error.message}`)
    }
    if (!products || products.length === 0) {
      throw new Error('No carousel products found')
    }

    // Fetch small image for each product (first image, image_index=1)
    const IMAGES_TABLE = DB_SCHEMA.product_images.table
    const productsWithImages = await Promise.all(
      products.map(async product => {
        const { data: images, error: imgError } = await supabase
          .from(IMAGES_TABLE)
          .select('url')
          .eq('product_id', product.id)
          .eq('size', 'small')
          .order('image_index', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (imgError) {
          console.warn(`Failed to fetch image for product ${product.id}:`, imgError.message)
        }

        return {
          ...product,
          image_url_small: images?.url || null
        }
      })
    )

    return productsWithImages
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

    const newProduct = {
      name: productData.name,
      summary: productData.summary || null,
      description: productData.description || null,
      price_usd: productData.price_usd,
      price_ves: productData.price_ves || null,
      stock: productData.stock || 0,
      sku: productData.sku || null,
      active: true,
      featured: productData.featured || false,
      carousel_order: productData.carousel_order || null
    }

    const { data, error } = await supabase.from(TABLE).insert(newProduct).select().single()

    if (error) {
      if (error.code === '23505') {
        throw new Error(`Product with SKU ${productData.sku} already exists`)
      }
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data) {
      throw new Error('Failed to create product')
    }

    return data
  } catch (error) {
    console.error('createProduct failed:', error)
    throw error
  }
}

/**
 * Create product with occasions (atomic stored function)
 */
export async function createProductWithOccasions(productData, occasionIds = []) {
  try {
    validateProductData(productData, false)

    if (!Array.isArray(occasionIds)) {
      throw new Error('Invalid occasionIds: must be an array')
    }

    const productPayload = {
      name: productData.name,
      summary: productData.summary || null,
      description: productData.description || null,
      price_usd: productData.price_usd,
      price_ves: productData.price_ves || null,
      stock: productData.stock || 0,
      sku: productData.sku || null,
      active: true,
      featured: productData.featured || false,
      carousel_order: productData.carousel_order || null
    }

    const { data, error } = await supabase.rpc(DB_FUNCTIONS.createProductWithOccasions, {
      product_data: productPayload,
      occasion_ids: occasionIds
    })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data || !data[0]) {
      throw new Error('Failed to create product with occasions')
    }

    return data[0]
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
      throw new Error('Invalid product ID: must be a number')
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('No updates provided')
    }

    validateProductData(updates, true)

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
      .eq('active', true)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error(`Product with SKU ${updates.sku} already exists`)
      }
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data) {
      throw new Error(`Product ${id} not found or inactive`)
    }

    return data
  } catch (error) {
    console.error(`updateProduct(${id}) failed:`, error)
    throw error
  }
}

/**
 * Update carousel order (atomic stored function)
 */
export async function updateCarouselOrder(productId, newOrder) {
  try {
    if (!productId || typeof productId !== 'number') {
      throw new Error('Invalid product ID: must be a number')
    }

    if (newOrder !== null && (typeof newOrder !== 'number' || newOrder < 0 || newOrder > 7)) {
      throw new Error('Invalid carousel_order: must be between 0-7 or null')
    }

    const { data, error } = await supabase.rpc(DB_FUNCTIONS.updateCarouselOrderAtomic, {
      product_id: productId,
      new_order: newOrder
    })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error(`Failed to update carousel order for product ${productId}`)
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
      throw new Error('Invalid product ID: must be a number')
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ active: false })
      .eq('id', id)
      .eq('active', true)
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error(`Product ${id} not found or already inactive`)
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
      throw new Error('Invalid product ID: must be a number')
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ active: true })
      .eq('id', id)
      .eq('active', false)
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error(`Product ${id} not found or already active`)
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
      throw new Error('Invalid product ID: must be a number')
    }

    if (typeof quantity !== 'number' || quantity < 0) {
      throw new Error('Invalid quantity: must be a non-negative number')
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ stock: quantity })
      .eq('id', id)
      .eq('active', true)
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error(`Product ${id} not found or inactive`)
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
      throw new Error('Invalid product ID: must be a number')
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      throw new Error('Invalid quantity: must be a positive number')
    }

    // Get current stock
    const product = await getProductById(id)

    if (product.stock < quantity) {
      throw new Error(`Insufficient stock: available ${product.stock}, requested ${quantity}`)
    }

    const newStock = product.stock - quantity

    return await updateStock(id, newStock)
  } catch (error) {
    console.error(`decrementStock(${id}) failed:`, error)
    throw error
  }
}
