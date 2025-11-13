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
} from '../../controllers/productController.js'

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

vi.mock('../../services/ProductCacheService.js', () => ({
  getProductCacheService: vi.fn(() => ({
    getAllProducts: vi.fn(),
    getProductById: vi.fn(),
    getFeaturedProducts: vi.fn(),
    invalidateAllProducts: vi.fn(),
    invalidateProduct: vi.fn(),
    invalidateFeatured: vi.fn()
  }))
}))

vi.mock('../../services/validation/ValidatorService.js', () => ({
  ValidatorService: {
    validateId: vi.fn(),
    validateEnum: vi.fn()
  }
}))

vi.mock('../../architecture/di-container.js', () => ({
  default: {
    resolve: vi.fn(name => {
      if (name === 'ProductRepository') {
        return {
          findBySku: vi.fn(),
          updateCarouselOrder: vi.fn(),
          delete: vi.fn(),
          reactivate: vi.fn(),
          updateStock: vi.fn()
        }
      }
      if (name === 'OccasionRepository') {
        return {
          findBySlug: vi.fn()
        }
      }
      return {}
    })
  }
}))

vi.mock('../../middleware/error/index.js', () => ({
  asyncHandler: vi.fn(fn => fn),
  withErrorMapping: vi.fn(fn => fn)
}))

import * as productService from '../../services/productService.js'
import * as carouselService from '../../services/carouselService.js'
import { ValidatorService } from '../../services/validation/ValidatorService.js'

