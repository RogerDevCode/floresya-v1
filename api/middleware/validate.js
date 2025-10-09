/**
 * Validation Middleware
 * Manual validation helpers for req.body, req.params, req.query
 * No external libraries - pure JavaScript validation
 */

import {
  ValidationError,
  BadRequestError as _BadRequestError,
  ValidationError as ValidationErrorClass
} from '../errors/AppError.js'

/**
 * Generic validator builder
 * @param {Object} schema - Validation schema
 * @param {string} source - 'body' | 'params' | 'query'
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source]
    const errors = []

    // Validate each field in schema
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field]

      // Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`)
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
          errors.push(`${field} must be of type ${rules.type}`)
          continue
        }
      }

      // String validations
      if (rules.type === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`)
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`)
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`)
        }
        if (rules.email && !isValidEmail(value)) {
          errors.push(`${field} must be a valid email`)
        }
      }

      // Number validations
      if (rules.type === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`)
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${field} must be at most ${rules.max}`)
        }
        if (rules.integer && !Number.isInteger(value)) {
          errors.push(`${field} must be an integer`)
        }
      }

      // Array validations
      if (rules.type === 'array') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must have at least ${rules.minLength} items`)
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must have at most ${rules.maxLength} items`)
        }
        if (rules.items && !value.every(item => typeof item === rules.items)) {
          errors.push(`${field} items must be of type ${rules.items}`)
        }
      }

      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`)
      }

      // Custom validation
      if (rules.custom) {
        const customError = rules.custom(value, data)
        if (customError) {
          errors.push(customError)
        }
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError('Validation failed', errors))
    }

    next()
  }
}

/**
 * Validate ID parameter (positive integer)
 */
export function validateId(paramName = 'id') {
  return (req, res, next) => {
    const id = parseInt(req.params[paramName], 10)

    if (isNaN(id) || id <= 0) {
      return next(
        new ValidationErrorClass(`Invalid ${paramName}: must be a positive integer`, {
          [paramName]: `Invalid ${paramName}: must be a positive integer`
        })
      )
    }

    // Convert to number for consistency
    req.params[paramName] = id

    next()
  }
}

/**
 * Validate pagination params
 */
export function validatePagination(req, res, next) {
  const { limit, offset, page } = req.query
  const validationErrors = {}

  if (limit) {
    const parsedLimit = parseInt(limit, 10)
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      validationErrors.limit = 'limit must be between 1 and 100'
    } else {
      req.query.limit = parsedLimit
    }
  }

  if (offset) {
    const parsedOffset = parseInt(offset, 10)
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      validationErrors.offset = 'offset must be a non-negative integer'
    } else {
      req.query.offset = parsedOffset
    }
  }

  if (page) {
    const parsedPage = parseInt(page, 10)
    if (isNaN(parsedPage) || parsedPage < 1) {
      validationErrors.page = 'page must be a positive integer'
    } else {
      req.query.page = parsedPage
      // Convert page to offset if limit is provided
      if (req.query.limit) {
        req.query.offset = (parsedPage - 1) * req.query.limit
      }
    }
  }

  if (Object.keys(validationErrors).length > 0) {
    return next(new ValidationErrorClass('Pagination validation failed', validationErrors))
  }

  next()
}

/**
 * Helper: Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Common validation schemas (reusable)
 */
export const commonSchemas = {
  email: {
    type: 'string',
    required: true,
    email: true
  },
  password: {
    type: 'string',
    required: true,
    minLength: 8
  },
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 255
  },
  phone: {
    type: 'string',
    pattern: /^\+?[\d\s-()]+$/
  },
  url: {
    type: 'string',
    pattern: /^https?:\/\/.+/
  },
  positiveNumber: {
    type: 'number',
    required: true,
    min: 0
  },
  positiveInteger: {
    type: 'number',
    required: true,
    integer: true,
    min: 1
  }
}
