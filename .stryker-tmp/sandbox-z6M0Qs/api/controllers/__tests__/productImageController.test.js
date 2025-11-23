/**
 * Procesado por B
 */
// @ts-nocheck

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getProductImages,
  getPrimaryImage,
  createProductImages,
  deleteImagesByIndex,
  setPrimaryImage
} from '../../controllers/productImageController.js'

// Mock dependencies
vi.mock('../../services/productImageService.js', () => ({
  getProductImages: vi.fn(),
  getPrimaryImage: vi.fn(),
  createProductImagesAtomic: vi.fn(),
  deleteImagesByIndex: vi.fn(),
  setPrimaryImage: vi.fn()
}))

vi.mock('../../utils/imageProcessor.js', () => ({
  processImage: vi.fn(),
  generateFilename: vi.fn()
}))

vi.mock('../../services/supabaseStorageService.js', () => ({
  uploadImageSizes: vi.fn()
}))

vi.mock('../../services/validation/ValidatorService.js', () => ({
  ValidatorService: {
    validateId: vi.fn()
  }
}))

vi.mock('../../middleware/error/index.js', () => ({
  asyncHandler: vi.fn(fn => fn)
}))

import * as productImageService from '../../services/productImageService.js'
import { processImage, generateFilename } from '../../utils/imageProcessor.js'
import { uploadImageSizes } from '../../services/supabaseStorageService.js'
import { ValidatorService } from '../../services/validation/ValidatorService.js'

