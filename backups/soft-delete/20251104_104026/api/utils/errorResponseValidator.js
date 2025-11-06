/**
 * Error Response Validator
 * Validates that error responses comply with RFC 7807 + FloresYa standards
 */

import {
  ERROR_CODES,
  getErrorCategory,
  isValidationError,
  isAuthError,
  isNotFoundCode,
  isBusinessError,
  isServerError
} from '../config/errorCodes.js'

/**
 * Validate complete error response
 * @param {Object} response - Error response to validate
 * @returns {Object} Validation result
 */
export function validateErrorResponse(response) {
  const violations = []

  // Required fields (RFC 7807 + FloresYa)
  const requiredFields = ['success', 'error', 'code', 'message']
  requiredFields.forEach(field => {
    if (!(field in response)) {
      violations.push(`Missing required field: ${field}`)
    }
  })

  // RFC 7807 required fields
  const rfc7807Fields = ['type', 'title', 'status', 'detail', 'instance']
  rfc7807Fields.forEach(field => {
    if (!(field in response)) {
      violations.push(`Missing RFC 7807 field: ${field}`)
    }
  })

  // Type validation
  if (response.success !== false) {
    violations.push('success must be false for errors')
  }

  if (typeof response.error !== 'string') {
    violations.push('error must be a string')
  }

  if (typeof response.code !== 'number') {
    violations.push('code must be a number')
  }

  if (typeof response.message !== 'string') {
    violations.push('message must be a string')
  }

  if (typeof response.type !== 'string') {
    violations.push('type must be a string (RFC 7807)')
  }

  if (typeof response.title !== 'string') {
    violations.push('title must be a string (RFC 7807)')
  }

  if (typeof response.status !== 'number') {
    violations.push('status must be a number (RFC 7807)')
  }

  if (typeof response.detail !== 'string') {
    violations.push('detail must be a string (RFC 7807)')
  }

  if (typeof response.instance !== 'string') {
    violations.push('instance must be a string (RFC 7807)')
  }

  // Validate code is from ERROR_CODES
  const validCodes = Object.values(ERROR_CODES)
  if (!validCodes.includes(response.code)) {
    violations.push(`code ${response.code} is not in ERROR_CODES`)
  }

  // Validate category matches code
  const expectedCategory = getErrorCategory(response.code)
  if (response.category !== expectedCategory) {
    violations.push(`category ${response.category} doesn't match code ${response.code}`)
  }

  // Validate HTTP status code mapping
  if (isValidationError(response.code) && response.status !== 400) {
    violations.push('validation errors must have status 400')
  }

  if (isAuthError(response.code) && ![401, 403].includes(response.status)) {
    violations.push('auth errors must have status 401 or 403')
  }

  if (isNotFoundCode(response.code) && response.status !== 404) {
    violations.push('not found errors must have status 404')
  }

  if (isBusinessError(response.code) && ![400, 409, 422].includes(response.status)) {
    violations.push('business errors must have status 400, 409, or 422')
  }

  if (isServerError(response.code) && response.status < 500) {
    violations.push('server errors must have status >= 500')
  }

  // Validate type URL format
  if (!response.type.startsWith('https://api.floresya.com/errors/')) {
    violations.push('type must be a valid URL starting with https://api.floresya.com/errors/')
  }

  // Validate timestamp format (ISO 8601)
  const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
  if (!timestampRegex.test(response.timestamp)) {
    violations.push('timestamp must be in ISO 8601 format')
  }

  // For validation errors, check errors field
  if (isValidationError(response.code)) {
    if (!response.errors || typeof response.errors !== 'object') {
      violations.push('validation errors must include errors field with field-specific messages')
    }
  }

  // For not found errors, check resource context
  if (isNotFoundCode(response.code)) {
    if (!response.details || !response.details.resource) {
      violations.push('not found errors should include resource in details')
    }
  }

  // For server errors, ensure isOperational is false
  if (isServerError(response.code)) {
    if (response.isOperational !== false) {
      violations.push('server errors must have isOperational = false')
    }
  }

  return {
    isValid: violations.length === 0,
    violations
  }
}

/**
 * Validate error object (not response)
 * @param {Object} error - Error object to validate
 * @returns {Object} Validation result
 */
