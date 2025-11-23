/**
 * Order Repository Tests - Vitest Edition
 * Comprehensive testing of order repository operations
 * Following KISS principle and Supabase best practices
 */
// @ts-nocheck

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks, createMockSupabase, testData, mockErrors } from './setup.js'
import { OrderRepository } from '../../api/repositories/OrderRepository.js'
import { BadRequestError } from '../../api/errors/AppError.js'

// Mock Supabase client
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: createMockSupabase(),
  DB_SCHEMA: {
    orders: { table: 'orders' },
    order_status_history: { table: 'order_status_history' }
  }
}))

describe('Order Repository - Order-specific Operations', () => {
  let mockSupabase
  let repository

  beforeEach(async () => {
    resetAllMocks()

    mockSupabase = createMockSupabase()

    // Mock the supabase import
    const supabaseModule = await import('../../api/services/supabaseClient.js')
    supabaseModule.supabase = mockSupabase

    repository = new OrderRepository(mockSupabase)
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('findAllWithFilters - Find orders with complex filters', () => {
    test('should return orders with user and item joins', async () => {
      const mockOrders = [testData.orders.pending]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithFilters()

      expect(result).toEqual(mockOrders)
    })

    test('should apply userId filter', async () => {
      const filters = { userId: 1 }
      const mockOrders = [testData.orders.pending]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockOrders)
    })

    test('should apply status filter', async () => {
      const filters = { status: 'pending' }
      const mockOrders = [testData.orders.pending]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockOrders)
    })

    test('should apply date range filters', async () => {
      const filters = { dateFrom: '2024-01-01', dateTo: '2024-01-31' }
      const mockOrders = [testData.orders.pending]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockOrders)
    })

    test('should apply total amount filters', async () => {
      const filters = { minTotal: 10, maxTotal: 100 }
      const mockOrders = [testData.orders.pending]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockOrders)
    })
  })

  describe('findByIdWithItems - Find order with items and product details', () => {
    test('should return order with full details', async () => {
      const mockOrder = {
        ...testData.orders.pending,
        users: testData.users.active,
        order_items: [
          {
            id: 1,
            product_id: 1,
            product_name: 'Test Product',
            quantity: 1,
            unit_price_usd: 29.99,
            products: testData.products.active
          }
        ]
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockOrder, error: null })
          })
        })
      })

      const result = await repository.findByIdWithItems(1)

      expect(result).toEqual(mockOrder)
    })

    test('should return null when order not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notFound })
          })
        })
      })

      const result = await repository.findByIdWithItems(999)

      expect(result).toBeNull()
    })
  })

  describe('findByUserId - Find orders by user', () => {
    test('should return orders for user', async () => {
      const mockOrders = [testData.orders.pending]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
          })
        })
      })

      const result = await repository.findByUserId(1)

      expect(result).toEqual(mockOrders)
    })

    test('should apply pagination options', async () => {
      const options = { limit: 10, offset: 5 }
      const mockOrders = [testData.orders.pending]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
            })
          })
        })
      })

      const result = await repository.findByUserId(1, options)

      expect(result).toEqual(mockOrders)
    })
  })

  describe('updateStatus - Update order status', () => {
    test('should update status successfully', async () => {
      const updatedOrder = { ...testData.orders.pending, status: 'shipped' }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedOrder, error: null })
            })
          })
        })
      })

      const result = await repository.updateStatus(1, 'shipped')

      expect(result).toEqual(updatedOrder)
    })

    test('should throw BadRequestError for invalid status', async () => {
      await expect(repository.updateStatus(1, 'invalid')).rejects.toThrow(BadRequestError)
    })
  })

  describe('updatePaymentStatus - Update payment status', () => {
    test('should update payment status successfully', async () => {
      const updatedOrder = { ...testData.orders.pending, payment_status: 'paid' }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedOrder, error: null })
            })
          })
        })
      })

      const result = await repository.updatePaymentStatus(1, 'paid')

      expect(result).toEqual(updatedOrder)
    })

    test('should include payment method when provided', async () => {
      const updatedOrder = {
        ...testData.orders.pending,
        payment_status: 'paid',
        payment_method: 'card'
      }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedOrder, error: null })
            })
          })
        })
      })

      const result = await repository.updatePaymentStatus(1, 'paid', 'card')

      expect(result).toEqual(updatedOrder)
    })

    test('should throw BadRequestError for invalid payment status', async () => {
      await expect(repository.updatePaymentStatus(1, 'invalid')).rejects.toThrow(BadRequestError)
    })
  })

  describe('findByStatus - Find orders by status', () => {
    test('should return orders with specified status', async () => {
      const mockOrders = [testData.orders.pending]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
          })
        })
      })

      const result = await repository.findByStatus('pending')

      expect(result).toEqual(mockOrders)
    })
  })

  describe('findByPaymentStatus - Find orders by payment status', () => {
    test('should return orders with specified payment status', async () => {
      const mockOrders = [testData.orders.pending]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
          })
        })
      })

      const result = await repository.findByPaymentStatus('paid')

      expect(result).toEqual(mockOrders)
    })
  })

  describe('getStats - Get order statistics', () => {
    test('should return order statistics', async () => {
      const mockOrders = [
        { status: 'pending', total_amount_usd: 29.99 },
        { status: 'delivered', total_amount_usd: 49.99 },
        { status: 'cancelled', total_amount_usd: 19.99 }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
      })

      const result = await repository.getStats()

      expect(result.total).toBe(3)
      expect(result.totalAmount).toBe(99.97)
      expect(result.byStatus.pending).toBe(1)
      expect(result.byStatus.delivered).toBe(1)
      expect(result.byStatus.cancelled).toBe(1)
    })

    test('should apply date filters to stats', async () => {
      const filters = { dateFrom: '2024-01-01', dateTo: '2024-01-31' }
      const mockOrders = [testData.orders.pending]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.getStats(filters)

      expect(mockQuery.gte).toHaveBeenCalledWith('created_at', '2024-01-01')
      expect(mockQuery.lte).toHaveBeenCalledWith('created_at', '2024-01-31')
      expect(result.total).toBe(1)
    })
  })

  describe('findByDateRange - Find orders by date range', () => {
    test('should return orders within date range', async () => {
      const mockOrders = [testData.orders.pending]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            lte: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
            })
          })
        })
      })

      const result = await repository.findByDateRange('2024-01-01', '2024-01-31')

      expect(result).toEqual(mockOrders)
    })

    test('should apply pagination options', async () => {
      const options = { limit: 20, offset: 10 }
      const mockOrders = [testData.orders.pending]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            lte: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
              })
            })
          })
        })
      })

      const result = await repository.findByDateRange('2024-01-01', '2024-01-31', options)

      expect(result).toEqual(mockOrders)
    })
  })

  describe('calculateOrderTotal - Calculate order total', () => {
    test('should calculate total from items', () => {
      const items = [
        { price: 10, quantity: 2, discount: 1 },
        { price: 5, quantity: 3, discount: 0 }
      ]

      const result = repository.calculateOrderTotal(items)

      expect(result).toBe(34) // (10*2-1) + (5*3-0) = 19 + 15 = 34
    })

    test('should handle empty items array', () => {
      const result = repository.calculateOrderTotal([])
      expect(result).toBe(0)
    })

    test('should handle items with missing properties', () => {
      const items = [{}, { price: 10 }]
      const result = repository.calculateOrderTotal(items)
      expect(result).toBe(10)
    })
  })

  describe('searchOrders - Search orders by term', () => {
    test('should search orders by term', async () => {
      const searchTerm = 'john'
      const mockOrders = [testData.orders.pending]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.searchOrders(searchTerm)

      expect(mockQuery.or).toHaveBeenCalledWith(
        'id.ilike.%john%,users.email.ilike.%john%,users.full_name.ilike.%john%'
      )
      expect(mockQuery.limit).toHaveBeenCalledWith(50)
      expect(result).toEqual(mockOrders)
    })

    test('should apply custom limit', async () => {
      const searchTerm = 'test'
      const limit = 25
      const mockOrders = [testData.orders.pending]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockOrders, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.searchOrders(searchTerm, false, limit)

      expect(mockQuery.limit).toHaveBeenCalledWith(25)
      expect(result).toEqual(mockOrders)
    })
  })

  describe('cancel - Cancel order', () => {
    test('should cancel order successfully', async () => {
      const cancelledOrder = {
        ...testData.orders.pending,
        status: 'cancelled',
        cancellation_reason: 'Customer request'
      }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: cancelledOrder, error: null })
            })
          })
        })
      })

      const result = await repository.cancel(1, 'Customer request')

      expect(result).toEqual(cancelledOrder)
    })
  })

  describe('findStatusHistoryByOrderId - Get order status history', () => {
    test('should return status history', async () => {
      const mockHistory = [
        {
          id: 1,
          order_id: 1,
          old_status: null,
          new_status: 'pending',
          notes: null,
          changed_by: null,
          created_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockHistory, error: null })
          })
        })
      })

      const result = await repository.findStatusHistoryByOrderId(1)

      expect(result).toEqual(mockHistory)
    })

    test('should return empty array when no history found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      })

      const result = await repository.findStatusHistoryByOrderId(1)

      expect(result).toEqual([])
    })
  })
})
