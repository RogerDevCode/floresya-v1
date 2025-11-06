/**
 * Security Middleware
 * CORS, Helmet, and Input Sanitization
 * Uses centralized configuration
 */

import cors from 'cors'
import helmet from 'helmet'
import { BadRequestError } from '../../errors/AppError.js'
import config from '../../config/configLoader.js'
import { log } from '../../utils/logger.js'

/**
 * CORS Configuration
 * Restrict origins based on centralized configuration
 */
export function configureCors() {
  const { allowedOrigins, credentials, methods } = config.server.cors

  log.debug('Configuring CORS with allowed origins', {
    origins: allowedOrigins,
    credentials,
    methods
  })

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true)
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        log.security('CORS origin not allowed', 'medium', {
          origin,
          allowedOrigins
        })
        callback(new BadRequestError(`Origin ${origin} not allowed by CORS`))
      }
    },
    credentials,
    methods,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400 // 24 hours
  })
}

/**
 * Helmet Configuration
 * Secure HTTP headers with centralized configuration
 */
export function configureHelmet() {
  const isDevelopment = config.IS_DEVELOPMENT

  log.debug('Configuring Helmet security headers', {
    isDevelopment,
    environment: config.NODE_ENV
  })

  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        scriptSrc: isDevelopment
          ? ["'self'", "'unsafe-eval'", "'unsafe-inline'"] // Development: allow inline scripts
          : [
              // Production: only specific hashes
              "'self'",
              "'unsafe-eval'",
              "'sha256-+xJ6txSxaHKrLk0C53nnoPP2rf27Rop0wiQQfNCQdDQ='",
              "'sha256-7H18Ed8O8mRf1f878Fj7BDCZF6XRLui9qZpWYd5+sFI='"
            ],
        scriptSrcAttr: ["'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", ...config.server.cors.allowedOrigins, 'ws:', 'wss:'],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      },
      reportOnly: isDevelopment // Report violations in development
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  })
}

/**
 * Mongo Sanitize (Manual)
 * Remove $ and . from req.body, req.params, req.query
 * Replaced express-mongo-sanitize due to Express 5 incompatibility
 */
export function configureSanitize() {
  return (req, res, next) => {
    const sanitizeObject = obj => {
      if (!obj || typeof obj !== 'object') {
        return obj
      }

      for (const key in obj) {
        // PROTECTION: Check for prototype pollution
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          throw new BadRequestError(`Invalid field: ${key} (prototype pollution protection)`)
        }

        // PROTECTION: Check for NoSQL injection operators in keys
        // Block keys starting with $ (MongoDB operators) or containing dots (dot notation)
        if (key.startsWith('$') || key.includes('.')) {
          throw new BadRequestError(`Invalid characters in field: ${key}`)
        }

        // PROTECTION: Check for dangerous patterns in values
        // Only check for actual NoSQL operators (prefixed with $)
        if (typeof obj[key] === 'string') {
          const value = obj[key]
          // Check for NoSQL operators in values - must start with $
          const nosqlPattern = /\$(ne|gt|gte|lt|lte|in|nin|regex|where|or|and|not|exists|type)/i
          if (nosqlPattern.test(value)) {
            throw new BadRequestError(`Invalid NoSQL operator in value for field: ${key}`)
          }
        }

        // RECURSION: Sanitize nested objects
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key])
        }
      }
      return obj
    }

    try {
      if (req.body) {
        sanitizeObject(req.body)
      }
      if (req.params) {
        sanitizeObject(req.params)
      }
      if (req.query) {
        sanitizeObject(req.query)
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * XSS Protection Middleware
 * Comprehensive XSS sanitization for all input sources
 */
export function xssProtection(req, res, next) {
  const sanitizeString = str => {
    if (typeof str !== 'string') {
      return str
    }

    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  const sanitizeObject = obj => {
    if (!obj || typeof obj !== 'object') {
      return obj
    }

    // Create a copy to avoid modifying prototype
    const sanitized = Array.isArray(obj) ? [] : {}

    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        // Sanitize string values
        sanitized[key] = sanitizeString(obj[key])
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Recursively sanitize nested objects
        sanitized[key] = sanitizeObject(obj[key])
      } else {
        // Keep other types as-is
        sanitized[key] = obj[key]
      }
    })

    return sanitized
  }

  try {
    // Sanitize request body
    if (req.body && Object.keys(req.body).length > 0) {
      req.body = sanitizeObject(req.body)
    }

    // Sanitize route params (can be modified in Express 5)
    if (req.params && Object.keys(req.params).length > 0) {
      req.params = sanitizeObject(req.params)
    }

    // Sanitize query params (can be modified in Express 5)
    // Skip in testing environments where req object is read-only
    if (req.query && Object.keys(req.query).length > 0) {
      try {
        req.query = sanitizeObject(req.query)
      } catch (e) {
        // In testing or read-only environments, skip query sanitization
        if (process.env.NODE_ENV !== 'test') {
          console.warn('Failed to sanitize query params:', e.message)
        }
      }
    }

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Rate Limiting Middleware (simple in-memory)
 * Uses centralized configuration
 * NOTE: Renamed from 'rateLimiter' to avoid conflict with rateLimit.js
 */
const requestCounts = new Map()

export function rateLimiterSimple(options = {}) {
  const windowMs = options.windowMs || config.security.rateLimit.windowMs
  const max = options.max || config.security.rateLimit.maxRequests
  const message = options.message || config.security.rateLimit.message

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress

    const now = Date.now()
    const record = requestCounts.get(key) || { count: 0, resetTime: now + windowMs }

    // Reset if window expired
    if (now > record.resetTime) {
      record.count = 0
      record.resetTime = now + windowMs
    }

    record.count++
    requestCounts.set(key, record)

    // Clean old entries every 100 requests
    if (requestCounts.size > 10000) {
      requestCounts.forEach((value, key) => {
        if (now > value.resetTime) {
          requestCounts.delete(key)
        }
      })
    }

    // Check limit
    if (record.count > max) {
      log.security('Rate limit exceeded', 'medium', {
        ip: key,
        count: record.count,
        limit: max,
        windowMs
      })

      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message,
        limit: max,
        remaining: 0,
        reset: new Date(record.resetTime).toISOString()
      })
    }

    res.setHeader('X-RateLimit-Limit', max)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count))
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString())

    next()
  }
}
