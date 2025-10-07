/**
 * Order Routes
 * Defines routes for order operations
 */

import express from 'express'
import * as orderController from '../controllers/orderController.js'
import { authenticate, authorize, checkOwnership } from '../middleware/auth.js'
import { validate, validateId, validatePagination } from '../middleware/validate.js'
import { sanitizeRequestData } from '../middleware/sanitize.js'
import { advancedValidate } from '../middleware/advancedValidation.js'
import { protectOrderCreation, protectAdminOperations } from '../middleware/rateLimit.js'
import { errorLoggingMiddleware } from '../utils/logger.js'
import { validateBusinessRules } from '../services/businessRules.js'
import { orderMetricsMiddleware } from '../monitoring/metricsCollector.js'

const router = express.Router()

// Admin-only: Get all orders
router.get(
  '/',
  protectAdminOperations,
  authenticate,
  authorize('admin'),
  validatePagination,
  orderController.getAllOrders
)

// Get order by ID (owner or admin)
router.get(
  '/:id',
  authenticate,
  validateId(),
  checkOwnership(req => req.order?.user_id), // TODO: Fetch order first
  orderController.getOrderById
)

// Get orders by user (own orders or admin)
router.get(
  '/user/:userId',
  authenticate,
  validateId('userId'),
  checkOwnership(req => parseInt(req.params.userId, 10)),
  orderController.getOrdersByUser
)

// Get order status history
router.get('/:id/status-history', authenticate, validateId(), orderController.getOrderStatusHistory)

// Create order (public - for checkout process)
router.post(
  '/',
  protectOrderCreation, // Rate limiting, size limits, and metrics
  sanitizeRequestData, // Apply sanitization first
  advancedValidate('order'), // Advanced validation with detailed error messages
  validateBusinessRules('order'), // Business rules validation
  orderMetricsMiddleware, // Record business metrics for orders
  orderController.createOrder
)

// Update order (admin or owner - limited fields)
router.put('/:id', authenticate, validateId(), orderController.updateOrder)

// Update order status (admin only)
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  validateId(),
  validate({
    status: {
      type: 'string',
      required: true,
      enum: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled']
    },
    notes: { type: 'string' }
  }),
  orderController.updateOrderStatus
)

// Cancel order (owner or admin)
router.patch(
  '/:id/cancel',
  authenticate,
  validateId(),
  validate({
    notes: { type: 'string' }
  }),
  orderController.cancelOrder
)

export default router
