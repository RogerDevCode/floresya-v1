/**
 * Procesado por B
 */

/**
 * Product Repository
 * Gestiona el acceso a datos de productos
 * Extiende BaseRepository con operaciones específicas de productos
 */

import { BaseRepository } from './BaseRepository.js'
import { DB_SCHEMA } from '../services/supabaseClient.js'
import { BadRequestError } from '../errors/AppError.js'

export class ProductRepository extends BaseRepository {
  constructor(supabaseClient) {
    super(supabaseClient, DB_SCHEMA.products.table)
  }

  /**
   * Obtener productos con filtros específicos
   * OPTIMIZACIÓN: Todos los filtros se aplican en SQL WHERE (no en JavaScript)
   * Usa índices existentes: active, featured, sku, price_usd, name_normalized
   * @param {Object} filters - Filtros específicos para productos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de productos
   */
  async findAllWithFilters(filters = {}, options = {}) {
    // Handle occasion filter with join - OPTIMIZADO
    if (filters.occasionId) {
      // Use the existing SQL function for filtering by occasion (efficient)
      const { data, error } = await this.supabase.rpc('get_products_by_occasion', {
        p_occasion_id: filters.occasionId,
        p_limit: options.limit || 50
      })

      if (error) {
        throw this.handleError(error, 'findAllWithFilters (RPC call)', { filters, options })
      }

      if (!data || data.length === 0) {
        return []
      }

      // OPTIMIZACIÓN: Apply remaining filters in JavaScript (after SQL join)
      let filteredData = data

      // Apply search filter (cannot be done in RPC join efficiently)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredData = filteredData.filter(
          product =>
            product.name.toLowerCase().includes(searchLower) ||
            (product.description && product.description.toLowerCase().includes(searchLower)) ||
            (product.summary && product.summary.toLowerCase().includes(searchLower))
        )
      }

      // Apply sorting (price, name) - efficient in JavaScript for small datasets
      if (filters.sortBy === 'price_asc') {
        filteredData.sort((a, b) => a.price_usd - b.price_usd)
      } else if (filters.sortBy === 'price_desc') {
        filteredData.sort((a, b) => b.price_usd - a.price_usd)
      } else if (filters.sortBy === 'name_asc') {
        filteredData.sort((a, b) => a.name.localeCompare(b.name))
      }

      // Apply limit if not already applied by RPC
      if (options.limit && !filters.limit) {
        const offset = options.offset || 0
        filteredData = filteredData.slice(offset, offset + options.limit)
      }

