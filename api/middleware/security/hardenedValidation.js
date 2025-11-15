/**
 * Procesado por B
 */

/**
 * Hardened Input Validation
 * Enhanced validation with security focus
 *
 * PRINCIPLES APPLIED:
 * - Defense in Depth: Multi-layer validation
 * - Fail Fast: Immediate validation errors
 * - Never trust user input: Strict validation
 */

import { BadRequestError } from '../../errors/AppError.js'
import { logger } from '../../utils/logger.js'

/**
 * SQL injection prevention - strip dangerous characters
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export function preventSQLInjection(input) {
  if (typeof input !== 'string') {
    return input
  }

  const dangerous = [
    /(%27)|(')|(--)|(%23)|#/gi, // Single quote, comments
    /(%3B)|;/gi, // Semicolon
    /(%3D)|=/gi, // Equals (in certain contexts)
    /(%2B)|\+/gi, // Plus
    /(%2D)|-/gi, // Dash
    /(%40)|@/gi, // At sign
    /(%7C)|\|/gi, // Pipe
    /(%26)|&/gi, // Ampersand
    /(%3C)|</gi, // Less than
    /(%3E)|>/gi, // Greater than
    /union[\s]+select/gi, // UNION SELECT
    /drop[\s]+table/gi, // DROP TABLE
    /delete[\s]+from/gi, // DELETE FROM
    /insert[\s]+into/gi, // INSERT INTO
    /update[\s]+set/gi // UPDATE SET
  ]

  let sanitized = input
  dangerous.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })

  return sanitized
}

/**
 * XSS prevention - strip script tags and dangerous attributes
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export function preventXSS(input) {
  if (typeof input !== 'string') {
    return input
  }

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick, onload, etc)
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove objects
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embeds
    .replace(/<link\b[^<]>*\/>/gi, '') // Remove link tags
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove style tags
}

/**
 * Path traversal prevention
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export function preventPathTraversal(input) {
  if (typeof input !== 'string') {
    return input
  }

  // Remove directory traversal attempts
  return input.replace(/\.\.(\/|$)/g, '')
}

/**
 * HTML entity encoding for safe output
 * @param {string} input - Input to encode
 * @returns {string} Encoded input
 */
export function encodeHTMLEntities(input) {
  if (typeof input !== 'string') {
    return input
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Enhanced email validation with security checks
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export function validateEmailSecure(email) {
  if (typeof email !== 'string') {
    return false
  }

  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    return false
  }

  // Additional security checks
  const dangerousPatterns = [
    /script/i,
    /javascript/i,
    /data:/i,
    /vbscript:/i,
    /onload/i,
    /onerror/i
  ]

  const hasDangerous = dangerousPatterns.some(pattern => pattern.test(email))

  return !hasDangerous
}

/**
 * Enhanced phone validation for Venezuelan numbers
 * @param {string} phone - Phone to validate
 * @returns {boolean} Is valid
 */
export function validatePhoneSecure(phone) {
  if (typeof phone !== 'string') {
    return false
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // Check length (10 digits for Venezuelan mobile)
  if (digits.length !== 10) {
    return false
  }

  // Check valid mobile prefixes
  const validPrefixes = ['0412', '0414', '0416', '0424', '0426', '0410', '0411', '0418', '0425']

  const prefix = digits.substring(0, 4)

  if (!validPrefixes.includes(prefix)) {
    return false
  }

  return true
}

/**
 * Validate and sanitize user input with comprehensive checks
 * @param {Object} input - Input to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Sanitized and validated input
 * @throws {BadRequestError} If validation fails
 */
export function validateAndSanitize(input, rules) {
  if (!input || typeof input !== 'object') {
    throw new BadRequestError('Invalid input type', { inputType: typeof input })
  }

  const sanitized = {}
  const errors = []

  for (const [field, rule] of Object.entries(rules)) {
    const value = input[field]

    // Check required
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`)
      continue
    }

    // Skip if not required and not present
    if (!rule.required && (value === undefined || value === null)) {
      continue
    }

    // Type checking
    if (rule.type && typeof value !== rule.type) {
      errors.push(`${field} must be of type ${rule.type}`)
      continue
    }

    let sanitizedValue = value

    // Apply sanitization based on type
    if (typeof value === 'string') {
      // Trim whitespace
      sanitizedValue = value.trim()

      // Prevent SQL injection
      if (rule.preventSQL !== false) {
        sanitizedValue = preventSQLInjection(sanitizedValue)
      }

      // Prevent XSS
      if (rule.preventXSS !== false) {
        sanitizedValue = preventXSS(sanitizedValue)
      }

      // Prevent path traversal
      if (rule.preventPathTraversal) {
        sanitizedValue = preventPathTraversal(sanitizedValue)
      }

      // Check min/max length
      if (rule.minLength && sanitizedValue.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`)
        continue
      }

      if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
        errors.push(`${field} must be at most ${rule.maxLength} characters`)
        continue
      }

      // Pattern matching
      if (rule.pattern && !rule.pattern.test(sanitizedValue)) {
        errors.push(`${field} format is invalid`)
        continue
      }

      // Special validation for email
      if (rule.validateEmail && !validateEmailSecure(sanitizedValue)) {
        errors.push(`${field} must be a valid email address`)
        continue
      }

      // Special validation for phone
      if (rule.validatePhone && !validatePhoneSecure(sanitizedValue)) {
        errors.push(`${field} must be a valid Venezuelan phone number`)
        continue
      }
    }

    // Numeric validation
    if (rule.type === 'number') {
      const numValue = Number(value)

      if (isNaN(numValue)) {
        errors.push(`${field} must be a valid number`)
        continue
      }

      if (rule.min !== undefined && numValue < rule.min) {
        errors.push(`${field} must be at least ${rule.min}`)
        continue
      }

      if (rule.max !== undefined && numValue > rule.max) {
        errors.push(`${field} must be at most ${rule.max}`)
        continue
      }

      sanitizedValue = numValue
    }

    sanitized[field] = sanitizedValue
  }

  if (errors.length > 0) {
    logger.warn('Validation errors detected', { fieldErrors: errors, input })
    throw new BadRequestError('Validation failed', { errors })
  }

  return sanitized
}

/**
 * Validate file upload with security checks
 * @param {Object} file - File object from multer
 * @returns {Object} Validation result
 */
export function validateFileUpload(file) {
  if (!file) {
    throw new BadRequestError('No file provided')
  }

  const errors = []

  // Check file size (max 4MB as per requirements)
  const maxSize = 4 * 1024 * 1024 // 4MB

  if (file.size > maxSize) {
    errors.push('File size exceeds 4MB limit')
  }

  // Check mime type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.mimetype)) {
    errors.push('File type not allowed. Only JPEG, PNG, and WebP are allowed.')
  }

  // Check filename for path traversal
  const sanitizedFilename = preventPathTraversal(file.originalname)

  if (sanitizedFilename !== file.originalname) {
    errors.push('Invalid filename')
  }

  if (errors.length > 0) {
    throw new BadRequestError('File validation failed', { errors })
  }

  return {
    valid: true,
    sanitizedFilename,
    size: file.size,
    mimetype: file.mimetype
  }
}

export default {
  preventSQLInjection,
  preventXSS,
  preventPathTraversal,
  encodeHTMLEntities,
  validateEmailSecure,
  validatePhoneSecure,
  validateAndSanitize,
  validateFileUpload
}
