/**
 * Product Controller Unit Tests
 * Following CLAUDE.md test validation rules
 */
// @ts-nocheck

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getAllProducts,
  getProductById,
  getProductBySku,
  getCarouselProducts,
  getProductsWithOccasions,
  getProductsByOccasion,
  createProduct,
  createProductWithOccasions,
  updateProduct,
  updateCarouselOrder,
  updateStock,
  deleteProduct,
  reactivateProduct,
  getProductOccasions,
  linkProductOccasion,
  replaceProductOccasions
} from '../productController.js'

// Mock dependencies
vi.mock('../../services/productService.js', () => ({
  getAllProducts: vi.fn(),
  getProductById: vi.fn(),
  getProductBySku: vi.fn(),
  getCarouselProducts: vi.fn(),
  getProductsWithOccasions: vi.fn(),
  getProductsByOccasion: vi.fn(),
  createProduct: vi.fn(),
  createProductWithOccasions: vi.fn(),
  updateProduct: vi.fn(),
  updateCarouselOrder: vi.fn(),
  updateStock: vi.fn(),
  deleteProduct: vi.fn(),
  reactivateProduct: vi.fn(),
  getProductOccasions: vi.fn(),
  linkProductOccasion: vi.fn(),
  replaceProductOccasions: vi.fn()
}))

vi.mock('../../services/carouselService.js', () => ({
  resolveCarouselOrderConflict: vi.fn()
}))

vi.mock('../../middleware/error/index.js', () => ({
  asyncHandler: vi.fn(fn => fn)
}))

vi.mock('../../errors/AppError.js', () => ({
  BadRequestError: class BadRequestError extends Error {
    constructor(message, context = {}) {
      super(message)
      this.name = 'BadRequestError'
      this.context = context
    }
  }
}))

import * as productService from '../../services/productService.js'
import * as carouselService from '../../services/carouselService.js'

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
  user: null,
  ...overrides
})

