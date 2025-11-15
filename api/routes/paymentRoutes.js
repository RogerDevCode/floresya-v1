/**
 * Procesado por B
 */

/**
 * Payment Routes - Venezuelan Payment Methods
 * Defines routes for payment processing ONLY
 * Order routes are in orderRoutes.js
 */

import express from 'express'
import * as paymentController from '../controllers/paymentController.js'
import { authenticate } from '../middleware/auth/index.js'
import { validate, validateId, paymentConfirmSchema } from '../middleware/validation/index.js'
import { rateLimitCritical } from '../middleware/security/index.js'

const router = express.Router()

/**
 * Public routes
 */

// Get available payment methods for Venezuela
router.get('/methods', paymentController.getPaymentMethods)

/**
 * Protected routes (authentication required)
 */

// Confirm payment for an order (authenticated users)
router.post(
  '/:id/confirm',
  rateLimitCritical,
  authenticate,
  validateId(),
  validate(paymentConfirmSchema),
  paymentController.confirmPayment
)

export default router
