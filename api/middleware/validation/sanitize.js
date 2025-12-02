/**
 * Enhanced Data Sanitization Middleware
 * Integrates with comprehensive security services for enterprise-grade protection
 * Converts null/undefined values based on PostgreSQL column types
 * Applied before validation to ensure data consistency
 */

import { InputSanitizationService } from '../../services/security/InputSanitizationService.js'
import { MalwareScanningService } from '../../services/security/MalwareScanningService.js'
import { DataProtectionService } from '../../services/security/DataProtectionService.js'
import { logger } from '../../utils/logger.js'

// Database column type mappings for orders and order_items
const ORDERS_COLUMN_TYPES = {
  // String/varchar columns - convert null/undefined to empty string
  customer_email: 'string',
  customer_name: 'string',
  customer_phone: 'string',
  delivery_address: 'string',
  delivery_time_slot: 'string',
  delivery_notes: 'string',
  notes: 'string',
  admin_notes: 'string',

  // Date columns - convert null/undefined to current date
  delivery_date: 'date',

  // Integer columns - convert null/undefined to 0
  user_id: 'integer',
  id: 'integer',

  // Numeric/decimal columns - convert null/undefined to 0.00
  total_amount_usd: 'numeric',
  total_amount_ves: 'numeric',
  currency_rate: 'numeric',

  // Enum columns - use default values
  status: 'enum'
}

const ORDER_ITEMS_COLUMN_TYPES = {
  // String/varchar columns - convert null/undefined to empty string
  product_name: 'string',
  product_summary: 'string',

  // Integer columns - convert null/undefined to 0
  product_id: 'integer',
  quantity: 'integer',
  id: 'integer',
  order_id: 'integer',

  // Numeric/decimal columns - convert null/undefined to 0.00
  unit_price_usd: 'numeric',
  unit_price_ves: 'numeric',
  subtotal_usd: 'numeric',
  subtotal_ves: 'numeric',

  // Date columns - convert null/undefined to current date
  created_at: 'date',
  updated_at: 'date'
}

/**
 * Get current timestamp in ISO format
 */
function getCurrentTimestamp() {
  return new Date().toISOString()
}

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate() {
  return new Date().toISOString().split('T')[0]
}

/**
 * Sanitize a value based on its column type
 */
function sanitizeValue(value, columnType) {
  // Handle null/undefined values based on type
  if (value === null || value === undefined) {
    switch (columnType) {
      case 'string':
        return ''
      case 'integer':
        return 0
      case 'numeric':
        return 0.0
      case 'date':
        return getCurrentDate()
      case 'timestamp':
        return getCurrentTimestamp()
      case 'boolean':
        return false
      case 'enum':
        return 'pending' // Default order status
      default:
        return ''
    }
  }

  // Convert empty strings for required string fields
  if (columnType === 'string' && typeof value === 'string' && value.trim() === '') {
    return ''
  }

  // Convert string numbers to actual numbers for numeric fields
  if (columnType === 'numeric' && typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0.0 : parsed
  }

  if (columnType === 'integer' && typeof value === 'string') {
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? 0 : parsed
  }

  // Convert string booleans to actual booleans
  if (columnType === 'boolean' && typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }

  return value
}

/**
 * Sanitize order data
 */
export function sanitizeOrderData(orderData) {
  if (!orderData) {
    return {}
  }

  const sanitized = { ...orderData }

  // Apply sanitization for each field based on column type
  for (const [key, columnType] of Object.entries(ORDERS_COLUMN_TYPES)) {
    if (key in sanitized) {
      sanitized[key] = sanitizeValue(sanitized[key], columnType)
    }
  }

  return sanitized
}

/**
 * Sanitize order items array
 */
export function sanitizeOrderItems(items) {
  if (!Array.isArray(items)) {
    return []
  }

  return items.map(item => {
    if (!item || typeof item !== 'object') {
      return {}
    }

    const sanitized = { ...item }

    // Apply sanitization for each field based on column type
    for (const [key, columnType] of Object.entries(ORDER_ITEMS_COLUMN_TYPES)) {
      if (key in sanitized) {
        sanitized[key] = sanitizeValue(sanitized[key], columnType)
      }
    }

    return sanitized
  })
}

/**
 * Enhanced sanitization middleware with comprehensive security protection
 * Applied before validation to ensure consistent data types and security
 */
