/**
 * Order Controller
 * Handles HTTP logic for order operations
 */

import * as orderService from '../services/orderService.js'
import { asyncHandler } from '../middleware/errorHandler.js'

/**
 * GET /api/orders
 * Get all orders with filters
 * @param {number} req.query.user_id - Filter by user ID
 * @param {string} req.query.status - Filter by order status
 * @param {string} req.query.date_from - Filter orders from date
 * @param {string} req.query.date_to - Filter orders to date
 * @param {string} req.query.search - Search in customer_name and customer_email (accent-insensitive)
 * @param {number} req.query.limit - Number of items to return
 * @param {number} req.query.offset - Number of items to skip
 * @returns {Object[]} - Array of orders with items
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const filters = {
    user_id: req.query.user_id,
    status: req.query.status,
    date_from: req.query.date_from,
    date_to: req.query.date_to,
    search: req.query.search, // New: accent-insensitive search
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
/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by ID
 *     description: Get order details by ID (owner or admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/order' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export const getOrderById = asyncHandler(async (req, res) => {
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
/**
 * @swagger
 * /api/orders/user/{userId}:
 *   get:
 *     tags: [Orders]
 *     summary: Get orders by user
 *     description: Get all orders for a specific user (owner or admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *         description: User ID
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/OffsetParam'
 *     responses:
 *       200:
 *         description: User orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/order' } }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export const getOrdersByUser = asyncHandler(async (req, res) => {
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
/**
 * @swagger
 * /api/orders/{id}/status-history:
 *   get:
 *     tags: [Orders]
 *     summary: Get order status history
 *     description: Get the complete status change history for an order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Order status history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/OrderStatusHistory' } }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export const getOrderStatusHistory = asyncHandler(async (req, res) => {
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
/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create new order
 *     description: Create a new order (public endpoint for checkout process)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order, items]
 *             properties:
 *               order:
 *                 type: object
 *                 required: [customer_email, customer_name, customer_phone, delivery_address, total_amount_usd]
 *                 properties:
 *                   customer_email: { type: string, format: email }
 *                   customer_name: { type: string, minLength: 2, maxLength: 255 }
 *                   customer_phone: { type: string, pattern: '^\\+?[\\d\\s-()]+$' }
 *                   delivery_address: { type: string, minLength: 10, maxLength: 500 }
 *                   delivery_date: { type: string, format: date }
 *                   delivery_time_slot: { type: string, pattern: '^\\d{2}:\\d{2}-\\d{2}:\\d{2}$' }
 *                   delivery_notes: { type: string, maxLength: 1000 }
 *                   total_amount_usd: { type: number, minimum: 0 }
 *                   total_amount_ves: { type: number, minimum: 0 }
 *                   currency_rate: { type: number, minimum: 0 }
 *                   status: { type: string, enum: [pending, verified, preparing, shipped, delivered, cancelled] }
 *                   notes: { type: string, maxLength: 1000 }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product_id, product_name, unit_price_usd, quantity]
 *                   properties:
 *                     product_id: { type: integer, minimum: 1 }
 *                     product_name: { type: string, minLength: 1 }
 *                     product_summary: { type: string }
 *                     unit_price_usd: { type: number, minimum: 0 }
 *                     unit_price_ves: { type: number, minimum: 0 }
 *                     quantity: { type: integer, minimum: 1 }
 *                     subtotal_usd: { type: number, minimum: 0 }
 *                     subtotal_ves: { type: number, minimum: 0 }
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/order' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       429: { description: Too many requests }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export const createOrder = asyncHandler(async (req, res) => {
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
/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     tags: [Orders]
 *     summary: Update order
 *     description: Update order details (owner or admin, limited fields)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               delivery_notes: { type: string, maxLength: 1000 }
 *               notes: { type: string, maxLength: 1000 }
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/order' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export const updateOrder = asyncHandler(async (req, res) => {
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
/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Update order status
 *     description: Admin only - Update order status with optional notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OrderStatusUpdate' }
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/order' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body

  // TODO: Get real admin user_id from auth
  const result = await orderService.updateOrderStatus(req.params.id, status, notes, null)

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
/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     tags: [Orders]
 *     summary: Cancel order
 *     description: Cancel an order (owner or admin) with optional cancellation notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes: { type: string, maxLength: 1000 }
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/order' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const { notes } = req.body

  const result = await orderService.cancelOrder(req.params.id, notes, req.user?.id)

  res.json({
    success: true,
    data: result,
    message: 'Order cancelled successfully'
  })
})
