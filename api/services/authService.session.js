/**
 * Procesado por B
 */

/**
 * Auth Service - Session Operations
 * Handles token refresh, session management
 * LEGACY: Modularizado desde authService.js (PHASE 6)
 */

import { supabase } from './supabaseClient.js'
import { UnauthorizedError, DatabaseError, BadRequestError } from './authService.helpers.js'

/**
 * Refresh access token
 * @param {string} refreshToken - User's refresh token
 * @returns {Object} { user, session }
 * @throws {BadRequestError} If refresh token is invalid
 * @throws {UnauthorizedError} If refresh fails
 * @throws {DatabaseError} If operation fails
 */
export async function refreshToken(refreshToken) {
  try {
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required', {})
    }

    // Supabase Auth refresh token
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    })

    if (error) {
      if (error.message.includes('Invalid refresh token')) {
        throw new UnauthorizedError('Invalid refresh token', {})
      }
      throw new DatabaseError('REFRESH', 'auth.users', error, {})
    }

    if (!data.session) {
      throw new UnauthorizedError('Failed to refresh session', {})
    }

    return {
      user: data.user,
      session: data.session
    }
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error('refreshToken failed:', error)
    throw error
  }
}
