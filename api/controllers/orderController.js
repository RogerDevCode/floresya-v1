/**
 * Order Controller
 * Handles HTTP logic for order operations
 */

import * as orderService from '../services/orderService.js'
import { asyncHandler } from '../middleware/error/index.js'
import { BadRequestError } from '../errors/AppError.js'

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

  // Fail-fast: Validate operation
  if (!statusCodes[operation]) {
    throw new BadRequestError(`Invalid operation: ${operation}`, {
      operation,
      validOperations: Object.keys(statusCodes)
    })
  }

  return statusCodes[operation]
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

  // Fail-fast: Validate operation
  if (!messages[operation]) {
    throw new BadRequestError(`Invalid operation: ${operation}`, {
      operation,
      validOperations: Object.keys(messages)
    })
  }

  return messages[operation]
}

/**
 * GET /api/orders
 * Get all orders with filters
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const filters = {
    user_id: req.query.user_id ? parseInt(req.query.user_id, 10) : undefined,
    status: req.query.status,
    date_from: req.query.date_from,
    date_to: req.query.date_to,
    search: req.query.search,
    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
    offset: req.query.offset ? parseInt(req.query.offset, 10) : undefined
  }

  const includeDeactivated = req.user?.role === 'admin'
  const orders = await orderService.getAllOrders(filters, includeDeactivated)

  const response = createResponse(orders, getSuccessMessage('retrieve', 'Orders'))
  res.json(response)
})

/**
 * GET /api/orders/:id
 * Get order by ID
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const includeDeactivated = req.user?.role === 'admin'
  const order = await orderService.getOrderById(parseInt(req.params.id, 10), includeDeactivated)

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
    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined
  }

  const orders = await orderService.getOrdersByUser(parseInt(req.params.userId, 10), filters)

  const response = createResponse(orders, getSuccessMessage('retrieve', 'User orders'))
  res.json(response)
})

/**
 * GET /api/orders/:id/status-history
 * Get order status history
 */
export const getOrderStatusHistory = asyncHandler(async (req, res) => {
  const history = await orderService.getOrderStatusHistory(parseInt(req.params.id, 10))

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
  const order = await orderService.updateOrder(parseInt(req.params.id, 10), req.body)

  const response = createResponse(order, getSuccessMessage('update'))
  res.json(response)
})

/**
 * PATCH /api/orders/:id/status
 * Update order status
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body

  const result = await orderService.updateOrderStatus(
    parseInt(req.params.id, 10),
    status,
    notes,
    req.user?.id
  )

  const response = createResponse(result, getSuccessMessage('status'))
  res.json(response)
})

/**
 * PATCH /api/orders/:id/cancel
 * Cancel order
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const { notes } = req.body

  const result = await orderService.cancelOrder(parseInt(req.params.id, 10), notes, req.user?.id)

  const response = createResponse(result, getSuccessMessage('cancel'))
  res.json(response)
})
