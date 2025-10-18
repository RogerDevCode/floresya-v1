/**
 * Centralized Error Handler Middleware (ENTERPRISE-GRADE)
 * - Catches all errors and formats consistent responses
 * - Uses error.toJSON() for serialization
 * - Severity-based logging
 * - Structured error metadata
 * - Security: Never expose sensitive data in production
 */

import logger from './logger.js'
import { AppError, InternalServerError } from '../errors/AppError.js'

/**
 * Error handler middleware
 * Must be last middleware in the stack
 * @param {Error} err - Error object
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} _next - Express next (unused but required by Express)
 */
export function errorHandler(err, req, res, _next) {
  // _next parameter is required by Express middleware signature but not used in error handlers
  let error = err

  // Convert non-AppError errors to AppError (fail-fast wrapper)
  if (!(err instanceof AppError)) {
    const message = err.message || 'Internal server error'
    error = new InternalServerError(message, {
      originalError: err.message,
      originalStatusCode: err.statusCode || 500,
      stack: err.stack
    })
    error.stack = err.stack
  }

  // ENTERPRISE LOGGING: Severity-based with structured metadata
  const logMetadata = {
    errorName: error.name,
    errorCode: error.code,
    statusCode: error.statusCode,
    severity: error.severity,
    path: req.path,
    method: req.method,
    userAgent: req.get('user-agent'),
    ip: req.ip,
    timestamp: error.timestamp,
    context: error.context,
    isOperational: error.isOperational
  }

  // Log based on severity (not just statusCode)
  switch (error.severity) {
    case 'critical':
      logger.error('CRITICAL ERROR', { ...logMetadata, stack: error.stack })
      // TODO: Send to monitoring service (Sentry, Datadog)
      break
    case 'high':
      logger.error('High Severity Error', { ...logMetadata, stack: error.stack })
      break
    case 'medium':
      logger.warn('Medium Severity Error', logMetadata)
      break
    case 'low':
      logger.info('Low Severity Error', logMetadata)
      break
    default:
      logger.warn('Unknown Severity Error', logMetadata)
  }

  // Use error.toJSON() for consistent serialization
  const isDevelopment = process.env.NODE_ENV === 'development'
  const response = error.toJSON(isDevelopment)

  // DEBUG: Log error type processing
  console.log('🔍 DEBUG: ErrorHandler processing error', {
    errorName: error.name,
    errorTypeInResponse: response.error,
    statusCode: error.statusCode,
    isValidationError: error.name === 'ValidationError',
    expectedType: 'ValidationError',
    actualType: response.error
  })

  // SECURITY: Never expose stack traces or internal context in production
  if (!isDevelopment && error.statusCode >= 500) {
    delete response.details
  }

  res.status(error.statusCode).json(response)
}

/**
 * Handle 404 Not Found (ENTERPRISE)
 * Place before errorHandler
 */
export function notFoundHandler(req, res, next) {
  const error = new AppError(`Route ${req.originalUrl} not found`, {
    statusCode: 404,
    code: 'ROUTE_NOT_FOUND',
    context: {
      path: req.originalUrl,
      method: req.method
    },
    userMessage: 'The requested endpoint does not exist.',
    severity: 'low'
  })
  next(error)
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
