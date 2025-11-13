/**
 * Validation Middleware - Helper Functions
 * LEGACY: Modularized from validate.js (Phase 6)
 */

/**
 * Helper: Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export { isValidEmail }
