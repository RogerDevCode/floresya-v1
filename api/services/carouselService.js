/**
 * Procesado por B
 */

/**
 * Carousel Service
 * Single Responsibility: Manage carousel_order conflicts and positioning
 * SOLID: Extracted from productService to avoid bloat
 *
 * Uses centralized structured logging
 */

import { supabase, DB_SCHEMA } from './supabaseClient.js'
import { ValidationError } from '../errors/AppError.js'
import { withErrorMapping } from '../middleware/error/index.js'
import { CAROUSEL, QUERY_LIMITS } from '../config/constants.js'
import { log as logger } from '../utils/logger.js'

const TABLE = DB_SCHEMA.products.table

/**
 * Get all featured products in carousel (ordered)
 * @returns {Promise<Array>} Featured products sorted by carousel_order
 */
export const getCarouselProducts = withErrorMapping(
  async () => {
    logger.info('Fetching carousel products')

    // Get all featured and active products, ordered by creation date (newest first)
    const { data: products, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('featured', true)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(CAROUSEL.MAX_SIZE)

    if (error) {
      logger.error('Error fetching products from database', { error: error.message })
      // Map Supabase error automatically
      throw error
    }

    logger.info('Products query result', { count: products?.length || 0 })

    if (!products || products.length === 0) {
      logger.info('No featured products found')
      return []
    }

    // Fetch small image for each product (first image, image_index=1)
    const IMAGES_TABLE = DB_SCHEMA.product_images.table
    logger.info('Fetching images for products', { productCount: products.length })

    let productsWithImages = []

    try {
      const productsWithImagesPromises = products.map(async product => {
        try {
          const { data: images, error: imgError } = await supabase
            .from(IMAGES_TABLE)
            .select('url')
            .eq('product_id', product.id)
            .eq('size', 'small')
            .order('image_index', { ascending: true })
            .limit(QUERY_LIMITS.SINGLE_RECORD)
            .maybeSingle()

          if (imgError) {
            logger.warn('Failed to fetch image for product', {
              productId: product.id,
              error: imgError.message
            })
          }

          return {
            ...product,
            image_url_small: images?.url || null
          }
        } catch (imgErr) {
          logger.error('Error fetching image for product', {
            productId: product.id,
            error: imgErr.message
          })
          return {
            ...product,
            image_url_small: null
          }
        }
      })

      productsWithImages = await Promise.all(productsWithImagesPromises)
      logger.info('Successfully processed products with images', {
        count: productsWithImages.length
      })
    } catch (allErr) {
      logger.error('Error in Promise.all for image fetching', { error: allErr.message })
      // Fallback: return products without images
      productsWithImages = products.map(product => ({
        ...product,
        image_url_small: null
      }))
    }

    logger.info('Carousel products prepared', { count: productsWithImages.length })
    return productsWithImages
  },
  'SELECT',
  TABLE
)

/**
 * Validate carousel_order value
 * @param {number} carouselOrder - Position to validate
 * @throws {ValidationError} If invalid
 */
export function validateCarouselOrder(carouselOrder) {
  if (!carouselOrder) {
    return
  } // null/undefined is valid (not featured)

  if (
    typeof carouselOrder !== 'number' ||
    carouselOrder < CAROUSEL.MIN_POSITION ||
    carouselOrder > CAROUSEL.MAX_POSITION
  ) {
    throw new ValidationError(
      `carousel_order must be between ${CAROUSEL.MIN_POSITION}-${CAROUSEL.MAX_POSITION}`,
      {
        carouselOrder
      }
    )
  }
}

/**
 * Check if carousel is full (7 products)
 * @param {number} excludeProductId - Product ID to exclude from count (when editing)
 * @returns {Promise<boolean>}
 */
export const isCarouselFull = withErrorMapping(
  async (excludeProductId = null) => {
    let query = supabase
      .from(TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('featured', true)
      .eq('active', true)

    if (excludeProductId) {
      query = query.filter('id', 'neq', excludeProductId)
    }

    const { count, error } = await query

    if (error) {
      // Map Supabase error automatically
      throw error
    }
    return count >= CAROUSEL.MAX_SIZE
  },
  'COUNT',
  TABLE
)

/**
 * Resolve carousel_order conflicts before insert/update
 * Strategy:
 * 1. Find products with same or higher carousel_order
 * 2. Shift them down (+1)
 * 3. If shifted beyond position 7, remove from carousel (featured = false)
 *
 * @param {number} newOrder - Desired carousel position (1-7)
 * @param {number} excludeProductId - Product ID being created/edited (exclude from conflict check)
 * @returns {Promise<Object>} { shiftedCount, removedProducts }
 */
export const resolveCarouselOrderConflict = withErrorMapping(
  async (newOrder, excludeProductId = null) => {
    if (!newOrder) {
      return { shiftedCount: 0, removedProducts: [] }
    } // Not featured, skip

    validateCarouselOrder(newOrder)

    // Get products with same or higher order (process in reverse to avoid conflicts)
    let query = supabase
      .from(TABLE)
      .select('id, name, carousel_order')
      .eq('featured', true)
      .eq('active', true)
      .gte('carousel_order', newOrder)
      .order('carousel_order', { ascending: false }) // Process from highest to lowest

    if (excludeProductId) {
      query = query.filter('id', 'neq', excludeProductId)
    }

    const { data: conflicts, error } = await query

    if (error) {
      // Map Supabase error automatically
      throw error
    }
    if (!conflicts || conflicts.length === 0) {
      return { shiftedCount: 0, removedProducts: [] }
    }

    logger.info('Resolving carousel_order conflicts', {
      conflictsCount: conflicts.length,
      newOrder
    })

    const removedProducts = []
    let shiftedCount = 0

    // Shift each conflicting product down
    for (const product of conflicts) {
      const newCarouselOrder = product.carousel_order + 1

      if (newCarouselOrder > CAROUSEL.MAX_SIZE) {
        // Remove from carousel (beyond limit)
        const { error: updateError } = await supabase
          .from(TABLE)
          .update({ featured: false, carousel_order: null })
          .eq('id', product.id)

        if (updateError) {
          throw updateError // Mapeo automático
        }

        removedProducts.push({ id: product.id, name: product.name })
        logger.info('Removed product from carousel', {
          productId: product.id,
          productName: product.name,
          oldPosition: product.carousel_order,
          reason: 'position exceeds max carousel size'
        })
      } else {
        // Shift down
        const { error: updateError } = await supabase
          .from(TABLE)
          .update({ carousel_order: newCarouselOrder })
          .eq('id', product.id)

        if (updateError) {
          throw updateError // Mapeo automático
        }

        shiftedCount++
        logger.info('Shifted product in carousel', {
          productId: product.id,
          productName: product.name,
          oldPosition: product.carousel_order,
          newPosition: newCarouselOrder
        })
      }
    }

    return { shiftedCount, removedProducts }
  },
  'SELECT',
  TABLE
)

/**
 * Reorder carousel products (batch update)
 * Used for drag-and-drop reordering
 *
 * @param {Array<{productId: number, newOrder: number}>} reorderMap
 * @returns {Promise<number>} Number of products updated
 */
export const reorderCarousel = withErrorMapping(
  async reorderMap => {
    if (!Array.isArray(reorderMap) || reorderMap.length === 0) {
      throw new ValidationError('reorderMap must be a non-empty array')
    }

    let updatedCount = 0

    for (const { productId, newOrder } of reorderMap) {
      validateCarouselOrder(newOrder)

      const { error } = await supabase
        .from(TABLE)
        .update({ carousel_order: newOrder })
        .eq('id', productId)
        .eq('featured', true)
        .eq('active', true)

      if (error) {
        // Map Supabase error automatically
        throw error
      }
      updatedCount++
    }

    logger.info('Reordered carousel products', {
      updatedCount
    })
    return updatedCount
  },
  'UPDATE',
  TABLE
)

/**
 * Remove product from carousel
 * @param {number} productId - Product to remove
 * @returns {Promise<void>}
 */
export const removeFromCarousel = withErrorMapping(
  async productId => {
    const { error } = await supabase
      .from(TABLE)
      .update({ featured: false, carousel_order: null })
      .eq('id', productId)

    if (error) {
      // Map Supabase error automatically
      throw error
    }

    logger.info('Removed product from carousel', {
      productId
    })
  },
  'UPDATE',
  TABLE
)

/**
 * Get available carousel positions (1-7)
 * Returns array of available positions based on current carousel state
 *
 * @param {number} excludeProductId - Product being edited (its position is available)
 * @returns {Promise<Array<number>>} Available positions
 */
export const getAvailablePositions = withErrorMapping(
  async (excludeProductId = null) => {
    const products = await getCarouselProducts()

    // Filter out excluded product
    const occupiedPositions = products
      .filter(p => p.id !== excludeProductId)
      .map(p => p.carousel_order)
      .filter(order => order !== null)

    // Generate available positions (1-7 minus occupied)
    const allPositions = Array.from({ length: CAROUSEL.MAX_SIZE }, (_, i) => i + 1)
    const available = allPositions.filter(pos => !occupiedPositions.includes(pos))

    return available
  },
  'SELECT',
  TABLE
)
