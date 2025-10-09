/**
 * Order Service Unit Tests
 * Testing all functions in orderService.js with proper mocking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as orderService from '../../api/services/orderService.js'
import { supabase } from '../../api/services/supabaseClient.js'

// Mock the Supabase client to avoid actual database calls
vi.mock('../../api/services/supabaseClient.js', async () => {
  const actual = await vi.importActual('../../api/services/supabaseClient.js')
  return {
    ...actual,
    supabase: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      single: vi.fn(),
      rpc: vi.fn().mockReturnThis()
    }
  }
})

// Mock error classes
vi.mock('../../api/errors/AppError.js', async () => {
  const actual = await vi.importActual('../../api/errors/AppError.js')
  return {
    ...actual,
    ValidationError: class ValidationError extends Error {
      constructor(message, errors) {
        super(message)
        this.name = 'ValidationError'
        this.errors = errors
      }
    },
    NotFoundError: class NotFoundError extends Error {
      constructor(resource, id, context) {
        super(`${resource} not found with id: ${id}`)
        this.name = 'NotFoundError'
        this.resource = resource
        this.id = id
        this.context = context
      }
    },
    DatabaseError: class DatabaseError extends Error {
      constructor(operation, table, originalError, context) {
        super(`Database ${operation} failed on ${table}`)
        this.name = 'DatabaseError'
        this.operation = operation
        this.table = table
        this.originalError = originalError
        this.context = context
      }
    },
    BadRequestError: class BadRequestError extends Error {
      constructor(message, context) {
        super(message)
        this.name = 'BadRequestError'
        this.context = context
      }
    }
  }
})

describe('Order Service Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllOrders', () => {
    it('should return all orders with optional filters', async () => {
      // Arrange
      const mockOrders = [
        {
          id: 1,
          customer_email: 'customer@example.com',
          status: 'pending',
          created_at: '2023-01-01T00:00:00Z',
          order_items: []
        }
      ]

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.order).mockReturnThis()
      vi.mocked(supabase).select().order.mockResolvedValue({
        data: mockOrders,
        error: null
      })

      // Act
      const result = await orderService.getAllOrders()

      // Assert
      expect(result).toEqual(mockOrders)
      expect(supabase.from).toHaveBeenCalledWith('orders')
      expect(supabase.select).toHaveBeenCalledWith(expect.stringContaining('order_items'))
    })

    it('should apply status filter correctly', async () => {
      // Arrange
      const mockOrders = [{ id: 1, status: 'delivered', order_items: [] }]

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.order).mockReturnThis()
      vi.mocked(supabase).select().eq().order.mockResolvedValue({
        data: mockOrders,
        error: null
      })

      // Act
      const result = await orderService.getAllOrders({ status: 'delivered' })

      // Assert
      expect(result).toEqual(mockOrders)
      expect(supabase.eq).toHaveBeenCalledWith('status', 'delivered')
    })

    it('should apply date range filter correctly', async () => {
      // Arrange
      const mockOrders = [
        { id: 1, status: 'pending', created_at: '2023-01-01T00:00:00Z', order_items: [] }
      ]

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.gte).mockReturnThis()
      vi.mocked(supabase.lte).mockReturnThis()
      vi.mocked(supabase.order).mockReturnThis()
      vi.mocked(supabase).select().gte().lte().order.mockResolvedValue({
        data: mockOrders,
        error: null
      })

      // Act
      const result = await orderService.getAllOrders({
        date_from: '2023-01-01',
        date_to: '2023-12-31'
      })

      // Assert
      expect(result).toEqual(mockOrders)
      expect(supabase.gte).toHaveBeenCalledWith('created_at', '2023-01-01')
      expect(supabase.lte).toHaveBeenCalledWith('created_at', '2023-12-31')
    })
  })

  describe('getOrderById', () => {
    it('should return an order by ID when it exists', async () => {
      // Arrange
      const mockOrder = {
        id: 1,
        customer_email: 'customer@example.com',
        status: 'pending',
        order_items: [{ id: 1, product_id: 1, quantity: 2, unit_price_usd: 25.99 }]
      }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: mockOrder,
        error: null
      })

      // Act
      const result = await orderService.getOrderById(1)

      // Assert
      expect(result).toEqual(mockOrder)
      expect(supabase.from).toHaveBeenCalledWith('orders')
      expect(supabase.select).toHaveBeenCalledWith(`
        *,
        order_items (*)
      `)
      expect(supabase.eq).toHaveBeenCalledWith('id', 1)
    })

    it('should throw BadRequestError when ID is invalid', async () => {
      // Act & Assert
      await expect(orderService.getOrderById('invalid')).rejects.toThrow(
        'Invalid order ID: must be a number'
      )
      await expect(orderService.getOrderById(null)).rejects.toThrow(
        'Invalid order ID: must be a number'
      )
      await expect(orderService.getOrderById(0)).rejects.toThrow(
        'Invalid order ID: must be a number'
      )
    })
  })

  describe('getOrdersByUser', () => {
    it('should return orders for a specific user', async () => {
      // Arrange
      const mockOrders = [
        {
          id: 1,
          user_id: 123,
          customer_email: 'customer@example.com',
          status: 'pending',
          order_items: []
        }
      ]

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.order).mockReturnThis()
      vi.mocked(supabase).select().eq().order.mockResolvedValue({
        data: mockOrders,
        error: null
      })

      // Act
      const result = await orderService.getOrdersByUser(123)

      // Assert
      expect(result).toEqual(mockOrders)
      expect(supabase.eq).toHaveBeenCalledWith('user_id', 123)
    })

    it('should apply status filter when provided', async () => {
      // Arrange
      const mockOrders = [
        {
          id: 1,
          user_id: 123,
          customer_email: 'customer@example.com',
          status: 'delivered',
          order_items: []
        }
      ]

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.order).mockReturnThis()
      vi.mocked(supabase).select().eq().eq().order.mockResolvedValue({
        data: mockOrders,
        error: null
      })

      // Act
      const result = await orderService.getOrdersByUser(123, { status: 'delivered' })

      // Assert
      expect(result).toEqual(mockOrders)
      expect(supabase.eq).toHaveBeenCalledWith('user_id', 123)
      expect(supabase.eq).toHaveBeenCalledWith('status', 'delivered')
    })

    it('should throw BadRequestError when userId is invalid', async () => {
      // Act & Assert
      await expect(orderService.getOrdersByUser('invalid')).rejects.toThrow(
        'Invalid user ID: must be a number'
      )
      await expect(orderService.getOrdersByUser(null)).rejects.toThrow(
        'Invalid user ID: must be a number'
      )
      await expect(orderService.getOrdersByUser(0)).rejects.toThrow(
        'Invalid user ID: must be a number'
      )
    })
  })

  describe('createOrderWithItems', () => {
    it('should create an order with items successfully', async () => {
      // Arrange
      const orderData = {
        customer_email: 'customer@example.com',
        customer_name: 'John Doe',
        delivery_address: '123 Main St',
        total_amount_usd: 50.99
      }

      const orderItems = [
        {
          product_id: 1,
          product_name: 'Product 1',
          quantity: 2,
          unit_price_usd: 25.495
        }
      ]

      const expectedOrderPayload = {
        user_id: null,
        customer_email: 'customer@example.com',
        customer_name: 'John Doe',
        customer_phone: null,
        delivery_address: '123 Main St',
        delivery_date: null,
        delivery_time_slot: null,
        delivery_notes: null,
        status: 'pending',
        total_amount_usd: 50.99,
        total_amount_ves: null,
        currency_rate: null,
        notes: null,
        admin_notes: null
      }

      const expectedItemsPayload = [
        {
          product_id: 1,
          product_name: 'Product 1',
          product_summary: null,
          unit_price_usd: 25.495,
          unit_price_ves: null,
          quantity: 2,
          subtotal_usd: 50.99,
          subtotal_ves: null
        }
      ]

      const mockResult = {
        id: 1,
        ...expectedOrderPayload
      }

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockResult,
        error: null
      })

      // Mock product validation calls
      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: { id: 1, name: 'Product 1', stock: 10, active: true },
        error: null
      })

      // Act
      const result = await orderService.createOrderWithItems(orderData, orderItems)

      // Assert
      expect(result).toEqual(mockResult)
      expect(supabase.rpc).toHaveBeenCalledWith('create_order_with_items', {
        order_data: expectedOrderPayload,
        order_items: expectedItemsPayload
      })
    })

    it('should throw ValidationError for invalid order data', async () => {
      // Arrange
      const invalidOrderData = {
        customer_email: 'invalid-email', // Invalid email
        customer_name: '', // Invalid empty name
        delivery_address: '' // Invalid empty address
      }

      const orderItems = [
        {
          product_id: 1,
          product_name: 'Product 1',
          quantity: 1,
          unit_price_usd: 25.99
        }
      ]

      // Act & Assert
      await expect(orderService.createOrderWithItems(invalidOrderData, orderItems)).rejects.toThrow(
        'Order validation failed'
      )
    })

    it('should throw ValidationError for insufficient stock', async () => {
      // Arrange
      const orderData = {
        customer_email: 'customer@example.com',
        customer_name: 'John Doe',
        delivery_address: '123 Main St',
        total_amount_usd: 25.99
      }

      const orderItems = [
        {
          product_id: 1,
          product_name: 'Product 1',
          quantity: 5, // Requesting 5 units
          unit_price_usd: 25.99
        }
      ]

      // Mock product validation calls - product has only 2 units
      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: { id: 1, name: 'Product 1', stock: 2, active: true }, // Only 2 in stock
        error: null
      })

      // Act & Assert
      await expect(orderService.createOrderWithItems(orderData, orderItems)).rejects.toThrow(
        'Insufficient stock'
      )
    })
  })

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      // Arrange
      const mockResult = {
        id: 1,
        status: 'verified',
        customer_email: 'customer@example.com'
      }

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockResult,
        error: null
      })

      // Act
      const result = await orderService.updateOrderStatus(1, 'verified')

      // Assert
      expect(result).toEqual(mockResult)
      expect(supabase.rpc).toHaveBeenCalledWith('update_order_status_with_history', {
        order_id: 1,
        new_status: 'verified',
        notes: null,
        changed_by: null
      })
    })

    it('should throw BadRequestError for invalid order ID', async () => {
      // Act & Assert
      await expect(orderService.updateOrderStatus('invalid', 'delivered')).rejects.toThrow(
        'Invalid order ID: must be a number'
      )
      await expect(orderService.updateOrderStatus(null, 'delivered')).rejects.toThrow(
        'Invalid order ID: must be a number'
      )
    })

    it('should throw BadRequestError for invalid status', async () => {
      // Act & Assert
      await expect(orderService.updateOrderStatus(1, 'invalid_status')).rejects.toThrow(
        'Invalid status: must be one of pending, verified, preparing, shipped, delivered, cancelled'
      )
    })
  })

  describe('updateOrder', () => {
    it('should update allowed order fields successfully', async () => {
      // Arrange
      const updatedOrder = {
        id: 1,
        delivery_address: '456 New Address',
        delivery_notes: 'Call when arriving',
        status: 'verified'
      }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.update).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: updatedOrder,
        error: null
      })

      // Act
      const result = await orderService.updateOrder(1, {
        delivery_address: '456 New Address',
        delivery_notes: 'Call when arriving'
      })

      // Assert
      expect(result).toEqual(updatedOrder)
      expect(supabase.update).toHaveBeenCalledWith({
        delivery_address: '456 New Address',
        delivery_notes: 'Call when arriving'
      })
      expect(supabase.eq).toHaveBeenCalledWith('id', 1)
    })

    it('should throw BadRequestError for invalid order ID', async () => {
      // Act & Assert
      await expect(
        orderService.updateOrder('invalid', { delivery_address: 'New Address' })
      ).rejects.toThrow('Invalid order ID: must be a number')
      await expect(
        orderService.updateOrder(0, { delivery_address: 'New Address' })
      ).rejects.toThrow('Invalid order ID: must be a number')
    })

    it('should throw BadRequestError for empty updates', async () => {
      // Act & Assert
      await expect(orderService.updateOrder(1, {})).rejects.toThrow('No updates provided')
    })
  })

  describe('cancelOrder', () => {
    it('should cancel an order by updating its status to cancelled', async () => {
      // Arrange
      const cancelledOrder = {
        id: 1,
        status: 'cancelled',
        customer_email: 'customer@example.com'
      }

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: cancelledOrder,
        error: null
      })

      // Act
      const result = await orderService.cancelOrder(1)

      // Assert
      expect(result).toEqual(cancelledOrder)
      expect(supabase.rpc).toHaveBeenCalledWith('update_order_status_with_history', {
        order_id: 1,
        new_status: 'cancelled',
        notes: 'Order cancelled',
        changed_by: null
      })
    })
  })

  describe('getOrderStatusHistory', () => {
    it('should return the status history for an order', async () => {
      // Arrange
      const mockHistory = [
        {
          id: 1,
          order_id: 123,
          old_status: 'pending',
          new_status: 'verified',
          created_at: '2023-01-01T00:00:00Z'
        },
        {
          id: 2,
          order_id: 123,
          old_status: 'verified',
          new_status: 'preparing',
          created_at: '2023-01-01T01:00:00Z'
        }
      ]

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.order).mockReturnThis()
      vi.mocked(supabase).select().eq().order.mockResolvedValue({
        data: mockHistory,
        error: null
      })

      // Act
      const result = await orderService.getOrderStatusHistory(123)

      // Assert
      expect(result).toEqual(mockHistory)
      expect(supabase.from).toHaveBeenCalledWith('order_status_history')
      expect(supabase.eq).toHaveBeenCalledWith('order_id', 123)
      expect(supabase.order).toHaveBeenCalledWith('created_at', { ascending: true })
    })

    it('should throw BadRequestError for invalid order ID', async () => {
      // Act & Assert
      await expect(orderService.getOrderStatusHistory('invalid')).rejects.toThrow(
        'Invalid order ID: must be a number'
      )
      await expect(orderService.getOrderStatusHistory(null)).rejects.toThrow(
        'Invalid order ID: must be a number'
      )
    })
  })
})
