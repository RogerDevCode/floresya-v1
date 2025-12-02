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
import { ValidationError } from '../../errors/AppError.js'

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
export const validate = (schemaOrParam = 'id') => {
  return (req, res, next) => {
    try {
      // If string, it's a param name (ID validation)
      if (typeof schemaOrParam === 'string') {
        const value = req.params[schemaOrParam]
        ValidatorService.validateId(value, schemaOrParam)
        return next()
      }

      // If object, it's a schema
      if (typeof schemaOrParam === 'object') {
        const errors = []
        // Iterate over schema fields
        for (const [field, rules] of Object.entries(schemaOrParam)) {
          const value = req.body[field]

          // Required check
          if (rules.required && (value === undefined || value === null)) {
            errors.push({ field, message: `${field} is required` })
            continue
          }

          // Custom validator (run even if value is undefined to allow cross-field validation)
          if (rules.custom && typeof rules.custom === 'function') {
            const customError = rules.custom(value, req.body)
            if (customError) {
              errors.push({ field, message: customError })
            }
          }

          if (value !== undefined && value !== null) {
            // Type check
            if (rules.type) {
              if (rules.type === 'array') {
                if (!Array.isArray(value)) {
                  errors.push({ field, message: `${field} must be an array` })
                } else if (rules.items) {
                  // Validate array items type
                  const invalidItems = value.some(item => typeof item !== rules.items)
                  if (invalidItems) {
                    errors.push({ field, message: `${field} items must be of type ${rules.items}` })
                  }
                }
              } else if (rules.type === 'integer') {
                if (!Number.isInteger(value)) {
                  errors.push({ field, message: `${field} must be an integer` })
                }
              } else if (typeof value !== rules.type && rules.type !== 'integer') {
                errors.push({ field, message: `${field} must be a ${rules.type}` })
              }
            }

            // Numeric checks
            if (typeof value === 'number') {
              if (rules.min !== undefined && value < rules.min) {
                errors.push({ field, message: `${field} must be at least ${rules.min}` })
              }
              if (rules.max !== undefined && value > rules.max) {
                errors.push({ field, message: `${field} must be at most ${rules.max}` })
              }
            }

            // String checks
            if (typeof value === 'string') {
              if (rules.minLength !== undefined && value.length < rules.minLength) {
                errors.push({
                  field,
                  message: `${field} must be at least ${rules.minLength} characters`
                })
              }
            }
          }
        }

        if (errors.length > 0) {
          throw new ValidationError('Validation failed', { errors })
        }
        return next()
      }

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

export const validatePagination = (req, res, next) => {
  try {
    const params = {
      limit: req.query.limit,
      offset: req.query.offset
    }
    const validated = ValidatorService.validatePagination(params)

    // Update req.query with validated values
    if (validated.limit !== undefined) req.query.limit = validated.limit
    if (validated.offset !== undefined) req.query.offset = validated.offset

    next()
  } catch (error) {
    next(error)
  }
}

export const sanitize = ValidatorService.sanitizeString.bind(ValidatorService)

// Export advanced validation
export { advancedValidate }

// Export sanitize middleware
export { sanitizeRequestData }

// Export product schemas explicitly
export { productCreateSchema, productUpdateSchema }
