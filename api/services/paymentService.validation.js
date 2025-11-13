/**
 * Payment Service - Validation & Utilities
 * Handles validation and utility functions
 * LEGACY: Modularizado desde paymentService.js (PHASE 5)
 */

import { validateEmail, validateVenezuelanPhone } from '../utils/validation.js'

/**
 * Validate Venezuelan phone number format (FAIL-FAST version)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if phone number is valid Venezuelan format
 * @throws {ValidationError} When phone format is invalid
 * @example
 * isValidVenezuelanPhone('04141234567') // Returns: true
 * isValidVenezuelanPhone('584141234567') // Returns: true
 * isValidVenezuelanPhone('123456789') // Throws ValidationError
 */
export function isValidVenezuelanPhone(phone) {
  try {
    validateVenezuelanPhone(phone)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 * Validate email format using regex pattern (FAIL-FAST version)
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email format is valid
 * @throws {ValidationError} When email format is invalid
 * @example
 * isValidEmail('user@example.com') // Returns: true
 * isValidEmail('invalid-email') // Returns: false
 */
export function isValidEmail(email) {
  try {
    validateEmail(email)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 * Generate unique order reference with timestamp and random component
 * @returns {string} - Unique order reference in format FY-{timestamp}{random}
 * @example
 * generateOrderReference() // Returns: 'FY-123456789'
 */
export function generateOrderReference() {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `FY-${timestamp}${random}`
}
