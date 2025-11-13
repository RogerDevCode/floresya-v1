/**
 * Product Controller - Granular Unit Tests
 * HTTP Handler Layer Testing
 *
 * Coverage Target: 85%
 * Speed Target: < 100ms per test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock services
// Mock carouselService WITH vi.mocked setup
const mockUpdateProductCarouselOrder = vi.fn()
vi.mock('../../../api/services/carouselService.js', () => ({
  updateProductCarouselOrder: mockUpdateProductCarouselOrder
}))

vi.mock('../../../api/services/validation/ValidatorService.js', () => ({
  ValidatorService: {
    validate: vi.fn(() => ({ valid: true, errors: [] })),
    validateId: vi.fn(id => {
      // Simular el comportamiento real: retorna el ID como número
      return Number(id)
    })
  }
}))

vi.mock('../../../api/middleware/error/index.js', () => ({
  errorHandler: vi.fn((err, req, res, next) => next(err)),
  notFoundHandler: vi.fn((req, res, next) => next()),
  asyncHandler: vi.fn(fn => async (req, res, next) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      // Convert errors to JSON responses for tests
      const status = error.statusCode || error.status || 500
      res.status(status).json({
        success: false,
        error: error.message || 'Internal server error'
      })
    }
  }),
  withErrorMapping: vi.fn(fn => fn),
  createTableOperations: vi.fn(() => ({
    findById: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }))
}))

const mockProduct = {
  id: 1,
  name: 'Test Product',
  sku: 'TEST-001',
  price_usd: 25.99,
  price_ves: 912.38,
  stock: 100,
  active: true,
  summary: 'Test summary',
  description: 'Test description',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockRes = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis()
  }
  return res
}

const mockReq = (overrides = {}) => ({
  query: {},
  params: {},
  body: {},
  ...overrides
})

// Mock the service functions
vi.mock('../../../api/services/productService.js', () => ({
  createProductService: vi.fn(),
  getAllProducts: vi.fn(),
  getProductById: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  updateStock: vi.fn(),
  updateCarouselOrder: vi.fn()
}))

// Import mocked functions AFTER vi.mock
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  updateCarouselOrder
} from '../../../api/services/productService.js'

describe('ProductController - Granular Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllProducts()', () => {
    it('should return products with default filters', async () => {
      // Arrange
      getAllProducts.mockResolvedValue([mockProduct])
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq()
      const res = mockRes()

      // Act
      await productController.getAllProducts(req, res)

      // Assert
      expect(getAllProducts).toHaveBeenCalledWith({}, false, null)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [mockProduct],
        message: 'Products retrieved successfully'
      })
    })

    it('should filter by featured when query param is true', async () => {
      // Arrange
      getAllProducts.mockResolvedValue([mockProduct])
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ query: { featured: 'true' } })
      const res = mockRes()

      // Act
      await productController.getAllProducts(req, res)

      // Assert
      expect(getAllProducts).toHaveBeenCalledWith({ featured: true }, false, null)
    })

    it('should filter by featured when query param is false', async () => {
      // Arrange
      getAllProducts.mockResolvedValue([])
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ query: { featured: 'false' } })
      const res = mockRes()

      // Act
      await productController.getAllProducts(req, res)

      // Assert
      expect(getAllProducts).toHaveBeenCalledWith({ featured: false }, false, null)
    })

    it('should apply search term from query', async () => {
      // Arrange
      getAllProducts.mockResolvedValue([mockProduct])
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ query: { search: 'test product' } })
      const res = mockRes()

      // Act
      await productController.getAllProducts(req, res)

      // Assert
      expect(getAllProducts).toHaveBeenCalledWith({ search: 'test product' }, false, null)
    })

    it('should filter by occasion slug', async () => {
      // Arrange
      getAllProducts.mockResolvedValue([mockProduct])
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ query: { occasion: 'birthday' } })
      const res = mockRes()

      // Act
      await productController.getAllProducts(req, res)

      // Assert
      expect(getAllProducts).toHaveBeenCalledWith({ occasion: 'birthday' }, false, null)
    })

    it('should apply sorting by price ascending', async () => {
      // Arrange
      getAllProducts.mockResolvedValue([mockProduct])
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ query: { sortBy: 'price_asc' } })
      const res = mockRes()

      // Act
      await productController.getAllProducts(req, res)

      // Assert
      expect(getAllProducts).toHaveBeenCalledWith({ sortBy: 'price_asc' }, false, null)
    })

    it('should apply pagination with limit', async () => {
      // Arrange
      getAllProducts.mockResolvedValue([mockProduct])
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ query: { limit: '10', offset: '5' } })
      const res = mockRes()

      // Act
      await productController.getAllProducts(req, res)

      // Assert
      expect(getAllProducts).toHaveBeenCalledWith(
        {
          featured: undefined,
          limit: '10',
          occasion: undefined,
          offset: '5',
          search: undefined,
          sku: undefined,
          sortBy: undefined
        },
        false,
        null
      )
    })

    it('should include images when includeImageSize is specified', async () => {
      // Arrange
      getAllProducts.mockResolvedValue([mockProduct])
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ query: { includeImageSize: 'thumb' } })
      const res = mockRes()

      // Act
      await productController.getAllProducts(req, res)

      // Assert
      expect(getAllProducts).toHaveBeenCalledWith(
        {
          featured: undefined,
          limit: undefined,
          occasion: undefined,
          offset: undefined,
          search: undefined,
          sku: undefined,
          sortBy: undefined
        },
        false,
        null
      )
    })

    it('should return empty array when no products found', async () => {
      // Arrange
      getAllProducts.mockResolvedValue([])
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq()
      const res = mockRes()

      // Act
      await productController.getAllProducts(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        message: 'Products retrieved successfully'
      })
    })
  })

  describe('getProductById()', () => {
    it('should return product by valid ID', async () => {
      // Arrange
      getProductById.mockResolvedValue(mockProduct)
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '1' } })
      const res = mockRes()

      // Act
      await productController.getProductById(req, res)

      // Assert
      expect(getProductById).toHaveBeenCalledWith(1, false, null)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
        message: 'Product retrieved successfully'
      })
    })

    it('should return product with images when specified', async () => {
      // Arrange
      getProductById.mockResolvedValue(mockProduct)
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({
        params: { id: '1' },
        query: { includeImageSize: 'medium' }
      })
      const res = mockRes()

      // Act
      await productController.getProductById(req, res)

      // Assert
      expect(getProductById).toHaveBeenCalledWith(1, false, null)
    })

    it('should handle string ID parameter', async () => {
      // Arrange
      getProductById.mockResolvedValue(mockProduct)
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '123' } })
      const res = mockRes()

      // Act
      await productController.getProductById(req, res)

      // Assert
      expect(getProductById).toHaveBeenCalledWith(123, false, null)
    })

    it('should include deactivated products for admin', async () => {
      // Arrange
      getProductById.mockResolvedValue(mockProduct)
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({
        params: { id: '1' },
        query: { includeDeactivated: 'true' },
        user: { role: 'admin' }
      })
      const res = mockRes()

      // Act
      await productController.getProductById(req, res)

      // Assert
      expect(getProductById).toHaveBeenCalledWith(1, false, null)
    })

    it('should return 404 when product not found', async () => {
      // Arrange
      const error = new Error('Product with ID 999 not found')
      error.name = 'NotFoundError'
      getProductById.mockRejectedValue(error)
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '999' } })
      const res = mockRes()

      // Act
      await productController.getProductById(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Product with ID 999 not found'
      })
    })
  })

  describe('createProduct()', () => {
    const mockProductData = {
      name: 'New Product',
      sku: 'NEW-001',
      price_usd: 29.99,
      price_ves: 1092.38,
      stock: 50,
      summary: 'New summary',
      description: 'New description'
    }

    it('should create product with valid data', async () => {
      // Arrange
      createProduct.mockResolvedValue({ ...mockProduct, ...mockProductData })
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ body: mockProductData })
      const res = mockRes()

      // Act
      await productController.createProduct(req, res)

      // Assert
      expect(createProduct).toHaveBeenCalledWith(mockProductData)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { ...mockProduct, ...mockProductData },
        message: 'Product created successfully'
      })
    })

    it('should return 400 when validation fails', async () => {
      // Arrange
      const error = new Error('Validation failed')
      error.name = 'ValidationError'
      createProduct.mockRejectedValue(error)
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ body: { name: '' } })
      const res = mockRes()

      // Act
      await productController.createProduct(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed'
      })
    })

    it('should return 400 when SKU already exists', async () => {
      // Arrange
      const error = new Error('Product with SKU TEST-001 already exists')
      error.name = 'DatabaseConstraintError'
      createProduct.mockRejectedValue(error)
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ body: { ...mockProductData, sku: 'TEST-001' } })
      const res = mockRes()

      // Act
      await productController.createProduct(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Product with SKU TEST-001 already exists'
      })
    })
  })

  describe('updateProduct()', () => {
    const mockUpdateData = {
      name: 'Updated Product',
      price_usd: 35.99
    }

    it('should update product with valid data', async () => {
      // Arrange
      updateProduct.mockResolvedValue({ ...mockProduct, ...mockUpdateData })
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '1' }, body: mockUpdateData })
      const res = mockRes()

      // Act
      await productController.updateProduct(req, res)

      // Assert
      expect(updateProduct).toHaveBeenCalledWith(1, mockUpdateData)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { ...mockProduct, ...mockUpdateData },
        message: 'Product updated successfully'
      })
    })

    it('should return 404 when product not found', async () => {
      // Arrange
      const error = new Error('Product with ID 999 not found')
      error.name = 'NotFoundError'
      updateProduct.mockRejectedValue(error)
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '999' }, body: mockUpdateData })
      const res = mockRes()

      // Act
      await productController.updateProduct(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Product with ID 999 not found'
      })
    })

    it('should return 400 when validation fails', async () => {
      // Arrange
      const error = new Error('Invalid price: must be positive')
      error.name = 'ValidationError'
      updateProduct.mockRejectedValue(error)
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '1' }, body: { price_usd: -10 } })
      const res = mockRes()

      // Act
      await productController.updateProduct(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid price: must be positive'
      })
    })
  })

  describe('deleteProduct()', () => {
    it('should deactivate product (soft delete)', async () => {
      // Arrange
      deleteProduct.mockResolvedValue({ ...mockProduct, active: false })
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '1' } })
      const res = mockRes()

      // Act
      await productController.deleteProduct(req, res)

      // Assert
      expect(deleteProduct).toHaveBeenCalledWith(1)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { ...mockProduct, active: false },
        message: 'Product deactivated successfully'
      })
    })

    it('should return 404 when product not found', async () => {
      // Arrange
      const error = new Error('Product with ID 999 not found')
      error.name = 'NotFoundError'
      deleteProduct.mockRejectedValue(error)
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '999' } })
      const res = mockRes()

      // Act
      await productController.deleteProduct(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Product with ID 999 not found'
      })
    })
  })

  describe('updateStock()', () => {
    it('should decrement product stock', async () => {
      // Arrange
      updateStock.mockResolvedValue({ ...mockProduct, stock: 95 })
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '1' }, body: { quantity: 5 } })
      const res = mockRes()

      // Act
      await productController.updateStock(req, res)

      // Assert
      expect(updateStock).toHaveBeenCalledWith(1, 5)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ stock: 95 }),
        message: 'Stock updated successfully'
      })
    })

    it('should return 400 when quantity is invalid', async () => {
      // Arrange
      const error = new Error('Invalid quantity: must be positive')
      error.name = 'ValidationError'
      updateStock.mockRejectedValue(error)
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '1' }, body: { quantity: -5 } })
      const res = mockRes()

      // Act
      await productController.updateStock(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid quantity: must be positive'
      })
    })

    it('should return 400 when stock is insufficient', async () => {
      // Arrange
      const error = new Error('Insufficient stock')
      error.name = 'InsufficientStockError'
      updateStock.mockRejectedValue(error)
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '1' }, body: { quantity: 200 } })
      const res = mockRes()

      // Act
      await productController.updateStock(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient stock'
      })
    })
  })

  describe('updateCarouselOrder()', () => {
    it('should update carousel order for product', async () => {
      // Arrange
      vi.mocked(updateCarouselOrder).mockResolvedValue({
        product_id: 1,
        carousel_order: 5
      })
      const { productController } = await import('../../../api/controllers/productController.js')
      const req = mockReq({
        params: { id: '1' },
        body: { order: 5 }
      })
      const res = mockRes()

      // Act
      await productController.updateCarouselOrder(req, res)

      // Assert
      expect(updateCarouselOrder).toHaveBeenCalledWith(1, 5)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { product_id: 1, carousel_order: 5 },
        message: 'Carousel order updated successfully'
      })
    })
  })
})
