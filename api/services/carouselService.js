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

import DIContainer from '../architecture/di-container.js'
import { ValidationError } from '../errors/AppError.js'
import { withErrorMapping } from '../middleware/error/index.js'
import { CAROUSEL } from '../config/constants.js'
import { log as logger } from '../utils/logger.js'

const TABLE = 'products'

/**
 * Get ProductRepository instance
 */
async function getProductRepository() {
  return await DIContainer.resolve('ProductRepository')
}

/**
 * Get all featured products in carousel (ordered)
 * @returns {Promise<Array>} Featured products sorted by carousel_order
 */
export const getCarouselProducts = withErrorMapping(
  async () => {
    logger.info('Fetching carousel products')
    const productRepository = await getProductRepository()
    const products = await productRepository.findFeaturedWithImages(CAROUSEL.MAX_SIZE)

    logger.info('Carousel products retrieved', { count: products.length })
    return products
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
  // null/undefined is valid (not featured)
  if (carouselOrder === null || carouselOrder === undefined) {
    return
  }

  if (
    typeof carouselOrder !== 'number' ||
    !Number.isInteger(carouselOrder) ||
    carouselOrder < CAROUSEL.MIN_POSITION ||
    carouselOrder > CAROUSEL.MAX_POSITION
  ) {
    throw new ValidationError(
      `carousel_order must be an integer between ${CAROUSEL.MIN_POSITION}-${CAROUSEL.MAX_POSITION}`,
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
    const productRepository = await getProductRepository()
    const products = await productRepository.findFeatured(CAROUSEL.MAX_SIZE + 1)

    let count = products.length
    if (excludeProductId) {
      count = products.filter(p => p.id !== excludeProductId).length
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
    }

    validateCarouselOrder(newOrder)

    const productRepository = await getProductRepository()

    // Get all featured products to process in memory (small dataset)
    const products = await productRepository.findFeatured(CAROUSEL.MAX_SIZE + 5)

    // Filter conflicts: active, featured, order >= newOrder, not excluded
    const conflicts = products
      .filter(p => p.carousel_order >= newOrder && p.id !== excludeProductId)
      .sort((a, b) => b.carousel_order - a.carousel_order) // Process highest to lowest

    if (conflicts.length === 0) {
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
        await productRepository.updateCarouselOrder(product.id, null)

        removedProducts.push({ id: product.id, name: product.name })
        logger.info('Removed product from carousel', {
          productId: product.id,
          productName: product.name,
          oldPosition: product.carousel_order,
          reason: 'position exceeds max carousel size'
        })
      } else {
        // Shift down
        await productRepository.updateCarouselOrder(product.id, newCarouselOrder)

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

    const productRepository = await getProductRepository()
    let updatedCount = 0

    for (const { productId, newOrder } of reorderMap) {
      validateCarouselOrder(newOrder)
      await productRepository.updateCarouselOrder(productId, newOrder)
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
    const productRepository = await getProductRepository()
    await productRepository.updateCarouselOrder(productId, null)

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
