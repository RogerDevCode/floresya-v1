/**
 * Procesado por B
 */

/**
 * User Service - Verification Operations
 * Handles user verification operations
 * LEGACY: Modularizado desde userService.js (WEEK 4)
 */

import { getUserRepository, withErrorHandling, validateUserId } from './userService.helpers.js'

/**
 * Verify user email
 * @param {number} id - User ID to verify email for
 * @returns {Promise<Object>} Updated user data with verified email
 */
export function verifyUserEmail(id) {
  return withErrorHandling(
    async () => {
      const userRepository = await getUserRepository()

      validateUserId(id, 'verifyUserEmail')

      // Use repository's verifyEmail method
      const data = await userRepository.verifyEmail(id)

      return data
    },
    `verifyUserEmail(${id})`,
    { userId: id }
  )
}
