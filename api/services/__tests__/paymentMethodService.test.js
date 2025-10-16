/**
 * Payment Method Service Unit Tests
 * Tests all CRUD operations with fail-fast error handling
 * Validates soft-delete, validation, and business rules
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as paymentMethodService from '../paymentMethodService.js'
import { supabase } from '../services/supabaseClient.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  DatabaseConstraintError,
  BadRequestError
} from '../../errors/AppError.js'

// Mock Supabase client
vi.mock('../services/supabaseClient.js', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    rpc: vi.fn().mockReturnThis()
  }

  return {
    supabase: mockSupabase,
    DB_SCHEMA: {
      payment_methods: {
        table: 'payment_methods',
        enums: {
          type: ['bank_transfer', 'mobile_payment', 'cash', 'crypto', 'international']
        }
      }
    }
  }
})

describe('Payment Method Service', () => {
  const mockPaymentMethod = {
    id: 1,
    name: 'Banco Mercantil',
    type: 'bank_transfer',
    description: 'Transferencias bancarias',
    account_info: '0105-1234-5678-9012',
    is_active: true,
    display_order: 1,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }

  const mockPaymentMethods = [
    { ...mockPaymentMethod },
    { ...mockPaymentMethod, id: 2, name: 'Pago Móvil', type: 'mobile_payment' }
  ]

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks()
  })

  describe('getAllPaymentMethods', () => {
    it('should get all active payment methods', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: mockPaymentMethods,
        error: null
      })

      supabase.from.mockReturnValue({
        select: mockSelect,
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis()
      })

      const result = await paymentMethodService.getAllPaymentMethods()

      expect(supabase.from).toHaveBeenCalledWith('payment_methods')
      expect(mockSelect).toHaveBeenCalled()
      expect(result).toEqual(mockPaymentMethods)
    })

    it('should handle database errors', async () => {
      const mockError = new Error('Database error')
      const mockSelect = vi.fn().mockResolvedValue({
        data: null,
        error: mockError
      })

      supabase.from.mockReturnValue({
        select: mockSelect,
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis()
      })

      await expect(paymentMethodService.getAllPaymentMethods()).rejects.toThrow(DatabaseError)
    })
  })

  describe('getPaymentMethodById', () => {
    it('should get payment method by ID', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockPaymentMethod,
        error: null
      })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: mockSingle
      })

      const result = await paymentMethodService.getPaymentMethodById(1)

      expect(result).toEqual(mockPaymentMethod)
    })

    it('should throw BadRequestError for invalid ID', async () => {
      await expect(paymentMethodService.getPaymentMethodById('invalid')).rejects.toThrow(
        BadRequestError
      )
      await expect(paymentMethodService.getPaymentMethodById(-1)).rejects.toThrow(BadRequestError)
      await expect(paymentMethodService.getPaymentMethodById(0)).rejects.toThrow(BadRequestError)
    })

    it('should throw NotFoundError when payment method not found', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: mockSingle
      })

      await expect(paymentMethodService.getPaymentMethodById(999)).rejects.toThrow(NotFoundError)
    })
  })

  describe('createPaymentMethod', () => {
    it('should create a new payment method', async () => {
      const newPaymentMethodData = {
        name: 'Banco Mercantil',
        type: 'bank_transfer',
        description: 'Transferencias bancarias',
        account_info: '0105-1234-5678-9012',
        display_order: 1
      }

      const mockInsert = vi.fn().mockResolvedValue({
        data: mockPaymentMethod,
        error: null
      })

      supabase.from.mockReturnValue({
        insert: mockInsert,
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis()
      })

      const result = await paymentMethodService.createPaymentMethod(newPaymentMethodData)

      expect(result).toEqual(mockPaymentMethod)
    })

    it('should throw ValidationError for invalid data', async () => {
      const invalidData = {
        name: '', // Empty name should fail
        type: 'invalid_type' // Invalid type should fail
      }

      await expect(paymentMethodService.createPaymentMethod(invalidData)).rejects.toThrow(
        ValidationError
      )
    })

    it('should handle database constraint errors', async () => {
      const newPaymentMethodData = {
        name: 'Banco Mercantil',
        type: 'bank_transfer'
      }

      const mockError = { code: '23505', message: 'duplicate key value violates unique constraint' }
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: mockError
      })

      supabase.from.mockReturnValue({
        insert: mockInsert,
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis()
      })

      await expect(paymentMethodService.createPaymentMethod(newPaymentMethodData)).rejects.toThrow(
        DatabaseConstraintError
      )
    })
  })

  describe('updatePaymentMethod', () => {
    it('should update a payment method', async () => {
      const updateData = {
        name: 'Banco Mercantil Actualizado',
        description: 'Nueva descripción'
      }

      const updatedPaymentMethod = {
        ...mockPaymentMethod,
        ...updateData
      }

      const mockUpdate = vi.fn().mockResolvedValue({
        data: updatedPaymentMethod,
        error: null
      })

      supabase.from.mockReturnValue({
        update: mockUpdate,
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis()
      })

      const result = await paymentMethodService.updatePaymentMethod(1, updateData)

      expect(result).toEqual(updatedPaymentMethod)
    })

    it('should throw BadRequestError for invalid ID', async () => {
      await expect(paymentMethodService.updatePaymentMethod('invalid', {})).rejects.toThrow(
        BadRequestError
      )
    })

    it('should throw BadRequestError when no updates provided', async () => {
      await expect(paymentMethodService.updatePaymentMethod(1, {})).rejects.toThrow(BadRequestError)
    })
  })

  describe('deletePaymentMethod', () => {
    it('should soft-delete a payment method', async () => {
      const deactivatedPaymentMethod = {
        ...mockPaymentMethod,
        is_active: false
      }

      const mockUpdate = vi.fn().mockResolvedValue({
        data: deactivatedPaymentMethod,
        error: null
      })

      supabase.from.mockReturnValue({
        update: mockUpdate,
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis()
      })

      const result = await paymentMethodService.deletePaymentMethod(1)

      expect(result).toEqual(deactivatedPaymentMethod)
    })

    it('should throw BadRequestError for invalid ID', async () => {
      await expect(paymentMethodService.deletePaymentMethod('invalid')).rejects.toThrow(
        BadRequestError
      )
    })
  })

  describe('reactivatePaymentMethod', () => {
    it('should reactivate a payment method', async () => {
      const reactivatedPaymentMethod = {
        ...mockPaymentMethod,
        is_active: true
      }

      const mockUpdate = vi.fn().mockResolvedValue({
        data: reactivatedPaymentMethod,
        error: null
      })

      supabase.from.mockReturnValue({
        update: mockUpdate,
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis()
      })

      const result = await paymentMethodService.reactivatePaymentMethod(1)

      expect(result).toEqual(reactivatedPaymentMethod)
    })

    it('should throw BadRequestError for invalid ID', async () => {
      await expect(paymentMethodService.reactivatePaymentMethod('invalid')).rejects.toThrow(
        BadRequestError
      )
    })
  })

  describe('updateDisplayOrder', () => {
    it('should update display order', async () => {
      const updatedPaymentMethod = {
        ...mockPaymentMethod,
        display_order: 5
      }

      const mockUpdate = vi.fn().mockResolvedValue({
        data: updatedPaymentMethod,
        error: null
      })

      supabase.from.mockReturnValue({
        update: mockUpdate,
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis()
      })

      const result = await paymentMethodService.updateDisplayOrder(1, 5)

      expect(result).toEqual(updatedPaymentMethod)
    })

    it('should throw BadRequestError for invalid parameters', async () => {
      await expect(paymentMethodService.updateDisplayOrder('invalid', 5)).rejects.toThrow(
        BadRequestError
      )
      await expect(paymentMethodService.updateDisplayOrder(1, -1)).rejects.toThrow(BadRequestError)
    })
  })
})