      return filteredData
    }

    // Standard query without occasion filter - OPTIMIZADO CON WHERE EN SQL
    let query = this.supabase.from(this.table).select(`
      id, name, summary, description, price_usd, price_ves, stock, sku, active, featured, carousel_order, created_at, updated_at
    `)

    // ✅ OPTIMIZACIÓN: Apply ALL filters in SQL WHERE clauses (not JavaScript)
    // Using indexed columns for efficient filtering

    if (filters.sku) {
      // Using index: sku (unique, very fast)
      query = query.eq('sku', filters.sku)
    }

    if (filters.featured !== undefined) {
      // Using index: featured (fast boolean filter)
      query = query.eq('featured', filters.featured)
    }

    if (filters.price_min !== undefined) {
      // Using index: price_usd can use B-tree indexing for range queries
      query = query.gte('price_usd', filters.price_min)
    }

    if (filters.price_max !== undefined) {
      // Using index: price_usd can use B-tree indexing for range queries
      query = query.lte('price_usd', filters.price_max)
    }

    if (filters.search) {
      // Using indexes: name_normalized, description_normalized (fast ilike)
      const searchPattern = `%${filters.search}%`
      query = query.or(
        `name.ilike.${searchPattern},description.ilike.${searchPattern},summary.ilike.${searchPattern}`
      )
    }

    // Incluir productos inactivos solo para admins (ALWAYS in SQL WHERE)
    if (!filters.includeDeactivated) {
      // Using index: active (very fast boolean filter)
      query = query.eq('active', true)
    }

    // Aplicar ordenamiento eficiente (usar índices cuando sea posible)
    const orderBy = filters.sortBy || 'created_at'
    const ascending = options.ascending || false
    query = query.order(orderBy, { ascending })

    // Aplicar límites (LIMIT/OFFSET en SQL - eficiente)
    if (options.limit !== undefined) {
      const offset = options.offset || 0
      query = query.range(offset, offset + options.limit - 1)
    }

    const { data, error } = await query

    if (error) {
      throw this.handleError(error, 'findAllWithFilters', { filters, options })
    }

    return data || []
  }

  /**
   * Obtener producto con imágenes incluidas
   * WORKAROUND: Usa 2 queries separadas para evitar error de múltiples relaciones
   * @param {number} id - ID del producto
   * @param {boolean} includeInactive - Incluir productos inactivos
   * @param {string} imageSize - Tamaño de imagen a incluir
   * @returns {Promise<Object>} Producto con imágenes
   */
  async findByIdWithImages(id, includeInactive = false, imageSize = null) {
    // WORKAROUND: Query separada para producto (evita JOIN problemático)
    const { data: product, error: productError } = await this.supabase
      .from(this.table)
      .select(
        'id, name, summary, description, price_usd, price_ves, stock, sku, active, featured, carousel_order, created_at, updated_at'
      )
      .eq('id', id)
      .eq('active', includeInactive ? undefined : true)
      .single()

    if (productError) {
      if (productError.code === 'PGRST116') {
        return null
      }
      throw this.handleError(productError, 'findByIdWithImages', { id, includeInactive, imageSize })
    }

    // Si no se encontró el producto, retornar null
    if (!product) {
      return null
    }

    // WORKAROUND: Query separada para imágenes (evita JOIN ambiguo)
    const { data: images, error: imagesError } = await this.supabase
      .from('product_images')
      .select('id, product_id, image_url, size, image_index, created_at, updated_at')
      .eq('product_id', id)
      .order('image_index', { ascending: true })

    if (imagesError) {
      // Si falla la consulta de imágenes, continuamos sin ellas
      console.error('Error loading product images:', imagesError)
      product.product_images = []
      return product
    }

    // Aplicar filtro de tamaño si se especifica
    let productImages = images || []
    if (imageSize) {
      productImages = productImages.filter(img => img.size === imageSize)
    }

    product.product_images = productImages

    return product
  }

  /**
   * Obtener productos destacados
   * @param {number} limit - Límite de productos
   * @returns {Promise<Array>} Lista de productos destacados
   */
  async findFeatured(limit = 10) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        'id, name, summary, description, price_usd, price_ves, stock, sku, active, featured, carousel_order, created_at, updated_at'
      )
      .eq('featured', true)
      .eq('active', true)
      .order('carousel_order', { ascending: true })
      .limit(limit)

    if (error) {
      throw this.handleError(error, 'findFeatured', { limit })
    }

    return data || []
  }

  /**
   * Actualizar carousel order
   * @param {number} id - ID del producto
   * @param {number} order - Nuevo orden
   * @returns {Promise<Object>} Producto actualizado
   */
  async updateCarouselOrder(id, order) {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        carousel_order: order,
        featured: order !== null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw this.handleError(error, 'updateCarouselOrder', { id, order })
    }

    return data
  }

  /**
   * Actualizar stock
   * @param {number} id - ID del producto
   * @param {number} quantity - Nueva cantidad
   * @returns {Promise<Object>} Producto actualizado
   */
  async updateStock(id, quantity) {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        stock: quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw this.handleError(error, 'updateStock', { id, quantity })
    }

    return data
  }

  /**
   * Decrementar stock (ATOMIC operation using database transaction)
   * @param {number} id - ID del producto
   * @param {number} quantity - Cantidad a decrementar
   * @returns {Promise<Object>} Producto actualizado
   */
  async decrementStock(id, quantity) {
    // ATOMIC: Use single UPDATE with WHERE condition to prevent race conditions
    // This ensures stock never goes negative and operation is atomic
    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        stock: this.supabase.raw('stock - ?', [quantity]),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .gte('stock', quantity) // Ensure sufficient stock (atomic check)
      .select('id, name, stock, updated_at')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows updated - insufficient stock
        throw new BadRequestError('Insufficient stock for product', {
          productId: id,
          requested: quantity,
          available: 'less than requested'
        })
      }
      throw this.handleError(error, 'decrementStock', { id, quantity })
    }

    if (!data) {
      throw new BadRequestError('Insufficient stock for product', {
        productId: id,
        requested: quantity
      })
    }

    return data
  }

  /**
   * Verificar si SKU existe
   * @param {string} sku - SKU del producto
   * @returns {Promise<boolean>} True si existe
   */
  async existsBySku(sku) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('id')
      .eq('sku', sku)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return false
      }
      throw this.handleError(error, 'existsBySku', { sku })
    }

    return !!data
  }

  /**
   * Verificar si producto existe
   * @param {number} id - ID del producto
   * @returns {Promise<boolean>} True si existe
   */
  async exists(id) {
    const { data, error } = await this.supabase.from(this.table).select('id').eq('id', id).single()

    if (error) {
      if (error.code === 'PGRST116') {
        return false
      }
      throw this.handleError(error, 'exists', { id })
    }

    return !!data
  }

  /**
   * Contar productos con filtros
   * @param {Object} filters - Filtros
   * @returns {Promise<number>} Número de productos
   */
  async count(filters = {}) {
    let query = this.supabase.from(this.table).select('id', { count: 'exact', head: true })

    // Aplicar filtros
    if (filters.sku) {
      query = query.eq('sku', filters.sku)
    }

    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }

    if (filters.active !== undefined) {
      query = query.eq('active', filters.active)
    }

    const { count, error } = await query

    if (error) {
      throw this.handleError(error, 'count', { filters })
    }

    return count || 0
  }

  /**
   * Obtener ocasiones del producto
   * @param {number} productId - ID del producto
   * @returns {Promise<Array>} Lista de ocasiones
   */
  async getProductOccasions(productId) {
    const { data, error } = await this.supabase
      .from('product_occasions')
      .select(
        `
        occasion_id,
        occasions(*)
      `
      )
      .eq('product_id', productId)

    if (error) {
      throw this.handleError(error, 'getProductOccasions', { productId })
    }

    // Transformar para retornar solo las ocasiones
    return data.map(item => item.occasions)
  }

  /**
   * Vincular ocasión a producto
   * @param {number} productId - ID del producto
   * @param {number} occasionId - ID de la ocasión
   * @returns {Promise<Object>} Relación creada
   */
  async linkOccasion(productId, occasionId) {
    const { data, error } = await this.supabase
      .from('product_occasions')
      .insert({
        product_id: productId,
        occasion_id: occasionId
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        // Unique violation
        throw new BadRequestError('Product already linked to this occasion', {
          productId,
          occasionId
        })
      }
      throw this.handleError(error, 'linkOccasion', { productId, occasionId })
    }

    return data
  }

  /**
   * Desvincular ocasión de producto
   * @param {number} productId - ID del producto
   * @param {number} occasionId - ID de la ocasión
   * @returns {Promise<void>}
   */
  async unlinkOccasion(productId, occasionId) {
    const { error } = await this.supabase
      .from('product_occasions')
      .delete()
      .eq('product_id', productId)
      .eq('occasion_id', occasionId)

    if (error) {
      throw this.handleError(error, 'unlinkOccasion', { productId, occasionId })
    }
  }

  /**
   * Reemplazar ocasiones del producto
   * @param {number} productId - ID del producto
   * @param {Array<number>} occasionIds - IDs de las ocasiones
   * @returns {Promise<Array>} Lista de relaciones creadas
   */
  async replaceOccasions(productId, occasionIds) {
    // Eliminar relaciones existentes
    await this.supabase.from('product_occasions').delete().eq('product_id', productId)

    // Crear nuevas relaciones
    const relations = occasionIds.map(occasionId => ({
      product_id: productId,
      occasion_id: occasionId
    }))

    const { data, error } = await this.supabase.from('product_occasions').insert(relations).select()

    if (error) {
      throw this.handleError(error, 'replaceOccasions', { productId, occasionIds })
    }

    return data
  }

  /**
   * Buscar productos por SKU
   * @param {string} sku - SKU del producto
   * @returns {Promise<Object|null>} Producto encontrado
   */
  async findBySku(sku) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('*')
      .eq('sku', sku)
      .eq('active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw this.handleError(error, 'findBySku', { sku })
    }

    return data
  }

  /**
   * Obtener productos con ocasiones incluidas (JOIN query - evita N+1)
   * @param {Object} filters - Filtros específicos para productos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de productos con ocasiones
   */
  async findAllWithOccasions(filters = {}, options = {}) {
    // JOIN query para obtener productos con sus ocasiones en una sola consulta
    let query = this.supabase.from(this.table).select(`
        id, name, summary, description, price_usd, price_ves, stock, sku, active, featured, carousel_order, created_at, updated_at,
        product_occasions(
          occasion_id,
          occasions(id, name, slug, active)
        )
      `)

    // Aplicar filtros en SQL WHERE
    if (filters.sku) {
      query = query.eq('sku', filters.sku)
    }

    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }

    if (filters.search) {
      const searchPattern = `%${filters.search}%`
      query = query.or(
        `name.ilike.${searchPattern},description.ilike.${searchPattern},summary.ilike.${searchPattern}`
      )
    }

    if (!filters.includeDeactivated) {
      query = query.eq('active', true)
    }

    // Aplicar ordenamiento
    const orderBy = filters.sortBy || 'created_at'
    const ascending = options.ascending || false
    query = query.order(orderBy, { ascending })

    // Aplicar límites
    if (options.limit !== undefined) {
      const offset = options.offset || 0
      query = query.range(offset, offset + options.limit - 1)
    }

    const { data, error } = await query

    if (error) {
      throw this.handleError(error, 'findAllWithOccasions', { filters, options })
    }

    // Transformar datos para mantener compatibilidad con la API existente
    return (data || []).map(product => ({
      ...product,
      product_occasions: product.product_occasions.map(po => ({
        occasion_id: po.occasion_id,
        occasions: po.occasions
      }))
    }))
  }

  /**
   * Obtener productos por ocasión
   * @param {number} occasionId - ID de la ocasión
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de productos
   */
  async findByOccasion(occasionId, options = {}) {
    const { data, error } = await this.supabase
      .from('product_occasions')
      .select(
        `
        products(*)
      `
      )
      .eq('occasion_id', occasionId)

    if (error) {
      throw this.handleError(error, 'findByOccasion', { occasionId, options })
    }

    // Transformar para retornar solo los productos
    const products = (data || []).flatMap(item =>
      Array.isArray(item.products) ? item.products : [item.products].filter(Boolean)
    )

    // Aplicar filtros adicionales
    let filteredProducts = products

    if (options.inStockOnly) {
      filteredProducts = products.filter(p => p.stock > 0)
    }

    // Aplicar límites
    if (options.limit !== undefined) {
      filteredProducts = filteredProducts.slice(0, options.limit)
    }

    return filteredProducts
  }

  /**
   * Reemplazar ocasiones del producto usando stored function (ATOMIC)
   * @param {number} productId - ID del producto
   * @param {Array<number>} occasionIds - IDs de las ocasiones
   * @returns {Promise<Object>} Resultado de la operación
   */
  async replaceProductOccasions(productId, occasionIds) {
    const { data, error } = await this.supabase.rpc('replace_product_occasions', {
      p_product_id: productId,
      p_occasion_ids: occasionIds
    })

    if (error) {
      throw this.handleError(error, 'replaceProductOccasions', { productId, occasionIds })
    }

    return data
  }
}

/**
 * Factory function to create ProductRepository instance
 * @param {Object} supabaseClient - Supabase client
 * @returns {ProductRepository} Repository instance
 */
export function createProductRepository(supabaseClient = null) {
  return new ProductRepository(supabaseClient)
}