export function sanitizeRequestData(req, res, next) {
  try {
    // Enhanced input sanitization using InputSanitizationService
    if (req.body && typeof req.body === 'object') {
      // Apply comprehensive security sanitization
      req.body = InputSanitizationService.sanitizeObject(req.body, {
        preventSQL: true,
        preventXSS: true,
        preventNoSQL: true,
        preventCommand: true,
        preventPathTraversal: true,
        preventLDAP: true,
        preventXXE: true,
        encodeHTML: true,
        normalizeUnicode: true,
        trimWhitespace: true,
        field: 'request_body'
      })

      // Apply database-specific sanitization for order data
      if (req.body.order) {
        req.body.order = sanitizeOrderData(req.body.order)
      }

      // Apply database-specific sanitization for order items
      if (req.body.items) {
        req.body.items = sanitizeOrderItems(req.body.items)
      }

      // Apply general sanitization for common fields that might not be in order/items
      for (const [key, value] of Object.entries(req.body)) {
        // Skip order and items as they're already sanitized above
        if (key === 'order' || key === 'items') {
          continue
        }

        if (value === null || value === undefined) {
          // Determine type based on common patterns or default to string
          if (key.includes('amount') || key.includes('price') || key.includes('rate')) {
            req.body[key] = 0.0
          } else if (key.includes('quantity') || key.includes('count') || key.includes('id')) {
            req.body[key] = 0
          } else if (key.includes('date') || key.includes('time')) {
            req.body[key] = getCurrentDate()
          } else {
            req.body[key] = ''
          }
        }
      }
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      const sanitizedQuery = InputSanitizationService.sanitizeObject(req.query, {
        preventSQL: true,
        preventXSS: true,
        preventNoSQL: true,
        preventCommand: true,
        preventPathTraversal: true,
        encodeHTML: true,
        field: 'query_params'
      })

      // Safely update query parameters
      // req.query might be read-only in some environments (like Express 5 or Supertest mocks)
      try {
        req.query = sanitizedQuery
      } catch {
        // If direct assignment fails, try updating properties individually
        Object.keys(req.query).forEach(key => {
          delete req.query[key]
        })
        Object.assign(req.query, sanitizedQuery)
      }
    }

    // Sanitize route parameters
    if (req.params && typeof req.params === 'object') {
      req.params = InputSanitizationService.sanitizeObject(req.params, {
        preventSQL: true,
        preventXSS: true,
        preventNoSQL: true,
        preventCommand: true,
        preventPathTraversal: true,
        encodeHTML: false, // Don't encode URL parameters
        field: 'route_params'
      })
    }

    // Log sanitization for audit purposes
    logger.debug('Request data sanitized', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    })

    next()
  } catch (error) {
    console.error('Error in enhanced sanitization middleware:', error)
    logger.error('Sanitization middleware error', {
      error: error.message,
      path: req.path,
      method: req.method,
      ip: req.ip
    })
    next(error)
  }
}

/**
 * Enhanced file upload sanitization middleware
 * Integrates malware scanning and security validation
 */
export async function sanitizeFileUpload(req, res, next) {
  try {
    // If no files, continue
    if (!req.file && !req.files) {
      return next()
    }

    const files = req.files ? (Array.isArray(req.files) ? req.files : [req.files]) : [req.file]

    // Scan each file for malware
    const scanPromises = files.map(async file => {
      if (!file) {
        return null
      }

      try {
        const scanResult = await MalwareScanningService.scanFile(file, {
          strictMode: true,
          scanForMalware: true,
          quarantineSuspicious: true
        })

        // Log scan result
        logger.info('File scan completed', {
          filename: file.originalname,
          isClean: scanResult.isClean,
          threats: scanResult.threats.length,
          quarantined: scanResult.quarantined
        })

        return scanResult
      } catch (error) {
        logger.error('File scan failed', {
          filename: file.originalname,
          error: error.message
        })
        throw error
      }
    })

    // Wait for all scans to complete using async/await pattern
    try {
      const scanResults = await Promise.all(scanPromises)

      // Check if any files are malicious
      const maliciousFiles = scanResults.filter(result => result && !result.isClean)

      if (maliciousFiles.length > 0) {
        const error = new Error('Malicious files detected and blocked')
        error.code = 'MALICIOUS_FILES_DETECTED'
        error.details = maliciousFiles.map(result => ({
          filename: result.filename,
          threats: result.threats,
          quarantined: result.quarantined
        }))
        return next(error)
      }

      // Attach scan results to request
      req.fileScanResults = scanResults
      next()
    } catch (error) {
      logger.error('File upload sanitization failed', {
        error: error.message,
        path: req.path
      })
      next(error)
    }
  } catch (error) {
    console.error('Error in file upload sanitization:', error)
    logger.error('File upload sanitization error', {
      error: error.message,
      path: req.path,
      ip: req.ip
    })
    next(error)
  }
}

/**
 * Data protection middleware for sensitive information
 * Applies encryption and masking where appropriate
 */
export function protectSensitiveData(req, res, next) {
  try {
    // Detect and mask PII in request data for logging
    if (req.body) {
      req.sanitizedBodyForLogging = DataProtectionService.sanitizeForLogging(req.body)
    }

    // Detect PII in query parameters
    if (req.query) {
      req.sanitizedQueryForLogging = DataProtectionService.sanitizeForLogging(req.query)
    }

    // Add security headers for sensitive data handling
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

    next()
  } catch (error) {
    console.error('Error in data protection middleware:', error)
    logger.error('Data protection middleware error', {
      error: error.message,
      path: req.path
    })
    next(error)
  }
}

/**
 * Helper function to check if a value needs sanitization
 */
export function needsSanitization(value, columnType) {
  if (value === null || value === undefined) {
    return true
  }

  if (columnType === 'string' && typeof value === 'string' && value.trim() === '') {
    return false // Empty strings are valid for optional string fields
  }

  return false
}

/**
 * Get sanitization info for debugging
 */
export function getSanitizationInfo(data, columnTypes) {
  const info = {}

  for (const [key, columnType] of Object.entries(columnTypes)) {
    if (key in data) {
      const originalValue = data[key]
      const sanitizedValue = sanitizeValue(originalValue, columnType)
      const wasSanitized = originalValue !== sanitizedValue

      info[key] = {
        original: originalValue,
        sanitized: sanitizedValue,
        type: columnType,
        wasSanitized
      }
    }
  }

  return info
}