// Note: asyncHandler is mocked above, but imported here for reference

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
    it('should get all products with default filters', async () => {
      const req = mockRequest()
      const res = mockResponse()
      const mockProducts = [
        { id: 1, name: 'Product 1', price_usd: 10.99 },
        { id: 2, name: 'Product 2', price_usd: 15.99 }
      ]

      productService.getAllProducts.mockResolvedValue(mockProducts)

      await getAllProducts(req, res)

      expect(productService.getAllProducts).toHaveBeenCalledWith(
        {
          featured: undefined,
          sku: undefined,
          search: undefined,
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

    it('should get all products with filters and admin user', async () => {
      const req = mockRequest({
        query: {
          featured: 'true',
          search: 'test',
          limit: '10',
          includeDeactivated: 'true',
          imageSize: 'small'
        },
        user: { role: 'admin' }
      })
      const res = mockResponse()
      const mockProducts = [{ id: 1, name: 'Test Product' }]

      productService.getAllProducts.mockResolvedValue(mockProducts)
      ValidatorService.validateEnum.mockReturnValue('small')

      await getAllProducts(req, res)

      expect(ValidatorService.validateEnum).toHaveBeenCalledWith(
        'small',
        ['small', 'medium', 'large', 'thumbnail'],
        'imageSize'
      )
      expect(productService.getAllProducts).toHaveBeenCalledWith(
        {
          featured: true,
          sku: undefined,
          search: 'test',
          occasion: undefined,
          sortBy: undefined,
          limit: '10',
          offset: undefined
        },
        true,
        'small'
      )
    })

    it('should handle service errors', async () => {
      const req = mockRequest()
      const res = mockResponse()
      const error = new Error('Database error')

      productService.getAllProducts.mockRejectedValue(error)

      await expect(getAllProducts(req, res)).rejects.toThrow('Database error')
    })
  })

  describe('getProductById', () => {
    it('should get product by ID successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        query: { imageSize: 'medium' }
      })
      const res = mockResponse()
      const mockProduct = { id: 1, name: 'Test Product', price_usd: 10.99 }

      ValidatorService.validateId.mockReturnValue(1)
      ValidatorService.validateEnum.mockReturnValue('medium')
      productService.getProductById.mockResolvedValue(mockProduct)

      await getProductById(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'productId')
      expect(ValidatorService.validateEnum).toHaveBeenCalledWith(
        'medium',
        ['small', 'medium', 'large', 'thumbnail'],
        'imageSize'
      )
      expect(productService.getProductById).toHaveBeenCalledWith(1, false, 'medium')
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
        message: 'Product retrieved successfully'
      })
    })

    it('should get product by ID without image size', async () => {
      const req = mockRequest({ params: { id: '2' } })
      const res = mockResponse()
      const mockProduct = { id: 2, name: 'Another Product' }

      ValidatorService.validateId.mockReturnValue(2)
      productService.getProductById.mockResolvedValue(mockProduct)

      await getProductById(req, res)

      expect(productService.getProductById).toHaveBeenCalledWith(2, false, null)
    })
  })

  describe('getProductBySku', () => {
    it('should get product by SKU successfully', async () => {
      const req = mockRequest({ params: { sku: 'TEST-001' } })
      const res = mockResponse()
      const mockProduct = { id: 1, name: 'Test Product', sku: 'TEST-001' }

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
        { id: 1, name: 'Featured Product 1', carousel_order: 1 },
        { id: 2, name: 'Featured Product 2', carousel_order: 2 }
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
    it('should get products with occasions with default pagination', async () => {
      const req = mockRequest({ query: { featured: 'true' } })
      const res = mockResponse()
      const mockProducts = [{ id: 1, name: 'Product with occasions' }]

      productService.getProductsWithOccasions.mockResolvedValue(mockProducts)

      await getProductsWithOccasions(req, res)

      expect(productService.getProductsWithOccasions).toHaveBeenCalledWith(50, 0)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProducts,
        message: 'Products with occasions retrieved successfully'
      })
    })

    it('should get products with occasions with custom pagination', async () => {
      const req = mockRequest({ query: { limit: '20', offset: '10' } })
      const res = mockResponse()
      const mockProducts = [{ id: 1, name: 'Product 1' }]

      productService.getProductsWithOccasions.mockResolvedValue(mockProducts)

      await getProductsWithOccasions(req, res)

      expect(productService.getProductsWithOccasions).toHaveBeenCalledWith(20, 10)
    })

    it('should throw error for invalid limit', async () => {
      const req = mockRequest({ query: { limit: 'invalid' } })
      const res = mockResponse()

      await expect(getProductsWithOccasions(req, res)).rejects.toThrow(
        'Invalid limit: must be a positive number <= 1000'
      )
    })

    it('should throw error for invalid offset', async () => {
      const req = mockRequest({ query: { offset: '-1' } })
      const res = mockResponse()

      await expect(getProductsWithOccasions(req, res)).rejects.toThrow(
        'Invalid offset: must be a non-negative number'
      )
    })

    it('should throw error for limit too large', async () => {
      const req = mockRequest({ query: { limit: '2000' } })
      const res = mockResponse()

      await expect(getProductsWithOccasions(req, res)).rejects.toThrow(
        'Invalid limit: must be a positive number <= 1000'
      )
    })
  })

  describe('getProductsByOccasion', () => {
    it('should get products by occasion successfully', async () => {
      const req = mockRequest({
        params: { occasionId: '1' },
        query: { limit: '25' }
      })
      const res = mockResponse()
      const mockProducts = [{ id: 1, name: 'Occasion Product' }]

      productService.getProductsByOccasion.mockResolvedValue(mockProducts)

      await getProductsByOccasion(req, res)

      expect(productService.getProductsByOccasion).toHaveBeenCalledWith('1', 25)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProducts,
        message: 'Products retrieved successfully'
      })
    })

    it('should use default limit when not provided', async () => {
      const req = mockRequest({ params: { occasionId: '2' } })
      const res = mockResponse()
      const mockProducts = [{ id: 2, name: 'Another Product' }]

      productService.getProductsByOccasion.mockResolvedValue(mockProducts)

      await getProductsByOccasion(req, res)

      expect(productService.getProductsByOccasion).toHaveBeenCalledWith('2', 50)
    })

    it('should throw error for invalid limit', async () => {
      const req = mockRequest({
        params: { occasionId: '1' },
        query: { limit: '0' }
      })
      const res = mockResponse()

      await expect(getProductsByOccasion(req, res)).rejects.toThrow(
        'Invalid limit: must be a positive number <= 1000'
      )
    })
  })

  describe('createProduct', () => {
    it('should create product successfully', async () => {
      const req = mockRequest({
        body: {
          name: 'New Product',
          price_usd: 29.99,
          featured: true,
          carousel_order: 3
        }
      })
      const res = mockResponse()
      const mockProduct = { id: 1, name: 'New Product', price_usd: 29.99 }

      productService.createProduct.mockResolvedValue(mockProduct)
      carouselService.resolveCarouselOrderConflict.mockResolvedValue()

      await createProduct(req, res)

      expect(carouselService.resolveCarouselOrderConflict).toHaveBeenCalledWith(3, null)
      expect(productService.createProduct).toHaveBeenCalledWith(req.body)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
        message: 'Product created successfully'
      })
    })

    it('should create product without carousel conflict resolution', async () => {
      const req = mockRequest({
        body: {
          name: 'Simple Product',
          price_usd: 19.99
        }
      })
      const res = mockResponse()
      const mockProduct = { id: 2, name: 'Simple Product', price_usd: 19.99 }

      productService.createProduct.mockResolvedValue(mockProduct)

      await createProduct(req, res)

      expect(carouselService.resolveCarouselOrderConflict).not.toHaveBeenCalled()
      expect(productService.createProduct).toHaveBeenCalledWith(req.body)
    })
  })

  describe('createProductWithOccasions', () => {
    it('should create product with occasions successfully', async () => {
      const req = mockRequest({
        body: {
          product: { name: 'Product with Occasions', price_usd: 39.99 },
          occasionIds: [1, 2, 3]
        }
      })
      const res = mockResponse()
      const mockProduct = { id: 1, name: 'Product with Occasions' }

      productService.createProductWithOccasions.mockResolvedValue(mockProduct)

      await createProductWithOccasions(req, res)

      expect(productService.createProductWithOccasions).toHaveBeenCalledWith(
        { name: 'Product with Occasions', price_usd: 39.99 },
        [1, 2, 3]
      )
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
        message: 'Product with occasions created successfully'
      })
    })
  })

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { name: 'Updated Product', price_usd: 35.99, featured: true, carousel_order: 1 }
      })
      const res = mockResponse()
      const mockProduct = { id: 1, name: 'Updated Product', price_usd: 35.99 }

      ValidatorService.validateId.mockReturnValue(1)
      productService.updateProduct.mockResolvedValue(mockProduct)
      carouselService.resolveCarouselOrderConflict.mockResolvedValue()

      await updateProduct(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'productId')
      expect(carouselService.resolveCarouselOrderConflict).toHaveBeenCalledWith(1, 1)
      expect(productService.updateProduct).toHaveBeenCalledWith(1, req.body)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
        message: 'Product updated successfully'
      })
    })

    it('should update product without carousel conflict resolution', async () => {
      const req = mockRequest({
        params: { id: '2' },
        body: { name: 'Updated Name' }
      })
      const res = mockResponse()
      const mockProduct = { id: 2, name: 'Updated Name' }

      ValidatorService.validateId.mockReturnValue(2)
      productService.updateProduct.mockResolvedValue(mockProduct)

      await updateProduct(req, res)

      expect(carouselService.resolveCarouselOrderConflict).not.toHaveBeenCalled()
    })
  })

  describe('updateCarouselOrder', () => {
    it('should update carousel order successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { order: 5 }
      })
      const res = mockResponse()
      const mockProduct = { id: 1, carousel_order: 5 }

      ValidatorService.validateId.mockReturnValue(1)
      productService.updateCarouselOrder.mockResolvedValue(mockProduct)

      await updateCarouselOrder(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'productId')
      expect(productService.updateCarouselOrder).toHaveBeenCalledWith(1, 5)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
        message: 'Carousel order updated successfully'
      })
    })
  })

  describe('updateStock', () => {
    it('should update stock successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { quantity: 50 }
      })
      const res = mockResponse()
      const mockProduct = { id: 1, stock: 50 }

      ValidatorService.validateId.mockReturnValue(1)
      productService.updateStock.mockResolvedValue(mockProduct)

      await updateStock(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'productId')
      expect(productService.updateStock).toHaveBeenCalledWith(1, 50)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
        message: 'Stock updated successfully'
      })
    })
  })

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      const req = mockRequest({ params: { id: '1' } })
      const res = mockResponse()
      const mockProduct = { id: 1, active: false }

      ValidatorService.validateId.mockReturnValue(1)
      productService.deleteProduct.mockResolvedValue(mockProduct)

      await deleteProduct(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'productId')
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
      const req = mockRequest({ params: { id: '1' } })
      const res = mockResponse()
      const mockProduct = { id: 1, active: true }

      ValidatorService.validateId.mockReturnValue(1)
      productService.reactivateProduct.mockResolvedValue(mockProduct)

      await reactivateProduct(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'productId')
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
      const req = mockRequest({ params: { id: '1' } })
      const res = mockResponse()
      const mockOccasions = [
        { id: 1, name: 'Birthday' },
        { id: 2, name: 'Anniversary' }
      ]

      ValidatorService.validateId.mockReturnValue(1)
      productService.getProductOccasions.mockResolvedValue(mockOccasions)

      await getProductOccasions(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'productId')
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

      ValidatorService.validateId.mockReturnValue(1)
      productService.linkProductOccasion.mockResolvedValue(mockResult)

      await linkProductOccasion(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'productId')
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
        body: { occasion_ids: [1, 3, 5] }
      })
      const res = mockResponse()
      const mockResult = { deleted_count: 2, inserted_count: 3 }

      ValidatorService.validateId.mockReturnValue(1)
      productService.replaceProductOccasions.mockResolvedValue(mockResult)

      await replaceProductOccasions(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'productId')
      expect(productService.replaceProductOccasions).toHaveBeenCalledWith(1, [1, 3, 5])
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Product occasions updated successfully'
      })
    })
  })

  describe('Error handling', () => {
    it('should handle ValidatorService errors', async () => {
      const req = mockRequest({ params: { id: 'invalid' } })
      const res = mockResponse()

      ValidatorService.validateId.mockImplementation(() => {
        throw new Error('Invalid ID format')
      })

      await expect(getProductById(req, res)).rejects.toThrow('Invalid ID format')
    })

    it('should handle service layer errors', async () => {
      const req = mockRequest({ params: { id: '1' } })
      const res = mockResponse()

      ValidatorService.validateId.mockReturnValue(1)
      productService.getProductById.mockRejectedValue(new Error('Service error'))

      await expect(getProductById(req, res)).rejects.toThrow('Service error')
    })

    it('should handle carousel service errors', async () => {
      const req = mockRequest({
        body: { name: 'Test', price_usd: 10, featured: true, carousel_order: 1 }
      })
      const res = mockResponse()

      carouselService.resolveCarouselOrderConflict.mockRejectedValue(new Error('Carousel conflict'))

      await expect(createProduct(req, res)).rejects.toThrow('Carousel conflict')
    })
  })
})
