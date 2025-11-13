/**
 * User Service - Create Operations
 * Handles user creation operations
 * LEGACY: Modularizado desde userService.js (WEEK 4)
 */

import {
  getUserRepository,
  withErrorHandling,
  VALID_ROLES,
  ValidationError
} from './userService.helpers.js'

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
