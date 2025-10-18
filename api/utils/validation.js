/**
 * Validation Utilities
 * Centralized validation patterns and rules following SSOT principle
 * ENTERPRISE FAIL-FAST: All validations throw specific errors
 */

import { ValidationError } from '../errors/AppError.js'

/**
 * Email validation pattern
 * @type {RegExp}
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Venezuelan phone prefixes
 * @type {string[]}
 */
export const VENEZUELAN_PHONE_PREFIXES = ['0412', '0414', '0416', '0424', '0426']

/**
 * Payment method display names
 * @type {Object}
 */
export const PAYMENT_METHOD_DISPLAY_NAMES = {
  cash: 'Efectivo',
  mobile_payment: 'Pago Móvil',
  bank_transfer: 'Transferencia Bancaria',
  zelle: 'Zelle',
  crypto: 'Criptomonedas'
}

/**
 * Validate email format (FAIL-FAST)
 * @param {string} email - Email to validate
 * @throws {ValidationError} When email format is invalid
 */
export function validateEmail(email) {
  if (!email) {
    throw new ValidationError('Email is required', { field: 'email' })
  }

  if (typeof email !== 'string') {
    throw new ValidationError('Email must be a string', {
      field: 'email',
      value: email,
      type: typeof email
    })
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new ValidationError('Invalid email format', {
      field: 'email',
      value: email,
      rule: 'valid email format required'
    })
  }
}

/**
 * Validate Venezuelan phone number format (FAIL-FAST)
 * @param {string} phone - Phone number to validate
 * @throws {ValidationError} When phone format is invalid
 */
export function validateVenezuelanPhone(phone) {
  if (!phone) {
    throw new ValidationError('Phone number is required', { field: 'phone' })
  }

  if (typeof phone !== 'string') {
    throw new ValidationError('Phone must be a string', {
      field: 'phone',
      value: phone,
      type: typeof phone
    })
  }

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')

  // Check if it starts with 0 and has 10 digits, or starts with 58 and has 12 digits
  const isValidFormat =
    (digits.startsWith('0') && digits.length === 10) ||
    (digits.startsWith('58') && digits.length === 12) ||
    (digits.length === 10 && VENEZUELAN_PHONE_PREFIXES.some(prefix => digits.startsWith(prefix)))

  if (!isValidFormat) {
    throw new ValidationError('Invalid Venezuelan phone number format', {
      field: 'phone',
      value: phone,
      rule: 'must be valid Venezuelan format (0412xxxxxxx, 0414xxxxxxx, etc.)'
    })
  }
}

/**
 * Get payment method display name (FAIL-FAST)
 * @param {string} method - Payment method code
 * @returns {string} Display name
 * @throws {ValidationError} When payment method is invalid
 */
export function getPaymentMethodDisplayName(method) {
  if (!method) {
    throw new ValidationError('Payment method is required', { field: 'payment_method' })
  }

  if (typeof method !== 'string') {
    throw new ValidationError('Payment method must be a string', {
      field: 'payment_method',
      value: method,
      type: typeof method
    })
  }

  const displayName = PAYMENT_METHOD_DISPLAY_NAMES[method]

  if (!displayName) {
    throw new ValidationError('Invalid payment method', {
      field: 'payment_method',
      value: method,
      validMethods: Object.keys(PAYMENT_METHOD_DISPLAY_NAMES)
    })
  }

  return displayName
}
