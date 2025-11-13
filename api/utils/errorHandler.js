/**
 * Centralized Error Handling Utility
 * Provides consistent error logging and rethrowing patterns
 * Reduces code duplication across services and controllers
 *
 * Follows CLAUDE.md guidelines: Fail Fast AF, consistent error logging + rethrowing
 */

import { log } from './logger.js'
import { AppError, InternalServerError } from '../errors/AppError.js'

/**
 * Generic error handler wrapper for service operations
 * @param {Function} operation - Async operation to execute
 * @param {string} operationName - Name for logging context
 * @param {Object} context - Additional context for error logging
 * @returns {*} Operation result
 * @throws {AppError} Rethrows any error after logging
 */
export async function handleServiceError(operation, operationName, context = {}) {
  try {
    return await operation()
  } catch (error) {
    // Log error with structured context
    log.error(`Service operation failed: ${operationName}`, {
      operation: operationName,
      error: error.message,
      context,
      stack: error.stack
    })

    // Rethrow to maintain fail-fast behavior
    throw error
  }
}

/**
 * Error handler for repository operations with database context
 * @param {Function} operation - Repository operation
 * @param {string} entity - Entity name (e.g., 'Product', 'User')
 * @param {string} method - Method name (e.g., 'findById', 'create')
 * @param {Object} params - Operation parameters for logging
 * @returns {*} Operation result
 * @throws {AppError} Rethrows any error after logging
 */
export async function handleRepositoryError(operation, entity, method, params = {}) {
  try {
    return await operation()
  } catch (error) {
    // Log with database operation context
    log.error(`Repository operation failed: ${entity}.${method}`, {
      entity,
      method,
      params,
      error: error.message,
      stack: error.stack
    })

    // Rethrow to maintain fail-fast behavior
    throw error
  }
}

/**
 * Error handler for external API calls
 * @param {Function} operation - API call operation
 * @param {string} serviceName - External service name
 * @param {string} endpoint - API endpoint
 * @param {Object} requestData - Request data for logging
 * @returns {*} Operation result
 * @throws {AppError} Rethrows any error after logging
 */
export async function handleApiError(operation, serviceName, endpoint, requestData = {}) {
  try {
    return await operation()
  } catch (error) {
    // Log with API context
    log.error(`External API call failed: ${serviceName} - ${endpoint}`, {
      service: serviceName,
      endpoint,
      requestData,
      error: error.message,
      stack: error.stack
    })

    // Rethrow to maintain fail-fast behavior
    throw error
  }
}

/**
 * Error handler for file system operations
 * @param {Function} operation - File operation
 * @param {string} operationType - Type of operation (read, write, delete)
 * @param {string} filePath - File path
 * @returns {*} Operation result
 * @throws {AppError} Rethrows any error after logging
 */
export async function handleFileError(operation, operationType, filePath) {
  try {
    return await operation()
  } catch (error) {
    // Log with file system context
    log.error(`File operation failed: ${operationType} - ${filePath}`, {
      operation: operationType,
      filePath,
      error: error.message,
      stack: error.stack
    })

    // Rethrow to maintain fail-fast behavior
    throw error
  }
}

/**
 * Error handler for validation operations
 * @param {Function} operation - Validation operation
 * @param {string} entity - Entity being validated
 * @param {Object} data - Data being validated
 * @returns {*} Operation result
 * @throws {AppError} Rethrows any error after logging
 */
export async function handleValidationError(operation, entity, data = {}) {
  try {
    return await operation()
  } catch (error) {
    // Log with validation context
    log.error(`Validation failed: ${entity}`, {
      entity,
      data,
      error: error.message,
      stack: error.stack
    })

    // Rethrow to maintain fail-fast behavior
    throw error
  }
}

/**
 * Generic error handler with custom context
 * @param {Function} operation - Operation to execute
 * @param {Object} context - Full context object for logging
 * @returns {*} Operation result
 * @throws {AppError} Rethrows any error after logging
 */
export async function handleError(operation, context = {}) {
  try {
    return await operation()
  } catch (error) {
    // Log with full context
    log.error(`Operation failed: ${context.operation || 'unknown'}`, {
      ...context,
      error: error.message,
      stack: error.stack
    })

    // Rethrow to maintain fail-fast behavior
    throw error
  }
}

/**
 * Safe execution wrapper that converts errors to AppError
 * @param {Function} operation - Operation to execute
 * @param {string} operationName - Name for logging
 * @param {Object} context - Additional context
 * @returns {*} Operation result or throws AppError
 */
export async function safeExecute(operation, operationName, context = {}) {
  try {
    return await operation()
  } catch (error) {
    // Convert to AppError if not already
    const appError =
      error instanceof AppError
        ? error
        : new InternalServerError(`${operationName} failed: ${error.message}`, {
            originalError: error.message,
            operation: operationName,
            context,
            stack: error.stack
          })

    // Log error
    log.error(`Safe execution failed: ${operationName}`, {
      operation: operationName,
      context,
      error: appError.message,
      stack: appError.stack
    })

    throw appError
  }
}
