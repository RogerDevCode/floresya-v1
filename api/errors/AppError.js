/**
 * Procesado por B
 */

/**
 * Base Application Error
 * Extends Error with enterprise-grade metadata for fail-fast error handling
 *
 * Error Metadata:
 * - code: Numeric error code from ERROR_CODES (machine-readable)
 * - error: Human-readable error name (ValidationError, etc.)
 * - statusCode: HTTP status code
 * - isOperational: true = expected error (user/business), false = programming error
 * - context: Additional context (table, operation, values, etc)
 * - userMessage: Safe message to show to end users
 * - timestamp: When error occurred
 * - severity: Error severity level
 */

import { ERROR_CODES, getErrorCategory } from '../config/errorCodes.js'

class AppError extends Error {
  /**
   * @param {string} message - Technical error message (for logs)
   * @param {Object} options - Error options
   * @param {number} options.statusCode - HTTP status code (default: 500)
   * @param {number} options.code - Numeric error code from ERROR_CODES
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
    this.code = options.code || ERROR_CODES.INTERNAL_SERVER_ERROR
    this.context = options.context || {}
    this.userMessage = options.userMessage || 'An error occurred. Please try again.'
    this.timestamp = new Date().toISOString()
    this.severity = options.severity || (this.statusCode >= 500 ? 'high' : 'medium')

    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Serialize error for API response (RFC 7807 compliant)
   * @param {boolean} includeStack - Include stack trace (only in development)
   * @returns {Object} Serialized error (RFC 7807 + FloresYa extensions)
   */
  toJSON(includeStack = false) {
    const baseResponse = {
      success: false,
      // FloresYa extensions
      error: this.name, // Human-readable: "ValidationError"
      code: this.code, // Machine-readable: 1001
      category: getErrorCategory(this.code), // 'validation', 'auth', etc.
      // User-friendly message (FloresYa extension + RFC 7807 compatibility)
      message: this.userMessage,
      // RFC 7807 standard fields
      type: this.getTypeUrl(),
      title: this.getTitle(),
      status: this.statusCode,
      detail: this.userMessage, // RFC 7807 requires 'detail'
      instance: this.getInstanceUrl(),
      // Additional metadata
      timestamp: this.timestamp,
      path: this.context?.path,
      requestId: this.context?.requestId,
      // Context details (include if context exists, regardless of isOperational)
      ...(this.context && { details: this.context }),
      // Development-only fields
      ...(includeStack && { stack: this.stack })
    }

    // Remove undefined values
    Object.keys(baseResponse).forEach(key => {
      if (baseResponse[key] === undefined) {
        delete baseResponse[key]
      }
    })

    return baseResponse
  }

  /**
   * Get RFC 7807 type URL
   * @returns {string} Type URL
   */
  getTypeUrl() {
    const baseUrl = 'https://api.floresya.com/errors'
    const category = getErrorCategory(this.code)
    const errorName = this.name.replace('Error', '').toLowerCase()
    return `${baseUrl}/${category}/${errorName}`
  }

  /**
   * Get RFC 7807 title
   * @returns {string} Human-readable title
   */
  getTitle() {
    const titles = {
      ValidationError: 'Validation Failed',
      BadRequestError: 'Bad Request',
      UnauthorizedError: 'Unauthorized',
      ForbiddenError: 'Forbidden',
      NotFoundError: 'Resource Not Found',
      ConflictError: 'Conflict',
      InternalServerError: 'Internal Server Error',
      DatabaseError: 'Database Error',
      ServiceUnavailableError: 'Service Unavailable'
    }
    return titles[this.name] || this.name
  }

