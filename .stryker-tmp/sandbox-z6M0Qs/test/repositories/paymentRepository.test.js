/**
 * Payment Repository Tests - Vitest Edition
 * Comprehensive testing of payment repository operations
 * Following KISS principle and Supabase best practices
 */
// @ts-nocheck

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks, createMockSupabase, testData, mockErrors } from './setup.js'
import { PaymentRepository } from '../../api/repositories/PaymentRepository.js'

// Mock Supabase client
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: createMockSupabase(),
  DB_SCHEMA: {
    payments: { table: 'payments' }
  }
}))

describe('Payment Repository - Payment-specific Operations', () => {
  let mockSupabase
  let repository

  beforeEach(async () => {
    resetAllMocks()

    mockSupabase = createMockSupabase()

    // Mock the supabase import
    const supabaseModule = await import('../../api/services/supabaseClient.js')
    supabaseModule.supabase = mockSupabase

    repository = new PaymentRepository(mockSupabase)
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('findAllWithFilters - Find payments with filters', () => {
    test('should return payments with joins', async () => {
      const mockPayments = [testData.payments.completed]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockPayments, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockPayments, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithFilters()

      expect(result).toEqual(mockPayments)
    })

    test('should apply orderId filter', async () => {
      const filters = { orderId: 1 }
      const mockPayments = [testData.payments.completed]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockPayments, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockPayments, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockPayments)
    })

    test('should apply status filter', async () => {
      const filters = { status: 'completed' }
      const mockPayments = [testData.payments.completed]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockPayments, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockPayments, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockPayments)
    })

    test('should apply reference filter', async () => {
      const filters = { reference: 'txn_123' }
      const mockPayments = [testData.payments.completed]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockPayments, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockPayments, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockPayments)
    })

    test('should apply date range filters', async () => {
      const filters = { dateFrom: '2024-01-01', dateTo: '2024-01-31' }
      const mockPayments = [testData.payments.completed]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockPayments, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockPayments, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockPayments)
    })
  })

  describe('findById - Find payment by ID', () => {
    test('should return payment with joins', async () => {
      const mockPayment = {
        ...testData.payments.completed,
        orders: testData.orders.pending,
        payment_methods: testData.paymentMethods.card
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockPayment, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findById(1)

      expect(result).toEqual(mockPayment)
    })

    test('should return null when payment not found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notFound })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findById(999)

      expect(result).toBeNull()
    })

    test('should include refunded payments when requested', async () => {
      const mockPayment = { ...testData.payments.completed, status: 'refunded' }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockPayment, error: null })
          })
        })
      })

      const result = await repository.findById(1, true)

      expect(result).toEqual(mockPayment)
    })
  })

  describe('findByOrderId - Find payments by order ID', () => {
    test('should return payments for order', async () => {
      const mockPayments = [testData.payments.completed]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockPayments, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findByOrderId(1)

      expect(result).toEqual(mockPayments)
    })

    test('should exclude refunded payments by default', async () => {
      const mockPayments = [testData.payments.completed]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockPayments, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findByOrderId(1)

      expect(result).toEqual(mockPayments)
    })
  })

  describe('findByReference - Find payment by reference', () => {
    test('should return payment when found', async () => {
      const mockPayment = {
        ...testData.payments.completed,
        orders: testData.orders.pending,
        payment_methods: testData.paymentMethods.card
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockPayment, error: null })
          })
        })
      })

      const result = await repository.findByReference('txn_123')

      expect(result).toEqual(mockPayment)
    })

    test('should return null when reference not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notFound })
          })
        })
      })

      const result = await repository.findByReference('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('updateStatus - Update payment status', () => {
    test('should update status successfully', async () => {
      const updatedPayment = { ...testData.payments.pending, status: 'completed' }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedPayment, error: null })
            })
          })
        })
      })

      const result = await repository.updateStatus(1, 'completed')

      expect(result).toEqual(updatedPayment)
    })

    test('should throw error for invalid status', async () => {
      await expect(repository.updateStatus(1, 'invalid')).rejects.toThrow('Invalid status: invalid')
    })
  })

  describe('updateTransactionId - Update transaction ID', () => {
    test('should update transaction ID successfully', async () => {
      const updatedPayment = { ...testData.payments.pending, transaction_id: 'new_txn_456' }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedPayment, error: null })
            })
          })
        })
      })

      const result = await repository.updateTransactionId(1, 'new_txn_456')

      expect(result).toEqual(updatedPayment)
    })
  })

  describe('getStats - Get payment statistics', () => {
    test('should return payment statistics', async () => {
      const mockPayments = [
        { status: 'completed', amount_usd: 29.99 },
        { status: 'pending', amount_usd: 49.99 },
        { status: 'failed', amount_usd: 19.99 }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockPayments, error: null })
      })

      const result = await repository.getStats()

      expect(result.total).toBe(3)
      expect(result.totalAmount).toBe(99.97)
      expect(result.byStatus.completed).toBe(1)
      expect(result.byStatus.pending).toBe(1)
      expect(result.byStatus.failed).toBe(1)
    })

    test('should apply date filters to stats', async () => {
      const filters = { dateFrom: '2024-01-01', dateTo: '2024-01-31' }
      const mockPayments = [testData.payments.completed]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            lte: vi.fn().mockResolvedValue({ data: mockPayments, error: null })
          })
        })
      })

      const result = await repository.getStats(filters)

      expect(result.total).toBe(1)
    })
  })
})
