/**
 * Centralized Validation Middleware
 *
 * STANDARDIZED: Now uses ValidatorService as single source of truth
 * All validation is centralized through api/services/validation/ValidatorService.js
 *
 * @category Middleware
 * @deprecated Direct migration to ValidatorService recommended
 */

// Import ValidatorService for backward compatibility
import ValidatorService from '../../services/validation/ValidatorService.js'

// Re-export ValidatorService
export { ValidatorService }
export default ValidatorService

// Export commonly used validation functions
export const validate = ValidatorService.validateId.bind(ValidatorService)
export const validateEmail = ValidatorService.validateEmail.bind(ValidatorService)
export const sanitize = ValidatorService.sanitizeString.bind(ValidatorService)
