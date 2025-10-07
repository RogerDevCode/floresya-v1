/**
 * Order Routes
 * Defines routes for order operations
 */

import express from 'express'
import * as orderController from '../controllers/orderController.js'
import { authenticate, authorize, checkOwnership } from '../middleware/auth.js'
import { validate, validateId, validatePagination } from '../middleware/validate.js'
import { sanitizeRequestData } from '../middleware/sanitize.js'

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

// Create order (public - for checkout process)
router.post(
  '/',
  sanitizeRequestData, // Apply sanitization first
  validate({
    order: {
      type: 'object',
      required: true,
      custom: value => {
        if (!value) {
          return 'order object is required'
        }
        if (
          !value.customer_email ||
          typeof value.customer_email !== 'string' ||
          !value.customer_email.includes('@')
        ) {
          return 'order.customer_email must be a valid email address'
        }
        if (
          !value.customer_name ||
          typeof value.customer_name !== 'string' ||
          value.customer_name.trim().length < 2
        ) {
          return 'order.customer_name must be a non-empty string with at least 2 characters'
        }
        if (
          !value.delivery_address ||
          typeof value.delivery_address !== 'string' ||
          value.delivery_address.trim().length < 10
        ) {
          return 'order.delivery_address must be a non-empty string with at least 10 characters'
        }
        if (
          value.total_amount_usd === undefined ||
          value.total_amount_usd === null ||
          typeof value.total_amount_usd !== 'number' ||
          value.total_amount_usd <= 0
        ) {
          return 'order.total_amount_usd must be a positive number'
        }
        return null
      }
    },
    items: {
      type: 'array',
      required: true,
      minLength: 1,
      custom: value => {
        if (!value) {
          return 'items array is required'
        }
        if (!Array.isArray(value) || value.length === 0) {
          return 'items must be a non-empty array'
        }
        for (let i = 0; i < value.length; i++) {
          const item = value[i]
          if (!item || typeof item !== 'object') {
            return `items[${i}] must be an object`
          }
          if (
            item.product_id === undefined ||
            item.product_id === null ||
            typeof item.product_id !== 'number' ||
            item.product_id <= 0
          ) {
            return `items[${i}].product_id must be a positive number`
          }
          if (
            !item.product_name ||
            typeof item.product_name !== 'string' ||
            item.product_name.trim().length === 0
          ) {
            return `items[${i}].product_name must be a non-empty string`
          }
          if (
            item.quantity === undefined ||
            item.quantity === null ||
            typeof item.quantity !== 'number' ||
            item.quantity <= 0
          ) {
            return `items[${i}].quantity must be a positive number`
          }
          if (
            item.unit_price_usd === undefined ||
            item.unit_price_usd === null ||
            typeof item.unit_price_usd !== 'number' ||
            item.unit_price_usd < 0
          ) {
            return `items[${i}].unit_price_usd must be a non-negative number`
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
