/**
 * Procesado por B
 */

/**
 * Occasion Service - Helper Functions & Shared Imports
 * LEGACY: Modularizado desde occasionService.js (PHASE 5)
 */

import DIContainer from '../architecture/di-container.js'
import { ValidationError, NotFoundError, BadRequestError } from '../errors/AppError.js'

/**
 * Get OccasionRepository instance from DI Container
 * @returns {OccasionRepository} Repository instance
 */
function getOccasionRepository() {
  return DIContainer.resolve('OccasionRepository')
}

export { getOccasionRepository, ValidationError, NotFoundError, BadRequestError }
