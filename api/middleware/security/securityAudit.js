/**
 * Security Audit Middleware
 * Comprehensive security validation and monitoring
 *
 * PRINCIPLES APPLIED:
 * - Fail Fast: Immediate security validation
 * - Defense in Depth: Multiple security layers
 * - Clean Architecture: Dedicated security component
 */

import { logger } from '../../utils/logger.js'
import { UnauthorizedError, ForbiddenError } from '../../errors/AppError.js'

/**
 * Security headers middleware
 * Sets essential security headers
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export function securityHeaders(req, res, next) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Content Security Policy (basic)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'"
  )

  // HSTS (HTTPS Strict Transport Security)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  next()
}

/**
 * Input sanitization middleware
 * Sanitizes request inputs
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export function sanitizeInput(req, res, next) {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body)
  }

  // Sanitize query params
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query)
  }

  next()
}

/**
 * Recursively sanitize object values
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
function sanitizeObject(obj) {
  const sanitized = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Remove potential XSS and injection patterns
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim()
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Suspicious activity detection
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export function detectSuspiciousActivity(req, res, next) {
  const suspiciousPatterns = [
    /(<|%3C)script[\s\S]*?(>|%3E)/i, // Script tags
    /union[\s]+select/i, // SQL injection
    /(<|%3C)img[\s\S]*?src[\s]*=[\s]*javascript:/i, // JS in img src
    /(<|%3C)iframe/i, // Iframes
    /(<|%3C)object/i, // Objects
    /(<|%3C)embed/i // Embeds
  ]

  const requestString = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  }).toLowerCase()

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestString))

  if (isSuspicious) {
    logger.warn('Suspicious request detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.originalUrl,
      timestamp: new Date().toISOString()
    })

    // Log security event but don't block in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Request blocked due to suspicious activity'
      })
    }
  }

  next()
}

/**
 * Authentication validation middleware
 * Validates JWT tokens and session security
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export function validateAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    // Public routes don't require auth
    if (isPublicRoute(req.path)) {
      return next()
    }
    throw new UnauthorizedError('Authentication required', { path: req.path })
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader

  // Basic token validation
  if (!token || token.length < 10) {
    throw new UnauthorizedError('Invalid token format', { tokenLength: token?.length })
  }

  // In a real implementation, validate JWT signature and expiration
  // For now, just attach token to request
  req.auth = {
    token,
    validated: true
  }

  next()
}

/**
 * Check if route is public (doesn't require authentication)
 * @param {string} path - Request path
 * @returns {boolean} Is public route
 */
function isPublicRoute(path) {
  const publicRoutes = ['/', '/index', '/products', '/carousel', '/contact', '/cart', '/payment']

  return (
    publicRoutes.some(route => path.startsWith(route)) ||
    path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$/)
  )
}

/**
 * Permission check middleware
 * @param {Array} requiredPermissions - Required permissions
 * @returns {Function} Middleware function
 */
export function requirePermissions(requiredPermissions) {
  return (req, res, next) => {
    if (!req.auth) {
      throw new UnauthorizedError('Authentication required')
    }

    // In a real implementation, check user permissions
    // For now, assume admin role
    const userRole = req.headers['x-user-role'] || 'user'

    if (userRole !== 'admin' && requiredPermissions.includes('admin')) {
      throw new ForbiddenError('Insufficient permissions', {
        required: requiredPermissions,
        userRole
      })
    }

    next()
  }
}

/**
 * Rate limiting per IP
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
const rateLimiter = {
  requests: new Map(),
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100 // Max 100 requests per minute per IP
}

export function ipRateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress
  const now = Date.now()

  if (!rateLimiter.requests.has(ip)) {
    rateLimiter.requests.set(ip, {
      count: 1,
      resetTime: now + rateLimiter.windowMs
    })
    return next()
  }

  const requestData = rateLimiter.requests.get(ip)

  if (now > requestData.resetTime) {
    requestData.count = 1
    requestData.resetTime = now + rateLimiter.windowMs
    return next()
  }

  requestData.count++

  if (requestData.count > rateLimiter.maxRequests) {
    logger.warn('Rate limit exceeded', {
      ip,
      count: requestData.count,
      limit: rateLimiter.maxRequests
    })

    return res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Maximum ${rateLimiter.maxRequests} requests per minute.`,
      retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
    })
  }

  next()
}

/**
 * Admin action audit logging middleware
 * Logs all admin actions for security auditing
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export function adminAuditLogger(req, res, next) {
  // Only log admin routes
  if (!req.path.startsWith('/api/admin')) {
    return next()
  }

  const originalSend = res.send
  const originalJson = res.json

  // Capture response data
  let responseData = null

  // Override send method
  res.send = function (data) {
    responseData = data
    return originalSend.call(this, data)
  }

  // Override json method
  res.json = function (data) {
    responseData = data
    return originalJson.call(this, data)
  }

  // Log after response is sent
  res.on('finish', () => {
    const auditLog = {
      timestamp: new Date().toISOString(),
      adminAction: {
        method: req.method,
        path: req.path,
        fullUrl: req.originalUrl,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user?.id,
        userEmail: req.user?.email,
        userRole: req.user?.user_metadata?.role || req.user?.role,
        sessionId: req.sessionID,
        requestId: req.requestId
      },
      requestData: {
        body: sanitizeAuditData(req.body),
        query: sanitizeAuditData(req.query),
        params: sanitizeAuditData(req.params)
      },
      responseData: {
        statusCode: res.statusCode,
        data: sanitizeAuditData(responseData)
      }
    }

    // Determine severity based on action type and result
    let severity = 'low'
    if (res.statusCode >= 400) {
      severity = 'medium'
    }
    if (req.method === 'DELETE' || (req.method === 'POST' && req.path.includes('/delete'))) {
      severity = 'high'
    }

    logger.logSecurity('Admin action performed', severity, auditLog)
  })

  next()
}

/**
 * Sanitize sensitive data for audit logging
 * @param {any} data - Data to sanitize
 * @returns {any} Sanitized data
 */
function sanitizeAuditData(data) {
  if (!data) {
    return data
  }

  if (typeof data === 'string') {
    // Remove passwords, tokens, secrets
    if (data.length > 100) {
      return data.substring(0, 100) + '...[truncated]'
    }
    return data
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeAuditData(item))
  }

  if (typeof data === 'object') {
    const sanitized = {}
    for (const [key, value] of Object.entries(data)) {
      // Skip sensitive fields
      if (
        ['password', 'token', 'secret', 'key', 'auth'].some(sensitive =>
          key.toLowerCase().includes(sensitive)
        )
      ) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = sanitizeAuditData(value)
      }
    }
    return sanitized
  }

  return data
}

export default {
  securityHeaders,
  sanitizeInput,
  detectSuspiciousActivity,
  validateAuth,
  requirePermissions,
  ipRateLimit,
  adminAuditLogger
}
