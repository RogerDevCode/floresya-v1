/**
 * User Controller
 * Handles HTTP logic for user operations
 * Delegates business logic to service layer
 */

import * as userService from '../services/userService.js'
import { asyncHandler } from '../middleware/error/index.js'
import { BadRequestError, UnauthorizedError } from '../errors/AppError.js'

/**
 * Helper Functions - Common utilities following KISS, DRY, and SSOT principles
 */

/**
 * Creates standardized API response
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Formatted response object
 */
const createResponse = (data, message) => ({
  success: true,
  data,
  message
})

/**
 * Gets appropriate HTTP status code for operation
 * @param {string} operation - Operation type (create, update, delete, etc.)
 * @returns {number} HTTP status code
 */
const getStatusCode = operation => {
  const statusCodes = {
    create: 201,
    update: 200,
    delete: 200
  }

  // Fail-fast: Validate operation
  if (!statusCodes[operation]) {
    throw new BadRequestError(`Invalid operation: ${operation}`, {
      operation,
      validOperations: Object.keys(statusCodes)
    })
  }

  return statusCodes[operation]
}

/**
 * Gets appropriate success message for operation
 * @param {string} operation - Operation type
 * @param {string} entity - Entity name (user, product, etc.)
 * @returns {string} Success message
 */
const getSuccessMessage = (operation, entity = 'User') => {
  const messages = {
    create: `${entity} created successfully`,
    update: `${entity} updated successfully`,
    delete: `${entity} deactivated successfully`,
    retrieve: `${entity} retrieved successfully`,
    users: 'Users retrieved successfully'
  }

  // Fail-fast: Validate operation
  if (!messages[operation]) {
    throw new BadRequestError(`Invalid operation: ${operation}`, {
      operation,
      validOperations: Object.keys(messages)
    })
  }

  return messages[operation]
}

/**
 * GET /api/users
 * Get all users with filters
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  // KISS principle: No mandatory pagination - show all users by default
  const filters = {
    search: req.query.search,
    role: req.query.role,
    email_verified: req.query.email_verified
  }

  // Optional pagination - only when provided
  if (req.query.limit !== undefined) {
    filters.limit = Number(req.query.limit)

    // FAIL FAST - Explicit validation for offset
    if (req.query.offset !== undefined) {
      const offset = Number(req.query.offset)
      if (isNaN(offset) || offset < 0) {
        throw new BadRequestError('Invalid offset: must be a non-negative number', {
          offset: req.query.offset,
          rule: 'non-negative number'
        })
      }
      filters.offset = offset
    } else {
      filters.offset = 0
    }
  }

  // FAIL FAST - Explicit admin check
  const userRole = req.user ? req.user.user_metadata?.role || req.user.role : null

  if (!req.user) {
    throw new UnauthorizedError('Authentication required', {
      reason: 'no_user_object'
    })
  }

  if (userRole !== 'admin') {
    throw new UnauthorizedError('Admin access required to view all users', {
      userRole,
      requiredRole: 'admin'
    })
  }

  // Control includeInactive based on admin role and query param
  const includeInactive = req.user?.role === 'admin' && req.query.includeInactive === 'true'
  const users = await userService.getAllUsers(filters, includeInactive)

  const response = createResponse(users, getSuccessMessage('users'))
  res.json(response)
})

/**
 * GET /api/users/:id
 * Get user by ID
 */
export const getUserById = asyncHandler(async (req, res) => {
  // FAIL FAST - Validate ID parameter
  if (!req.params.id) {
    throw new BadRequestError('User ID is required in path parameters', {
      params: req.params,
      rule: 'id parameter required'
    })
  }

  const userId = Number(req.params.id)
  if (isNaN(userId) || userId <= 0) {
    throw new BadRequestError('Invalid user ID: must be a positive number', {
      userId: req.params.id,
      rule: 'positive number required'
    })
  }

  // FAIL FAST - Explicit admin check for inactive user access
  const userRole = req.user ? req.user.user_metadata?.role || req.user.role : null

  const includeInactive = req.user !== null && userRole === 'admin'
  const user = await userService.getUserById(userId, includeInactive)

  const response = createResponse(user, getSuccessMessage('retrieve'))
  res.json(response)
})

/**
 * GET /api/users/email/:email
 * Get user by email
 */
export const getUserByEmail = asyncHandler(async (req, res) => {
  // FAIL FAST - Validate email parameter
  if (!req.params.email) {
    throw new BadRequestError('Email is required in path parameters', {
      params: req.params,
      rule: 'email parameter required'
    })
  }

  const user = await userService.getUserByEmail(req.params.email, false)

  const response = createResponse(user, getSuccessMessage('retrieve'))
  res.json(response)
})

