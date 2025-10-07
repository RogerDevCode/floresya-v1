/**
 * Validators - SSOT for input validation
 * Fail-fast validation with descriptive errors
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {string} Trimmed email
 * @throws {Error} If invalid
 */
export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(email)) {
    throw new Error('Email inválido')
  }
  return email.trim()
}

/**
 * Validate phone number (Venezuelan format)
 * @param {string} phone - Phone to validate
 * @returns {string} Cleaned phone (digits only)
 * @throws {Error} If invalid
 */
export function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length < 10) {
    throw new Error('Teléfono debe tener al menos 10 dígitos')
  }
  return cleaned
}

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string} Trimmed value
 * @throws {Error} If empty
 */
export function validateRequired(value, fieldName) {
  if (!value || value.trim() === '') {
    throw new Error(`${fieldName} es requerido`)
  }
  return value.trim()
}

/**
 * Validate number (positive)
 * @param {number} value - Number to validate
 * @param {string} fieldName - Field name for error message
 * @returns {number} Valid number
 * @throws {Error} If invalid
 */
export function validatePositiveNumber(value, fieldName) {
  if (typeof value !== 'number' || value <= 0) {
    throw new Error(`${fieldName} debe ser un número positivo`)
  }
  return value
}
