/**
 * Payment Controller
 * Handles HTTP logic for payment operations
 */

import * as paymentService from '../services/paymentService.js'
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
 * Gets appropriate success message for operation
 * @param {string} operation - Operation type
 * @param {string} entity - Entity name (user, product, etc.)
 * @returns {string} Success message
 */
const getSuccessMessage = (operation, entity = 'Payment') => {
  const messages = {
    create: `${entity} created successfully`,
    update: `${entity} updated successfully`,
    delete: `${entity} deleted successfully`,
    confirm: `${entity} confirmed successfully`,
    process: `${entity} processed successfully`,
    refund: `${entity} refunded successfully`,
    retrieve: `${entity} retrieved successfully`,
    methods: 'Payment methods retrieved successfully'
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
 * GET /api/payments/methods
 * Get available payment methods
 */
export const getPaymentMethods = asyncHandler(async (req, res) => {
  const paymentMethods = await paymentService.getPaymentMethods()

  const response = createResponse(paymentMethods, getSuccessMessage('methods'))
  res.json(response)
})

/**
 * POST /api/payments/:id/confirm
 * Confirm payment for an order
 */
export const confirmPayment = asyncHandler(async (req, res) => {
  const { id } = req.params
  const paymentData = {
    payment_method: req.body.payment_method,
    reference_number: req.body.reference_number,
    payment_details: req.body.payment_details,
    receipt_image_url: req.body.receipt_image_url,
    confirmed_by: req.user?.id
  }

  const payment = await paymentService.confirmPayment(parseInt(id), paymentData)

  const response = createResponse(payment, getSuccessMessage('confirm'))
  res.json(response)
})
