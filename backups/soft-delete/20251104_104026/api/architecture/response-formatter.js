/**
 * Response Formatter
 * Single Responsibility: Format API responses consistently
 * Follows OpenAPI and FloresYa response standards
 */

/**
 * HTTP Status Codes enum for clarity
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
}

/**
 * Success response formatter
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} Formatted response
 */
export function successResponse(res, data, message = 'Success', statusCode = HTTP_STATUS.OK) {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  })
}

/**
 * Error response formatter
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response
 */
export function errorResponse(res, error) {
  // Determine status code based on error type
  const statusCode = getErrorStatusCode(error)

  // Format error consistently
  const errorResponse = {
    success: false,
    error: {
      name: error.name || 'Error',
      message: error.message || 'An error occurred',
      code: error.code || 'ERROR'
    }
  }

  // Add additional details if available
  if (error.details) {
    errorResponse.error.details = error.details
  }

  if (error.stack && process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack
  }

  return res.status(statusCode).json(errorResponse)
}

/**
 * Paginated response formatter
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data
 * @param {Object} pagination - Pagination metadata
 * @param {string} message - Success message
 * @returns {Object} Formatted paginated response
 */
export function paginatedResponse(res, data, pagination, message = 'Data retrieved successfully') {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data,
    pagination: {
      total: pagination.total || data.length,
      page: pagination.page || 1,
      limit: pagination.limit || data.length,
      pages:
        pagination.pages ||
        Math.ceil((pagination.total || data.length) / (pagination.limit || data.length))
    },
    message
  })
}

/**
 * Determine HTTP status code from error
 * @param {Error} error - Error object
 * @returns {number} HTTP status code
 */
function getErrorStatusCode(error) {
  // Extract from error object if available
  if (error.statusCode) {
    return error.statusCode
  }

  if (error.status) {
    return error.status
  }

  // Map error types to status codes
  const errorTypeMap = {
    ValidationError: HTTP_STATUS.BAD_REQUEST,
    NotFoundError: HTTP_STATUS.NOT_FOUND,
    DatabaseError: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    UnauthorizedError: HTTP_STATUS.UNAUTHORIZED,
    ForbiddenError: HTTP_STATUS.FORBIDDEN,
    ConflictError: HTTP_STATUS.CONFLICT
  }

  return errorTypeMap[error.name] || HTTP_STATUS.INTERNAL_SERVER_ERROR
}

/**
 * Response Formatter class for dependency injection
 * Allows mocking for testing
 */
export class ResponseFormatter {
  /**
   * @param {number} defaultStatusCode - Default HTTP status code for success
   */
  constructor(defaultStatusCode = HTTP_STATUS.OK) {
    this.defaultStatusCode = defaultStatusCode
  }

  /**
   * Format success response
   * @param {Object} res - Express response
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   * @returns {Object} Formatted response
   */
  success(res, data, message = 'Success', statusCode = this.defaultStatusCode) {
    return successResponse(res, data, message, statusCode)
  }

  /**
   * Format error response
   * @param {Object} res - Express response
   * @param {Error} error - Error object
   * @returns {Object} Formatted error response
   */
  error(res, error) {
    return errorResponse(res, error)
  }

  /**
   * Format paginated response
   * @param {Object} res - Express response
   * @param {Array} data - Array of data
   * @param {Object} pagination - Pagination metadata
   * @param {string} message - Success message
   * @returns {Object} Formatted paginated response
   */
  paginated(res, data, pagination, message = 'Data retrieved successfully') {
    return paginatedResponse(res, data, pagination, message)
  }
}
