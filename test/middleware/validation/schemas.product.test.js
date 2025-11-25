/**
 * Tests for Product Validation Schemas
 * Coverage for product creation and update schemas
 */

import { describe, it, expect } from 'vitest'
import { productCreateSchema, productUpdateSchema } from '../../../api/middleware/validation/schemas.product.js'

describe('Product Validation Schemas', () => {
  describe('productCreateSchema - product field', () => {
    const productValidator = productCreateSchema.product.custom

    it('should validate complete nested product object', () => {
      const validProduct = {
        name: 'Rose Bouquet',
        price_usd: 25.50,
        stock: 10
      }

      expect(productValidator(validProduct, validProduct)).toBeNull()
    })

    it('should validate flattened product data', () => {
      const flatData = {
        name: 'Lily Arrangement',
        price_usd: 35.00
      }

      expect(productValidator(null, flatData)).toBeNull()
    })

    it('should reject product without name', () => {
      const product = { price_usd: 25.50 }

      expect(productValidator(product, product)).toContain('name is required')
    })

    it('should reject product without price_usd', () => {
      const product = { name: 'Test Product' }

      expect(productValidator(product, product)).toContain('price_usd is required')
    })

    it('should reject when name is not a string', () => {
      const product = { name: 123, price_usd: 25.50 }

      expect(productValidator(product, product)).toContain('must be a string')
    })

    it('should reject when price_usd is not a number', () => {
      const product = { name: 'Test', price_usd: '25.50' }

      expect(productValidator(product, product)).toContain('must be a number')
    })

    it('should reject non-object product', () => {
      expect(productValidator('string', 'string')).toBe('product must be an object')
    })
  })

  describe('productCreateSchema - field definitions', () => {
    it('should define name field with constraints', () => {
      expect(productCreateSchema.name.type).toBe('string')
      expect(productCreateSchema.name.minLength).toBe(2)
      expect(productCreateSchema.name.maxLength).toBe(255)
    })

    it('should define price_usd as number with min constraint', () => {
      expect(productCreateSchema.price_usd.type).toBe('number')
      expect(productCreateSchema.price_usd.min).toBe(0)
    })

    it('should define stock as integer', () => {
      expect(productCreateSchema.stock.type).toBe('number')
      expect(productCreateSchema.stock.integer).toBe(true)
      expect(productCreateSchema.stock.min).toBe(0)
    })

    it('should define featured as boolean', () => {
      expect(productCreateSchema.featured.type).toBe('boolean')
    })

    it('should define carousel_order with range', () => {
      expect(productCreateSchema.carousel_order.integer).toBe(true)
      expect(productCreateSchema.carousel_order.min).toBe(0)
      expect(productCreateSchema.carousel_order.max).toBe(7)
    })
  })

  describe('productUpdateSchema', () => {
    it('should allow partial updates', () => {
      expect(productUpdateSchema.name.required).toBe(false)
      expect(productUpdateSchema.price_usd.required).toBe(false)
    })

    it('should maintain same constraints as create', () => {
      expect(productUpdateSchema.name.minLength).toBe(2)
      expect(productUpdateSchema.price_usd.min).toBe(0)
      expect(productUpdateSchema.stock.integer).toBe(true)
    })

    it('should define active field for updates', () => {
      expect(productUpdateSchema.active).toBeDefined()
      expect(productUpdateSchema.active.type).toBe('boolean')
    })
  })
})
