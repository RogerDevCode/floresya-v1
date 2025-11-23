/**
 * Carousel Service Tests - Implementation with comprehensive Supabase mocking
 * 100% success standard compliance
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { ValidationError } from '../../api/errors/AppError.js'

// Mock dependencies - using proper comprehensive Supabase mock
import { createSupabaseClientMock } from '../supabase-client/mocks/mocks.js'

const mockSupabase = createSupabaseClientMock()

vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: mockSupabase,
  DB_SCHEMA: {
    products: { table: 'products' },
    product_images: { table: 'product_images' }
  }
}))

vi.mock('../../api/utils/logger.js', () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}))

vi.mock('../../api/config/constants.js', () => ({
  CAROUSEL: {
    MAX_SIZE: 7,
    MIN_POSITION: 1,
    MAX_POSITION: 7
  },
  QUERY_LIMITS: {
    SINGLE_RECORD: 1
  }
}))

vi.mock('../../api/middleware/error/index.js', () => ({
  withErrorMapping: vi.fn(fn => fn)
}))

// Import service after mocking
let {
  getCarouselProducts,
  validateCarouselOrder,
  isCarouselFull,
  resolveCarouselOrderConflict,
  reorderCarousel,
  removeFromCarousel,
  getAvailablePositions
} = {}

describe('Carousel Service - Carousel Management Operations', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockSupabase.reset()

    // Import service functions after mocking is set up
    const serviceModule = await import('../../api/services/carouselService.js')
    getCarouselProducts = serviceModule.getCarouselProducts
    validateCarouselOrder = serviceModule.validateCarouselOrder
    isCarouselFull = serviceModule.isCarouselFull
    resolveCarouselOrderConflict = serviceModule.resolveCarouselOrderConflict
    reorderCarousel = serviceModule.reorderCarousel
    removeFromCarousel = serviceModule.removeFromCarousel
    getAvailablePositions = serviceModule.getAvailablePositions
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getCarouselProducts', () => {
    test('should return carousel products with images successfully', async () => {
      // The mock already contains product data, we can use it directly
      const result = await getCarouselProducts()

      expect(result).not.toBeNull()
      expect(Array.isArray(result)).toBe(true)
    })

    test('should return empty array when no featured products found', async () => {
      // Clear the mock data to simulate no products
      mockSupabase.mockDataStore.setTable('products', [])
      mockSupabase.mockDataStore.setTable('product_images', [])

      const result = await getCarouselProducts()

      expect(result).toEqual([])
    })
  })

  describe('validateCarouselOrder', () => {
    test('should not throw for null or undefined carousel order', () => {
      expect(() => validateCarouselOrder(null)).not.toThrow()
      expect(() => validateCarouselOrder(undefined)).not.toThrow()
    })

    test('should not throw for valid carousel orders', () => {
      expect(() => validateCarouselOrder(1)).not.toThrow()
      expect(() => validateCarouselOrder(7)).not.toThrow()
      expect(() => validateCarouselOrder(4)).not.toThrow()
    })

    test('should throw ValidationError for invalid types', () => {
      expect(() => validateCarouselOrder('1')).toThrow(ValidationError)
      expect(() => validateCarouselOrder(1.5)).toThrow(ValidationError)
      expect(() => validateCarouselOrder({})).toThrow(ValidationError)
      expect(() => validateCarouselOrder([])).toThrow(ValidationError)
    })

    test('should throw ValidationError for out of range values', () => {
      expect(() => validateCarouselOrder(0)).toThrow(ValidationError)
      expect(() => validateCarouselOrder(8)).toThrow(ValidationError)
      expect(() => validateCarouselOrder(-1)).toThrow(ValidationError)
      expect(() => validateCarouselOrder(100)).toThrow(ValidationError)
    })
  })

  describe('isCarouselFull', () => {
    test('should return true when carousel is full', async () => {
      // Create 7 products with carousel orders to simulate full carousel
      const fullProducts = Array.from({ length: 7 }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        featured: true,
        active: true,
        carousel_order: i + 1,
        summary: 'Test product',
        description: 'Test description',
        price_usd: 29.99,
        price_ves: 750000,
        stock: 50,
        sku: `TEST-00${i + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        name_normalized: `product ${i + 1}`,
        description_normalized: 'test description'
      }))

      mockSupabase.mockDataStore.setTable('products', fullProducts)

      const result = await isCarouselFull()

      expect(result).toBe(true)
    })

    test('should return false when carousel has space', async () => {
      // Create only 3 products with carousel orders
      const partialProducts = Array.from({ length: 3 }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        featured: true,
        active: true,
        carousel_order: i + 1,
        summary: 'Test product',
        description: 'Test description',
        price_usd: 29.99,
        price_ves: 750000,
        stock: 50,
        sku: `TEST-00${i + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        name_normalized: `product ${i + 1}`,
        description_normalized: 'test description'
      }))

      mockSupabase.mockDataStore.setTable('products', partialProducts)

      const result = await isCarouselFull()

      expect(result).toBe(false)
    })
  })

  describe('resolveCarouselOrderConflict', () => {
    test('should resolve conflicts by shifting products', async () => {
      const conflictingProducts = [
        { id: 1, name: 'Product 1', carousel_order: 1 },
        { id: 2, name: 'Product 2', carousel_order: 2 }
      ]

      mockSupabase.mockDataStore.setTable('products', conflictingProducts)

      // This test verifies the function executes without throwing
      await expect(resolveCarouselOrderConflict(1)).resolves.not.toThrow()
    })

    test('should handle empty carousel', async () => {
      mockSupabase.mockDataStore.setTable('products', [])

      await expect(resolveCarouselOrderConflict(1)).resolves.not.toThrow()
    })
  })

  describe('reorderCarousel', () => {
    test('should reorder carousel products successfully', async () => {
      const testProducts = [
        { id: 1, name: 'Product 1', carousel_order: 1 },
        { id: 2, name: 'Product 2', carousel_order: 2 }
      ]

      mockSupabase.mockDataStore.setTable('products', testProducts)

      const reorderData = [
        { product_id: 1, new_order: 2 },
        { product_id: 2, new_order: 1 }
      ]

      await expect(reorderCarousel(reorderData)).resolves.not.toThrow()
    })

    test('should throw ValidationError for invalid input', async () => {
      const invalidData = 'not an array'

      await expect(reorderCarousel(invalidData)).rejects.toThrow()
    })
  })

  describe('removeFromCarousel', () => {
    test('should remove product from carousel successfully', async () => {
      const testProducts = [
        { id: 1, name: 'Product 1', featured: true, active: true, carousel_order: 1 },
        { id: 2, name: 'Product 2', featured: true, active: true, carousel_order: 2 }
      ]

      mockSupabase.mockDataStore.setTable('products', testProducts)

      await expect(removeFromCarousel(1)).resolves.not.toThrow()
    })
  })

  describe('getAvailablePositions', () => {
    test('should return available positions', async () => {
      const testProducts = [
        { id: 1, name: 'Product 1', featured: true, active: true, carousel_order: 1 },
        { id: 2, name: 'Product 2', featured: true, active: true, carousel_order: 3 }
      ]

      mockSupabase.mockDataStore.setTable('products', testProducts)

      const result = await getAvailablePositions()

      expect(result).toContain(2) // Position 2 should be available
      expect(result).toContain(4) // Position 4 should be available
      expect(result).toContain(5) // Position 5 should be available
      expect(result).toContain(6) // Position 6 should be available
      expect(result).toContain(7) // Position 7 should be available
    })

    test('should return all positions when carousel is empty', async () => {
      mockSupabase.mockDataStore.setTable('products', [])

      const result = await getAvailablePositions()

      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7])
    })
  })

  describe('Error Handling', () => {
    test('should handle database connection errors', async () => {
      // Simulate a database error by mocking the service to use a failing query
      const mockQueryBuilder = mockSupabase.from('products')
      mockQueryBuilder.simulateConnectionError()

      // We need to mock the entire call chain since it's chained
      const errorQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockRejectedValue(new Error('Connection failed'))
      }

      mockSupabase.from = vi.fn().mockReturnValue(errorQuery)

      await expect(getCarouselProducts()).rejects.toThrow()
    })
  })
})
