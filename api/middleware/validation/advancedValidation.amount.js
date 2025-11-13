/**
 * Advanced Validation - Amount & Text Validation
 * LEGACY: Modularized from advancedValidation.js (Phase 6)
 */

import { BUSINESS_LIMITS } from './advancedValidation.helpers.js'

/**
 * Advanced amount validation with business rules
 */
export function validateAmount(amount, fieldName = 'monto') {
  if (amount === null || amount === undefined) {
    return `${fieldName} es requerido`
  }

  const numValue = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numValue)) {
    return `${fieldName} debe ser un número válido`
  }

  if (numValue < BUSINESS_LIMITS.minOrderAmount) {
    return `${fieldName} debe ser al menos $${BUSINESS_LIMITS.minOrderAmount}`
  }

  if (numValue > BUSINESS_LIMITS.maxOrderAmount) {
    return `${fieldName} no puede exceder $${BUSINESS_LIMITS.maxOrderAmount}`
  }

  // Check for reasonable decimal places (max 2)
  if (numValue !== Math.round(numValue * 100) / 100) {
    return `${fieldName} no puede tener más de 2 decimales`
  }

  return null
}

/**
 * Advanced text length validation with specific limits
 */
export function validateTextLength(text, fieldName, minLength = 1, maxLength = 255) {
  if (!text || typeof text !== 'string') {
    return `${fieldName} es requerido`
  }

  if (text.length < minLength) {
    return `${fieldName} debe tener al menos ${minLength} caracteres`
  }

  if (text.length > maxLength) {
    return `${fieldName} no puede exceder ${maxLength} caracteres`
  }

  // Check for suspicious content
  if (text.trim().length === 0) {
    return `${fieldName} no puede estar vacío`
  }

  return null
}

/**
 * Advanced address validation for Venezuelan context
 */
export function validateVenezuelanAddress(address) {
  const error = validateTextLength(address, 'Dirección', 5, BUSINESS_LIMITS.maxAddressLength)
  if (error) {
    return error
  }

  // Basic validation - just ensure it's not empty or whitespace
  if (address.trim().length === 0) {
    return 'Dirección no puede estar vacía'
  }

  return null
}
