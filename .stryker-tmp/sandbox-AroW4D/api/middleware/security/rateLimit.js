/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Rate Limiting Middleware
 * Prevents abuse and DDoS attacks with intelligent rate limiting
 * Different limits for different types of operations
 */

import { RateLimitExceededError } from '../../errors/AppError.js'
import { logger } from '../../utils/logger.js'

// In-memory store for rate limiting (in production, use Redis)

/**
 * Simple in-memory rate limiter
 */
class MemoryRateLimiter {
  constructor() {
    this.store = new Map()
    // Clean up expired entries every 5 minutes
    setInterval(
      () => {
        this.cleanup()
      },
      5 * 60 * 1000
    )
  }

  /**
   * Check if request is within limits
   */
  isAllowed(key, maxRequests, windowMs) {
    const now = Date.now()
    const windowStart = now - windowMs

    // Get or create entry for this key
    let entry = this.store.get(key)
    if (!entry) {
      entry = {
        requests: [],
        blocked: false,
        blockedUntil: null
      }
      this.store.set(key, entry)
    }

    // Remove old requests outside the window
    entry.requests = entry.requests.filter(timestamp => timestamp > windowStart)

    // Check if currently blocked
    if (entry.blocked && now < entry.blockedUntil) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: entry.blockedUntil
      }
    }

    // Check if within limits
    if (entry.requests.length >= maxRequests) {
      // Block for 15 minutes after exceeding limit
      entry.blocked = true
      entry.blockedUntil = now + 15 * 60 * 1000

      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: entry.blockedUntil
      }
    }

    // Add current request
    entry.requests.push(now)

    return {
      allowed: true,
      remainingRequests: maxRequests - entry.requests.length,
      resetTime: now + windowMs
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      // Remove entries that haven't been used in 30 minutes
      const lastRequest = Math.max(...entry.requests, 0)
      if (now - lastRequest > 30 * 60 * 1000) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Get current stats for monitoring
   */
  getStats() {
    return {
      totalKeys: this.store.size,
      blockedKeys: Array.from(this.store.values()).filter(entry => entry.blocked).length
    }
  }
}

// Global rate limiter instance
const rateLimiter = new MemoryRateLimiter()

/**
 * Rate limiting configuration for different endpoints
 */
const RATE_LIMITS = {
  // General endpoints (public API, no specific rate limit type)
  general: {
    maxRequests: 10000, // 10000 requests per minute (development/testing)
    windowMs: 60 * 1000, // 1 minute window
    skipSuccessfulRequests: false
  },

  // Public endpoints (more restrictive)
  order_create: {
    maxRequests: 1000, // 1000 requests per minute (increased for e2e testing)
    windowMs: 60 * 1000, // 1 minute window
    skipSuccessfulRequests: false
  },

  // Authenticated endpoints (less restrictive)
  order_read: {
    maxRequests: 2000, // 2000 requests per minute (increased for e2e testing)
    windowMs: 60 * 1000, // 1 minute window
    skipSuccessfulRequests: false
  },

  //Critical endpoints (P0.3 requirement)
  critical_endpoints: {
    maxRequests: 1000, // 1000 requests per 15 minutes (increased for e2e testing)
    windowMs: 15 * 60 * 1000, // 15 minutes window
    skipSuccessfulRequests: false
  },

  // Admin endpoints (moderate limits)
  admin_operations: {
    maxRequests: 2000, // 2000 requests per minute (increased for e2e testing)
    windowMs: 60 * 1000, // 1 minute window
    skipSuccessfulRequests: false
  },

  // File uploads (very restrictive)
  file_upload: {
    maxRequests: 500, // 500 uploads per minute (increased for e2e testing)
    windowMs: 60 * 1000, // 1 minute window
    skipSuccessfulRequests: false
  }
}

/**
 * Generate rate limit key based on request
 */
function generateRateLimitKey(req, type = 'general') {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown'
  const userAgent = req.get('User-Agent') || 'unknown'
  const userId = req.user?.id || 'anonymous'

  switch (type) {
    case 'order_create':
      return `order_create:${clientIP}:${userId}`

    case 'order_read':
      return `order_read:${clientIP}:${userId}`

    case 'critical_endpoints':
      return `critical:${clientIP}:${userId}`

    case 'admin_operations':
      return `admin:${clientIP}:${userId}`

    case 'file_upload':
      return `upload:${clientIP}:${userId}`

    default:
      return `general:${clientIP}:${userAgent.substring(0, 50)}`
  }
}

/**
 * Main rate limiting middleware
 */
export function rateLimit(type = 'general') {
  return (req, res, next) => {
    try {
      const config = RATE_LIMITS[type] || RATE_LIMITS.general
      const key = generateRateLimitKey(req, type)

      const result = rateLimiter.isAllowed(key, config.maxRequests, config.windowMs)

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': config.maxRequests,
        'X-RateLimit-Remaining': result.remainingRequests,
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
        'X-RateLimit-Type': type
      })

      if (!result.allowed) {
        const resetIn = Math.ceil((result.resetTime - Date.now()) / 1000)

        return next(
          new RateLimitExceededError(
            `Límite de rate excedido. Intenta de nuevo en ${resetIn} segundos`,
            {
              limit: config.maxRequests,
              windowMs: config.windowMs,
              resetIn,
              type
            }
          )
        )
      }

      next()
    } catch (error) {
      logger.error('Error in rate limiting:', error)
      // Don't block on rate limiter errors, just continue
      next()
    }
  }
}

