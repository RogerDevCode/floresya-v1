/**
 * Carousel Service
 * Single Responsibility: Manage carousel_order conflicts and positioning
 * SOLID: Extracted from productService to avoid bloat
 */

import { supabase } from './supabaseClient.js'
import { DatabaseError, ValidationError } from '../errors/AppError.js'

const TABLE = 'products'
const MAX_CAROUSEL_SIZE = 7

/**
 * Get all featured products in carousel (ordered)
 * @returns {Promise<Array>} Featured products sorted by carousel_order
 */
export async function getCarouselProducts() {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('id, name, carousel_order, image_url_small')
      .eq('featured', true)
      .eq('active', true)
      .order('carousel_order', { ascending: true })
      .limit(MAX_CAROUSEL_SIZE)

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error)
    }
    return data || []
  } catch (error) {
    console.error('getCarouselProducts failed:', error)
    throw error
  }
}

/**
 * Validate carousel_order value
 * @param {number} carouselOrder - Position to validate
 * @throws {ValidationError} If invalid
 */
export function validateCarouselOrder(carouselOrder) {
  if (!carouselOrder) {
    return
  } // null/undefined is valid (not featured)

  if (typeof carouselOrder !== 'number' || carouselOrder < 1 || carouselOrder > MAX_CAROUSEL_SIZE) {
    throw new ValidationError(`carousel_order must be between 1-${MAX_CAROUSEL_SIZE}`, {
      carouselOrder
    })
  }
}

/**
 * Check if carousel is full (7 products)
 * @param {number} excludeProductId - Product ID to exclude from count (when editing)
 * @returns {Promise<boolean>}
 */
export async function isCarouselFull(excludeProductId = null) {
  try {
    let query = supabase
      .from(TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('featured', true)
      .eq('active', true)

    if (excludeProductId) {
      query = query.neq('id', excludeProductId)
    }

    const { count, error } = await query

    if (error) {
      throw new DatabaseError('COUNT', TABLE, error)
    }
    return count >= MAX_CAROUSEL_SIZE
  } catch (error) {
    console.error('isCarouselFull failed:', error)
    throw error
  }
}

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
export async function resolveCarouselOrderConflict(newOrder, excludeProductId = null) {
  if (!newOrder) {
    return { shiftedCount: 0, removedProducts: [] }
  } // Not featured, skip

  validateCarouselOrder(newOrder)

  try {
    // Get products with same or higher order (process in reverse to avoid conflicts)
    let query = supabase
      .from(TABLE)
      .select('id, name, carousel_order')
      .eq('featured', true)
      .eq('active', true)
      .gte('carousel_order', newOrder)
      .order('carousel_order', { ascending: false }) // Process from highest to lowest

    if (excludeProductId) {
      query = query.neq('id', excludeProductId)
    }

    const { data: conflicts, error } = await query

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error)
    }
    if (!conflicts || conflicts.length === 0) {
      return { shiftedCount: 0, removedProducts: [] }
    }

    console.log(`✓ Resolving ${conflicts.length} carousel_order conflicts for position ${newOrder}`)

    const removedProducts = []
    let shiftedCount = 0

    // Shift each conflicting product down
    for (const product of conflicts) {
      const newCarouselOrder = product.carousel_order + 1

      if (newCarouselOrder > MAX_CAROUSEL_SIZE) {
        // Remove from carousel (beyond limit)
        const { error: updateError } = await supabase
          .from(TABLE)
          .update({ featured: false, carousel_order: null })
          .eq('id', product.id)

        if (updateError) {
          throw new DatabaseError('UPDATE', TABLE, updateError, { productId: product.id })
        }

        removedProducts.push({ id: product.id, name: product.name })
        console.log(
          `  → Removed "${product.name}" from carousel (pos ${product.carousel_order} > 7)`
        )
      } else {
        // Shift down
        const { error: updateError } = await supabase
          .from(TABLE)
          .update({ carousel_order: newCarouselOrder })
          .eq('id', product.id)

        if (updateError) {
          throw new DatabaseError('UPDATE', TABLE, updateError, { productId: product.id })
        }

        shiftedCount++
        console.log(
          `  → Shifted "${product.name}" from ${product.carousel_order} to ${newCarouselOrder}`
        )
      }
    }

    return { shiftedCount, removedProducts }
  } catch (error) {
    console.error('resolveCarouselOrderConflict failed:', error)
    throw error
  }
}

/**
 * Reorder carousel products (batch update)
 * Used for drag-and-drop reordering
 *
 * @param {Array<{productId: number, newOrder: number}>} reorderMap
 * @returns {Promise<number>} Number of products updated
 */
export async function reorderCarousel(reorderMap) {
  if (!Array.isArray(reorderMap) || reorderMap.length === 0) {
    throw new ValidationError('reorderMap must be a non-empty array')
  }

  try {
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
        throw new DatabaseError('UPDATE', TABLE, error, { productId })
      }
      updatedCount++
    }

    console.log(`✓ Reordered ${updatedCount} carousel products`)
    return updatedCount
  } catch (error) {
    console.error('reorderCarousel failed:', error)
    throw error
  }
}

/**
 * Remove product from carousel
 * @param {number} productId - Product to remove
 * @returns {Promise<void>}
 */
export async function removeFromCarousel(productId) {
  try {
    const { error } = await supabase
      .from(TABLE)
      .update({ featured: false, carousel_order: null })
      .eq('id', productId)

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { productId })
    }

    console.log(`✓ Removed product ${productId} from carousel`)
  } catch (error) {
    console.error('removeFromCarousel failed:', error)
    throw error
  }
}

/**
 * Get available carousel positions (1-7)
 * Returns array of available positions based on current carousel state
 *
 * @param {number} excludeProductId - Product being edited (its position is available)
 * @returns {Promise<Array<number>>} Available positions
 */
export async function getAvailablePositions(excludeProductId = null) {
  try {
    const products = await getCarouselProducts()

    // Filter out excluded product
    const occupiedPositions = products
      .filter(p => p.id !== excludeProductId)
      .map(p => p.carousel_order)
      .filter(order => order !== null)

    // Generate available positions (1-7 minus occupied)
    const allPositions = Array.from({ length: MAX_CAROUSEL_SIZE }, (_, i) => i + 1)
    const available = allPositions.filter(pos => !occupiedPositions.includes(pos))

    return available
  } catch (error) {
    console.error('getAvailablePositions failed:', error)
    throw error
  }
}
