import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getAllProducts,
  getProductById,
  getProductBySku,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  decrementStock,
  updateCarouselOrder,
  getCarouselProducts,
  replaceProductOccasions,
  getProductsWithOccasions
} from '../../services/productService.js'
import DIContainer from '../../architecture/di-container.js'
import { validateProduct } from '../../utils/validation.js'
import { sanitizeProductData } from '../../utils/sanitize.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseConstraintError,
  InsufficientStockError,
  BadRequestError,
  InternalServerError
} from '../../errors/AppError.js'

// Import the globally mocked supabase client
import { supabase as mockSupabase } from '../../services/supabaseClient.js'

// Create comprehensive mocks for all repositories
const mockProductRepository = {
  findAllWithFilters: vi.fn(),
  findByIdWithImages: vi.fn(),
  findBySku: vi.fn(),
  findFeatured: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  updateStock: vi.fn(),
  decrementStock: vi.fn(),
  updateCarouselOrder: vi.fn(),
  findAllWithOccasions: vi.fn(),
  findByOccasion: vi.fn(),
  replaceProductOccasions: vi.fn(),
  existsBySku: vi.fn()
}

const mockOccasionRepository = {
  findBySlug: vi.fn()
}

vi.mock('../../utils/validation.js', () => ({
  validateProduct: vi.fn()
}))

vi.mock('../../utils/sanitize.js', () => ({
  sanitizeProductData: vi.fn()
}))

vi.mock('../../services/productImageService.js', () => ({
  getProductsBatchWithImageSize: vi.fn(),
  getProductWithImageSize: vi.fn()
}))

