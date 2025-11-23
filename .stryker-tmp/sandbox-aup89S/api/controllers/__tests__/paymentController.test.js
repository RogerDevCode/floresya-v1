/**
 * Payment Controller Unit Tests
 * Following CLAUDE.md test validation rules
 */
// @ts-nocheck

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getPaymentMethods, confirmPayment } from '../paymentController.js'

// Mock dependencies
vi.mock('../../services/paymentService.js', () => ({
  getPaymentMethods: vi.fn(),
  confirmPayment: vi.fn()
}))

vi.mock('../../middleware/error/index.js', () => ({
  asyncHandler: vi.fn(fn => fn)
}))

vi.mock('../../errors/AppError.js', () => ({
  BadRequestError: class BadRequestError extends Error {
    constructor(message, context = {}) {
      super(message)
      this.name = 'BadRequestError'
      this.context = context
    }
  }
}))

import * as paymentService from '../../services/paymentService.js'

// Mock response and request objects
const mockResponse = () => {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

const mockRequest = (overrides = {}) => ({
  query: {},
  params: {},
  body: {},
  user: null,
  ...overrides
})

describe('Payment Controller - Unit Tests with DI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getPaymentMethods', () => {
    it('should get all payment methods successfully', async () => {
      const req = mockRequest()
      const res = mockResponse()
      const mockMethods = [
        { id: 1, name: 'Credit Card', active: true },
        { id: 2, name: 'PayPal', active: true },
        { id: 3, name: 'Bank Transfer', active: true }
      ]

      paymentService.getPaymentMethods.mockResolvedValue(mockMethods)

      await getPaymentMethods(req, res)

      expect(paymentService.getPaymentMethods).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMethods,
        message: 'Payment methods retrieved successfully'
      })
    })

    it('should handle empty payment methods', async () => {
      const req = mockRequest()
      const res = mockResponse()
      const mockMethods = []

      paymentService.getPaymentMethods.mockResolvedValue(mockMethods)

      await getPaymentMethods(req, res)

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        message: 'Payment methods retrieved successfully'
      })
    })
  })

  describe('confirmPayment', () => {
    it('should confirm payment successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: {
          payment_method: 'bank_transfer',
          reference_number: 'REF123456',
          payment_details: { bank: 'Test Bank' },
          receipt_image_url: 'https://example.com/receipt.jpg'
        },
        user: { id: 10 }
      })
      const res = mockResponse()
      const mockPayment = {
        id: 1,
        order_id: 1,
        payment_method: 'bank_transfer',
        reference_number: 'REF123456',
        status: 'confirmed'
      }

      paymentService.confirmPayment.mockResolvedValue(mockPayment)

      await confirmPayment(req, res)

      expect(paymentService.confirmPayment).toHaveBeenCalledWith(1, {
        payment_method: 'bank_transfer',
        reference_number: 'REF123456',
        payment_details: { bank: 'Test Bank' },
        receipt_image_url: 'https://example.com/receipt.jpg',
        confirmed_by: 10
      })
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPayment,
        message: 'Payment confirmed successfully'
      })
    })

    it('should handle payment confirmation without user', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: {
          payment_method: 'credit_card',
          reference_number: 'CC123'
        }
      })
      const res = mockResponse()
      const mockPayment = { id: 1, status: 'confirmed' }

      paymentService.confirmPayment.mockResolvedValue(mockPayment)

      await confirmPayment(req, res)

      expect(paymentService.confirmPayment).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          payment_method: 'credit_card',
          reference_number: 'CC123',
          confirmed_by: undefined
        })
      )
    })

    it('should handle payment with optional fields', async () => {
      const req = mockRequest({
        params: { id: '5' },
        body: {
          payment_method: 'cash'
        },
        user: { id: 5 }
      })
      const res = mockResponse()
      const mockPayment = { id: 5, status: 'confirmed' }

      paymentService.confirmPayment.mockResolvedValue(mockPayment)

      await confirmPayment(req, res)

      expect(paymentService.confirmPayment).toHaveBeenCalledWith(
        5,
        expect.objectContaining({
          payment_method: 'cash',
          reference_number: undefined,
          payment_details: undefined,
          receipt_image_url: undefined,
          confirmed_by: 5
        })
      )
    })
  })
})
