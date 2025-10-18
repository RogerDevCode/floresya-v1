/**
 * Order Controller
 * Handles HTTP logic for order operations
 */

import * as orderService from '../services/orderService.js'
import { asyncHandler } from '../middleware/errorHandler.js'

/**
 * Helper Functions
 * Common utilities following KISS, DRY, and SSOT principles
 */

/**
 * Creates standardized API response
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Formatted response object
 */
const createResponse = (data, message) => ({
  success: true,
  data,
  message
})

/**
 * Gets appropriate HTTP status code for operation
 * @param {string} operation - Operation type (create, update, delete, etc.)
 * @returns {number} HTTP status code
 */
const getStatusCode = operation => {
  const statusCodes = {
    create: 201,
    update: 200,
    delete: 200,
    cancel: 200,
    status: 200
  }
  return statusCodes[operation] || 200
}

/**
 * Gets appropriate success message for operation
 * @param {string} operation - Operation type
 * @param {string} entity - Entity name (user, product, etc.)
 * @returns {string} Success message
 */
const getSuccessMessage = (operation, entity = 'Order') => {
  const messages = {
    create: `${entity} created successfully`,
    update: `${entity} updated successfully`,
    delete: `${entity} cancelled successfully`,
    cancel: `${entity} cancelled successfully`,
    status: `${entity} status updated successfully`,
    retrieve: `${entity} retrieved successfully`,
    history: 'Order status history retrieved successfully'
  }
  return messages[operation] || `${entity} operation completed successfully`
}

/**
 * GET /api/orders
 * Get all orders with filters
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const filters = {
    user_id: req.query.user_id,
    status: req.query.status,
    date_from: req.query.date_from,
    date_to: req.query.date_to,
    search: req.query.search,
    limit: req.query.limit,
    offset: req.query.offset
  }

  const includeInactive = req.user?.role === 'admin'
  const orders = await orderService.getAllOrders(filters, includeInactive)

  const response = createResponse(orders, getSuccessMessage('retrieve', 'Orders'))
  res.json(response)
})

/**
 * GET /api/orders/:id
 * Get order by ID
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const includeInactive = req.user?.role === 'admin'
  const order = await orderService.getOrderById(req.params.id, includeInactive)

  const response = createResponse(order, getSuccessMessage('retrieve'))
  res.json(response)
})

/**
 * GET /api/orders/user/:userId
 * Get orders by user
 */
export const getOrdersByUser = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    limit: req.query.limit
  }

  const orders = await orderService.getOrdersByUser(req.params.userId, filters)

  const response = createResponse(orders, getSuccessMessage('retrieve', 'User orders'))
  res.json(response)
})

/**
 * GET /api/orders/:id/status-history
 * Get order status history
 */
export const getOrderStatusHistory = asyncHandler(async (req, res) => {
  const history = await orderService.getOrderStatusHistory(req.params.id)

  const response = createResponse(history, getSuccessMessage('history'))
  res.json(response)
})

/**
 * POST /api/orders
 * Create order with items
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { order, items } = req.body

  const result = await orderService.createOrderWithItems(order, items)

  const response = createResponse(result, getSuccessMessage('create'))
  res.status(getStatusCode('create')).json(response)
})

/**
 * PUT /api/orders/:id
 * Update order
 */
export const updateOrder = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrder(req.params.id, req.body)

  const response = createResponse(order, getSuccessMessage('update'))
  res.json(response)
})

/**
 * PATCH /api/orders/:id/status
 * Update order status
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body

  const result = await orderService.updateOrderStatus(req.params.id, status, notes, null)

  const response = createResponse(result, getSuccessMessage('status'))
  res.json(response)
})

/**
 * PATCH /api/orders/:id/cancel
 * Cancel order
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const { notes } = req.body

  const result = await orderService.cancelOrder(req.params.id, notes, req.user?.id)

  const response = createResponse(result, getSuccessMessage('cancel'))
  res.json(response)
})
