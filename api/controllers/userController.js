/**
 * User Controller
 * Handles HTTP logic for user operations
 */

import * as userService from '../services/userService.js'
import { asyncHandler } from '../middleware/errorHandler.js'

/**
 * GET /api/users
 * Get all active users with filters
 * Supports search query: ?search=jose (searches in full_name and email)
 */
/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     description: Admin only - Returns paginated list of all users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/OffsetParam'
 *       - name: role
 *         in: query
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Filter by user role
 *       - name: email_verified
 *         in: query
 *         schema: { type: boolean }
 *         description: Filter by email verification status
 *       - name: search
 *         in: query
 *         schema: { type: string }
 *         description: Search in full_name and email (accent-insensitive, uses indexed normalized columns)
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/user' } }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const filters = {
    role: req.query.role,
    email_verified: req.query.email_verified === 'true',
    search: req.query.search, // New: accent-insensitive search
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
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     description: Get user details by ID (owner or admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
/**
 * @swagger
 * /api/users/email/{email}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by email
 *     description: Admin only - Get user details by email address
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         schema: { type: string, format: email }
 *         description: User email address
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create new user
 *     description: Create a new user account (public registration)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, full_name]
 *             properties:
 *               email: { type: string, format: email }
 *               full_name: { type: string, minLength: 2, maxLength: 255 }
 *               phone: { type: string, pattern: '^\\+?[\\d\\s-()]+$' }
 *               role: { type: string, enum: [user, admin], default: user }
 *               password_hash: { type: string, minLength: 8 }
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       409: { description: User already exists }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user
 *     description: Update user details (owner or admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name: { type: string, minLength: 2, maxLength: 255 }
 *               phone: { type: string, pattern: '^\\+?[\\d\\s-()]+$' }
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (soft delete)
 *     description: Admin only - Soft deletes a user (sets is_active to false)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
/**
 * @swagger
 * /api/users/{id}/reactivate:
 *   patch:
 *     tags: [Users]
 *     summary: Reactivate user
 *     description: Admin only - Reactivates a soft-deleted user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: User reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
/**
 * @swagger
 * /api/users/{id}/verify-email:
 *   patch:
 *     tags: [Users]
 *     summary: Verify user email
 *     description: Verify user email address (owner or admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export const verifyUserEmail = asyncHandler(async (req, res) => {
  const user = await userService.verifyUserEmail(req.params.id)

  res.json({
    success: true,
    data: user,
    message: 'Email verified successfully'
  })
})
