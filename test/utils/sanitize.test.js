import { describe, it, expect } from 'vitest'
import { sanitizeData, FIELD_TYPES } from '../../api/utils/sanitize.js'

describe('sanitizeData', () => {
  describe('Basic Sanitization', () => {
    it('should return data unchanged if not an object', () => {
      expect(sanitizeData(null, {})).toBeNull()
      expect(sanitizeData(undefined, {})).toBeUndefined()
      expect(sanitizeData('string', {})).toBe('string')
      expect(sanitizeData(123, {})).toBe(123)
    })

    it('should return empty object for empty input', () => {
      const result = sanitizeData({}, {})
      expect(result).toEqual({})
    })

    it('should preserve fields not in fieldTypes', () => {
      const data = { name: 'test', extra: 'field' }
      const fieldTypes = { name: 'string' }
      const result = sanitizeData(data, fieldTypes)
      expect(result.extra).toBe('field')
    })
  })

  describe('String Type Sanitization', () => {
    const fieldTypes = { name: 'string', description: 'string' }

    it('should convert null to empty string', () => {
      const data = { name: null }
      const result = sanitizeData(data, fieldTypes)
      expect(result.name).toBe('')
    })

    it('should convert undefined to empty string', () => {
      const data = { name: undefined }
      const result = sanitizeData(data, fieldTypes)
      expect(result.name).toBe('')
    })

    it('should preserve valid string values', () => {
      const data = { name: 'Test Name' }
      const result = sanitizeData(data, fieldTypes)
      expect(result.name).toBe('Test Name')
    })

    it('should preserve empty string', () => {
      const data = { name: '' }
      const result = sanitizeData(data, fieldTypes)
      expect(result.name).toBe('')
    })
  })

  describe('Number Type Sanitization', () => {
    const fieldTypes = { price: 'number', quantity: 'number' }

    it('should convert null to 0', () => {
      const data = { price: null }
      const result = sanitizeData(data, fieldTypes)
      expect(result.price).toBe(0)
    })

    it('should convert undefined to 0', () => {
      const data = { price: undefined }
      const result = sanitizeData(data, fieldTypes)
      expect(result.price).toBe(0)
    })

    it('should convert NaN to 0', () => {
      const data = { price: NaN }
      const result = sanitizeData(data, fieldTypes)
      expect(result.price).toBe(0)
    })

    it('should preserve valid number values', () => {
      const data = { price: 99.99 }
      const result = sanitizeData(data, fieldTypes)
      expect(result.price).toBe(99.99)
    })

    it('should preserve zero', () => {
      const data = { price: 0 }
      const result = sanitizeData(data, fieldTypes)
      expect(result.price).toBe(0)
    })

    it('should preserve negative numbers', () => {
      const data = { price: -10 }
      const result = sanitizeData(data, fieldTypes)
      expect(result.price).toBe(-10)
    })
  })

  describe('Integer Type Sanitization', () => {
    const fieldTypes = { stock: 'integer', carousel_order: 'integer' }

    it('should convert null to 0', () => {
      const data = { stock: null }
      const result = sanitizeData(data, fieldTypes)
      expect(result.stock).toBe(0)
    })

    it('should convert undefined to 0', () => {
      const data = { stock: undefined }
      const result = sanitizeData(data, fieldTypes)
      expect(result.stock).toBe(0)
    })

    it('should convert NaN to 0', () => {
      const data = { stock: NaN }
      const result = sanitizeData(data, fieldTypes)
      expect(result.stock).toBe(0)
    })

    it('should preserve valid integer values', () => {
      const data = { stock: 100 }
      const result = sanitizeData(data, fieldTypes)
      expect(result.stock).toBe(100)
    })
  })

  describe('Boolean Type Sanitization', () => {
    const fieldTypes = { active: 'boolean', featured: 'boolean' }

    it('should convert null to false', () => {
      const data = { active: null }
      const result = sanitizeData(data, fieldTypes)
      expect(result.active).toBe(false)
    })

    it('should convert undefined to false', () => {
      const data = { active: undefined }
      const result = sanitizeData(data, fieldTypes)
      expect(result.active).toBe(false)
    })

    it('should preserve true value', () => {
      const data = { active: true }
      const result = sanitizeData(data, fieldTypes)
      expect(result.active).toBe(true)
    })

    it('should preserve false value', () => {
      const data = { active: false }
      const result = sanitizeData(data, fieldTypes)
      expect(result.active).toBe(false)
    })
  })

  describe('Unknown Type Handling', () => {
    const fieldTypes = { custom: 'custom_type' }

    it('should keep null for unknown types', () => {
      const data = { custom: null }
      const result = sanitizeData(data, fieldTypes)
      expect(result.custom).toBeNull()
    })

    it('should keep null for undefined with unknown type', () => {
      const data = { custom: undefined }
      const result = sanitizeData(data, fieldTypes)
      expect(result.custom).toBeNull()
    })
  })

  describe('Multiple Fields', () => {
    const fieldTypes = {
      name: 'string',
      price: 'number',
      active: 'boolean',
      stock: 'integer'
    }

    it('should sanitize multiple fields correctly', () => {
      const data = {
        name: null,
        price: undefined,
        active: null,
        stock: NaN
      }
      const result = sanitizeData(data, fieldTypes)
      expect(result).toEqual({
        name: '',
        price: 0,
        active: false,
        stock: 0
      })
    })

    it('should preserve valid values and sanitize invalid ones', () => {
      const data = {
        name: 'Product',
        price: null,
        active: true,
        stock: NaN
      }
      const result = sanitizeData(data, fieldTypes)
      expect(result).toEqual({
        name: 'Product',
        price: 0,
        active: true,
        stock: 0
      })
    })
  })

  describe('Complex Objects', () => {
    it('should not mutate original data', () => {
      const original = { name: null, price: undefined }
      const fieldTypes = { name: 'string', price: 'number' }
      const result = sanitizeData(original, fieldTypes)
      
      expect(original.name).toBeNull()
      expect(original.price).toBeUndefined()
      expect(result.name).toBe('')
      expect(result.price).toBe(0)
    })

    it('should handle nested objects (keep as is)', () => {
      const data = { user: { name: 'Test' }, active: null }
      const fieldTypes = { active: 'boolean' }
      const result = sanitizeData(data, fieldTypes)
      expect(result.user).toEqual({ name: 'Test' })
      expect(result.active).toBe(false)
    })
  })
})

