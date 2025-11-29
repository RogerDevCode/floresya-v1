/**
 * Tests for Product Image Service (Monolithic)
 * Coverage for: create, read, update, delete operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as ProductImageService from '../../api/services/productImageService.js'

// Mock Supabase Client
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()
const mockSingle = vi.fn()
const mockMaybeSingle = vi.fn()
const mockIn = vi.fn()

const mockQueryBuilder = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  eq: mockEq,
  order: mockOrder,
  limit: mockLimit,
  single: mockSingle,
  maybeSingle: mockMaybeSingle,
  in: mockIn
}

// Chainable methods return the query builder
mockSelect.mockReturnValue(mockQueryBuilder)
mockInsert.mockReturnValue(mockQueryBuilder)
mockUpdate.mockReturnValue(mockQueryBuilder)
mockDelete.mockReturnValue(mockQueryBuilder)
mockEq.mockReturnValue(mockQueryBuilder)
mockOrder.mockReturnValue(mockQueryBuilder)
mockLimit.mockReturnValue(mockQueryBuilder)
mockIn.mockReturnValue(mockQueryBuilder)

vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => mockQueryBuilder)
  },
  DB_SCHEMA: {
    product_images: {
      table: 'product_images',
      enums: { size: ['thumb', 'small', 'medium', 'large'] }
    },
    products: {
      table: 'products'
    }
  }
}))

// Mock validation
vi.mock('../../api/utils/validation.js', () => ({
  validateProductImage: vi.fn()
}))

describe('Product Image Service (Monolithic)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset default return values
    mockSelect.mockReturnValue(mockQueryBuilder)
    mockInsert.mockReturnValue(mockQueryBuilder)
    mockUpdate.mockReturnValue(mockQueryBuilder)
    mockEq.mockReturnValue(mockQueryBuilder)
    mockOrder.mockReturnValue(mockQueryBuilder)
    mockLimit.mockReturnValue(mockQueryBuilder)
    mockIn.mockReturnValue(mockQueryBuilder)
  })

  describe('getProductImages', () => {
    it('should return all images for a product', async () => {
      const images = [{ id: 1, product_id: 1, url: 'test.jpg' }]
      // Mock the promise resolution of the query chain
      mockQueryBuilder.then = vi.fn((resolve) => resolve({ data: images, error: null }))

      const result = await ProductImageService.getProductImages(1)

      expect(result).toEqual(images)
      expect(mockEq).toHaveBeenCalledWith('product_id', 1)
    })

    it('should filter by size', async () => {
      const images = [{ id: 1, product_id: 1, size: 'medium' }]
      mockQueryBuilder.then = vi.fn((resolve) => resolve({ data: images, error: null }))

      await ProductImageService.getProductImages(1, { size: 'medium' })

      expect(mockEq).toHaveBeenCalledWith('size', 'medium')
    })

    it('should throw BadRequestError for invalid productId', async () => {
      await expect(ProductImageService.getProductImages('invalid')).rejects.toThrow('Invalid product ID')
    })

    it('should throw NotFoundError when no images found', async () => {
      mockQueryBuilder.then = vi.fn((resolve) => resolve({ data: null, error: null }))

      await expect(ProductImageService.getProductImages(1)).rejects.toThrow('Product images with ID 1 not found')
    })
  })

  describe('getPrimaryImage', () => {
    it('should return primary image', async () => {
      const image = { id: 1, is_primary: true }
      mockSingle.mockResolvedValue({ data: image, error: null })

      const result = await ProductImageService.getPrimaryImage(1)

      expect(result).toEqual(image)
      expect(mockEq).toHaveBeenCalledWith('is_primary', true)
    })

    it('should fallback to first image if primary not found', async () => {
      // First query fails with PGRST116 (no rows)
      mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      
      // Second query (fallback) succeeds
      const fallbackImage = { id: 2, is_primary: false }
      mockMaybeSingle.mockResolvedValue({ data: fallbackImage, error: null })

      const result = await ProductImageService.getPrimaryImage(1)

      expect(result).toEqual(fallbackImage)
    })
  })

  describe('createImage', () => {
    it('should create an image', async () => {
      const imageData = {
        product_id: 1,
        image_index: 0,
        size: 'medium',
        url: 'http://example.com/img.jpg',
        file_hash: 'hash123'
      }
      const createdImage = { id: 1, ...imageData }
      
      mockSingle.mockResolvedValue({ data: createdImage, error: null })

      const result = await ProductImageService.createImage(imageData)

      expect(result).toEqual(createdImage)
      expect(mockInsert).toHaveBeenCalled()
    })

    it('should throw DatabaseConstraintError on duplicate', async () => {
      const imageData = {
        product_id: 1,
        image_index: 0,
        size: 'medium',
        url: 'url',
        file_hash: 'hash'
      }
      
      mockSingle.mockResolvedValue({ data: null, error: { code: '23505' } })

      await expect(ProductImageService.createImage(imageData)).rejects.toThrow('Database constraint violation')
    })
  })

  describe('updateImage', () => {
    it('should update an image', async () => {
      const updates = { url: 'new-url.jpg' }
      const updatedImage = { id: 1, url: 'new-url.jpg' }
      
      mockSingle.mockResolvedValue({ data: updatedImage, error: null })

      const result = await ProductImageService.updateImage(1, updates)

      expect(result).toEqual(updatedImage)
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining(updates))
      expect(mockEq).toHaveBeenCalledWith('id', 1)
    })

    it('should throw BadRequestError if no updates provided', async () => {
      await expect(ProductImageService.updateImage(1, {})).rejects.toThrow('No updates provided')
    })
  })

  describe('deleteImage', () => {
    it('should soft delete an image', async () => {
      const deletedImage = { id: 1, active: false }
      
      mockSingle.mockResolvedValue({ data: deletedImage, error: null })

      const result = await ProductImageService.deleteImage(1)

      expect(result).toEqual(deletedImage)
      expect(mockUpdate).toHaveBeenCalledWith({ active: false })
    })
  })

  describe('setPrimaryImage', () => {
    it('should set primary image', async () => {
      const newPrimary = { id: 1, is_primary: true }
      
      // Builder for first call (unset) - needs to be thenable
      const builder1 = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ error: null }))
      }

      // Builder for second call (set) - needs select().single()
      const builder2 = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: newPrimary, error: null })
      }

      // Override supabase.from for this test
      const { supabase } = await import('../../api/services/supabaseClient.js')
      supabase.from
        .mockReturnValueOnce(builder1)
        .mockReturnValueOnce(builder2)

      const result = await ProductImageService.setPrimaryImage(1, 1)

      expect(result).toEqual(newPrimary)
    })
  })

  describe('createProductImagesAtomic', () => {
    it('should create multiple images atomically', async () => {
      const imagesData = [
        { size: 'medium', url: 'url1', file_hash: 'hash1' },
        { size: 'small', url: 'url2', file_hash: 'hash2' }
      ]
      const createdImages = imagesData.map((img, i) => ({ id: i + 1, ...img }))
      
      mockSelect.mockResolvedValue({ data: createdImages, error: null })

      const result = await ProductImageService.createProductImagesAtomic(1, 1, imagesData)

      expect(result).toEqual(createdImages)
      expect(mockInsert).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ size: 'medium' }),
        expect.objectContaining({ size: 'small' })
      ]))
    })

    it('should throw BadRequestError for invalid input', async () => {
      await expect(ProductImageService.createProductImagesAtomic(1, 1, [])).rejects.toThrow('Invalid imagesData')
    })
  })

  describe('getProductsBatchWithImageSize', () => {
    it('should return products with images', async () => {
      const products = [{ id: 1, name: 'P1' }, { id: 2, name: 'P2' }]
      const images = [
        { product_id: 1, url: 'url1', size: 'medium' },
        { product_id: 2, url: 'url2', size: 'medium' }
      ]

      // Mock products query
      const productsBuilder = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: products, error: null })
      }

      // Mock images query
      const imagesBuilder = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: images, error: null })
      }

      const { supabase } = await import('../../api/services/supabaseClient.js')
      supabase.from
        .mockReturnValueOnce(productsBuilder)
        .mockReturnValueOnce(imagesBuilder)

      const result = await ProductImageService.getProductsBatchWithImageSize([1, 2], 'medium')

      expect(result).toHaveLength(2)
      expect(result[0].image_url_medium).toBe('url1')
      expect(result[1].image_url_medium).toBe('url2')
    })
  })

  describe('deleteProductImagesSafe', () => {
    it('should soft delete all images for product', async () => {
      const deletedImages = [{ id: 1 }, { id: 2 }]
      mockSelect.mockResolvedValue({ data: deletedImages, error: null })

      const result = await ProductImageService.deleteProductImagesSafe(1)

      expect(result.success).toBe(true)
      expect(result.deleted_count).toBe(2)
      expect(mockUpdate).toHaveBeenCalledWith({ active: false })
      expect(mockEq).toHaveBeenCalledWith('product_id', 1)
    })
  })

  describe('reactivateProductImages', () => {
    it('should reactivate all images for product', async () => {
      const reactivatedImages = [{ id: 1 }, { id: 2 }]
      mockSelect.mockResolvedValue({ data: reactivatedImages, error: null })

      const result = await ProductImageService.reactivateProductImages(1)

      expect(result.success).toBe(true)
      expect(result.reactivated_count).toBe(2)
      expect(mockUpdate).toHaveBeenCalledWith({ active: true })
      expect(mockEq).toHaveBeenCalledWith('product_id', 1)
    })
  })

  describe('deleteProductImagesBySize', () => {
    it('should delete images by size', async () => {
      const deletedImages = [{ id: 1 }]
      mockSelect.mockResolvedValue({ data: deletedImages, error: null })

      const result = await ProductImageService.deleteProductImagesBySize(1, 'medium')

      expect(result.success).toBe(true)
      expect(result.deleted_count).toBe(1)
      expect(mockEq).toHaveBeenCalledWith('size', 'medium')
    })
  })

  describe('getImagesByHash', () => {
    it('should return images by hash', async () => {
      const images = [{ id: 1, file_hash: 'hash123' }]
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: images, error: null })
        })
      })

      const result = await ProductImageService.getImagesByHash('hash123')
      expect(result).toEqual(images)
    })

    it('should throw BadRequestError for invalid hash', async () => {
      await expect(ProductImageService.getImagesByHash(123)).rejects.toThrow('Invalid file_hash')
    })
  })

  describe('getProductImageBySize', () => {
    it('should return image by size', async () => {
      const image = { id: 1, size: 'medium' }
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: image, error: null })
              })
            })
          })
        })
      })

      const result = await ProductImageService.getProductImageBySize(1, 'medium')
      expect(result).toEqual(image)
    })

    it('should throw NotFoundError when not found', async () => {
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
              })
            })
          })
        })
      })

      await expect(ProductImageService.getProductImageBySize(1, 'medium')).rejects.toThrow('No medium image found')
    })
  })

  describe('getProductWithImageSize', () => {
    it('should return product with image url', async () => {
      const product = { id: 1, name: 'Product 1' }
      const image = { url: 'http://example.com/img.jpg' }

      // Mock product query
      const productBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: product, error: null })
      }

      // Mock image query
      const imageBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: image, error: null })
      }

      const { supabase } = await import('../../api/services/supabaseClient.js')
      supabase.from
        .mockReturnValueOnce(productBuilder)
        .mockReturnValueOnce(imageBuilder)

      const result = await ProductImageService.getProductWithImageSize(1, 'medium')

      expect(result).toEqual({ ...product, image_url_medium: image.url })
    })
  })
})
