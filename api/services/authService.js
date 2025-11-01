/**
 * Authentication Service - DUAL-MODE
 * - Development: Bypassed (auto-inject mock user in middleware)
 * - Production: Real Supabase Auth with JWT verification
 * ENTERPRISE FAIL-FAST: Uses custom error classes with metadata
 */

import { supabase } from './supabaseClient.js'
import {
  UnauthorizedError,
  BadRequestError,
  ConflictError,
  DatabaseError,
  InternalServerError
} from '../errors/AppError.js'

/**
 * Sign up new user (PRODUCTION ONLY)
 * @param {string} email
 * @param {string} password
 * @param {Object} metadata - { full_name, phone }
 * @returns {Object} { user, session, message }
 * @throws {BadRequestError} If invalid input
 * @throws {ConflictError} If email already exists
 * @throws {DatabaseError} If signup fails
 */
export async function signUp(email, password, metadata = {}) {
  try {
    // Validation - FAIL FAST
    if (!email || typeof email !== 'string') {
      throw new BadRequestError('Email is required and must be a string', { email })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new BadRequestError('Invalid email format', { email })
    }

    if (!password || typeof password !== 'string') {
      throw new BadRequestError('Password is required and must be a string', {})
    }

    // STRONG PASSWORD POLICY
    if (password.length < 8) {
      throw new BadRequestError('Password must be at least 8 characters', {
        passwordLength: password.length,
        policy: 'min_length_8'
      })
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      throw new BadRequestError('Password must contain at least one uppercase letter', {
        policy: 'require_uppercase'
      })
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      throw new BadRequestError('Password must contain at least one lowercase letter', {
        policy: 'require_lowercase'
      })
    }

    // Check for at least one number
    if (!/[0-9]/.test(password)) {
      throw new BadRequestError('Password must contain at least one number', {
        policy: 'require_number'
      })
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)) {
      throw new BadRequestError('Password must contain at least one special character', {
        policy: 'require_special_char'
      })
    }

    // Supabase Auth signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.full_name || null,
          phone: metadata.phone || null,
          role: 'user' // Default role
        }
      }
    })

    if (error) {
      if (
        error.message.includes('already registered') ||
        error.message.includes('already exists')
      ) {
        throw new ConflictError('Email already registered', { email })
      }
      throw new DatabaseError('SIGNUP', 'auth.users', error, { email })
    }

    if (!data.user) {
      throw new DatabaseError('SIGNUP', 'auth.users', new InternalServerError('No user returned'), {
        email
      })
    }

    return {
      user: data.user,
      session: data.session,
      message: 'Check your email to verify your account'
    }
  } catch (error) {
    console.error(`signUp(${email}) failed:`, error)
    // Re-throw AppError instances as-is (fail-fast)
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    throw new DatabaseError('SIGNUP', 'auth.users', error, { email })
  }
}

/**
 * Sign in user (PRODUCTION ONLY)
 * @param {string} email
 * @param {string} password
 * @returns {Object} { user, session, accessToken, refreshToken }
 * @throws {BadRequestError} If invalid input
 * @throws {UnauthorizedError} If credentials invalid
 */
export async function signIn(email, password) {
  try {
    // Validation
    if (!email || typeof email !== 'string') {
      throw new BadRequestError('Email is required', { email })
    }

    if (!password || typeof password !== 'string') {
      throw new BadRequestError('Password is required', {})
    }

    // Supabase Auth signin
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new UnauthorizedError('Invalid email or password', { email })
    }

    if (!data.session) {
      throw new UnauthorizedError('Authentication failed', { email })
    }

    return {
      user: data.user,
      session: data.session,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token
    }
  } catch (error) {
    console.error(`signIn(${email}) failed:`, error)
    // Re-throw AppError instances as-is (fail-fast)
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    throw new DatabaseError('SIGNIN', 'auth.users', error, { email })
  }
}

/**
 * Sign out user (PRODUCTION ONLY)
 * @param {string} accessToken
 * @returns {Object} { message }
 * @throws {DatabaseError} If signout fails
 */
