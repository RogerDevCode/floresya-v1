/**
 * Tests for Payment Service (Monolithic)
 * Coverage for: payment processing, settings retrieval, order management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as PaymentService from '../../api/services/paymentService.js'
import DIContainer from '../../api/architecture/di-container.js'

// Mock DIContainer
vi.mock('../../api/architecture/di-container.js', () => ({
  default: {
    resolve: vi.fn()
  }
}))

// Mock validation
vi.mock('../../api/utils/validation.js', () => ({
  validateEmail: vi.fn(),
  validateVenezuelanPhone: vi.fn()
}))

describe('Payment Service (Monolithic)', () => {
  let mockPaymentMethodRepo
  let mockPaymentRepo
  let mockSettingsRepo
  let mockOrderRepo

  beforeEach(() => {
    mockPaymentMethodRepo = {
      findActive: vi.fn(),
      findAllWithFilters: vi.fn()
    }
    mockPaymentRepo = {
      create: vi.fn(),
      findByOrderId: vi.fn()
    }
    mockSettingsRepo = {
      findByKey: vi.fn()
    }
    mockOrderRepo = {
      findByIdWithItems: vi.fn()
    }

    vi.mocked(DIContainer.resolve).mockImplementation(key => {
      switch (key) {
        case 'PaymentMethodRepository':
          return mockPaymentMethodRepo
        case 'PaymentRepository':
          return mockPaymentRepo
        case 'SettingsRepository':
          return mockSettingsRepo
        case 'OrderRepository':
          return mockOrderRepo
        default:
          return null
      }
    })
  })

  describe('getPaymentMethods', () => {
    it('should return active payment methods', async () => {
      const methods = [{ id: 1, name: 'Cash' }]
      mockPaymentMethodRepo.findActive.mockResolvedValue(methods)

      const result = await PaymentService.getPaymentMethods()

      expect(result).toEqual(methods)
    })

    it('should throw NotFoundError when no methods found', async () => {
      mockPaymentMethodRepo.findActive.mockResolvedValue([])

      await expect(PaymentService.getPaymentMethods()).rejects.toThrow(
        'Payment Methods with ID active not found'
      )
    })
  })

  describe('getDeliveryCost', () => {
    it('should return delivery cost', async () => {
      mockSettingsRepo.findByKey.mockResolvedValue({ value: '5.00' })

      const result = await PaymentService.getDeliveryCost()

      expect(result).toBe(5.0)
    })

    it('should throw NotFoundError when setting not found', async () => {
      mockSettingsRepo.findByKey.mockResolvedValue(null)

      await expect(PaymentService.getDeliveryCost()).rejects.toThrow(
        'Setting with ID DELIVERY_COST_USD not found'
      )
    })
  })

  describe('getBCVRate', () => {
    it('should return BCV rate', async () => {
      mockSettingsRepo.findByKey.mockResolvedValue({ value: '35.5' })

      const result = await PaymentService.getBCVRate()

      expect(result).toBe(35.5)
    })
  })

  describe('confirmPayment', () => {
    it('should confirm payment', async () => {
      const paymentData = {
        payment_method: 'cash',
        reference_number: 'REF123'
      }
      const method = { id: 1, name: 'Cash' }
      const order = { id: 1, total_amount_usd: 10, total_amount_ves: 355, currency_rate: 35.5 }
      const createdPayment = { id: 1, ...paymentData }

      mockPaymentMethodRepo.findAllWithFilters.mockResolvedValue([method])
      mockOrderRepo.findByIdWithItems.mockResolvedValue(order)
      mockPaymentRepo.create.mockResolvedValue(createdPayment)

      const result = await PaymentService.confirmPayment(1, paymentData)

      expect(result).toEqual(createdPayment)
      expect(mockPaymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          order_id: 1,
          payment_method_id: 1,
          amount_usd: 10
        })
      )
    })

    it('should throw NotFoundError when payment method not found', async () => {
      mockPaymentMethodRepo.findAllWithFilters.mockResolvedValue([])

      await expect(
        PaymentService.confirmPayment(1, { payment_method: 'invalid', reference_number: '123' })
      ).rejects.toThrow('Payment Method with ID invalid not found')
    })
  })

  describe('getOrderPayments', () => {
    it('should return payments for order', async () => {
      const payments = [{ id: 1, order_id: 1 }]
      mockPaymentRepo.findByOrderId.mockResolvedValue(payments)

      const result = await PaymentService.getOrderPayments(1)

      expect(result).toEqual(payments)
    })
  })

  describe('Utilities', () => {
    it('should validate phone', () => {
      expect(PaymentService.isValidVenezuelanPhone('04141234567')).toBe(true)
    })

    it('should validate email', () => {
      expect(PaymentService.isValidEmail('test@example.com')).toBe(true)
    })

    it('should generate order reference', () => {
      const ref = PaymentService.generateOrderReference()
      expect(ref).toMatch(/^FY-\d{9}$/)
    })
  })
})
