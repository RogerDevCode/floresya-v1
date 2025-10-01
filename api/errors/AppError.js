/**
 * Custom Application Error
 * Extends Error with HTTP status code and operational flag
 * Used for consistent error handling across the application
 */

class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {boolean} isOperational - Whether error is operational (expected) or programming error
   */
  constructor(message, statusCode = 500, isOperational = true) {
    super(message)

    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Predefined error types for common scenarios
 */
class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400)
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401)
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403)
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404)
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409)
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 422)
    this.details = details
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, false)
  }
}

export {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError
}
