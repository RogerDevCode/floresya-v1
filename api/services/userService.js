/**
 * User Service
 * Business logic for user operations
 * KISS implementation - simple and direct
 *
 * REPOSITORY PATTERN: Uses UserRepository for data access
 * Following Service Layer Exclusive principle
 */

import { DB_SCHEMA } from './supabaseClient.js'
import DIContainer from '../architecture/di-container.js'
import { ValidationError, NotFoundError, BadRequestError } from '../errors/AppError.js'
import { withErrorMapping } from '../middleware/error/index.js'
import { validateId } from '../utils/validation.js'

/**
 * Get Logger instance from DI Container
 * @returns {Object} Logger instance
 */
function getLogger() {
  return DIContainer.resolve('Logger')
}

const TABLE = DB_SCHEMA.users.table
const VALID_ROLES = DB_SCHEMA.users.enums.role

/**
 * Get UserRepository instance from DI Container
 * @returns {UserRepository} Repository instance
 */
function getUserRepository() {
  return DIContainer.resolve('UserRepository')
}

/**
 * Validate user ID (KISS principle)
 */
function validateUserId(id, operation = 'operation') {
  validateId(id, 'User', operation)
}

/**
 * Enhanced error handler (KISS principle)
 */
async function withErrorHandling(operation, operationName, context = {}) {
  try {
    return await operation()
  } catch (error) {
    const logger = getLogger()
    logger.error(`${operationName} failed:`, error, context)
    throw error
  }
}

/**
 * Apply activity filter (FAIL FAST - no fallback)
 * Note: Not currently used - kept for reference
 */

/**
 * Get all users with simple filters (KISS principle)
 * - Shows ALL users by default (no pagination required)
 * - Only applies filters when explicitly provided
 */
export function getAllUsers(filters = {}, includeDeactivated = false) {
  return withErrorHandling(
    async () => {
      const userRepository = getUserRepository()

      // Use repository to get users with filters
      const data = await userRepository.findAllWithFilters(filters, {
        includeDeactivated,
        orderBy: 'created_at',
        ascending: false
      })

      // Don't throw error if no users found - return empty array
      return data || []
    },
    'getAllUsers',
    { filters, includeDeactivated }
  )
}

/**
 * Get user by ID
 */
export const getUserById = withErrorMapping(
  async (id, includeDeactivated = false) => {
    const userRepository = getUserRepository()

    validateUserId(id, 'getUserById')

    // Use repository to get user
    const data = await userRepository.findById(id, includeDeactivated)

    if (!data) {
      throw new NotFoundError('User', id, { includeDeactivated })
    }

    return data
  },
  'SELECT',
  TABLE
)

/**
 * Get user by email
 */
export function getUserByEmail(email, includeDeactivated = false) {
  return withErrorHandling(
    async () => {
      const userRepository = getUserRepository()

      // FAIL FAST - Validate email parameter
      if (!email) {
        throw new BadRequestError('Email is required', { email })
      }

      if (typeof email !== 'string') {
        throw new BadRequestError('Email must be a string', { email, type: typeof email })
      }

      // FAIL FAST - Basic email format validation
      if (!email.includes('@') || !email.includes('.')) {
        throw new ValidationError('Invalid email format', {
          field: 'email',
          value: email,
          rule: 'valid email format required'
        })
      }

      // Use repository to get user by email
      const data = await userRepository.findByEmail(email, includeDeactivated)

      if (!data) {
        throw new NotFoundError('User', email, { email, includeDeactivated })
      }

      return data
    },
    `getUserByEmail(${email})`,
    { email, includeDeactivated }
  )
}

/**
 * Get users by intelligent filter (role, state, email-verified)
 * This is the smart filter function - combines multiple criteria
 */
export function getUsersByFilter(filters = {}) {
  return withErrorHandling(
    async () => {
      const userRepository = getUserRepository()

      // FAIL FAST - Require at least one filter
      if (!filters.role && filters.state === undefined && filters.email_verified === undefined) {
        throw new BadRequestError(
          'At least one filter must be specified: role, state, or email_verified',
          {
            providedFilters: Object.keys(filters),
            rule: 'filter required'
          }
        )
      }

      // FAIL FAST - Require explicit pagination parameters
      if (filters.limit === undefined || filters.offset === undefined) {
        throw new BadRequestError('Pagination parameters limit and offset are required', {
          limit: filters.limit,
          offset: filters.offset,
          rule: 'Both limit and offset must be provided'
        })
      }

      // Validate pagination parameters
      if (typeof filters.limit !== 'number' || filters.limit <= 0 || filters.limit > 100) {
        throw new BadRequestError('Invalid limit: must be a positive number <= 100', {
          limit: filters.limit,
          rule: 'positive number <= 100 required'
        })
      }

      if (typeof filters.offset !== 'number' || filters.offset < 0) {
        throw new BadRequestError('Invalid offset: must be a non-negative number', {
          offset: filters.offset,
          rule: 'non-negative number required'
        })
      }

      // Prepare repository filters
      const repositoryFilters = {}
      if (filters.role && VALID_ROLES.includes(filters.role)) {
        repositoryFilters.role = filters.role
      }
      if (filters.state !== undefined) {
        repositoryFilters.active = filters.state
      }
      if (filters.email_verified !== undefined) {
        repositoryFilters.email_verified = filters.email_verified
      }

      // Use repository to get users with filters
      const data = await userRepository.findAll(repositoryFilters, {
        limit: filters.limit,
        offset: filters.offset,
        orderBy: 'created_at',
        ascending: false
      })

      if (!data) {
        throw new NotFoundError('Users', null)
      }

      return data
    },
    'getUsersByFilter',
    { filters }
  )
}

