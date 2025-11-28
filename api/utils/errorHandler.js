/**
 * Procesado por B
 */

/**
 * Centralized Error Handling Utility
 * Provides consistent error logging and rethrowing patterns
 * Reduces code duplication across services and controllers
 *
 * Follows CLAUDE.md guidelines: Fail Fast AF, consistent error logging + rethrowing
 */

// Imports removed as they were unused
import { withErrorMapping } from '../middleware/error/supabaseErrorMapper.wrapper.js'

/**
 * Generic error handler wrapper for service operations
 * @param {Function} operation - Async operation to execute
 * @param {string} operationName - Name for logging context
 * @param {Object} context - Additional context for error logging
 * @returns {*} Operation result
 * @throws {AppError} Rethrows any error after logging
 */
export const handleServiceError = withErrorMapping(
  async (operation, operationName, context = {}) => {
    return await operation()
  },
  'SERVICE_OPERATION',
  'unknown'
)

/**
 * Error handler for repository operations with database context
 * @param {Function} operation - Repository operation
 * @param {string} entity - Entity name (e.g., 'Product', 'User')
 * @param {string} method - Method name (e.g., 'findById', 'create')
 * @param {Object} params - Operation parameters for logging
 * @returns {*} Operation result
 * @throws {AppError} Rethrows any error after logging
 */
export const handleRepositoryError = withErrorMapping(
  async (operation, entity, method, params = {}) => {
    return await operation()
  },
  'REPOSITORY_OPERATION',
  'unknown'
)

/**
 * Error handler for external API calls
 * @param {Function} operation - API call operation
 * @param {string} serviceName - External service name
 * @param {string} endpoint - API endpoint
 * @param {Object} requestData - Request data for logging
 * @returns {*} Operation result
 * @throws {AppError} Rethrows any error after logging
 */
export const handleApiError = withErrorMapping(
  async (operation, serviceName, endpoint, requestData = {}) => {
    return await operation()
  },
  'API_CALL',
  'unknown'
)

/**
 * Error handler for file system operations
 * @param {Function} operation - File operation
 * @param {string} operationType - Type of operation (read, write, delete)
 * @param {string} filePath - File path
 * @returns {*} Operation result
 * @throws {AppError} Rethrows any error after logging
 */
export const handleFileError = withErrorMapping(
  async (operation, operationType, filePath) => {
    return await operation()
  },
  'FILE_OPERATION',
  'unknown'
)

/**
 * Error handler for validation operations
 * @param {Function} operation - Validation operation
 * @param {string} entity - Entity being validated
 * @param {Object} data - Data being validated
 * @returns {*} Operation result
 * @throws {AppError} Rethrows any error after logging
 */
export const handleValidationError = withErrorMapping(
  async (operation, entity, data = {}) => {
    return await operation()
  },
  'VALIDATION',
  'unknown'
)

/**
 * Generic error handler with custom context
 * @param {Function} operation - Operation to execute
 * @param {Object} context - Full context object for logging
 * @returns {*} Operation result
 * @throws {AppError} Rethrows any error after logging
 */
export const handleError = withErrorMapping(
  async (operation, context = {}) => {
    return await operation()
  },
  'OPERATION',
  'unknown'
)

/**
 * Safe execution wrapper that converts errors to AppError
 * @param {Function} operation - Operation to execute
 * @param {string} operationName - Name for logging
 * @param {Object} context - Additional context
 * @returns {*} Operation result or throws AppError
 */
export const safeExecute = withErrorMapping(
  async (operation, operationName, context = {}) => {
    return await operation()
  },
  'SAFE_EXECUTION',
  'unknown'
)
