/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * User Routes
 * Defines routes for user operations
 */

import express from 'express'
import * as userController from '../controllers/userController.js'
import { authenticate, authorize, checkOwnership } from '../middleware/auth/index.js'
import { validate, validateId, validatePagination } from '../middleware/validation/index.js'

const router = express.Router()

// Admin-only: Get all users
router.get('/', authenticate, authorize('admin'), validatePagination, userController.getAllUsers)

// Get user by ID (owner or admin)
router.get(
  '/:id',
  authenticate,
  validateId(),
  checkOwnership(req => parseInt(req.params.id, 10)),
  userController.getUserById
)

// Admin-only: Get user by email
router.get('/email/:email', authenticate, authorize('admin'), userController.getUserByEmail)

// Create user (public registration)
router.post(
  '/',
  validate({
    email: { type: 'string', required: true, email: true },
    full_name: { type: 'string', minLength: 2, maxLength: 255 },
    phone: { type: 'string', pattern: /^\+?[\d\s-()]+$/ },
    role: { type: 'string', enum: ['user', 'admin'] },
    password_hash: { type: 'string' }
  }),
  userController.createUser
)

// Update user (owner or admin)
router.put(
  '/:id',
  authenticate,
  validateId(),
  checkOwnership(req => parseInt(req.params.id, 10)),
  validate({
    full_name: { type: 'string', minLength: 2, maxLength: 255 },
    phone: { type: 'string', pattern: /^\+?[\d\s-()]+$/ },
    role: { type: 'string', enum: ['user', 'admin'] },
    email_verified: { type: 'boolean' }
  }),
  userController.updateUser
)

// Admin-only: Delete user
router.delete('/:id', authenticate, authorize('admin'), validateId(), userController.deleteUser)

// Admin-only: Reactivate user
router.patch(
  '/:id/reactivate',
  authenticate,
  authorize('admin'),
  validateId(),
  userController.reactivateUser
)

// Verify email (owner or admin)
router.patch(
  '/:id/verify-email',
  authenticate,
  validateId(),
  checkOwnership(req => parseInt(req.params.id, 10)),
  userController.verifyUserEmail
)

export default router
