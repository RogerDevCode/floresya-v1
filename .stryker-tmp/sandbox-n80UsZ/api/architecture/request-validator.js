/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Request Validator
 * Single Responsibility: Validate request parameters
 * Follows Fail Fast principle from CLAUDE.md
 */

import { BadRequestError } from '../errors/AppError.js'

/**
 * Extract and validate product ID from request parameters
 * @param {Object} reqParams - Request parameters (req.params)
 * @returns {number} Validated product ID
 * @throws {BadRequestError} If ID is invalid
 */
export function validateProductId(reqParams) {
  const { id } = reqParams

  if (!id) {
    throw new BadRequestError('Product ID is required', {
      field: 'id',
      received: id,
      rule: 'required'
    })
  }

  const productId = Number(id)

  if (isNaN(productId) || productId <= 0) {
    throw new BadRequestError('Invalid product ID: must be a positive number', {
      field: 'id',
      received: id,
      rule: 'positive number required'
    })
  }

  return productId
}

/**
 * Extract and validate image size from query parameters
 * @param {Object} reqQuery - Request query (req.query)
 * @returns {string|null} Validated image size or null
 * @throws {BadRequestError} If image size is invalid
 */
export function validateImageSize(reqQuery) {
  const { imageSize } = reqQuery

  if (imageSize === undefined) {
    return null
  }

  const validSizes = ['small', 'medium', 'large', 'thumbnail']

  if (!validSizes.includes(imageSize)) {
    throw new BadRequestError(`Invalid imageSize: must be one of ${validSizes.join(', ')}`, {
      field: 'imageSize',
      received: imageSize,
      validValues: validSizes
    })
  }

  return imageSize
}

/**
 * Extract and validate product filters from query parameters
 * @param {Object} reqQuery - Request query (req.query)
 * @returns {Object} Validated filters
 */
export function validateProductFilters(reqQuery) {
  const filters = {}

  // Optional numeric filters
  if (reqQuery.limit !== undefined) {
    const limit = Number(reqQuery.limit)
    if (isNaN(limit) || limit < 0 || limit > 100) {
      throw new BadRequestError('Invalid limit: must be between 0 and 100', {
        field: 'limit',
        received: reqQuery.limit
      })
    }
    filters.limit = limit
  }

  if (reqQuery.offset !== undefined) {
    const offset = Number(reqQuery.offset)
    if (isNaN(offset) || offset < 0) {
      throw new BadRequestError('Invalid offset: must be a positive number', {
        field: 'offset',
        received: reqQuery.offset
      })
    }
    filters.offset = offset
  }

  // Boolean filters
  if (reqQuery.featured !== undefined) {
    filters.featured = reqQuery.featured === 'true'
  }

  // String filters
  if (reqQuery.search) {
    filters.search = String(reqQuery.search).trim()
  }

  if (reqQuery.sortBy) {
    filters.sortBy = String(reqQuery.sortQuery).trim()
  }

  if (reqQuery.occasion) {
    filters.occasion = String(reqQuery.occasion).trim()
  }

  return filters
}

/**
 * Request Validator class for dependency injection
 * Allows mocking for testing
 */
export class RequestValidator {
  /**
   * Validate product ID
   * @param {Object} reqParams - Request parameters
   * @returns {number} Validated product ID
   * @throws {BadRequestError} If invalid
   */
  validateProductId(reqParams) {
    return validateProductId(reqParams)
  }

  /**
   * Validate image size
   * @param {Object} reqQuery - Request query
   * @returns {string|null} Validated image size or null
   * @throws {BadRequestError} If invalid
   */
  validateImageSize(reqQuery) {
    return validateImageSize(reqQuery)
  }

  /**
   * Validate product filters
   * @param {Object} reqQuery - Request query
   * @returns {Object} Validated filters
   * @throws {BadRequestError} If invalid
   */
  validateProductFilters(reqQuery) {
    return validateProductFilters(reqQuery)
  }
}