/**
 * GET /api/users/filter
 * Get users by intelligent filter (role, state, email-verified)
 */
export const getUsersByFilter = asyncHandler(async (req, res) => {
  // FAIL FAST - Require at least one filter
  if (!req.query.role && req.query.state === undefined && req.query.email_verified === undefined) {
    throw new BadRequestError(
      'At least one filter parameter is required: role, state, or email_verified',
      {
        providedQuery: req.query,
        rule: 'filter parameter required'
      }
    )
  }

  // FAIL FAST - Validate pagination parameters
  if (!req.query.limit || !req.query.offset) {
    throw new BadRequestError('Query parameters limit and offset are required', {
      providedQuery: req.query,
      rule: 'Both limit and offset must be provided as query parameters'
    })
  }

  const filters = {
    role: req.query.role,
    state: req.query.state === 'true' ? true : req.query.state === 'false' ? false : undefined,
    email_verified:
      req.query.email_verified === 'true'
        ? true
        : req.query.email_verified === 'false'
          ? false
          : undefined,
    limit: Number(req.query.limit),
    offset: Number(req.query.offset)
  }

  const users = await userService.getUsersByFilter(filters)

  const response = createResponse(users, getSuccessMessage('users'))
  res.json(response)
})

/**
 * POST /api/users
 * Create new user (client registration - no password required)
 */
export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body)

  const response = createResponse(user, getSuccessMessage('create'))
  res.status(getStatusCode('create')).json(response)
})

/**
 * PUT /api/users/:id
 * Update user
 */
export const updateUser = asyncHandler(async (req, res) => {
  // FAIL FAST - Validate ID parameter
  if (!req.params.id) {
    throw new BadRequestError('User ID is required in path parameters', {
      params: req.params,
      rule: 'id parameter required'
    })
  }

  const userId = Number(req.params.id)
  if (isNaN(userId) || userId <= 0) {
    throw new BadRequestError('Invalid user ID: must be a positive number', {
      userId: req.params.id,
      rule: 'positive number required'
    })
  }

  // FAIL FAST - Validate request body
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError('Request body is required with update data', {
      body: req.body,
      rule: 'non-empty request body required'
    })
  }

  const user = await userService.updateUser(userId, req.body)

  const response = createResponse(user, getSuccessMessage('update'))
  res.json(response)
})

/**
 * DELETE /api/users/:id
 * Soft-delete user
 */
export const deleteUser = asyncHandler(async (req, res) => {
  // FAIL FAST - Validate ID parameter
  if (!req.params.id) {
    throw new BadRequestError('User ID is required in path parameters', {
      params: req.params,
      rule: 'id parameter required'
    })
  }

  const userId = Number(req.params.id)
  if (isNaN(userId) || userId <= 0) {
    throw new BadRequestError('Invalid user ID: must be a positive number', {
      userId: req.params.id,
      rule: 'positive number required'
    })
  }

  const user = await userService.deleteUser(userId)

  const response = createResponse(user, getSuccessMessage('delete'))
  res.json(response)
})

/**
 * PATCH /api/users/:id/reactivate
 * Reactivate user (admin only)
 */
export const reactivateUser = asyncHandler(async (req, res) => {
  // FAIL FAST - Validate ID parameter
  if (!req.params.id) {
    throw new BadRequestError('User ID is required in path parameters', {
      params: req.params,
      rule: 'id parameter required'
    })
  }

  const userId = Number(req.params.id)
  if (isNaN(userId) || userId <= 0) {
    throw new BadRequestError('Invalid user ID: must be a positive number', {
      userId: req.params.id,
      rule: 'positive number required'
    })
  }

  const user = await userService.reactivateUser(userId)

  const response = createResponse(user, getSuccessMessage('update'))
  res.json(response)
})

/**
 * PATCH /api/users/:id/verify-email
 * Verify user email (owner or admin)
 */
export const verifyUserEmail = asyncHandler(async (req, res) => {
  // FAIL FAST - Validate ID parameter
  if (!req.params.id) {
    throw new BadRequestError('User ID is required in path parameters', {
      params: req.params,
      rule: 'id parameter required'
    })
  }

  const userId = Number(req.params.id)
  if (isNaN(userId) || userId <= 0) {
    throw new BadRequestError('Invalid user ID: must be a positive number', {
      userId: req.params.id,
      rule: 'positive number required'
    })
  }

  const user = await userService.verifyUserEmail(userId)

  const response = createResponse(user, getSuccessMessage('update'))
  res.json(response)
})
