/**
 * Procesado por B
 */

/**
 * Occasion Service - Create Operations
 * Handles occasion creation
 * LEGACY: Modularizado desde occasionService.js (PHASE 5)
 */

import { getOccasionRepository, ValidationError } from './occasionService.helpers.js'

/**
 * Create new occasion
 * @param {Object} occasionData - Occasion data
 * @returns {Object} Created occasion
 * @throws {ValidationError} If occasion data is invalid
 */
export async function createOccasion(occasionData) {
  try {
    const occasionRepository = getOccasionRepository()

    // Validate required fields
    if (!occasionData.name || typeof occasionData.name !== 'string') {
      throw new ValidationError('Occasion name is required and must be a string', {
        field: 'name',
        value: occasionData.name
      })
    }

    if (!occasionData.slug || typeof occasionData.slug !== 'string') {
      throw new ValidationError('Occasion slug is required and must be a string', {
        field: 'slug',
        value: occasionData.slug
      })
    }

    // Prepare occasion data
    const newOccasion = {
      name: occasionData.name,
      slug: occasionData.slug,
      description: occasionData.description || null,
      display_order: occasionData.display_order || 0,
      active: occasionData.active !== undefined ? occasionData.active : true
    }

    // Use repository to create occasion
    const data = await occasionRepository.create(newOccasion)

    return data
  } catch (error) {
    console.error('createOccasion failed:', error)
    throw error
  }
}
