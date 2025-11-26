/**
 * Tests for Advanced Validation Middleware
 * Coverage for order and product validation middleware
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  advancedValidate,
  fieldValidators
} from '../../../api/middleware/validation/advancedValidation.middleware.js'

vi.mock('../../../api/errors/AppError.js', () => ({
  BadRequestError: class BadRequestError extends Error {
    constructor(message, context) {
      super(message)
      this.name = 'BadRequestError'
      this.context = context
    }
  },
  ValidationError: class ValidationError extends Error {
    constructor(message, context) {
      super(message)
      this.name = 'ValidationError'
      this.context = context
    }
  }
}))

describe('Advanced Validation Middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = { body: {} }
    res = {}
    next = vi.fn()
  })

  describe('advancedValidate - order schema', () => {
    it('should pass with valid order data', () => {
      req.body = {
        order: {
          customer_email: 'test@example.com',
          customer_name: 'Test Customer',
          customer_phone: '+584121234567',
          delivery_address: 'Caracas, Venezuela',
          total_amount_usd: 50.0
        },
        items: [
          {
            product_id: 1,
            product_name: 'Rose',
            unit_price_usd: 10.0,
            quantity: 2,
            subtotal_usd: 20.0
          }
        ]
      }

      const middleware = advancedValidate('order')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
    })

    it('should reject order with validation errors', () => {
      req.body = {
        order: {
          customer_email: 'invalid-email',
          customer_name: 'T'
        }
      }

      const middleware = advancedValidate('order')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'ValidationError' }))
    })

    it('should validate items if provided', () => {
      req.body = {
        order: {
          customer_email: 'test@test.com',
          customer_name: 'Test',
          customer_phone: '+584121234567',
          delivery_address: 'Caracas',
          total_amount_usd: 50
        },
        items: 'invalid'
      }

      const middleware = advancedValidate('order')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'ValidationError' }))
    })
  })

  describe('advancedValidate - product schema', () => {
    it('should pass with valid product data', () => {
      req.body = {
        price_usd: 25.5,
        stock: 10
      }

      const middleware = advancedValidate('product')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
    })

    it('should reject negative price', () => {
      req.body = { price_usd: -10 }

      const middleware = advancedValidate('product')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'ValidationError' }))
    })

    it('should reject negative stock', () => {
      req.body = { stock: -5 }

      const middleware = advancedValidate('product')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'ValidationError' }))
    })

    it('should allow zero stock', () => {
      req.body = { stock: 0 }

      const middleware = advancedValidate('product')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
    })
  })

  describe('advancedValidate - unknown schema', () => {
    it('should reject unknown schema', () => {
      const middleware = advancedValidate('unknown')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'BadRequestError',
          message: expect.stringContaining('desconocido')
        })
      )
    })
  })

  describe('advancedValidate - error handling', () => {
    it('should handle internal errors gracefully', () => {
      req.body = null

      const middleware = advancedValidate('order')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: 'BadRequestError' }))
    })
  })

  describe('fieldValidators', () => {
    it('should export email validator', () => {
      expect(fieldValidators.email).toBeDefined()
      expect(typeof fieldValidators.email).toBe('function')
    })

    it('should export phone validator', () => {
      expect(fieldValidators.phone).toBeDefined()
      expect(typeof fieldValidators.phone).toBe('function')
    })

    it('should export amount validator', () => {
      expect(fieldValidators.amount).toBeDefined()
      expect(typeof fieldValidators.amount).toBe('function')
    })

    it('should export text validator', () => {
      expect(fieldValidators.text).toBeDefined()
      expect(typeof fieldValidators.text).toBe('function')
    })

    it('should export address validator', () => {
      expect(fieldValidators.address).toBeDefined()
      expect(typeof fieldValidators.address).toBe('function')
    })

    it('should export orderItems validator', () => {
      expect(fieldValidators.orderItems).toBeDefined()
      expect(typeof fieldValidators.orderItems).toBe('function')
    })

    it('should export orderData validator', () => {
      expect(fieldValidators.orderData).toBeDefined()
      expect(typeof fieldValidators.orderData).toBe('function')
    })
  })
})
