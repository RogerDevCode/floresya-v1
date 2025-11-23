/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Payment Method Routes
 * Defines routes for payment method operations
 * Uses centralized validation schemas from api/middleware/schemas.js
 */

import express from 'express'
import * as paymentMethodController from '../controllers/paymentMethodController.js'
import { authenticate, authorize } from '../middleware/auth/index.js'
import { validate, validateId } from '../middleware/validation/index.js'

const router = express.Router()

// Public routes
router.get('/', paymentMethodController.getAllPaymentMethods)
router.get('/:id', validateId(), paymentMethodController.getPaymentMethodById)

// Admin-only routes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({
    name: { type: 'string', required: true, minLength: 2, maxLength: 100 },
    type: {
      type: 'string',
      required: true,
      enum: ['bank_transfer', 'mobile_payment', 'cash', 'crypto', 'international']
    },
    description: { type: 'string', maxLength: 500 },
    account_info: { type: 'string', maxLength: 500 },
    active: { type: 'boolean' },
    display_order: { type: 'number', integer: true, min: 0 }
  }),
  paymentMethodController.createPaymentMethod
)

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateId(),
  validate({
    name: { type: 'string', minLength: 2, maxLength: 100 },
    type: {
      type: 'string',
      enum: ['bank_transfer', 'mobile_payment', 'cash', 'crypto', 'international']
    },
    description: { type: 'string', maxLength: 500 },
    account_info: { type: 'string', maxLength: 500 },
    active: { type: 'boolean' },
    display_order: { type: 'number', integer: true, min: 0 }
  }),
  paymentMethodController.updatePaymentMethod
)

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validateId(),
  paymentMethodController.deletePaymentMethod
)

router.patch(
  '/:id/reactivate',
  authenticate,
  authorize('admin'),
  validateId(),
  paymentMethodController.reactivatePaymentMethod
)

router.patch(
  '/:id/display-order',
  authenticate,
  authorize('admin'),
  validateId(),
  validate({
    order: { type: 'number', required: true, integer: true, min: 0 }
  }),
  paymentMethodController.updateDisplayOrder
)

export default router
