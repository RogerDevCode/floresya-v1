/**
 * Order Controller Unit Tests
 * Following CLAUDE.md test validation rules
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  getOrderStatusHistory,
  createOrder,
  updateOrder,
  updateOrderStatus,
  cancelOrder
} from '../orderController.js'

// Mock dependencies
vi.mock('../../services/orderService.js', () => ({
  getAllOrders: vi.fn(),
  getOrderById: vi.fn(),
  getOrdersByUser: vi.fn(),
  getOrderStatusHistory: vi.fn(),
  createOrderWithItems: vi.fn(),
  updateOrder: vi.fn(),
  updateOrderStatus: vi.fn(),
  cancelOrder: vi.fn()
}))

vi.mock('../../middleware/error/index.js', () => ({
  asyncHandler: vi.fn(fn => fn)
}))

vi.mock('../../errors/AppError.js', () => ({
  BadRequestError: class BadRequestError extends Error {
    constructor(message, context = {}) {
      super(message)
      this.name = 'BadRequestError'
      this.context = context
    }
  }
}))

import * as orderService from '../../services/orderService.js'

// Mock response and request objects
const mockResponse = () => {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

const mockRequest = (overrides = {}) => ({
  query: {},
  params: {},
  body: {},
  user: null,
  ...overrides
})

describe('Order Controller - Unit Tests with DI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getAllOrders', () => {
    it('should get all orders successfully', async () => {
      const req = mockRequest({
        query: {
          user_id: '1',
          status: 'pending',
          search: 'test',
          limit: '10',
          offset: '0'
        }
      })
      const res = mockResponse()
      const mockOrders = [
        { id: 1, status: 'pending', total_amount_usd: 50.0 },
        { id: 2, status: 'pending', total_amount_usd: 75.0 }
      ]

      orderService.getAllOrders.mockResolvedValue(mockOrders)

      await getAllOrders(req, res)

      expect(orderService.getAllOrders).toHaveBeenCalledWith(
        {
          user_id: 1,
          status: 'pending',
          date_from: undefined,
          date_to: undefined,
          search: 'test',
          limit: 10,
          offset: 0
        },
        false
      )
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrders,
        message: 'Orders retrieved successfully'
      })
    })

    it('should handle admin includeDeactivated', async () => {
      const req = mockRequest({
        user: { role: 'admin' }
      })
      const res = mockResponse()
      const mockOrders = []

      orderService.getAllOrders.mockResolvedValue(mockOrders)

      await getAllOrders(req, res)

      expect(orderService.getAllOrders).toHaveBeenCalledWith(expect.any(Object), true)
    })

    it('should handle date filters', async () => {
      const req = mockRequest({
        query: {
          date_from: '2024-01-01',
          date_to: '2024-12-31'
        }
      })
      const res = mockResponse()
      const mockOrders = []

      orderService.getAllOrders.mockResolvedValue(mockOrders)

      await getAllOrders(req, res)

      expect(orderService.getAllOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          date_from: '2024-01-01',
          date_to: '2024-12-31'
        }),
        false
      )
    })
  })

  describe('getOrderById', () => {
    it('should get order by ID successfully', async () => {
      const req = mockRequest({
        params: { id: '1' }
      })
      const res = mockResponse()
      const mockOrder = {
        id: 1,
        status: 'completed',
        total_amount_usd: 100.0
      }

      orderService.getOrderById.mockResolvedValue(mockOrder)

      await getOrderById(req, res)

      expect(orderService.getOrderById).toHaveBeenCalledWith(1, false)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrder,
        message: 'Order retrieved successfully'
      })
    })

    it('should handle admin access', async () => {
      const req = mockRequest({
        params: { id: '1' },
        user: { role: 'admin' }
      })
      const res = mockResponse()
      const mockOrder = { id: 1, active: false }

      orderService.getOrderById.mockResolvedValue(mockOrder)

      await getOrderById(req, res)

      expect(orderService.getOrderById).toHaveBeenCalledWith(1, true)
    })
  })

  describe('getOrdersByUser', () => {
    it('should get orders by user successfully', async () => {
      const req = mockRequest({
        params: { userId: '5' },
        query: { status: 'completed', limit: '20' }
      })
      const res = mockResponse()
      const mockOrders = [{ id: 1, user_id: 5, status: 'completed' }]

      orderService.getOrdersByUser.mockResolvedValue(mockOrders)

      await getOrdersByUser(req, res)

      expect(orderService.getOrdersByUser).toHaveBeenCalledWith(5, {
        status: 'completed',
        limit: 20
      })
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrders,
        message: 'User orders retrieved successfully'
      })
    })

    it('should handle no filters', async () => {
      const req = mockRequest({
        params: { userId: '5' }
      })
      const res = mockResponse()
      const mockOrders = []

      orderService.getOrdersByUser.mockResolvedValue(mockOrders)

      await getOrdersByUser(req, res)

      expect(orderService.getOrdersByUser).toHaveBeenCalledWith(5, {
        status: undefined,
        limit: undefined
      })
    })
  })

  describe('getOrderStatusHistory', () => {
    it('should get order status history successfully', async () => {
      const req = mockRequest({
        params: { id: '1' }
      })
      const res = mockResponse()
      const mockHistory = [
        { status: 'pending', created_at: '2024-01-01' },
        { status: 'processing', created_at: '2024-01-02' },
        { status: 'completed', created_at: '2024-01-03' }
      ]

      orderService.getOrderStatusHistory.mockResolvedValue(mockHistory)

      await getOrderStatusHistory(req, res)

      expect(orderService.getOrderStatusHistory).toHaveBeenCalledWith(1)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockHistory,
        message: 'Order status history retrieved successfully'
      })
    })
  })

  describe('createOrder', () => {
    it('should create order with items successfully', async () => {
      const req = mockRequest({
        body: {
          order: {
            customer_email: 'test@example.com',
            customer_name: 'Test Customer',
            delivery_address: '123 Test St',
            total_amount_usd: 150.0
          },
          items: [
            { product_id: 1, quantity: 2, unit_price_usd: 50.0 },
            { product_id: 2, quantity: 1, unit_price_usd: 50.0 }
          ]
        }
      })
      const res = mockResponse()
      const mockResult = {
        order_id: 1,
        items: [
          { id: 1, product_id: 1, quantity: 2 },
          { id: 2, product_id: 2, quantity: 1 }
        ]
      }

      orderService.createOrderWithItems.mockResolvedValue(mockResult)

      await createOrder(req, res)

      expect(orderService.createOrderWithItems).toHaveBeenCalledWith(req.body.order, req.body.items)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Order created successfully'
      })
    })
  })

  describe('updateOrder', () => {
    it('should update order successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: {
          delivery_address: '456 New St',
          delivery_date: '2024-12-25'
        }
      })
      const res = mockResponse()
      const mockOrder = {
        id: 1,
        delivery_address: '456 New St',
        delivery_date: '2024-12-25'
      }

      orderService.updateOrder.mockResolvedValue(mockOrder)

      await updateOrder(req, res)

      expect(orderService.updateOrder).toHaveBeenCalledWith(1, req.body)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrder,
        message: 'Order updated successfully'
      })
    })
  })

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { status: 'processing', notes: 'Started processing' },
        user: { id: 10 }
      })
      const res = mockResponse()
      const mockResult = {
        order_id: 1,
        old_status: 'pending',
        new_status: 'processing'
      }

      orderService.updateOrderStatus.mockResolvedValue(mockResult)

      await updateOrderStatus(req, res)

      expect(orderService.updateOrderStatus).toHaveBeenCalledWith(
        1,
        'processing',
        'Started processing',
        10
      )
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Order status updated successfully'
      })
    })

    it('should handle no user context', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { status: 'completed' }
      })
      const res = mockResponse()
      const mockResult = { order_id: 1, new_status: 'completed' }

      orderService.updateOrderStatus.mockResolvedValue(mockResult)

      await updateOrderStatus(req, res)

      expect(orderService.updateOrderStatus).toHaveBeenCalledWith(
        1,
        'completed',
        undefined,
        undefined
      )
    })
  })

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { notes: 'Customer requested cancellation' },
        user: { id: 10 }
      })
      const res = mockResponse()
      const mockResult = {
        order_id: 1,
        old_status: 'pending',
        new_status: 'cancelled'
      }

      orderService.cancelOrder.mockResolvedValue(mockResult)

      await cancelOrder(req, res)

      expect(orderService.cancelOrder).toHaveBeenCalledWith(
        1,
        'Customer requested cancellation',
        10
      )
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Order cancelled successfully'
      })
    })

    it('should handle no notes', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: {},
        user: { id: 5 }
      })
      const res = mockResponse()
      const mockResult = { order_id: 1, new_status: 'cancelled' }

      orderService.cancelOrder.mockResolvedValue(mockResult)

      await cancelOrder(req, res)

      expect(orderService.cancelOrder).toHaveBeenCalledWith(1, undefined, 5)
    })
  })
})
