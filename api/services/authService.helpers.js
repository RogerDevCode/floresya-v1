/**
 * Auth Service - Helper Functions & Shared Imports
 * LEGACY: Modularizado desde authService.js (PHASE 6)
 */

import {
  UnauthorizedError,
  BadRequestError,
  ConflictError,
  DatabaseError,
  InternalServerError
} from '../errors/AppError.js'

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @throws {BadRequestError} If email is invalid
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new BadRequestError('Email is required and must be a string', { email })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new BadRequestError('Invalid email format', { email })
  }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @throws {BadRequestError} If password doesn't meet policy
 */
function validatePassword(password) {
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
}

export {
  validateEmail,
  validatePassword,
  UnauthorizedError,
  BadRequestError,
  ConflictError,
  DatabaseError,
  InternalServerError
}
