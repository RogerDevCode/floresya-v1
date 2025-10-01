/**
 * Payment Controller
 * Handles HTTP logic for payment operations
 */

import * as paymentService from '../services/paymentService.js'
import { asyncHandler } from '../middleware/errorHandler.js'

/**
 * GET /api/payments
 * Get all payments with filters
 */
export const getAllPayments = asyncHandler(async(req, res) => {
  const filters = {
    order_id: req.query.order_id,
    status: req.query.status,
    user_id: req.query.user_id,
    limit: req.query.limit,
    offset: req.query.offset
  }

  const payments = await paymentService.getAllPayments(filters)

  res.json({
    success: true,
    data: payments,
    message: 'Payments retrieved successfully'
  })
})

/**
 * GET /api/payments/:id
 * Get payment by ID
 */
export const getPaymentById = asyncHandler(async(req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id)

  res.json({
    success: true,
    data: payment,
    message: 'Payment retrieved successfully'
  })
})

/**
 * GET /api/payments/order/:orderId
 * Get payments by order
 */
export const getPaymentsByOrder = asyncHandler(async(req, res) => {
  const payments = await paymentService.getPaymentsByOrder(req.params.orderId)

  res.json({
    success: true,
    data: payments,
    message: 'Order payments retrieved successfully'
  })
})

/**
 * GET /api/payments/user/:userId
 * Get payments by user
 */
export const getPaymentsByUser = asyncHandler(async(req, res) => {
  const filters = {
    status: req.query.status,
    limit: req.query.limit
  }

  const payments = await paymentService.getPaymentsByUser(req.params.userId, filters)

  res.json({
    success: true,
    data: payments,
    message: 'User payments retrieved successfully'
  })
})

/**
 * GET /api/payments/methods
 * Get active payment methods
 */
export const getActivePaymentMethods = asyncHandler(async(req, res) => {
  const methods = await paymentService.getActivePaymentMethods()

  res.json({
    success: true,
    data: methods,
    message: 'Payment methods retrieved successfully'
  })
})

/**
 * POST /api/payments
 * Create new payment
 */
export const createPayment = asyncHandler(async(req, res) => {
  const payment = await paymentService.createPayment(req.body)

  res.status(201).json({
    success: true,
    data: payment,
    message: 'Payment created successfully'
  })
})

/**
 * PUT /api/payments/:id
 * Update payment
 */
export const updatePayment = asyncHandler(async(req, res) => {
  const payment = await paymentService.updatePayment(req.params.id, req.body)

  res.json({
    success: true,
    data: payment,
    message: 'Payment updated successfully'
  })
})

/**
 * PATCH /api/payments/:id/confirm
 * Confirm payment
 */
export const confirmPayment = asyncHandler(async(req, res) => {
  const { adminNotes } = req.body

  const payment = await paymentService.confirmPayment(req.params.id, adminNotes)

  res.json({
    success: true,
    data: payment,
    message: 'Payment confirmed successfully'
  })
})

/**
 * PATCH /api/payments/:id/fail
 * Mark payment as failed
 */
export const failPayment = asyncHandler(async(req, res) => {
  const { reason } = req.body

  const payment = await paymentService.failPayment(req.params.id, reason)

  res.json({
    success: true,
    data: payment,
    message: 'Payment marked as failed'
  })
})

/**
 * PATCH /api/payments/:id/refund
 * Refund payment
 */
export const refundPayment = asyncHandler(async(req, res) => {
  const { isPartial, notes } = req.body

  const payment = await paymentService.refundPayment(req.params.id, isPartial, notes)

  res.json({
    success: true,
    data: payment,
    message: 'Payment refunded successfully'
  })
})
