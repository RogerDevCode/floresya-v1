/**
 * Enhanced Security Middleware
 * Integrates all security services into comprehensive middleware
 *
 * Features:
 * - Input sanitization with InputSanitizationService
 * - File upload scanning with MalwareScanningService
 * - Advanced rate limiting
 * - Request size limiting
 * - IP reputation checking
 * - Bot detection
 * - Request anomaly detection
 * - Security headers enhancement
 * - CSP with nonce support
 * - HSTS with preload
 * - Feature policy
 */

import {
  RateLimitExceededError,
  SecurityError,
  PayloadTooLargeError
} from '../../errors/AppError.js'
import { logger } from '../../utils/logger.js'
import { InputSanitizationService } from '../../services/security/InputSanitizationService.js'
import { MalwareScanningService } from '../../services/security/MalwareScanningService.js'
import config from '../../config/configLoader.js'

/**
 * Suspicious IP patterns
 */
const SUSPICIOUS_IP_PATTERNS = [
  // Tor exit nodes (simplified pattern)
  /^185\.220\.101/,
  /^185\.220\.102/,
  /^185\.220\.103/,
  // Known malicious ranges (simplified)
  /^192\.168\.1\.100/, // Example malicious internal IP
  /^10\.0\.0\.100/ // Example malicious internal IP
]

/**
 * Bot detection patterns
 */
const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python/i,
  /java/i,
  /go-http/i,
  /httpie/i,
  /postman/i,
  /insomnia/i
]

/**
 * Request anomaly detection thresholds
 */
const ANOMALY_THRESHOLDS = {
  MAX_HEADER_COUNT: 50,
  MAX_HEADER_LENGTH: 8192,
  MAX_URL_LENGTH: 2048,
  MAX_QUERY_PARAMS: 20,
  MAX_BODY_SIZE: '10mb',
  SUSPICIOUS_HEADER_PATTERNS: [
    /x-forwarded-for/i,
    /x-real-ip/i,
    /x-originating-ip/i,
    /x-cluster-client-ip/i
  ]
}

/**
 * Enhanced security middleware class
 */