/**
 * Rate limiting for order creation (most restrictive)
 */
export function rateLimitOrderCreate(req, res, next) {
  return rateLimit('order_create')(req, res, next)
}

/**
 * Rate limiting for order reading operations
 */
export function rateLimitOrderRead(req, res, next) {
  return rateLimit('order_read')(req, res, next)
}

/**
 * Rate limiting for admin operations
 */
export function rateLimitAdmin(req, res, next) {
  return rateLimit('admin_operations')(req, res, next)
}

/**
 * Rate limiting for file uploads
 */
export function rateLimitFileUpload(req, res, next) {
  return rateLimit('file_upload')(req, res, next)
}

/**
 * Rate limiting for critical endpoints (orders, payments)
 */
export function rateLimitCritical(req, res, next) {
  return rateLimit('critical_endpoints')(req, res, next)
}

/**
 * Get current rate limiting stats
 */
export function getRateLimitStats() {
  return rateLimiter.getStats()
}

/**
 * Reset rate limit for a specific key (admin function)
 */
export function resetRateLimit(key) {
  rateLimiter.store.delete(key)
}

/**
 * Reset all rate limits (admin function)
 */
export function resetAllRateLimits() {
  rateLimiter.store.clear()
}

/**
 * Middleware to track request metrics for monitoring
 */
export function requestMetrics(req, res, next) {
  const startTime = Date.now()
  const key = generateRateLimitKey(req, 'general')

  // Track request
  res.on('finish', () => {
    const duration = Date.now() - startTime

    // Log slow requests (> 2 seconds)
    if (duration > 2000) {
      logger.warn(`Slow request detected: ${req.method} ${req.path} - ${duration}ms`)
    }

    // Log high frequency requests
    const entry = rateLimiter.store.get(key)
    if (entry && entry.requests.length > 50) {
      logger.warn(`High frequency requests from key: ${key}`)
    }
  })

  next()
}

/**
 * Adaptive rate limiting based on system load
 */
export function adaptiveRateLimit(req, res, next) {
  // Get current system stats
  const stats = getRateLimitStats()
  const currentLoad = stats.totalKeys

  // If high load, reduce limits temporarily
  if (currentLoad > 1000) {
    logger.warn(`High load detected (${currentLoad} active keys), applying stricter rate limits`)

    // Temporarily reduce limits by 50%
    const originalLimits = { ...RATE_LIMITS }

    Object.keys(RATE_LIMITS).forEach(key => {
      RATE_LIMITS[key].maxRequests = Math.floor(RATE_LIMITS[key].maxRequests * 0.5)
    })

    // Restore original limits after 10 minutes
    setTimeout(
      () => {
        Object.keys(RATE_LIMITS).forEach(key => {
          RATE_LIMITS[key] = originalLimits[key]
        })
        logger.info('Rate limits restored to normal levels')
      },
      10 * 60 * 1000
    )
  }

  next()
}

/**
 * Request size limiting middleware
 */
export function requestSizeLimit(maxSize = '10mb') {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0')

    // Define size limits
    const limits = {
      '1mb': 1024 * 1024,
      '5mb': 5 * 1024 * 1024,
      '10mb': 10 * 1024 * 1024,
      '50mb': 50 * 1024 * 1024
    }

    const maxBytes = limits[maxSize.toLowerCase()] || limits['10mb']

    if (contentLength > maxBytes) {
      return next(
        new RateLimitExceededError(`Payload demasiado grande. Máximo permitido: ${maxSize}`, {
          maxSize,
          actualSize: contentLength,
          limit: maxBytes
        })
      )
    }

    next()
  }
}

/**
 * Combined middleware for order creation with all protections
 */
export function protectOrderCreation(req, res, next) {
  // Apply all protections in sequence
  requestSizeLimit('5mb')(req, res, err => {
    if (err) {
      return next(err)
    }

    adaptiveRateLimit(req, res, err => {
      if (err) {
        return next(err)
      }

      rateLimitOrderCreate(req, res, err => {
        if (err) {
          return next(err)
        }

        requestMetrics(req, res, next)
      })
    })
  })
}

/**
 * Combined middleware for admin operations
 */
export function protectAdminOperations(req, res, next) {
  rateLimitAdmin(req, res, err => {
    if (err) {
      return next(err)
    }

    // Don't overwrite X-RateLimit-Type if it already exists (from rateLimitCritical)
    if (!res.getHeader('X-RateLimit-Type')) {
      res.setHeader('X-RateLimit-Type', 'admin_operations')
    }

    requestMetrics(req, res, next)
  })
}

/**
 * Health check endpoint for rate limiting
 */
export function getRateLimitHealth(req, res) {
  const stats = getRateLimitStats()

  res.json({
    success: true,
    data: {
      stats,
      limits: RATE_LIMITS,
      timestamp: new Date().toISOString()
    }
  })
}
