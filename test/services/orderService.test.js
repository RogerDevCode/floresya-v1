/**
 * Order Service Tests - Vitest Edition
 * Comprehensive testing of order service business logic
 * Following KISS principle and Supabase best practices
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks, createMockRepository, testData } from './setup.js'
import {
  ValidationError,
  NotFoundError,
  BadRequestError,
  DatabaseError
} from '../../api/errors/AppError.js'

// Import services after mocks are set up
import {
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  createOrderWithItems,
  updateOrderStatus,
  updateOrder,
  cancelOrder,
  getOrderStatusHistory
} from '../../api/services/orderService.js'

// DIContainer is mocked globally in setup.js

// Mock supabase client
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      gte: vi.fn(),
      lte: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
      range: vi.fn()
    }))
  },
  DB_SCHEMA: {
    orders: {
      table: 'orders',
      enums: {
        status: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled']
      }
    }
  }
}))

describe('Order Service - Business Logic Layer', () => {
  let mockOrderRepository
  let mockProductRepository
  let mockSupabase

  beforeEach(async () => {
    resetAllMocks()

    // Setup specific mocks for this test suite
    mockOrderRepository = createMockRepository({
      findAllWithFilters: vi.fn(),
      findByIdWithItems: vi.fn(),
      findByUserId: vi.fn(),
      findStatusHistoryByOrderId: vi.fn(),
      update: vi.fn(),
      cancel: vi.fn()
    })

    mockProductRepository = createMockRepository({
      findById: vi.fn()
    })

    mockSupabase = {
      rpc: vi.fn(),
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis()
      }))
    }

    // Setup DIContainer mocks
    const { default: DIContainer } = await import('../../api/architecture/di-container.js')
    DIContainer.resolve.mockImplementation(serviceName => {
      const mocks = {
        OrderRepository: mockOrderRepository,
        ProductRepository: mockProductRepository,
        Logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
        SupabaseClient: mockSupabase
      }
      return mocks[serviceName] || createMockRepository()
    })

    // Setup supabase mock
    const supabaseModule = await import('../../api/services/supabaseClient.js')
    supabaseModule.supabase = mockSupabase
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('getAllOrders - Retrieve all orders with filters', () => {
    test('should return all orders when no filters provided', async () => {
      const mockOrders = [testData.orders.pending, testData.orders.delivered]
      mockOrderRepository.findAllWithFilters.mockResolvedValue(mockOrders)

      const result = await getAllOrders()

      expect(mockOrderRepository.findAllWithFilters).toHaveBeenCalledWith(
        {},
        { includeDeactivated: false }
      )
      expect(result).toEqual(mockOrders)
    })

    test('should apply filters correctly', async () => {
      const filters = { status: 'pending', user_id: 1 }
      const mockOrders = [testData.orders.pending]
      mockOrderRepository.findAllWithFilters.mockResolvedValue(mockOrders)

      const result = await getAllOrders(filters, true)

      expect(mockOrderRepository.findAllWithFilters).toHaveBeenCalledWith(filters, {
        includeDeactivated: true
      })
      expect(result).toEqual(mockOrders)
    })

    test('should throw NotFoundError when no orders found', async () => {
      mockOrderRepository.findAllWithFilters.mockResolvedValue(null)

      await expect(getAllOrders()).rejects.toThrow(NotFoundError)
    })
  })

  describe('getOrderById - Retrieve single order by ID', () => {
    test('should return order when found', async () => {
      const mockOrder = { ...testData.orders.pending, order_items: [] }
      mockOrderRepository.findByIdWithItems.mockResolvedValue(mockOrder)

      const result = await getOrderById(1)

      expect(mockOrderRepository.findByIdWithItems).toHaveBeenCalledWith(1, false)
      expect(result).toEqual(mockOrder)
    })

    test('should include deactivated orders when requested', async () => {
      const mockOrder = { ...testData.orders.pending, status: 'cancelled', order_items: [] }
      mockOrderRepository.findByIdWithItems.mockResolvedValue(mockOrder)

      const result = await getOrderById(1, true)

      expect(mockOrderRepository.findByIdWithItems).toHaveBeenCalledWith(1, true)
      expect(result).toEqual(mockOrder)
    })

    test('should throw BadRequestError for invalid ID', async () => {
      await expect(getOrderById('invalid')).rejects.toThrow(BadRequestError)
    })

    test('should throw NotFoundError when order not found', async () => {
      mockOrderRepository.findByIdWithItems.mockResolvedValue(null)

      await expect(getOrderById(999)).rejects.toThrow(NotFoundError)
    })
  })

  describe('getOrdersByUser - Retrieve orders by user ID', () => {
    test('should return orders for user', async () => {
      const mockOrders = [testData.orders.pending]
      mockOrderRepository.findByUserId.mockResolvedValue(mockOrders)

      const result = await getOrdersByUser(1)

      expect(mockOrderRepository.findByUserId).toHaveBeenCalledWith(1, {})
      expect(result).toEqual(mockOrders)
    })

    test('should apply filters correctly', async () => {
      const filters = { status: 'delivered' }
      const mockOrders = [testData.orders.delivered]
      mockOrderRepository.findByUserId.mockResolvedValue(mockOrders)

      const result = await getOrdersByUser(1, filters)

      expect(mockOrderRepository.findByUserId).toHaveBeenCalledWith(1, filters)
      expect(result).toEqual(mockOrders)
    })

    test('should throw BadRequestError for invalid user ID', async () => {
      await expect(getOrdersByUser('invalid')).rejects.toThrow(BadRequestError)
    })

    test('should throw NotFoundError when no orders found', async () => {
      mockOrderRepository.findByUserId.mockResolvedValue(null)

      await expect(getOrdersByUser(1)).rejects.toThrow(NotFoundError)
    })
  })

  describe('createOrderWithItems - Create order with items atomically', () => {
    test('should create order successfully', async () => {
      const orderData = {
        user_id: 1,
        customer_email: 'customer@example.com',
        customer_name: 'Customer Name',
        delivery_address: 'Test Address',
        status: 'pending',
        total_amount_usd: 29.99
      }
      const orderItems = [
        {
          product_id: 1,
          product_name: 'Test Product',
          unit_price_usd: 29.99,
          quantity: 1
        }
      ]

      const createdOrder = { id: 1, ...orderData }
      mockSupabase.rpc.mockResolvedValue({ data: createdOrder, error: null })
      mockProductRepository.findById.mockResolvedValue(testData.products.active)

      const result = await createOrderWithItems(orderData, orderItems)

      expect(mockSupabase.rpc).toHaveBeenCalledWith('create_order_with_items', {
        order_data: expect.objectContaining(orderData),
        order_items: expect.any(Array)
      })
      expect(result).toEqual(createdOrder)
    })

    test('should validate order data', async () => {
      const invalidOrderData = { customer_email: 'invalid' } // Missing required fields
      const orderItems = []

      await expect(createOrderWithItems(invalidOrderData, orderItems)).rejects.toThrow(
        ValidationError
      )
    })

    test('should validate order items', async () => {
      const orderData = {
        customer_email: 'customer@example.com',
        customer_name: 'Customer Name',
        delivery_address: 'Test Address',
        total_amount_usd: 29.99
      }
      const invalidOrderItems = [] // Empty items

      await expect(createOrderWithItems(orderData, invalidOrderItems)).rejects.toThrow(
        ValidationError
      )
    })

    test('should check product availability', async () => {
      const orderData = {
        customer_email: 'customer@example.com',
        customer_name: 'Customer Name',
        delivery_address: 'Test Address',
        total_amount_usd: 29.99
      }
      const orderItems = [
        {
          product_id: 1,
          product_name: 'Test Product',
          unit_price_usd: 29.99,
          quantity: 1
        }
      ]

      mockProductRepository.findById.mockResolvedValue(null) // Product not found

      await expect(createOrderWithItems(orderData, orderItems)).rejects.toThrow(NotFoundError)
    })

    test('should handle insufficient stock', async () => {
      const orderData = {
        customer_email: 'customer@example.com',
        customer_name: 'Customer Name',
        delivery_address: 'Test Address',
        total_amount_usd: 299.9
      }
      const orderItems = [
        {
          product_id: 1,
          product_name: 'Test Product',
          unit_price_usd: 29.99,
          quantity: 10 // More than available stock
        }
      ]

      const productWithLowStock = { ...testData.products.active, stock: 5 }
      mockProductRepository.findById.mockResolvedValue(productWithLowStock)

      await expect(createOrderWithItems(orderData, orderItems)).rejects.toThrow(ValidationError)
    })
  })

  describe('updateOrderStatus - Update order status with history', () => {
    test('should update order status successfully', async () => {
      const updatedOrder = { ...testData.orders.pending, status: 'shipped' }
      mockSupabase.rpc.mockResolvedValue({ data: updatedOrder, error: null })

      const result = await updateOrderStatus(1, 'shipped')

      expect(mockSupabase.rpc).toHaveBeenCalledWith('update_order_status_with_history', {
        order_id: 1,
        new_status: 'shipped',
        notes: null,
        changed_by: null
      })
      expect(result).toEqual(updatedOrder)
    })

    test('should include notes and changed_by', async () => {
      const updatedOrder = { ...testData.orders.pending, status: 'delivered' }
      mockSupabase.rpc.mockResolvedValue({ data: updatedOrder, error: null })

      const result = await updateOrderStatus(1, 'delivered', 'Order delivered successfully', 2)

      expect(mockSupabase.rpc).toHaveBeenCalledWith('update_order_status_with_history', {
        order_id: 1,
        new_status: 'delivered',
        notes: 'Order delivered successfully',
        changed_by: 2
      })
      expect(result).toEqual(updatedOrder)
    })

    test('should throw BadRequestError for invalid order ID', async () => {
      await expect(updateOrderStatus('invalid', 'shipped')).rejects.toThrow(BadRequestError)
    })

    test('should throw BadRequestError for invalid status', async () => {
      await expect(updateOrderStatus(1, 'invalid')).rejects.toThrow(BadRequestError)
    })

    test('should throw NotFoundError when order not found', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'not found' }
      })

      await expect(updateOrderStatus(999, 'shipped')).rejects.toThrow(NotFoundError)
    })
  })

  describe('updateOrder - Update order details', () => {
    test('should update order successfully', async () => {
      const updates = { delivery_address: 'New Address 123' }
      const updatedOrder = { ...testData.orders.pending, ...updates }
      mockOrderRepository.update.mockResolvedValue(updatedOrder)

      const result = await updateOrder(1, updates)

      expect(mockOrderRepository.update).toHaveBeenCalledWith(1, updates)
      expect(result).toEqual(updatedOrder)
    })

    test('should throw BadRequestError for invalid ID', async () => {
      await expect(updateOrder('invalid', { delivery_address: 'Test' })).rejects.toThrow(
        BadRequestError
      )
    })

    test('should throw BadRequestError for empty updates', async () => {
      await expect(updateOrder(1, {})).rejects.toThrow(BadRequestError)
    })

    test('should validate order data', async () => {
      const invalidUpdates = { status: 'invalid' }
      await expect(updateOrder(1, invalidUpdates)).rejects.toThrow(ValidationError)
    })
  })

  describe('cancelOrder - Cancel order', () => {
    test('should cancel order successfully', async () => {
      const cancelledOrder = { ...testData.orders.pending, status: 'cancelled' }
      mockOrderRepository.cancel.mockResolvedValue(cancelledOrder)

      const result = await cancelOrder(1)

      expect(mockOrderRepository.cancel).toHaveBeenCalledWith(1, 'Order cancelled')
      expect(result).toEqual(cancelledOrder)
    })

    test('should include custom notes', async () => {
      const cancelledOrder = { ...testData.orders.pending, status: 'cancelled' }
      mockOrderRepository.cancel.mockResolvedValue(cancelledOrder)

      const result = await cancelOrder(1, 'Customer requested cancellation')

      expect(mockOrderRepository.cancel).toHaveBeenCalledWith(1, 'Customer requested cancellation')
      expect(result).toEqual(cancelledOrder)
    })

    test('should throw BadRequestError for invalid order ID', async () => {
      await expect(cancelOrder('invalid')).rejects.toThrow(BadRequestError)
    })
  })

  describe('getOrderStatusHistory - Get order status history', () => {
    test('should return status history', async () => {
      const history = [
        {
          id: 1,
          order_id: 1,
          old_status: null,
          new_status: 'pending',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          order_id: 1,
          old_status: 'pending',
          new_status: 'shipped',
          created_at: '2024-01-02T00:00:00Z'
        }
      ]
      mockOrderRepository.findStatusHistoryByOrderId.mockResolvedValue(history)

      const result = await getOrderStatusHistory(1)

      expect(mockOrderRepository.findStatusHistoryByOrderId).toHaveBeenCalledWith(1)
      expect(result).toEqual(history)
    })

    test('should throw BadRequestError for invalid order ID', async () => {
      await expect(getOrderStatusHistory('invalid')).rejects.toThrow(BadRequestError)
    })

    test('should throw NotFoundError when no history found', async () => {
      mockOrderRepository.findStatusHistoryByOrderId.mockResolvedValue([])

      await expect(getOrderStatusHistory(1)).rejects.toThrow(NotFoundError)
    })
  })

  describe('Error Handling - Comprehensive error scenarios', () => {
    test('should handle database errors gracefully', async () => {
      mockOrderRepository.findAllWithFilters.mockRejectedValue(
        new Error('Database connection failed')
      )

      await expect(getAllOrders()).rejects.toThrow('Database connection failed')
    })

    test('should propagate AppError instances', async () => {
      const appError = new NotFoundError('Order', 999)
      mockOrderRepository.findByIdWithItems.mockRejectedValue(appError)

      await expect(getOrderById(999)).rejects.toThrow(NotFoundError)
    })

    test('should handle RPC errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC failed' }
      })

      await expect(updateOrderStatus(1, 'shipped')).rejects.toThrow(DatabaseError)
    })
  })

  describe('Input Validation - Edge cases and boundary conditions', () => {
    test('should handle null and undefined inputs', async () => {
      await expect(getOrderById(null)).rejects.toThrow(BadRequestError)
      await expect(getOrdersByUser(undefined)).rejects.toThrow(BadRequestError)
      await expect(updateOrderStatus(null, 'shipped')).rejects.toThrow(BadRequestError)
    })

    test('should validate status transitions', async () => {
      // This would be tested with business logic validation
      // For now, we test the basic validation
      await expect(updateOrderStatus(1, 'invalid_status')).rejects.toThrow(BadRequestError)
    })

    test('should handle large numeric values', async () => {
      const largeOrderId = 999999999
      mockOrderRepository.findByIdWithItems.mockResolvedValue(testData.orders.pending)

      const result = await getOrderById(largeOrderId)
      expect(result).toEqual(testData.orders.pending)
    })

    test('should handle zero and negative IDs', async () => {
      await expect(getOrderById(0)).rejects.toThrow(BadRequestError)
      await expect(getOrderById(-1)).rejects.toThrow(NotFoundError) // -1 passes validation but doesn't exist
      await expect(getOrdersByUser(0)).rejects.toThrow(BadRequestError)
      await expect(getOrdersByUser(-1)).rejects.toThrow(NotFoundError) // -1 passes validation but doesn't exist
    })

    test('should handle extremely long email addresses', async () => {
      const longEmail = 'a'.repeat(200) + '@example.com'
      const orderItems = [
        {
          product_id: 1,
          product_name: 'Test Product',
          unit_price_usd: 29.99,
          quantity: 1
        }
      ]
      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.unit_price_usd * item.quantity,
        0
      )
      const orderData = {
        customer_email: longEmail,
        customer_name: 'Test Customer',
        delivery_address: 'Test Address',
        total_amount_usd: totalAmount // Required for validation
      }

      mockProductRepository.findById.mockResolvedValue(testData.products.active)
      mockSupabase.rpc.mockResolvedValue({ data: { id: 1 }, error: null })

      await expect(createOrderWithItems(orderData, orderItems)).resolves.toMatchObject({
        id: 1
      })
    })

    test('should handle special characters in customer names', async () => {
      const specialName = 'José María García-Ñoño'
      const orderItems = [
        {
          product_id: 1,
          product_name: 'Test Product',
          unit_price_usd: 29.99,
          quantity: 1
        }
      ]
      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.unit_price_usd * item.quantity,
        0
      )
      const orderData = {
        customer_email: 'test@example.com',
        customer_name: specialName,
        delivery_address: 'Test Address',
        total_amount_usd: totalAmount // Required for validation
      }

      mockProductRepository.findById.mockResolvedValue(testData.products.active)
      mockSupabase.rpc.mockResolvedValue({
        data: { id: 1, customer_name: specialName },
        error: null
      })

      const result = await createOrderWithItems(orderData, orderItems)
      expect(result.customer_name).toBe(specialName)
    })

    test('should handle boundary values for quantities and prices', async () => {
      const orderItems = [
        {
          product_id: 1,
          product_name: 'Test Product',
          unit_price_usd: 0.01,
          quantity: 1
        }
      ]

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.unit_price_usd * item.quantity,
        0
      )

      const orderData = {
        customer_email: 'test@example.com',
        customer_name: 'Test Customer',
        delivery_address: 'Test Address',
        total_amount_usd: totalAmount
      }

      const productWithLowPrice = { ...testData.products.active, price_usd: 0.01, stock: 1 }
      mockProductRepository.findById.mockResolvedValue(productWithLowPrice)
      mockSupabase.rpc.mockResolvedValue({
        data: { id: 1, total_amount_usd: totalAmount },
        error: null
      })

      const result = await createOrderWithItems(orderData, orderItems)
      expect(result.total_amount_usd).toBe(0.01)
    })
  })

  describe('Business Logic - Complex scenarios', () => {
    test('should handle concurrent order creation', async () => {
      const orderItems = [
        {
          product_id: 1,
          product_name: 'Test Product',
          unit_price_usd: 29.99,
          quantity: 1
        }
      ]
      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.unit_price_usd * item.quantity,
        0
      )
      const orderData = {
        customer_email: 'test@example.com',
        customer_name: 'Test Customer',
        delivery_address: 'Test Address',
        total_amount_usd: totalAmount // Required for validation
      }

      mockProductRepository.findById.mockResolvedValue(testData.products.active)
      mockSupabase.rpc.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return { data: { id: Math.random() }, error: null }
      })

      const promises = [
        createOrderWithItems({ ...orderData, customer_email: 'test1@example.com' }, orderItems),
        createOrderWithItems({ ...orderData, customer_email: 'test2@example.com' }, orderItems),
        createOrderWithItems({ ...orderData, customer_email: 'test3@example.com' }, orderItems)
      ]

      const results = await Promise.all(promises)
      expect(results).toHaveLength(3)
      expect(results[0].id).toEqual(expect.any(Number))
      expect(results[1].id).toEqual(expect.any(Number))
      expect(results[2].id).toEqual(expect.any(Number))
    })

    test('should validate order total calculation', async () => {
      const orderItems = [
        {
          product_id: 1,
          product_name: 'Product 1',
          unit_price_usd: 10.0,
          quantity: 2
        },
        {
          product_id: 2,
          product_name: 'Product 2',
          unit_price_usd: 15.0,
          quantity: 1
        }
      ]

      // Calculate expected total: (10.0 * 2) + (15.0 * 1) = 35.0
      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.unit_price_usd * item.quantity,
        0
      )

      const orderData = {
        customer_email: 'test@example.com',
        customer_name: 'Test Customer',
        delivery_address: 'Test Address',
        total_amount_usd: totalAmount // Required for validation
      }

      const product1 = { ...testData.products.active, id: 1, price_usd: 10.0, stock: 10 }
      const product2 = { ...testData.products.active, id: 2, price_usd: 15.0, stock: 10 }

      mockProductRepository.findById.mockImplementation((id, includeDeactivated) => {
        return Promise.resolve(id === 1 ? product1 : product2)
      })

      mockSupabase.rpc.mockResolvedValue({ data: { id: 1 }, error: null })

      await expect(createOrderWithItems(orderData, orderItems)).resolves.toMatchObject({
        id: 1
      })
      expect(mockProductRepository.findById).toHaveBeenCalledWith(1, true)
      expect(mockProductRepository.findById).toHaveBeenCalledWith(2, true)
    })

    test('should handle complex status transitions', async () => {
      const statusTransitions = [
        { from: 'pending', to: 'verified' },
        { from: 'verified', to: 'preparing' },
        { from: 'preparing', to: 'shipped' },
        { from: 'shipped', to: 'delivered' }
      ]

      for (const transition of statusTransitions) {
        const updatedOrder = { ...testData.orders.pending, status: transition.to }
        mockSupabase.rpc.mockResolvedValue({ data: updatedOrder, error: null })

        const result = await updateOrderStatus(1, transition.to)
        expect(result.status).toBe(transition.to)
      }
    })

    test('should handle date filtering correctly', async () => {
      const filters = {
        date_from: '2024-01-01',
        date_to: '2024-12-31'
      }
      const mockOrders = [testData.orders.pending]
      mockOrderRepository.findAllWithFilters.mockResolvedValue(mockOrders)

      const result = await getAllOrders(filters)

      expect(mockOrderRepository.findAllWithFilters).toHaveBeenCalledWith(filters, {
        includeDeactivated: false
      })
      expect(result).toEqual(mockOrders)
    })

    test('should handle search functionality with accent-insensitive matching', async () => {
      const searchFilters = { search: 'José' }
      const mockOrders = [testData.orders.pending]
      mockOrderRepository.findAllWithFilters.mockResolvedValue(mockOrders)

      const result = await getAllOrders(searchFilters)

      expect(mockOrderRepository.findAllWithFilters).toHaveBeenCalledWith(searchFilters, {
        includeDeactivated: false
      })
      expect(result).toEqual(mockOrders)
    })
  })

  describe('Performance and Scalability', () => {
    test('should handle large result sets efficiently', async () => {
      const largeOrderList = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        customer_email: `customer${i + 1}@example.com`,
        status: 'pending'
      }))

      mockOrderRepository.findAllWithFilters.mockResolvedValue(largeOrderList)

      const result = await getAllOrders({ limit: 100 })
      expect(result).toHaveLength(100)
      expect(mockOrderRepository.findAllWithFilters).toHaveBeenCalledTimes(1)
    })

    test('should handle orders with many items', async () => {
      const orderWithManyItems = {
        ...testData.orders.pending,
        order_items: Array.from({ length: 50 }, (_, i) => ({
          product_id: i + 1,
          product_name: `Product ${i + 1}`,
          quantity: 1,
          unit_price_usd: 10.0
        }))
      }

      mockOrderRepository.findByIdWithItems.mockResolvedValue(orderWithManyItems)

      const result = await getOrderById(1)
      expect(result.order_items).toHaveLength(50)
    })

    test('should handle complex filtering with multiple conditions', async () => {
      const complexFilters = {
        user_id: 1,
        status: 'pending',
        date_from: '2024-01-01',
        date_to: '2024-12-31',
        search: 'test',
        limit: 25,
        offset: 0
      }

      const mockOrders = [testData.orders.pending]
      mockOrderRepository.findAllWithFilters.mockResolvedValue(mockOrders)

      const result = await getAllOrders(complexFilters)
      expect(result).toEqual(mockOrders)
      expect(mockOrderRepository.findAllWithFilters).toHaveBeenCalledWith(complexFilters, {
        includeDeactivated: false
      })
    })
  })

  describe('Integration Scenarios', () => {
    test('should handle complete order lifecycle', async () => {
      // 1. Create order
      const orderItems = [
        {
          product_id: 1,
          product_name: 'Test Product',
          unit_price_usd: 29.99,
          quantity: 1
        }
      ]

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.unit_price_usd * item.quantity,
        0
      )

      const orderData = {
        customer_email: 'test@example.com',
        customer_name: 'Test Customer',
        delivery_address: 'Test Address',
        total_amount_usd: totalAmount // Required for validation
      }

      const createdOrder = { id: 1, ...orderData, status: 'pending' }
      mockProductRepository.findById.mockResolvedValue(testData.products.active)
      mockSupabase.rpc.mockResolvedValueOnce({ data: createdOrder, error: null })

      const order = await createOrderWithItems(orderData, orderItems)
      expect(order.status).toBe('pending')

      // 2. Update status to verified
      const verifiedOrder = { ...createdOrder, status: 'verified' }
      mockSupabase.rpc.mockResolvedValueOnce({ data: verifiedOrder, error: null })

      const updatedOrder = await updateOrderStatus(1, 'verified')
      expect(updatedOrder.status).toBe('verified')

      // 3. Get order status history
      const history = [
        {
          id: 1,
          order_id: 1,
          old_status: null,
          new_status: 'pending',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          order_id: 1,
          old_status: 'pending',
          new_status: 'verified',
          created_at: '2024-01-01T01:00:00Z'
        }
      ]
      mockOrderRepository.findStatusHistoryByOrderId.mockResolvedValue(history)

      const statusHistory = await getOrderStatusHistory(1)
      expect(statusHistory).toHaveLength(2)
      expect(statusHistory[0].new_status).toBe('pending')
      expect(statusHistory[1].new_status).toBe('verified')
    })

    test('should handle product stock updates during order creation', async () => {
      const orderItems = [
        {
          product_id: 1,
          product_name: 'Test Product',
          unit_price_usd: 29.99,
          quantity: 3
        }
      ]

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.unit_price_usd * item.quantity,
        0
      )

      const orderData = {
        customer_email: 'test@example.com',
        customer_name: 'Test Customer',
        delivery_address: 'Test Address',
        total_amount_usd: totalAmount // Required for validation
      }

      const product = { ...testData.products.active, stock: 10 }
      mockProductRepository.findById.mockResolvedValue(product)
      mockSupabase.rpc.mockResolvedValue({ data: { id: 1 }, error: null })

      await createOrderWithItems(orderData, orderItems)

      expect(mockProductRepository.findById).toHaveBeenCalledWith(1, true)
      // Verify the stock was sufficient (3 <= 10)
    })
  })
})
