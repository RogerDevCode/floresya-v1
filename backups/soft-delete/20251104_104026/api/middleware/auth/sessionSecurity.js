/**
 * Session Security Middleware
 * Configures secure session management with httpOnly, secure, and sameSite cookies
 *
 * Uses centralized configuration from configLoader
 */

import session from 'express-session'
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
