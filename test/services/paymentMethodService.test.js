/**
 * Tests for Payment Method Service (Monolithic)
 * Coverage for: create, read, update, delete operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as PaymentMethodService from '../../api/services/paymentMethodService.js'
import DIContainer from '../../api/architecture/di-container.js'

// Mock DIContainer
vi.mock('../../api/architecture/di-container.js', () => ({
  default: {
    resolve: vi.fn()
  }
}))

// Mock validation
vi.mock('../../api/utils/validation.js', () => ({
  validatePaymentMethod: vi.fn()
}))

describe('Payment Method Service (Monolithic)', () => {
  let mockRepository

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findAllWithFilters: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      updateDisplayOrder: vi.fn()
    }
    vi.mocked(DIContainer.resolve).mockReturnValue(mockRepository)
  })

  describe('getAllPaymentMethods', () => {
    it('should return all payment methods', async () => {
      const methods = [{ id: 1, name: 'Cash' }]
      mockRepository.findAllWithFilters.mockResolvedValue(methods)

      const result = await PaymentMethodService.getAllPaymentMethods()

      expect(result).toEqual(methods)
      expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(
        { includeDeactivated: false },
        expect.objectContaining({ orderBy: 'display_order' })
      )
    })

    it('should throw NotFoundError when no methods found', async () => {
      mockRepository.findAllWithFilters.mockResolvedValue([])

      await expect(PaymentMethodService.getAllPaymentMethods()).rejects.toThrow(
        'Payment methods with ID undefined not found'
      )
    })
  })

  describe('getPaymentMethodById', () => {
    it('should return method by id', async () => {
      const method = { id: 1, name: 'Cash' }
      mockRepository.findById.mockResolvedValue(method)

      const result = await PaymentMethodService.getPaymentMethodById(1)

      expect(result).toEqual(method)
    })

    it('should throw NotFoundError when not found', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(PaymentMethodService.getPaymentMethodById(999)).rejects.toThrow(
        'Payment method with ID 999 not found'
      )
    })
  })

  describe('createPaymentMethod', () => {
    it('should create payment method', async () => {
      const methodData = { name: 'Cash', type: 'cash' }
      const createdMethod = { id: 1, ...methodData }
      mockRepository.create.mockResolvedValue(createdMethod)

      const result = await PaymentMethodService.createPaymentMethod(methodData)

      expect(result).toEqual(createdMethod)
      expect(mockRepository.create).toHaveBeenCalled()
    })
  })

  describe('updatePaymentMethod', () => {
    it('should update payment method', async () => {
      const updates = { name: 'New Name' }
      const updatedMethod = { id: 1, ...updates }
      mockRepository.update.mockResolvedValue(updatedMethod)

      const result = await PaymentMethodService.updatePaymentMethod(1, updates)

      expect(result).toEqual(updatedMethod)
      expect(mockRepository.update).toHaveBeenCalledWith(1, expect.objectContaining(updates))
    })
  })

  describe('deletePaymentMethod', () => {
    it('should soft delete payment method', async () => {
      const deletedMethod = { id: 1, active: false }
      mockRepository.update.mockResolvedValue(deletedMethod)

      const result = await PaymentMethodService.deletePaymentMethod(1)

      expect(result).toEqual(deletedMethod)
      expect(mockRepository.update).toHaveBeenCalledWith(1, { active: false })
    })
  })

  describe('reactivatePaymentMethod', () => {
    it('should reactivate payment method', async () => {
      const reactivatedMethod = { id: 1, active: true }
      mockRepository.update.mockResolvedValue(reactivatedMethod)

      const result = await PaymentMethodService.reactivatePaymentMethod(1)

      expect(result).toEqual(reactivatedMethod)
      expect(mockRepository.update).toHaveBeenCalledWith(1, { active: true })
    })
  })

  describe('updateDisplayOrder', () => {
    it('should update display order', async () => {
      const updatedMethod = { id: 1, display_order: 5 }
      mockRepository.updateDisplayOrder.mockResolvedValue(updatedMethod)

      const result = await PaymentMethodService.updateDisplayOrder(1, 5)

      expect(result).toEqual(updatedMethod)
      expect(mockRepository.updateDisplayOrder).toHaveBeenCalledWith(1, 5)
    })
  })
})
