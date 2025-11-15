/**
 * Procesado por B
 */

/**
 * Global Data Sanitization Middleware
 * Applies sanitization to all incoming requests
 * Prevents null/undefined/NaN issues at the application level
 */

import { ValidationError } from '../../errors/AppError.js'

import { sanitizeData, sanitizeString, FIELD_TYPES } from '../../utils/sanitize.js'
import { logger } from '../../utils/logger.js'

/**
 * Global sanitization middleware
 * Sanitizes request body and query parameters
 */
export function globalSanitize(req, res, next) {
  try {
    // Sanitize request body if present
    if (req.body && typeof req.body === 'object') {
      const originalBody = { ...req.body }

      // Determine field types based on route
      let fieldTypes = {}

      // Products routes
      if (req.path.startsWith('/api/products')) {
        fieldTypes = FIELD_TYPES.products
      }
      // Orders routes
      else if (req.path.startsWith('/api/orders')) {
        fieldTypes = FIELD_TYPES.orders
      }
      // Users routes
      else if (req.path.startsWith('/api/users')) {
        fieldTypes = FIELD_TYPES.users
      }
      // Generic sanitization for unknown routes
      else {
        fieldTypes = {
          id: 'number',
          limit: 'number',
          offset: 'number',
          page: 'number'
        }
      }

      req.body = sanitizeData(req.body, fieldTypes)

      // Log sanitization changes for monitoring
      const changes = detectSanitizationChanges(originalBody, req.body)
      if (changes.length > 0) {
        logger.debug('Data sanitization applied', {
          path: req.path,
          method: req.method,
          changes
        })
      }
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      const originalQuery = { ...req.query }

      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
          // Convert numeric strings to numbers
          if (!isNaN(value) && value.trim() !== '') {
            req.query[key] = Number(value)
          }
          // Sanitize string values
          else {
            req.query[key] = sanitizeString(value, { maxLength: 255 })
          }
        }
      }

      // Log query sanitization changes
      const queryChanges = detectSanitizationChanges(originalQuery, req.query)
      if (queryChanges.length > 0) {
        logger.debug('Query sanitization applied', {
          path: req.path,
          method: req.method,
          queryChanges
        })
      }
    }

    // Sanitize route parameters
    if (req.params && typeof req.params === 'object') {
      for (const [key, value] of Object.entries(req.params)) {
        if (typeof value === 'string' && !isNaN(value)) {
          req.params[key] = Number(value)
        }
      }
    }

    next()
  } catch (error) {
    logger.error('Error in global sanitization middleware', error)
    next(error)
  }
}

/**
 * Detect what changes were made during sanitization
 * @param {Object} original - Original data
 * @param {Object} sanitized - Sanitized data
 * @returns {Array} Array of changes made
 */
function detectSanitizationChanges(original, sanitized) {
  const changes = []

  for (const [key, originalValue] of Object.entries(original)) {
    const sanitizedValue = sanitized[key]

    if (originalValue !== sanitizedValue) {
      changes.push({
        field: key,
        from: originalValue,
        to: sanitizedValue,
        reason: getSanitizationReason(originalValue, sanitizedValue)
      })
    }
  }

  return changes
}

/**
 * Determine why a value was sanitized
 * @param {any} original - Original value
 * @param {any} sanitized - Sanitized value
 * @returns {string} Reason for sanitization
 */
function getSanitizationReason(original, sanitized) {
  if (original === null || original === undefined) {
    return 'null_to_default'
  }

  if (typeof original === 'number' && isNaN(original)) {
    return 'nan_to_number'
  }

  if (typeof original === 'string' && sanitized !== original) {
    return 'string_sanitized'
  }

  return 'type_conversion'
}

/**
 * Specific sanitization for product creation/update
 */
export function sanitizeProductRequest(req, res, next) {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeData(req.body, FIELD_TYPES.products)
    }
    next()
  } catch (error) {
    logger.error('Error sanitizing product request', error)
    next(error)
  }
}

/**
 * Specific sanitization for order creation/update
 */
export function sanitizeOrderRequest(req, res, next) {
  try {
    if (req.body && typeof req.body === 'object') {
      // Sanitize main order data
      if (req.body.order) {
        req.body.order = sanitizeData(req.body.order, FIELD_TYPES.orders)
      }

      // Sanitize order items
      if (req.body.items && Array.isArray(req.body.items)) {
        req.body.items = req.body.items.map(item => sanitizeData(item, FIELD_TYPES.order_items))
      }
    }
    next()
  } catch (error) {
    logger.error('Error sanitizing order request', error)
    next(error)
  }
}

/**
 * Sanitization for user creation/update
 */
export function sanitizeUserRequest(req, res, next) {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeData(req.body, FIELD_TYPES.users)
    }
    next()
  } catch (error) {
    logger.error('Error sanitizing user request', error)
    next(error)
  }
}

/**
 * Post-sanitiization validation
 * Ensures sanitized data meets business requirements
 */
export function validateSanitizedData(req, res, next) {
  try {
    // Validate critical fields after sanitization
    if (req.body.price_usd !== undefined && req.body.price_usd <= 0) {
      return next(new ValidationError('Precio debe ser mayor a 0 después de sanitización'))
    }

    if (req.body.stock !== undefined && req.body.stock < 0) {
      return next(new ValidationError('Stock no puede ser negativo después de sanitización'))
    }

    if (req.body.total_amount_usd !== undefined && req.body.total_amount_usd <= 0) {
      return next(new ValidationError('Monto total debe ser mayor a 0 después de sanitización'))
    }

    next()
  } catch (error) {
    logger.error('Error validating sanitized data', error)
    next(error)
  }
}
