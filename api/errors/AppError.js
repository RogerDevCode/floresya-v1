/**
 * Base Application Error
 * Extends Error with enterprise-grade metadata for fail-fast error handling
 *
 * Error Metadata:
 * - code: Machine-readable error code (UPPER_SNAKE_CASE)
 * - statusCode: HTTP status code
 * - isOperational: true = expected error (user/business), false = programming error
 * - context: Additional context (table, operation, values, etc)
 * - userMessage: Safe message to show to end users
 * - timestamp: When error occurred
 * - severity: Error severity level
 */

class AppError extends Error {
  /**
   * @param {string} message - Technical error message (for logs)
   * @param {Object} options - Error options
   * @param {number} options.statusCode - HTTP status code (default: 500)
   * @param {string} options.code - Machine-readable error code
   * @param {boolean} options.isOperational - Operational vs programming error (default: true)
   * @param {Object} options.context - Additional context metadata
   * @param {string} options.userMessage - User-friendly message (optional)
   * @param {string} options.severity - Error severity: 'low' | 'medium' | 'high' | 'critical'
   */
  constructor(message, options = {}) {
    super(message)

    this.name = this.constructor.name
    this.statusCode = options.statusCode || 500
    this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = options.isOperational !== undefined ? options.isOperational : true
    this.code = options.code || 'INTERNAL_ERROR'
    this.context = options.context || {}
    this.userMessage = options.userMessage || 'An error occurred. Please try again.'
    this.timestamp = new Date().toISOString()
    this.severity = options.severity || (this.statusCode >= 500 ? 'high' : 'medium')

    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Serialize error for API response
   * @param {boolean} includeStack - Include stack trace (only in development)
   * @returns {Object} Serialized error
   */
  toJSON(includeStack = false) {
    return {
      success: false,
      error: this.name,
      code: this.code,
      message: this.userMessage,
      details: this.isOperational ? this.context : undefined,
      timestamp: this.timestamp,
      ...(includeStack && { stack: this.stack })
    }
  }
}

/**
 * HTTP 4xx Client Errors
 */

class BadRequestError extends AppError {
  constructor(message, context = {}) {
    super(message, {
      statusCode: 400,
      code: 'BAD_REQUEST',
      context,
      userMessage: 'Invalid request. Please check your input.',
      severity: 'low'
    })
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', context = {}) {
    super(message, {
      statusCode: 401,
      code: 'UNAUTHORIZED',
      context,
      userMessage: 'Please log in to continue.',
      severity: 'medium'
    })
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access denied', context = {}) {
    super(message, {
      statusCode: 403,
      code: 'FORBIDDEN',
      context,
      userMessage: 'You do not have permission to access this resource.',
      severity: 'medium'
    })
  }
}

class NotFoundError extends AppError {
  constructor(resource, id, context = {}) {
    const message = `${resource} with ID ${id} not found`
    super(message, {
      statusCode: 404,
      code: 'RESOURCE_NOT_FOUND',
      context: { resource, id, ...context },
      userMessage: `The requested ${resource.toLowerCase()} was not found.`,
      severity: 'low'
    })
  }
}

class ConflictError extends AppError {
  constructor(message, context = {}) {
    super(message, {
      statusCode: 409,
      code: 'RESOURCE_CONFLICT',
      context,
      userMessage: 'This operation conflicts with existing data.',
      severity: 'medium'
    })
  }
}

class ValidationError extends AppError {
  constructor(message, validationErrors = {}) {
    super(message, {
      statusCode: 400,
      code: 'VALIDATION_FAILED',
      context: { validationErrors },
      userMessage: 'Validation failed. Please check your input.',
      severity: 'low'
    })
  }

