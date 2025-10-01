/**
 * User Controller
 * Handles HTTP logic for user operations
 */

import * as userService from '../services/userService.js'
import { asyncHandler } from '../middleware/errorHandler.js'

/**
 * GET /api/users
 * Get all active users with filters
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const filters = {
    role: req.query.role,
    email_verified: req.query.email_verified === 'true',
    limit: req.query.limit,
    offset: req.query.offset
  }

  const users = await userService.getAllUsers(filters)

  res.json({
    success: true,
    data: users,
    message: 'Users retrieved successfully'
  })
})

/**
 * GET /api/users/:id
 * Get user by ID
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id)

  res.json({
    success: true,
    data: user,
    message: 'User retrieved successfully'
  })
})

/**
 * GET /api/users/email/:email
 * Get user by email
 */
export const getUserByEmail = asyncHandler(async (req, res) => {
  const user = await userService.getUserByEmail(req.params.email)

  res.json({
    success: true,
    data: user,
    message: 'User retrieved successfully'
  })
})

/**
 * POST /api/users
 * Create new user
 */
export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body)

  res.status(201).json({
    success: true,
    data: user,
    message: 'User created successfully'
  })
})

/**
 * PUT /api/users/:id
 * Update user
 */
export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body)

  res.json({
    success: true,
    data: user,
    message: 'User updated successfully'
  })
})

/**
 * DELETE /api/users/:id
 * Soft-delete user
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await userService.deleteUser(req.params.id)

  res.json({
    success: true,
    data: user,
    message: 'User deactivated successfully'
  })
})

/**
 * PATCH /api/users/:id/reactivate
 * Reactivate user
 */
export const reactivateUser = asyncHandler(async (req, res) => {
  const user = await userService.reactivateUser(req.params.id)

  res.json({
    success: true,
    data: user,
    message: 'User reactivated successfully'
  })
})

/**
 * PATCH /api/users/:id/verify-email
 * Verify user email
 */
export const verifyUserEmail = asyncHandler(async (req, res) => {
  const user = await userService.verifyUserEmail(req.params.id)

  res.json({
    success: true,
    data: user,
    message: 'Email verified successfully'
  })
})
