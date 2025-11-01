/**
 * Order Service Unit Tests
 * Testing business logic for orders using Vitest
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as orderService from '../orderService.js'
import { NotFoundError, BadRequestError } from '../../errors/AppError.js'

// Mock Supabase client

describe('orderService', () => {
  let mockSupabaseQuery

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup basic mock chain
    mockSupabaseQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis()
    }
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getOrderById', () => {
    it('should return order data for valid ID', async () => {
      const mockOrder = {
        id: 123,
        customer_name: 'Juan Pérez',
        customer_email: 'juan@example.com',
        status: 'pending',
        total_amount_usd: 45.99
      }

      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: mockOrder,
        error: null
      })

      const { supabase } = await import('../supabaseClient.js')
      vi.mocked(supabase.from).mockReturnValueOnce(mockSupabaseQuery)

      const result = await orderService.getOrderById(123)

      expect(result).toEqual(mockOrder)
      expect(supabase.from).toHaveBeenCalledWith('orders')
    })

    it('should throw BadRequestError for invalid order ID', async () => {
      await expect(orderService.getOrderById(null)).rejects.toThrow(BadRequestError)
      await expect(orderService.getOrderById('abc')).rejects.toThrow(BadRequestError)
      await expect(orderService.getOrderById(0)).rejects.toThrow(BadRequestError)
    })

    it('should throw NotFoundError when order does not exist', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      })

      const { supabase } = await import('../supabaseClient.js')
      vi.mocked(supabase.from).mockReturnValueOnce(mockSupabaseQuery)

      await expect(orderService.getOrderById(999)).rejects.toThrow(NotFoundError)
    })
  })

  describe('getAllOrders', () => {
    it('should return all orders with default filters', async () => {
      const mockOrders = [
        { id: 1, customer_name: 'Customer 1', status: 'pending' },
        { id: 2, customer_name: 'Customer 2', status: 'delivered' }
      ]

      mockSupabaseQuery.order.mockResolvedValueOnce({
        data: mockOrders,
        error: null
      })

      const { supabase } = await import('../supabaseClient.js')
      vi.mocked(supabase.from).mockReturnValueOnce(mockSupabaseQuery)

      const result = await orderService.getAllOrders()

      expect(result).toEqual(mockOrders)
      expect(mockSupabaseQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should apply status filter when provided', async () => {
      const mockOrders = [{ id: 1, customer_name: 'Customer 1', status: 'pending' }]

      mockSupabaseQuery.eq.mockReturnValueOnce({
        neq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValueOnce({
          data: mockOrders,
          error: null
        })
      })

      const { supabase } = await import('../supabaseClient.js')
      vi.mocked(supabase.from).mockReturnValueOnce(mockSupabaseQuery)

      const filters = { status: 'pending' }
      await orderService.getAllOrders(filters)

      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('status', 'pending')
    })
  })

  describe('createOrderWithItems', () => {
    it('should create a new order with items successfully', async () => {
      const newOrder = {
        customer_name: 'Nuevo Cliente',
        customer_email: 'cliente@example.com',
        delivery_address: 'Test Address',
        total_amount_usd: 29.99
      }

      const orderItems = [
        {
          product_id: 1,
          product_name: 'Test Product',
          quantity: 1,
          unit_price_usd: 29.99,
          subtotal_usd: 29.99
        }
      ]

      const createdOrder = {
        id: 456,
        ...newOrder,
        status: 'pending',
        created_at: '2025-01-01T00:00:00Z'
      }

      // Mock the product lookup
      const { supabase } = await import('../supabaseClient.js')
      supabase.from = vi.fn().mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: { id: 1, name: 'Test Product', stock: 10, active: true },
              error: null
            })
          })
        })
      })

      // Mock the rpc call for order creation
      supabase.rpc = vi.fn().mockResolvedValueOnce({
        data: createdOrder,
        error: null
      })

      const result = await orderService.createOrderWithItems(newOrder, orderItems)

      expect(result).toEqual(createdOrder)
      expect(supabase.from).toHaveBeenCalledWith('products')
      expect(supabase.rpc).toHaveBeenCalledWith('create_order_with_items', {
        order_data: expect.any(Object),
        order_items: expect.any(Array)
      })
    })

    it('should throw ValidationError when order items are empty', async () => {
      const newOrder = {
        customer_name: 'Cliente',
        customer_email: 'cliente@example.com',
        delivery_address: 'Test Address',
        total_amount_usd: 29.99
      }

      await expect(orderService.createOrderWithItems(newOrder, [])).rejects.toThrow(
        'Order validation failed'
      )
    })
  })

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const orderId = 123
      const newStatus = 'verified'

      const updatedOrder = {
        id: orderId,
        status: newStatus
      }

      // Mock the RPC call
      const { supabase } = await import('../supabaseClient.js')
      supabase.rpc = vi.fn().mockResolvedValueOnce({
        data: updatedOrder,
        error: null
      })

      const result = await orderService.updateOrderStatus(orderId, newStatus)

      expect(result).toEqual(updatedOrder)
      expect(supabase.rpc).toHaveBeenCalledWith('update_order_status_with_history', {
        order_id: orderId,
        new_status: newStatus,
        notes: null,
        changed_by: null
      })
    })

    it('should throw BadRequestError for invalid order ID', async () => {
      await expect(orderService.updateOrderStatus(null, 'verified')).rejects.toThrow(
        BadRequestError
      )
      await expect(orderService.updateOrderStatus(0, 'verified')).rejects.toThrow(BadRequestError)
    })
  })
})
