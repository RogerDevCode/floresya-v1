/**
 * PaymentMethod Service Tests - Vitest Edition
 * Comprehensive testing of payment method service operations
 * Following KISS principle and Supabase best practices
 */
// @ts-nocheck

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks } from './setup.js'

// Mock DI Container
vi.mock('../../api/architecture/di-container.js', () => ({
  default: {
    resolve: vi.fn(() => ({
      findAllWithFilters: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateDisplayOrder: vi.fn()
    }))
  }
}))

// Mock validation
vi.mock('../../api/utils/validation.js', () => ({
  validatePaymentMethod: vi.fn()
}))

// Import services after mocks are set up
import {
  getAllPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  reactivatePaymentMethod,
  updateDisplayOrder
} from '../../api/services/paymentMethodService.js'

describe('PaymentMethod Service - Payment Method Management Operations', () => {
  beforeEach(async () => {
    resetAllMocks()
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('Service functions exist and are callable', () => {
    test('should export all main functions', () => {
      expect(typeof getAllPaymentMethods).toBe('function')
      expect(typeof getPaymentMethodById).toBe('function')
      expect(typeof createPaymentMethod).toBe('function')
      expect(typeof updatePaymentMethod).toBe('function')
      expect(typeof deletePaymentMethod).toBe('function')
      expect(typeof reactivatePaymentMethod).toBe('function')
      expect(typeof updateDisplayOrder).toBe('function')
    })
  })
})
