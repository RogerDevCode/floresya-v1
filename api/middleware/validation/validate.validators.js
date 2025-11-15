/**
 * Procesado por B
 */

/**
 * Validation Middleware - Validator Functions
 * LEGACY: Modularized from validate.js (Phase 6)
 */

import { ValidationError, BadRequestError } from '../../errors/AppError.js'

/**
 * Generic validator builder
 * STANDARDIZED FORMAT: Returns field-specific error object for better client experience
 * @param {Object} schema - Validation schema
 * @param {string} source - 'body' | 'params' | 'query'
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const data = req[source]
      const validationErrors = {}

      // Validate each field in schema
      for (const [field, rules] of Object.entries(schema)) {
        const value = data[field]
        const fieldErrors = []

        // Required check
        if (rules.required && (value === undefined || value === null || value === '')) {
          fieldErrors.push('This field is required')
          validationErrors[field] = fieldErrors
          continue
        }

        // Skip further validation if not required and empty
        if (!rules.required && (value === undefined || value === null || value === '')) {
          continue
        }

        // Type validation
        if (rules.type) {
          const actualType = Array.isArray(value) ? 'array' : typeof value

          if (actualType !== rules.type) {
            fieldErrors.push(`Must be of type ${rules.type}`)
            validationErrors[field] = fieldErrors
            continue
          }
        }

        // String validations
        if (rules.type === 'string') {
          if (rules.minLength && value.length < rules.minLength) {
            fieldErrors.push(`Must be at least ${rules.minLength} characters`)
          }
          if (rules.maxLength && value.length > rules.maxLength) {
            fieldErrors.push(`Must be at most ${rules.maxLength} characters`)
          }
          if (rules.pattern && !rules.pattern.test(value)) {
            fieldErrors.push('Format is invalid')
          }
          if (rules.email && !isValidEmail(value)) {
            fieldErrors.push('Must be a valid email address')
          }
        }

        // Number validations
        if (rules.type === 'number') {
          if (rules.min !== undefined && value < rules.min) {
            fieldErrors.push(`Must be at least ${rules.min}`)
          }
          if (rules.max !== undefined && value > rules.max) {
            fieldErrors.push(`Must be at most ${rules.max}`)
          }
          if (rules.integer && !Number.isInteger(value)) {
            fieldErrors.push('Must be an integer')
          }
        }

        // Array validations
        if (rules.type === 'array') {
          if (rules.minLength && value.length < rules.minLength) {
            fieldErrors.push(`Must have at least ${rules.minLength} items`)
          }
          if (rules.maxLength && value.length > rules.maxLength) {
            fieldErrors.push(`Must have at most ${rules.maxLength} items`)
          }
          if (rules.items && !value.every(item => typeof item === rules.items)) {
            fieldErrors.push(`Items must be of type ${rules.items}`)
          }
        }

        // Enum validation
        if (rules.enum && !rules.enum.includes(value)) {
          fieldErrors.push(`Must be one of: ${rules.enum.join(', ')}`)
        }

        // Custom validation
        if (rules.custom) {
          const customError = rules.custom(value, data)
          if (customError) {
            fieldErrors.push(customError)
          }
        }

        // Add field errors if any were found
        if (fieldErrors.length > 0) {
          validationErrors[field] = fieldErrors
        }
      }

      // Check for custom schema-level validation (handle both nested and flattened structures)
      if (schema.product && schema.product.custom) {
        // Pass both the potential nested product object and the flattened data
        const customError = schema.product.custom(data.product, data)
        if (customError) {
          validationErrors.product = [customError]
        }
      }

      if (Object.keys(validationErrors).length > 0) {
        return next(new ValidationError('Validation failed', validationErrors))
      }

      next()
    } catch (error) {
      console.error('Validation error:', error)
      // Ensure unexpected errors are handled as 400, not 500
      return next(new BadRequestError('Invalid request format', { originalError: error.message }))
    }
  }
}

/**
 * Validate ID parameter (positive integer)
 * STANDARDIZED: Returns field-specific error format
 */
export function validateId(paramName = 'id') {
  return (req, res, next) => {
    try {
      const id = parseInt(req.params[paramName], 10)
      const validationErrors = {}

      if (isNaN(id) || id <= 0) {
        validationErrors[paramName] = [`Must be a positive integer`]
        return next(new ValidationError('Validation failed', validationErrors))
      }

      // Convert to number for consistency
      req.params[paramName] = id

      next()
    } catch (error) {
      console.error('Validation error (validateId):', error)
      return next(
        new BadRequestError('Invalid ID format', { paramName, originalError: error.message })
      )
    }
  }
}

/**
 * Validate pagination params
 * STANDARDIZED: Returns field-specific error format with arrays
 */
export function validatePagination(req, res, next) {
  try {
    const { limit, offset, page } = req.query
    const validationErrors = {}

    if (limit) {
      const parsedLimit = parseInt(limit, 10)
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        validationErrors.limit = ['Must be between 1 and 100']
      } else {
        // Use Object.defineProperty to set non-enumerable property on req.query
        Object.defineProperty(req.query, 'limit', {
          value: parsedLimit,
          writable: true,
          enumerable: true,
          configurable: true
        })
      }
    }

    if (offset) {
      const parsedOffset = parseInt(offset, 10)
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        validationErrors.offset = ['Must be a non-negative integer']
      } else {
        Object.defineProperty(req.query, 'offset', {
          value: parsedOffset,
          writable: true,
          enumerable: true,
          configurable: true
        })
      }
    }

    if (page) {
      const parsedPage = parseInt(page, 10)
      if (isNaN(parsedPage) || parsedPage < 1) {
        validationErrors.page = ['Must be a positive integer']
      } else {
        Object.defineProperty(req.query, 'page', {
          value: parsedPage,
          writable: true,
          enumerable: true,
          configurable: true
        })
        // Convert page to offset if limit is provided
        const currentLimit = req.query.limit || 16
        Object.defineProperty(req.query, 'offset', {
          value: (parsedPage - 1) * currentLimit,
          writable: true,
          enumerable: true,
          configurable: true
        })
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      return next(new ValidationError('Validation failed', validationErrors))
    }

    next()
  } catch (error) {
    console.error('Validation error (validatePagination):', error)
    return next(
      new BadRequestError('Invalid pagination parameters', { originalError: error.message })
    )
  }
}
