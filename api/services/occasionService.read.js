/**
 * Procesado por B
 */

/**
 * Occasion Service - Read Operations
 * Handles all occasion retrieval operations
 * LEGACY: Modularizado desde occasionService.js (PHASE 5)
 */

import { getOccasionRepository, NotFoundError, BadRequestError } from './occasionService.helpers.js'

/**
 * Get all occasions with filters
 * @param {Object} filters - Filter options
 * @param {boolean} includeDeactivated - Include deactivated occasions (default: false)
 * @returns {Array} Array of occasions
 */
export async function getAllOccasions(filters = {}, includeDeactivated = false) {
  try {
    const occasionRepository = getOccasionRepository()
    const data = await occasionRepository.findAllWithFilters(filters, { includeDeactivated })
    return data || []
  } catch (error) {
    console.error('getAllOccasions failed:', error)
    throw error
  }
}

/**
 * Get occasion by ID
 * @param {number} id - Occasion ID
 * @param {boolean} includeDeactivated - Include deactivated occasions (default: false)
 * @returns {Object|null} Occasion object or null
 * @throws {BadRequestError} If ID is invalid
 * @throws {NotFoundError} If occasion is not found
 */
export async function getOccasionById(id, includeDeactivated = false) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid occasion ID: must be a number', { id })
    }

    const occasionRepository = getOccasionRepository()
    const data = await occasionRepository.findById(id, includeDeactivated)

    if (!data) {
      throw new NotFoundError('Occasion', id)
    }

    return data
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error(`getOccasionById(${id}) failed:`, error)
    throw error
  }
}

/**
 * Get occasion by slug
 * @param {string} slug - Occasion slug
 * @param {boolean} includeDeactivated - Include deactivated occasions (default: false)
 * @returns {Object|null} Occasion object or null
 * @throws {BadRequestError} If slug is invalid
 * @throws {NotFoundError} If occasion is not found
 */
export async function getOccasionBySlug(slug, includeDeactivated = false) {
  try {
    if (!slug || typeof slug !== 'string') {
      throw new BadRequestError('Invalid occasion slug: must be a string', { slug })
    }

    const occasionRepository = getOccasionRepository()
    const data = await occasionRepository.findBySlug(slug, includeDeactivated)

    if (!data) {
      throw new NotFoundError('Occasion', slug)
    }

    return data
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error(`getOccasionBySlug(${slug}) failed:`, error)
    throw error
  }
}
