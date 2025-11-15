/**
 * Procesado por B
 */

/**
 * Auth Service - Authentication Operations
 * Handles sign up, sign in, sign out operations
 * LEGACY: Modularizado desde authService.js (PHASE 6)
 */

import { supabase } from './supabaseClient.js'
import {
  validateEmail,
  validatePassword,
  ConflictError,
  DatabaseError,
  BadRequestError
} from './authService.helpers.js'

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
    validateEmail(email)
    validatePassword(password)

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

    return {
      user: data.user,
      session: data.session,
      message: 'User signed up successfully. Please check your email for verification.'
    }
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error('signUp failed:', error)
    throw error
  }
}

/**
 * Sign in user (PRODUCTION ONLY)
 * @param {string} email
 * @param {string} password
 * @returns {Object} { user, session, message }
 * @throws {BadRequestError} If invalid input
 * @throws {UnauthorizedError} If credentials are invalid
 * @throws {DatabaseError} If sign in fails
 */
export async function signIn(email, password) {
  try {
    // Validation - FAIL FAST
    validateEmail(email)

    if (!password || typeof password !== 'string') {
      throw new BadRequestError('Password is required', { email })
    }

    // Supabase Auth sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      if (
        error.message.includes('Invalid login credentials') ||
        error.message.includes('Invalid email or password')
      ) {
        throw new UnauthorizedError('Invalid email or password', { email })
      }
      throw new DatabaseError('SIGNIN', 'auth.users', error, { email })
    }

    return {
      user: data.user,
      session: data.session,
      message: 'User signed in successfully.'
    }
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error('signIn failed:', error)
    throw error
  }
}

/**
 * Sign out user
 * @param {string} accessToken - User's access token
 * @returns {Object} { message }
 * @throws {UnauthorizedError} If token is invalid
 * @throws {DatabaseError} If sign out fails
 */
export async function signOut(accessToken) {
  try {
    if (!accessToken) {
      throw new UnauthorizedError('Access token is required', {})
    }

    // Supabase Auth sign out
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new DatabaseError('SIGNOUT', 'auth.users', error, {})
    }

    return {
      message: 'User signed out successfully.'
    }
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error('signOut failed:', error)
    throw error
  }
}
