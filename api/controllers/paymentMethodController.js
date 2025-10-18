/**
 * Payment Method Controller
 * Handles HTTP logic for payment method operations
 * Delegates business logic to paymentMethodService
 */

import * as paymentMethodService from '../services/paymentMethodService.js'
import { asyncHandler } from '../middleware/errorHandler.js'

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
    display: 200
  }
  return statusCodes[operation] || 200
}

/**
 * Gets appropriate success message for operation
 * @param {string} operation - Operation type
 * @param {string} entity - Entity name (user, product, etc.)
 * @returns {string} Success message
 */
const getSuccessMessage = (operation, entity = 'Payment method') => {
  const messages = {
    create: `${entity} created successfully`,
    update: `${entity} updated successfully`,
    delete: `${entity} deactivated successfully`,
    reactivate: `${entity} reactivated successfully`,
    display: 'Display order updated successfully',
    retrieve: `${entity} retrieved successfully`,
    methods: 'Payment methods retrieved successfully'
  }
  return messages[operation] || `${entity} operation completed successfully`
}

/**
 * GET /api/payment-methods
 * Get all payment methods with filters
 */
export const getAllPaymentMethods = asyncHandler(async (req, res) => {
  const filters = {
    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined
  }

  const includeInactive = req.user?.role === 'admin' && req.query.includeInactive === 'true'
  const paymentMethods = await paymentMethodService.getAllPaymentMethods(filters, includeInactive)

  const response = createResponse(paymentMethods, getSuccessMessage('methods'))
  res.json(response)
})

/**
 * GET /api/payment-methods/:id
 * Get payment method by ID
 */
export const getPaymentMethodById = asyncHandler(async (req, res) => {
  const includeInactive = req.user?.role === 'admin'
  const paymentMethod = await paymentMethodService.getPaymentMethodById(
    req.params.id,
    includeInactive
  )

  const response = createResponse(paymentMethod, getSuccessMessage('retrieve'))
  res.json(response)
})

/**
 * POST /api/payment-methods
 * Create new payment method
 */
export const createPaymentMethod = asyncHandler(async (req, res) => {
  const paymentMethod = await paymentMethodService.createPaymentMethod(req.body)

  const response = createResponse(paymentMethod, getSuccessMessage('create'))
  res.status(getStatusCode('create')).json(response)
})

/**
 * PUT /api/payment-methods/:id
 * Update payment method
 */
export const updatePaymentMethod = asyncHandler(async (req, res) => {
  const paymentMethod = await paymentMethodService.updatePaymentMethod(req.params.id, req.body)

  const response = createResponse(paymentMethod, getSuccessMessage('update'))
  res.json(response)
})

/**
 * DELETE /api/payment-methods/:id
 * Soft-delete payment method
 */
export const deletePaymentMethod = asyncHandler(async (req, res) => {
  const paymentMethod = await paymentMethodService.deletePaymentMethod(req.params.id)

  const response = createResponse(paymentMethod, getSuccessMessage('delete'))
  res.json(response)
})

/**
 * PATCH /api/payment-methods/:id/reactivate
 * Reactivate payment method
 */
export const reactivatePaymentMethod = asyncHandler(async (req, res) => {
  const paymentMethod = await paymentMethodService.reactivatePaymentMethod(req.params.id)

  const response = createResponse(paymentMethod, getSuccessMessage('reactivate'))
  res.json(response)
})

/**
 * PATCH /api/payment-methods/:id/display-order
 * Update display order
 */
export const updateDisplayOrder = asyncHandler(async (req, res) => {
  const { order } = req.body
  const paymentMethod = await paymentMethodService.updateDisplayOrder(req.params.id, order)

  const response = createResponse(paymentMethod, getSuccessMessage('display'))
  res.json(response)
})
