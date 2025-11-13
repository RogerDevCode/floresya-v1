/**
 * User Service - Read Operations
 * Handles all user retrieval operations
 * LEGACY: Modularizado desde userService.js (WEEK 4)
 */

import {
  getUserRepository,
  withErrorHandling,
  withErrorMapping,
  NotFoundError,
  BadRequestError,
  ValidationError,
  TABLE
} from './userService.helpers.js'

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

    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid user ID: must be a number', { userId: id })
    }

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

      // Use repository's filter method instead of direct supabase query
      const data = await userRepository.findByFilter(filters)

      return data
    },
    'getUsersByFilter',
    { filters }
  )
}
