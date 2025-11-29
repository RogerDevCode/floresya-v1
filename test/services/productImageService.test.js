/**
 * Tests for Product Image Service (Monolithic)
 * Coverage for: create, read, update, delete operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as ProductImageService from '../../api/services/productImageService.js'

// Mock Repository using vi.hoisted to avoid hoisting issues
const mocks = vi.hoisted(() => ({
  findAll: vi.fn(),
  findPrimary: vi.fn(),
  findFirstAvailable: vi.fn(),
  findById: vi.fn(),
  findByHash: vi.fn(),
  create: vi.fn(),
  createBatch: vi.fn(),
  update: vi.fn(),
  unsetPrimary: vi.fn(),
  setPrimary: vi.fn(),
  softDelete: vi.fn(),
  reactivate: vi.fn(),
  softDeleteByProduct: vi.fn(),
  reactivateByProduct: vi.fn(),
  findByProductAndSize: vi.fn(),
  deleteBySize: vi.fn(),
  findImagesByProductIdsAndSize: vi.fn(),
  findFallbackImagesByProductIds: vi.fn()
}))

vi.mock('../../api/repositories/productImageRepository.js', () => mocks)

// Mock Supabase Client (still needed for product query in getProductWithImageSize)
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockIn = vi.fn()

const mockQueryBuilder = {
  select: mockSelect,
  eq: mockEq,
  single: mockSingle,
  in: mockIn
}

mockSelect.mockReturnValue(mockQueryBuilder)
mockEq.mockReturnValue(mockQueryBuilder)
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
    mockSelect.mockReturnValue(mockQueryBuilder)
  })

  describe('getProductImages', () => {
    it('should return all images for a product', async () => {
      const images = [{ id: 1, product_id: 1, url: 'test.jpg' }]
      mocks.findAll.mockResolvedValue(images)

      const result = await ProductImageService.getProductImages(1)

      expect(result).toEqual(images)
      expect(mocks.findAll).toHaveBeenCalledWith(1, {})
    })

    it('should filter by size', async () => {
      const images = [{ id: 1, product_id: 1, size: 'medium' }]
      mocks.findAll.mockResolvedValue(images)

      await ProductImageService.getProductImages(1, { size: 'medium' })

      expect(mocks.findAll).toHaveBeenCalledWith(1, { size: 'medium' })
    })

    it('should throw BadRequestError for invalid productId', async () => {
      await expect(ProductImageService.getProductImages('invalid')).rejects.toThrow(
        'Invalid product ID'
      )
    })

    it('should throw NotFoundError when no images found', async () => {
      mocks.findAll.mockResolvedValue([])

      await expect(ProductImageService.getProductImages(1)).rejects.toThrow(
        'Product images with ID 1 not found'
      )
    })
  })

  describe('getPrimaryImage', () => {
    it('should return primary image', async () => {
      const image = { id: 1, is_primary: true }
      mocks.findPrimary.mockResolvedValue(image)

      const result = await ProductImageService.getPrimaryImage(1)

      expect(result).toEqual(image)
      expect(mocks.findPrimary).toHaveBeenCalledWith(1)
    })

    it('should fallback to first image if primary not found', async () => {
      mocks.findPrimary.mockResolvedValue(null)
      const fallbackImage = { id: 2, is_primary: false }
      mocks.findFirstAvailable.mockResolvedValue(fallbackImage)

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

      mocks.create.mockResolvedValue(createdImage)

      const result = await ProductImageService.createImage(imageData)

      expect(result).toEqual(createdImage)
      expect(mocks.create).toHaveBeenCalled()
    })
  })

  describe('updateImage', () => {
    it('should update an image', async () => {
      const updates = { url: 'new-url.jpg' }
      const updatedImage = { id: 1, url: 'new-url.jpg' }

      mocks.update.mockResolvedValue(updatedImage)

      const result = await ProductImageService.updateImage(1, updates)

      expect(result).toEqual(updatedImage)
      expect(mocks.update).toHaveBeenCalledWith(1, expect.objectContaining(updates))
    })

    it('should throw BadRequestError if no updates provided', async () => {
      await expect(ProductImageService.updateImage(1, {})).rejects.toThrow('No updates provided')
    })
  })

  describe('deleteImage', () => {
    it('should soft delete an image', async () => {
      const deletedImage = { id: 1, active: false }

      mocks.softDelete.mockResolvedValue(deletedImage)

      const result = await ProductImageService.deleteImage(1)

      expect(result).toEqual(deletedImage)
      expect(mocks.softDelete).toHaveBeenCalledWith(1)
    })
  })

  describe('setPrimaryImage', () => {
    it('should set primary image', async () => {
      const newPrimary = { id: 1, is_primary: true }

      mocks.unsetPrimary.mockResolvedValue()
      mocks.setPrimary.mockResolvedValue(newPrimary)

      const result = await ProductImageService.setPrimaryImage(1, 1)

      expect(result).toEqual(newPrimary)
      expect(mocks.unsetPrimary).toHaveBeenCalledWith(1)
      expect(mocks.setPrimary).toHaveBeenCalledWith(1, 1)
    })
  })

  describe('createProductImagesAtomic', () => {
    it('should create multiple images atomically', async () => {
      const imagesData = [
        { size: 'medium', url: 'url1', file_hash: 'hash1' },
        { size: 'small', url: 'url2', file_hash: 'hash2' }
      ]
      const createdImages = imagesData.map((img, i) => ({ id: i + 1, ...img }))

      mocks.createBatch.mockResolvedValue(createdImages)

      const result = await ProductImageService.createProductImagesAtomic(1, 1, imagesData)

      expect(result).toEqual(createdImages)
      expect(mocks.createBatch).toHaveBeenCalled()
    })

    it('should throw BadRequestError for invalid input', async () => {
      await expect(ProductImageService.createProductImagesAtomic(1, 1, [])).rejects.toThrow(
        'Invalid imagesData'
      )
    })
  })

  describe('getProductsBatchWithImageSize', () => {
    it('should return products with images', async () => {
      const products = [
        { id: 1, name: 'P1' },
        { id: 2, name: 'P2' }
      ]
      const images = [
        { product_id: 1, url: 'url1', size: 'medium' },
        { product_id: 2, url: 'url2', size: 'medium' }
      ]

      // Mock products query (still direct supabase)
      mockSelect.mockReturnValue({
        in: vi.fn().mockResolvedValue({ data: products, error: null })
      })

      // Mock images query (repo)
      mocks.findImagesByProductIdsAndSize.mockResolvedValue(images)

      const result = await ProductImageService.getProductsBatchWithImageSize([1, 2], 'medium')

      expect(result).toHaveLength(2)
      expect(result[0].image_url_medium).toBe('url1')
      expect(result[1].image_url_medium).toBe('url2')
    })
  })

  describe('deleteProductImagesSafe', () => {
    it('should soft delete all images for product', async () => {
      const deletedImages = [{ id: 1 }, { id: 2 }]
      mocks.softDeleteByProduct.mockResolvedValue(deletedImages)

      const result = await ProductImageService.deleteProductImagesSafe(1)

      expect(result.success).toBe(true)
      expect(mocks.softDeleteByProduct).toHaveBeenCalledWith(1)
    })
  })

  describe('reactivateProductImages', () => {
    it('should reactivate all images for product', async () => {
      const reactivatedImages = [{ id: 1 }, { id: 2 }]
      mocks.reactivateByProduct.mockResolvedValue(reactivatedImages)

      const result = await ProductImageService.reactivateProductImages(1)

      expect(result.success).toBe(true)
      expect(mocks.reactivateByProduct).toHaveBeenCalledWith(1)
    })
  })

  describe('deleteProductImagesBySize', () => {
    it('should delete images by size', async () => {
      const deletedImages = [{ id: 1 }]
      mocks.deleteBySize.mockResolvedValue(deletedImages)

      const result = await ProductImageService.deleteProductImagesBySize(1, 'medium')

      expect(result.success).toBe(true)
      expect(mocks.deleteBySize).toHaveBeenCalledWith(1, 'medium')
    })
  })

  describe('getImagesByHash', () => {
    it('should return images by hash', async () => {
      const images = [{ id: 1, file_hash: 'hash123' }]
      mocks.findByHash.mockResolvedValue(images)

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
      mocks.findByProductAndSize.mockResolvedValue(image)

      const result = await ProductImageService.getProductImageBySize(1, 'medium')
      expect(result).toEqual(image)
    })

    it('should throw NotFoundError when not found', async () => {
      mocks.findByProductAndSize.mockResolvedValue(null)

      await expect(ProductImageService.getProductImageBySize(1, 'medium')).rejects.toThrow(
        'No medium image found'
      )
    })
  })

  describe('getProductWithImageSize', () => {
    it('should return product with image url', async () => {
      const product = { id: 1, name: 'Product 1' }
      const image = { url: 'http://example.com/img.jpg' }

      // Mock product query (direct supabase)
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: product, error: null })
        })
      })

      // Mock image query (repo)
      mocks.findByProductAndSize.mockResolvedValue(image)

      const result = await ProductImageService.getProductWithImageSize(1, 'medium')

      expect(result).toEqual({ ...product, image_url_medium: image.url })
    })
  })
})
