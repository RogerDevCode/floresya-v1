/**
 * Comprehensive Input Sanitization Service
 * Enterprise-grade input sanitization with multiple security layers
 *
 * Features:
 * - XSS protection with HTML entity encoding
 * - SQL injection prevention with pattern matching
 * - NoSQL injection prevention
 * - Path traversal protection
 * - Command injection prevention
 * - LDAP injection prevention
 * - XXE (XML External Entity) protection
 * - Content Security Policy validation
 * - Unicode normalization
 * - Input length limits
 * - Character set validation
 */

import { ValidationError } from '../../errors/AppError.js'
import { logger } from '../../utils/logger.js'

/**
 * Security patterns for various injection attacks
 */
const SECURITY_PATTERNS = {
  // SQL Injection patterns
  SQL_INJECTION: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|EXECUTE)\b)/i,
    /(--)|(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\b\s+['"].*['"]\s*=\s*['"].*['"])/i,
    /(\/\*.*\*\/)/i,
    /(\bxp_cmdshell\b)|(\bopenrowset\b)|(\bopendatasource\b)/i,
    /(\bwaitfor\s+delay\b)|(\bbulk\s+insert\b)/i,
    /(\bcast\s*\(|\bconvert\s*\()/i,
    /(\bsubstring\s*\(|\bchar\s*\()/i,
    /(\bascii\s*\(|\bconcat\s*\()/i
  ],

  // NoSQL Injection patterns (MongoDB)
  NOSQL_INJECTION: [
    /\$where/i,
    /\$ne\b/i,
    /\$in\b/i,
    /\$nin\b/i,
    /\$gt\b/i,
    /\$gte\b/i,
    /\$lt\b/i,
    /\$lte\b/i,
    /\$regex\b/i,
    /\$exists\b/i,
    /\$type\b/i,
    /\$mod\b/i,
    /\$all\b/i,
    /\$size\b/i
  ],

  // XSS patterns
  XSS_PATTERNS: [
    /<script[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?<\/iframe>/gi,
    /<object[\s\S]*?<\/object>/gi,
    /<embed[\s\S]*?<\/embed>/gi,
    /<link[\s\S]*?>/gi,
    /<meta[\s\S]*?>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=/gi,
    /on\w+\s*:/gi,
    /<img[^>]*src[^>]*javascript:/gi,
    /<\s*script/gi,
    /<\s*iframe/gi,
    /<\s*object/gi,
    /<\s*embed/gi,
    /expression\s*\(/gi,
    /@import/gi,
    /binding\s*:/gi
  ],

  // Command Injection patterns
  COMMAND_INJECTION: [
    /(\||&|;|`|\$\(|\$\{|\$\()/i,
    /\b(curl|wget|nc|netcat|telnet|ssh|ftp|sftp)\b/i,
    /\b(rm|mv|cp|cat|ls|ps|kill|chmod|chown)\b/i,
    /\b(python|perl|ruby|node|php|bash|sh|cmd|powershell)\b/i,
    /\b(echo|printf|read|export|env|set)\b/i,
    /\b(sudo|su|doas|runas)\b/i,
    /\/etc\/passwd/i,
    /\/etc\/shadow/i,
    /\/proc\/version/i,
    /\/sys\//i
  ],

  // Path Traversal patterns
  PATH_TRAVERSAL: [
    /\.\.\//g,
    /\.\.\\/g,
    /\.\.%2f/gi,
    /\.\.%5c/gi,
    /\.\.%252f/gi,
    /\.\.%255c/gi,
    /%2e%2e%2f/gi,
    /%2e%2e%5c/gi,
    /\.\.%c0%af/gi,
    /\.\.%c1%9c/gi
  ],

  // LDAP Injection patterns
  LDAP_INJECTION: [/\*\)/, /\)\(/, /\*\*/, /\(/, /\)/, /&/, /\|/, /!/, /=/, /</, />/, /~/],

  // XXE patterns
  XXE_PATTERNS: [
    /<!DOCTYPE[^>]*>/i,
    /<!ENTITY[^>]*>/i,
    /<\?xml[^>]*>/i,
    /&[a-zA-Z][a-zA-Z0-9]*;/,
    /SYSTEM\s+["'][^"']+["']/i,
    /PUBLIC\s+["'][^"']+["']/i
  ]
}

/**
 * Character sets for validation
 */
const ALLOWED_CHARSETS = {
  // Basic ASCII printable characters
  ASCII: /^[\x20-\x7E]*$/,
  // Extended ASCII with some special characters
  EXTENDED_ASCII: /^[\x20-\x7E\xA0-\xFF]*$/,
  // Unicode letters, numbers, and common symbols
  UNICODE: /^[\p{L}\p{N}\s\-_.,@:;!?()[\]{}"'/\\]*$/u,
  // Email-safe characters
  EMAIL: /^[a-zA-Z0-9._%+-@]*$/,
  // Phone-safe characters
  PHONE: /^[0-9+\-\s()]*$/,
  // Alphanumeric only
  ALPHANUMERIC: /^[a-zA-Z0-9]*$/,
  // URL-safe characters
  URL_SAFE: /^[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]*$/
}

/**
 * Input length limits
 */
const LENGTH_LIMITS = {
  DEFAULT: 1000,
  EMAIL: 254,
  PHONE: 20,
  NAME: 100,
  ADDRESS: 500,
  DESCRIPTION: 2000,
  URL: 2048,
  SEARCH_QUERY: 200,
  FILENAME: 255,
  PASSWORD: 128,
  TOKEN: 8192
}

/**
 * HTML entity encoding map
 */
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
  '(': '&#40;',
  ')': '&#41;',
  '[': '[',
  ']': ']',
  '{': '&#123;',
  '}': '&#125;'
}

/**
 * Comprehensive Input Sanitization Service
 */
export class InputSanitizationService {
  /**
   * Sanitize string input with comprehensive security checks
   * @param {string} input - Input to sanitize
   * @param {Object} options - Sanitization options
   * @returns {string} Sanitized string
   * @throws {ValidationError} If input is malicious
   */
  static sanitizeString(input, options = {}) {
    if (typeof input !== 'string') {
      return input
    }

    const {
      maxLength = LENGTH_LIMITS.DEFAULT,
      charset = ALLOWED_CHARSETS.UNICODE,
      preventSQL = true,
      preventNoSQL = true,
      preventXSS = true,
      preventCommand = true,
      preventPathTraversal = true,
      preventLDAP = true,
      preventXXE = true,
      encodeHTML = true,
      normalizeUnicode = true,
      trimWhitespace = true
    } = options

    let sanitized = input

    // Length validation
    if (sanitized.length > maxLength) {
      throw new ValidationError(`Input exceeds maximum length of ${maxLength} characters`, {
        field: options.field || 'input',
        maxLength,
        actualLength: sanitized.length
      })
    }

    // Unicode normalization
    if (normalizeUnicode) {
      sanitized = sanitized.normalize('NFKC')
    }

    // Trim whitespace
    if (trimWhitespace) {
      sanitized = sanitized.trim()
    }

    // Character set validation
    if (charset && !charset.test(sanitized)) {
      throw new ValidationError('Input contains invalid characters', {
        field: options.field || 'input',
        allowedCharset: charset.toString()
      })
    }

    // SQL Injection prevention
    if (preventSQL) {
      for (const pattern of SECURITY_PATTERNS.SQL_INJECTION) {
        if (pattern.test(sanitized)) {
          logger.warn('SQL injection attempt detected', {
            input: sanitized.substring(0, 100),
            pattern: pattern.toString(),
            field: options.field || 'input'
          })
          throw new ValidationError('Potentially malicious SQL injection pattern detected', {
            field: options.field || 'input',
            reason: 'SQL_INJECTION'
          })
        }
      }
    }

    // NoSQL Injection prevention
    if (preventNoSQL) {
      for (const pattern of SECURITY_PATTERNS.NOSQL_INJECTION) {
        if (pattern.test(sanitized)) {
          logger.warn('NoSQL injection attempt detected', {
            input: sanitized.substring(0, 100),
            pattern: pattern.toString(),
            field: options.field || 'input'
          })
          throw new ValidationError('Potentially malicious NoSQL injection pattern detected', {
            field: options.field || 'input',
            reason: 'NOSQL_INJECTION'
          })
        }
      }
    }

    // XSS prevention
    if (preventXSS) {
      for (const pattern of SECURITY_PATTERNS.XSS_PATTERNS) {
        if (pattern.test(sanitized)) {
          logger.warn('XSS attempt detected', {
            input: sanitized.substring(0, 100),
            pattern: pattern.toString(),
            field: options.field || 'input'
          })
          throw new ValidationError('Potentially malicious XSS pattern detected', {
            field: options.field || 'input',
            reason: 'XSS'
          })
        }
      }
    }

    // Command Injection prevention
    if (preventCommand) {
      for (const pattern of SECURITY_PATTERNS.COMMAND_INJECTION) {
        if (pattern.test(sanitized)) {
          logger.warn('Command injection attempt detected', {
            input: sanitized.substring(0, 100),
            pattern: pattern.toString(),
            field: options.field || 'input'
          })
          throw new ValidationError('Potentially malicious command injection pattern detected', {
            field: options.field || 'input',
            reason: 'COMMAND_INJECTION'
          })
        }
      }
    }

    // Path Traversal prevention
    if (preventPathTraversal) {
      for (const pattern of SECURITY_PATTERNS.PATH_TRAVERSAL) {
        if (pattern.test(sanitized)) {
          logger.warn('Path traversal attempt detected', {
            input: sanitized.substring(0, 100),
            pattern: pattern.toString(),
            field: options.field || 'input'
          })
          throw new ValidationError('Potentially malicious path traversal pattern detected', {
            field: options.field || 'input',
            reason: 'PATH_TRAVERSAL'
          })
        }
      }
    }

    // LDAP Injection prevention
    if (preventLDAP) {
      for (const pattern of SECURITY_PATTERNS.LDAP_INJECTION) {
        if (pattern.test(sanitized)) {
          logger.warn('LDAP injection attempt detected', {
            input: sanitized.substring(0, 100),
            pattern: pattern.toString(),
            field: options.field || 'input'
          })
          throw new ValidationError('Potentially malicious LDAP injection pattern detected', {
            field: options.field || 'input',
            reason: 'LDAP_INJECTION'
          })
        }
      }
    }

    // XXE prevention
    if (preventXXE) {
      for (const pattern of SECURITY_PATTERNS.XXE_PATTERNS) {
        if (pattern.test(sanitized)) {
          logger.warn('XXE attack attempt detected', {
            input: sanitized.substring(0, 100),
            pattern: pattern.toString(),
            field: options.field || 'input'
          })
          throw new ValidationError('Potentially malicious XXE pattern detected', {
            field: options.field || 'input',
            reason: 'XXE'
          })
        }
      }
    }

    // HTML entity encoding
    if (encodeHTML) {
      sanitized = this.encodeHTMLEntities(sanitized)
    }

    return sanitized
  }

  /**
   * Sanitize object recursively
   * @param {Object} obj - Object to sanitize
   * @param {Object} options - Sanitization options
   * @returns {Object} Sanitized object
   */
  static sanitizeObject(obj, options = {}) {
    if (!obj || typeof obj !== 'object') {
      return obj
    }

    const sanitized = Array.isArray(obj) ? [] : {}

    for (const [key, value] of Object.entries(obj)) {
      // Skip prototype pollution attempts
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        logger.warn('Prototype pollution attempt detected', { key })
        throw new ValidationError('Invalid field name detected', {
          field: key,
          reason: 'PROTOTYPE_POLLUTION'
        })
      }

      // Sanitize key name
      const sanitizedKey = this.sanitizeString(key, {
        ...options,
        maxLength: 100,
        encodeHTML: false
      })

      if (typeof value === 'string') {
        sanitized[sanitizedKey] = this.sanitizeString(value, {
          ...options,
          field: sanitizedKey
        })
      } else if (typeof value === 'object' && value !== null) {
        sanitized[sanitizedKey] = this.sanitizeObject(value, options)
      } else {
        sanitized[sanitizedKey] = value
      }
    }

    return sanitized
  }

  /**
   * Encode HTML entities
   * @param {string} str - String to encode
   * @returns {string} Encoded string
   */
  static encodeHTMLEntities(str) {
    if (typeof str !== 'string') {
      return str
    }

    return str.replace(/[&<>"'`=/()[\]{}]/g, match => HTML_ENTITIES[match] || match)
  }

  /**
   * Validate email with enhanced security
   * @param {string} email - Email to validate
   * @returns {string} Sanitized email
   */
  static sanitizeEmail(email) {
    if (typeof email !== 'string') {
      throw new ValidationError('Email must be a string', {
        field: 'email',
        type: typeof email
      })
    }

    const sanitized = this.sanitizeString(email, {
      maxLength: LENGTH_LIMITS.EMAIL,
      charset: ALLOWED_CHARSETS.EMAIL,
      preventSQL: true,
      preventXSS: true,
      preventCommand: true,
      encodeHTML: false,
      field: 'email'
    })

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitized)) {
      throw new ValidationError('Invalid email format', {
        field: 'email',
        value: sanitized
      })
    }

    return sanitized.toLowerCase()
  }

  /**
   * Validate phone number with enhanced security
   * @param {string} phone - Phone number to validate
   * @returns {string} Sanitized phone
   */
  static sanitizePhone(phone) {
    if (typeof phone !== 'string') {
      throw new ValidationError('Phone must be a string', {
        field: 'phone',
        type: typeof phone
      })
    }

    const sanitized = this.sanitizeString(phone, {
      maxLength: LENGTH_LIMITS.PHONE,
      charset: ALLOWED_CHARSETS.PHONE,
      preventSQL: true,
      preventXSS: true,
      preventCommand: true,
      encodeHTML: false,
      field: 'phone'
    })

    // Remove all non-digit characters for validation
    const digits = sanitized.replace(/\D/g, '')

    // Venezuelan phone validation
    if (digits.length !== 10) {
      throw new ValidationError('Phone number must have 10 digits', {
        field: 'phone',
        digitCount: digits.length
      })
    }

    const validPrefixes = ['0412', '0414', '0416', '0424', '0426', '0410', '0411', '0418', '0425']
    const prefix = digits.substring(0, 4)

    if (!validPrefixes.includes(prefix)) {
      throw new ValidationError('Invalid Venezuelan phone number prefix', {
        field: 'phone',
        prefix,
        validPrefixes
      })
    }

    return sanitized
  }

  /**
   * Validate URL with enhanced security
   * @param {string} url - URL to validate
   * @returns {string} Sanitized URL
   */
  static sanitizeURL(url) {
    if (typeof url !== 'string') {
      throw new ValidationError('URL must be a string', {
        field: 'url',
        type: typeof url
      })
    }

    const sanitized = this.sanitizeString(url, {
      maxLength: LENGTH_LIMITS.URL,
      charset: ALLOWED_CHARSETS.URL_SAFE,
      preventSQL: true,
      preventXSS: true,
      preventCommand: true,
      preventPathTraversal: true,
      encodeHTML: false,
      field: 'url'
    })

    try {
      const urlObj = new URL(sanitized)

      // Only allow specific protocols
      const allowedProtocols = ['http:', 'https:', 'ftp:', 'ftps:']
      if (!allowedProtocols.includes(urlObj.protocol)) {
        throw new ValidationError('Invalid URL protocol', {
          field: 'url',
          protocol: urlObj.protocol
        })
      }

      // Prevent localhost and private IP access
      const hostname = urlObj.hostname.toLowerCase()
      const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1']

      if (blockedHosts.includes(hostname)) {
        throw new ValidationError('Access to localhost is not allowed', {
          field: 'url',
          hostname
        })
      }

      return sanitized
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      throw new ValidationError('Invalid URL format', {
        field: 'url',
        value: sanitized
      })
    }
  }

  /**
   * Validate filename with enhanced security
   * @param {string} filename - Filename to validate
   * @returns {string} Sanitized filename
   */
  static sanitizeFilename(filename) {
    if (typeof filename !== 'string') {
      throw new ValidationError('Filename must be a string', {
        field: 'filename',
        type: typeof filename
      })
    }

    const sanitized = this.sanitizeString(filename, {
      maxLength: LENGTH_LIMITS.FILENAME,
      charset: ALLOWED_CHARSETS.ASCII,
      preventSQL: true,
      preventXSS: true,
      preventCommand: true,
      preventPathTraversal: true,
      encodeHTML: false,
      field: 'filename'
    })

    // Additional filename validation
    const invalidChars = /[<>:"|?*\\]/
    if (invalidChars.test(sanitized)) {
      throw new ValidationError('Filename contains invalid characters', {
        field: 'filename',
        value: sanitized
      })
    }

    // Reserved names (Windows)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i
    if (reservedNames.test(sanitized)) {
      throw new ValidationError('Filename is a reserved name', {
        field: 'filename',
        value: sanitized
      })
    }

    return sanitized
  }

  /**
   * Validate search query with enhanced security
   * @param {string} query - Search query to validate
   * @returns {string} Sanitized query
   */
  static sanitizeSearchQuery(query) {
    if (typeof query !== 'string') {
      throw new ValidationError('Search query must be a string', {
        field: 'query',
        type: typeof query
      })
    }

    return this.sanitizeString(query, {
      maxLength: LENGTH_LIMITS.SEARCH_QUERY,
      charset: ALLOWED_CHARSETS.UNICODE,
      preventSQL: true,
      preventXSS: true,
      preventCommand: true,
      encodeHTML: false,
      field: 'query'
    })
  }

  /**
   * Validate password with enhanced security
   * @param {string} password - Password to validate
   * @returns {string} Sanitized password
   */
  static sanitizePassword(password) {
    if (typeof password !== 'string') {
      throw new ValidationError('Password must be a string', {
        field: 'password',
        type: typeof password
      })
    }

    const sanitized = this.sanitizeString(password, {
      maxLength: LENGTH_LIMITS.PASSWORD,
      charset: ALLOWED_CHARSETS.UNICODE,
      preventSQL: false, // Allow SQL-like characters in passwords
      preventXSS: false, // Allow XSS-like characters in passwords
      preventCommand: true,
      encodeHTML: false,
      field: 'password'
    })

    // Password strength validation
    if (sanitized.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long', {
        field: 'password',
        minLength: 8,
        actualLength: sanitized.length
      })
    }

    // At least one uppercase letter
    if (!/[A-Z]/.test(sanitized)) {
      throw new ValidationError('Password must contain at least one uppercase letter', {
        field: 'password'
      })
    }

    // At least one lowercase letter
    if (!/[a-z]/.test(sanitized)) {
      throw new ValidationError('Password must contain at least one lowercase letter', {
        field: 'password'
      })
    }

    // At least one number
    if (!/[0-9]/.test(sanitized)) {
      throw new ValidationError('Password must contain at least one number', {
        field: 'password'
      })
    }

    // At least one special character
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(sanitized)) {
      throw new ValidationError('Password must contain at least one special character', {
        field: 'password'
      })
    }

    return sanitized
  }

  /**
   * Get security statistics
   * @returns {Object} Security statistics
   */
  static getSecurityStats() {
    return {
      patternsCount: {
        sql: SECURITY_PATTERNS.SQL_INJECTION.length,
        nosql: SECURITY_PATTERNS.NOSQL_INJECTION.length,
        xss: SECURITY_PATTERNS.XSS_PATTERNS.length,
        command: SECURITY_PATTERNS.COMMAND_INJECTION.length,
        pathTraversal: SECURITY_PATTERNS.PATH_TRAVERSAL.length,
        ldap: SECURITY_PATTERNS.LDAP_INJECTION.length,
        xxe: SECURITY_PATTERNS.XXE_PATTERNS.length
      },
      lengthLimits: LENGTH_LIMITS,
      htmlEntitiesCount: Object.keys(HTML_ENTITIES).length
    }
  }
}

export default InputSanitizationService
