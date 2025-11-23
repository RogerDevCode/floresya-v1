/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Product Image Repository
 * Gestiona el acceso a datos de imágenes de productos
 * Extiende BaseRepository con operaciones específicas de imágenes
 */

import { BaseRepository } from './BaseRepository.js'
import { DB_SCHEMA } from '../services/supabaseClient.js'
import { BadRequestError } from '../errors/AppError.js'

export class ProductImageRepository extends BaseRepository {
  constructor(supabaseClient) {
    super(supabaseClient, DB_SCHEMA.product_images.table)
  }

  /**
   * Obtener imágenes de un producto
   * @param {number} productId - ID del producto
   * @param {boolean} includeInactive - Incluir imágenes inactivas
   * @returns {Promise<Array>} Lista de imágenes
   */
  async findByProductId(productId, includeInactive = false) {
    const query = this.supabase
      .from(this.table)
      .select('*')
      .eq('product_id', productId)
      .order('image_index', { ascending: true })

    const { data, error } = await query

    if (error) {
      throw this.handleError(error, 'findByProductId', { productId, includeInactive })
    }

    return data || []
  }

  /**
   * Obtener imagen primaria de un producto
   * @param {number} productId - ID del producto
   * @returns {Promise<Object|null>} Imagen primaria
   */
  async findPrimaryByProductId(productId) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('*')
      .eq('product_id', productId)
      .eq('is_primary', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw this.handleError(error, 'findPrimaryByProductId', { productId })
    }

    return data
  }

  /**
   * Obtener imagen por hash
   * @param {string} fileHash - Hash del archivo
   * @returns {Promise<Object|null>} Imagen encontrada
   */
  async findByHash(fileHash) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('*')
      .eq('file_hash', fileHash)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw this.handleError(error, 'findByHash', { fileHash })
    }

    return data
  }

  /**
   * Crear múltiples imágenes para un producto
   * @param {number} productId - ID del producto
   * @param {Array} images - Array de imágenes a crear
   * @returns {Promise<Array>} Imágenes creadas
   */
  async createMultiple(productId, images) {
    if (!productId || !Array.isArray(images) || images.length === 0) {
      throw new BadRequestError('productId and images array are required', {
        productId,
        imagesCount: images?.length
      })
    }

    // Preparar datos con product_id
    const imagesWithProduct = images.map((image, index) => ({
      product_id: productId,
      image_index: index,
      url: image.url,
      size: image.size,
      is_primary: image.is_primary || false,
      file_hash: image.file_hash,
      mime_type: image.mime_type
    }))

    const { data, error } = await this.supabase.from(this.table).insert(imagesWithProduct).select()

    if (error) {
      throw this.handleError(error, 'createMultiple', { productId, imagesCount: images.length })
    }

    return data || []
  }

  /**
   * Actualizar orden del carousel
   * @param {number} productId - ID del producto
   * @param {Array} imageIds - IDs de imágenes en orden
   * @returns {Promise<void>}
   */
  async updateCarouselOrder(productId, imageIds) {
    if (!productId || !Array.isArray(imageIds) || imageIds.length === 0) {
      throw new BadRequestError('productId and imageIds array are required', {
        productId,
        imageIdsCount: imageIds?.length
      })
    }

    // Actualizar cada imagen con su nuevo índice
    const updates = imageIds.map((imageId, index) => ({
      id: imageId,
      image_index: index
    }))

    // Usar RPC si existe, sino actualizar individualmente
    // Por simplicidad, actualizamos individualmente
    for (const update of updates) {
      const { error } = await this.supabase
        .from(this.table)
        .update({ image_index: update.image_index })
        .eq('id', update.id)
        .eq('product_id', productId)

      if (error) {
        throw this.handleError(error, 'updateCarouselOrder', { productId, imageId: update.id })
      }
    }
  }

  /**
   * Eliminar imágenes de un producto
   * @param {number} productId - ID del producto
   * @param {Array} imageIds - IDs de imágenes a eliminar (opcional, elimina todas si no se especifica)
   * @returns {Promise<number>} Número de imágenes eliminadas
   */
  async deleteByProductId(productId, imageIds = null) {
    let query = this.supabase.from(this.table).delete().eq('product_id', productId)

    if (imageIds && Array.isArray(imageIds) && imageIds.length > 0) {
      query = query.in('id', imageIds)
    }

    const { data, error } = await query

    if (error) {
      throw this.handleError(error, 'deleteByProductId', {
        productId,
        imageIdsCount: imageIds?.length
      })
    }

    return data?.length || 0
  }
}

/**
 * Factory function to create ProductImageRepository instance
 * @param {Object} supabaseClient - Supabase client instance
 * @returns {ProductImageRepository} Repository instance
 */
export function createProductImageRepository(supabaseClient = null) {
  if (!supabaseClient) {
    throw new Error('SupabaseClient is required to create ProductImageRepository')
  }
  return new ProductImageRepository(supabaseClient)
}
