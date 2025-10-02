/**
 * Payment Controller - Venezuelan Payment Methods
 * Handles payment processing and order creation
 */

import * as paymentService from '../services/paymentService.js'
import { asyncHandler } from '../middleware/errorHandler.js'

/**
 * @swagger
 * /api/payments/methods:
 *   get:
 *     tags: [Payments]
 *     summary: Get available payment methods for Venezuela
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
export const getPaymentMethods = asyncHandler(async (req, res) => {
  const paymentMethods = await paymentService.getPaymentMethods()

  res.status(200).json({
    success: true,
    data: paymentMethods,
    message: 'Payment methods retrieved successfully'
  })
})

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create new order with customer and payment information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_email
 *               - customer_name
 *               - customer_phone
 *               - delivery_address
 *               - delivery_city
 *               - delivery_state
 *               - total_amount_usd
 *               - items
 *             properties:
 *               customer_email:
 *                 type: string
 *                 format: email
 *               customer_name:
 *                 type: string
 *                 minLength: 2
 *               customer_phone:
 *                 type: string
 *               delivery_address:
 *                 type: string
 *                 minLength: 10
 *               delivery_city:
 *                 type: string
 *               delivery_state:
 *                 type: string
 *               delivery_zip:
 *                 type: string
 *               delivery_notes:
 *                 type: string
 *               notes:
 *                 type: string
 *               total_amount_usd:
 *                 type: number
 *                 minimum: 0
 *               total_amount_ves:
 *                 type: number
 *                 minimum: 0
 *               currency_rate:
 *                 type: number
 *                 minimum: 0
 *               status:
 *                 type: string
 *                 enum: [pending, verified, preparing, shipped, delivered, cancelled]
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - product_name
 *                     - unit_price_usd
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     product_name:
 *                       type: string
 *                     product_summary:
 *                       type: string
 *                     unit_price_usd:
 *                       type: number
 *                     unit_price_ves:
 *                       type: number
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                     subtotal_usd:
 *                       type: number
 *                     subtotal_ves:
 *                       type: number
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
export const createOrder = asyncHandler(async (req, res) => {
  const orderData = {
    customer_email: req.body.customer_email,
    customer_name: req.body.customer_name,
    customer_phone: req.body.customer_phone,
    delivery_address: req.body.delivery_address,
    delivery_city: req.body.delivery_city,
    delivery_state: req.body.delivery_state,
    delivery_zip: req.body.delivery_zip,
    delivery_notes: req.body.delivery_notes,
    notes: req.body.notes,
    total_amount_usd: req.body.total_amount_usd,
    total_amount_ves: req.body.total_amount_ves,
    currency_rate: req.body.currency_rate,
    status: req.body.status || 'pending',
    items: req.body.items
  }

  const order = await paymentService.createOrderWithItems(orderData)

  res.status(201).json({
    success: true,
    data: order,
    message: 'Order created successfully'
  })
})

/**
 * @swagger
 * /api/payments/{id}/confirm:
 *   post:
 *     tags: [Payments]
 *     summary: Confirm payment for an order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payment_method
 *               - reference_number
 *             properties:
 *               payment_method:
 *                 type: string
 *                 enum: [cash, mobile_payment, bank_transfer, zelle, crypto]
 *               reference_number:
 *                 type: string
 *               payment_details:
 *                 type: object
 *               receipt_image_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
export const confirmPayment = asyncHandler(async (req, res) => {
  const { id } = req.params
  const paymentData = {
    payment_method: req.body.payment_method,
    reference_number: req.body.reference_number,
    payment_details: req.body.payment_details,
    receipt_image_url: req.body.receipt_image_url,
    confirmed_by: req.user?.id
  }

  const payment = await paymentService.confirmPayment(parseInt(id), paymentData)

  res.status(200).json({
    success: true,
    data: payment,
    message: 'Payment confirmed successfully'
  })
})

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const includeInactive = req.user?.role === 'admin' && req.query.includeInactive === 'true'

  const order = await paymentService.getOrderById(parseInt(id), includeInactive)

  res.status(200).json({
    success: true,
    data: order,
    message: 'Order retrieved successfully'
  })
})

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get all orders with filters
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, verified, preparing, shipped, delivered, cancelled]
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const { limit, offset, status, user_id } = req.query
  const includeInactive = req.user?.role === 'admin' && req.query.includeInactive === 'true'

  const filters = { limit, offset, status, user_id }
  const orders = await paymentService.getAllOrders(filters, includeInactive)

  res.status(200).json({
    success: true,
    data: orders,
    message: 'Orders retrieved successfully'
  })
})
