/**
 * Order Routes
 * Defines routes for order operations
 */

import express from 'express'
import * as orderController from '../controllers/orderController.js'
import { authenticate, authorize, checkOwnership } from '../middleware/auth.js'
import { validate, validateId, validatePagination } from '../middleware/validate.js'

const router = express.Router()

// Admin-only: Get all orders
router.get('/', authenticate, authorize('admin'), validatePagination, orderController.getAllOrders)

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

// Create order (authenticated users)
router.post(
  '/',
  authenticate,
  validate({
    order: {
      type: 'object',
      required: true,
      custom: value => {
        if (!value.customer_email || !value.customer_email.includes('@')) {
          return 'order.customer_email must be a valid email'
        }
        if (!value.customer_name || typeof value.customer_name !== 'string') {
          return 'order.customer_name is required'
        }
        if (!value.delivery_address || typeof value.delivery_address !== 'string') {
          return 'order.delivery_address is required'
        }
        if (!value.total_amount_usd || value.total_amount_usd <= 0) {
          return 'order.total_amount_usd must be positive'
        }
        return null
      }
    },
    items: {
      type: 'array',
      required: true,
      minLength: 1,
      custom: value => {
        if (!Array.isArray(value) || value.length === 0) {
          return 'items must be a non-empty array'
        }
        for (const item of value) {
          if (!item.product_id || !item.product_name || !item.quantity || !item.unit_price_usd) {
            return 'each item must have product_id, product_name, quantity, and unit_price_usd'
          }
        }
        return null
      }
    }
  }),
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
