/**
 * Procesado por B
 */

/**
 * Occasion Service - Update Operations
 * Handles occasion updates and order changes
 * LEGACY: Modularizado desde occasionService.js (PHASE 5)
 */

import {
  getOccasionRepository,
  ValidationError,
  BadRequestError
} from './occasionService.helpers.js'

/**
 * Update occasion
 * @param {number} id - Occasion ID to update
 * @param {Object} updates - Updated occasion data
 * @returns {Object} Updated occasion
 * @throws {BadRequestError} If ID is invalid
 * @throws {ValidationError} If update data is invalid
 */
export async function updateOccasion(id, updates) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid occasion ID: must be a number', { id })
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new BadRequestError('No updates provided', { id })
    }

    const occasionRepository = getOccasionRepository()

    // Validate updates if name or slug is being changed
    if (updates.name !== undefined) {
      if (!updates.name || typeof updates.name !== 'string') {
        throw new ValidationError('Occasion name must be a string', {
          field: 'name',
          value: updates.name
        })
      }
    }

    if (updates.slug !== undefined) {
      if (!updates.slug || typeof updates.slug !== 'string') {
        throw new ValidationError('Occasion slug must be a string', {
          field: 'slug',
          value: updates.slug
        })
      }
    }

    // Use repository to update occasion
    const data = await occasionRepository.update(id, updates)

    return data
  } catch (error) {
    console.error(`updateOccasion(${id}) failed:`, error)
    throw error
  }
}

/**
 * Update display order for occasion
 * @param {number} id - Occasion ID
 * @param {number} newOrder - New display order
 * @returns {Object} Updated occasion
 * @throws {BadRequestError} If ID or order is invalid
 */
export async function updateDisplayOrder(id, newOrder) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid occasion ID: must be a number', { id })
    }

    if (
      newOrder === undefined ||
      newOrder === null ||
      typeof newOrder !== 'number' ||
      newOrder < 0
    ) {
      throw new BadRequestError('Invalid display order: must be a non-negative number', {
        newOrder
      })
    }

    const occasionRepository = getOccasionRepository()
    const data = await occasionRepository.update(id, { display_order: newOrder })

    return data
  } catch (error) {
    console.error(`updateDisplayOrder(${id}, ${newOrder}) failed:`, error)
    throw error
  }
}
