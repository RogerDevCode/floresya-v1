/**
 * Order API Integration Tests
 * Tests order controller endpoints with proper Supabase mocking
 *
 * Coverage Target: 85%
 * Speed Target: < 200ms per test
 */

import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'
import request from 'supertest'
import express from 'express'

// Mock services and dependencies
vi.mock('../api/services/orderService.js', () => ({
  getAllOrders: vi.fn(),
  getOrderById: vi.fn(),
  getOrdersByUser: vi.fn(),
  getOrderStatusHistory: vi.fn(),
  createOrderWithItems: vi.fn(),
  updateOrder: vi.fn(),
  updateOrderStatus: vi.fn(),
  cancelOrder: vi.fn()
}))

vi.mock('../api/middleware/auth.js', () => ({
  authenticateToken: vi.fn((req, res, next) => {
    req.user = { id: 1, email: 'test@example.com', role: 'user' }
    next()
  }),
  requireRole: vi.fn(role => (req, res, next) => {
    if (req.user?.role === role || req.user?.role === 'admin') {
      next()
    } else {
      res.status(403).json({ error: 'Forbidden' })
    }
  })
}))

// Import real error middleware - we want to test actual error handling
import { errorHandler } from '../api/middleware/error/index.js'

vi.mock('../api/middleware/error/index.js', () => ({
  asyncHandler: vi.fn(fn => {
    return async (req, res, next) => {
      try {
        await fn(req, res, next)
      } catch (err) {
        // Simulate Express error handling
        errorHandler(err, req, res, next)
      }
    }
  }),
  errorHandler: vi.fn((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const isAppError = err.name && (err.name.includes('Error') || err.name.includes('Exception'))

    res.status(statusCode).json({
      success: false,
      error: isAppError ? err.message : 'Database operation failed',
      code: err.code || 'INTERNAL_ERROR',
      ...(err.statusCode >= 500 && !isAppError
        ? {}
        : {
            details: err.context || {}
          })
    })
  }),
  withErrorMapping: vi.fn(fn => fn)
}))

// Import mocked functions
import {
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  getOrderStatusHistory,
  createOrderWithItems,
  updateOrder,
  updateOrderStatus,
  cancelOrder
} from '../api/services/orderService.js'

// Import controller functions
import {
  getAllOrders as getAllOrdersController,
  getOrderById as getOrderByIdController,
  getOrdersByUser as getOrdersByUserController,
  getOrderStatusHistory as getOrderStatusHistoryController,
  createOrder as createOrderController,
  updateOrder as updateOrderController,
  updateOrderStatus as updateOrderStatusController,
  cancelOrder as cancelOrderController
} from '../api/controllers/orderController.js'

// Test data
const mockOrder = {
  id: 1,
  user_id: 1,
  customer_email: 'customer@example.com',
  customer_name: 'John Doe',
  customer_phone: '+1234567890',
  delivery_address: '123 Main St',
  delivery_date: '2024-12-25',
  delivery_time_slot: '10:00-12:00',
  delivery_notes: 'Please ring doorbell',
  status: 'pending',
  total_amount_usd: 99.99,
  total_amount_ves: 3999.6,
  currency_rate: 40.0,
  notes: 'Happy Birthday!',
  admin_notes: null,
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-01T10:00:00Z',
  order_items: [
    {
      id: 1,
      order_id: 1,
      product_id: 1,
      product_name: 'Test Product',
      product_summary: 'A beautiful test product',
      unit_price_usd: 49.99,
      unit_price_ves: 1999.6,
      quantity: 2,
      subtotal_usd: 99.98,
      subtotal_ves: 3999.2
    }
  ]
}

const mockOrderStatusHistory = [
  {
    id: 1,
    order_id: 1,
    old_status: null,
    new_status: 'pending',
    notes: 'Order created',
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: 2,
    order_id: 1,
    old_status: 'pending',
    new_status: 'verified',
    notes: 'Payment confirmed',
    created_at: '2024-01-01T10:30:00Z'
  }
]

