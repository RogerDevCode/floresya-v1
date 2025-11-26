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

// Import schemas from modularized files
import { productCreateSchema, productUpdateSchema } from './schemas.product.js'

// Import advanced validation
import { advancedValidate } from './advancedValidation.middleware.js'

// Import all schemas from schemas.index.js
import * as allSchemas from './schemas.index.js'
export const {
  orderCreateSchema,
  orderStatusUpdateSchema,
  paymentConfirmSchema,
  userCreateSchema,
  userUpdateSchema,
  occasionCreateSchema,
  occasionUpdateSchema,
  settingCreateSchema,
  settingUpdateSchema,
  productImageCreateSchema,
  productImageUpdateSchema
} = allSchemas

// Import sanitize middleware (correct filename)
import { sanitizeRequestData } from './sanitize.js'

// Export commonly used validation functions
// Create middleware factories for route parameter validation
export const validate = (paramName = 'id') => {
  return (req, res, next) => {
    try {
      const value = req.params[paramName]
      ValidatorService.validateId(value, paramName)
      next()
    } catch (error) {
      next(error)
    }
  }
}

export const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    try {
      const value = req.params[paramName]
      ValidatorService.validateId(value, paramName)
      next()
    } catch (error) {
      next(error)
    }
  }
}

export const validateEmail = ValidatorService.validateEmail.bind(ValidatorService)
export const validatePagination = ValidatorService.validatePagination.bind(ValidatorService)
export const sanitize = ValidatorService.sanitizeString.bind(ValidatorService)

// Export advanced validation
export { advancedValidate }

// Export sanitize middleware
export { sanitizeRequestData }

// Export product schemas explicitly
export { productCreateSchema, productUpdateSchema }