export async function signOut(accessToken) {
  try {
    const { error } = await supabase.auth.signOut(accessToken)

    if (error) {
      throw new DatabaseError('SIGNOUT', 'auth.users', error, {})
    }

    return { message: 'Signed out successfully' }
  } catch (error) {
    console.error('signOut failed:', error)
    // Re-throw AppError instances as-is (fail-fast)
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    throw new DatabaseError('SIGNOUT', 'auth.users', error, {})
  }
}

/**
 * Refresh access token (PRODUCTION ONLY)
 * @param {string} refreshToken
 * @returns {Object} { session, accessToken }
 * @throws {UnauthorizedError} If refresh token invalid
 */
export async function refreshToken(refreshToken) {
  try {
    const { data, error } = await supabase.auth.refreshSession({ refreshToken })

    if (error) {
      throw new UnauthorizedError('Invalid refresh token', {})
    }

    if (!data.session) {
      throw new UnauthorizedError('Failed to refresh token', {})
    }

    return {
      session: data.session,
      accessToken: data.session.access_token
    }
  } catch (error) {
    console.error('refreshToken failed:', error)
    // Re-throw AppError instances as-is (fail-fast)
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    throw new DatabaseError('REFRESH_TOKEN', 'auth.users', error, {})
  }
}

/**
 * Get user from access token (PRODUCTION ONLY)
 * Used by authenticate middleware in production mode
 * @param {string} accessToken
 * @returns {Object} user
 * @throws {UnauthorizedError} If token invalid or expired
 */
export async function getUser(accessToken) {
  try {
    const { data, error } = await supabase.auth.getUser(accessToken)

    if (error) {
      throw new UnauthorizedError('Invalid or expired token', {})
    }

    if (!data.user) {
      throw new UnauthorizedError('User not found', {})
    }

    return data.user
  } catch (error) {
    console.error('getUser failed:', error)
    // Re-throw AppError instances as-is (fail-fast)
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    throw new DatabaseError('GET_USER', 'auth.users', error, {})
  }
}

/**
 * Reset password request (PRODUCTION ONLY)
 * @param {string} email
 * @returns {Object} { message }
 * @throws {BadRequestError} If invalid input
 * @throws {DatabaseError} If operation fails
 */
export async function resetPassword(email) {
  try {
    if (!email || typeof email !== 'string') {
      throw new BadRequestError('Email is required', { email })
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`
    })

    if (error) {
      throw new DatabaseError('RESET_PASSWORD', 'auth.users', error, { email })
    }

    return {
      message: 'Password reset email sent. Check your inbox.'
    }
  } catch (error) {
    console.error(`resetPassword(${email}) failed:`, error)
    // Re-throw AppError instances as-is (fail-fast)
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    throw new DatabaseError('RESET_PASSWORD', 'auth.users', error, { email })
  }
}

/**
 * Update password (PRODUCTION ONLY)
 * @param {string} accessToken
 * @param {string} newPassword
 * @returns {Object} { message }
 * @throws {BadRequestError} If invalid input
 * @throws {UnauthorizedError} If token invalid
 * @throws {DatabaseError} If operation fails
 */
export async function updatePassword(accessToken, newPassword) {
  try {
    if (!newPassword || typeof newPassword !== 'string') {
      throw new BadRequestError('New password is required', {})
    }

    if (newPassword.length < 8) {
      throw new BadRequestError('Password must be at least 8 characters', {
        passwordLength: newPassword.length
      })
    }

    // Get user first to validate token
    await getUser(accessToken)

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw new DatabaseError('UPDATE_PASSWORD', 'auth.users', error, {})
    }

    return {
      message: 'Password updated successfully'
    }
  } catch (error) {
    console.error('updatePassword failed:', error)
    // Re-throw AppError instances as-is (fail-fast)
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    throw new DatabaseError('UPDATE_PASSWORD', 'auth.users', error, {})
  }
}
