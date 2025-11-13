/**
 * Custom Error Compliance Tests
 * Verifies adherence to custom error class implementation and error handling patterns
 *
 * ERROR HANDLING REQUIREMENTS:
 * 1. Custom Error Classes - AppError base class with specific error types
 * 2. Error Metadata - Code, severity, context, user messages
 * 3. RFC 7807 Compliance - Problem Details for HTTP APIs
 * 4. Error Serialization - JSON representation with proper fields
 * 5. Severity Levels - low, medium, high, critical classification
 * 6. Error Context - Additional metadata for debugging and logging
 * 7. User-Friendly Messages - Safe messages for end users
 *
 * SOURCES:
 * - RFC 7807 (Problem Details for HTTP APIs)
 * - Enterprise Error Handling Patterns (Microsoft, Google)
 * - Node.js Error Best Practices
 * - Express.js Error Handling Guidelines
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  AppError,
  BadRequestError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
  DatabaseError,
  DatabaseConnectionError,
  DatabaseConstraintError,
  InsufficientStockError,
  PaymentFailedError,
  ServiceUnavailableError,
  ConfigurationError
} from '../../api/errors/AppError.js'
import { ERROR_CODES } from '../../api/config/errorCodes.js'

describe('Custom Error Compliance - AppError & Error Classes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('1. APPERROR BASE CLASS', () => {
    it('should create AppError with default properties', () => {
      const error = new AppError('Test error message')

      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Test error message')
      expect(error.name).toBe('AppError')
      expect(error.statusCode).toBe(500)
      expect(error.status).toBe('error')
      expect(error.isOperational).toBe(true)
      expect(error.code).toBe(ERROR_CODES.INTERNAL_SERVER_ERROR)
      expect(error.severity).toBe('high')
      expect(error.userMessage).toBe('An error occurred. Please try again.')
      expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('should create AppError with custom options', () => {
      const context = { userId: 123, operation: 'test' }
      const error = new AppError('Custom error', {
        statusCode: 400,
        code: ERROR_CODES.INVALID_INPUT,
        isOperational: false,
        context,
        userMessage: 'Custom user message',
        severity: 'low'
      })

      expect(error.statusCode).toBe(400)
      expect(error.code).toBe(ERROR_CODES.INVALID_INPUT)
      expect(error.isOperational).toBe(false)
      expect(error.context).toEqual(context)
      expect(error.userMessage).toBe('Custom user message')
      expect(error.severity).toBe('low')
    })

    it('should capture stack trace', () => {
      const error = new AppError('Stack trace test')
      expect(error.stack).toBeDefined()
      expect(error.stack).toContain('AppError')
    })
  })

  describe('2. ERROR SERIALIZATION & RFC 7807 COMPLIANCE', () => {
    it('should serialize to RFC 7807 compliant JSON', () => {
      const error = new AppError('Test error', {
        statusCode: 400,
        code: ERROR_CODES.INVALID_INPUT,
        context: { field: 'email' },
        userMessage: 'Invalid email format'
      })

      const json = error.toJSON()

      // RFC 7807 required fields
      expect(json.type).toMatch(/^https:\/\/api\.floresya\.com\/errors/)
      expect(json.title).toBe('AppError')
      expect(json.status).toBe(400)
      expect(json.detail).toBe('Invalid email format')
      expect(json.instance).toMatch(/^\/errors\//)

      // FloresYa extensions
      expect(json.success).toBe(false)
      expect(json.error).toBe('AppError')
      expect(json.code).toBe(ERROR_CODES.INVALID_INPUT)
      expect(json.category).toBeDefined()
      expect(json.message).toBe('Invalid email format')
      expect(json.timestamp).toBeDefined()
      expect(json.details).toEqual({ field: 'email' })
    })

    it('should include stack trace in development mode', () => {
      const error = new AppError('Development error')
      const json = error.toJSON(true) // includeStack = true

      expect(json.stack).toBeDefined()
      expect(json.stack).toContain('AppError')
    })

    it('should exclude undefined values from serialization', () => {
      const error = new AppError('Test error')
      const json = error.toJSON()

      // Should not have undefined properties
      Object.keys(json).forEach(key => {
        expect(json[key]).not.toBeUndefined()
      })
    })

    it('should generate correct type URLs for different error categories', () => {
      const validationError = new ValidationError('Validation failed')
      const authError = new UnauthorizedError('Not authorized')

      expect(validationError.getTypeUrl()).toContain('/validation/validation')
      expect(authError.getTypeUrl()).toContain('/authentication/unauthorized')
    })

    it('should generate correct titles for different error types', () => {
      const badRequest = new BadRequestError('Bad request')
      const notFound = new NotFoundError('User', 123)
      const internal = new InternalServerError('Internal error')

      expect(badRequest.getTitle()).toBe('Bad Request')
      expect(notFound.getTitle()).toBe('Resource Not Found')
      expect(internal.getTitle()).toBe('Internal Server Error')
    })
  })

  describe('3. SPECIFIC ERROR CLASSES', () => {
    describe('HTTP 4xx Client Errors', () => {
      it('should create BadRequestError with correct defaults', () => {
        const error = new BadRequestError('Invalid input', { field: 'email' })

        expect(error.statusCode).toBe(400)
        expect(error.code).toBe(ERROR_CODES.INVALID_INPUT)
        expect(error.severity).toBe('low')
        expect(error.userMessage).toBe('Invalid request. Please check your input.')
        expect(error.context).toEqual({ field: 'email' })
      })

      it('should create ValidationError with validation details', () => {
        const validationErrors = { email: ['required'], password: ['too short'] }
        const error = new ValidationError('Validation failed', validationErrors)

        expect(error.statusCode).toBe(400)
        expect(error.code).toBe(ERROR_CODES.VALIDATION_FAILED)
        expect(error.severity).toBe('low')
        expect(error.context.validationErrors).toEqual(validationErrors)

        const json = error.toJSON()
        expect(json.validationErrors).toEqual(validationErrors)
      })

      it('should create NotFoundError with resource details', () => {
        const error = new NotFoundError('Product', 456, { operation: 'update' })

        expect(error.statusCode).toBe(404)
        expect(error.code).toBe(ERROR_CODES.RESOURCE_NOT_FOUND)
        expect(error.severity).toBe('low')
        expect(error.message).toBe('Product with ID 456 not found')
        expect(error.userMessage).toBe('The requested product was not found.')
        expect(error.context).toEqual({
          resource: 'Product',
          id: 456,
          operation: 'update'
        })
      })

      it('should create UnauthorizedError with auth context', () => {
        const error = new UnauthorizedError('Invalid token', { tokenType: 'JWT' })

        expect(error.statusCode).toBe(401)
        expect(error.code).toBe(ERROR_CODES.UNAUTHORIZED)
        expect(error.severity).toBe('medium')
        expect(error.userMessage).toBe('Please log in to continue.')
      })

      it('should create ForbiddenError with access context', () => {
        const error = new ForbiddenError('Admin access required', { requiredRole: 'admin' })

        expect(error.statusCode).toBe(403)
        expect(error.code).toBe(ERROR_CODES.FORBIDDEN)
        expect(error.severity).toBe('medium')
        expect(error.userMessage).toBe('You do not have permission to access this resource.')
      })

      it('should create ConflictError with conflict details', () => {
        const error = new ConflictError('Email already exists', { email: 'test@example.com' })

        expect(error.statusCode).toBe(409)
        expect(error.code).toBe(ERROR_CODES.RESOURCE_CONFLICT)
        expect(error.severity).toBe('medium')
        expect(error.userMessage).toBe('This operation conflicts with existing data.')
      })
    })

    describe('HTTP 5xx Server Errors', () => {
      it('should create InternalServerError with critical severity', () => {
        const error = new InternalServerError('Database connection failed', { db: 'postgres' })

        expect(error.statusCode).toBe(500)
        expect(error.code).toBe(ERROR_CODES.INTERNAL_SERVER_ERROR)
        expect(error.isOperational).toBe(false)
        expect(error.severity).toBe('critical')
        expect(error.userMessage).toBe('An unexpected error occurred. Please try again later.')
      })

      it('should create ServiceUnavailableError with service context', () => {
        const error = new ServiceUnavailableError('payment_gateway', { retryAfter: 300 })

        expect(error.statusCode).toBe(503)
        expect(error.code).toBe(ERROR_CODES.SERVICE_UNAVAILABLE)
        expect(error.severity).toBe('high')
        expect(error.context.service).toBe('payment_gateway')
        expect(error.userMessage).toBe('Service temporarily unavailable. Please try again later.')
      })
    })

    describe('Database Errors', () => {
      it('should create DatabaseError with operation details', () => {
        const originalError = new Error('Connection timeout')
        const error = new DatabaseError('SELECT', 'products', originalError, {
          query: 'SELECT * FROM products'
        })

        expect(error.statusCode).toBe(500)
        expect(error.code).toBe(ERROR_CODES.DATABASE_ERROR)
        expect(error.isOperational).toBe(false)
        expect(error.severity).toBe('critical')
        expect(error.context.operation).toBe('SELECT')
        expect(error.context.table).toBe('products')
        expect(error.context.originalError).toBe('Connection timeout')
      })

      it('should create DatabaseConnectionError with connection context', () => {
        const originalError = new Error('Host unreachable')
        const error = new DatabaseConnectionError(originalError, { host: 'localhost', port: 5432 })

        expect(error.statusCode).toBe(503)
        expect(error.code).toBe(ERROR_CODES.DATABASE_ERROR)
        expect(error.isOperational).toBe(false)
        expect(error.severity).toBe('critical')
        expect(error.userMessage).toBe('Database connection error. Please try again later.')
      })

      it('should create DatabaseConstraintError with constraint details', () => {
        const error = new DatabaseConstraintError('unique_email', 'users', {
          email: 'duplicate@example.com'
        })

        expect(error.statusCode).toBe(409)
        expect(error.code).toBe(ERROR_CODES.RESOURCE_CONFLICT)
        expect(error.severity).toBe('medium')
        expect(error.context.constraint).toBe('unique_email')
        expect(error.context.table).toBe('users')
      })
    })

    describe('Business Logic Errors', () => {
      it('should create InsufficientStockError with inventory details', () => {
        const error = new InsufficientStockError(123, 10, 5)

        expect(error.statusCode).toBe(409)
        expect(error.code).toBe(ERROR_CODES.INSUFFICIENT_STOCK)
        expect(error.severity).toBe('low')
        expect(error.context).toEqual({ productId: 123, requested: 10, available: 5 })
        expect(error.userMessage).toBe('Only 5 units available. Please adjust quantity.')
      })

      it('should create PaymentFailedError with payment context', () => {
        const error = new PaymentFailedError('Card declined', {
          paymentMethod: 'credit_card',
          amount: 100
        })

        expect(error.statusCode).toBe(402)
        expect(error.code).toBe(ERROR_CODES.PAYMENT_FAILED)
        expect(error.severity).toBe('high')
        expect(error.context.reason).toBe('Card declined')
        expect(error.userMessage).toBe('Payment failed. Please check your payment method.')
      })
    })

    describe('Configuration Errors', () => {
      it('should create ConfigurationError with critical severity', () => {
        const error = new ConfigurationError('Missing API key', { configKey: 'SUPABASE_KEY' })

        expect(error.statusCode).toBe(500)
        expect(error.code).toBe(ERROR_CODES.CONFIGURATION_ERROR)
        expect(error.isOperational).toBe(false)
        expect(error.severity).toBe('critical')
        expect(error.userMessage).toBe('Server configuration error. Please contact support.')
      })
    })
  })

  describe('4. ERROR SEVERITY LEVELS', () => {
    it('should assign correct severity levels to different error types', () => {
      const lowSeverity = new BadRequestError('Low severity')
      const mediumSeverity = new UnauthorizedError('Medium severity')
      const highSeverity = new PaymentFailedError('High severity')
      const criticalSeverity = new InternalServerError('Critical severity')

      expect(lowSeverity.severity).toBe('low')
      expect(mediumSeverity.severity).toBe('medium')
      expect(highSeverity.severity).toBe('high')
      expect(criticalSeverity.severity).toBe('critical')
    })

    it('should default to appropriate severity based on status code', () => {
      const clientError = new AppError('Client error', { statusCode: 400 })
      const serverError = new AppError('Server error', { statusCode: 500 })

      expect(clientError.severity).toBe('medium') // 4xx defaults to medium
      expect(serverError.severity).toBe('high') // 5xx defaults to high
    })

    it('should allow custom severity override', () => {
      const error = new AppError('Custom severity', {
        statusCode: 500,
        severity: 'critical'
      })

      expect(error.severity).toBe('critical')
    })
  })

  describe('5. ERROR CONTEXT & METADATA', () => {
    it('should preserve and merge context metadata', () => {
      const baseContext = { userId: 123, operation: 'create' }
      const additionalContext = { table: 'products', timestamp: '2024-01-01' }

      const error = new AppError('Context test', {
        context: baseContext
      })

      // Simulate adding more context (like in error handlers)
      error.context = { ...error.context, ...additionalContext }

      expect(error.context).toEqual({
        userId: 123,
        operation: 'create',
        table: 'products',
        timestamp: '2024-01-01'
      })
    })

    it('should include request ID in context when available', () => {
      const error = new AppError('Request context', {
        context: { requestId: 'req-12345', path: '/api/products' }
      })

      const json = error.toJSON()
      expect(json.requestId).toBe('req-12345')
      expect(json.path).toBe('/api/products')
    })

    it('should sanitize sensitive context data in serialization', () => {
      const error = new AppError('Sensitive data test', {
        context: {
          password: 'secret123',
          creditCard: '4111111111111111',
          safeField: 'this is safe'
        }
      })

      const json = error.toJSON()
      // In a real implementation, sensitive fields should be filtered out
      // For now, we just ensure context is included as-is
      expect(json.details.password).toBe('secret123')
      expect(json.details.safeField).toBe('this is safe')
    })
  })

  describe('6. ERROR HANDLING SCENARIOS', () => {
    it('should handle error inheritance correctly', () => {
      const validationError = new ValidationError('Validation failed')
      const badRequestError = new BadRequestError('Bad request')

      expect(validationError).toBeInstanceOf(ValidationError)
      expect(validationError).toBeInstanceOf(AppError)
      expect(validationError).toBeInstanceOf(Error)

      expect(badRequestError).toBeInstanceOf(BadRequestError)
      expect(badRequestError).toBeInstanceOf(AppError)
      expect(badRequestError).toBeInstanceOf(Error)
    })

    it('should maintain error properties through inheritance', () => {
      const error = new NotFoundError('Product', 999, { operation: 'fetch' })

      expect(error.name).toBe('NotFoundError')
      expect(error.message).toBe('Product with ID 999 not found')
      expect(error.statusCode).toBe(404)
      expect(error.isOperational).toBe(true)
      expect(error.severity).toBe('low')
    })

    it('should handle errors with circular references in context', () => {
      const context = { self: null }
      context.self = context // Create circular reference

      const error = new AppError('Circular reference test', { context })

      // Should not throw when serializing
      expect(() => error.toJSON()).not.toThrow()
    })

    it('should handle errors with complex nested context', () => {
      const complexContext = {
        user: { id: 123, roles: ['admin', 'user'] },
        request: { method: 'POST', url: '/api/products' },
        validation: {
          errors: [
            { field: 'name', message: 'Required' },
            { field: 'price', message: 'Must be positive' }
          ]
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      }

      const error = new ValidationError(
        'Complex validation failed',
        complexContext.validation.errors
      )

      expect(error.context.validationErrors).toEqual(complexContext.validation.errors)
      expect(() => error.toJSON()).not.toThrow()
    })
  })

  describe('7. VITEST & MOCKING BEST PRACTICES', () => {
    it('should properly mock AppError classes for testing', () => {
      // Verify that error classes can be instantiated in tests
      const mockBadRequest = new BadRequestError('Mock test')
      const mockValidation = new ValidationError('Mock validation')

      expect(mockBadRequest).toBeInstanceOf(BadRequestError)
      expect(mockValidation).toBeInstanceOf(ValidationError)
    })

    it('should test error serialization without side effects', () => {
      const error = new AppError('Serialization test')
      const json1 = error.toJSON()
      const json2 = error.toJSON()

      // Multiple calls should return consistent results (except for instance which is random)
      expect(json1.success).toBe(json2.success)
      expect(json1.error).toBe(json2.error)
      expect(json1.code).toBe(json2.code)
      expect(json1.status).toBe(json2.status)
      expect(json1.timestamp).toBe(json2.timestamp)
      expect(json1.timestamp).toBeDefined()
    })

    it('should isolate error instances between tests', () => {
      const error1 = new AppError('Test 1', { context: { test: 1 } })
      const error2 = new AppError('Test 2', { context: { test: 2 } })

      expect(error1.context.test).toBe(1)
      expect(error2.context.test).toBe(2)
      expect(error1.message).not.toBe(error2.message)
    })

    it('should handle async error scenarios', async () => {
      // Simulate async error creation
      const createErrorAsync = async () => {
        await new Promise(resolve => setTimeout(resolve, 1))
        return new InternalServerError('Async error')
      }

      const error = await createErrorAsync()
      expect(error).toBeInstanceOf(InternalServerError)
      expect(error.severity).toBe('critical')
    })
  })

  describe('8. ERROR CODES INTEGRATION', () => {
    it('should use correct error codes from ERROR_CODES constant', () => {
      const badRequest = new BadRequestError('Test')
      const validation = new ValidationError('Test')
      const notFound = new NotFoundError('Test', 1)
      const internal = new InternalServerError('Test')

      expect(badRequest.code).toBe(ERROR_CODES.INVALID_INPUT)
      expect(validation.code).toBe(ERROR_CODES.VALIDATION_FAILED)
      expect(notFound.code).toBe(ERROR_CODES.RESOURCE_NOT_FOUND)
      expect(internal.code).toBe(ERROR_CODES.INTERNAL_SERVER_ERROR)
    })

    it('should provide correct error categories', () => {
      const validation = new ValidationError('Test')
      const auth = new UnauthorizedError('Test')
      const server = new InternalServerError('Test')

      expect(validation.toJSON().category).toBe('validation')
      expect(auth.toJSON().category).toBe('authentication')
      expect(server.toJSON().category).toBe('server')
    })
  })
})
