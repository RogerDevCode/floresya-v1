/**
 * Standardized Error Testing Examples
 * Demonstrates best practices for error testing based on RFC 7807 and industry standards
 */

import { describe, it, expect } from 'vitest'
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  InternalServerError,
  DatabaseError,
  InsufficientStockError
} from '../../api/errors/AppError.js'
import {
  validateErrorResponse,
  validateErrorCategory,
  validateErrorCode,
  validateHttpStatus,
  validateValidationError,
  validateNotFoundError,
  validateAuthError,
  validateBusinessError,
  validateServerError,
  assertErrorProperties,
  assertErrorJSON,
  ERROR_TEST_CONSTANTS,
  ErrorFactory
} from '../utils/errorTestUtils.js'
import { ERROR_CODES } from '../../api/config/errorCodes.js'

describe('Standardized Error Testing Patterns', () => {
  describe('Error Response Structure Validation', () => {
    it('should validate complete error response structure', () => {
      const error = new ValidationError('Invalid input', {
        email: ['Invalid email format']
      })

      const response = error.toJSON()

      // Use standardized validation
      validateErrorResponse(response)
    })

    it('should have all required error properties', () => {
      const error = new NotFoundError('Product', 123)

      assertErrorProperties(error, {
        expectedName: 'NotFoundError',
        expectedCode: ERROR_CODES.RESOURCE_NOT_FOUND,
        expectedStatus: 404,
        expectedCategory: 'not_found',
        expectedOperational: true
      })
    })

    it('should validate error JSON serialization', () => {
      const error = new ConflictError('Resource already exists')

      assertErrorJSON(error)
    })
  })

  describe('Error Category Validation', () => {
    it('should validate validation errors', () => {
      const error = new ValidationError('Invalid', { field: 'email' })

      validateValidationError(error)
      validateErrorCategory(error, 'validation')
      validateErrorCode(error, ERROR_CODES.VALIDATION_FAILED)
    })

    it('should validate not found errors', () => {
      const error = new NotFoundError('User', 456)

      validateNotFoundError(error)
      validateErrorCategory(error, 'not_found')
      validateErrorCode(error, ERROR_CODES.RESOURCE_NOT_FOUND)
    })

    it('should validate authentication errors', () => {
      const error = new UnauthorizedError('Invalid token')

      validateAuthError(error)
      validateErrorCategory(error, 'authentication')
      validateErrorCode(error, ERROR_CODES.UNAUTHORIZED)
    })

    it('should validate business logic errors', () => {
      const error = new InsufficientStockError(1, 10, 5)

      validateBusinessError(error)
      validateErrorCategory(error, 'business')
      validateErrorCode(error, ERROR_CODES.INSUFFICIENT_STOCK)
      validateHttpStatus(error, 409)
    })

    it('should validate server errors', () => {
      const error = new InternalServerError('Database connection failed')

      validateServerError(error)
      validateErrorCategory(error, 'server')
      validateErrorCode(error, ERROR_CODES.INTERNAL_SERVER_ERROR)
      validateHttpStatus(error, 500)
    })
  })

  describe('HTTP Status Code Mapping', () => {
    it('should map 4xx errors to fail status', () => {
      const validationError = new ValidationError('Invalid')
      expect(validationError.status).toBe('fail')
      expect(validationError.statusCode).toBe(400)
    })

    it('should map 5xx errors to error status', () => {
      const serverError = new InternalServerError('Error')
      expect(serverError.status).toBe('error')
      expect(serverError.statusCode).toBe(500)
    })

    it('should map specific status codes correctly', () => {
      expect(new ValidationError('Invalid').statusCode).toBe(400)
      expect(new UnauthorizedError('Unauthorized').statusCode).toBe(401)
      expect(new NotFoundError('Resource', 1).statusCode).toBe(404)
      expect(new ConflictError('Conflict').statusCode).toBe(409)
      expect(new InternalServerError('Error').statusCode).toBe(500)
    })
  })

  describe('Error Code Validation', () => {
    it('should use correct numeric codes for validation errors', () => {
      expect(ERROR_TEST_CONSTANTS.VALIDATION_ERROR_CODES.VALIDATION_FAILED).toBe(1001)
      expect(ERROR_TEST_CONSTANTS.VALIDATION_ERROR_CODES.INVALID_INPUT).toBe(1002)
      expect(ERROR_TEST_CONSTANTS.VALIDATION_ERROR_CODES.MISSING_REQUIRED_FIELD).toBe(1003)
    })

    it('should use correct numeric codes for auth errors', () => {
      expect(ERROR_TEST_CONSTANTS.AUTH_ERROR_CODES.UNAUTHORIZED).toBe(2001)
      expect(ERROR_TEST_CONSTANTS.AUTH_ERROR_CODES.INVALID_TOKEN).toBe(2002)
      expect(ERROR_TEST_CONSTANTS.AUTH_ERROR_CODES.FORBIDDEN).toBe(2004)
    })

    it('should use correct numeric codes for not found errors', () => {
      expect(ERROR_TEST_CONSTANTS.NOT_FOUND_ERROR_CODES.RESOURCE_NOT_FOUND).toBe(3001)
      expect(ERROR_TEST_CONSTANTS.NOT_FOUND_ERROR_CODES.PRODUCT_NOT_FOUND).toBe(3003)
    })

    it('should use correct numeric codes for business errors', () => {
      expect(ERROR_TEST_CONSTANTS.BUSINESS_ERROR_CODES.INSUFFICIENT_STOCK).toBe(4001)
      expect(ERROR_TEST_CONSTANTS.BUSINESS_ERROR_CODES.PAYMENT_FAILED).toBe(4002)
    })

    it('should use correct numeric codes for server errors', () => {
      expect(ERROR_TEST_CONSTANTS.SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR).toBe(5001)
      expect(ERROR_TEST_CONSTANTS.SERVER_ERROR_CODES.DATABASE_ERROR).toBe(5002)
    })
  })

  describe('Error Factory Pattern', () => {
    it('should create validation errors with factory', () => {
      const error = ErrorFactory.validation('email', 'Invalid email')

      validateValidationError(error)
      validateErrorCategory(error, 'validation')
    })

    it('should create not found errors with factory', () => {
      const error = ErrorFactory.notFound('Product', 123)

      validateNotFoundError(error)
      validateErrorCategory(error, 'not_found')
    })

    it('should create auth errors with factory', () => {
      const error = ErrorFactory.auth('Invalid credentials')

      validateAuthError(error)
      validateErrorCategory(error, 'authentication')
    })

    it('should create business errors with factory', () => {
      const error = ErrorFactory.business('Operation not allowed')

      validateBusinessError(error)
      validateErrorCategory(error, 'business')
    })

    it('should create server errors with factory', () => {
      const error = ErrorFactory.server('System unavailable')

      validateServerError(error)
      validateErrorCategory(error, 'server')
    })
  })

  describe('Error Context and Metadata', () => {
    it('should include context in validation errors', () => {
      const error = new ValidationError('Invalid', {
        email: ['Invalid format'],
        password: ['Too short']
      })

      const response = error.toJSON()
      expect(response.details).toHaveProperty('validationErrors')
      expect(response.details.validationErrors.email).toBeDefined()
    })

    it('should include resource context in not found errors', () => {
      const error = new NotFoundError('Product', 123)

      const response = error.toJSON()
      expect(response.details).toHaveProperty('resource', 'Product')
      expect(response.details).toHaveProperty('id', 123)
    })

    it('should include operation context in database errors', () => {
      const dbError = new DatabaseError('SELECT', 'products', new Error('Connection failed'))

      const response = dbError.toJSON()
      // details field contains context
      expect(response.details).toBeDefined()
      expect(response.details).toHaveProperty('operation', 'SELECT')
      expect(response.details).toHaveProperty('table', 'products')
      expect(response.details).toHaveProperty('originalError')
    })
  })

  describe('Error Severity Levels', () => {
    it('should assign correct severity to validation errors', () => {
      const error = new ValidationError('Invalid')
      expect(error.severity).toBe('low')
    })

    it('should assign correct severity to server errors', () => {
      const error = new InternalServerError('Critical error')
      expect(error.severity).toBe('critical')
    })

    it('should assign correct severity based on status code', () => {
      const validationError = new ValidationError('Invalid')
      expect(validationError.severity).toBe('low') // 4xx errors are low

      const serverError = new InternalServerError('Error')
      expect(serverError.severity).toBe('critical') // 5xx errors are critical
    })
  })

  describe('RFC 7807 Compliance', () => {
    it('should include title for RFC 7807 compatibility', () => {
      const error = new ValidationError('Invalid input')

      const response = error.toJSON()
      expect(response).toHaveProperty('title')
      expect(typeof response.title).toBe('string')
    })

    it('should include type for RFC 7807 compatibility', () => {
      const error = new ValidationError('Invalid')

      const response = error.toJSON()
      expect(response).toHaveProperty('type')
      expect(response.type).toMatch(/^https?:\/\//)
    })

    it('should include instance identifier', () => {
      const error = new ValidationError('Invalid')

      const response = error.toJSON()
      expect(response).toHaveProperty('instance')
      expect(typeof response.instance).toBe('string')
    })
  })

  describe('Error Response Format Consistency', () => {
    it('should maintain consistent response format across all error types', () => {
      const errors = [
        new ValidationError('Invalid'),
        new NotFoundError('Resource', 1),
        new UnauthorizedError('Unauthorized'),
        new InternalServerError('Error')
      ]

      errors.forEach(error => {
        const response = error.toJSON()

        // All should have these fields
        expect(response).toHaveProperty('success', false)
        expect(response).toHaveProperty('error')
        expect(response).toHaveProperty('code')
        expect(response).toHaveProperty('category')
        expect(response).toHaveProperty('message')
        expect(response).toHaveProperty('timestamp')
        expect(response).toHaveProperty('type')
        expect(response).toHaveProperty('title')

        // All should have correct types
        expect(typeof response.success).toBe('boolean')
        expect(typeof response.error).toBe('string')
        expect(typeof response.code).toBe('number')
        expect(typeof response.category).toBe('string')
        expect(typeof response.message).toBe('string')
        expect(typeof response.timestamp).toBe('string')
      })
    })
  })
})
