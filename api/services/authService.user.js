/**
 * Procesado por B
 */

/**
 * Auth Service - User Operations
 * Handles user retrieval, password reset, password update
 * LEGACY: Modularizado desde authService.js (PHASE 6)
 */

import { supabase } from './supabaseClient.js'
import {
  UnauthorizedError,
  DatabaseError,
  validateEmail,
  validatePassword
} from './authService.helpers.js'

/**
 * Get user by access token
 * @param {string} accessToken - User's access token
 * @returns {Object} user
 * @throws {UnauthorizedError} If token is invalid or expired
 * @throws {DatabaseError} If operation fails
 */
export async function getUser(accessToken) {
  try {
    if (!accessToken) {
      throw new UnauthorizedError('Access token is required', {})
    }

    // Supabase Auth get user
    const { data, error } = await supabase.auth.getUser(accessToken)

    if (error) {
      if (error.message.includes('Invalid JWT') || error.message.includes('expired')) {
        throw new UnauthorizedError('Invalid or expired token', {})
      }
      throw new DatabaseError('GET_USER', 'auth.users', error, {})
    }

    if (!data.user) {
      throw new UnauthorizedError('User not found', {})
    }

    return data.user
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error('getUser failed:', error)
    throw error
  }
}

/**
 * Reset password (send reset email)
 * @param {string} email
 * @returns {Object} { message }
 * @throws {BadRequestError} If email is invalid
 * @throws {DatabaseError} If operation fails
 */
export async function resetPassword(email) {
  try {
    // Validation - FAIL FAST
    validateEmail(email)

    // Supabase Auth reset password
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      throw new DatabaseError('RESET_PASSWORD', 'auth.users', error, { email })
    }

    return {
      message: 'Password reset email sent. Please check your email.'
    }
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error('resetPassword failed:', error)
    throw error
  }
}

/**
 * Update password (when user is authenticated)
 * @param {string} accessToken - User's access token
 * @param {string} newPassword - New password
 * @returns {Object} { message }
 * @throws {UnauthorizedError} If token is invalid
 * @throws {BadRequestError} If password is invalid
 * @throws {DatabaseError} If operation fails
 */
export async function updatePassword(accessToken, newPassword) {
  try {
    if (!accessToken) {
      throw new UnauthorizedError('Access token is required', {})
    }

    // Validation - FAIL FAST
    validatePassword(newPassword)

    // Supabase Auth update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw new DatabaseError('UPDATE_PASSWORD', 'auth.users', error, {})
    }

    return {
      message: 'Password updated successfully.'
    }
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error('updatePassword failed:', error)
    throw error
  }
}