export function validateErrorObject(error) {
  const violations = []

  // Required properties
  const requiredProps = ['name', 'message', 'code', 'statusCode', 'status', 'isOperational']
  requiredProps.forEach(prop => {
    if (!(prop in error)) {
      violations.push(`Missing required property: ${prop}`)
    }
  })

  // Property types
  if (typeof error.code !== 'number') {
    violations.push('code must be a number')
  }

  if (typeof error.statusCode !== 'number') {
    violations.push('statusCode must be a number')
  }

  if (typeof error.isOperational !== 'boolean') {
    violations.push('isOperational must be a boolean')
  }

  // Validate status mapping
  const expectedStatus = error.statusCode.toString().startsWith('4') ? 'fail' : 'error'
  if (error.status !== expectedStatus) {
    violations.push(`status must be '${expectedStatus}' for statusCode ${error.statusCode}`)
  }

  // Validate code is valid
  const validCodes = Object.values(ERROR_CODES)
  if (!validCodes.includes(error.code)) {
    violations.push(`code ${error.code} is not in ERROR_CODES`)
  }

  return {
    isValid: violations.length === 0,
    violations
  }
}

/**
 * Validate error JSON serialization
 * @param {Object} error - Error object
 * @returns {Object} Validation result
 */
export function validateErrorJSON(error) {
  const json = error.toJSON()
  return validateErrorResponse(json)
}

/**
 * Batch validate multiple errors
 * @param {Array} errors - Array of errors to validate
 * @returns {Object} Validation results
 */
export function batchValidateErrors(errors) {
  const results = {
    total: errors.length,
    valid: 0,
    invalid: 0,
    violations: {}
  }

  errors.forEach((error, index) => {
    const result = validateErrorObject(error)
    if (result.isValid) {
      results.valid++
    } else {
      results.invalid++
      results.violations[index] = result.violations
    }
  })

  return results
}

/**
 * Create error response template
 * @param {string} category - Error category
 * @returns {Object} Error response template
 */
export function createErrorResponseTemplate(category) {
  const templates = {
    validation: {
      success: false,
      error: 'ValidationError',
      code: 1001,
      category: 'validation',
      type: 'https://api.floresya.com/errors/validation/validationfailed',
      title: 'Validation Failed',
      status: 400,
      detail: '',
      instance: '',
      message: 'Validation failed. Please check your input.',
      timestamp: new Date().toISOString(),
      errors: {}
    },
    authentication: {
      success: false,
      error: 'UnauthorizedError',
      code: 2001,
      category: 'authentication',
      type: 'https://api.floresya.com/errors/authentication/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: '',
      instance: '',
      message: 'Please log in to continue.',
      timestamp: new Date().toISOString()
    },
    not_found: {
      success: false,
      error: 'NotFoundError',
      code: 3001,
      category: 'not_found',
      type: 'https://api.floresya.com/errors/not_found/notfound',
      title: 'Resource Not Found',
      status: 404,
      detail: '',
      instance: '',
      message: 'The requested resource was not found.',
      timestamp: new Date().toISOString()
    },
    business: {
      success: false,
      error: 'ConflictError',
      code: 4006,
      category: 'business',
      type: 'https://api.floresya.com/errors/business/conflict',
      title: 'Conflict',
      status: 409,
      detail: '',
      instance: '',
      message: 'This operation conflicts with existing data.',
      timestamp: new Date().toISOString()
    },
    server: {
      success: false,
      error: 'InternalServerError',
      code: 5001,
      category: 'server',
      type: 'https://api.floresya.com/errors/server/internalerror',
      title: 'Internal Server Error',
      status: 500,
      detail: '',
      instance: '',
      message: 'An unexpected error occurred. Please try again later.',
      timestamp: new Date().toISOString()
    }
  }

  return templates[category]
}

/**
 * Get error compliance score
 * @param {Object} error - Error to validate
 * @returns {number} Compliance score (0-100)
 */
export function getErrorComplianceScore(error) {
  const json = error.toJSON()
  const result = validateErrorResponse(json)

  const totalChecks = 20 // Approximate number of checks
  const passedChecks = totalChecks - result.violations.length
  const score = Math.round((passedChecks / totalChecks) * 100)

  return Math.max(0, Math.min(100, score))
}

/**
 * Generate error compliance report
 * @param {Array} errors - Array of errors
 * @returns {Object} Compliance report
 */
export function generateErrorComplianceReport(errors) {
  const batchResult = batchValidateErrors(errors)
  const scores = errors.map(error => getErrorComplianceScore(error))
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

  return {
    totalErrors: errors.length,
    validErrors: batchResult.valid,
    invalidErrors: batchResult.invalid,
    averageComplianceScore: Math.round(averageScore),
    violationsByError: batchResult.violations,
    passed: batchResult.invalid === 0,
    message:
      batchResult.invalid === 0
        ? 'All errors comply with standards'
        : `${batchResult.invalid} errors have compliance violations`
  }
}

export default {
  validateErrorResponse,
  validateErrorObject,
  validateErrorJSON,
  batchValidateErrors,
  createErrorResponseTemplate,
  getErrorComplianceScore,
  generateErrorComplianceReport
}
