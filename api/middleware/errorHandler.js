/**
 * Centralized Error Handler Middleware
 * Catches all errors and formats consistent responses
 */

import logger from './logger.js'
import { AppError } from '../errors/AppError.js'

/**
 * Error handler middleware
 * Must be last middleware in the stack
 */
export function errorHandler(err, req, res, _next) {
  let error = err

  // Convert non-AppError errors to AppError
  if (!(err instanceof AppError)) {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal server error'
    error = new AppError(message, statusCode, false)
    error.stack = err.stack
  }

  // Log error
  if (error.statusCode >= 500) {
    logger.error('Server Error', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
      path: req.path,
      method: req.method
    })
  } else {
    logger.warn('Client Error', {
      message: error.message,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method
    })
  }

  // Format error response
  const response = {
    success: false,
    error: error.message,
    message: error.message
  }

  // Add validation details if present
  if (error.details) {
    response.details = error.details
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack
  }

  res.status(error.statusCode).json(response)
}

/**
 * Handle 404 Not Found
 * Place before errorHandler
 */
export function notFoundHandler(req, res, next) {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404)
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