  /**
   * Get RFC 7807 instance URL
   * @returns {string} Instance identifier
   */
  getInstanceUrl() {
    if (this.context.requestId) {
      return `/errors/${this.context.requestId}`
    }
    return `/errors/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * HTTP 4xx Client Errors
 */

class PayloadTooLargeError extends AppError {
  constructor(message, context = {}) {
    super(message, {
      statusCode: 413,
      code: ERROR_CODES.VALUE_OUT_OF_RANGE,
      context,
      userMessage: 'The requested resource is too large to process.',
      severity: 'low'
    })
  }
}

class BadRequestError extends AppError {
  constructor(message, context = {}) {
    super(message, {
      statusCode: 400,
      code: ERROR_CODES.INVALID_INPUT,
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
      code: ERROR_CODES.UNAUTHORIZED,
      context,
      userMessage: context.userMessage || message || 'Please log in to continue.',
      severity: 'medium'
    })
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access denied', context = {}) {
    super(message, {
      statusCode: 403,
      code: ERROR_CODES.FORBIDDEN,
      context,
      userMessage: context.userMessage || message || 'You do not have permission to access this resource.',
      severity: 'medium'
    })
  }
}

class NotFoundError extends AppError {
  constructor(resource, id, context = {}) {
    const message = `${resource} with ID ${id} not found`
    super(message, {
      statusCode: 404,
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
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
      code: ERROR_CODES.RESOURCE_CONFLICT,
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
      code: ERROR_CODES.VALIDATION_FAILED,
      context: { validationErrors },
      userMessage: 'Validation failed. Please check your input.',
      severity: 'low'
    })
    this.name = 'ValidationError'
  }

  /**
   * Override toJSON to include validation errors in response
   * @param {boolean} includeStack - Include stack trace
   * @returns {Object} Serialized error with validation details
   */
  toJSON(includeStack = false) {
    const errorResponse = super.toJSON(includeStack)
    // Ensure validationErrors are included in the response
    if (this.context?.validationErrors) {
      errorResponse.validationErrors = this.context.validationErrors
    }
    return errorResponse
  }
}

/**
 * HTTP 5xx Server Errors
 */

class InternalServerError extends AppError {
  constructor(message, context = {}) {
    super(message, {
      statusCode: 500,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
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
      code: ERROR_CODES.SERVICE_UNAVAILABLE,
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
      code: ERROR_CODES.DATABASE_ERROR,
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
      code: ERROR_CODES.DATABASE_ERROR,
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
      code: ERROR_CODES.RESOURCE_CONFLICT,
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
        code: ERROR_CODES.INSUFFICIENT_STOCK,
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
      code: ERROR_CODES.PAYMENT_FAILED,
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
      code: ERROR_CODES.ORDER_CANNOT_BE_PROCESSED,
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
      code: ERROR_CODES.INVALID_STATE_TRANSITION,
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
      code: ERROR_CODES.EXTERNAL_SERVICE_ERROR,
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
      code: ERROR_CODES.NETWORK_ERROR,
      context: { limit, window, ...context },
      userMessage: 'Too many requests. Please try again later.',
      severity: 'low'
    })
  }
}

/**
 * Storage Errors
 */

class StorageError extends AppError {
  constructor(operation, bucket, originalError, context = {}) {
    const message = `Storage ${operation} failed on bucket ${bucket}: ${originalError.message}`
    super(message, {
      statusCode: 500,
      code: ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      isOperational: false,
      context: {
        operation, // 'UPLOAD', 'DELETE', 'GET_URL'
        bucket,
        originalError: originalError.message,
        ...context
      },
      userMessage: 'A storage error occurred. Please try again.',
      severity: 'high'
    })
  }
}

/**
 * Configuration Errors
 */

class ConfigurationError extends AppError {
  constructor(message, context = {}) {
    super(message, {
      statusCode: 500,
      code: ERROR_CODES.CONFIGURATION_ERROR,
      isOperational: false,
      context,
      userMessage: 'Server configuration error. Please contact support.',
      severity: 'critical'
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
  PayloadTooLargeError,
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
  RateLimitExceededError,
  // Storage
  StorageError,
  // Configuration
  ConfigurationError,
  // Constants
  ERROR_CODES
}
