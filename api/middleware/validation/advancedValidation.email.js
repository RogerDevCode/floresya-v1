/**
 * Advanced Validation - Email Validation
 * LEGACY: Modularized from advancedValidation.js (Phase 6)
 */

import { EMAIL_REGEX, VENEZUELA_EMAIL_DOMAINS } from './advancedValidation.helpers.js'

/**
 * Advanced email validation with Venezuelan domain support
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'Email es requerido'
  }

  if (email.length > 254) {
    return 'Email es demasiado largo (máximo 254 caracteres)'
  }

  if (!EMAIL_REGEX.test(email)) {
    return 'Formato de email inválido'
  }

  // Check for suspicious patterns
  const localPart = email.split('@')[0]
  if (localPart.length > 64) {
    return 'Parte local del email es demasiado larga'
  }

  // Warn about unusual but valid emails
  const domain = email.split('@')[1]?.toLowerCase()
  if (domain && !VENEZUELA_EMAIL_DOMAINS.some(valid => domain.includes(valid))) {
    console.warn(`Email con dominio no común: ${domain}`)
  }

  return null
}
