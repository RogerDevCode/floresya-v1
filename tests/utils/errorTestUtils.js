/**
 * Error Testing Utilities
 * Standardized expectations for error responses based on RFC 7807 and industry best practices
 */

import {
  getErrorCategory,
  isValidationError,
  isAuthError,
  isNotFoundError,
  isBusinessError,
  isServerError
} from '../../api/config/errorCodes.js'

/**
 * Expected error response structure
 * Based on RFC 7807 + FloresYa conventions
 */
export const EXPECTED_ERROR_RESPONSE = {
  success: false,
  error: expect.any(String),
  code: expect.any(Number),
  category: expect.stringMatching(/^(validation|authentication|not_found|business|server)$/),
  message: expect.any(String),
  timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
}

/**
 * Validate complete error response structure
 * @param {Object} response - Error response to validate
 */
export function validateErrorResponse(response) {
  expect(response).toMatchObject(EXPECTED_ERROR_RESPONSE)
}

/**
 * Validate error belongs to specific category
 * @param {Object} error - Error object
 * @param {string} expectedCategory - Expected category
 */
export function validateErrorCategory(error, expectedCategory) {
  const response = error.toJSON()
  expect(response.category).toBe(expectedCategory)
  expect(getErrorCategory(error.code)).toBe(expectedCategory)
}

/**
 * Validate error code is numeric and valid
 * @param {Object} error - Error object
 * @param {number} expectedCode - Expected error code
 */
export function validateErrorCode(error, expectedCode) {
  expect(typeof error.code).toBe('number')
  expect(error.code).toBe(expectedCode)
}

/**
 * Validate HTTP status code mapping
 * @param {Object} error - Error object
 * @param {number} expectedStatus - Expected HTTP status code
 */
export function validateHttpStatus(error, expectedStatus) {
  expect(error.statusCode).toBe(expectedStatus)
  expect(error.status).toBe(expectedStatus.toString().startsWith('4') ? 'fail' : 'error')
}

/**
 * Validate error is operational (expected) vs programming error
 * @param {Object} error - Error object
 * @param {boolean} expectedOperational - Expected operational flag
 */
export function validateErrorType(error, expectedOperational = true) {
  expect(error.isOperational).toBe(expectedOperational)
}

/**
 * Validate error has severity level
 * @param {Object} error - Error object
 * @param {string} expectedSeverity - Expected severity
 */
export function validateErrorSeverity(error, expectedSeverity) {
  expect(['low', 'medium', 'high', 'critical']).toContain(error.severity)
  expect(error.severity).toBe(expectedSeverity)
}

/**
 * Validate validation error structure
 * @param {Object} error - Error object
 */
export function validateValidationError(error) {
  expect(error.name).toBe('ValidationError')
  expect(isValidationError(error.code)).toBe(true)
  validateHttpStatus(error, 400)
  expect(error.context).toHaveProperty('validationErrors')
}

/**
 * Validate not found error structure
 * @param {Object} error - Error object
 */
export function validateNotFoundError(error) {
  expect(error.name).toBe('NotFoundError')
  expect(isNotFoundError(error.code)).toBe(true)
  validateHttpStatus(error, 404)
  expect(error.context).toHaveProperty('resource')
  expect(error.context).toHaveProperty('id')
}

/**
 * Validate authentication error structure
 * @param {Object} error - Error object
 */
export function validateAuthError(error) {
  expect(isAuthError(error.code)).toBe(true)
  validateHttpStatus(error, 401)
  expect(['UnauthorizedError', 'ForbiddenError']).toContain(error.name)
}

/**
 * Validate business logic error structure
 * @param {Object} error - Error object
 */
export function validateBusinessError(error) {
  expect(isBusinessError(error.code)).toBe(true)
  expect([400, 409, 422]).toContain(error.statusCode)
}

/**
 * Validate server error structure
 * @param {Object} error - Error object
 */
export function validateServerError(error) {
  expect(isServerError(error.code)).toBe(true)
  validateHttpStatus(error, 500)
  expect(error.isOperational).toBe(false)
}

/**
 * Create matcher for error responses
 * Useful for Jest/Vitest custom matchers
 */
export const customMatchers = {
  toBeValidError() {
    return {
      compare(error) {
        const response = error.toJSON()
        const isValid =
          response.success === false &&
          typeof response.error === 'string' &&
          typeof response.code === 'number' &&
          typeof response.message === 'string' &&
          typeof response.timestamp === 'string'

        return {
          pass: isValid,
          message: () => `Expected error to have valid response structure`
        }
      }
    }
  },

  toHaveErrorCode(expectedCode) {
    return {
      compare(error, _expectedCode) {
        const pass = error.code === expectedCode
        return {
          pass,
          message: () => `Expected error code ${expectedCode}, got ${error.code}`
        }
      }
    }
  },

  toBeValidationError() {
    return {
      compare(error) {
        const pass = isValidationError(error.code) && error.statusCode === 400
        return {
          pass,
          message: () => `Expected validation error (code 1xxx, status 400)`
        }
      }
    }
  }
}

