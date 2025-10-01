/**
 * Authentication Middleware
 * Simulated JWT validation (TODO: Implement real JWT)
 */

import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js'
import logger from './logger.js'

/**
 * Simulated JWT verification
 * TODO: Replace with real JWT implementation using jsonwebtoken
 *
 * For now, accepts header: Authorization: Bearer user:ID:ROLE
 * Example: Authorization: Bearer user:1:admin
 */
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided')
    }

    // Extract token
    const token = authHeader.substring(7)

    // Simulated token parsing (format: user:ID:ROLE)
    const parts = token.split(':')
    if (parts.length !== 3 || parts[0] !== 'user') {
      throw new UnauthorizedError('Invalid token format')
    }

    const userId = parseInt(parts[1], 10)
    const role = parts[2]

    if (isNaN(userId) || !['user', 'admin'].includes(role)) {
      throw new UnauthorizedError('Invalid token data')
    }

    // Attach user to request
    req.user = {
      id: userId,
      role: role
    }

    logger.info('User authenticated', { userId, role })

    next()
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error)
    } else {
      next(new UnauthorizedError('Invalid or expired token'))
    }
  }
}

/**
 * Authorization middleware - check user roles
 * @param  {...string} allowedRoles - Roles allowed to access route
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'))
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Access denied', {
        userId: req.user.id,
        role: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path
      })

      return next(new ForbiddenError('Insufficient permissions'))
    }

    next()
  }
}

/**
 * Optional authentication
 * Attaches user if token is present, but doesn't fail if missing
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  try {
    const token = authHeader.substring(7)
    const parts = token.split(':')

    if (parts.length === 3 && parts[0] === 'user') {
      const userId = parseInt(parts[1], 10)
      const role = parts[2]

      if (!isNaN(userId) && ['user', 'admin'].includes(role)) {
        req.user = { id: userId, role: role }
      }
    }
  } catch (error) {
    // Silently fail for optional auth
    logger.debug('Optional auth failed', { error: error.message })
  }

  next()
}

/**
 * Check if authenticated user is owner of resource
 * @param {Function} getResourceOwnerId - Function that extracts owner ID from request
 */
export function checkOwnership(getResourceOwnerId) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'))
    }

    // Admin bypass
    if (req.user.role === 'admin') {
      return next()
    }

    const ownerId = getResourceOwnerId(req)

    if (req.user.id !== ownerId) {
      logger.warn('Ownership check failed', {
        userId: req.user.id,
        resourceOwnerId: ownerId,
        path: req.path
      })

      return next(new ForbiddenError('Access denied: not resource owner'))
    }

    next()
  }
}
