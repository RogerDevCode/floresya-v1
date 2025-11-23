/**
 * Procesado por B
 */

/**
 * Authentication Middleware - Main Middleware Functions
 * LEGACY: Modularized from auth.js (Phase 6)
 */

import { getUser } from '../../services/authService.index.js'
import { UnauthorizedError, ForbiddenError } from '../../errors/AppError.js'
import { log as logger } from '../../utils/logger.js'
import { IS_DEV, DEV_MOCK_USER, getUserRole } from './auth.helpers.js'
import { ROLE_PERMISSIONS } from '../../config/constants.js'

/**
 * Authenticate user (SECURE - ENTERPRISE)
 * - Development: Use authService (allows test mocking)
 * - Test Mode: Use authService mocks directly
 * - Production: Verify Supabase JWT (NO BYPASSES)
 */
export async function authenticate(req, res, next) {
  try {
    // DEVELOPMENT MODE: Use authService (allows proper test mocking)
    if (IS_DEV && process.env.NODE_ENV !== 'test') {
      logger.debug('🔍 AUTH MIDDLEWARE - Development mode, using authService')
      req.user = DEV_MOCK_USER
      req.token = 'dev-mock-token'
      logger.info('🔓 DEV MODE: Auto-authenticated', {
        email: DEV_MOCK_USER.email,
        role: DEV_MOCK_USER.user_metadata.role
      })
      return next()
    }

    // PRODUCTION MODE: Real JWT verification (NO BYPASSES)
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: No token provided', {
        path: req.path,
        method: req.method,
        ip: req.ip
      })
      throw new UnauthorizedError('Authentication required: No token provided', {
        path: req.path,
        hasAuthHeader: !!authHeader
      })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify token with Supabase (throws UnauthorizedError if invalid)
    const user = await getUser(token)

    // Attach user to request
    req.user = user
    req.token = token

    logger.info('User authenticated successfully', {
      userId: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'user',
      path: req.path
    })

    next()
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error.message,
      path: req.path,
      method: req.method,
      ip: req.ip
    })
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
    const userRole = getUserRole(req.user)

    if (!roles.includes(userRole)) {
      logger.warn('Access denied - insufficient role', {
        userId: req.user.id,
        email: req.user.email,
        role: userRole,
        requiredRoles: roles,
        path: req.path,
        method: req.method
      })

      return next(
        new ForbiddenError('Insufficient permissions: role check failed', {
          required: roles,
          current: userRole,
          path: req.path
        })
      )
    }

    logger.info('Authorization granted (role-based)', {
      userId: req.user.id,
      role: userRole,
      path: req.path
    })

    next()
  }
}

/**
 * Authorize by permission (more granular than role-based)
 * @param {string|string[]} allowedPermissions - Permissions required to access route
 */
export function authorizeByPermission(allowedPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required', { path: req.path }))
    }
    const userRole = getUserRole(req.user)
    const userPermissions = ROLE_PERMISSIONS[userRole] || []

    const requiredPermissions = Array.isArray(allowedPermissions)
      ? allowedPermissions
      : [allowedPermissions]

    // Check if user has all required permissions
    const hasPermission = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    )

    if (!hasPermission) {
      logger.warn('Access denied - insufficient permissions', {
        userId: req.user.id,
        email: req.user.email,
        role: userRole,
        requiredPermissions,
        userPermissions,
        path: req.path,
        method: req.method
      })

      return next(
        new ForbiddenError('Insufficient permissions: permission check failed', {
          required: requiredPermissions,
          userRole,
          path: req.path
        })
      )
    }

    logger.info('Authorization granted (permission-based)', {
      userId: req.user.id,
      role: userRole,
      permissions: requiredPermissions,
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
    const userRole = req.user.user_metadata?.role || req.user?.role || 'user'
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
