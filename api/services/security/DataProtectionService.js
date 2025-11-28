/**
 * Data Protection and Encryption Service
 * Enterprise-grade data protection with encryption and masking
 *
 * Features:
 * - AES-256 encryption for sensitive data
 * - Data masking for logs and responses
 * - Secure data disposal
 * - PII detection and protection
 * - GDPR compliance helpers
 * - Data retention policies
 * - Audit trail for data access
 * - Key management
 * - Secure random generation
 * - Hashing with salt
 */

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual
} from 'crypto'
import { existsSync, unlinkSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import { SecurityError, ConfigurationError } from '../../errors/AppError.js'
import { logger } from '../../utils/logger.js'
// import config from '../../config/configLoader.js'

/**
 * Encryption configuration
 */
const ENCRYPTION_CONFIG = {
  ALGORITHM: 'aes-256-gcm',
  KEY_LENGTH: 32, // 256 bits
  IV_LENGTH: 16, // 128 bits
  TAG_LENGTH: 16, // 128 bits
  SALT_LENGTH: 32, // 256 bits
  SCRYPT_PARAMS: {
    N: 32768, // CPU/memory cost
    r: 8, // Block size
    p: 1 // Parallelization
  }
}

/**
 * Data masking patterns
 */
const MASKING_PATTERNS = {
  EMAIL: {
    pattern: /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    mask: (match, username, domain) => {
      const visibleChars = Math.min(2, username.length)
      const masked =
        username.substring(0, visibleChars) + '*'.repeat(username.length - visibleChars)
      return `${masked}@${domain}`
    }
  },
  PHONE: {
    pattern: /(\d{3})(\d{3})(\d{4})/g,
    mask: (match, area, prefix, line) => `${area}-***-${line}`
  },
  CREDIT_CARD: {
    pattern: /(\d{4})(\d{4,8})(\d{4})/g,
    mask: (match, first, middle, last) => `${first}-****-****-${last}`
  },
  SSN: {
    pattern: /(\d{3})(\d{2})(\d{4})/g,
    mask: (match, area, group, serial) => `${area}-**-${serial}`
  },
  PASSWORD: {
    pattern: /.*/g,
    mask: () => '******'
  },
  API_KEY: {
    pattern: /(.{8})(.+)(.{8})/g,
    mask: (match, start, middle, end) => `${start}${'*'.repeat(middle.length)}${end}`
  }
}

/**
 * PII detection patterns
 */
const PII_PATTERNS = {
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  PHONE: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
  CREDIT_CARD: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  IP_ADDRESS: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  URL: /https?:\/\/[^\s]+/g,
  PASSPORT: /\b[A-Z]{2}\d{7,8}\b/g,
  DRIVING_LICENSE: /\b[A-Z]{1,2}\d{6,8}\b/g
}

/**
 * Data retention policies (in days)
 */
const RETENTION_POLICIES = {
  USER_DATA: 2555, // 7 years
  ORDER_DATA: 1825, // 5 years
  PAYMENT_DATA: 1095, // 3 years
  AUDIT_LOGS: 2555, // 7 years
  SESSION_DATA: 30, // 30 days
  TEMPORARY_DATA: 7, // 7 days
  ERROR_LOGS: 90 // 90 days
}

/**
 * Data Protection Service
 */
export class DataProtectionService {
  constructor() {
    this.encryptionKey = this.getOrCreateEncryptionKey()
    this.dataAccessLog = new Map()
    this.piiCache = new Map()
  }

  /**
   * Encrypt sensitive data
   * @param {string} data - Data to encrypt
   * @param {string} additionalData - Additional authenticated data
   * @returns {Object} Encrypted data with metadata
   */
  encrypt(data, additionalData = '') {
    try {
      if (typeof data !== 'string') {
        data = JSON.stringify(data)
      }

      // Generate random IV and salt
      const iv = randomBytes(ENCRYPTION_CONFIG.IV_LENGTH)
      const salt = randomBytes(ENCRYPTION_CONFIG.SALT_LENGTH)

      // Derive key using scrypt
      const key = scryptSync(
        this.encryptionKey,
        salt,
        ENCRYPTION_CONFIG.KEY_LENGTH,
        ENCRYPTION_CONFIG.SCRYPT_PARAMS
      )

      // Create cipher
      const cipher = createCipheriv(ENCRYPTION_CONFIG.ALGORITHM, key, iv)

      // Encrypt data
      let encrypted = cipher.update(data, 'utf8', 'hex')
      encrypted += cipher.final('hex')

      // Get authentication tag
      const tag = cipher.getAuthTag()

      const result = {
        encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        tag: tag.toString('hex'),
        algorithm: ENCRYPTION_CONFIG.ALGORITHM,
        timestamp: new Date().toISOString()
      }

      // Log encryption event
      this.logDataAccess('ENCRYPT', {
        dataSize: data.length,
        algorithm: ENCRYPTION_CONFIG.ALGORITHM,
        timestamp: result.timestamp
      })

      return result
    } catch (error) {
      logger.error('Encryption failed', { error: error.message })
      throw new SecurityError('Data encryption failed', {
        error: error.message
      })
    }
  }

  /**
   * Decrypt sensitive data
   * @param {Object} encryptedData - Encrypted data object
   * @param {string} additionalData - Additional authenticated data
   * @returns {string} Decrypted data
   */
  decrypt(encryptedData, additionalData = '') {
    try {
      const { encrypted, iv, salt, tag, algorithm } = encryptedData

      // Validate algorithm
      if (algorithm !== ENCRYPTION_CONFIG.ALGORITHM) {
        throw new SecurityError('Unsupported encryption algorithm', {
          algorithm,
          supported: ENCRYPTION_CONFIG.ALGORITHM
        })
      }

      // Convert hex strings to buffers
      const ivBuffer = Buffer.from(iv, 'hex')
      const saltBuffer = Buffer.from(salt, 'hex')
      const tagBuffer = Buffer.from(tag, 'hex')

      // Derive key using scrypt
      const key = scryptSync(
        this.encryptionKey,
        saltBuffer,
        ENCRYPTION_CONFIG.KEY_LENGTH,
        ENCRYPTION_CONFIG.SCRYPT_PARAMS
      )

      // Create decipher
      const decipher = createDecipheriv(ENCRYPTION_CONFIG.ALGORITHM, key, ivBuffer)
      decipher.setAuthTag(tagBuffer)

      // Decrypt data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      // Log decryption event
      this.logDataAccess('DECRYPT', {
        dataSize: decrypted.length,
        algorithm,
        timestamp: new Date().toISOString()
      })

      return decrypted
    } catch (error) {
      logger.error('Decryption failed', { error: error.message })
      throw new SecurityError('Data decryption failed', {
        error: error.message
      })
    }
  }

  /**
   * Hash data with salt
   * @param {string} data - Data to hash
   * @param {Buffer} salt - Salt (optional, will generate if not provided)
   * @returns {Object} Hash with salt
   */
  hashWithSalt(data, salt = null) {
    try {
      if (!salt) {
        salt = randomBytes(ENCRYPTION_CONFIG.SALT_LENGTH)
      }

      const hash = createHash('sha256').update(salt).update(data).digest('hex')

      return {
        hash,
        salt: salt.toString('hex'),
        algorithm: 'sha256'
      }
    } catch (error) {
      logger.error('Hashing failed', { error: error.message })
      throw new SecurityError('Data hashing failed', {
        error: error.message
      })
    }
  }

  /**
   * Verify hash against data
   * @param {string} data - Original data
   * @param {Object} hashData - Hash object with salt
   * @returns {boolean} Is valid
   */
  verifyHash(data, hashData) {
    try {
      const { hash, salt, algorithm } = hashData

      if (algorithm !== 'sha256') {
        throw new SecurityError('Unsupported hash algorithm', {
          algorithm,
          supported: 'sha256'
        })
      }

      const saltBuffer = Buffer.from(salt, 'hex')
      const computedHash = this.hashWithSalt(data, saltBuffer)

      return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash.hash, 'hex'))
    } catch (error) {
      logger.error('Hash verification failed', { error: error.message })
      return false
    }
  }

  /**
   * Mask sensitive data in text
   * @param {string} text - Text to mask
   * @param {Array} types - Types of data to mask
   * @returns {string} Masked text
   */
  maskSensitiveData(text, types = ['EMAIL', 'PHONE', 'CREDIT_CARD', 'SSN']) {
    if (typeof text !== 'string') {
      return text
    }

    let maskedText = text

    for (const type of types) {
      const pattern = MASKING_PATTERNS[type]
      if (pattern) {
        maskedText = maskedText.replace(pattern.pattern, pattern.mask)
      }
    }

    return maskedText
  }

  /**
   * Detect PII in text
   * @param {string} text - Text to analyze
   * @returns {Object} PII detection results
   */
  detectPII(text) {
    if (typeof text !== 'string') {
      return { detected: [], count: 0 }
    }

    const detected = []
    let count = 0

    for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
      const matches = text.match(pattern)
      if (matches) {
        detected.push({
          type,
          count: matches.length,
          samples: matches.slice(0, 3) // Keep first 3 samples
        })
        count += matches.length
      }
    }

    return {
      detected,
      count,
      hasPII: count > 0
    }
  }

  /**
   * Sanitize data for logging (mask sensitive info)
   * @param {any} data - Data to sanitize
   * @returns {any} Sanitized data
   */
  sanitizeForLogging(data) {
    if (typeof data === 'string') {
      return this.maskSensitiveData(data)
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeForLogging(item))
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized = {}
      for (const [key, value] of Object.entries(data)) {
        // Check for sensitive keys
        const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'creditCard', 'ssn']
        const isSensitiveKey = sensitiveKeys.some(sensitiveKey =>
          key.toLowerCase().includes(sensitiveKey)
        )

        if (isSensitiveKey) {
          sanitized[key] = '******'
        } else if (typeof value === 'string') {
          sanitized[key] = this.maskSensitiveData(value)
        } else {
          sanitized[key] = this.sanitizeForLogging(value)
        }
      }
      return sanitized
    }

    return data
  }

  /**
   * Generate secure random string
   * @param {number} length - Length of string
   * @param {string} charset - Character set to use
   * @returns {string} Random string
   */
  generateSecureRandom(length = 32, charset = 'hex') {
    const charsets = {
      hex: '0123456789abcdef',
      alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      numeric: '0123456789',
      readable: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    }

    const selectedCharset = charsets[charset] || charsets.hex
    const randomBytes = require('crypto').randomBytes(length)
    let result = ''

    for (let i = 0; i < length; i++) {
      result += selectedCharset[randomBytes[i] % selectedCharset.length]
    }

    return result
  }

  /**
   * Generate API key
   * @param {string} prefix - Key prefix
   * @returns {string} API key
   */
  generateAPIKey(prefix = 'fk') {
    const timestamp = Date.now().toString(36)
    const random = this.generateSecureRandom(24, 'alphanumeric')
    return `${prefix}_${timestamp}_${random}`
  }

  /**
   * Generate session token
   * @returns {string} Session token
   */
  generateSessionToken() {
    const timestamp = Date.now().toString(36)
    const random = this.generateSecureRandom(32, 'alphanumeric')
    const hmac = createHmac('sha256', this.encryptionKey)
      .update(`${timestamp}.${random}`)
      .digest('hex')

    return `${timestamp}.${random}.${hmac.substring(0, 16)}`
  }

  /**
   * Validate session token
   * @param {string} token - Session token
   * @returns {boolean} Is valid
   */
  validateSessionToken(token) {
    try {
      const [timestamp, random, hmac] = token.split('.')

      if (!timestamp || !random || !hmac) {
        return false
      }

      // Check token age (max 24 hours)
      const tokenAge = Date.now() - parseInt(timestamp, 36)
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return false
      }

      // Verify HMAC
      const expectedHmac = createHmac('sha256', this.encryptionKey)
        .update(`${timestamp}.${random}`)
        .digest('hex')

      return timingSafeEqual(
        Buffer.from(hmac, 'utf8'),
        Buffer.from(expectedHmac.substring(0, 16), 'utf8')
      )
    } catch (error) {
      logger.error('Session token validation failed', { error: error.message })
      return false
    }
  }

  /**
   * Securely dispose of data
   * @param {string} filePath - Path to file to dispose
   * @param {number} passes - Number of overwrite passes
   */
  secureDispose(filePath, passes = 3) {
    try {
      if (!existsSync(filePath)) {
        return
      }

      // Get file size
      const stats = require('fs').statSync(filePath)
      const fileSize = stats.size

      // Overwrite file multiple times
      for (let pass = 0; pass < passes; pass++) {
        const pattern = pass % 2 === 0 ? 0x00 : 0xff
        const buffer = Buffer.alloc(fileSize, pattern)
        writeFileSync(filePath, buffer)
      }

      // Delete file
      unlinkSync(filePath)

      // Log disposal event
      this.logDataAccess('SECURE_DISPOSE', {
        filePath,
        passes,
        fileSize,
        timestamp: new Date().toISOString()
      })

      logger.info('File securely disposed', {
        filePath,
        passes,
        fileSize
      })
    } catch (error) {
      logger.error('Secure disposal failed', {
        filePath,
        error: error.message
      })
      throw new SecurityError('Secure data disposal failed', {
        filePath,
        error: error.message
      })
    }
  }

  /**
   * Check data retention policy
   * @param {string} dataType - Type of data
   * @param {Date} createdAt - Creation date
   * @returns {Object} Retention status
   */
  checkRetentionPolicy(dataType, createdAt) {
    const retentionDays = RETENTION_POLICIES[dataType.toUpperCase()]
    if (!retentionDays) {
      return { shouldDelete: false, reason: 'NO_POLICY' }
    }

    const now = new Date()
    const retentionDate = new Date(createdAt.getTime() + retentionDays * 24 * 60 * 60 * 1000)
    const shouldDelete = now > retentionDate

    return {
      shouldDelete,
      retentionDate,
      daysUntilDeletion: Math.ceil((retentionDate - now) / (24 * 60 * 60 * 1000)),
      retentionDays
    }
  }

  /**
   * Get or create encryption key
   * @returns {string} Encryption key
   */
  getOrCreateEncryptionKey() {
    try {
      // Try to get key from environment
      const envKey = process.env.ENCRYPTION_KEY
      if (envKey) {
        return envKey
      }

      // Try to get key from file
      const keyFile = join(process.cwd(), '.encryption-key')
      if (existsSync(keyFile)) {
        const key = readFileSync(keyFile, 'utf8').trim()
        if (key.length >= 32) {
          return key
        }
      }

      // Generate new key
      const newKey = randomBytes(32).toString('hex')
      writeFileSync(keyFile, newKey, { mode: 0o600 }) // Only owner can read/write

      logger.warn('Generated new encryption key', {
        keyFile,
        keyLength: newKey.length
      })

      return newKey
    } catch (error) {
      logger.error('Failed to get or create encryption key', { error: error.message })
      throw new ConfigurationError('Encryption key configuration failed', {
        error: error.message
      })
    }
  }

  /**
   * Log data access events
   * @param {string} action - Action type
   * @param {Object} metadata - Event metadata
   */
  logDataAccess(action, metadata) {
    const event = {
      action,
      timestamp: new Date().toISOString(),
      ...metadata
    }

    const key = `access:${action}`
    if (!this.dataAccessLog.has(key)) {
      this.dataAccessLog.set(key, [])
    }

    const events = this.dataAccessLog.get(key)
    events.push(event)

    // Keep only last 1000 events per action type
    if (events.length > 1000) {
      events.splice(0, events.length - 1000)
    }

    // Log to main logger
    logger.logSecurity(`data_access_${action.toLowerCase()}`, 'low', event)
  }

  /**
   * Get data protection statistics
   * @returns {Object} Statistics
   */
  getDataProtectionStats() {
    const totalEvents = Array.from(this.dataAccessLog.values()).reduce(
      (total, events) => total + events.length,
      0
    )

    return {
      encryptionConfig: ENCRYPTION_CONFIG,
      retentionPolicies: RETENTION_POLICIES,
      piiPatterns: Object.keys(PII_PATTERNS),
      maskingPatterns: Object.keys(MASKING_PATTERNS),
      totalAccessEvents: totalEvents,
      accessEventTypes: Array.from(this.dataAccessLog.keys())
    }
  }

  /**
   * Clean up old data access logs
   */
  cleanup() {
    const now = Date.now()
    const cutoffTime = now - 24 * 60 * 60 * 1000 // 24 hours

    for (const [key, events] of this.dataAccessLog.entries()) {
      const recentEvents = events.filter(event => {
        const eventTime = new Date(event.timestamp).getTime()
        return eventTime > cutoffTime
      })

      if (recentEvents.length === 0) {
        this.dataAccessLog.delete(key)
      } else {
        this.dataAccessLog.set(key, recentEvents)
      }
    }
  }
}

// Global instance
const dataProtectionService = new DataProtectionService()

// Clean up old logs every hour
setInterval(
  () => {
    dataProtectionService.cleanup()
  },
  60 * 60 * 1000
)

export default dataProtectionService
export { ENCRYPTION_CONFIG, RETENTION_POLICIES }