/**
 * Create new user (client registration - no password required)
 */
export function createUser(userData) {
  return withErrorHandling(
    async () => {
      const userRepository = getUserRepository()

      // Validate required fields for client registration
      if (!userData.email || typeof userData.email !== 'string') {
        throw new ValidationError('Email is required and must be a string', {
          field: 'email',
          value: userData.email,
          rule: 'required string'
        })
      }

      // Validate email format (simple check - no regex as requested)
      if (!userData.email.includes('@') || !userData.email.includes('.')) {
        throw new ValidationError('Invalid email format', {
          field: 'email',
          value: userData.email,
          rule: 'valid email format required'
        })
      }

      // For client registration, password is optional
      // For admin creation, password is required
      if (userData.role === 'admin' && !userData.password_hash) {
        throw new ValidationError('Password is required for admin users', {
          field: 'password_hash',
          rule: 'required for admin role'
        })
      }

      // Validate role if provided
      if (userData.role && !VALID_ROLES.includes(userData.role)) {
        throw new ValidationError(`Invalid role: must be one of ${VALID_ROLES.join(', ')}`, {
          field: 'role',
          value: userData.role,
          validValues: VALID_ROLES
        })
      }

      // FAIL FAST - Explicit field requirements
      const newUser = {
        email: userData.email,
        full_name: userData.full_name ?? null,
        phone: userData.phone ?? null,
        role: userData.role ?? 'user',
        password_hash: userData.password_hash ?? null,
        active: true,
        email_verified: userData.email_verified ?? false
      }

      // Use repository's create method
      const data = await userRepository.create(newUser)

      return data
    },
    'createUser',
    { email: userData.email }
  )
}

/**
 * Update user
 */
export function updateUser(id, updates) {
  return withErrorHandling(
    async () => {
      const userRepository = getUserRepository()

      validateUserId(id, 'updateUser')

      if (!updates || Object.keys(updates).length === 0) {
        throw new BadRequestError('No updates provided', { userId: id })
      }

      // Validate role if being updated
      if (updates.role && !VALID_ROLES.includes(updates.role)) {
        throw new ValidationError(`Invalid role: must be one of ${VALID_ROLES.join(', ')}`, {
          field: 'role',
          value: updates.role,
          validValues: VALID_ROLES
        })
      }

      // Use repository's update method
      const data = await userRepository.update(id, updates)

      return data
    },
    `updateUser(${id})`,
    { userId: id }
  )
}

/**
 * Soft-delete user
 */
export function deleteUser(id) {
  return withErrorHandling(
    async () => {
      const userRepository = getUserRepository()

      validateUserId(id, 'deleteUser')

      // Use repository's delete method (soft-delete)
      const data = await userRepository.delete(id)

      return data
    },
    `deleteUser(${id})`,
    { userId: id }
  )
}

/**
 * Reactivate user (undo soft-delete)
 * @param {number} id - User ID to reactivate
 * @returns {Promise<Object>} Reactivated user data
 */
export function reactivateUser(id) {
  return withErrorHandling(
    async () => {
      const userRepository = getUserRepository()

      validateUserId(id, 'reactivateUser')

      // Use repository's reactivate method
      const data = await userRepository.reactivate(id)

      return data
    },
    `reactivateUser(${id})`,
    { userId: id }
  )
}

/**
 * Verify user email
 * @param {number} id - User ID to verify email for
 * @returns {Promise<Object>} Updated user data with verified email
 */
export function verifyUserEmail(id) {
  return withErrorHandling(
    async () => {
      const userRepository = getUserRepository()

      validateUserId(id, 'verifyUserEmail')

      // Use repository's verifyEmail method
      const data = await userRepository.verifyEmail(id)

      return data
    },
    `verifyUserEmail(${id})`,
    { userId: id }
  )
}
