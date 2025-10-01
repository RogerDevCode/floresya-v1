/**
 * Payment Routes
 * Defines routes for payment operations
 */

import express from 'express'
import * as paymentController from '../controllers/paymentController.js'
import { authenticate, authorize, checkOwnership } from '../middleware/auth.js'
import { validate, validateId, validatePagination } from '../middleware/validate.js'

const router = express.Router()

// Admin-only: Get all payments
router.get(
  '/',
  authenticate,
  authorize('admin'),
  validatePagination,
  paymentController.getAllPayments
)

// Get payment methods (public)
router.get('/methods', paymentController.getActivePaymentMethods)

// Get payment by ID (admin only)
router.get('/:id', authenticate, authorize('admin'), validateId(), paymentController.getPaymentById)

// Get payments by order
router.get(
  '/order/:orderId',
  authenticate,
  validateId('orderId'),
  paymentController.getPaymentsByOrder
)

// Get payments by user (owner or admin)
router.get(
  '/user/:userId',
  authenticate,
  validateId('userId'),
  checkOwnership(req => parseInt(req.params.userId, 10)),
  paymentController.getPaymentsByUser
)

// Create payment
router.post(
  '/',
  authenticate,
  validate({
    order_id: { type: 'number', required: true, integer: true, min: 1 },
    amount_usd: { type: 'number', required: true, min: 0 },
    amount_ves: { type: 'number', min: 0 },
    payment_method_name: { type: 'string', required: true },
    transaction_id: { type: 'string' },
    reference_number: { type: 'string' },
    status: {
      type: 'string',
      enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded']
    }
  }),
  paymentController.createPayment
)

// Update payment (admin only)
router.put('/:id', authenticate, authorize('admin'), validateId(), paymentController.updatePayment)

// Confirm payment (admin only)
router.patch(
  '/:id/confirm',
  authenticate,
  authorize('admin'),
  validateId(),
  validate({
    adminNotes: { type: 'string' }
  }),
  paymentController.confirmPayment
)

// Mark payment as failed (admin only)
router.patch(
  '/:id/fail',
  authenticate,
  authorize('admin'),
  validateId(),
  validate({
    reason: { type: 'string' }
  }),
  paymentController.failPayment
)

// Refund payment (admin only)
router.patch(
  '/:id/refund',
  authenticate,
  authorize('admin'),
  validateId(),
  validate({
    isPartial: { type: 'boolean' },
    notes: { type: 'string' }
  }),
  paymentController.refundPayment
)

export default router
