/**
 * Authentication Middleware - DUAL-MODE
 * - Development: Auto-inject mock user (NODE_ENV=development)
 * - Production: Real Supabase JWT verification
 * ENTERPRISE FAIL-FAST: Uses custom error classes
 */

import { getUser } from '../services/authService.js'
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js'
import logger from './logger.js'

// DUAL-MODE: Check environment
const IS_DEV = process.env.NODE_ENV === 'development' && !process.env.FORCE_AUTH

// Mock user for development (auto-authenticated)
const DEV_MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'dev@floresya.local',
  user_metadata: {
    full_name: 'Developer User',
    phone: '+584141234567',
    role: 'admin' // Dev user has admin access for testing
  },
  email_confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString()
}

/**
 * Authenticate user (DUAL-MODE)
 * - Development: Auto-inject DEV_MOCK_USER
 * - Production: Verify Supabase JWT
 */
export async function authenticate(req, res, next) {
  try {
    // DEVELOPMENT MODE: Auto-inject mock user (zero friction)
    if (IS_DEV) {
      req.user = DEV_MOCK_USER
      req.token = 'dev-mock-token'
      logger.info('🔓 DEV MODE: Auto-authenticated', {
        email: DEV_MOCK_USER.email,
        role: DEV_MOCK_USER.user_metadata.role
      })
      return next()
    }

    // PRODUCTION MODE: Real JWT verification
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided', { path: req.path })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify token with Supabase (throws UnauthorizedError if invalid)
    const user = await getUser(token)

    // Attach user to request
    req.user = user
    req.token = token

    logger.info('User authenticated', {
      userId: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'user'
    })

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Authorize by role (works in both modes)
 * @param {string|string[]} allowedRoles - Roles allowed to access route
 */
export function authorize(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required', { path: req.path }))
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
    const userRole = req.user.user_metadata?.role || 'user'

    if (!roles.includes(userRole)) {
      logger.warn('Access denied', {
        userId: req.user.id,
        email: req.user.email,
        role: userRole,
        requiredRoles: roles,
        path: req.path
      })

      return next(
        new ForbiddenError('Insufficient permissions', {
          required: roles,
          current: userRole,
          path: req.path
        })
      )
    }

    logger.info('Authorization granted', {
      userId: req.user.id,
      role: userRole,
      path: req.path
    })

    next()
  }
}

/**
 * Require email verification (PRODUCTION ONLY)
 * In development, this is bypassed
 */
export function requireEmailVerified(req, res, next) {
  // DEVELOPMENT MODE: Skip email verification
  if (IS_DEV) {
    return next()
  }

  // PRODUCTION MODE: Check email confirmation
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required', {}))
  }

  if (!req.user.email_confirmed_at) {
    return next(
      new ForbiddenError('Email verification required', {
        email: req.user.email
      })
    )
  }

  next()
}

/**
 * Optional authentication (works in both modes)
 * Attaches user if token is present, but doesn't fail if missing
 */
export function optionalAuth(req, res, next) {
  // DEVELOPMENT MODE: Auto-inject mock user
  if (IS_DEV) {
    req.user = DEV_MOCK_USER
    req.token = 'dev-mock-token'
    return next()
  }

  // PRODUCTION MODE: Try to authenticate, but don't fail if no token
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.replace('Bearer ', '')

  getUser(token)
    .then(user => {
      req.user = user
      req.token = token
      next()
    })
    .catch(() => {
      // Silently fail for optional auth
      logger.debug('Optional auth failed')
      next()
    })
}

/**
 * Check if authenticated user is owner of resource
 * @param {Function} getResourceOwnerId - Function that extracts owner ID from request
 */
export function checkOwnership(getResourceOwnerId) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required', {}))
    }

    // Admin bypass (works in both modes)
    const userRole = req.user.user_metadata?.role || 'user'
    if (userRole === 'admin') {
      logger.info('Ownership check bypassed (admin)', {
        userId: req.user.id,
        path: req.path
      })
      return next()
    }

    const ownerId = getResourceOwnerId(req)

    if (req.user.id !== ownerId) {
      logger.warn('Ownership check failed', {
        userId: req.user.id,
        resourceOwnerId: ownerId,
        path: req.path
      })

      return next(
        new ForbiddenError('Access denied: not resource owner', {
          userId: req.user.id,
          resourceOwnerId: ownerId
        })
      )
    }

    next()
  }
}
