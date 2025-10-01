/**
 * Order Controller
 * Handles HTTP logic for order operations
 */

import * as orderService from '../services/orderService.js'
import { asyncHandler } from '../middleware/errorHandler.js'

/**
 * GET /api/orders
 * Get all orders with filters
 */
export const getAllOrders = asyncHandler(async(req, res) => {
  const filters = {
    user_id: req.query.user_id,
    status: req.query.status,
    date_from: req.query.date_from,
    date_to: req.query.date_to,
    limit: req.query.limit,
    offset: req.query.offset
  }

  const orders = await orderService.getAllOrders(filters)

  res.json({
    success: true,
    data: orders,
    message: 'Orders retrieved successfully'
  })
})

/**
 * GET /api/orders/:id
 * Get order by ID with items
 */
export const getOrderById = asyncHandler(async(req, res) => {
  const order = await orderService.getOrderById(req.params.id)

  res.json({
    success: true,
    data: order,
    message: 'Order retrieved successfully'
  })
})

/**
 * GET /api/orders/user/:userId
 * Get orders by user
 */
export const getOrdersByUser = asyncHandler(async(req, res) => {
  const filters = {
    status: req.query.status,
    limit: req.query.limit
  }

  const orders = await orderService.getOrdersByUser(req.params.userId, filters)

  res.json({
    success: true,
    data: orders,
    message: 'User orders retrieved successfully'
  })
})

/**
 * GET /api/orders/:id/status-history
 * Get order status history
 */
export const getOrderStatusHistory = asyncHandler(async(req, res) => {
  const history = await orderService.getOrderStatusHistory(req.params.id)

  res.json({
    success: true,
    data: history,
    message: 'Order status history retrieved successfully'
  })
})

/**
 * POST /api/orders
 * Create order with items (atomic)
 */
export const createOrder = asyncHandler(async(req, res) => {
  const { order, items } = req.body

  const result = await orderService.createOrderWithItems(order, items)

  res.status(201).json({
    success: true,
    data: result,
    message: 'Order created successfully'
  })
})

/**
 * PUT /api/orders/:id
 * Update order (limited fields)
 */
export const updateOrder = asyncHandler(async(req, res) => {
  const order = await orderService.updateOrder(req.params.id, req.body)

  res.json({
    success: true,
    data: order,
    message: 'Order updated successfully'
  })
})

/**
 * PATCH /api/orders/:id/status
 * Update order status with history
 */
export const updateOrderStatus = asyncHandler(async(req, res) => {
  const { status, notes, changedBy } = req.body

  const result = await orderService.updateOrderStatus(
    req.params.id,
    status,
    notes,
    changedBy || req.user?.id
  )

  res.json({
    success: true,
    data: result,
    message: 'Order status updated successfully'
  })
})

/**
 * PATCH /api/orders/:id/cancel
 * Cancel order
 */
export const cancelOrder = asyncHandler(async(req, res) => {
  const { notes } = req.body

  const result = await orderService.cancelOrder(req.params.id, notes, req.user?.id)

  res.json({
    success: true,
    data: result,
    message: 'Order cancelled successfully'
  })
})