/**
 * Mock error factory for testing
 * Creates standardized errors for test scenarios
 */
export const ErrorFactory = {
  /**
   * Create a validation error with standard structure
   */
  validation(field, message) {
    const { ValidationError } = require('../../api/errors/AppError.js')
    return new ValidationError('Validation failed', { [field]: [message] })
  },

  /**
   * Create a not found error with standard structure
   */
  notFound(resource, id) {
    const { NotFoundError } = require('../../api/errors/AppError.js')
    return new NotFoundError(resource, id)
  },

  /**
   * Create an auth error with standard structure
   */
  auth(message = 'Unauthorized') {
    const { UnauthorizedError } = require('../../api/errors/AppError.js')
    return new UnauthorizedError(message)
  },

  /**
   * Create a business logic error with standard structure
   */
  business(message) {
    const { ConflictError } = require('../../api/errors/AppError.js')
    return new ConflictError(message)
  },

  /**
   * Create a server error with standard structure
   */
  server(message = 'Internal server error') {
    const { InternalServerError } = require('../../api/errors/AppError.js')
    return new InternalServerError(message)
  }
}

/**
 * Quick validators for common error types
 * These are convenience functions that combine multiple validations
 */
export const QuickValidators = {
  validateAuthError(error) {
    validateAuthError(error)
  },

  validateServerError(error) {
    validateServerError(error)
  }
}

/**
 * Test helper: Assert all error properties exist
 * @param {Object} error - Error to test
 * @param {Object} options - Test options
 */
export function assertErrorProperties(error, options = {}) {
  const {
    expectedName,
    expectedCode,
    expectedStatus,
    expectedCategory,
    expectedOperational = true
  } = options

  // Basic properties
  expect(error).toHaveProperty('name')
  expect(error).toHaveProperty('message')
  expect(error).toHaveProperty('code')
  expect(error).toHaveProperty('statusCode')
  expect(error).toHaveProperty('status')
  expect(error).toHaveProperty('isOperational')
  expect(error).toHaveProperty('context')
  expect(error).toHaveProperty('userMessage')
  expect(error).toHaveProperty('timestamp')
  expect(error).toHaveProperty('severity')

  // Optional validations
  if (expectedName) {
    expect(error.name).toBe(expectedName)
  }
  if (expectedCode) {
    expect(error.code).toBe(expectedCode)
  }
  if (expectedStatus) {
    expect(error.statusCode).toBe(expectedStatus)
  }
  if (expectedCategory) {
    expect(getErrorCategory(error.code)).toBe(expectedCategory)
  }
  if (typeof expectedOperational === 'boolean') {
    expect(error.isOperational).toBe(expectedOperational)
  }
}

/**
 * Test helper: Validate error toJSON output
 * @param {Object} error - Error to test
 * @param {Object} options - Test options
 */
export function assertErrorJSON(error, options = {}) {
  const json = error.toJSON()

  // Required fields
  expect(json).toHaveProperty('success', false)
  expect(json).toHaveProperty('error')
  expect(json).toHaveProperty('code')
  expect(json).toHaveProperty('category')
  expect(json).toHaveProperty('message')
  expect(json).toHaveProperty('timestamp')

  // Types
  expect(typeof json.success).toBe('boolean')
  expect(typeof json.error).toBe('string')
  expect(typeof json.code).toBe('number')
  expect(typeof json.category).toBe('string')
  expect(typeof json.message).toBe('string')
  expect(typeof json.timestamp).toBe('string')

  // Optional fields
  if (options.expectedDetails) {
    expect(json).toHaveProperty('details')
  }
  if (options.expectedContext) {
    expect(json).toHaveProperty('details')
  }
}

/**
 * Constants for easy test reuse
 */
export const ERROR_TEST_CONSTANTS = {
  VALIDATION_ERROR_CODES: {
    VALIDATION_FAILED: 1001,
    INVALID_INPUT: 1002,
    MISSING_REQUIRED_FIELD: 1003,
    INVALID_EMAIL_FORMAT: 1004,
    PASSWORD_TOO_WEAK: 1005
  },
  AUTH_ERROR_CODES: {
    UNAUTHORIZED: 2001,
    INVALID_TOKEN: 2002,
    TOKEN_EXPIRED: 2003,
    FORBIDDEN: 2004
  },
  NOT_FOUND_ERROR_CODES: {
    RESOURCE_NOT_FOUND: 3001,
    USER_NOT_FOUND: 3002,
    PRODUCT_NOT_FOUND: 3003,
    ORDER_NOT_FOUND: 3004
  },
  BUSINESS_ERROR_CODES: {
    INSUFFICIENT_STOCK: 4001,
    PAYMENT_FAILED: 4002,
    ORDER_CANNOT_BE_PROCESSED: 4003,
    INVALID_STATE_TRANSITION: 4004
  },
  SERVER_ERROR_CODES: {
    INTERNAL_SERVER_ERROR: 5001,
    DATABASE_ERROR: 5002,
    EXTERNAL_SERVICE_ERROR: 5003,
    SERVICE_UNAVAILABLE: 5004
  }
}
