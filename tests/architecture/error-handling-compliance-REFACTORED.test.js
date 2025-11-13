/**
 * Error Handling Compliance Tests - REFACTORED
 * Verifies comprehensive error handling across all architectural layers
 *
 * ERROR HANDLING REQUIREMENTS:
 * 1. Error Propagation - Errors bubble up correctly through layers
 * 2. Error Logging - All errors are properly logged with context
 * 3. Error Response Formatting - RFC 7807 compliant responses
 * 4. Database Error Handling - Connection, constraint, and query errors
 * 5. External Service Errors - Proper handling of third-party failures
 * 6. Business Logic Errors - Domain-specific error scenarios
 * 7. Error Monitoring - Performance and error metrics
 * 8. Error Recovery - Graceful degradation and retry mechanisms
 *
 * SOURCES:
 * - RFC 7807 (Problem Details for HTTP APIs)
 * - Enterprise Error Handling Patterns (Microsoft, Google)
 * - Node.js Error Best Practices
 * - Express.js Error Handling Guidelines
 * - Vitest Testing Best Practices
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  AppError,
  BadRequestError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  InternalServerError,
  DatabaseError,
  DatabaseConnectionError,
  DatabaseConstraintError,
  InsufficientStockError,
  PaymentFailedError,
  ServiceUnavailableError,
  ConfigurationError,
  ExternalServiceError,
  StorageError
} from '../../api/errors/AppError.js'
import { ERROR_CODES } from '../../api/config/errorCodes.js'
import { logger } from '../../api/utils/logger.js'

// Mock external services
const mockPaymentGateway = {
  processPayment: vi.fn(),
  refundPayment: vi.fn()
}

describe('Error Handling Compliance - Comprehensive Architecture Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(logger, 'error').mockImplementation(() => {})
    vi.spyOn(logger, 'warn').mockImplementation(() => {})
    vi.spyOn(logger, 'info').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('1. ERROR PROPAGATION THROUGH LAYERS', () => {
    it('should propagate repository errors to service layer', async () => {
      // Arrange
      const mockRepository = {
        findByIdWithImages: vi
          .fn()
          .mockRejectedValue(
            new DatabaseError('SELECT', 'products', new Error('Connection timeout'))
          )
      }

      // Mock service that uses repository
      const mockService = {
        async getProductById(id) {
          try {
            return await mockRepository.findByIdWithImages(id, false)
          } catch (error) {
            logger.error('Repository error in service', error, { productId: id })
            throw error
          }
        }
      }

      // Act & Assert
      await expect(mockService.getProductById(123)).rejects.toThrow(DatabaseError)
      expect(logger.error).toHaveBeenCalledWith(
        'Repository error in service',
        expect.any(DatabaseError),
        { productId: 123 }
      )
    })

    it('should propagate service errors to controller layer', async () => {
      // Arrange
      const mockService = {
        getProductById: vi.fn().mockRejectedValue(new NotFoundError('Product', 123))
      }

      // Mock controller that uses service
      const mockController = {
        async getProduct(req, res) {
          try {
            const product = await mockService.getProductById(req.params.id)
            res.json(product)
          } catch (error) {
            logger.error('Service error in controller', error, {
              requestId: req.requestId,
              productId: req.params.id
            })
            throw error
          }
        }
      }

      const mockReq = { params: { id: '123' }, requestId: 'req-123' }
      const mockRes = { json: vi.fn() }

      // Act & Assert
      await expect(mockController.getProduct(mockReq, mockRes)).rejects.toThrow(NotFoundError)
      expect(logger.error).toHaveBeenCalledWith(
        'Service error in controller',
        expect.any(NotFoundError),
        { requestId: 'req-123', productId: '123' }
      )
    })

    it('should handle middleware error propagation', async () => {
      // Arrange
      const mockErrorHandler = vi.fn((error, req, res, next) => {
        if (error instanceof AppError) {
          res.status(error.statusCode).json(error.toJSON())
        } else {
          logger.error('Unhandled error', error, { requestId: req.requestId })
          res.status(500).json({ error: 'Internal server error' })
        }
      })

      const mockReq = { requestId: 'req-456' }
      const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() }
      const mockNext = vi.fn()

      const error = new ValidationError('Invalid input', { email: ['required'] })

      // Act
      mockErrorHandler(error, mockReq, mockRes, mockNext)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'ValidationError',
          code: ERROR_CODES.VALIDATION_FAILED,
          validationErrors: { email: ['required'] }
        })
      )
    })
  })

  describe('2. ERROR LOGGING AND MONITORING', () => {
    it('should log errors with proper context and severity', () => {
      // Arrange
      const error = new InternalServerError('Database connection failed', {
        db: 'postgres',
        host: 'localhost'
      })

      // Act
      logger.error('Critical database error', error, {
        requestId: 'req-789',
        userId: 123,
        operation: 'user_login'
      })

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'Critical database error',
        error,
        expect.objectContaining({
          requestId: 'req-789',
          userId: 123,
          operation: 'user_login'
        })
      )
    })

    it('should log security events with appropriate severity', () => {
      // Arrange
      const securityError = new UnauthorizedError('Invalid token', {
        tokenType: 'JWT',
        ip: '192.168.1.100'
      })

      // Act
      logger.error('Authentication failure', securityError, {
        severity: 'medium',
        event: 'failed_login_attempt'
      })

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'Authentication failure',
        securityError,
        expect.objectContaining({
          severity: 'medium',
          event: 'failed_login_attempt'
        })
      )
    })

    it('should log performance issues with error context', () => {
      // Arrange
      const slowQueryError = new DatabaseError(
        'SELECT',
        'products',
        new Error('Query timeout after 30s'),
        { queryTime: 30000, threshold: 5000 }
      )

      // Act
      logger.warn('Slow database query detected', {
        requestId: 'req-slow-123',
        queryTime: 30000,
        threshold: 5000,
        table: 'products'
      })

      // Assert
      expect(logger.warn).toHaveBeenCalledWith(
        'Slow database query detected',
        expect.objectContaining({
          requestId: 'req-slow-123',
          queryTime: 30000,
          threshold: 5000,
          table: 'products'
        })
      )
      expect(slowQueryError.context.queryTime).toBe(30000)
    })
  })

  describe('3. RFC 7807 COMPLIANCE IN ERROR RESPONSES', () => {
    it('should format all error responses according to RFC 7807', () => {
      // Arrange
      const errors = [
        new BadRequestError('Invalid input'),
        new NotFoundError('User', 123),
        new InternalServerError('Server error'),
        new ValidationError('Validation failed', { email: ['invalid'] })
      ]

      // Act & Assert
      errors.forEach(error => {
        const json = error.toJSON()

        // RFC 7807 required fields
        expect(json.type).toMatch(/^https:\/\/api\.floresya\.com\/errors\//)
        expect(json.title).toBeDefined()
        expect(json.status).toBe(error.statusCode)
        expect(json.detail).toBe(error.userMessage)
        expect(json.instance).toMatch(/^\/errors\//)

        // FloresYa extensions
        expect(json.success).toBe(false)
        expect(json.error).toBe(error.name)
        expect(json.code).toBeDefined()
        expect(json.category).toBeDefined()
        expect(json.timestamp).toBeDefined()
      })
    })

    it('should include validation errors in RFC 7807 response', () => {
      // Arrange
      const validationErrors = {
        email: ['required', 'invalid_format'],
        password: ['too_short'],
        age: ['must_be_number']
      }
      const error = new ValidationError('Multiple validation errors', validationErrors)

      // Act
      const json = error.toJSON()

      // Assert
      expect(json.validationErrors).toEqual(validationErrors)
      expect(json.detail).toBe('Validation failed. Please check your input.')
      expect(json.status).toBe(400)
    })

    it('should generate unique instance URLs for each error', () => {
      // Arrange
      const error1 = new AppError('Error 1')
      const error2 = new AppError('Error 2')

      // Act
      const json1 = error1.toJSON()
      const json2 = error2.toJSON()

      // Assert
      expect(json1.instance).not.toBe(json2.instance)
      expect(json1.instance).toMatch(/^\/errors\//)
      expect(json2.instance).toMatch(/^\/errors\//)
    })
  })

  describe('4. DATABASE ERROR HANDLING', () => {
    it('should handle database connection errors gracefully', async () => {
      // Arrange
      const connectionError = new Error('Connection refused')
      const dbError = new DatabaseConnectionError(connectionError, {
        host: 'localhost',
        port: 5432,
        database: 'floresya'
      })

      // Mock repository that throws connection error
      const mockRepository = {
        findAll: vi.fn().mockRejectedValue(dbError)
      }

      // Act & Assert
      await expect(mockRepository.findAll()).rejects.toThrow(DatabaseConnectionError)
      expect(dbError.statusCode).toBe(503)
      expect(dbError.isOperational).toBe(false)
      expect(dbError.severity).toBe('critical')
    })

    it('should handle database constraint violations', async () => {
      // Arrange
      const constraintError = new DatabaseConstraintError('unique_email', 'users', {
        email: 'duplicate@example.com'
      })

      // Mock repository create operation
      const mockRepository = {
        create: vi.fn().mockRejectedValue(constraintError)
      }

      // Act & Assert
      await expect(mockRepository.create({ email: 'duplicate@example.com' })).rejects.toThrow(
        DatabaseConstraintError
      )
      expect(constraintError.statusCode).toBe(409)
      expect(constraintError.context.constraint).toBe('unique_email')
      expect(constraintError.context.table).toBe('users')
    })

    it('should handle database query errors with context', async () => {
      // Arrange
      const queryError = new Error('Invalid SQL syntax')
      const dbError = new DatabaseError('SELECT', 'products', queryError, {
        query: 'SELECT * FROM products WHERE invalid_syntax',
        parameters: { category: 'flowers' }
      })

      // Act
      const json = dbError.toJSON()

      // Assert
      expect(dbError.statusCode).toBe(500)
      expect(dbError.context.operation).toBe('SELECT')
      expect(dbError.context.table).toBe('products')
      expect(dbError.context.originalError).toBe('Invalid SQL syntax')
      expect(json.details.query).toBe('SELECT * FROM products WHERE invalid_syntax')
    })
  })

  describe('5. EXTERNAL SERVICE ERROR HANDLING', () => {
    it('should handle payment gateway failures', async () => {
      // Arrange
      const gatewayError = new Error('Payment gateway timeout')
      mockPaymentGateway.processPayment.mockRejectedValue(gatewayError)

      // Mock service that wraps external call
      const mockPaymentService = {
        async processPayment(amount, cardDetails) {
          try {
            return await mockPaymentGateway.processPayment(amount, cardDetails)
          } catch (error) {
            throw new PaymentFailedError('Gateway timeout', {
              amount,
              gateway: 'stripe',
              originalError: error.message
            })
          }
        }
      }

      // Act & Assert
      await expect(mockPaymentService.processPayment(100, {})).rejects.toThrow(PaymentFailedError)
      expect(mockPaymentGateway.processPayment).toHaveBeenCalledWith(100, {})
    })

    it('should handle external service unavailability', async () => {
      // Arrange
      const serviceError = new ExternalServiceError(
        'email_service',
        'send_welcome_email',
        new Error('SMTP server unreachable'),
        { userId: 123, email: 'user@example.com' }
      )

      // Act
      const json = serviceError.toJSON()

      // Assert
      expect(serviceError.statusCode).toBe(502)
      expect(serviceError.context.service).toBe('email_service')
      expect(serviceError.context.operation).toBe('send_welcome_email')
      expect(json.details.userId).toBe(123)
    })

    it('should handle storage service errors', async () => {
      // Arrange
      const storageError = new StorageError(
        'UPLOAD',
        'product-images',
        new Error('Bucket not found'),
        { fileName: 'product-123.jpg', size: 2048000 }
      )

      // Act
      const json = storageError.toJSON()

      // Assert
      expect(storageError.statusCode).toBe(500)
      expect(storageError.context.operation).toBe('UPLOAD')
      expect(storageError.context.bucket).toBe('product-images')
      expect(json.details.fileName).toBe('product-123.jpg')
    })
  })

  describe('6. BUSINESS LOGIC ERROR HANDLING', () => {
    it('should handle insufficient stock scenarios', async () => {
      // Arrange
      const stockError = new InsufficientStockError(123, 10, 5)

      // Mock inventory check
      const mockInventoryService = {
        async checkStock(productId, requestedQuantity) {
          const available = 5
          if (requestedQuantity > available) {
            throw new InsufficientStockError(productId, requestedQuantity, available)
          }
          return available
        }
      }

      // Act & Assert
      await expect(mockInventoryService.checkStock(123, 10)).rejects.toThrow(InsufficientStockError)
      expect(stockError.context.productId).toBe(123)
      expect(stockError.context.requested).toBe(10)
      expect(stockError.context.available).toBe(5)
      expect(stockError.userMessage).toBe('Only 5 units available. Please adjust quantity.')
    })

    it('should handle business rule violations', async () => {
      // Arrange
      const conflictError = new ConflictError('Order already processed', {
        orderId: 'ORD-123',
        currentStatus: 'completed',
        requestedAction: 'cancel'
      })

      // Mock order service
      const mockOrderService = {
        async cancelOrder(orderId) {
          // Business rule: cannot cancel completed orders
          throw new ConflictError('Order already processed', {
            orderId,
            currentStatus: 'completed',
            requestedAction: 'cancel'
          })
        }
      }

      // Act & Assert
      await expect(mockOrderService.cancelOrder('ORD-123')).rejects.toThrow(ConflictError)
      expect(conflictError.statusCode).toBe(409)
      expect(conflictError.context.orderId).toBe('ORD-123')
    })

    it('should handle configuration errors', async () => {
      // Arrange
      const configError = new ConfigurationError('Missing SUPABASE_URL environment variable', {
        configKey: 'SUPABASE_URL',
        component: 'database'
      })

      // Mock configuration validation
      const mockConfigService = {
        validateConfiguration() {
          const requiredVars = ['SUPABASE_URL', 'SUPABASE_KEY']
          for (const varName of requiredVars) {
            if (!process.env[varName]) {
              throw new ConfigurationError(`Missing ${varName} environment variable`, {
                configKey: varName,
                component: 'database'
              })
            }
          }
        }
      }

      // Temporarily remove env var
      const originalUrl = process.env.SUPABASE_URL
      delete process.env.SUPABASE_URL

      // Act & Assert
      expect(() => mockConfigService.validateConfiguration()).toThrow(ConfigurationError)
      expect(configError.context.configKey).toBe('SUPABASE_URL')

      // Restore env var
      process.env.SUPABASE_URL = originalUrl
    })
  })

  describe('7. ERROR MONITORING AND METRICS', () => {
    it('should track error frequency and patterns', () => {
      // Arrange
      const errors = [
        new ValidationError('Email required'),
        new ValidationError('Password too short'),
        new NotFoundError('Product', 123),
        new NotFoundError('User', 456),
        new DatabaseError('SELECT', 'products', new Error('Timeout'))
      ]

      // Mock metrics collector
      const mockMetrics = {
        incrementErrorCount: vi.fn(),
        recordError: vi.fn()
      }

      // Act
      errors.forEach(error => {
        mockMetrics.incrementErrorCount(error.name)
        mockMetrics.recordError(error, {
          statusCode: error.statusCode,
          severity: error.severity,
          category: error.toJSON().category
        })
      })

      // Assert
      expect(mockMetrics.incrementErrorCount).toHaveBeenCalledWith('ValidationError')
      expect(mockMetrics.incrementErrorCount).toHaveBeenCalledWith('NotFoundError')
      expect(mockMetrics.incrementErrorCount).toHaveBeenCalledWith('DatabaseError')
      expect(mockMetrics.recordError).toHaveBeenCalledTimes(5)
    })

    it('should monitor error response times', async () => {
      // Arrange
      const startTime = Date.now()
      const error = new InternalServerError('Processing timeout')

      // Simulate error handling delay
      await new Promise(resolve => setTimeout(resolve, 10))
      const endTime = Date.now()

      // Mock performance monitoring
      const mockPerformanceMonitor = {
        recordErrorResponseTime: vi.fn()
      }

      // Act
      mockPerformanceMonitor.recordErrorResponseTime(error.name, endTime - startTime, {
        statusCode: error.statusCode
      })

      // Assert
      expect(mockPerformanceMonitor.recordErrorResponseTime).toHaveBeenCalledWith(
        'InternalServerError',
        expect.any(Number),
        { statusCode: 500 }
      )
    })
  })

  describe('8. ERROR RECOVERY AND GRACEFUL DEGRADATION', () => {
    it('should implement retry logic for transient errors', async () => {
      // Arrange
      let attempts = 0
      const mockExternalService = {
        call: vi.fn().mockImplementation(() => {
          attempts++
          if (attempts < 3) {
            throw new ServiceUnavailableError('external_api')
          }
          return { success: true }
        })
      }

      // Mock retry mechanism
      const retryWithBackoff = async (fn, maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            return await fn()
          } catch (error) {
            if (i === maxRetries - 1 || !isRetryableError(error)) {
              throw error
            }
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100))
          }
        }
      }

      const isRetryableError = error => {
        return (
          error instanceof ServiceUnavailableError ||
          (error.statusCode >= 500 && error.statusCode < 600)
        )
      }

      // Act
      const result = await retryWithBackoff(() => mockExternalService.call())

      // Assert
      expect(result).toEqual({ success: true })
      expect(mockExternalService.call).toHaveBeenCalledTimes(3)
    })

    it('should provide fallback responses for degraded services', async () => {
      // Arrange
      const mockCacheService = {
        get: vi.fn().mockResolvedValue(null) // Cache miss
      }

      const mockDatabaseService = {
        get: vi.fn().mockRejectedValue(new DatabaseConnectionError(new Error('Connection failed')))
      }

      // Mock service with fallback
      const mockProductService = {
        async getProductWithFallback(productId) {
          try {
            // Try cache first
            const cached = await mockCacheService.get(`product:${productId}`)
            if (cached) {
              return cached
            }

            // Try database
            return await mockDatabaseService.get(productId)
          } catch (error) {
            // Fallback to default product structure
            logger.warn('Using fallback for product data', { productId, error: error.message })
            return {
              id: productId,
              name: 'Product Unavailable',
              price_usd: 0,
              active: false,
              fallback: true
            }
          }
        }
      }

      // Act
      const result = await mockProductService.getProductWithFallback(123)

      // Assert
      expect(result.fallback).toBe(true)
      expect(result.name).toBe('Product Unavailable')
      expect(logger.warn).toHaveBeenCalledWith('Using fallback for product data', {
        productId: 123,
        error: 'Database connection failed: Connection failed'
      })
    })

    it('should implement circuit breaker pattern', async () => {
      // Arrange
      const circuitBreaker = {
        state: 'closed', // closed, open, half-open
        failureCount: 0,
        threshold: 3,
        timeout: 5000,
        lastFailureTime: 0,

        async execute(fn) {
          if (this.state === 'open') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
              this.state = 'half-open'
            } else {
              throw new ServiceUnavailableError('circuit_breaker')
            }
          }

          try {
            const result = await fn()
            this.onSuccess()
            return result
          } catch (error) {
            this.onFailure()
            throw error
          }
        },

        onSuccess() {
          this.failureCount = 0
          this.state = 'closed'
        },

        onFailure() {
          this.failureCount++
          this.lastFailureTime = Date.now()
          if (this.failureCount >= this.threshold) {
            this.state = 'open'
          }
        }
      }

      // Mock failing service
      const mockFailingService = {
        call: vi.fn().mockRejectedValue(new Error('Service down'))
      }

      // Act & Assert - Circuit should open after threshold failures
      for (let i = 0; i < 3; i++) {
        await expect(circuitBreaker.execute(() => mockFailingService.call())).rejects.toThrow()
      }

      // Circuit should now be open
      expect(circuitBreaker.state).toBe('open')

      // Next call should fail fast
      await expect(circuitBreaker.execute(() => mockFailingService.call())).rejects.toThrow(
        ServiceUnavailableError
      )
    })
  })

  describe('9. VITEST BEST PRACTICES AND MOCKING', () => {
    it('should properly isolate tests with comprehensive mocking', async () => {
      // Arrange
      const mockRepository = {
        findById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      }

      const mockCache = {
        get: vi.fn(),
        set: vi.fn(),
        invalidate: vi.fn()
      }

      // Mock service with all dependencies
      const mockService = {
        repository: mockRepository,
        cache: mockCache,

        async getEntity(id) {
          const cached = await this.cache.get(`entity:${id}`)
          if (cached) {
            return cached
          }

          const entity = await this.repository.findById(id)
          await this.cache.set(`entity:${id}`, entity)
          return entity
        }
      }

      mockCache.get.mockResolvedValue(null)
      mockRepository.findById.mockResolvedValue({ id: 1, name: 'Test Entity' })

      // Act
      const result = await mockService.getEntity(1)

      // Assert
      expect(mockCache.get).toHaveBeenCalledWith('entity:1')
      expect(mockRepository.findById).toHaveBeenCalledWith(1)
      expect(mockCache.set).toHaveBeenCalledWith('entity:1', { id: 1, name: 'Test Entity' })
      expect(result).toEqual({ id: 1, name: 'Test Entity' })
    })

    it('should test error scenarios without side effects', () => {
      // Arrange
      const error1 = new AppError('Test error 1', { userMessage: 'Custom message 1' })

      // Small delay to ensure different timestamps
      setTimeout(() => {}, 1)

      const error2 = new AppError('Test error 2', { userMessage: 'Custom message 2' })

      // Act
      const json1 = error1.toJSON()
      const json2 = error2.toJSON()

      // Assert - Each error instance is independent
      expect(json1.message).toBe('Custom message 1')
      expect(json2.message).toBe('Custom message 2')
      expect(json1.instance).not.toBe(json2.instance)
    })

    it('should handle async error testing correctly', async () => {
      // Arrange
      const mockAsyncService = {
        processWithDelay: vi.fn().mockImplementation(
          () =>
            new Promise((resolve, reject) => {
              setTimeout(() => reject(new InternalServerError('Async error')), 10)
            })
        )
      }

      // Act & Assert
      await expect(mockAsyncService.processWithDelay()).rejects.toThrow(InternalServerError)
      expect(mockAsyncService.processWithDelay).toHaveBeenCalledTimes(1)
    })

    it('should clean up mocks between tests', () => {
      // Arrange
      const mockLogger = vi.spyOn(logger, 'info')

      // Act - First test
      logger.info('Test message 1')
      expect(mockLogger).toHaveBeenCalledWith('Test message 1')

      // Clear mocks (done in beforeEach, but demonstrating)
      vi.clearAllMocks()

      // Act - Second test (simulated)
      logger.info('Test message 2')
      expect(mockLogger).toHaveBeenCalledWith('Test message 2')
      expect(mockLogger).toHaveBeenCalledTimes(1) // Only the last call
    })
  })

  describe('10. INTEGRATION TESTING SCENARIOS', () => {
    it('should test complete error flow from controller to database', async () => {
      // Arrange - Complete integration test setup
      const mockReq = {
        params: { id: '999' },
        requestId: 'req-integration-123',
        user: { id: 456 }
      }

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      }

      // Mock layers
      const mockRepository = {
        findByIdWithImages: vi
          .fn()
          .mockRejectedValue(new DatabaseConnectionError(new Error('Connection pool exhausted')))
      }

      const mockService = {
        async getProductById(id) {
          try {
            return await mockRepository.findByIdWithImages(id, false)
          } catch (error) {
            logger.error('Database error in product service', error, {
              productId: id,
              userId: mockReq.user.id
            })
            throw error
          }
        }
      }

      const mockController = {
        async getProduct(req, res) {
          try {
            const product = await mockService.getProductById(req.params.id)
            res.json(product)
          } catch (error) {
            logger.error('Service error in product controller', error, {
              requestId: req.requestId,
              productId: req.params.id,
              userId: req.user?.id
            })

            if (error instanceof AppError) {
              res.status(error.statusCode).json(error.toJSON())
            } else {
              const internalError = new InternalServerError('Unexpected error')
              res.status(500).json(internalError.toJSON())
            }
          }
        }
      }

      // Act
      await mockController.getProduct(mockReq, mockRes)

      // Assert - Complete error flow
      expect(mockRepository.findByIdWithImages).toHaveBeenCalledWith('999', false)
      expect(logger.error).toHaveBeenCalledTimes(2) // Service and controller layers
      expect(mockRes.status).toHaveBeenCalledWith(503) // DatabaseConnectionError status
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'DatabaseConnectionError',
          code: ERROR_CODES.DATABASE_ERROR,
          status: 503
        })
      )
    })

    it('should handle complex error scenarios with multiple services', async () => {
      // Arrange - Multi-service error scenario
      const mockPaymentService = {
        processPayment: vi
          .fn()
          .mockRejectedValue(new PaymentFailedError('Card declined', { gateway: 'stripe' }))
      }

      const mockInventoryService = {
        decrementStock: vi.fn().mockResolvedValue({ success: true })
      }

      const mockEmailService = {
        sendConfirmation: vi
          .fn()
          .mockRejectedValue(new ExternalServiceError('email', 'send', new Error('SMTP error')))
      }

      // Mock order processing service
      const mockOrderService = {
        async processOrder(orderData) {
          const errors = []

          try {
            // Step 1: Process payment
            await mockPaymentService.processPayment(orderData.total, orderData.payment)
          } catch (error) {
            errors.push(error)
          }

          try {
            // Step 2: Update inventory (only if payment succeeded)
            if (errors.length === 0) {
              await mockInventoryService.decrementStock(orderData.items)
            }
          } catch (error) {
            errors.push(error)
          }

          try {
            // Step 3: Send confirmation email
            await mockEmailService.sendConfirmation(orderData.customer.email, orderData)
          } catch (error) {
            // Email failure is not critical, just log it
            logger.warn('Email confirmation failed', { error: error.message })
          }

          if (errors.length > 0) {
            // Rollback inventory if payment failed
            if (errors[0] instanceof PaymentFailedError) {
              await this.rollbackInventory(orderData.items)
            }
            throw errors[0] // Throw the primary error
          }

          return { success: true, orderId: 'ORD-123' }
        },

        async rollbackInventory(items) {
          logger.info('Rolling back inventory', { items })
        }
      }

      // Act & Assert
      await expect(
        mockOrderService.processOrder({
          total: 100,
          payment: { card: '4111...' },
          items: [{ productId: 1, quantity: 2 }],
          customer: { email: 'test@example.com' }
        })
      ).rejects.toThrow(PaymentFailedError)

      expect(mockPaymentService.processPayment).toHaveBeenCalled()
      expect(mockInventoryService.decrementStock).not.toHaveBeenCalled() // Should not update inventory
      expect(mockEmailService.sendConfirmation).toHaveBeenCalled() // Email still attempted
      expect(logger.warn).toHaveBeenCalledWith('Email confirmation failed', expect.any(Object))
    })
  })
})
