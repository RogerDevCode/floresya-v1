/**
 * User Service - Update Operations
 * Handles user update operations
 * LEGACY: Modularizado desde userService.js (WEEK 4)
 */

import {
  getUserRepository,
  withErrorHandling,
  BadRequestError,
  ValidationError,
  VALID_ROLES
} from './userService.helpers.js'

/**
 * Update user
 */
export function updateUser(id, updates) {
  return withErrorHandling(
    async () => {
      const userRepository = getUserRepository()

      if (!id || typeof id !== 'number') {
        throw new BadRequestError('Invalid user ID: must be a number', { userId: id })
      }

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
