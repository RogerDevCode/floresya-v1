/**
 * Tests for Order Validation Schemas
 * Coverage for order creation and update schemas
 */

import { describe, it, expect } from 'vitest'
import {
  orderCreateSchema,
  orderStatusUpdateSchema
} from '../../../api/middleware/validation/schemas.order.js'

describe('Order Validation Schemas', () => {
  describe('orderCreateSchema - order field', () => {
    const orderValidator = orderCreateSchema.order.custom

    it('should validate complete order object', () => {
      const validOrder = {
        customer_email: 'test@example.com',
        customer_name: 'Test Customer',
        customer_phone: '+584121234567',
        delivery_address: '123 Main St',
        total_amount_usd: 50.0
      }

      expect(orderValidator(validOrder)).toBeNull()
    })

    it('should reject non-object order', () => {
      expect(orderValidator('string')).toBe('order must be an object')
      expect(orderValidator(null)).toBe('order must be an object')
    })

    it('should reject order without customer_email', () => {
      const order = {
        customer_name: 'Test',
        customer_phone: '123',
        delivery_address: 'Addr',
        total_amount_usd: 50
      }

      expect(orderValidator(order)).toContain('customer_email is required')
    })

    it('should reject order without customer_name', () => {
      const order = {
        customer_email: 'test@test.com',
        customer_phone: '123',
        delivery_address: 'Addr',
        total_amount_usd: 50
      }

      expect(orderValidator(order)).toContain('customer_name is required')
    })

    it('should reject order without customer_phone', () => {
      const order = {
        customer_email: 'test@test.com',
        customer_name: 'Test',
        delivery_address: 'Addr',
        total_amount_usd: 50
      }

      expect(orderValidator(order)).toContain('customer_phone is required')
    })

    it('should reject order without delivery_address', () => {
      const order = {
        customer_email: 'test@test.com',
        customer_name: 'Test',
        customer_phone: '123',
        total_amount_usd: 50
      }

      expect(orderValidator(order)).toContain('delivery_address is required')
    })

    it('should reject order without total_amount_usd', () => {
      const order = {
        customer_email: 'test@test.com',
        customer_name: 'Test',
        customer_phone: '123',
        delivery_address: 'Addr'
      }

      expect(orderValidator(order)).toContain('total_amount_usd is required')
    })

    it('should reject when total_amount_usd is not a number', () => {
      const order = {
        customer_email: 'test@test.com',
        customer_name: 'Test',
        customer_phone: '123',
        delivery_address: 'Addr',
        total_amount_usd: '50'
      }

      expect(orderValidator(order)).toContain('must be a number')
    })
  })

  describe('orderCreateSchema - items field', () => {
    const itemsValidator = orderCreateSchema.items.custom

    it('should validate valid items array', () => {
      const validItems = [
        {
          product_id: 1,
          product_name: 'Rose',
          unit_price_usd: 10.0,
          quantity: 2
        }
      ]

      expect(itemsValidator(validItems)).toBeNull()
    })

    it('should reject non-array items', () => {
      expect(itemsValidator('string')).toBe('items must be an array')
      expect(itemsValidator({})).toBe('items must be an array')
    })

    it('should reject item without product_id', () => {
      const items = [{ product_name: 'Rose', unit_price_usd: 10, quantity: 1 }]

      expect(itemsValidator(items)).toContain('product_id is required')
    })

    it('should reject item without product_name', () => {
      const items = [{ product_id: 1, unit_price_usd: 10, quantity: 1 }]

      expect(itemsValidator(items)).toContain('product_name is required')
    })

    it('should reject item without unit_price_usd', () => {
      const items = [{ product_id: 1, product_name: 'Rose', quantity: 1 }]

      expect(itemsValidator(items)).toContain('unit_price_usd is required')
    })

    it('should reject item without quantity', () => {
      const items = [{ product_id: 1, product_name: 'Rose', unit_price_usd: 10 }]

      expect(itemsValidator(items)).toContain('quantity is required')
    })

    it('should validate multiple items', () => {
      const items = [
        { product_id: 1, product_name: 'Rose', unit_price_usd: 10, quantity: 2 },
        { product_id: 2, product_name: 'Lily', unit_price_usd: 15, quantity: 1 }
      ]

      expect(itemsValidator(items)).toBeNull()
    })

    it('should report error with item index', () => {
      const items = [
        { product_id: 1, product_name: 'Rose', unit_price_usd: 10, quantity: 2 },
        { product_id: 2, unit_price_usd: 15, quantity: 1 }
      ]

      expect(itemsValidator(items)).toContain('[1].product_name')
    })
  })

  describe('orderStatusUpdateSchema', () => {
    it('should require status field', () => {
      expect(orderStatusUpdateSchema.status).toBeDefined()
      expect(orderStatusUpdateSchema.status.required).toBe(true)
    })

    it('should validate status enum', () => {
      expect(orderStatusUpdateSchema.status.enum).toContain('pending')
      expect(orderStatusUpdateSchema.status.enum).toContain('delivered')
      expect(orderStatusUpdateSchema.status.enum).toContain('cancelled')
    })

    it('should allow optional notes', () => {
      expect(orderStatusUpdateSchema.notes.required).toBe(false)
    })
  })
})
