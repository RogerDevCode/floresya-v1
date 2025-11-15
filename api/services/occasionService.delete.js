/**
 * Procesado por B
 */

/**
 * Occasion Service - Delete Operations
 * Handles occasion deletion and reactivation
 * LEGACY: Modularizado desde occasionService.js (PHASE 5)
 */

import { getOccasionRepository, BadRequestError } from './occasionService.helpers.js'

/**
 * Delete occasion (soft delete)
 * @param {number} id - Occasion ID to delete
 * @returns {Object} Deleted occasion
 * @throws {BadRequestError} If ID is invalid
 */
export async function deleteOccasion(id) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid occasion ID: must be a number', { id })
    }

    const occasionRepository = getOccasionRepository()
    const data = await occasionRepository.delete(id)

    return data
  } catch (error) {
    console.error(`deleteOccasion(${id}) failed:`, error)
    throw error
  }
}

/**
 * Reactivate deleted occasion
 * @param {number} id - Occasion ID to reactivate
 * @returns {Object} Reactivated occasion
 * @throws {BadRequestError} If ID is invalid
 */
export async function reactivateOccasion(id) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid occasion ID: must be a number', { id })
    }

    const occasionRepository = getOccasionRepository()
    const data = await occasionRepository.reactivate(id)

    return data
  } catch (error) {
    console.error(`reactivateOccasion(${id}) failed:`, error)
    throw error
  }
}
