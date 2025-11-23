/**
 * Product Image Repository Tests - Vitest Edition
 * Comprehensive testing of product image repository operations
 * Following KISS principle and Supabase best practices
 */
// @ts-nocheck

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks, createMockSupabase, testData, mockErrors } from './setup.js'
import { ProductImageRepository } from '../../api/repositories/ProductImageRepository.js'
import { BadRequestError } from '../../api/errors/AppError.js'

// Mock Supabase client
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: createMockSupabase(),
  DB_SCHEMA: {
    product_images: { table: 'product_images' }
  }
}))

// Mock AppError
vi.mock('../../api/errors/AppError.js', () => ({
  BadRequestError: class BadRequestError extends Error {
    constructor(message, details) {
      super(message)
      this.name = 'BadRequestError'
      this.details = details
    }
  }
}))

describe('Product Image Repository - Product Image-specific Operations', () => {
  let mockSupabase
  let repository

  beforeEach(async () => {
    resetAllMocks()

    mockSupabase = createMockSupabase()

    // Mock the supabase import
    const supabaseModule = await import('../../api/services/supabaseClient.js')
    supabaseModule.supabase = mockSupabase

    repository = new ProductImageRepository(mockSupabase)
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('findByProductId - Find images by product ID', () => {
    test('should return images for a product ordered by image_index', async () => {
      const mockImages = [testData.productImages.primary, testData.productImages.secondary]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockImages, error: null })
          })
        })
      })

      const result = await repository.findByProductId(1)

      expect(result).toEqual(mockImages)
    })
  })

  describe('findPrimaryByProductId - Find primary image by product ID', () => {
    test('should return primary image when found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({ data: testData.productImages.primary, error: null })
            })
          })
        })
      })

      const result = await repository.findPrimaryByProductId(1)

      expect(result).toEqual(testData.productImages.primary)
    })

    test('should return null when no primary image found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notFound })
            })
          })
        })
      })

      const result = await repository.findPrimaryByProductId(1)

      expect(result).toBeNull()
    })
  })

  describe('findByHash - Find image by file hash', () => {
    test('should return image when found by hash', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: testData.productImages.primary, error: null })
          })
        })
      })

      const result = await repository.findByHash('hash123')

      expect(result).toEqual(testData.productImages.primary)
    })

    test('should return null when hash not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notFound })
          })
        })
      })

      const result = await repository.findByHash('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('createMultiple - Create multiple images', () => {
    test('should create multiple images successfully', async () => {
      const images = [
        {
          url: 'image1.jpg',
          size: 1024,
          is_primary: true,
          file_hash: 'hash1',
          mime_type: 'image/jpeg'
        },
        {
          url: 'image2.jpg',
          size: 2048,
          is_primary: false,
          file_hash: 'hash2',
          mime_type: 'image/jpeg'
        }
      ]
      const createdImages = [
        { ...images[0], product_id: 1, image_index: 0, id: 1 },
        { ...images[1], product_id: 1, image_index: 1, id: 2 }
      ]

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: createdImages, error: null })
        })
      })

      const result = await repository.createMultiple(1, images)

      expect(result).toEqual(createdImages)
    })

    test('should throw BadRequestError for invalid productId', async () => {
      await expect(repository.createMultiple(null, [])).rejects.toThrow(BadRequestError)
    })

    test('should throw BadRequestError for invalid images array', async () => {
      await expect(repository.createMultiple(1, null)).rejects.toThrow(BadRequestError)
      await expect(repository.createMultiple(1, 'not-array')).rejects.toThrow(BadRequestError)
      await expect(repository.createMultiple(1, [])).rejects.toThrow(BadRequestError)
    })
  })

  describe('updateCarouselOrder - Update carousel order', () => {
    test('should update carousel order successfully', async () => {
      const imageIds = [2, 1, 3]

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null })
          })
        })
      })

      await expect(repository.updateCarouselOrder(1, imageIds)).resolves.not.toThrow()
    })

    test('should throw BadRequestError for invalid productId', async () => {
      await expect(repository.updateCarouselOrder(null, [1, 2, 3])).rejects.toThrow(BadRequestError)
    })

    test('should throw BadRequestError for invalid imageIds array', async () => {
      await expect(repository.updateCarouselOrder(1, null)).rejects.toThrow(BadRequestError)
      await expect(repository.updateCarouselOrder(1, 'not-array')).rejects.toThrow(BadRequestError)
      await expect(repository.updateCarouselOrder(1, [])).rejects.toThrow(BadRequestError)
    })
  })

  describe('deleteByProductId - Delete images by product ID', () => {
    test('should delete all images for a product', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [{ id: 1 }, { id: 2 }], error: null })
        })
      })

      const result = await repository.deleteByProductId(1)

      expect(result).toBe(2)
    })

    test('should delete specific images for a product', async () => {
      const imageIds = [1, 3]

      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: [{ id: 1 }, { id: 3 }], error: null })
          })
        })
      })

      const result = await repository.deleteByProductId(1, imageIds)

      expect(result).toBe(2)
    })

    test('should return 0 when no images deleted', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      })

      const result = await repository.deleteByProductId(1)

      expect(result).toBe(0)
    })
  })
})
