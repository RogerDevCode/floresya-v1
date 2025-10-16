/**
 * Payment Method Controller
 * Handles HTTP logic for payment method operations
 * Delegates business logic to paymentMethodService
 */

import * as paymentMethodService from '../services/paymentMethodService.js'
import { asyncHandler } from '../middleware/errorHandler.js'

/**
 * GET /api/payment-methods
 * Get all payment methods with filters
 * @returns {Object[]} - Array of payment methods
 */
export const getAllPaymentMethods = asyncHandler(async (req, res) => {
  const filters = {
    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined
  }

  const includeInactive = req.user?.role === 'admin' && req.query.includeInactive === 'true'

  const paymentMethods = await paymentMethodService.getAllPaymentMethods(filters, includeInactive)

  res.status(200).json({
    success: true,
    data: paymentMethods,
    message:
      paymentMethods.length === 0
        ? 'No payment methods found'
        : 'Payment methods retrieved successfully'
  })
})

/**
 * GET /api/payment-methods/:id
 * Get payment method by ID
 */
export const getPaymentMethodById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10)

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid id: must be a positive integer',
      message: 'Invalid id: must be a positive integer'
    })
  }

  const includeInactive = req.user?.role === 'admin'

  const paymentMethod = await paymentMethodService.getPaymentMethodById(id, includeInactive)

  res.status(200).json({
    success: true,
    data: paymentMethod,
    message: 'Payment method retrieved successfully'
  })
})

/**
 * POST /api/payment-methods
 * Create new payment method
 */
export const createPaymentMethod = asyncHandler(async (req, res) => {
  const paymentMethod = await paymentMethodService.createPaymentMethod(req.body)

  res.status(201).json({
    success: true,
    data: paymentMethod,
    message: 'Payment method created successfully'
  })
})

/**
 * PUT /api/payment-methods/:id
 * Update payment method
 */
export const updatePaymentMethod = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10)

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid id: must be a positive integer',
      message: 'Invalid id: must be a positive integer'
    })
  }

  const paymentMethod = await paymentMethodService.updatePaymentMethod(id, req.body)

  res.status(200).json({
    success: true,
    data: paymentMethod,
    message: 'Payment method updated successfully'
  })
})

/**
 * DELETE /api/payment-methods/:id
 * Soft-delete payment method
 */
export const deletePaymentMethod = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10)

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid id: must be a positive integer',
      message: 'Invalid id: must be a positive integer'
    })
  }

  const paymentMethod = await paymentMethodService.deletePaymentMethod(id)

  res.status(200).json({
    success: true,
    data: paymentMethod,
    message: 'Payment method deactivated successfully'
  })
})

/**
 * PATCH /api/payment-methods/:id/reactivate
 * Reactivate payment method
 */
export const reactivatePaymentMethod = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10)

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid id: must be a positive integer',
      message: 'Invalid id: must be a positive integer'
    })
  }

  const paymentMethod = await paymentMethodService.reactivatePaymentMethod(id)

  res.status(200).json({
    success: true,
    data: paymentMethod,
    message: 'Payment method reactivated successfully'
  })
})

/**
 * PATCH /api/payment-methods/:id/display-order
 * Update display order
 */
export const updateDisplayOrder = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10)
  const { order } = req.body

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid id: must be a positive integer',
      message: 'Invalid id: must be a positive integer'
    })
  }

  if (order === undefined || typeof order !== 'number' || order < 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid order: must be a non-negative number',
      message: 'Invalid order: must be a non-negative number'
    })
  }

  const paymentMethod = await paymentMethodService.updateDisplayOrder(id, order)

  res.status(200).json({
    success: true,
    data: paymentMethod,
    message: 'Display order updated successfully'
  })
})
