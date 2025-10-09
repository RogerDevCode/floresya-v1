/**
 * Security Middleware
 * CORS, Helmet, and Input Sanitization
 */

import cors from 'cors'
import helmet from 'helmet'
import { BadRequestError } from '../errors/AppError.js'

/**
 * CORS Configuration
 * Restrict origins based on environment
 */
export function configureCors() {
  // Get allowed origins from environment variable or use defaults
  let allowedOrigins = ['http://localhost:3000', 'http://localhost:5173']

  if (process.env.ALLOWED_ORIGINS) {
    allowedOrigins = allowedOrigins.concat(process.env.ALLOWED_ORIGINS.split(','))
  }

  // Always add Vercel deployment domains to support deployment scenarios
  allowedOrigins = allowedOrigins.concat(
    [
      'https://floresya-v1.vercel.app',
      'https://www.floresya-v1.vercel.app',
      // Add your custom domain if you have one
      process.env.CUSTOM_DOMAIN || ''
    ].filter(domain => domain !== '')
  )

  // Add additional production domains if in production
  if (process.env.NODE_ENV === 'production') {
    // Add any additional production-specific domains here
  }

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true)
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new BadRequestError(`Origin ${origin} not allowed by CORS`))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24 hours
  })
}

/**
 * Helmet Configuration
 * Secure HTTP headers
 */
export function configureHelmet() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
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
        if (key.includes('$') || key.includes('.')) {
          throw new BadRequestError(`Invalid characters in field: ${key}`)
        }
        if (typeof obj[key] === 'object') {
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
 * Basic XSS sanitization for body only (params/query are read-only in Express 5)
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

    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key])
      } else if (typeof obj[key] === 'object') {
        obj[key] = sanitizeObject(obj[key])
      }
    })

    return obj
  }

  // Only sanitize body (params/query are read-only in Express 5)
  if (req.body && Object.keys(req.body).length > 0) {
    req.body = sanitizeObject(req.body)
  }

  next()
}

/**
 * Rate Limiting Middleware (simple in-memory)
 * For production, use redis-based rate limiter
 */
const requestCounts = new Map()

export function rateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000 // 15 minutes
  const max = options.max || 100 // max requests per window

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
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: 'Rate limit exceeded. Try again later.'
      })
    }

    res.setHeader('X-RateLimit-Limit', max)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count))
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString())

    next()
  }
}
