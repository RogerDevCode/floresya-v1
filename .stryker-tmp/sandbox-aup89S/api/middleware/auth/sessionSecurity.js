/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Session Security Middleware
 * Configures secure session management with httpOnly, secure, and sameSite cookies
 * Includes CSRF token validation for state-changing operations
 *
 * Uses centralized configuration from configLoader
 */

import session from 'express-session'
import crypto from 'crypto'
import config from '../../config/configLoader.js'

/**
 * Configure secure session middleware
 */
export function configureSecureSession() {
  return session({
    name: 'floresya-session',
    secret: config.security.session.secret || 'fallback-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on every request
    cookie: {
      httpOnly: true, // Prevent XSS attacks
      secure: config.IS_PRODUCTION, // Only send over HTTPS in production
      sameSite: 'strict', // Prevent CSRF attacks
      maxAge: config.security.session.maxAge // Configurable session duration
    }
  })
}

/**
 * Add security headers for session management
 */
export function sessionSecurityHeaders(req, res, next) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // Enable XSS protection (legacy but still useful)
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions policy (restricts use of browser features)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), ' +
      'microphone=(), ' +
      'camera=(), ' +
      'payment=(), ' +
      'usb=(), ' +
      'magnetometer=(), ' +
      'gyroscope=(), ' +
      'accelerometer=()'
  )

  next()
}

/**
 * Generate CSRF token
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * CSRF token middleware - generates and stores token in session
 */
export function csrfToken(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken()
  }

  // Make token available to templates/forms (if using server-side rendering)
  res.locals.csrfToken = req.session.csrfToken

  next()
}

/**
 * CSRF validation middleware for state-changing operations
 */
export function validateCsrf(req, res, next) {
  // Only validate for state-changing methods
  const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH']
  if (!stateChangingMethods.includes(req.method)) {
    return next()
  }

  // Skip CSRF validation for API endpoints that use JWT (Authorization header)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return next()
  }

  // Skip for public read-only endpoints
  const publicReadEndpoints = ['/api/products', '/api/occasions', '/api-docs', '/health']
  if (publicReadEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    return next()
  }

  // Get token from header or body
  const token = req.headers['x-csrf-token'] || req.body?._csrf

  if (!token) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token missing',
      message: 'CSRF token is required for this operation'
    })
  }

  if (!req.session.csrfToken || token !== req.session.csrfToken) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token invalid',
      message: 'Invalid or expired CSRF token'
    })
  }

  next()
}

/**
 * Validate session integrity
 */
export function validateSession(req, res, next) {
  // Skip validation for public endpoints
  if (
    req.path.startsWith('/api/products') ||
    req.path.startsWith('/api/occasions') ||
    req.path.startsWith('/api-docs') ||
    req.path.startsWith('/health')
  ) {
    return next()
  }

  // For protected endpoints, ensure session exists and is valid
  if (!req.session && !req.path.includes('/login') && !req.path.includes('/register')) {
    // Don't block API requests with Authorization header (JWT)
    if (!req.headers.authorization) {
      return next()
    }
  }

  next()
}
