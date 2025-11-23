/**
 * Payment Method Controller Unit Tests
 * Following CLAUDE.md test validation rules
 */
// @ts-nocheck

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getAllPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  reactivatePaymentMethod,
  updateDisplayOrder
} from '../paymentMethodController.js'

// Mock dependencies
vi.mock('../../services/paymentMethodService.js', () => ({
  getAllPaymentMethods: vi.fn(),
  getPaymentMethodById: vi.fn(),
  createPaymentMethod: vi.fn(),
  updatePaymentMethod: vi.fn(),
  deletePaymentMethod: vi.fn(),
  reactivatePaymentMethod: vi.fn(),
  updateDisplayOrder: vi.fn()
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

import * as paymentMethodService from '../../services/paymentMethodService.js'

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

describe('Payment Method Controller - Unit Tests with DI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getAllPaymentMethods', () => {
    it('should get all payment methods successfully', async () => {
      const req = mockRequest({
        query: { limit: '10' }
      })
      const res = mockResponse()
      const mockMethods = [
        { id: 1, name: 'Credit Card', active: true },
        { id: 2, name: 'PayPal', active: true }
      ]

      paymentMethodService.getAllPaymentMethods.mockResolvedValue(mockMethods)

      await getAllPaymentMethods(req, res)

      expect(paymentMethodService.getAllPaymentMethods).toHaveBeenCalledWith({ limit: 10 }, false)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMethods,
        message: 'Payment methods retrieved successfully'
      })
    })

    it('should handle admin includeDeactivated parameter', async () => {
      const req = mockRequest({
        query: { includeDeactivated: 'true' },
        user: { role: 'admin' }
      })
      const res = mockResponse()
      const mockMethods = [{ id: 1, active: false }]

      paymentMethodService.getAllPaymentMethods.mockResolvedValue(mockMethods)

      await getAllPaymentMethods(req, res)

      expect(paymentMethodService.getAllPaymentMethods).toHaveBeenCalledWith(
        expect.any(Object),
        true
      )
    })
  })

  describe('getPaymentMethodById', () => {
    it('should get payment method by ID successfully', async () => {
      const req = mockRequest({
        params: { id: '1' }
      })
      const res = mockResponse()
      const mockMethod = {
        id: 1,
        name: 'Credit Card',
        active: true
      }

      paymentMethodService.getPaymentMethodById.mockResolvedValue(mockMethod)

      await getPaymentMethodById(req, res)

      expect(paymentMethodService.getPaymentMethodById).toHaveBeenCalledWith('1', false)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMethod,
        message: 'Payment method retrieved successfully'
      })
    })

    it('should handle admin access', async () => {
      const req = mockRequest({
        params: { id: '1' },
        user: { role: 'admin' }
      })
      const res = mockResponse()
      const mockMethod = { id: 1, active: false }

      paymentMethodService.getPaymentMethodById.mockResolvedValue(mockMethod)

      await getPaymentMethodById(req, res)

      expect(paymentMethodService.getPaymentMethodById).toHaveBeenCalledWith('1', true)
    })
  })

  describe('createPaymentMethod', () => {
    it('should create payment method successfully', async () => {
      const req = mockRequest({
        body: {
          name: 'Crypto',
          code: 'crypto',
          description: 'Bitcoin payment'
        }
      })
      const res = mockResponse()
      const mockMethod = { id: 1, ...req.body }

      paymentMethodService.createPaymentMethod.mockResolvedValue(mockMethod)

      await createPaymentMethod(req, res)

      expect(paymentMethodService.createPaymentMethod).toHaveBeenCalledWith(req.body)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMethod,
        message: 'Payment method created successfully'
      })
    })
  })

  describe('updatePaymentMethod', () => {
    it('should update payment method successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { name: 'Updated Method', description: 'New description' }
      })
      const res = mockResponse()
      const mockMethod = { id: 1, ...req.body }

      paymentMethodService.updatePaymentMethod.mockResolvedValue(mockMethod)

      await updatePaymentMethod(req, res)

      expect(paymentMethodService.updatePaymentMethod).toHaveBeenCalledWith('1', req.body)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMethod,
        message: 'Payment method updated successfully'
      })
    })
  })

  describe('deletePaymentMethod', () => {
    it('should soft-delete payment method successfully', async () => {
      const req = mockRequest({
        params: { id: '1' }
      })
      const res = mockResponse()
      const mockMethod = { id: 1, active: false }

      paymentMethodService.deletePaymentMethod.mockResolvedValue(mockMethod)

      await deletePaymentMethod(req, res)

      expect(paymentMethodService.deletePaymentMethod).toHaveBeenCalledWith('1')
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMethod,
        message: 'Payment method deactivated successfully'
      })
    })
  })

  describe('reactivatePaymentMethod', () => {
    it('should reactivate payment method successfully', async () => {
      const req = mockRequest({
        params: { id: '1' }
      })
      const res = mockResponse()
      const mockMethod = { id: 1, active: true }

      paymentMethodService.reactivatePaymentMethod.mockResolvedValue(mockMethod)

      await reactivatePaymentMethod(req, res)

      expect(paymentMethodService.reactivatePaymentMethod).toHaveBeenCalledWith('1')
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMethod,
        message: 'Payment method reactivated successfully'
      })
    })
  })

  describe('updateDisplayOrder', () => {
    it('should update display order successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { order: 3 }
      })
      const res = mockResponse()
      const mockMethod = { id: 1, display_order: 3 }

      paymentMethodService.updateDisplayOrder.mockResolvedValue(mockMethod)

      await updateDisplayOrder(req, res)

      expect(paymentMethodService.updateDisplayOrder).toHaveBeenCalledWith('1', 3)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMethod,
        message: 'Display order updated successfully'
      })
    })
  })
})