// Mock response and request objects
const mockResponse = () => {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

const mockRequest = (overrides = {}) => ({
  query: {},
  params: {},
  body: {},
  file: null,
  user: null,
  ...overrides
})

describe('Product Image Controller - Unit Tests with DI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getProductImages', () => {
    it('should get all product images successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        query: { size: 'medium' }
      })
      const res = mockResponse()
      const mockImages = [
        { id: 1, size: 'medium', url: 'https://example.com/image1.webp' },
        { id: 2, size: 'medium', url: 'https://example.com/image2.webp' }
      ]

      ValidatorService.validateId.mockReturnValue(1)
      productImageService.getProductImages.mockResolvedValue(mockImages)

      await getProductImages(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'productId')
      expect(productImageService.getProductImages).toHaveBeenCalledWith(1, { size: 'medium' })
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockImages,
        message: 'Images retrieved successfully'
      })
    })

    it('should get all product images without size filter', async () => {
      const req = mockRequest({ params: { id: '2' } })
      const res = mockResponse()
      const mockImages = [
        { id: 1, size: 'thumb', url: 'https://example.com/thumb.webp' },
        { id: 2, size: 'small', url: 'https://example.com/small.webp' }
      ]

      ValidatorService.validateId.mockReturnValue(2)
      productImageService.getProductImages.mockResolvedValue(mockImages)

      await getProductImages(req, res)

      expect(productImageService.getProductImages).toHaveBeenCalledWith(2, {})
    })

    it('should handle service errors', async () => {
      const req = mockRequest({ params: { id: '1' } })
      const res = mockResponse()
      const error = new Error('Database error')

      ValidatorService.validateId.mockReturnValue(1)
      productImageService.getProductImages.mockRejectedValue(error)

      await expect(getProductImages(req, res)).rejects.toThrow('Database error')
    })
  })

  describe('getPrimaryImage', () => {
    it('should get primary image successfully', async () => {
      const req = mockRequest({ params: { id: '1' } })
      const res = mockResponse()
      const mockImage = {
        id: 1,
        size: 'medium',
        url: 'https://example.com/primary.webp',
        is_primary: true
      }

      ValidatorService.validateId.mockReturnValue(1)
      productImageService.getPrimaryImage.mockResolvedValue(mockImage)

      await getPrimaryImage(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'productId')
      expect(productImageService.getPrimaryImage).toHaveBeenCalledWith(1)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockImage,
        message: 'Primary image retrieved successfully'
      })
    })

    it('should handle service errors', async () => {
      const req = mockRequest({ params: { id: '1' } })
      const res = mockResponse()
      const error = new Error('No primary image found')

      ValidatorService.validateId.mockReturnValue(1)
      productImageService.getPrimaryImage.mockRejectedValue(error)

      await expect(getPrimaryImage(req, res)).rejects.toThrow('No primary image found')
    })
  })

  describe('createProductImages - File Upload Flow', () => {
    const mockFileBuffer = Buffer.from('fake image data')
    const mockProcessedImage = {
      fileHash: 'abc123hash',
      sizes: {
        thumb: Buffer.from('thumb data'),
        small: Buffer.from('small data'),
        medium: Buffer.from('medium data'),
        large: Buffer.from('large data')
      }
    }
    const mockUrls = {
      thumb: 'https://storage.example.com/thumb/product_1_1_abc123.webp',
      small: 'https://storage.example.com/small/product_1_1_abc123.webp',
      medium: 'https://storage.example.com/medium/product_1_1_abc123.webp',
      large: 'https://storage.example.com/large/product_1_1_abc123.webp'
    }
    const mockCreatedImages = [
      { id: 1, size: 'thumb', url: mockUrls.thumb },
      { id: 2, size: 'small', url: mockUrls.small },
      { id: 3, size: 'medium', url: mockUrls.medium },
      { id: 4, size: 'large', url: mockUrls.large }
    ]

    beforeEach(() => {
      processImage.mockResolvedValue(mockProcessedImage)
      generateFilename.mockReturnValue('product_1_1_abc123')
      uploadImageSizes.mockResolvedValue(mockUrls)
      productImageService.getProductImages.mockResolvedValue([])
      productImageService.createProductImagesAtomic.mockResolvedValue(mockCreatedImages)
    })

    it('should create product images via file upload successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        file: { buffer: mockFileBuffer },
        body: { image_index: '1', is_primary: 'true' }
      })
      const res = mockResponse()

      ValidatorService.validateId.mockReturnValue(1)

      await createProductImages(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'productId')
      expect(productImageService.getProductImages).toHaveBeenCalledWith(1)
      expect(processImage).toHaveBeenCalledWith(mockFileBuffer, {
        maxSizeBytes: 4 * 1024 * 1024,
        minWidth: 500,
        minHeight: 500
      })
      expect(generateFilename).toHaveBeenCalledWith('product', 1, 1, '', 'abc123hash')
      expect(uploadImageSizes).toHaveBeenCalledWith(mockProcessedImage.sizes, 'product_1_1_abc123')
      expect(productImageService.createProductImagesAtomic).toHaveBeenCalledWith(
        1,
        1,
        [
          { size: 'thumb', url: mockUrls.thumb, file_hash: 'abc123hash', mime_type: 'image/webp' },
          { size: 'small', url: mockUrls.small, file_hash: 'abc123hash', mime_type: 'image/webp' },
          {
            size: 'medium',
            url: mockUrls.medium,
            file_hash: 'abc123hash',
            mime_type: 'image/webp'
          },
          { size: 'large', url: mockUrls.large, file_hash: 'abc123hash', mime_type: 'image/webp' }
        ],
        true
      )
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedImages,
        message: 'Product image uploaded successfully'
      })
    })

    it('should create product images with is_primary as boolean', async () => {
      const req = mockRequest({
        params: { id: '1' },
        file: { buffer: mockFileBuffer },
        body: { image_index: '2', is_primary: true }
      })
      const res = mockResponse()

      ValidatorService.validateId.mockReturnValue(1)

      await createProductImages(req, res)

      expect(productImageService.createProductImagesAtomic).toHaveBeenCalledWith(
        1,
        2,
        expect.any(Array),
        true
      )
    })

    it('should create product images with default is_primary false', async () => {
      const req = mockRequest({
        params: { id: '1' },
        file: { buffer: mockFileBuffer },
        body: { image_index: '3' }
      })
      const res = mockResponse()

      ValidatorService.validateId.mockReturnValue(1)

      await createProductImages(req, res)

      expect(productImageService.createProductImagesAtomic).toHaveBeenCalledWith(
        1,
        3,
        expect.any(Array),
        false
      )
    })

    it('should throw error for invalid image_index', async () => {
      const req = mockRequest({
        params: { id: '1' },
        file: { buffer: mockFileBuffer },
        body: { image_index: '6' } // Invalid: > 5
      })
      const res = mockResponse()

      ValidatorService.validateId.mockReturnValue(1)

      await expect(createProductImages(req, res)).rejects.toThrow(
        'image_index must be between 1 and 5'
      )
    })

    it('should throw error when image_index already exists', async () => {
      const req = mockRequest({
        params: { id: '1' },
        file: { buffer: mockFileBuffer },
        body: { image_index: '1' }
      })
      const res = mockResponse()

      ValidatorService.validateId.mockReturnValue(1)
      productImageService.getProductImages.mockResolvedValue([{ image_index: 1, size: 'medium' }])

      await expect(createProductImages(req, res)).rejects.toThrow(
        'Product 1 already has an image at index 1. Delete it first or use a different index.'
      )
    })

    it('should throw error when product has maximum images', async () => {
      const req = mockRequest({
        params: { id: '1' },
        file: { buffer: mockFileBuffer },
        body: { image_index: '1' }
      })
      const res = mockResponse()

      ValidatorService.validateId.mockReturnValue(1)
      productImageService.getProductImages.mockResolvedValue([
        { image_index: 1 },
        { image_index: 2 },
        { image_index: 3 },
        { image_index: 4 },
        { image_index: 5 }
      ])

      await expect(createProductImages(req, res)).rejects.toThrow(
        'Product 1 already has 5 images (maximum allowed). Delete one before adding a new image.'
      )
    })

    it('should handle image processing errors', async () => {
      const req = mockRequest({
        params: { id: '1' },
        file: { buffer: mockFileBuffer },
        body: { image_index: '1' }
      })
      const res = mockResponse()

      ValidatorService.validateId.mockReturnValue(1)
      processImage.mockRejectedValue(new Error('Image processing failed'))

      await expect(createProductImages(req, res)).rejects.toThrow('Image processing failed')
    })

    it('should handle upload errors', async () => {
      const req = mockRequest({
        params: { id: '1' },
        file: { buffer: mockFileBuffer },
        body: { image_index: '1' }
      })
      const res = mockResponse()

      ValidatorService.validateId.mockReturnValue(1)
      uploadImageSizes.mockRejectedValue(new Error('Upload failed'))

      await expect(createProductImages(req, res)).rejects.toThrow('Upload failed')
    })
  })

  describe('createProductImages - JSON Body Flow', () => {
    it('should create product images via JSON body successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: {
          image_index: 1,
          images: [
            { size: 'thumb', url: 'https://example.com/thumb.webp', file_hash: 'hash1' },
            { size: 'small', url: 'https://example.com/small.webp', file_hash: 'hash1' }
          ],
          is_primary: true
        }
      })
      const res = mockResponse()
      const mockCreatedImages = [
        { id: 1, size: 'thumb' },
        { id: 2, size: 'small' }
      ]

      ValidatorService.validateId.mockReturnValue(1)
      productImageService.createProductImagesAtomic.mockResolvedValue(mockCreatedImages)

      await createProductImages(req, res)

      expect(productImageService.createProductImagesAtomic).toHaveBeenCalledWith(
        1,
        1,
        [
          { size: 'thumb', url: 'https://example.com/thumb.webp', file_hash: 'hash1' },
          { size: 'small', url: 'https://example.com/small.webp', file_hash: 'hash1' }
        ],
        true
      )
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedImages,
        message: 'Product image created successfully'
      })
    })

    it('should throw error for invalid image_index in JSON', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: {
          image_index: 6, // Invalid
          images: [{ size: 'thumb', url: 'test', file_hash: 'hash' }]
        }
      })
      const res = mockResponse()

      ValidatorService.validateId.mockReturnValue(1)

      await expect(createProductImages(req, res)).rejects.toThrow(
        'image_index must be between 1 and 5'
      )
    })

    it('should throw error for empty images array', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: {
          image_index: 1,
          images: [] // Empty
        }
      })
      const res = mockResponse()

      ValidatorService.validateId.mockReturnValue(1)

      await expect(createProductImages(req, res)).rejects.toThrow(
        'images must be a non-empty array'
      )
    })

    it('should default is_primary to false when not provided', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: {
          image_index: 1,
          images: [{ size: 'thumb', url: 'test', file_hash: 'hash' }]
        }
      })
      const res = mockResponse()

      ValidatorService.validateId.mockReturnValue(1)
      productImageService.createProductImagesAtomic.mockResolvedValue([])

      await createProductImages(req, res)

      expect(productImageService.createProductImagesAtomic).toHaveBeenCalledWith(
        1,
        1,
        [{ size: 'thumb', url: 'test', file_hash: 'hash' }],
        false
      )
    })
  })

  describe('deleteImagesByIndex', () => {
    it('should delete images by index successfully', async () => {
      const req = mockRequest({
        params: { id: '1', imageIndex: '2' }
      })
      const res = mockResponse()
      const mockDeletedImages = [
        { id: 1, size: 'thumb' },
        { id: 2, size: 'small' },
        { id: 3, size: 'medium' },
        { id: 4, size: 'large' }
      ]

      ValidatorService.validateId.mockReturnValueOnce(1)
      ValidatorService.validateId.mockReturnValueOnce(2)
      productImageService.deleteImagesByIndex.mockResolvedValue(mockDeletedImages)

      await deleteImagesByIndex(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'productId')
      expect(ValidatorService.validateId).toHaveBeenCalledWith('2', 'imageIndex')
      expect(productImageService.deleteImagesByIndex).toHaveBeenCalledWith(1, 2)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { deleted_count: 4 },
        message: 'Product image deleted successfully'
      })
    })

    it('should handle service errors', async () => {
      const req = mockRequest({
        params: { id: '1', imageIndex: '1' }
      })
      const res = mockResponse()
      const error = new Error('Delete failed')

      ValidatorService.validateId.mockReturnValue(1)
      productImageService.deleteImagesByIndex.mockRejectedValue(error)

      await expect(deleteImagesByIndex(req, res)).rejects.toThrow('Delete failed')
    })
  })

  describe('setPrimaryImage', () => {
    it('should set primary image successfully', async () => {
      const req = mockRequest({
        params: { id: '1', imageIndex: '2' }
      })
      const res = mockResponse()
      const mockPrimaryImage = {
        id: 3,
        product_id: 1,
        image_index: 2,
        size: 'medium',
        is_primary: true
      }

      ValidatorService.validateId.mockReturnValueOnce(1)
      ValidatorService.validateId.mockReturnValueOnce(2)
      productImageService.setPrimaryImage.mockResolvedValue(mockPrimaryImage)

      await setPrimaryImage(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'productId')
      expect(ValidatorService.validateId).toHaveBeenCalledWith('2', 'imageIndex')
      expect(productImageService.setPrimaryImage).toHaveBeenCalledWith(1, 2)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPrimaryImage,
        message: 'Primary image set successfully'
      })
    })

    it('should handle service errors', async () => {
      const req = mockRequest({
        params: { id: '1', imageIndex: '1' }
      })
      const res = mockResponse()
      const error = new Error('Set primary failed')

      ValidatorService.validateId.mockReturnValue(1)
      productImageService.setPrimaryImage.mockRejectedValue(error)

      await expect(setPrimaryImage(req, res)).rejects.toThrow('Set primary failed')
    })
  })

  describe('Error handling and validation', () => {
    it('should handle ValidatorService errors', async () => {
      const req = mockRequest({ params: { id: 'invalid' } })
      const res = mockResponse()

      ValidatorService.validateId.mockImplementation(() => {
        throw new Error('Invalid ID format')
      })

      await expect(getProductImages(req, res)).rejects.toThrow('Invalid ID format')
    })

    it('should handle missing file in upload flow', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { image_index: '1' }
        // No file
      })
      const res = mockResponse()

      ValidatorService.validateId.mockReturnValue(1)

      // Should fall through to JSON body flow and fail validation
      await expect(createProductImages(req, res)).rejects.toThrow(
        'image_index must be between 1 and 5'
      )
    })

    it('should handle invalid image_index type in file upload', async () => {
      const req = mockRequest({
        params: { id: '1' },
        file: { buffer: Buffer.from('test') },
        body: { image_index: 'invalid' }
      })
      const res = mockResponse()

      ValidatorService.validateId.mockReturnValue(1)

      await expect(createProductImages(req, res)).rejects.toThrow(
        'image_index must be between 1 and 5'
      )
    })
  })
})
