/**
 * Product Controller - Granular Unit Tests
 * HTTP Handler Layer Testing
 *
 * Coverage Target: 85%
 * Speed Target: < 100ms per test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock services
vi.mock('../../../api/services/productService.js', async () => {
  const actual = await vi.importActual('../../../api/services/productService.js')
  return {
    ...actual,
    getAllProducts: vi.fn(),
    getProductById: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    decrementStock: vi.fn(),
    getProductsByOccasion: vi.fn()
  }
})

vi.mock('../../../api/services/carouselService.js', () => ({
  updateProductCarouselOrder: vi.fn()
}))

vi.mock('../../../api/services/validation/ValidatorService.js', () => ({
  ValidatorService: {
    validate: vi.fn(() => ({ valid: true, errors: [] }))
  }
}))

vi.mock('../../../api/middleware/error/index.js', () => ({
  errorHandler: vi.fn((err, req, res, next) => next(err)),
  notFoundHandler: vi.fn((req, res, next) => next()),
  asyncHandler: vi.fn(fn => (req, res, next) => fn(req, res, next)),
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

// Import mocked functions
const {
  getAllProducts,
  _getProductById,
  _createProduct,
  _updateProduct,
  _deleteProduct,
  _decrementStock,
  _getProductsByOccasion
} = vi.importMock('../../../api/services/productService.js')

describe('ProductController - Granular Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllProducts()', () => {
    it('should return products with default filters', async () => {
      // Arrange
      vi.mocked(getAllProducts).mockResolvedValue([mockProduct])
      const { getAllProducts: controllerGetAllProducts } = await import(
        '../../../api/controllers/productController.js'
      )
      const req = mockReq()
      const res = mockRes()

      // Act
      await controllerGetAllProducts(req, res)

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
      vi.mocked(getAllProducts).mockResolvedValue([mockProduct])
      const { getAllProducts } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ query: { featured: 'true' } })
      const res = mockRes()

      // Act
      await getAllProducts(req, res)

      // Assert
      expect(vi.mocked(getAllProducts)).toHaveBeenCalledWith({ featured: true }, false, null)
    })

    it('should filter by featured when query param is false', async () => {
      // Arrange
      vi.mocked(getAllProducts).mockResolvedValue([])
      const { getAllProducts } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ query: { featured: 'false' } })
      const res = mockRes()

      // Act
      await getAllProducts(req, res)

      // Assert
      expect(vi.mocked(getAllProducts)).toHaveBeenCalledWith({ featured: false }, false, null)
    })

    it('should apply search term from query', async () => {
      // Arrange
      vi.mocked(getAllProducts).mockResolvedValue([mockProduct])
      const { getAllProducts } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ query: { search: 'test product' } })
      const res = mockRes()

      // Act
      await getAllProducts(req, res)

      // Assert
      expect(vi.mocked(getAllProducts)).toHaveBeenCalledWith(
        { search: 'test product' },
        false,
        null
      )
    })

    it('should filter by occasion slug', async () => {
      // Arrange
      vi.mocked(getAllProducts).mockResolvedValue([mockProduct])
      const { getAllProducts } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ query: { occasion: 'birthday' } })
      const res = mockRes()

      // Act
      await getAllProducts(req, res)

      // Assert
      expect(vi.mocked(getAllProducts)).toHaveBeenCalledWith({ occasion: 'birthday' }, false, null)
    })

    it('should apply sorting by price ascending', async () => {
      // Arrange
      vi.mocked(getAllProducts).mockResolvedValue([mockProduct])
      const { getAllProducts } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ query: { sortBy: 'price_asc' } })
      const res = mockRes()

      // Act
      await getAllProducts(req, res)

      // Assert
      expect(vi.mocked(getAllProducts)).toHaveBeenCalledWith({ sortBy: 'price_asc' }, false, null)
    })

    it('should apply pagination with limit', async () => {
      // Arrange
      vi.mocked(getAllProducts).mockResolvedValue([mockProduct])
      const { getAllProducts } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ query: { limit: '10', offset: '5' } })
      const res = mockRes()

      // Act
      await getAllProducts(req, res)

      // Assert
      expect(vi.mocked(getAllProducts)).toHaveBeenCalledWith({ limit: 10, offset: 5 }, false, null)
    })

    it('should include images when includeImageSize is specified', async () => {
      // Arrange
      vi.mocked(getAllProducts).mockResolvedValue([mockProduct])
      const { getAllProducts } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ query: { includeImageSize: 'thumb' } })
      const res = mockRes()

      // Act
      await getAllProducts(req, res)

      // Assert
      expect(vi.mocked(getAllProducts)).toHaveBeenCalledWith({}, false, 'thumb')
    })

    it('should return empty array when no products found', async () => {
      // Arrange
      vi.mocked(getAllProducts).mockResolvedValue([])
      const { getAllProducts } = await import('../../../api/controllers/productController.js')
      const req = mockReq()
      const res = mockRes()

      // Act
      await getAllProducts(req, res)

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
      vi.mocked(getProductById).mockResolvedValue(mockProduct)
      const { getProductById } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '1' } })
      const res = mockRes()

      // Act
      await getProductById(req, res)

      // Assert
      expect(vi.mocked(getProductById)).toHaveBeenCalledWith(1, false, null)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct,
        message: 'Product retrieved successfully'
      })
    })

    it('should return product with images when specified', async () => {
      // Arrange
      vi.mocked(getProductById).mockResolvedValue(mockProduct)
      const { getProductById } = await import('../../../api/controllers/productController.js')
      const req = mockReq({
        params: { id: '1' },
        query: { includeImageSize: 'medium' }
      })
      const res = mockRes()

      // Act
      await getProductById(req, res)

      // Assert
      expect(vi.mocked(getProductById)).toHaveBeenCalledWith(1, false, 'medium')
    })

    it('should handle string ID parameter', async () => {
      // Arrange
      vi.mocked(getProductById).mockResolvedValue(mockProduct)
      const { getProductById } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '123' } })
      const res = mockRes()

      // Act
      await getProductById(req, res)

      // Assert
      expect(vi.mocked(getProductById)).toHaveBeenCalledWith(123, false, null)
    })

    it('should include deactivated products for admin', async () => {
      // Arrange
      vi.mocked(getProductById).mockResolvedValue(mockProduct)
      const { getProductById } = await import('../../../api/controllers/productController.js')
      const req = mockReq({
        params: { id: '1' },
        query: { includeDeactivated: 'true' }
      })
      const res = mockRes()

      // Act
      await getProductById(req, res)

      // Assert
      expect(vi.mocked(getProductById)).toHaveBeenCalledWith(1, true, null)
    })

    it('should return 404 when product not found', async () => {
      // Arrange
      const error = new Error('Product with ID 999 not found')
      error.name = 'NotFoundError'
      vi.mocked(getProductById).mockRejectedValue(error)
      const { getProductById } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '999' } })
      const res = mockRes()

      // Act
      await getProductById(req, res)

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
      vi.mocked(createProduct).mockResolvedValue({ ...mockProduct, ...mockProductData })
      const { createProduct } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ body: mockProductData })
      const res = mockRes()

      // Act
      await createProduct(req, res)

      // Assert
      expect(vi.mocked(createProduct)).toHaveBeenCalledWith(mockProductData)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining(mockProductData),
        message: 'Product created successfully'
      })
    })

    it('should return 400 when validation fails', async () => {
      // Arrange
      const error = new Error('Validation failed')
      error.name = 'ValidationError'
      vi.mocked(createProduct).mockRejectedValue(error)
      const { createProduct } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ body: { name: '' } })
      const res = mockRes()

      // Act
      await createProduct(req, res)

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
      vi.mocked(createProduct).mockRejectedValue(error)
      const { createProduct } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ body: { ...mockProductData, sku: 'TEST-001' } })
      const res = mockRes()

      // Act
      await createProduct(req, res)

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
      vi.mocked(updateProduct).mockResolvedValue({ ...mockProduct, ...mockUpdateData })
      const { updateProduct } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '1' }, body: mockUpdateData })
      const res = mockRes()

      // Act
      await updateProduct(req, res)

      // Assert
      expect(vi.mocked(updateProduct)).toHaveBeenCalledWith(1, mockUpdateData)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining(mockUpdateData),
        message: 'Product updated successfully'
      })
    })

    it('should return 404 when product not found', async () => {
      // Arrange
      const error = new Error('Product with ID 999 not found')
      error.name = 'NotFoundError'
      vi.mocked(updateProduct).mockRejectedValue(error)
      const { updateProduct } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '999' }, body: mockUpdateData })
      const res = mockRes()

      // Act
      await updateProduct(req, res)

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
      vi.mocked(updateProduct).mockRejectedValue(error)
      const { updateProduct } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '1' }, body: { price_usd: -10 } })
      const res = mockRes()

      // Act
      await updateProduct(req, res)

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
      vi.mocked(deleteProduct).mockResolvedValue({ ...mockProduct, active: false })
      const { deleteProduct } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '1' } })
      const res = mockRes()

      // Act
      await deleteProduct(req, res)

      // Assert
      expect(vi.mocked(deleteProduct)).toHaveBeenCalledWith(1)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ active: false }),
        message: 'Product deactivated successfully'
      })
    })

    it('should return 404 when product not found', async () => {
      // Arrange
      const error = new Error('Product with ID 999 not found')
      error.name = 'NotFoundError'
      vi.mocked(deleteProduct).mockRejectedValue(error)
      const { deleteProduct } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '999' } })
      const res = mockRes()

      // Act
      await deleteProduct(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Product with ID 999 not found'
      })
    })
  })

  describe('decrementStock()', () => {
    it('should decrement product stock', async () => {
      // Arrange
      vi.mocked(decrementStock).mockResolvedValue({ ...mockProduct, stock: 95 })
      const { decrementStock } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '1' }, body: { quantity: 5 } })
      const res = mockRes()

      // Act
      await decrementStock(req, res)

      // Assert
      expect(vi.mocked(decrementStock)).toHaveBeenCalledWith(1, 5)
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
      vi.mocked(decrementStock).mockRejectedValue(error)
      const { decrementStock } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '1' }, body: { quantity: -5 } })
      const res = mockRes()

      // Act
      await decrementStock(req, res)

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
      vi.mocked(decrementStock).mockRejectedValue(error)
      const { decrementStock } = await import('../../../api/controllers/productController.js')
      const req = mockReq({ params: { id: '1' }, body: { quantity: 200 } })
      const res = mockRes()

      // Act
      await decrementStock(req, res)

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
      const { updateProductCarouselOrder } = await import(
        '../../../api/services/carouselService.js'
      )
      vi.mocked(updateProductCarouselOrder).mockResolvedValue({
        product_id: 1,
        carousel_order: 5
      })
      const { updateCarouselOrder } = await import('../../../api/controllers/productController.js')
      const req = mockReq({
        params: { id: '1' },
        body: { carousel_order: 5 }
      })
      const res = mockRes()

      // Act
      await updateCarouselOrder(req, res)

      // Assert
      expect(updateProductCarouselOrder).toHaveBeenCalledWith(1, 5)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { product_id: 1, carousel_order: 5 },
        message: 'Carousel order updated successfully'
      })
    })
  })
})