describe('Product Controller - Unit Tests with DI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getAllProducts', () => {
    it('should get all products successfully', async () => {
      const req = mockRequest({
        query: { featured: 'true', sku: 'TEST-001', search: 'rose' }
      })
      const res = mockResponse()
      const mockProducts = [
        { id: 1, name: 'Red Rose', price_usd: 25.99 },
        { id: 2, name: 'White Rose', price_usd: 29.99 }
      ]

      productService.getAllProducts.mockResolvedValue(mockProducts)

      await getAllProducts(req, res)

      expect(productService.getAllProducts).toHaveBeenCalledWith(
        {
          featured: true,
          sku: 'TEST-001',
          search: 'rose',
          occasion: undefined,
          sortBy: undefined,
          limit: undefined,
          offset: undefined
        },
        false,
        null
      )
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProducts,
        message: 'Products retrieved successfully'
      })
    })

    it('should handle admin includeDeactivated parameter', async () => {
      const req = mockRequest({
        query: { includeDeactivated: 'true' },
        user: { role: 'admin' }
      })
      const res = mockResponse()
      const mockProducts = [{ id: 1, name: 'Deactivated Product', active: false }]

      productService.getAllProducts.mockResolvedValue(mockProducts)

      await getAllProducts(req, res)

      expect(productService.getAllProducts).toHaveBeenCalledWith(expect.any(Object), true, null)
    })

    it('should validate imageSize parameter', async () => {
      const req = mockRequest({
        query: { imageSize: 'medium' }
      })
      const res = mockResponse()
      const mockProducts = []

      productService.getAllProducts.mockResolvedValue(mockProducts)

      await getAllProducts(req, res)

      expect(productService.getAllProducts).toHaveBeenCalledWith(
        expect.any(Object),
        false,
        'medium'
      )
    })

    it('should reject invalid imageSize', async () => {
      const req = mockRequest({
        query: { imageSize: 'invalid' }
      })
      const res = mockResponse()

      await expect(getAllProducts(req, res)).rejects.toThrow()
    })
  })

  describe('getProductById', () => {
    it('should get product by ID successfully', async () => {
      const req = mockRequest({
        params: { id: '1' }
      })
      const res = mockResponse()
      const mockProduct = { id: 1, name: 'Red Rose', price_usd: 25.99 }

      productService.getProductById.mockResolvedValue(mockProduct)

      await getProductById(req, res)

      expect(productService.getProductById).toHaveBeenCalledWith(1, false, null)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
        message: 'Product retrieved successfully'
      })
    })

    it('should handle imageSize parameter', async () => {
      const req = mockRequest({
        params: { id: '1' },
        query: { imageSize: 'large' }
      })
      const res = mockResponse()
      const mockProduct = { id: 1, name: 'Red Rose' }

      productService.getProductById.mockResolvedValue(mockProduct)

      await getProductById(req, res)

      expect(productService.getProductById).toHaveBeenCalledWith(1, false, 'large')
    })

    it('should throw error for invalid ID', async () => {
      const req = mockRequest({
        params: { id: 'invalid' }
      })
      const res = mockResponse()

      await expect(getProductById(req, res)).rejects.toThrow()
    })
  })

  describe('getProductBySku', () => {
    it('should get product by SKU successfully', async () => {
      const req = mockRequest({
        params: { sku: 'TEST-001' }
      })
      const res = mockResponse()
      const mockProduct = { id: 1, sku: 'TEST-001', name: 'Test Product' }

      productService.getProductBySku.mockResolvedValue(mockProduct)

      await getProductBySku(req, res)

      expect(productService.getProductBySku).toHaveBeenCalledWith('TEST-001')
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
        message: 'Product retrieved successfully'
      })
    })
  })

  describe('getCarouselProducts', () => {
    it('should get carousel products successfully', async () => {
      const req = mockRequest()
      const res = mockResponse()
      const mockProducts = [
        { id: 1, featured: true, carousel_order: 1 },
        { id: 2, featured: true, carousel_order: 2 }
      ]

      productService.getCarouselProducts.mockResolvedValue(mockProducts)

      await getCarouselProducts(req, res)

      expect(productService.getCarouselProducts).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProducts,
        message: 'Carousel products retrieved successfully'
      })
    })
  })

  describe('getProductsWithOccasions', () => {
    it('should get products with occasions successfully', async () => {
      const req = mockRequest({
        query: { limit: '10', offset: '0' }
      })
      const res = mockResponse()
      const mockProducts = [{ id: 1, occasions: ['Birthday', 'Wedding'] }]

      productService.getProductsWithOccasions.mockResolvedValue(mockProducts)

      await getProductsWithOccasions(req, res)

      expect(productService.getProductsWithOccasions).toHaveBeenCalledWith(10, 0)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProducts,
        message: 'Products with occasions retrieved successfully'
      })
    })

    it('should use default limit and offset', async () => {
      const req = mockRequest()
      const res = mockResponse()
      const mockProducts = []

      productService.getProductsWithOccasions.mockResolvedValue(mockProducts)

      await getProductsWithOccasions(req, res)

      expect(productService.getProductsWithOccasions).toHaveBeenCalledWith(50, 0)
    })

    it('should throw error for invalid limit', async () => {
      const req = mockRequest({
        query: { limit: 'invalid' }
      })
      const res = mockResponse()

      await expect(getProductsWithOccasions(req, res)).rejects.toThrow('Invalid limit')
    })

    it('should throw error for limit > 1000', async () => {
      const req = mockRequest({
        query: { limit: '1001' }
      })
      const res = mockResponse()

      await expect(getProductsWithOccasions(req, res)).rejects.toThrow('Invalid limit')
    })

    it('should throw error for negative offset', async () => {
      const req = mockRequest({
        query: { offset: '-1' }
      })
      const res = mockResponse()

      await expect(getProductsWithOccasions(req, res)).rejects.toThrow('Invalid offset')
    })
  })

  describe('getProductsByOccasion', () => {
    it('should get products by occasion successfully', async () => {
      const req = mockRequest({
        params: { occasionId: '1' },
        query: { limit: '20' }
      })
      const res = mockResponse()
      const mockProducts = [{ id: 1, name: 'Wedding Bouquet' }]

      productService.getProductsByOccasion.mockResolvedValue(mockProducts)

      await getProductsByOccasion(req, res)

      expect(productService.getProductsByOccasion).toHaveBeenCalledWith('1', 20)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProducts,
        message: 'Products retrieved successfully'
      })
    })

    it('should use default limit', async () => {
      const req = mockRequest({
        params: { occasionId: '1' }
      })
      const res = mockResponse()
      const mockProducts = []

      productService.getProductsByOccasion.mockResolvedValue(mockProducts)

      await getProductsByOccasion(req, res)

      expect(productService.getProductsByOccasion).toHaveBeenCalledWith('1', 50)
    })

    it('should throw error for invalid limit', async () => {
      const req = mockRequest({
        params: { occasionId: '1' },
        query: { limit: '0' }
      })
      const res = mockResponse()

      await expect(getProductsByOccasion(req, res)).rejects.toThrow('Invalid limit')
    })
  })

  describe('createProduct', () => {
    it('should create product successfully', async () => {
      const req = mockRequest({
        body: {
          name: 'New Product',
          price_usd: 39.99,
          stock: 10
        }
      })
      const res = mockResponse()
      const mockProduct = { id: 1, ...req.body }

      productService.createProduct.mockResolvedValue(mockProduct)

      await createProduct(req, res)

      expect(productService.createProduct).toHaveBeenCalledWith(req.body)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
        message: 'Product created successfully'
      })
    })

    it('should resolve carousel conflicts before creating featured product', async () => {
      const req = mockRequest({
        body: {
          name: 'Featured Product',
          price_usd: 49.99,
          featured: true,
          carousel_order: 3
        }
      })
      const res = mockResponse()
      const mockProduct = { id: 1, ...req.body }

      carouselService.resolveCarouselOrderConflict.mockResolvedValue(true)
      productService.createProduct.mockResolvedValue(mockProduct)

      await createProduct(req, res)

      expect(carouselService.resolveCarouselOrderConflict).toHaveBeenCalledWith(3, null)
      expect(productService.createProduct).toHaveBeenCalledWith(req.body)
    })
  })

  describe('createProductWithOccasions', () => {
    it('should create product with occasions successfully', async () => {
      const req = mockRequest({
        body: {
          product: {
            name: 'Wedding Bouquet',
            price_usd: 99.99
          },
          occasionIds: [1, 2, 3]
        }
      })
      const res = mockResponse()
      const mockResult = { id: 1, occasions: [1, 2, 3] }

      productService.createProductWithOccasions.mockResolvedValue(mockResult)

      await createProductWithOccasions(req, res)

      expect(productService.createProductWithOccasions).toHaveBeenCalledWith(
        req.body.product,
        req.body.occasionIds
      )
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Product with occasions created successfully'
      })
    })
  })

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { name: 'Updated Product', price_usd: 34.99 }
      })
      const res = mockResponse()
      const mockProduct = { id: 1, ...req.body }

      productService.updateProduct.mockResolvedValue(mockProduct)

      await updateProduct(req, res)

      expect(productService.updateProduct).toHaveBeenCalledWith(1, req.body)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
        message: 'Product updated successfully'
      })
    })

    it('should resolve carousel conflicts before updating', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { featured: true, carousel_order: 2 }
      })
      const res = mockResponse()
      const mockProduct = { id: 1, ...req.body }

      carouselService.resolveCarouselOrderConflict.mockResolvedValue(true)
      productService.updateProduct.mockResolvedValue(mockProduct)

      await updateProduct(req, res)

      expect(carouselService.resolveCarouselOrderConflict).toHaveBeenCalledWith(2, 1)
    })
  })

  describe('updateCarouselOrder', () => {
    it('should update carousel order successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { order: 5 }
      })
      const res = mockResponse()
      const mockResult = { id: 1, carousel_order: 5 }

      productService.updateCarouselOrder.mockResolvedValue(mockResult)

      await updateCarouselOrder(req, res)

      expect(productService.updateCarouselOrder).toHaveBeenCalledWith(1, 5)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Carousel order updated successfully'
      })
    })
  })

  describe('updateStock', () => {
    it('should update stock successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { quantity: 100 }
      })
      const res = mockResponse()
      const mockProduct = { id: 1, stock: 100 }

      productService.updateStock.mockResolvedValue(mockProduct)

      await updateStock(req, res)

      expect(productService.updateStock).toHaveBeenCalledWith(1, 100)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
        message: 'Stock updated successfully'
      })
    })
  })

  describe('deleteProduct', () => {
    it('should soft-delete product successfully', async () => {
      const req = mockRequest({
        params: { id: '1' }
      })
      const res = mockResponse()
      const mockProduct = { id: 1, active: false }

      productService.deleteProduct.mockResolvedValue(mockProduct)

      await deleteProduct(req, res)

      expect(productService.deleteProduct).toHaveBeenCalledWith(1)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
        message: 'Product deactivated successfully'
      })
    })
  })

  describe('reactivateProduct', () => {
    it('should reactivate product successfully', async () => {
      const req = mockRequest({
        params: { id: '1' }
      })
      const res = mockResponse()
      const mockProduct = { id: 1, active: true }

      productService.reactivateProduct.mockResolvedValue(mockProduct)

      await reactivateProduct(req, res)

      expect(productService.reactivateProduct).toHaveBeenCalledWith(1)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
        message: 'Product reactivated successfully'
      })
    })
  })

  describe('getProductOccasions', () => {
    it('should get product occasions successfully', async () => {
      const req = mockRequest({
        params: { id: '1' }
      })
      const res = mockResponse()
      const mockOccasions = [
        { id: 1, name: 'Wedding' },
        { id: 2, name: 'Birthday' }
      ]

      productService.getProductOccasions.mockResolvedValue(mockOccasions)

      await getProductOccasions(req, res)

      expect(productService.getProductOccasions).toHaveBeenCalledWith(1)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOccasions,
        message: 'Product occasions retrieved successfully'
      })
    })
  })

  describe('linkProductOccasion', () => {
    it('should link product occasion successfully', async () => {
      const req = mockRequest({
        params: { id: '1', occasionId: '2' }
      })
      const res = mockResponse()
      const mockResult = { product_id: 1, occasion_id: 2 }

      productService.linkProductOccasion.mockResolvedValue(mockResult)

      await linkProductOccasion(req, res)

      expect(productService.linkProductOccasion).toHaveBeenCalledWith(1, '2')
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Occasion linked to product successfully'
      })
    })
  })

  describe('replaceProductOccasions', () => {
    it('should replace product occasions successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { occasion_ids: [1, 2, 3] }
      })
      const res = mockResponse()
      const mockResult = { product_id: 1, occasion_ids: [1, 2, 3] }

      productService.replaceProductOccasions.mockResolvedValue(mockResult)

      await replaceProductOccasions(req, res)

      expect(productService.replaceProductOccasions).toHaveBeenCalledWith(1, [1, 2, 3])
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Product occasions updated successfully'
      })
    })
  })
})