describe('FIELD_TYPES', () => {
  it('should have products field definitions', () => {
    expect(FIELD_TYPES.products).toBeDefined()
    expect(FIELD_TYPES.products.name).toBe('string')
    expect(FIELD_TYPES.products.price_usd).toBe('number')
    expect(FIELD_TYPES.products.active).toBe('boolean')
  })

  it('should have users field definitions', () => {
    expect(FIELD_TYPES.users).toBeDefined()
    expect(FIELD_TYPES.users.email).toBe('string')
    expect(FIELD_TYPES.users.active).toBe('boolean')
  })

  it('should have orders field definitions', () => {
    expect(FIELD_TYPES.orders).toBeDefined()
  })

  it('should have payments field definitions', () => {
    expect(FIELD_TYPES.payments).toBeDefined()
  })

  it('should have occasions field definitions', () => {
    expect(FIELD_TYPES.occasions).toBeDefined()
  })

  it('should have settings field definitions', () => {
    expect(FIELD_TYPES.settings).toBeDefined()
  })
})

describe('Integration with FIELD_TYPES', () => {
  it('should sanitize product data correctly', () => {
    const productData = {
      name: null,
      price_usd: NaN,
      stock: undefined,
      active: null,
      featured: true
    }
    const result = sanitizeData(productData, FIELD_TYPES.products)
    expect(result).toEqual({
      name: '',
      price_usd: 0,
      stock: 0,
      active: false,
      featured: true
    })
  })

  it('should sanitize user data correctly', () => {
    const userData = {
      email: null,
      full_name: undefined,
      active: null,
      email_verified: true
    }
    const result = sanitizeData(userData, FIELD_TYPES.users)
    expect(result).toEqual({
      email: '',
      full_name: '',
      active: false,
      email_verified: true
    })
  })
})
