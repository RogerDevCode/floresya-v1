/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Advanced Validation - Venezuelan Phone Validation
 * LEGACY: Modularized from advancedValidation.js (Phase 6)
 */

import { VENEZUELA_PHONE_PATTERNS } from './advancedValidation.helpers.js'

/**
 * Advanced Venezuelan phone validation
 * Accepts multiple formats: 04141234567, (+58)-414-7166388, +584141234567, etc.
 */
export function validateVenezuelanPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return 'Teléfono es requerido'
  }

  // Remove all non-digits for validation
  const digitsOnly = phone.replace(/\D/g, '')

  // Check for minimum length (at least 10 digits)
  if (digitsOnly.length < 10) {
    return 'Teléfono debe tener al menos 10 dígitos'
  }

  // Check for maximum reasonable length
  if (digitsOnly.length > 13) {
    return 'Teléfono tiene demasiados dígitos'
  }

  // Normalize to local format for validation
  let normalizedPhone = digitsOnly

  // If starts with 58 (Venezuela country code), remove it and add 0
  if (normalizedPhone.startsWith('58') && normalizedPhone.length >= 12) {
    normalizedPhone = '0' + normalizedPhone.substring(2)
  }

  // Ensure it starts with 0 for local format
  if (!normalizedPhone.startsWith('0') && normalizedPhone.length === 10) {
    // Already 10 digits, might be missing leading 0
    normalizedPhone = '0' + normalizedPhone
  }

  // Take only first 11 digits if longer (Venezuelan numbers are 11 digits with 0)
  if (normalizedPhone.length > 11) {
    normalizedPhone = normalizedPhone.substring(0, 11)
  }

  // Validate against Venezuelan patterns (0412, 0414, 0416, 0424, 0426, or 0212 landlines)
  if (
    !VENEZUELA_PHONE_PATTERNS.mobile.test(normalizedPhone) &&
    !VENEZUELA_PHONE_PATTERNS.landline.test(normalizedPhone)
  ) {
    return 'Número de teléfono venezolano inválido. Debe comenzar con 0412, 0414, 0416, 0424, 0426 o 0212'
  }

  return null
}
