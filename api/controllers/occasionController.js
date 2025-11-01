/**
 * Occasion Controller
 * Handles HTTP logic for occasion operations
 */

import * as occasionService from '../services/occasionService.js'
import { asyncHandler } from '../middleware/error/index.js'
import { BadRequestError } from '../errors/AppError.js'

/**
 * Helper Functions
 * Common utilities following KISS, DRY, and SSOT principles
 */

/**
 * Creates standardized API response
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Formatted response object
 */
const createResponse = (data, message) => ({
  success: true,
  data,
  message
})

/**
 * Gets appropriate HTTP status code for operation
 * @param {string} operation - Operation type (create, update, delete, etc.)
 * @returns {number} HTTP status code
 */
const getStatusCode = operation => {
  const statusCodes = {
    create: 201,
    update: 200,
    delete: 200,
    reactivate: 200,
    displayOrder: 200
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
const getSuccessMessage = (operation, entity = 'Occasion') => {
  const messages = {
    create: `${entity} created successfully`,
    update: `${entity} updated successfully`,
    delete: `${entity} deactivated successfully`,
    reactivate: `${entity} reactivated successfully`,
    displayOrder: 'Display order updated successfully',
    retrieve: `${entity} retrieved successfully`
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
 * GET /api/occasions
 * Get all active occasions
 */
export const getAllOccasions = asyncHandler(async (req, res) => {
  const filters = {
    limit: req.query.limit
  }

  const includeInactive = req.user?.role === 'admin'
  const occasions = await occasionService.getAllOccasions(filters, includeInactive)

  const response = createResponse(occasions, getSuccessMessage('retrieve', 'Occasions'))
  res.json(response)
})

/**
 * GET /api/occasions/:id
 * Get occasion by ID
 */
export const getOccasionById = asyncHandler(async (req, res) => {
  const includeInactive = req.user?.role === 'admin'
  const occasion = await occasionService.getOccasionById(req.params.id, includeInactive)

  const response = createResponse(occasion, getSuccessMessage('retrieve'))
  res.json(response)
})

/**
 * GET /api/occasions/slug/:slug
 * Get occasion by slug
 */
export const getOccasionBySlug = asyncHandler(async (req, res) => {
  const includeInactive = req.user?.role === 'admin'
  const occasion = await occasionService.getOccasionBySlug(req.params.slug, includeInactive)

  const response = createResponse(occasion, getSuccessMessage('retrieve'))
  res.json(response)
})

/**
 * POST /api/occasions
 * Create new occasion
 */
export const createOccasion = asyncHandler(async (req, res) => {
  const occasion = await occasionService.createOccasion(req.body)

  const response = createResponse(occasion, getSuccessMessage('create'))
  res.status(getStatusCode('create')).json(response)
})

/**
 * PUT /api/occasions/:id
 * Update occasion
 */
export const updateOccasion = asyncHandler(async (req, res) => {
  const occasion = await occasionService.updateOccasion(req.params.id, req.body)

  const response = createResponse(occasion, getSuccessMessage('update'))
  res.json(response)
})

/**
 * PATCH /api/occasions/:id/display-order
 * Update display order
 */
export const updateDisplayOrder = asyncHandler(async (req, res) => {
  const { order } = req.body

  const occasion = await occasionService.updateDisplayOrder(req.params.id, order)

  const response = createResponse(occasion, getSuccessMessage('displayOrder'))
  res.json(response)
})

/**
 * DELETE /api/occasions/:id
 * Soft-delete occasion
 */
export const deleteOccasion = asyncHandler(async (req, res) => {
  const occasion = await occasionService.deleteOccasion(req.params.id)

  const response = createResponse(occasion, getSuccessMessage('delete'))
  res.json(response)
})

/**
 * PATCH /api/occasions/:id/reactivate
 * Reactivate occasion
 */
export const reactivateOccasion = asyncHandler(async (req, res) => {
  const occasion = await occasionService.reactivateOccasion(req.params.id)

  const response = createResponse(occasion, getSuccessMessage('reactivate'))
  res.json(response)
})
