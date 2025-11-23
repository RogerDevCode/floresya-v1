/**
 * Payment Method Repository Tests - Vitest Edition
 * Comprehensive testing of payment method repository operations
 * Following KISS principle and Supabase best practices
 */
// @ts-nocheck

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks, createMockSupabase, testData, mockErrors } from './setup.js'
import { PaymentMethodRepository } from '../../api/repositories/PaymentMethodRepository.js'

// Mock Supabase client
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: createMockSupabase(),
  DB_SCHEMA: {
    payment_methods: { table: 'payment_methods' }
  }
}))

describe('Payment Method Repository - Payment Method-specific Operations', () => {
  let mockSupabase
  let repository

  beforeEach(async () => {
    resetAllMocks()

    mockSupabase = createMockSupabase()

    // Mock the supabase import
    const supabaseModule = await import('../../api/services/supabaseClient.js')
    supabaseModule.supabase = mockSupabase

    repository = new PaymentMethodRepository(mockSupabase)
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('findActive - Find active payment methods', () => {
    test('should return active payment methods ordered by display_order', async () => {
      const mockMethods = [testData.paymentMethods.card, testData.paymentMethods.paypal]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockMethods, error: null })
          })
        })
      })

      const result = await repository.findActive()

      expect(result).toEqual(mockMethods)
    })
  })

  describe('findAllWithFilters - Find payment methods with filters', () => {
    test('should return payment methods with type filter', async () => {
      const filters = { type: 'card' }
      const mockMethods = [testData.paymentMethods.card]

      // Create a chainable query mock
      const chainableQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockMethods, error: null }),
        then: vi.fn().mockImplementation(resolve => resolve({ data: mockMethods, error: null }))
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainableQuery)
      })

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockMethods)
    })

    test('should apply active filter', async () => {
      const filters = { isActive: true }
      const mockMethods = [testData.paymentMethods.card]

      // Create a chainable query mock
      const chainableQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockMethods, error: null }),
        then: vi.fn().mockImplementation(resolve => resolve({ data: mockMethods, error: null }))
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainableQuery)
      })

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockMethods)
    })

    test('should include deactivated methods when specified', async () => {
      const filters = { includeDeactivated: true }
      const mockMethods = [
        testData.paymentMethods.card,
        { ...testData.paymentMethods.card, active: false }
      ]

      // Create a chainable query mock that resolves to data
      const chainableQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockMethods, error: null }),
        then: vi.fn().mockImplementation(resolve => resolve({ data: mockMethods, error: null }))
      }

      // Make the query object itself awaitable
      Object.defineProperty(chainableQuery, Symbol.toStringTag, { value: 'Promise' })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainableQuery)
      })

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockMethods)
    })
  })

  describe('findById - Find payment method by ID', () => {
    test('should return payment method when found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: testData.paymentMethods.card, error: null })
            })
          })
        })
      })

      const result = await repository.findById(1)

      expect(result).toEqual(testData.paymentMethods.card)
    })

    test('should return null when payment method not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notFound })
            })
          })
        })
      })

      const result = await repository.findById(999)

      expect(result).toBeNull()
    })

    test('should include inactive methods when requested', async () => {
      const inactiveMethod = { ...testData.paymentMethods.card, active: false }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: inactiveMethod, error: null })
          })
        })
      })

      const result = await repository.findById(1, true)

      expect(result).toEqual(inactiveMethod)
    })
  })

  describe('findByCode - Find payment method by code', () => {
    test('should return payment method when found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: testData.paymentMethods.card, error: null })
            })
          })
        })
      })

      const result = await repository.findByCode('CARD')

      expect(result).toEqual(testData.paymentMethods.card)
    })

    test('should return null when code not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notFound })
            })
          })
        })
      })

      const result = await repository.findByCode('INVALID')

      expect(result).toBeNull()
    })
  })

  describe('findByType - Find payment methods by type', () => {
    test('should return payment methods of specified type', async () => {
      const mockMethods = [testData.paymentMethods.card]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockMethods, error: null })
            })
          })
        })
      })

      const result = await repository.findByType('card')

      expect(result).toEqual(mockMethods)
    })

    test('should include inactive methods when requested', async () => {
      const mockMethods = [
        testData.paymentMethods.card,
        { ...testData.paymentMethods.card, active: false }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockMethods, error: null })
          })
        })
      })

      const result = await repository.findByType('card', true)

      expect(result).toEqual(mockMethods)
    })
  })

  describe('updateDisplayOrder - Update display order', () => {
    test('should update display order successfully', async () => {
      const updatedMethod = { ...testData.paymentMethods.card, display_order: 5 }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedMethod, error: null })
            })
          })
        })
      })

      const result = await repository.updateDisplayOrder(1, 5)

      expect(result).toEqual(updatedMethod)
    })
  })

  describe('getStats - Get payment method statistics', () => {
    test('should return payment method statistics', async () => {
      const mockMethods = [
        testData.paymentMethods.card,
        testData.paymentMethods.paypal,
        { ...testData.paymentMethods.card, active: false }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockMethods, error: null })
      })

      const result = await repository.getStats()

      expect(result.total).toBe(3)
      expect(result.active).toBe(2)
      expect(result.inactive).toBe(1)
      expect(result.byType.card.total).toBe(2)
      expect(result.byType.paypal.total).toBe(1)
    })
  })
})
