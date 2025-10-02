/**
 * Payment Routes - Venezuelan Payment Methods
 * Defines routes for payment processing and order management
 */

import express from 'express'
import * as paymentController from '../controllers/paymentController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate, validateId } from '../middleware/validate.js'
import { orderCreateSchema, paymentConfirmSchema } from '../middleware/schemas.js'

const router = express.Router()

/**
 * Public routes (no authentication required)
 */

// Get available payment methods for Venezuela
router.get('/methods', paymentController.getPaymentMethods)

// Create new order (customer information + items)
router.post('/', validate(orderCreateSchema), paymentController.createOrder)

// Get order by ID (public access for order tracking)
router.get('/:id', validateId(), paymentController.getOrderById)

/**
 * Protected routes (authentication required)
 */

// Get all orders (admin only)
router.get('/', authenticate, authorize(['admin']), paymentController.getAllOrders)

// Confirm payment for an order (authenticated users)
router.post(
  '/:id/confirm',
  authenticate,
  validateId(),
  validate(paymentConfirmSchema),
  paymentController.confirmPayment
)

export default router
