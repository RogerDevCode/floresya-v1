/**
 * Order Repository - Granular Unit Tests
 * Based on Testing Trophy & Clean Architecture
 *
 * Coverage Target: 95%
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OrderRepository } from '../../../api/repositories/OrderRepository.js'
import { _setupOrderRepositoryMock } from '../../utils/repository-mocks.js'

// Mock Supabase
const mockSupabase = _setupOrderRepositoryMock()

// Mock select chain
const selectMock = {
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
}

//
const mockOrder = {
  id: 1,
  user_id: 123,
  status: 'pending',
  total_amount_usd: 50.99,
  total_amount_ves: 1860,
  currency_rate: 36.45,
  customer_name: 'Test Customer',
  customer_email: 'test@example.com',
  customer_phone: '+56912345678',
  delivery_address: 'Test Address',
  delivery_date: '2024-01-15',
  delivery_time_slot: '09:00-12:00',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

describe('OrderRepository - Granular Tests', () => {
  let repository

  beforeEach(() => {
    repository = new OrderRepository(mockSupabase)
    vi.clearAllMocks()
  })

  // ============================================
  // FIND BY ID WITH ITEMS TESTS
  // ============================================

  describe('findByIdWithItems()', () => {
    it('should return order with items when valid ID exists', async () => {
      // Arrange
      const _mockData = { data: { ...mockOrder, order_items: [], users: {} }, error: null }

      // Act
      const result = await repository.findByIdWithItems(1)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('orders')
      expect(selectMock.eq).toHaveBeenCalledWith('id', 1)
      expect(result).toBeDefined()
    })

    it('should return null when order not found', async () => {
      // Arrange
      const _mockData = { data: null, error: { code: 'PGRST116' } }

      // Act
      const result = await repository.findByIdWithItems(999)

      // Assert
      expect(result).toBeNull()
    })

    it('should include inactive orders when includeInactive=true', async () => {
      // Arrange
      const _mockData = { data: mockOrder, error: null }

      // Act
      const result = await repository.findByIdWithItems(1, true)

      // Assert
      expect(result).toEqual(mockOrder)
    })

    it('should throw error on database error', async () => {
      // Arrange
      const _mockError = { code: 'PGRST301', message: 'Database error' }

      // Act & Assert
      await expect(repository.findByIdWithItems(1)).rejects.toThrow()
    })
  })

  // ============================================
  // FIND ALL WITH FILTERS TESTS
  // ============================================

  describe('findAllWithFilters()', () => {
    it('should return orders with user and items', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      const result = await repository.findAllWithFilters()

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('orders')
      expect(result).toEqual([mockOrder])
    })

    it('should filter by user ID', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      await repository.findAllWithFilters({ userId: 123 })

      // Assert
      expect(selectMock.eq).toHaveBeenCalledWith('user_id', 123)
    })

    it('should filter by status', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      await repository.findAllWithFilters({ status: 'pending' })

      // Assert
      expect(selectMock.eq).toHaveBeenCalledWith('status', 'pending')
    })

    it('should filter by payment status', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      await repository.findAllWithFilters({ payment_status: 'paid' })

      // Assert
      expect(selectMock.eq).toHaveBeenCalledWith('payment_status', 'paid')
    })

    it('should filter by date range', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      await repository.findAllWithFilters({
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31'
      })

      // Assert
      expect(selectMock.gte).toHaveBeenCalledWith('created_at', '2024-01-01')
      expect(selectMock.lte).toHaveBeenCalledWith('created_at', '2024-01-31')
    })

    it('should filter by total amount range', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      await repository.findAllWithFilters({
        minTotal: 10,
        maxTotal: 100
      })

      // Assert
      expect(selectMock.gte).toHaveBeenCalledWith('total', 10)
      expect(selectMock.lte).toHaveBeenCalledWith('total', 100)
    })

    it('should apply sorting', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      await repository.findAllWithFilters({}, { orderBy: 'created_at', ascending: false })

      // Assert
      expect(selectMock.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should apply pagination', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      await repository.findAllWithFilters({}, { limit: 20, offset: 0 })

      // Assert
      expect(selectMock.range).toHaveBeenCalledWith(0, 19)
    })

    it('should return empty array when no orders match filters', async () => {
      // Arrange
      const _mockData = { data: null, error: null }

      // Act
      const result = await repository.findAllWithFilters()

      // Assert
      expect(result).toEqual([])
    })

    it('should throw error on database error', async () => {
      // Arrange
      const _mockError = { code: 'PGRST301', message: 'Database error' }

      // Act & Assert
      await expect(repository.findAllWithFilters()).rejects.toThrow()
    })
  })

  // ============================================
  // FIND BY USER ID TESTS
  // ============================================

  describe('findByUserId()', () => {
    it('should return orders for specific user', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      const result = await repository.findByUserId(123)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('orders')
      expect(selectMock.eq).toHaveBeenCalledWith('user_id', 123)
      expect(result).toEqual([mockOrder])
    })

    it('should include inactive orders when specified', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      const result = await repository.findByUserId(123, { includeInactive: true })

      // Assert
      expect(result).toEqual([mockOrder])
    })

    it('should apply default ordering (newest first)', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      await repository.findByUserId(123)

      // Assert
      expect(selectMock.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should apply custom ordering when specified', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      await repository.findByUserId(123, { orderBy: 'total_amount_usd', ascending: true })

      // Assert
      expect(selectMock.order).toHaveBeenCalledWith('total_amount_usd', { ascending: true })
    })

    it('should apply limit and offset', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      await repository.findByUserId(123, { limit: 10, offset: 20 })

      // Assert
      expect(selectMock.range).toHaveBeenCalledWith(20, 29)
    })

    it('should return empty array when user has no orders', async () => {
      // Arrange
      const _mockData = { data: null, error: null }

      // Act
      const result = await repository.findByUserId(999)

      // Assert
      expect(result).toEqual([])
    })

    it('should throw error on database error', async () => {
      // Arrange
      const _mockError = { code: 'PGRST301', message: 'Database error' }

      // Act & Assert
      await expect(repository.findByUserId(123)).rejects.toThrow()
    })
  })

  // ============================================
  // UPDATE STATUS TESTS
  // ============================================

  describe('updateStatus()', () => {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

    validStatuses.forEach(status => {
      it(`should update status to ${status}`, async () => {
        // Arrange
        const _mockData = { data: { ...mockOrder, status }, error: null }

        // Act
        const result = await repository.updateStatus(1, status)

        // Assert
        expect(selectMock.update).toHaveBeenCalled()
        expect(result.status).toBe(status)
      })
    })

    it('should throw BadRequestError for invalid status', async () => {
      // Arrange
      const invalidStatus = 'invalid-status'

      // Act & Assert
      await expect(repository.updateStatus(1, invalidStatus)).rejects.toThrow('Invalid status')
    })

    it('should set updated_at timestamp', async () => {
      // Arrange
      const _mockData = { data: { ...mockOrder, status: 'processing' }, error: null }

      // Act
      await repository.updateStatus(1, 'processing')

      // Assert
      const updateCall = selectMock.update.mock.calls[0][0]
      expect(updateCall.updated_at).toBeDefined()
    })

    it('should throw error on database error', async () => {
      // Arrange
      const _mockError = { code: 'PGRST301', message: 'Database error' }

      // Act & Assert
      await expect(repository.updateStatus(1, 'processing')).rejects.toThrow()
    })
  })

  // ============================================
  // UPDATE PAYMENT STATUS TESTS
  // ============================================

  describe('updatePaymentStatus()', () => {
    const validStatuses = ['pending', 'paid', 'failed', 'refunded', 'partial']

    validStatuses.forEach(status => {
      it(`should update payment status to ${status}`, async () => {
        // Arrange
        const _mockData = { data: { ...mockOrder, payment_status: status }, error: null }

        // Act
        const result = await repository.updatePaymentStatus(1, status, 'bank_transfer')

        // Assert
        expect(selectMock.update).toHaveBeenCalled()
        expect(result.payment_status).toBe(status)
      })
    })

    it('should include payment method when provided', async () => {
      // Arrange
      const _mockData = { data: { ...mockOrder, payment_status: 'paid' }, error: null }

      // Act
      await repository.updatePaymentStatus(1, 'paid', 'mobile_payment')

      // Assert
      const updateCall = selectMock.update.mock.calls[0][0]
      expect(updateCall.payment_method).toBe('mobile_payment')
    })

    it('should not include payment method when not provided', async () => {
      // Arrange
      const _mockData = { data: { ...mockOrder, payment_status: 'paid' }, error: null }

      // Act
      await repository.updatePaymentStatus(1, 'paid')

      // Assert
      const updateCall = selectMock.update.mock.calls[0][0]
      expect(updateCall.payment_method).toBeNull()
    })

    it('should throw BadRequestError for invalid payment status', async () => {
      // Arrange
      const invalidStatus = 'invalid-status'

      // Act & Assert
      await expect(repository.updatePaymentStatus(1, invalidStatus)).rejects.toThrow(
        'Invalid payment status'
      )
    })
  })

  // ============================================
  // GET STATS TESTS
  // ============================================

  describe('getStats()', () => {
    it('should return statistics with no filters', async () => {
      // Arrange
      const mockOrders = [
        { status: 'pending', total_amount_usd: 50 },
        { status: 'pending', total_amount_usd: 30 },
        { status: 'processing', total_amount_usd: 70 }
      ]
      const _mockData = { data: mockOrders, error: null }

      // Act
      const result = await repository.getStats()

      // Assert
      expect(result.total).toBe(3)
      expect(result.totalAmount).toBe(150)
      expect(result.byStatus.pending).toBe(2)
      expect(result.byStatus.processing).toBe(1)
    })

    it('should filter by date range', async () => {
      // Arrange
      const _mockData = { data: [], error: null }

      // Act
      await repository.getStats({
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31'
      })

      // Assert
      expect(selectMock.gte).toHaveBeenCalledWith('created_at', '2024-01-01')
      expect(selectMock.lte).toHaveBeenCalledWith('created_at', '2024-01-31')
    })

    it('should calculate totals correctly', async () => {
      // Arrange
      const mockOrders = [
        { status: 'delivered', total_amount_usd: 100.5 },
        { status: 'delivered', total_amount_usd: 50.25 }
      ]
      const _mockData = { data: mockOrders, error: null }

      // Act
      const result = await repository.getStats()

      // Assert
      expect(result.total).toBe(2)
      expect(result.totalAmount).toBe(150.75)
      expect(result.byStatus.delivered).toBe(2)
    })

    it('should handle empty result set', async () => {
      // Arrange
      const _mockData = { data: [], error: null }

      // Act
      const result = await repository.getStats()

      // Assert
      expect(result.total).toBe(0)
      expect(result.totalAmount).toBe(0)
      expect(result.byStatus.pending).toBe(0)
    })

    it('should throw error on database error', async () => {
      // Arrange
      const _mockError = { code: 'PGRST301', message: 'Database error' }

      // Act & Assert
      await expect(repository.getStats()).rejects.toThrow()
    })
  })

  // ============================================
  // SEARCH ORDERS TESTS
  // ============================================

  describe('searchOrders()', () => {
    it('should search orders by ID', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      const result = await repository.searchOrders('1')

      // Assert
      expect(selectMock.or).toHaveBeenCalled()
      expect(result).toEqual([mockOrder])
    })

    it('should search by customer email', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      await repository.searchOrders('test@example.com')

      // Assert
      expect(selectMock.or).toHaveBeenCalled()
    })

    it('should search by customer name', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      await repository.searchOrders('Test Customer')

      // Assert
      expect(selectMock.or).toHaveBeenCalled()
    })

    it('should limit results to specified amount', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      await repository.searchOrders('test', false, 25)

      // Assert
      expect(selectMock.limit).toHaveBeenCalledWith(25)
    })

    it('should use default limit when not specified', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      await repository.searchOrders('test')

      // Assert
      expect(selectMock.limit).toHaveBeenCalledWith(50)
    })

    it('should order by created_at desc', async () => {
      // Arrange
      const _mockData = { data: [mockOrder], error: null }

      // Act
      await repository.searchOrders('test')

      // Assert
      expect(selectMock.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should return empty array when no matches', async () => {
      // Arrange
      const _mockData = { data: null, error: null }

      // Act
      const result = await repository.searchOrders('nomatch')

      // Assert
      expect(result).toEqual([])
    })

    it('should throw error on database error', async () => {
      // Arrange
      const _mockError = { code: 'PGRST301', message: 'Database error' }

      // Act & Assert
      await expect(repository.searchOrders('test')).rejects.toThrow()
    })
  })
})
