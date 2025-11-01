/**
 * ERROR CODES - Fuente de Verdad Centralizada
 * Basado en estándares de la industria (RFC 7807, JSON:API, Microsoft, Google)
 *
 * Formato: Códigos numéricos por categoría
 * - 1xxx: Validation Errors
 * - 2xxx: Authentication & Authorization
 * - 3xxx: Not Found Errors
 * - 4xxx: Business Logic Errors
 * - 5xxx: Server Errors
 */

export const ERROR_CODES = {
  // ========================================================================
  // 1xxx - VALIDATION ERRORS
  // ========================================================================
  VALIDATION_FAILED: 1001,
  INVALID_INPUT: 1002,
  MISSING_REQUIRED_FIELD: 1003,
  INVALID_EMAIL_FORMAT: 1004,
  PASSWORD_TOO_WEAK: 1005,
  INVALID_NUMBER_FORMAT: 1006,
  VALUE_OUT_OF_RANGE: 1007,
  INVALID_STRING_LENGTH: 1008,
  INVALID_ENUM_VALUE: 1009,
  INVALID_FILE_TYPE: 1010,

  // ========================================================================
  // 2xxx - AUTHENTICATION & AUTHORIZATION
  // ========================================================================
  UNAUTHORIZED: 2001,
  INVALID_TOKEN: 2002,
  TOKEN_EXPIRED: 2003,
  FORBIDDEN: 2004,
  INSUFFICIENT_PERMISSIONS: 2005,
  ACCOUNT_LOCKED: 2006,
  SESSION_EXPIRED: 2007,

  // ========================================================================
  // 3xxx - NOT FOUND ERRORS
  // ========================================================================
  RESOURCE_NOT_FOUND: 3001,
  USER_NOT_FOUND: 3002,
  PRODUCT_NOT_FOUND: 3003,
  ORDER_NOT_FOUND: 3004,
  PAYMENT_NOT_FOUND: 3005,

  // ========================================================================
  // 4xxx - BUSINESS LOGIC ERRORS
  // ========================================================================
  INSUFFICIENT_STOCK: 4001,
  PAYMENT_FAILED: 4002,
  ORDER_CANNOT_BE_PROCESSED: 4003,
  INVALID_STATE_TRANSITION: 4004,
  RESOURCE_ALREADY_EXISTS: 4005,
  RESOURCE_CONFLICT: 4006,

  // ========================================================================
  // 5xxx - SERVER ERRORS
  // ========================================================================
  INTERNAL_SERVER_ERROR: 5001,
  DATABASE_ERROR: 5002,
  EXTERNAL_SERVICE_ERROR: 5003,
  SERVICE_UNAVAILABLE: 5004,
  CONFIGURATION_ERROR: 5005,
  NETWORK_ERROR: 5006
}

/**
 * Helper function to check if error code is in a category
 */
export const isValidationError = code => code >= 1001 && code <= 1999
export const isAuthError = code => code >= 2001 && code <= 2999
export const isNotFoundError = code => code >= 3001 && code <= 3999
export const isBusinessError = code => code >= 4001 && code <= 4999
export const isServerError = code => code >= 5001 && code <= 5999

/**
 * Helper function to get HTTP status code from error code
 */
export const getHttpStatusCode = code => {
  if (isValidationError(code)) {
    return 400
  }
  if (isAuthError(code)) {
    if (code === 2001 || code === 2002 || code === 2003 || code === 2007) {
      return 401
    }
    return 403
  }
  if (isNotFoundError(code)) {
    return 404
  }
  if (isBusinessError(code)) {
    if (code === 4005 || code === 4006) {
      return 409 // Conflict
    }
    if (code === 4003) {
      return 422 // Unprocessable Entity
    }
    return 400
  }
  if (isServerError(code)) {
    return 500
  }
  return 500
}

/**
 * Helper function to categorize error
 */
export const getErrorCategory = code => {
  if (isValidationError(code)) {
    return 'validation'
  }
  if (isAuthError(code)) {
    return 'authentication'
  }
  if (isNotFoundError(code)) {
    return 'not_found'
  }
  if (isBusinessError(code)) {
    return 'business'
  }
  if (isServerError(code)) {
    return 'server'
  }
  return 'unknown'
}
