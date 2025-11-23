/**
 * Product Repository Tests - Vitest Edition
 * Comprehensive testing of product repository operations
 * Following KISS principle and Supabase best practices
 */
// @ts-nocheck

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks, createMockSupabase, testData, mockErrors } from './setup.js'
import { ProductRepository } from '../../api/repositories/ProductRepository.js'
import { BadRequestError } from '../../api/errors/AppError.js'

// Mock Supabase client
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: createMockSupabase(),
  DB_SCHEMA: {
    products: { table: 'products' }
  }
}))

describe('Product Repository - Product-specific Operations', () => {
  let mockSupabase
  let repository

  beforeEach(async () => {
    resetAllMocks()

    mockSupabase = createMockSupabase()

    // Mock the supabase import
    const supabaseModule = await import('../../api/services/supabaseClient.js')
    supabaseModule.supabase = mockSupabase

    repository = new ProductRepository(mockSupabase)
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('findAllWithFilters - Find products with filters', () => {
    test('should return products with standard filters', async () => {
      const mockProducts = [testData.products.active]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProducts, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockProducts, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithFilters()

      expect(result).toEqual(mockProducts)
    })

    test('should apply SKU filter', async () => {
      const filters = { sku: 'TEST-001' }
      const mockProducts = [testData.products.active]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProducts, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockProducts, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockProducts)
    })

    test('should apply featured filter', async () => {
      const filters = { featured: true }
      const mockProducts = [testData.products.active]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProducts, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockProducts, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockProducts)
    })

    test('should apply price range filters', async () => {
      const filters = { price_min: 10, price_max: 100 }
      const mockProducts = [testData.products.active]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProducts, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockProducts, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockProducts)
    })

    test('should apply search filter', async () => {
      const filters = { search: 'test product' }
      const mockProducts = [testData.products.active]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProducts, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockProducts, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockProducts)
    })

    test('should handle occasion filter with RPC call', async () => {
      const filters = { occasionId: 1 }
      const mockProducts = [testData.products.active]

      mockSupabase.rpc.mockResolvedValue({ data: mockProducts, error: null })

      const result = await repository.findAllWithFilters(filters)

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_products_by_occasion', {
        p_occasion_id: 1,
        p_limit: 50
      })
      expect(result).toEqual(mockProducts)
    })
  })

  describe('findByIdWithImages - Find product with images', () => {
    test('should return product with images', async () => {
      const mockProduct = testData.products.active
      const mockImages = [testData.productImages.primary]

      // Mock product query
      const mockProductQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProduct, error: null })
      }
      mockSupabase.from.mockReturnValueOnce(mockProductQuery)

      // Mock images query
      const mockImagesQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockImages, error: null })
      }
      mockSupabase.from.mockReturnValueOnce(mockImagesQuery)

      const result = await repository.findByIdWithImages(1)

      expect(result).toEqual({
        ...mockProduct,
        product_images: mockImages
      })
    })

    test('should return null when product not found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notFound })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findByIdWithImages(999)

      expect(result).toBeNull()
    })

    test('should handle image loading errors gracefully', async () => {
      const mockProduct = testData.products.active

      // Mock product query success
      const mockProductQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProduct, error: null })
      }
      mockSupabase.from.mockReturnValueOnce(mockProductQuery)

      // Mock images query failure
      const mockImagesQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockErrors.generic })
      }
      mockSupabase.from.mockReturnValueOnce(mockImagesQuery)

      const result = await repository.findByIdWithImages(1)

      expect(result).toEqual({
        ...mockProduct,
        product_images: []
      })
    })
  })

  describe('findFeatured - Find featured products', () => {
    test('should return featured products', async () => {
      const mockProducts = [testData.products.active]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: mockProducts, error: null })
              })
            })
          })
        })
      })

      const result = await repository.findFeatured(10)

      expect(result).toEqual(mockProducts)
    })
  })

  describe('updateCarouselOrder - Update carousel order', () => {
    test('should update carousel order successfully', async () => {
      const updatedProduct = { ...testData.products.active, carousel_order: 5, featured: true }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedProduct, error: null })
            })
          })
        })
      })

      const result = await repository.updateCarouselOrder(1, 5)

      expect(result).toEqual(updatedProduct)
    })

    test('should set featured to false when order is null', async () => {
      const updatedProduct = { ...testData.products.active, carousel_order: null, featured: false }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedProduct, error: null })
            })
          })
        })
      })

      const result = await repository.updateCarouselOrder(1, null)

      expect(result.featured).toBe(false)
    })
  })

  describe('updateStock - Update product stock', () => {
    test('should update stock successfully', async () => {
      const updatedProduct = { ...testData.products.active, stock: 50 }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedProduct, error: null })
            })
          })
        })
      })

      const result = await repository.updateStock(1, 50)

      expect(result).toEqual(updatedProduct)
    })
  })

  describe('decrementStock - Decrement stock atomically', () => {
    test('should decrement stock successfully', async () => {
      const updatedProduct = { ...testData.products.active, stock: 90 }

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedProduct, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)
      mockSupabase.raw = vi.fn((sql, params) => sql.replace('?', params[0]))

      const result = await repository.decrementStock(1, 10)

      expect(result).toEqual(updatedProduct)
    })

    test('should throw BadRequestError for insufficient stock', async () => {
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notFound })
      }

      mockSupabase.from.mockReturnValue(mockQuery)
      mockSupabase.raw = vi.fn((sql, params) => sql.replace('?', params[0]))

      await expect(repository.decrementStock(1, 200)).rejects.toThrow(BadRequestError)
    })
  })

  describe('existsBySku - Check if SKU exists', () => {
    test('should return true when SKU exists', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: testData.products.active, error: null })
          })
        })
      })

      const result = await repository.existsBySku('TEST-001')

      expect(result).toBe(true)
    })

    test('should return false when SKU does not exist', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notFound })
          })
        })
      })

      const result = await repository.existsBySku('NONEXISTENT')

      expect(result).toBe(false)
    })
  })

  describe('exists - Check if product exists', () => {
    test('should return true when product exists', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: testData.products.active, error: null })
          })
        })
      })

      const result = await repository.exists(1)

      expect(result).toBe(true)
    })

    test('should return false when product does not exist', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notFound })
          })
        })
      })

      const result = await repository.exists(999)

      expect(result).toBe(false)
    })
  })

  describe('count - Count products with filters', () => {
    test('should count products successfully', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({ count: 5, error: null })
      })

      const result = await repository.count()

      expect(result).toBe(5)
    })

    test('should apply filters to count', async () => {
      const filters = { featured: true, active: true }

      // Create a chainable mock that resolves on the final call
      let callCount = 0
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn((field, value) => {
          callCount++
          if (callCount >= 2) {
            // After both eq calls
            return Promise.resolve({ count: 3, error: null })
          }
          return mockQuery
        })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.count(filters)

      expect(result).toBe(3)
    })
  })

  describe('getProductOccasions - Get product occasions', () => {
    test('should return product occasions', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ occasions: testData.occasions.birthday }],
            error: null
          })
        })
      })

      const result = await repository.getProductOccasions(1)

      expect(result).toEqual([testData.occasions.birthday])
    })
  })

  describe('linkOccasion - Link occasion to product', () => {
    test('should link occasion successfully', async () => {
      const linkData = { product_id: 1, occasion_id: 1 }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: linkData, error: null })
          })
        })
      })

      const result = await repository.linkOccasion(1, 1)

      expect(result).toEqual(linkData)
    })

    test('should throw BadRequestError for duplicate link', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.uniqueViolation })
          })
        })
      })

      await expect(repository.linkOccasion(1, 1)).rejects.toThrow(BadRequestError)
    })
  })

  describe('unlinkOccasion - Unlink occasion from product', () => {
    test('should unlink occasion successfully', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null })
          })
        })
      })

      await expect(repository.unlinkOccasion(1, 1)).resolves.toBeUndefined()
    })
  })

  describe('replaceOccasions - Replace product occasions', () => {
    test('should replace occasions successfully', async () => {
      const newRelations = [
        { product_id: 1, occasion_id: 1 },
        { product_id: 1, occasion_id: 2 }
      ]

      mockSupabase.from
        .mockReturnValueOnce({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null })
          })
        })
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({ data: newRelations, error: null })
          })
        })

      const result = await repository.replaceOccasions(1, [1, 2])

      expect(result).toEqual(newRelations)
    })
  })

  describe('findBySku - Find product by SKU', () => {
    test('should return product when found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: testData.products.active, error: null })
            })
          })
        })
      })

      const result = await repository.findBySku('TEST-001')

      expect(result).toEqual(testData.products.active)
    })

    test('should return null when SKU not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notFound })
            })
          })
        })
      })

      const result = await repository.findBySku('NONEXISTENT')

      expect(result).toBeNull()
    })
  })

  describe('findAllWithOccasions - Find products with occasions', () => {
    test('should return products with occasions', async () => {
      const mockProducts = [
        {
          ...testData.products.active,
          product_occasions: [
            {
              occasion_id: 1,
              occasions: testData.occasions.birthday
            }
          ]
        }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProducts, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockProducts, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithOccasions()

      expect(result).toHaveLength(1)
      expect(result[0].product_occasions[0]).toEqual({
        occasion_id: 1,
        occasions: testData.occasions.birthday
      })
    })
  })

  describe('findByOccasion - Find products by occasion', () => {
    test('should return products for occasion', async () => {
      const mockData = [
        {
          products: testData.products.active
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockData, error: null })
        })
      })

      const result = await repository.findByOccasion(1)

      expect(result).toEqual([testData.products.active])
    })

    test('should filter in-stock products only', async () => {
      const mockData = [
        { products: testData.products.active }, // in stock
        { products: { ...testData.products.active, stock: 0 } } // out of stock
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockData, error: null })
        })
      })

      const result = await repository.findByOccasion(1, { inStockOnly: true })

      expect(result.length).toBe(1)
      expect(result[0].stock).toBeGreaterThan(0)
    })
  })

  describe('replaceProductOccasions - Replace occasions using RPC', () => {
    test('should replace occasions using stored function', async () => {
      const resultData = { success: true }

      mockSupabase.rpc.mockResolvedValue({ data: resultData, error: null })

      const result = await repository.replaceProductOccasions(1, [1, 2])

      expect(mockSupabase.rpc).toHaveBeenCalledWith('replace_product_occasions', {
        p_product_id: 1,
        p_occasion_ids: [1, 2]
      })
      expect(result).toEqual(resultData)
    })
  })
})
