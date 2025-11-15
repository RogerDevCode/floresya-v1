/**
 * Procesado por B
 */

/**
 * Base Controller Class
 * Provides common functionality for all controllers
 * Eliminates duplication of helper functions across controllers
 *
 * Follows CLAUDE.md guidelines: KISS, DRY, SOLID principles
 */

import { BadRequestError } from '../errors/AppError.js'
import { ValidatorService } from '../services/validation/ValidatorService.js'

/**
 * Base controller with common CRUD response patterns
 * All controllers should extend this class
 */
export class BaseController {
  /**
   * Creates standardized API response
   * @param {Object|Array} data - Response data
   * @param {string} message - Success message
   * @returns {Object} Formatted response object
   */
  createResponse(data, message) {
    return {
      success: true,
      data,
      message
    }
  }

  /**
   * Gets appropriate HTTP status code for operation
   * @param {string} operation - Operation type (create, update, delete, etc.)
   * @returns {number} HTTP status code
   */
  getStatusCode(operation) {
    const statusCodes = {
      create: 201,
      update: 200,
      delete: 200,
      reactivate: 200,
      stock: 200,
      carousel: 200,
      link: 200,
      replace: 200,
      retrieve: 200,
      occasions: 200,
      history: 200,
      cancel: 200,
      status: 200,
      verify: 200,
      reset: 200
    }

    // Fail-fast: Validate operation
    if (!statusCodes[operation]) {
      throw new BadRequestError(`Invalid operation: ${operation}`, {
        operation,
        validOperations: Object.keys(statusCodes)
      })
    }

    return statusCodes[operation]
  }

  /**
   * Gets appropriate success message for operation
   * @param {string} operation - Operation type
   * @param {string} entity - Entity name (user, product, etc.)
   * @returns {string} Success message
   */
  getSuccessMessage(operation, entity = 'Entity') {
    const messages = {
      create: `${entity} created successfully`,
      update: `${entity} updated successfully`,
      delete: `${entity} deactivated successfully`,
      reactivate: `${entity} reactivated successfully`,
      stock: 'Stock updated successfully',
      carousel: 'Carousel order updated successfully',
      link: 'Occasion linked to product successfully',
      replace: 'Product occasions updated successfully',
      retrieve: `${entity} retrieved successfully`,
      occasions: 'Product occasions retrieved successfully',
      history: 'Order status history retrieved successfully',
      cancel: `${entity} cancelled successfully`,
      status: `${entity} status updated successfully`,
      verify: `${entity} verified successfully`,
      reset: 'Password reset successfully',
      users: 'Users retrieved successfully',
      orders: 'Orders retrieved successfully',
      products: 'Products retrieved successfully'
    }

    // Fail-fast: Validate operation
    if (!messages[operation]) {
      throw new BadRequestError(`Invalid operation: ${operation}`, {
        operation,
        validOperations: Object.keys(messages)
      })
    }

    return messages[operation]
  }

  /**
   * Validates ID parameter using centralized ValidatorService
   * @param {string|number} id - ID to validate
   * @param {string} entity - Entity name for error messages
   * @returns {number} Validated ID
   */
  validateId(id, entity = 'Entity') {
    return ValidatorService.validateId(id, entity)
  }

  /**
   * Validates email using centralized ValidatorService
   * @param {string} email - Email to validate
   * @param {string} field - Field name for error messages
   * @returns {string} Validated email
   */
  validateEmail(email, field = 'email') {
    return ValidatorService.validateEmail(email, field)
  }

  /**
   * Validates enum value using centralized ValidatorService
   * @param {any} value - Value to validate
   * @param {Array} validValues - Array of valid values
   * @param {string} field - Field name for error messages
   * @returns {any} Validated value
   */
  validateEnum(value, validValues, field = 'field') {
    return ValidatorService.validateEnum(value, validValues, field)
  }

  /**
   * Validates pagination parameters
   * @param {number} limit - Limit parameter
   * @param {number} offset - Offset parameter
   * @param {string} entity - Entity name for context
   */
  validatePagination(limit, offset, entity = 'entities') {
    return ValidatorService.validatePagination(limit, offset, entity)
  }

  /**
   * Sends success response with appropriate status code
   * @param {Response} res - Express response object
   * @param {Object|Array} data - Response data
   * @param {string} operation - Operation type for status code
   * @param {string} message - Success message
   * @param {string} entity - Entity name for message
   */
  sendSuccess(res, data, operation, message = null, entity = null) {
    const responseMessage = message || this.getSuccessMessage(operation, entity)
    const response = this.createResponse(data, responseMessage)
    const statusCode = this.getStatusCode(operation)

    res.status(statusCode).json(response)
  }

  /**
   * Sends simple success response (200 OK)
   * @param {Response} res - Express response object
   * @param {Object|Array} data - Response data
   * @param {string} message - Success message
   */
  sendResponse(res, data, message) {
    const response = this.createResponse(data, message)
    res.json(response)
  }
}
