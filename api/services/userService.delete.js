/**
 * Procesado por B
 */

/**
 * User Service - Delete Operations
 * Handles user soft-delete and reactivation operations
 * LEGACY: Modularizado desde userService.js (WEEK 4)
 */

import { getUserRepository, withErrorHandling, validateUserId } from './userService.helpers.js'

/**
 * Soft-delete user
 */
export function deleteUser(id) {
  return withErrorHandling(
    async () => {
      const userRepository = await getUserRepository()

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
      const userRepository = await getUserRepository()

      validateUserId(id, 'reactivateUser')

      // Use repository's reactivate method
      const data = await userRepository.reactivate(id)

      return data
    },
    `reactivateUser(${id})`,
    { userId: id }
  )
}
