/**
 * Frontend XSS Protection Utilities
 * Client-side input sanitization and validation
 */

/**
 * Sanitize HTML content by escaping dangerous characters
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeHTML(str) {
  if (typeof str !== 'string') {
    return str
  }

  const entityMap = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  }

  return str.replace(/[&<>"'`=/]/g, s => entityMap[s])
}

/**
 * Sanitize user input for display (less aggressive than HTML sanitization)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeInput(str) {
  if (typeof str !== 'string') {
    return str
  }

  return str.replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, '&#x27;')
}

/**
 * Validate and sanitize form input
 * @param {string} value - Input value
 * @param {Object} options - Validation options
 * @returns {Object} { isValid: boolean, sanitized: string, error?: string }
 */
export function validateAndSanitizeInput(value, options = {}) {
  const {
    maxLength = 1000,
    allowHTML = false,
    allowScript = false,
    allowSpecialChars = true
  } = options

  if (typeof value !== 'string') {
    return {
      isValid: false,
      sanitized: '',
      error: 'Input must be a string'
    }
  }

  // Check length
  if (value.length > maxLength) {
    return {
      isValid: false,
      sanitized: value.substring(0, maxLength),
      error: `Input exceeds maximum length of ${maxLength} characters`
    }
  }

  let sanitized = value

  // Remove null bytes and other dangerous characters
  sanitized = sanitized.replace(/\0/g, '')

  // Check for script tags if not allowed
  if (!allowScript && /<script[^>]*>.*?<\/script>/gi.test(sanitized)) {
    return {
      isValid: false,
      sanitized: sanitized.replace(/<script[^>]*>.*?<\/script>/gi, ''),
      error: 'Script tags are not allowed'
    }
  }

  // Sanitize HTML if not allowed
  if (!allowHTML) {
    sanitized = sanitizeHTML(sanitized)
  }

  // Remove special characters if not allowed
  if (!allowSpecialChars) {
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_.]/g, '')
  }

  return {
    isValid: true,
    sanitized
  }
}

/**
 * Sanitize object properties recursively
 * @param {Object|Array} obj - Object to sanitize
 * @param {Object} options - Sanitization options
 * @returns {Object|Array} Sanitized object
 */
export function sanitizeObject(obj, options = {}) {
  if (!obj || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeInput(obj) : obj
  }

  const sanitized = Array.isArray(obj) ? [] : {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, options)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Check if string contains potentially dangerous patterns
 * @param {string} str - String to check
 * @returns {boolean} True if potentially dangerous
 */
export function containsDangerousPatterns(str) {
  if (typeof str !== 'string') {
    return false
  }

  const dangerousPatterns = [
    /<script[^>]*>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi
  ]

  return dangerousPatterns.some(pattern => pattern.test(str))
}

/**
 * Safe DOM manipulation - create element from sanitized HTML
 * @param {string} html - HTML string
 * @returns {HTMLElement|null} Safe element or null if dangerous
 */
export function createSafeElement(html) {
  if (containsDangerousPatterns(html)) {
    console.warn('Potentially dangerous HTML detected, not rendering')
    return null
  }

  const template = document.createElement('template')
  template.innerHTML = sanitizeHTML(html)
  return template.content.firstElementChild
}

/**
 * Safe URL validation
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is safe
 */
export function isSafeUrl(url) {
  if (typeof url !== 'string') {
    return false
  }

  try {
    const parsedUrl = new URL(url)

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false
    }

    // Prevent localhost in production (optional)
    if (
      process.env.NODE_ENV === 'production' &&
      (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1')
    ) {
      return false
    }

    return true
  } catch {
    return false
  }
}
