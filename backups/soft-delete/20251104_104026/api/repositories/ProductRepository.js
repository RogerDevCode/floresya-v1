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
   * @param {Object} filters - Filtros específicos para productos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de productos
   */
  async findAllWithFilters(filters = {}, options = {}) {
    let query = this.supabase.from(this.table).select(`
        *,
        product_images(*)
      `)

    // Aplicar filtros específicos
    if (filters.sku) {
      query = query.eq('sku', filters.sku)
    }

    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }

    if (filters.price_min !== undefined) {
      query = query.gte('price_usd', filters.price_min)
    }

    if (filters.price_max !== undefined) {
      query = query.lte('price_usd', filters.price_max)
    }

    if (filters.in_stock !== undefined) {
      if (filters.in_stock) {
        query = query.gt('stock', 0)
      } else {
        query = query.eq('stock', 0)
      }
    }

    // Incluir productos inactivos solo para admins
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
      throw this.handleError(error, 'findAllWithFilters', { filters, options })
    }

    return data || []
  }

  /**
   * Obtener producto con imágenes incluidas
   * @param {number} id - ID del producto
   * @param {boolean} includeInactive - Incluir productos inactivos
   * @param {string} imageSize - Tamaño de imagen a incluir
   * @returns {Promise<Object>} Producto con imágenes
   */
  async findByIdWithImages(id, includeInactive = false, imageSize = null) {
    let query = this.supabase
      .from(this.table)
      .select(
        `
        *,
        product_images(*)
      `
      )
      .eq('id', id)

    if (!includeInactive) {
      query = query.eq('active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw this.handleError(error, 'findByIdWithImages', { id, includeInactive, imageSize })
    }

    // Filtrar imágenes por tamaño si se especifica
    if (imageSize && data.product_images) {
      data.product_images = data.product_images.filter(img => img.size === imageSize)
    }

    return data
  }

  /**
   * Obtener productos destacados
   * @param {number} limit - Límite de productos
   * @returns {Promise<Array>} Lista de productos destacados
   */
  async findFeatured(limit = 10) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('*')
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
   * Decrementar stock
   * @param {number} id - ID del producto
   * @param {number} quantity - Cantidad a decrementar
   * @returns {Promise<Object>} Producto actualizado
   */
  async decrementStock(id, quantity) {
    // Primero obtener el stock actual
    const { data: product, error: fetchError } = await this.supabase
      .from(this.table)
      .select('stock')
      .eq('id', id)
      .single()

    if (fetchError) {
      throw this.handleError(fetchError, 'decrementStock', { id, quantity })
    }

    const newStock = product.stock - quantity

    // Actualizar con el nuevo stock
    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw this.handleError(error, 'decrementStock', { id, quantity })
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
    let query = this.supabase.from(this.table).select('*', { count: 'exact', head: true })

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
    const products = data.map(item => item.products)

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
}

/**
 * Factory function to create ProductRepository instance
 * @param {Object} supabaseClient - Supabase client
 * @returns {ProductRepository} Repository instance
 */
export function createProductRepository(supabaseClient = null) {
  return new ProductRepository(supabaseClient)
}
