/**
 * Procesado por B
 */
// @ts-nocheck

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

  // Check if it's a valid string number
  let numValue
  if (typeof amount === 'string') {
    // Check for empty string first
    if (amount.trim() === '') {
      return `${fieldName} debe ser un número válido`
    }

    numValue = parseFloat(amount)
  } else {
    numValue = amount
  }

  // Check if it's a valid number
  if (typeof numValue !== 'number' || isNaN(numValue) || !isFinite(numValue)) {
    return `${fieldName} debe ser un número válido`
  }

  // Check for reasonable decimal places (max 2) BEFORE checking business limits
  // Handle floating point precision correctly by checking if the numeric value
  // would have more than 2 decimal places when rounded to 2
  const roundedTo2Decimals = Math.round(numValue * 100) / 100
  const hasMoreThan2Decimals = numValue !== roundedTo2Decimals

  if (hasMoreThan2Decimals) {
    return `${fieldName} no puede tener más de 2 decimales`
  }

  // Check business limits validation
  if (numValue < BUSINESS_LIMITS.minOrderAmount) {
    return `${fieldName} debe ser al menos $${BUSINESS_LIMITS.minOrderAmount}`
  }

  if (numValue > BUSINESS_LIMITS.maxOrderAmount) {
    return `${fieldName} no puede exceder $${BUSINESS_LIMITS.maxOrderAmount}`
  }

  return null
}

/**
 * Advanced text length validation with specific limits
 */
export function validateTextLength(text, fieldName, minLength = 1, maxLength = 255) {
  if (text === null || text === undefined || typeof text !== 'string') {
    return `${fieldName} es requerido`
  }

  // Check for length first before whitespace validation
  if (text.length < minLength) {
    return `${fieldName} debe tener al menos ${minLength} caracteres`
  }

  // Check for whitespace-only strings only after length validation
  if (text.trim().length === 0) {
    return `${fieldName} no puede estar vacío`
  }

  if (text.length > maxLength) {
    return `${fieldName} no puede exceder ${maxLength} caracteres`
  }

  return null
}

/**
 * Advanced address validation for Venezuelan context
 */
export function validateVenezuelanAddress(address) {
  if (address === null || address === undefined || typeof address !== 'string') {
    return 'Dirección es requerido'
  }

  // Check length first for truly empty string, but not for whitespace-only strings
  // Empty string ('') vs whitespace-only string ('   ') - different error priorities
  if (address === '') {
    return 'Dirección debe tener al menos 5 caracteres'
  } else if (address.trim().length === 0) {
    // Whitespace-only string should get whitespace error
    return 'Dirección no puede estar vacía'
  }

  // Then check length requirements for actual content
  if (address.length < 5) {
    return 'Dirección debe tener al menos 5 caracteres'
  }

  // Check max length
  if (address.length > BUSINESS_LIMITS.maxAddressLength) {
    return 'Dirección no puede exceder ' + BUSINESS_LIMITS.maxAddressLength + ' caracteres'
  }

  return null
}
