/**
 * Procesado por B
 */

/**
 * Order Routes
 * Defines routes for order operations
 */

import express from 'express'
import * as orderController from '../controllers/orderController.js'
import { authenticate, authorize, checkOwnership } from '../middleware/auth/index.js'
import {
  validate,
  validateId,
  validatePagination,
  sanitizeRequestData,
  advancedValidate,
  orderStatusUpdateSchema,
  orderCreateSchema
} from '../middleware/validation/index.js'
import {
  protectOrderCreation,
  protectAdminOperations,
  rateLimitCritical
} from '../middleware/security/index.js'
import { validateBusinessRules } from '../services/businessRules.js'
import { orderMetricsMiddleware } from '../monitoring/metricsCollector.js'

const router = express.Router()

// Admin-only: Get all orders
router.get(
  '/',
  rateLimitCritical,
  protectAdminOperations,
  authenticate,
  authorize('admin'),
  validatePagination,
  orderController.getAllOrders
)

// Get order by ID (owner or admin)
router.get(
  '/:id',
  rateLimitCritical,
  authenticate,
  validateId(),
  checkOwnership(req => req.order?.user_id), // TODO: Fetch order first
  orderController.getOrderById
)

// Get orders by user (own orders or admin)
router.get(
  '/user/:userId',
  rateLimitCritical,
  authenticate,
  validateId('userId'),
  checkOwnership(req => parseInt(req.params.userId, 10)),
  orderController.getOrdersByUser
)

// Get order status history
router.get(
  '/:id/status-history',
  rateLimitCritical,
  authenticate,
  validateId(),
  orderController.getOrderStatusHistory
)

// Create order (public - for checkout process)
router.post(
  '/',
  protectOrderCreation, // Rate limiting, size limits, and metrics
  sanitizeRequestData, // Apply sanitization first
  validate(orderCreateSchema), // Primary validation using centralized schema
  advancedValidate('order'), // Advanced validation with detailed error messages
  validateBusinessRules('order'), // Business rules validation
  orderMetricsMiddleware, // Record business metrics for orders
  orderController.createOrder
)

// Update order (admin or owner - limited fields)
router.put('/:id', rateLimitCritical, authenticate, validateId(), orderController.updateOrder)

// Update order status (admin only)
router.patch(
  '/:id/status',
  rateLimitCritical,
  authenticate,
  authorize('admin'),
  validateId(),
  validate(orderStatusUpdateSchema),
  orderController.updateOrderStatus
)

// Cancel order (owner or admin)
router.patch(
  '/:id/cancel',
  rateLimitCritical,
  authenticate,
  validateId(),
  validate({
    notes: { type: 'string' }
  }),
  orderController.cancelOrder
)

export default router
