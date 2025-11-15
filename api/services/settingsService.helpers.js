/**
 * Procesado por B
 */

/**
 * Settings Service - Helper Functions & Shared Imports
 * LEGACY: Modularizado desde settingsService.js (PHASE 5)
 */

import DIContainer from '../architecture/di-container.js'
import { ValidationError, NotFoundError, BadRequestError } from '../errors/AppError.js'

/**
 * Get SettingsRepository instance from DI Container
 * @returns {SettingsRepository} Repository instance
 */
function getSettingsRepository() {
  return DIContainer.resolve('SettingsRepository')
}

export { getSettingsRepository, ValidationError, NotFoundError, BadRequestError }