export class EnhancedSecurityMiddleware {
  /**
   * Rate limiting with IP reputation
   * @param {Object} options - Rate limiting options
   * @returns {Function} Middleware function
   */
  static advancedRateLimit(options = {}) {
    const {
      windowMs = 15 * 60 * 1000, // 15 minutes
      maxRequests = 100,
      skipSuccessfulRequests = false,
      skipFailedRequests = false,
      keyGenerator = req => req.ip
      // onLimitReached callback is handled directly in options
    } = options

    const requests = new Map()

    return (req, res, next) => {
      try {
        // IP reputation check
        if (this.isSuspiciousIP(req.ip)) {
          logger.warn('Suspicious IP detected', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path
          })

          return next(
            new SecurityError('Access denied from suspicious IP', {
              ip: req.ip,
              reason: 'SUSPICIOUS_IP'
            })
          )
        }

        // Bot detection
        const userAgent = req.get('User-Agent') || ''
        const isBot = BOT_PATTERNS.some(pattern => pattern.test(userAgent))

        if (isBot) {
          logger.info('Bot detected', {
            ip: req.ip,
            userAgent: userAgent.substring(0, 200),
            path: req.path
          })

          // Apply stricter limits for bots
          const botMaxRequests = Math.floor(maxRequests * 0.3)
          return this.checkRateLimit(req, res, next, {
            windowMs,
            maxRequests: botMaxRequests,
            keyGenerator,
            requests,
            isBot: true
          })
        }

        // Normal rate limiting
        return this.checkRateLimit(req, res, next, {
          windowMs,
          maxRequests,
          skipSuccessfulRequests,
          skipFailedRequests,
          keyGenerator,
          requests
        })
      } catch (error) {
        logger.error('Rate limiting error', { error: error.message })
        next() // Don't block on rate limiting errors
      }
    }
  }

  /**
   * Check rate limit for request
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next function
   * @param {Object} options - Rate limiting options
   */
  static checkRateLimit(req, res, next, options) {
    const {
      windowMs,
      maxRequests,
      skipSuccessfulRequests,
      skipFailedRequests,
      keyGenerator,
      requests,
      isBot = false
    } = options

    const key = keyGenerator(req)
    const now = Date.now()
    const windowStart = now - windowMs

    // Get or create request record
    if (!requests.has(key)) {
      requests.set(key, {
        count: 0,
        resetTime: now + windowMs,
        requests: []
      })
    }

    const record = requests.get(key)

    // Clean old requests
    record.requests = record.requests.filter(timestamp => timestamp > windowStart)

    // Check if limit exceeded
    if (record.requests.length >= maxRequests) {
      const resetIn = Math.ceil((record.resetTime - now) / 1000)

      // Log rate limit exceeded
      logger.warn('Rate limit exceeded', {
        key,
        count: record.requests.length,
        limit: maxRequests,
        windowMs,
        isBot,
        ip: req.ip,
        path: req.path
      })

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
        'X-RateLimit-Retry-After': resetIn,
        'X-RateLimit-IsBot': isBot
      })

      // Call custom handler if provided
      if (options.onLimitReached) {
        return options.onLimitReached(req, res)
      }

      return next(
        new RateLimitExceededError(`Rate limit exceeded. Try again in ${resetIn} seconds.`, {
          limit: maxRequests,
          windowMs,
          resetIn,
          isBot
        })
      )
    }

    // Add current request
    record.requests.push(now)
    record.count++

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': Math.max(0, maxRequests - record.requests.length),
      'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
      'X-RateLimit-IsBot': isBot
    })

    // Track response for skip options
    if (skipSuccessfulRequests || skipFailedRequests) {
      res.on('finish', () => {
        const shouldSkip =
          (skipSuccessfulRequests && res.statusCode < 400) ||
          (skipFailedRequests && res.statusCode >= 400)

        if (shouldSkip) {
          record.requests.pop() // Remove this request from count
          record.count--
        }
      })
    }

    next()
  }

  /**
   * Request size limiting with enhanced validation
   * @param {string|number} maxSize - Maximum size (e.g., '10mb', 10485760)
   * @returns {Function} Middleware function
   */
  static requestSizeLimit(maxSize = ANOMALY_THRESHOLDS.MAX_BODY_SIZE) {
    const maxBytes = typeof maxSize === 'string' ? this.parseSize(maxSize) : maxSize

    return (req, res, next) => {
      try {
        // Check Content-Length header
        const contentLength = parseInt(req.headers['content-length'] || '0')

        if (contentLength > maxBytes) {
          logger.warn('Request size limit exceeded', {
            ip: req.ip,
            contentLength,
            maxBytes,
            path: req.path
          })

          return next(
            new PayloadTooLargeError(
              `Request size ${contentLength} exceeds maximum ${maxBytes} bytes`,
              {
                contentLength,
                maxBytes,
                maxSize
              }
            )
          )
        }

        // Check URL length
        if (req.originalUrl && req.originalUrl.length > ANOMALY_THRESHOLDS.MAX_URL_LENGTH) {
          logger.warn('URL length anomaly detected', {
            ip: req.ip,
            urlLength: req.originalUrl.length,
            path: req.path
          })
        }

        // Check query parameter count
        const queryParamCount = Object.keys(req.query || {}).length
        if (queryParamCount > ANOMALY_THRESHOLDS.MAX_QUERY_PARAMS) {
          logger.warn('Query parameter anomaly detected', {
            ip: req.ip,
            queryParamCount,
            path: req.path
          })
        }

        // Check header count and size
        const headerCount = Object.keys(req.headers || {}).length
        if (headerCount > ANOMALY_THRESHOLDS.MAX_HEADER_COUNT) {
          logger.warn('Header count anomaly detected', {
            ip: req.ip,
            headerCount,
            path: req.path
          })
        }

        // Check for suspicious headers
        const suspiciousHeaders = Object.keys(req.headers).filter(header =>
          ANOMALY_THRESHOLDS.SUSPICIOUS_HEADER_PATTERNS.some(pattern => pattern.test(header))
        )

        if (suspiciousHeaders.length > 0) {
          logger.warn('Suspicious headers detected', {
            ip: req.ip,
            suspiciousHeaders,
            path: req.path
          })
        }

        next()
      } catch (error) {
        logger.error('Request size limiting error', { error: error.message })
        next()
      }
    }
  }

  /**
   * Comprehensive input sanitization middleware
   * @param {Object} options - Sanitization options
   * @returns {Function} Middleware function
   */
  static inputSanitization(options = {}) {
    const {
      sanitizeBody = true,
      sanitizeQuery = true,
      sanitizeParams = true,
      strictMode = true
    } = options

    return (req, res, next) => {
      try {
        if (sanitizeBody && req.body) {
          const sanitizedBody = InputSanitizationService.sanitizeObject(req.body, {
            ...options,
            field: 'body'
          })
          // Try to assign, if fails (getter-only), modify in place
          try {
            req.body = sanitizedBody
          } catch {
            Object.keys(req.body).forEach(key => delete req.body[key])
            Object.assign(req.body, sanitizedBody)
          }
        }

        if (sanitizeQuery && req.query) {
          const sanitizedQuery = InputSanitizationService.sanitizeObject(req.query, {
            ...options,
            field: 'query'
          })
          try {
            req.query = sanitizedQuery
          } catch {
            Object.keys(req.query).forEach(key => delete req.query[key])
            Object.assign(req.query, sanitizedQuery)
          }
        }

        if (sanitizeParams && req.params) {
          const sanitizedParams = InputSanitizationService.sanitizeObject(req.params, {
            ...options,
            field: 'params'
          })
          try {
            req.params = sanitizedParams
          } catch {
            Object.keys(req.params).forEach(key => delete req.params[key])
            Object.assign(req.params, sanitizedParams)
          }
        }

        next()
      } catch (error) {
        logger.warn('Input sanitization failed', {
          ip: req.ip,
          path: req.path,
          error: error.message
        })

        if (strictMode) {
          return next(error)
        }

        // In non-strict mode, log but continue
        next()
      }
    }
  }

  /**
   * File upload security middleware
   * @param {Object} options - File scanning options
   * @returns {Function} Middleware function
   */
  static fileUploadSecurity(options = {}) {
    const {
      maxFiles = 5,
      maxFileSize = config.upload.maxSize,
      allowedTypes = config.upload.allowedTypes,
      scanForMalware = true,
      quarantineSuspicious = true
    } = options

    return async (req, res, next) => {
      try {
        if (!req.files && !req.file) {
          return next() // No files to process
        }

        const files = req.files ? (Array.isArray(req.files) ? req.files : [req.files]) : [req.file]

        // Check file count
        if (files.length > maxFiles) {
          return next(
            new SecurityError(`Too many files. Maximum ${maxFiles} allowed`, {
              fileCount: files.length,
              maxFiles
            })
          )
        }

        // Scan each file
        const scanResults = []
        for (const file of files) {
          if (!file) {
            continue
          }

          // Check file size
          if (file.size > maxFileSize) {
            return next(
              new SecurityError(`File too large. Maximum ${maxFileSize} bytes`, {
                filename: file.originalname,
                size: file.size,
                maxFileSize
              })
            )
          }

          // Check MIME type
          if (!allowedTypes.includes(file.mimetype)) {
            return next(
              new SecurityError(`File type not allowed: ${file.mimetype}`, {
                filename: file.originalname,
                mimetype: file.mimetype,
                allowedTypes
              })
            )
          }

          // Scan for malware
          if (scanForMalware) {
            const scanResult = await MalwareScanningService.scanFile(file, {
              strictMode: true,
              quarantineSuspicious
            })

            scanResults.push(scanResult)

            if (!scanResult.isClean) {
              return next(
                new SecurityError('File contains malicious content', {
                  filename: file.originalname,
                  threats: scanResult.threats,
                  quarantined: scanResult.quarantined
                })
              )
            }
          }
        }

        // Attach scan results to request
        req.fileScanResults = scanResults

        next()
      } catch (error) {
        logger.error('File upload security error', {
          ip: req.ip,
          path: req.path,
          error: error.message
        })
        next(error)
      }
    }
  }

  /**
   * Enhanced security headers middleware
   * @param {Object} options - Header options
   * @returns {Function} Middleware function
   */
  static enhancedSecurityHeaders(options = {}) {
    const {
      enableCSP = true,
      enableHSTS = config.IS_PRODUCTION,
      enableFeaturePolicy = true,
      customHeaders = {}
    } = options

    return (req, res, next) => {
      try {
        // Basic security headers
        res.setHeader('X-Frame-Options', 'DENY')
        res.setHeader('X-Content-Type-Options', 'nosniff')
        res.setHeader('X-XSS-Protection', '1; mode=block')
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

        // HSTS (HTTPS Strict Transport Security)
        if (enableHSTS && (req.secure || req.headers['x-forwarded-proto'] === 'https')) {
          res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
        }

        // Content Security Policy with nonce
        if (enableCSP) {
          const nonce = this.generateNonce()
          req.cspNonce = nonce

          const cspDirectives = [
            "default-src 'self'",
            "script-src 'self' 'nonce-" + nonce + "'",
            "style-src 'self' 'nonce-" + nonce + "' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://*.supabase.co",
            "object-src 'none'",
            "media-src 'self'",
            "frame-src 'none'",
            "child-src 'none'",
            "worker-src 'none'",
            "manifest-src 'self'",
            'upgrade-insecure-requests'
          ]

          res.setHeader('Content-Security-Policy', cspDirectives.join('; '))
        }

        // Feature Policy
        if (enableFeaturePolicy) {
          const featurePolicy = [
            'geolocation=()',
            'microphone=()',
            'camera=()',
            'payment=()',
            'usb=()',
            'magnetometer=()',
            'gyroscope=()',
            'accelerometer=()',
            'ambient-light-sensor=()',
            'autoplay=(self)',
            'encrypted-media=(self)',
            'fullscreen=(self)',
            'picture-in-picture=(self)'
          ]

          res.setHeader('Feature-Policy', featurePolicy.join('; '))
        }

        // Custom headers
        Object.entries(customHeaders).forEach(([key, value]) => {
          res.setHeader(key, value)
        })

        // Security information headers
        res.setHeader('X-Security-Middleware', 'enhanced')
        res.setHeader('X-Content-Security-Policy-Nonce', req.cspNonce || '')

        next()
      } catch (error) {
        logger.error('Security headers error', { error: error.message })
        next()
      }
    }
  }

  /**
   * Request anomaly detection middleware
   * @param {Object} options - Anomaly detection options
   * @returns {Function} Middleware function
   */
  static requestAnomalyDetection(options = {}) {
    const {
      enableTimingAnalysis = true,
      enablePatternAnalysis = true,
      enableHeaderAnalysis = true
    } = options

    return (req, res, next) => {
      try {
        const anomalies = []

        // Timing analysis
        if (enableTimingAnalysis) {
          const requestStart = Date.now()
          res.on('finish', () => {
            const requestDuration = Date.now() - requestStart

            if (requestDuration > 30000) {
              // 30 seconds
              logger.warn('Long request duration detected', {
                ip: req.ip,
                path: req.path,
                duration: requestDuration,
                statusCode: res.statusCode
              })
            }
          })
        }

        // Pattern analysis
        if (enablePatternAnalysis) {
          // Check for common attack patterns in URL
          const attackPatterns = [
            /\.\./, // Path traversal
            /<script/i, // XSS
            /union.*select/i, // SQL injection
            /cmd\.exe/i, // Command injection
            /\/etc\/passwd/i, // File inclusion
            /eval\(/i // Code execution
          ]

          const url = req.originalUrl.toLowerCase()
          for (const pattern of attackPatterns) {
            if (pattern.test(url)) {
              anomalies.push({
                type: 'URL_ATTACK_PATTERN',
                pattern: pattern.toString(),
                url: req.originalUrl
              })
            }
          }
        }

        // Header analysis
        if (enableHeaderAnalysis) {
          // Check for missing required headers
          const requiredHeaders = ['host', 'user-agent']
          const missingHeaders = requiredHeaders.filter(header => !req.headers[header])

          if (missingHeaders.length > 0) {
            anomalies.push({
              type: 'MISSING_HEADERS',
              headers: missingHeaders
            })
          }

          // Check for unusual header combinations
          const userAgent = req.headers['user-agent'] || ''
          if (userAgent.length > 500) {
            anomalies.push({
              type: 'UNUSUALLY_LONG_USER_AGENT',
              length: userAgent.length
            })
          }
        }

        // Log anomalies if any detected
        if (anomalies.length > 0) {
          logger.warn('Request anomalies detected', {
            ip: req.ip,
            path: req.path,
            anomalies
          })
        }

        req.anomalies = anomalies
        next()
      } catch (error) {
        logger.error('Anomaly detection error', { error: error.message })
        next()
      }
    }
  }

  /**
   * Check if IP is suspicious
   * @param {string} ip - IP address
   * @returns {boolean} Is suspicious
   */
  static isSuspiciousIP(ip) {
    return SUSPICIOUS_IP_PATTERNS.some(pattern => pattern.test(ip))
  }

  /**
   * Parse size string to bytes
   * @param {string} size - Size string (e.g., '10mb')
   * @returns {number} Size in bytes
   */
  static parseSize(size) {
    const units = {
      b: 1,
      kb: 1024,
      mb: 1024 * 1024,
      gb: 1024 * 1024 * 1024
    }

    const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)$/)
    if (!match) {
      throw new Error(`Invalid size format: ${size}`)
    }

    const [, value, unit] = match
    return parseInt(value) * units[unit]
  }

  /**
   * Generate CSP nonce
   * @returns {string} Nonce string
   */
  static generateNonce() {
    return require('crypto').randomBytes(16).toString('base64')
  }

  /**
   * Get security statistics
   * @returns {Object} Security statistics
   */
  static getSecurityStats() {
    return {
      suspiciousIPPatterns: SUSPICIOUS_IP_PATTERNS.length,
      botPatterns: BOT_PATTERNS.length,
      anomalyThresholds: ANOMALY_THRESHOLDS,
      inputSanitizationStats: InputSanitizationService.getSecurityStats(),
      malwareScanningStats: MalwareScanningService.getServiceStats()
    }
  }
}

export default EnhancedSecurityMiddleware