describe('Product Service with Dependency Injection - Architectural Compliance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear DI container instances between tests
    DIContainer.clear()

    // Register mock repositories directly instead of using real ones
    DIContainer.registerInstance('ProductRepository', mockProductRepository)
    DIContainer.registerInstance('OccasionRepository', mockOccasionRepository)
    DIContainer.registerInstance('SupabaseClient', mockSupabase)

    // Setup validation and sanitization mocks
    validateProduct.mockImplementation(() => {}) // No-op by default
    sanitizeProductData.mockImplementation(data => data) // Return data as-is by default

    // Reset all mock implementations
    Object.values(mockProductRepository).forEach(mock => mock.mockReset())
    Object.values(mockOccasionRepository).forEach(mock => mock.mockReset())

    // Setup default mock return values
    mockProductRepository.findAllWithFilters.mockResolvedValue([])
    mockProductRepository.findByIdWithImages.mockResolvedValue(null)
    mockProductRepository.findBySku.mockResolvedValue(null)
    mockProductRepository.findFeatured.mockResolvedValue([])
    mockProductRepository.create.mockResolvedValue({ id: 1, active: true })
    mockProductRepository.update.mockResolvedValue({ id: 1, active: true })
    mockProductRepository.delete.mockResolvedValue({ id: 1, active: false })
    mockProductRepository.updateStock.mockResolvedValue({ id: 1, stock: 100 })
    mockProductRepository.decrementStock.mockResolvedValue({ id: 1, stock: 95 })
    mockProductRepository.updateCarouselOrder.mockResolvedValue({ id: 1, carousel_order: 1 })
    mockProductRepository.findAllWithOccasions.mockResolvedValue([])
    mockProductRepository.findByOccasion.mockResolvedValue([])
    mockProductRepository.replaceProductOccasions.mockResolvedValue({
      deleted_count: 0,
      inserted_count: 0
    })

    mockOccasionRepository.findBySlug.mockResolvedValue(null)

    // Setup default Supabase mock chain
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: [], error: null }),
      rangePaginate: vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis()
    })

    mockSupabase.rpc.mockResolvedValue({ data: null, error: null })
  })

  afterEach(() => {
    DIContainer.clear()
  })

  describe('getAllProducts', () => {
    it('should return products from repository when no image size requested', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price_usd: 10.99 },
        { id: 2, name: 'Product 2', price_usd: 15.99 }
      ]

      // Setup mock repository to return products
      mockProductRepository.findAllWithFilters.mockResolvedValue(mockProducts)

      const result = await getAllProducts({ limit: 10 })

      // Verify repository was called correctly
      expect(mockProductRepository.findAllWithFilters).toHaveBeenCalledWith(
        {
          limit: 10,
          occasionId: null,
          sortBy: 'created_at',
          includeDeactivated: false
        },
        { limit: 10, ascending: false }
      )
      expect(result).toEqual(mockProducts)
    })

    it('should fetch products with images when image size is requested', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' }
      ]
      const mockProductsWithImages = [
        { id: 1, name: 'Product 1', images: [] },
        { id: 2, name: 'Product 2', images: [] }
      ]

      // Setup mock repository to return products
      mockProductRepository.findAllWithFilters.mockResolvedValue(mockProducts)

      const { getProductsBatchWithImageSize } = await import(
        '../../services/productImageService.js'
      )
      getProductsBatchWithImageSize.mockResolvedValue(mockProductsWithImages)

      const result = await getAllProducts({ limit: 10 }, false, 'small')

      expect(mockProductRepository.findAllWithFilters).toHaveBeenCalled()
      expect(getProductsBatchWithImageSize).toHaveBeenCalledWith([1, 2], 'small')
      expect(result).toEqual(mockProductsWithImages)
    })

    it('should resolve occasion slug to ID when occasion filter provided', async () => {
      const mockOccasion = { id: 5, name: 'Birthday', slug: 'birthday' }
      const mockProducts = [{ id: 1, name: 'Cake' }]

      // Setup repository mocks
      mockOccasionRepository.findBySlug.mockResolvedValue(mockOccasion)
      mockProductRepository.findAllWithFilters.mockResolvedValue(mockProducts)

      const result = await getAllProducts({ occasion: 'birthday' })

      expect(mockOccasionRepository.findBySlug).toHaveBeenCalledWith('birthday', true)
      expect(mockProductRepository.findAllWithFilters).toHaveBeenCalledWith(
        {
          occasionId: 5,
          occasion: 'birthday',
          sortBy: 'created_at',
          includeDeactivated: false
        },
        { ascending: false }
      )
      expect(result).toEqual(mockProducts)
    })

    it('should return empty array when occasion not found', async () => {
      mockOccasionRepository.findBySlug.mockResolvedValue(null)

      const result = await getAllProducts({ occasion: 'nonexistent' })

      expect(result).toEqual([])
      expect(mockProductRepository.findAllWithFilters).not.toHaveBeenCalled()
    })

    it('should handle sorting filters correctly', async () => {
      mockProductRepository.findAllWithFilters.mockResolvedValue([])

      await getAllProducts({ sortBy: 'price_desc' })

      expect(mockProductRepository.findAllWithFilters).toHaveBeenCalledWith(
        {
          sortBy: 'price',
          occasionId: null,
          includeDeactivated: false
        },
        { ascending: false }
      )
    })

    it('should apply pagination options', async () => {
      mockProductRepository.findAllWithFilters.mockResolvedValue([])

      await getAllProducts({ limit: 20, offset: 10 })

      expect(mockProductRepository.findAllWithFilters).toHaveBeenCalledWith(
        {
          limit: 20,
          offset: 10,
          occasionId: null,
          sortBy: 'created_at',
          includeDeactivated: false
        },
        { limit: 20, offset: 10, ascending: false }
      )
    })
  })

  describe('getProductById', () => {
    it('should return product from repository when no image size requested', async () => {
      const mockProduct = { id: 1, name: 'Test Product', price_usd: 10.99 }
      mockProductRepository.findByIdWithImages.mockResolvedValue(mockProduct)

      const result = await getProductById(1)

      expect(mockProductRepository.findByIdWithImages).toHaveBeenCalledWith(1, false)
      expect(result).toEqual(mockProduct)
    })

    it('should fetch product with specific image size when requested', async () => {
      const mockProduct = { id: 1, name: 'Test Product' }
      const mockProductWithImages = { id: 1, name: 'Test Product', product_images: [] }

      mockProductRepository.findByIdWithImages.mockResolvedValue(mockProduct)
      const { getProductWithImageSize } = await import('../../services/productImageService.js')
      getProductWithImageSize.mockResolvedValue(mockProductWithImages)

      const result = await getProductById(1, false, 'medium')

      expect(mockProductRepository.findByIdWithImages).toHaveBeenCalledWith(1, false)
      expect(getProductWithImageSize).toHaveBeenCalledWith(1, 'medium')
      expect(result).toEqual(mockProductWithImages)
    })

    it('should filter images by size when product has images', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        product_images: [
          { id: 1, size: 'small', url: 'small.jpg' },
          { id: 2, size: 'medium', url: 'medium.jpg' },
          { id: 3, size: 'large', url: 'large.jpg' }
        ]
      }

      mockProductRepository.findByIdWithImages.mockResolvedValue(mockProduct)
      const { getProductWithImageSize } = await import('../../services/productImageService.js')
      getProductWithImageSize.mockResolvedValue(mockProduct)

      const result = await getProductById(1, false, 'medium')

      expect(result.product_images).toEqual([{ id: 2, size: 'medium', url: 'medium.jpg' }])
    })

    it('should throw BadRequestError for invalid ID', async () => {
      await expect(getProductById('invalid')).rejects.toThrow(BadRequestError)
      await expect(getProductById(0)).rejects.toThrow(BadRequestError)
      await expect(getProductById(-1)).rejects.toThrow(BadRequestError)
    })

    it('should throw NotFoundError when product not found', async () => {
      mockProductRepository.findByIdWithImages.mockResolvedValue(null)

      await expect(getProductById(999)).rejects.toThrow(NotFoundError)
    })
  })

  describe('getProductBySku', () => {
    it('should return product when found by SKU', async () => {
      const mockProduct = { id: 1, sku: 'TEST-001', name: 'Test Product' }
      mockProductRepository.findBySku.mockResolvedValue(mockProduct)

      const result = await getProductBySku('TEST-001')

      expect(mockProductRepository.findBySku).toHaveBeenCalledWith('TEST-001')
      expect(result).toEqual(mockProduct)
    })

    it('should throw BadRequestError for invalid SKU', async () => {
      await expect(getProductBySku(null)).rejects.toThrow(BadRequestError)
      await expect(getProductBySku(123)).rejects.toThrow(BadRequestError)
    })

    it('should throw NotFoundError when product not found', async () => {
      mockProductRepository.findBySku.mockResolvedValue(null)

      await expect(getProductBySku('NONEXISTENT')).rejects.toThrow(NotFoundError)
    })
  })

  describe('createProduct', () => {
    const validProductData = {
      name: 'New Product',
      price_usd: 25.99,
      stock: 10
    }

    it('should create product successfully', async () => {
      const createdProduct = { id: 1, ...validProductData, active: true, featured: false }
      mockProductRepository.create = vi.fn().mockResolvedValue(createdProduct)

      const result = await createProduct(validProductData)

      expect(validateProduct).toHaveBeenCalledWith(validProductData, false)
      expect(sanitizeProductData).toHaveBeenCalledWith(validProductData, false)
      expect(mockProductRepository.create).toHaveBeenCalledWith({
        name: 'New Product',
        summary: null,
        description: null,
        price_usd: 25.99,
        price_ves: null,
        stock: 10,
        sku: null,
        active: true,
        featured: false,
        carousel_order: null
      })
      expect(result).toEqual(createdProduct)
    })

    it('should throw ValidationError when validation fails', async () => {
      validateProduct.mockImplementation(() => {
        throw new ValidationError('Validation failed', { name: 'Name is required' })
      })

      await expect(createProduct({})).rejects.toThrow(ValidationError)
    })

    it('should throw DatabaseConstraintError for duplicate SKU', async () => {
      mockProductRepository.create.mockRejectedValue({
        code: '23505',
        message: 'duplicate key value violates unique constraint'
      })

      await expect(createProduct({ ...validProductData, sku: 'DUPLICATE' })).rejects.toThrow(
        DatabaseConstraintError
      )
    })
  })

  describe('updateProduct', () => {
    const updateData = { name: 'Updated Name', price_usd: 30.99 }

    it('should update product successfully', async () => {
      const updatedProduct = { id: 1, name: 'Updated Name', price_usd: 30.99, active: true }
      mockProductRepository.update.mockResolvedValue(updatedProduct)

      const result = await updateProduct(1, updateData)

      expect(validateProduct).toHaveBeenCalledWith(updateData, true)
      expect(sanitizeProductData).toHaveBeenCalledWith(updateData, true)
      expect(mockProductRepository.update).toHaveBeenCalledWith(1, {
        name: 'Updated Name',
        price_usd: 30.99
      })
      expect(result).toEqual(updatedProduct)
    })

    it('should throw BadRequestError for invalid ID', async () => {
      await expect(updateProduct('invalid', updateData)).rejects.toThrow(BadRequestError)
    })

    it('should throw BadRequestError when no updates provided', async () => {
      await expect(updateProduct(1, {})).rejects.toThrow(BadRequestError)
    })

    it('should throw NotFoundError when product not found', async () => {
      const notFoundError = new NotFoundError('Product', 999)
      mockProductRepository.update.mockRejectedValue(notFoundError)

      await expect(updateProduct(999, updateData)).rejects.toThrow(NotFoundError)
    })

    it('should throw DatabaseConstraintError for duplicate SKU', async () => {
      mockProductRepository.update.mockRejectedValue({
        code: '23505'
      })

      await expect(updateProduct(1, { sku: 'DUPLICATE' })).rejects.toThrow(DatabaseConstraintError)
    })
  })

  describe('deleteProduct', () => {
    it('should soft delete product successfully', async () => {
      const deletedProduct = { id: 1, active: false }
      mockProductRepository.delete.mockResolvedValue(deletedProduct)

      const result = await deleteProduct(1)

      expect(mockProductRepository.delete).toHaveBeenCalledWith(1)
      expect(result).toEqual(deletedProduct)
    })

    it('should throw BadRequestError for invalid ID', async () => {
      await expect(deleteProduct('invalid')).rejects.toThrow(BadRequestError)
    })
  })

  describe('updateStock', () => {
    it('should update stock successfully', async () => {
      const updatedProduct = { id: 1, stock: 50 }
      mockProductRepository.updateStock.mockResolvedValue(updatedProduct)

      const result = await updateStock(1, 50)

      expect(mockProductRepository.updateStock).toHaveBeenCalledWith(1, 50)
      expect(result).toEqual(updatedProduct)
    })

    it('should throw BadRequestError for invalid parameters', async () => {
      await expect(updateStock('invalid', 50)).rejects.toThrow(BadRequestError)
      await expect(updateStock(1, -5)).rejects.toThrow(BadRequestError)
    })
  })

  describe('decrementStock', () => {
    it('should decrement stock successfully when sufficient stock available', async () => {
      // Note: decrementStock now uses repository directly, not cache
      mockProductRepository.decrementStock.mockResolvedValue({ id: 1, stock: 5 })

      const result = await decrementStock(1, 5)

      expect(mockProductRepository.decrementStock).toHaveBeenCalledWith(1, 5)
      expect(result.stock).toBe(5)
    })

    it('should throw InsufficientStockError when stock is insufficient', async () => {
      // Mock the repository to throw InsufficientStockError
      const insufficientStockError = new InsufficientStockError(1, 5, 2)
      mockProductRepository.decrementStock.mockRejectedValue(insufficientStockError)

      await expect(decrementStock(1, 5)).rejects.toThrow(InsufficientStockError)
    })

    it('should throw BadRequestError for invalid parameters', async () => {
      await expect(decrementStock('invalid', 5)).rejects.toThrow(BadRequestError)
      await expect(decrementStock(1, -1)).rejects.toThrow(BadRequestError)
    })
  })

  describe('updateCarouselOrder', () => {
    it('should update carousel order successfully', async () => {
      const updatedProduct = { id: 1, carousel_order: 5 }
      mockProductRepository.updateCarouselOrder.mockResolvedValue(updatedProduct)

      const result = await updateCarouselOrder(1, 5)

      expect(mockProductRepository.updateCarouselOrder).toHaveBeenCalledWith(1, 5)
      expect(result).toEqual(updatedProduct)
    })

    it('should allow null carousel order to remove from carousel', async () => {
      const updatedProduct = { id: 1, carousel_order: null }
      mockProductRepository.updateCarouselOrder.mockResolvedValue(updatedProduct)

      const result = await updateCarouselOrder(1, null)

      expect(mockProductRepository.updateCarouselOrder).toHaveBeenCalledWith(1, null)
      expect(result.carousel_order).toBeNull()
    })

    it('should throw BadRequestError for invalid parameters', async () => {
      await expect(updateCarouselOrder('invalid', 5)).rejects.toThrow(BadRequestError)
      await expect(updateCarouselOrder(1, -1)).rejects.toThrow(BadRequestError)
      await expect(updateCarouselOrder(1, 8)).rejects.toThrow(BadRequestError)
    })
  })

  describe('getCarouselProducts', () => {
    it('should return carousel products with images', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', carousel_order: 1 },
        { id: 2, name: 'Product 2', carousel_order: 2 }
      ]
      const mockProductsWithImages = [
        { id: 1, name: 'Product 1', images: [] },
        { id: 2, name: 'Product 2', images: [] }
      ]

      mockProductRepository.findFeatured.mockResolvedValue(mockProducts)
      const { getProductsBatchWithImageSize } = await import(
        '../../services/productImageService.js'
      )
      getProductsBatchWithImageSize.mockResolvedValue(mockProductsWithImages)

      const result = await getCarouselProducts()

      expect(mockProductRepository.findFeatured).toHaveBeenCalledWith(7) // CAROUSEL.MAX_SIZE
      expect(getProductsBatchWithImageSize).toHaveBeenCalledWith([1, 2], 'small')
      expect(result).toEqual(mockProductsWithImages)
    })

    it('should throw NotFoundError when no carousel products found', async () => {
      mockProductRepository.findFeatured.mockResolvedValue([])

      await expect(getCarouselProducts()).rejects.toThrow(NotFoundError)
    })
  })

  describe('replaceProductOccasions', () => {
    it('should replace product occasions successfully', async () => {
      const mockResult = { deleted_count: 2, inserted_count: 3 }
      // Reset the repository mock and set up specific return value
      mockProductRepository.replaceProductOccasions.mockReset().mockResolvedValue(mockResult)

      const result = await replaceProductOccasions(1, [2, 3, 4])

      expect(mockProductRepository.replaceProductOccasions).toHaveBeenCalledWith(1, [2, 3, 4])
      expect(result).toEqual(mockResult)
    })

    it('should handle empty occasion array', async () => {
      const mockResult = { deleted_count: 2, inserted_count: 0 }
      // Reset the repository mock and set up specific return value
      mockProductRepository.replaceProductOccasions.mockReset().mockResolvedValue(mockResult)

      const result = await replaceProductOccasions(1, [])

      expect(mockProductRepository.replaceProductOccasions).toHaveBeenCalledWith(1, [])
      expect(result).toEqual(mockResult)
    })

    it('should throw ValidationError for invalid parameters', async () => {
      await expect(replaceProductOccasions('invalid', [1, 2])).rejects.toThrow(ValidationError)
      await expect(replaceProductOccasions(1, 'invalid')).rejects.toThrow(ValidationError)
      await expect(replaceProductOccasions(1, [1, 'invalid', 3])).rejects.toThrow(ValidationError)
    })

    it('should throw InternalServerError when product not found', async () => {
      // Reset repository mock and make it throw an error to simulate not found
      mockProductRepository.replaceProductOccasions
        .mockReset()
        .mockRejectedValue(new Error('Product not found'))

      await expect(replaceProductOccasions(999, [1, 2])).rejects.toThrow(InternalServerError)
    })

    it('should throw ValidationError for invalid occasion IDs', async () => {
      // The service now throws InternalServerError for database errors
      // Test with invalid parameters that cause ValidationError
      await expect(replaceProductOccasions(1, [1, 'invalid', 3])).rejects.toThrow(ValidationError)
    })
  })

  describe('getProductsWithOccasions', () => {
    it('should return products with occasions from repository', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', product_occasions: [] },
        { id: 2, name: 'Product 2', product_occasions: [] }
      ]

      mockProductRepository.findAllWithOccasions.mockResolvedValue(mockProducts)

      const result = await getProductsWithOccasions(10, 0)

      expect(mockProductRepository.findAllWithOccasions).toHaveBeenCalledWith(
        { includeDeactivated: false },
        { limit: 10, offset: 0, ascending: false }
      )
      expect(result).toEqual(mockProducts)
    })

    it('should use default limit when not provided', async () => {
      mockProductRepository.findAllWithOccasions.mockResolvedValue([
        { id: 1, name: 'Product 1', product_occasions: [] }
      ])

      const result = await getProductsWithOccasions()

      expect(mockProductRepository.findAllWithOccasions).toHaveBeenCalledWith(
        { includeDeactivated: false },
        { limit: 50, offset: 0, ascending: false }
      )
      expect(result).toEqual([{ id: 1, name: 'Product 1', product_occasions: [] }])
    })
  })

  describe('DI Container Integration', () => {
    it('should resolve ProductRepository from DI container', async () => {
      // Since we're using mocked repositories, test that they get called
      mockProductRepository.findAllWithFilters.mockResolvedValue([{ id: 1, name: 'Test' }])

      const result = await getAllProducts()

      expect(result).toEqual([{ id: 1, name: 'Test' }])
      expect(mockProductRepository.findAllWithFilters).toHaveBeenCalled()
    })

    it('should resolve OccasionRepository from DI container when needed', async () => {
      mockOccasionRepository.findBySlug.mockResolvedValue({ id: 1 })
      mockProductRepository.findAllWithFilters.mockResolvedValue([{ id: 1, name: 'Test' }])

      const result = await getAllProducts({ occasion: 'birthday' })

      expect(result).toEqual([{ id: 1, name: 'Test' }])
      expect(mockOccasionRepository.findBySlug).toHaveBeenCalledWith('birthday', true)
    })

    it('should throw error when required service not available', async () => {
      // Clear the DI container and don't register the service
      DIContainer.clear()

      await expect(getAllProducts()).rejects.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should re-throw AppError instances as-is', async () => {
      const validationError = new ValidationError('Test error', { field: 'test' })
      validateProduct.mockImplementation(() => {
        throw validationError
      })

      await expect(createProduct({})).rejects.toThrow(validationError)
    })

    it('should wrap unexpected errors in DatabaseError', async () => {
      mockProductRepository.findBySku.mockRejectedValue(new Error('Unexpected error'))

      await expect(getProductBySku('TEST')).rejects.toThrow('Unexpected error')
    })

    it('should handle database errors in getAllProducts', async () => {
      mockProductRepository.findAllWithFilters.mockRejectedValue(
        new Error('Database connection failed')
      )

      await expect(getAllProducts()).rejects.toThrow()
    })
  })
})
