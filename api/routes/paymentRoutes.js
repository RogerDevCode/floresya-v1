/**
 * Payment Routes - Venezuelan Payment Methods
 * Defines routes for payment processing ONLY
 * Order routes are in orderRoutes.js
 */

import express from 'express'
import * as paymentController from '../controllers/paymentController.js'
import { authenticate } from '../middleware/auth.js'
import { validate, validateId } from '../middleware/validate.js'
import { paymentConfirmSchema } from '../middleware/schemas.js'
import { rateLimitCritical } from '../middleware/rateLimit.js'

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