  /**
   * Override toJSON to return 'validation' instead of 'ValidationError' for API compatibility
   */
  toJSON(includeStack = false) {
    return {
      success: false,
      error: 'validation', // Tests expect 'validation' not 'ValidationError'
      code: this.code,
      message: this.userMessage,
      details: this.isOperational ? this.context : undefined,
      timestamp: this.timestamp,
      ...(includeStack && { stack: this.stack })
    }
  }
}

/**
 * HTTP 5xx Server Errors
 */

class InternalServerError extends AppError {
  constructor(message, context = {}) {
    super(message, {
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      isOperational: false,
      context,
      userMessage: 'An unexpected error occurred. Please try again later.',
      severity: 'critical'
    })
  }
}

class ServiceUnavailableError extends AppError {
  constructor(service, context = {}) {
    super(`Service ${service} is currently unavailable`, {
      statusCode: 503,
      code: 'SERVICE_UNAVAILABLE',
      context: { service, ...context },
      userMessage: 'Service temporarily unavailable. Please try again later.',
      severity: 'high'
    })
  }
}

/**
 * Database-Specific Errors (Enterprise-grade)
 */

class DatabaseError extends AppError {
  constructor(operation, table, originalError, context = {}) {
    const message = `Database ${operation} failed on table ${table}: ${originalError.message}`
    super(message, {
      statusCode: 500,
      code: 'DATABASE_ERROR',
      isOperational: false,
      context: {
        operation, // 'SELECT', 'INSERT', 'UPDATE', 'DELETE'
        table,
        originalError: originalError.message,
        ...context
      },
      userMessage: 'A database error occurred. Please try again.',
      severity: 'critical'
    })
  }
}

class DatabaseConnectionError extends AppError {
  constructor(originalError, context = {}) {
    super(`Database connection failed: ${originalError.message}`, {
      statusCode: 503,
      code: 'DATABASE_CONNECTION_FAILED',
      isOperational: false,
      context: { originalError: originalError.message, ...context },
      userMessage: 'Database connection error. Please try again later.',
      severity: 'critical'
    })
  }
}

class DatabaseConstraintError extends AppError {
  constructor(constraint, table, context = {}) {
    super(`Database constraint violation: ${constraint} on table ${table}`, {
      statusCode: 409,
      code: 'DATABASE_CONSTRAINT_VIOLATION',
      context: { constraint, table, ...context },
      userMessage: 'This operation violates a data constraint.',
      severity: 'medium'
    })
  }
}

/**
 * Business Logic Errors (Domain-specific)
 */

class InsufficientStockError extends AppError {
  constructor(productId, requested, available) {
    super(
      `Insufficient stock for product ${productId}: requested ${requested}, available ${available}`,
      {
        statusCode: 409,
        code: 'INSUFFICIENT_STOCK',
        context: { productId, requested, available },
        userMessage: `Only ${available} units available. Please adjust quantity.`,
        severity: 'low'
      }
    )
  }
}

class PaymentFailedError extends AppError {
  constructor(reason, context = {}) {
    super(`Payment failed: ${reason}`, {
      statusCode: 402,
      code: 'PAYMENT_FAILED',
      context: { reason, ...context },
      userMessage: 'Payment failed. Please check your payment method.',
      severity: 'high'
    })
  }
}

class OrderNotProcessableError extends AppError {
  constructor(orderId, reason, context = {}) {
    super(`Order ${orderId} cannot be processed: ${reason}`, {
      statusCode: 422,
      code: 'ORDER_NOT_PROCESSABLE',
      context: { orderId, reason, ...context },
      userMessage: `Order cannot be processed: ${reason}`,
      severity: 'medium'
    })
  }
}

class InvalidStateTransitionError extends AppError {
  constructor(entity, currentState, targetState, context = {}) {
    super(`Invalid state transition for ${entity}: ${currentState} → ${targetState}`, {
      statusCode: 409,
      code: 'INVALID_STATE_TRANSITION',
      context: { entity, currentState, targetState, ...context },
      userMessage: `Cannot change ${entity} from ${currentState} to ${targetState}.`,
      severity: 'medium'
    })
  }
}

/**
 * External Service Errors
 */

class ExternalServiceError extends AppError {
  constructor(service, operation, originalError, context = {}) {
    super(`External service ${service} failed during ${operation}: ${originalError.message}`, {
      statusCode: 502,
      code: 'EXTERNAL_SERVICE_ERROR',
      context: {
        service,
        operation,
        originalError: originalError.message,
        ...context
      },
      userMessage: 'An external service is currently unavailable. Please try again later.',
      severity: 'high'
    })
  }
}

class RateLimitExceededError extends AppError {
  constructor(limit, window, context = {}) {
    super(`Rate limit exceeded: ${limit} requests per ${window}`, {
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      context: { limit, window, ...context },
      userMessage: 'Too many requests. Please try again later.',
      severity: 'low'
    })
  }
}

/**
 * Export all error classes
 */
export {
  // Base
  AppError,
  // HTTP 4xx
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  // HTTP 5xx
  InternalServerError,
  ServiceUnavailableError,
  // Database
  DatabaseError,
  DatabaseConnectionError,
  DatabaseConstraintError,
  // Business Logic
  InsufficientStockError,
  PaymentFailedError,
  OrderNotProcessableError,
  InvalidStateTransitionError,
  // External Services
  ExternalServiceError,
  RateLimitExceededError
}
