import { describe, it, expect } from 'vitest'
import {
  sanitizeOrderData,
  sanitizeOrderItems
} from '../../../api/middleware/validation/sanitize.js'

describe('Sanitization Middleware', () => {
  describe('sanitizeOrderData', () => {
    it('should sanitize null string fields to empty string', () => {
      const data = {
        customer_email: null,
        customer_name: null,
        customer_phone: null
      }

      const result = sanitizeOrderData(data)
      expect(result.customer_email).toBe('')
      expect(result.customer_name).toBe('')
      expect(result.customer_phone).toBe('')
    })

    it('should sanitize undefined string fields to empty string', () => {
      const data = {
        delivery_address: undefined,
        delivery_notes: undefined
      }

      const result = sanitizeOrderData(data)
      expect(result.delivery_address).toBe('')
      expect(result.delivery_notes).toBe('')
    })

    it('should sanitize null integer fields to 0', () => {
      const data = {
        user_id: null,
        id: null
      }

      const result = sanitizeOrderData(data)
      expect(result.user_id).toBe(0)
      expect(result.id).toBe(0)
    })

    it('should sanitize null numeric fields to 0.0', () => {
      const data = {
        total_amount_usd: null,
        total_amount_ves: null,
        currency_rate: null
      }

      const result = sanitizeOrderData(data)
      expect(result.total_amount_usd).toBe(0.0)
      expect(result.total_amount_ves).toBe(0.0)
      expect(result.currency_rate).toBe(0.0)
    })

    it('should sanitize null date fields to current date', () => {
      const data = {
        delivery_date: null
      }

      const result = sanitizeOrderData(data)
      expect(result.delivery_date).toBeDefined()
      expect(typeof result.delivery_date).toBe('string')
      expect(result.delivery_date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should sanitize null enum fields to default', () => {
      const data = {
        status: null
      }

      const result = sanitizeOrderData(data)
      expect(result.status).toBe('pending')
    })

    it('should preserve existing valid values', () => {
      const data = {
        customer_email: 'test@example.com',
        customer_name: 'John Doe',
        total_amount_usd: 100.50,
        user_id: 42
      }

      const result = sanitizeOrderData(data)
      expect(result.customer_email).toBe('test@example.com')
      expect(result.customer_name).toBe('John Doe')
      expect(result.total_amount_usd).toBe(100.50)
      expect(result.user_id).toBe(42)
    })

    it('should handle empty object', () => {
      const data = {}
      const result = sanitizeOrderData(data)
      expect(result).toEqual({})
    })

    it('should not mutate original data', () => {
      const data = {
        customer_email: null,
        total_amount_usd: null
      }
      const original = { ...data }

      sanitizeOrderData(data)
      expect(data).toEqual(original)
    })

    it('should handle mixed null and valid values', () => {
      const data = {
        customer_email: 'valid@example.com',
        customer_name: null,
        total_amount_usd: 50.00,
        total_amount_ves: null,
        user_id: 10,
        id: null
      }

      const result = sanitizeOrderData(data)
      expect(result.customer_email).toBe('valid@example.com')
      expect(result.customer_name).toBe('')
      expect(result.total_amount_usd).toBe(50.00)
      expect(result.total_amount_ves).toBe(0.0)
      expect(result.user_id).toBe(10)
      expect(result.id).toBe(0)
    })
  })

  describe('sanitizeOrderItems', () => {
    it('should sanitize array of order items', () => {
      const items = [
        {
          product_name: null,
          product_id: null,
          quantity: null,
          unit_price_usd: null
        },
        {
          product_name: 'Product 1',
          product_id: 1,
          quantity: 2,
          unit_price_usd: 25.00
        }
      ]

      const result = sanitizeOrderItems(items)
      expect(result).toHaveLength(2)
      expect(result[0].product_name).toBe('')
      expect(result[0].product_id).toBe(0)
      expect(result[0].quantity).toBe(0)
      expect(result[0].unit_price_usd).toBe(0.0)
      expect(result[1].product_name).toBe('Product 1')
      expect(result[1].product_id).toBe(1)
    })

    it('should handle empty array', () => {
      const items = []
      const result = sanitizeOrderItems(items)
      expect(result).toEqual([])
    })

    it('should sanitize string fields in order items', () => {
      const items = [
        {
          product_name: null,
          product_summary: undefined
        }
      ]

      const result = sanitizeOrderItems(items)
      expect(result[0].product_name).toBe('')
      expect(result[0].product_summary).toBe('')
    })

    it('should sanitize integer fields in order items', () => {
      const items = [
        {
          product_id: null,
          quantity: null,
          order_id: undefined
        }
      ]

      const result = sanitizeOrderItems(items)
      expect(result[0].product_id).toBe(0)
      expect(result[0].quantity).toBe(0)
      expect(result[0].order_id).toBe(0)
    })

    it('should sanitize numeric fields in order items', () => {
      const items = [
        {
          unit_price_usd: null,
          unit_price_ves: null,
          subtotal_usd: undefined,
          subtotal_ves: undefined
        }
      ]

      const result = sanitizeOrderItems(items)
      expect(result[0].unit_price_usd).toBe(0.0)
      expect(result[0].unit_price_ves).toBe(0.0)
      expect(result[0].subtotal_usd).toBe(0.0)
      expect(result[0].subtotal_ves).toBe(0.0)
    })

    it('should preserve valid values in order items', () => {
      const items = [
        {
          product_name: 'Roses',
          product_id: 5,
          quantity: 3,
          unit_price_usd: 15.99,
          subtotal_usd: 47.97
        }
      ]

      const result = sanitizeOrderItems(items)
      expect(result[0].product_name).toBe('Roses')
      expect(result[0].product_id).toBe(5)
      expect(result[0].quantity).toBe(3)
      expect(result[0].unit_price_usd).toBe(15.99)
      expect(result[0].subtotal_usd).toBe(47.97)
    })
  })
})