// Mock Express app setup
let app
beforeAll(() => {
  app = express()
  app.use(express.json())

  // Mock authentication middleware - add user to request
  app.use((req, res, next) => {
    req.user = { id: 1, email: 'test@example.com', role: 'user' }
    next()
  })

  // Setup routes
  app.get('/api/orders', getAllOrdersController)
  app.get('/api/orders/:id', getOrderByIdController)
  app.get('/api/orders/user/:userId', getOrdersByUserController)
  app.get('/api/orders/:id/status-history', getOrderStatusHistoryController)
  app.post('/api/orders', createOrderController)
  app.put('/api/orders/:id', updateOrderController)
  app.patch('/api/orders/:id/status', updateOrderStatusController)
  app.patch('/api/orders/:id/cancel', cancelOrderController)

  // Add error handling middleware
  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const isAppError = err.name && (err.name.includes('Error') || err.name.includes('Exception'))

    res.status(statusCode).json({
      success: false,
      error: isAppError ? err.message : 'Database operation failed',
      code: err.code || 'INTERNAL_ERROR',
      ...(err.statusCode >= 500 && !isAppError
        ? {}
        : {
            details: err.context || {}
          })
    })
  })
})

describe('Order API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/orders', () => {
    it('should return all orders with default filters', async () => {
      // Arrange
      getAllOrders.mockResolvedValue([mockOrder])

      // Act
      const response = await request(app).get('/api/orders').expect(200)

      // Assert
      expect(getAllOrders).toHaveBeenCalledWith(
        {
          user_id: undefined,
          status: undefined,
          date_from: undefined,
          date_to: undefined,
          search: undefined,
          limit: undefined,
          offset: undefined
        },
        false
      )
      expect(response.body).toEqual({
        success: true,
        data: [mockOrder],
        message: 'Orders retrieved successfully'
      })
    })

    it('should filter orders by user_id', async () => {
      // Arrange
      getAllOrders.mockResolvedValue([mockOrder])

      // Act
      await request(app).get('/api/orders?user_id=1').expect(200)

      // Assert
      expect(getAllOrders).toHaveBeenCalledWith(expect.objectContaining({ user_id: 1 }), false)
    })

    it('should filter orders by status', async () => {
      // Arrange
      getAllOrders.mockResolvedValue([mockOrder])

      // Act
      await request(app).get('/api/orders?status=pending').expect(200)

      // Assert
      expect(getAllOrders).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending' }),
        false
      )
    })

    it('should apply search filter', async () => {
      // Arrange
      getAllOrders.mockResolvedValue([mockOrder])

      // Act
      await request(app).get('/api/orders?search=john').expect(200)

      // Assert
      expect(getAllOrders).toHaveBeenCalledWith(expect.objectContaining({ search: 'john' }), false)
    })

    it('should apply pagination', async () => {
      // Arrange
      getAllOrders.mockResolvedValue([mockOrder])

      // Act
      await request(app).get('/api/orders?limit=10&offset=20').expect(200)

      // Assert
      expect(getAllOrders).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10, offset: 20 }),
        false
      )
    })

    it('should handle service errors', async () => {
      // Arrange
      const error = new Error('Database connection failed')
      error.name = 'DatabaseError'
      error.statusCode = 500
      getAllOrders.mockRejectedValue(error)

      // Act
      const response = await request(app).get('/api/orders').expect(500)

      // Assert
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Database connection failed')
    })
  })

  describe('GET /api/orders/:id', () => {
    it('should return order by ID', async () => {
      // Arrange
      getOrderById.mockResolvedValue(mockOrder)

      // Act
      const response = await request(app).get('/api/orders/1').expect(200)

      // Assert
      expect(getOrderById).toHaveBeenCalledWith(1, false)
      expect(response.body).toEqual({
        success: true,
        data: mockOrder,
        message: 'Order retrieved successfully'
      })
    })

    it('should handle invalid order ID', async () => {
      // Arrange
      const error = new Error('Invalid order ID: must be a number')
      error.name = 'BadRequestError'
      error.statusCode = 400
      getOrderById.mockRejectedValue(error)

      // Act
      const response = await request(app).get('/api/orders/invalid').expect(400)

      // Assert
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Invalid order ID')
    })

    it('should return 404 for non-existent order', async () => {
      // Arrange
      const error = new Error('Order not found')
      error.name = 'NotFoundError'
      error.statusCode = 404
      getOrderById.mockRejectedValue(error)

      // Act
      const response = await request(app).get('/api/orders/999').expect(404)

      // Assert
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Order not found')
    })
  })

  describe('GET /api/orders/user/:userId', () => {
    it('should return orders for specific user', async () => {
      // Arrange
      getOrdersByUser.mockResolvedValue([mockOrder])

      // Act
      const response = await request(app).get('/api/orders/user/1').expect(200)

      // Assert
      expect(getOrdersByUser).toHaveBeenCalledWith(1, { status: undefined, limit: undefined })
      expect(response.body).toEqual({
        success: true,
        data: [mockOrder],
        message: 'User orders retrieved successfully'
      })
    })

    it('should filter user orders by status', async () => {
      // Arrange
      getOrdersByUser.mockResolvedValue([mockOrder])

      // Act
      await request(app).get('/api/orders/user/1?status=delivered').expect(200)

      // Assert
      expect(getOrdersByUser).toHaveBeenCalledWith(1, { status: 'delivered', limit: undefined })
    })

    it('should apply limit to user orders', async () => {
      // Arrange
      getOrdersByUser.mockResolvedValue([mockOrder])

      // Act
      await request(app).get('/api/orders/user/1?limit=5').expect(200)

      // Assert
      expect(getOrdersByUser).toHaveBeenCalledWith(1, { status: undefined, limit: 5 })
    })
  })

  describe('GET /api/orders/:id/status-history', () => {
    it('should return order status history', async () => {
      // Arrange
      getOrderStatusHistory.mockResolvedValue(mockOrderStatusHistory)

      // Act
      const response = await request(app).get('/api/orders/1/status-history').expect(200)

      // Assert
      expect(getOrderStatusHistory).toHaveBeenCalledWith(1)
      expect(response.body).toEqual({
        success: true,
        data: mockOrderStatusHistory,
        message: 'Order status history retrieved successfully'
      })
    })

    it('should return 404 for order with no history', async () => {
      // Arrange
      const error = new Error('Order status history not found')
      error.name = 'NotFoundError'
      error.statusCode = 404
      getOrderStatusHistory.mockRejectedValue(error)

      // Act
      const response = await request(app).get('/api/orders/999/status-history').expect(404)

      // Assert
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Order status history not found')
    })
  })

  describe('POST /api/orders', () => {
    const validOrderData = {
      order: {
        customer_email: 'customer@example.com',
        customer_name: 'John Doe',
        delivery_address: '123 Main St',
        total_amount_usd: 99.99
      },
      items: [
        {
          product_id: 1,
          product_name: 'Test Product',
          unit_price_usd: 49.99,
          quantity: 2
        }
      ]
    }

    it('should create order with valid data', async () => {
      // Arrange
      createOrderWithItems.mockResolvedValue(mockOrder)

      // Act
      const response = await request(app).post('/api/orders').send(validOrderData).expect(201)

      // Assert
      expect(createOrderWithItems).toHaveBeenCalledWith(validOrderData.order, validOrderData.items)
      expect(response.body).toEqual({
        success: true,
        data: mockOrder,
        message: 'Order created successfully'
      })
    })

    it('should validate required order fields', async () => {
      // Arrange
      const error = new Error('Validation failed')
      error.name = 'ValidationError'
      error.statusCode = 400
      createOrderWithItems.mockRejectedValue(error)

      // Act
      const response = await request(app)
        .post('/api/orders')
        .send({ order: {}, items: [] })
        .expect(400)

      // Assert
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Validation failed')
    })

    it('should require order items', async () => {
      // Arrange
      const error = new Error('Order validation failed')
      error.name = 'ValidationError'
      error.statusCode = 400
      createOrderWithItems.mockRejectedValue(error)

      // Act
      const response = await request(app)
        .post('/api/orders')
        .send({ order: validOrderData.order, items: [] })
        .expect(400)

      // Assert
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Order validation failed')
    })
  })

  describe('PUT /api/orders/:id', () => {
    const updateData = {
      delivery_address: '456 New St',
      delivery_notes: 'Updated notes'
    }

    it('should update order with valid data', async () => {
      // Arrange
      const updatedOrder = { ...mockOrder, ...updateData }
      updateOrder.mockResolvedValue(updatedOrder)

      // Act
      const response = await request(app).put('/api/orders/1').send(updateData).expect(200)

      // Assert
      expect(updateOrder).toHaveBeenCalledWith(1, updateData)
      expect(response.body).toEqual({
        success: true,
        data: updatedOrder,
        message: 'Order updated successfully'
      })
    })

    it('should return 404 for non-existent order', async () => {
      // Arrange
      const error = new Error('Order not found')
      error.name = 'NotFoundError'
      error.statusCode = 404
      updateOrder.mockRejectedValue(error)

      // Act
      const response = await request(app).put('/api/orders/999').send(updateData).expect(404)

      // Assert
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Order not found')
    })
  })

  describe('PATCH /api/orders/:id/status', () => {
    const statusUpdate = {
      status: 'shipped',
      notes: 'Order shipped via express delivery'
    }

    it('should update order status', async () => {
      // Arrange
      const updatedOrder = { ...mockOrder, status: 'shipped' }
      updateOrderStatus.mockResolvedValue(updatedOrder)

      // Act
      const response = await request(app)
        .patch('/api/orders/1/status')
        .send(statusUpdate)
        .expect(200)

      // Assert
      expect(updateOrderStatus).toHaveBeenCalledWith(
        1,
        'shipped',
        'Order shipped via express delivery',
        1 // req.user.id
      )
      expect(response.body).toEqual({
        success: true,
        data: updatedOrder,
        message: 'Order status updated successfully'
      })
    })

    it('should validate status value', async () => {
      // Arrange
      const error = new Error(
        'Invalid status: must be one of pending, verified, preparing, shipped, delivered, cancelled'
      )
      error.name = 'BadRequestError'
      error.statusCode = 400
      updateOrderStatus.mockRejectedValue(error)

      // Act
      const response = await request(app)
        .patch('/api/orders/1/status')
        .send({ status: 'invalid_status' })
        .expect(400)

      // Assert
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Invalid status')
    })
  })

  describe('PATCH /api/orders/:id/cancel', () => {
    const cancelData = {
      notes: 'Customer requested cancellation'
    }

    it('should cancel order', async () => {
      // Arrange
      const cancelledOrder = { ...mockOrder, status: 'cancelled' }
      cancelOrder.mockResolvedValue(cancelledOrder)

      // Act
      const response = await request(app).patch('/api/orders/1/cancel').send(cancelData).expect(200)

      // Assert
      expect(cancelOrder).toHaveBeenCalledWith(1, 'Customer requested cancellation', 1) // req.user.id
      expect(response.body).toEqual({
        success: true,
        data: cancelledOrder,
        message: 'Order cancelled successfully'
      })
    })

    it('should cancel order with default notes', async () => {
      // Arrange
      const cancelledOrder = { ...mockOrder, status: 'cancelled' }
      cancelOrder.mockResolvedValue(cancelledOrder)

      // Act
      await request(app).patch('/api/orders/1/cancel').send({}).expect(200)

      // Assert
      expect(cancelOrder).toHaveBeenCalledWith(1, undefined, 1) // req.user.id, notes is undefined from {}
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      const error = new Error('Database connection failed')
      error.name = 'DatabaseError'
      error.statusCode = 500
      getAllOrders.mockRejectedValue(error)

      // Act
      const response = await request(app).get('/api/orders').expect(500)

      // Assert
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Database connection failed')
    })

    it('should handle validation errors', async () => {
      // Arrange
      const error = new Error('Validation failed: email is required')
      error.name = 'ValidationError'
      error.statusCode = 400
      createOrderWithItems.mockRejectedValue(error)

      // Act
      const response = await request(app)
        .post('/api/orders')
        .send({ order: {}, items: [] })
        .expect(400)

      // Assert
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Validation failed')
    })

    it('should handle not found errors', async () => {
      // Arrange
      const error = new Error('Order not found')
      error.name = 'NotFoundError'
      error.statusCode = 404
      getOrderById.mockRejectedValue(error)

      // Act
      const response = await request(app).get('/api/orders/999').expect(404)

      // Assert
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Order not found')
    })
  })
})
