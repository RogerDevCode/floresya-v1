/**
 * Admin Authorization Middleware
 * Ensures only admin users can access protected routes
 * @module middleware/auth/requireAdmin
 */

import { ForbiddenError } from '../errors/AppError.js'
import { logger } from '../../config/logger.js'

/**
 * Middleware to require admin role
 * Must be used AFTER authenticate middleware
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 * @throws {ForbiddenError} If user is not admin
 */
export const requireAdmin = (req, res, next) => {
  try {
    const user = req.user

    if (!user) {
      logger.warn('requireAdmin: No user in request')
      throw new ForbiddenError('Authentication required')
    }

    // Check if user has admin role
    const userRole = user.user_metadata?.role || user.role || 'user'

    if (userRole !== 'admin') {
      logger.warn('Access denied - user is not admin', {
        userId: user.id,
        role: userRole,
        path: req.path
      })
      throw new ForbiddenError('Admin access required')
    }

    logger.debug('Admin access granted', {
      userId: user.id,
      path: req.path
    })

    next()
  } catch (error) {
    next(error)
  }
}

export default requireAdmin
