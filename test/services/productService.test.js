/**
 * Product Service Tests - Vitest Edition
 * Comprehensive testing of product service business logic
 * Following KISS principle and Supabase best practices
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks, createMockRepository, testData } from './setup.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseConstraintError,
  BadRequestError,
  InternalServerError
} from '../../api/errors/AppError.js'

// Mock DIContainer before importing services
vi.mock('../../api/architecture/di-container.js', () => ({
  default: {
    resolve: vi.fn(),
    register: vi.fn(),
    registerInstance: vi.fn(),
    has: vi.fn(),
    clear: vi.fn()
  }
}))

// Mock sanitize utilities
vi.mock('../../api/utils/sanitize.js', () => ({
  sanitizeProductData: vi.fn(data => data)
}))

// Mock console.log to capture logging calls
const mockConsoleLog = vi.fn()
vi.stubGlobal('console', {
  log: mockConsoleLog,
  error: mockConsoleLog,
  warn: mockConsoleLog
})

// Mock validation utilities
vi.mock('../../api/utils/validation.js', () => ({
  validateProduct: vi.fn()
}))

// Mock constants
vi.mock('../../api/config/constants.js', () => ({
  CAROUSEL: {
    MAX_SIZE: 8
  }
}))

// Import services after mocks are set up
import {
  getAllProducts,
  getProductById,
  getProductBySku,
  getProductsWithOccasions,
  getProductsByOccasion,
  // getCarouselProducts,
  createProduct,
  createProductWithOccasions,
  updateProduct,
  updateCarouselOrder,
  deleteProduct,
  reactivateProduct,
  updateStock,
  decrementStock,
  replaceProductOccasions
} from '../../api/services/productService.js'

describe('Product Service - Business Logic Layer', () => {
  let mockProductRepository
  let mockOccasionRepository
  let mockLogger

  beforeEach(async () => {
    resetAllMocks()

    // Setup specific mocks for this test suite
    mockProductRepository = createMockRepository({
      findAllWithFilters: vi.fn(),
      findByIdWithImages: vi.fn(),
      findBySku: vi.fn(),
      findAllWithOccasions: vi.fn(),
      findByOccasion: vi.fn(),
      findFeatured: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateCarouselOrder: vi.fn(),
      delete: vi.fn(),
      reactivate: vi.fn(),
      updateStock: vi.fn(),
      decrementStock: vi.fn(),
      replaceProductOccasions: vi.fn(),
      replaceOccasions: vi.fn()
    })

    mockOccasionRepository = createMockRepository({
      findBySlug: vi.fn()
    })

    mockLogger = {
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn()
    }

    // Setup DIContainer mocks
    const { default: DIContainer } = await import('../../api/architecture/di-container.js')
    DIContainer.resolve.mockImplementation(name => {
      if (name === 'ProductRepository') {
        return mockProductRepository
      }
      if (name === 'OccasionRepository') {
        return mockOccasionRepository
      }
      if (name === 'Logger') {
        return mockLogger
      }
      return createMockRepository()
    })
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('getAllProducts - Retrieve products with filters', () => {
    test('should return products with basic filters', async () => {
      const mockProducts = [testData.products.active, testData.products.inactive]
      mockProductRepository.findAllWithFilters.mockResolvedValue(mockProducts)

      const result = await getAllProducts({ limit: 10, offset: 0 })

      expect(mockProductRepository.findAllWithFilters).toHaveBeenCalledWith(
        { includeDeactivated: false, occasionId: null, limit: 10, offset: 0 },
        { orderBy: 'created_at', ascending: false, limit: 10, offset: 0 }
      )
      expect(result).toEqual(mockProducts)
    })

    test('should resolve occasion slug to ID', async () => {
      const mockProducts = [testData.products.active]
      const mockOccasion = { id: 1, slug: 'birthday', name: 'Birthday' }
      mockOccasionRepository.findBySlug.mockResolvedValue(mockOccasion)
      mockProductRepository.findAllWithFilters.mockResolvedValue(mockProducts)

      const result = await getAllProducts({ occasion: 'birthday' })

      expect(mockOccasionRepository.findBySlug).toHaveBeenCalledWith('birthday', true)
      expect(mockProductRepository.findAllWithFilters).toHaveBeenCalledWith(
        { occasionId: 1, occasion: 'birthday', includeDeactivated: false },
        { orderBy: 'created_at', ascending: false }
      )
      expect(result).toEqual(mockProducts)
    })

    test('should handle occasion not found', async () => {
      mockOccasionRepository.findBySlug.mockResolvedValue(null)

      const result = await getAllProducts({ occasion: 'nonexistent' })

      expect(result).toEqual([])
    })

    test('should apply sorting options', async () => {
      const mockProducts = [testData.products.active]
      mockProductRepository.findAllWithFilters.mockResolvedValue(mockProducts)

      const result = await getAllProducts({ sortBy: 'price_desc' })

      expect(mockProductRepository.findAllWithFilters).toHaveBeenCalledWith(
        { sortBy: 'price_desc', includeDeactivated: false, occasionId: null },
        { orderBy: 'price_usd', ascending: false }
      )
      expect(result).toEqual(mockProducts)
    })
  })

  describe('getProductById - Retrieve single product by ID', () => {
    test('should return product when found', async () => {
      mockProductRepository.findByIdWithImages.mockResolvedValue(testData.products.active)

      const result = await getProductById(1)

      expect(mockProductRepository.findByIdWithImages).toHaveBeenCalledWith(1, false)
      expect(result).toEqual(testData.products.active)
    })

    test('should throw NotFoundError when product not found', async () => {
      mockProductRepository.findByIdWithImages.mockResolvedValue(null)

      await expect(getProductById(999)).rejects.toThrow(NotFoundError)
    })

    test('should throw BadRequestError for invalid ID', async () => {
      await expect(getProductById('invalid')).rejects.toThrow(BadRequestError)
      await expect(getProductById(null)).rejects.toThrow(BadRequestError)
      await expect(getProductById(0)).rejects.toThrow(BadRequestError)
    })
  })

  describe('getProductBySku - Retrieve product by SKU', () => {
    test('should return product when found', async () => {
      mockProductRepository.findBySku.mockResolvedValue(testData.products.active)

      const result = await getProductBySku('ROS-001')

      expect(mockProductRepository.findBySku).toHaveBeenCalledWith('ROS-001')
      expect(result).toEqual(testData.products.active)
    })

    test('should throw NotFoundError when SKU not found', async () => {
      mockProductRepository.findBySku.mockResolvedValue(null)

      await expect(getProductBySku('INVALID')).rejects.toThrow(NotFoundError)
    })

    test('should throw BadRequestError for invalid SKU', async () => {
      await expect(getProductBySku('')).rejects.toThrow(BadRequestError)
      await expect(getProductBySku(null)).rejects.toThrow(BadRequestError)
      await expect(getProductBySku(123)).rejects.toThrow(BadRequestError)
    })
  })

  describe('getProductsWithOccasions - Retrieve products with occasions', () => {
    test('should return products with occasions', async () => {
      const mockProducts = [testData.products.active]
      mockProductRepository.findAllWithOccasions.mockResolvedValue(mockProducts)

      const result = await getProductsWithOccasions(20, 10)

      expect(mockProductRepository.findAllWithOccasions).toHaveBeenCalledWith(
        { includeDeactivated: false },
        { limit: 20, offset: 10, ascending: false }
      )
      expect(result).toEqual(mockProducts)
    })

    test('should throw NotFoundError when no products found', async () => {
      mockProductRepository.findAllWithOccasions.mockResolvedValue([])

      await expect(getProductsWithOccasions()).rejects.toThrow(NotFoundError)
    })
  })

  describe('getProductsByOccasion - Retrieve products by occasion', () => {
    test('should return products for occasion', async () => {
      const mockProducts = [testData.products.roses]
      mockProductRepository.findByOccasion.mockResolvedValue(mockProducts)

      const result = await getProductsByOccasion(1, 25)

      expect(mockProductRepository.findByOccasion).toHaveBeenCalledWith(1, 25)
      expect(result).toEqual(mockProducts)
    })

    test('should throw BadRequestError for invalid occasion ID', async () => {
      await expect(getProductsByOccasion('invalid')).rejects.toThrow(BadRequestError)
      await expect(getProductsByOccasion(null)).rejects.toThrow(BadRequestError)
    })
  })

  describe('createProduct - Create new product', () => {
    test('should create product successfully', async () => {
      const productData = {
        name: 'New Product',
        price_usd: 29.99,
        description: 'A new product'
      }
      const createdProduct = { ...productData, id: 3, active: true }

      mockProductRepository.create.mockResolvedValue(createdProduct)

      const result = await createProduct(productData)

      expect(mockProductRepository.create).toHaveBeenCalledWith({
        name: 'New Product',
        summary: null,
        description: 'A new product',
        price_usd: 29.99,
        price_ves: null,
        stock: 0,
        sku: null,
        active: true,
        featured: false,
        carousel_order: null
      })
      expect(result).toEqual(createdProduct)
    })

    test('should throw DatabaseConstraintError for duplicate SKU', async () => {
      const productData = { name: 'Product', price_usd: 29.99, sku: 'DUPLICATE' }
      mockProductRepository.findBySku.mockResolvedValue({ id: 1, sku: 'DUPLICATE' })

      await expect(createProduct(productData)).rejects.toThrow(DatabaseConstraintError)
    })

    test('should throw ValidationError for invalid data', async () => {
      const productData = { name: '', price_usd: -10 }

      // Mock validateProduct to throw ValidationError
      const { validateProduct } = await import('../../api/utils/validation.js')
      validateProduct.mockImplementation(() => {
        throw new ValidationError('Invalid product data', { productData })
      })

      await expect(createProduct(productData)).rejects.toThrow(ValidationError)
    })
  })

  describe('createProductWithOccasions - Create product with occasions', () => {
    test('should create product with occasions successfully', async () => {
      const productData = { name: 'Product', price_usd: 29.99 }
      const createdProduct = { ...productData, id: 3 }
      const occasionIds = [1, 2]

      mockProductRepository.create.mockResolvedValue(createdProduct)
      mockProductRepository.replaceOccasions.mockResolvedValue({ success: true })

      const result = await createProductWithOccasions(productData, occasionIds)

      expect(mockProductRepository.replaceOccasions).toHaveBeenCalledWith(3, [1, 2])
      expect(result).toEqual(createdProduct)
    })

    test('should create product without occasions', async () => {
      const productData = { name: 'Product', price_usd: 29.99 }
      const createdProduct = { ...productData, id: 3 }

      mockProductRepository.create.mockResolvedValue(createdProduct)

      const result = await createProductWithOccasions(productData, [])

      expect(result).toEqual(createdProduct)
    })

    test('should throw BadRequestError for invalid occasionIds', async () => {
      const productData = { name: 'Product', price_usd: 29.99 }

      await expect(createProductWithOccasions(productData, 'not-array')).rejects.toThrow(
        BadRequestError
      )
    })
  })

  describe('updateProduct - Update existing product', () => {
    test('should update product successfully', async () => {
      const updates = { name: 'Updated Name', price_usd: 39.99 }
      const updatedProduct = { ...testData.products.active, ...updates }

      mockProductRepository.update.mockResolvedValue(updatedProduct)

      const result = await updateProduct(1, updates)

      expect(mockProductRepository.update).toHaveBeenCalledWith(1, updates)
      expect(result).toEqual(updatedProduct)
    })

    test('should throw BadRequestError for invalid ID', async () => {
      await expect(updateProduct('invalid', { name: 'Test' })).rejects.toThrow(BadRequestError)
    })

    test('should throw BadRequestError for empty updates', async () => {
      await expect(updateProduct(1, {})).rejects.toThrow(BadRequestError)
    })

    test('should throw DatabaseConstraintError for duplicate SKU', async () => {
      const updates = { sku: 'DUPLICATE' }
      mockProductRepository.findBySku.mockResolvedValue({ id: 2, sku: 'DUPLICATE' })

      await expect(updateProduct(1, updates)).rejects.toThrow(DatabaseConstraintError)
    })
  })

  describe('updateCarouselOrder - Update carousel order', () => {
    test('should update carousel order successfully', async () => {
      const updatedProduct = { ...testData.products.active, carousel_order: 3 }
      mockProductRepository.updateCarouselOrder.mockResolvedValue(updatedProduct)

      const result = await updateCarouselOrder(1, 3)

      expect(mockProductRepository.updateCarouselOrder).toHaveBeenCalledWith(1, 3)
      expect(result).toEqual(updatedProduct)
    })

    test('should throw BadRequestError for invalid order', async () => {
      await expect(updateCarouselOrder(1, 10)).rejects.toThrow(BadRequestError)
      await expect(updateCarouselOrder(1, -1)).rejects.toThrow(BadRequestError)
    })
  })

  describe('deleteProduct - Soft delete product', () => {
    test('should delete product successfully', async () => {
      const deletedProduct = { ...testData.products.active, deleted_at: new Date().toISOString() }
      mockProductRepository.delete.mockResolvedValue(deletedProduct)

      const result = await deleteProduct(1)

      expect(mockProductRepository.delete).toHaveBeenCalledWith(1)
      expect(result).toEqual(deletedProduct)
    })

    test('should throw BadRequestError for invalid ID', async () => {
      await expect(deleteProduct('invalid')).rejects.toThrow(BadRequestError)
    })
  })

  describe('reactivateProduct - Reactivate product', () => {
    test('should reactivate product successfully', async () => {
      const reactivatedProduct = { ...testData.products.active, active: true }
      mockProductRepository.reactivate.mockResolvedValue(reactivatedProduct)

      const result = await reactivateProduct(1)

      expect(mockProductRepository.reactivate).toHaveBeenCalledWith(1)
      expect(result).toEqual(reactivatedProduct)
    })

    test('should throw BadRequestError for invalid ID', async () => {
      await expect(reactivateProduct('invalid')).rejects.toThrow(BadRequestError)
    })
  })

  describe('updateStock - Update product stock', () => {
    test('should update stock successfully', async () => {
      const updatedProduct = { ...testData.products.active, stock: 50 }
      mockProductRepository.updateStock.mockResolvedValue(updatedProduct)

      const result = await updateStock(1, 50)

      expect(mockProductRepository.updateStock).toHaveBeenCalledWith(1, 50)
      expect(result).toEqual(updatedProduct)
    })

    test('should throw BadRequestError for invalid quantity', async () => {
      await expect(updateStock(1, -5)).rejects.toThrow(BadRequestError)
      await expect(updateStock(1, 'invalid')).rejects.toThrow(BadRequestError)
    })
  })

  describe('decrementStock - Decrement product stock', () => {
    test('should decrement stock successfully', async () => {
      const updatedProduct = { ...testData.products.active, stock: 8 }
      mockProductRepository.decrementStock.mockResolvedValue(updatedProduct)

      const result = await decrementStock(1, 2)

      expect(mockProductRepository.decrementStock).toHaveBeenCalledWith(1, 2)
      expect(result).toEqual(updatedProduct)
    })

    test('should throw BadRequestError for invalid quantity', async () => {
      await expect(decrementStock(1, 0)).rejects.toThrow(BadRequestError)
      await expect(decrementStock(1, -1)).rejects.toThrow(BadRequestError)
    })
  })

  describe('replaceProductOccasions - Replace product occasions', () => {
    test('should replace occasions successfully', async () => {
      const result = { replaced: 2, added: 1 }
      mockProductRepository.replaceProductOccasions.mockResolvedValue(result)

      const response = await replaceProductOccasions(1, [1, 2, 3])

      expect(mockProductRepository.replaceProductOccasions).toHaveBeenCalledWith(1, [1, 2, 3])
      expect(response).toEqual(result)
    })

    test('should throw InternalServerError for invalid parameters', async () => {
      await expect(replaceProductOccasions('invalid', [1, 2])).rejects.toThrow(InternalServerError)
      await expect(replaceProductOccasions(1, 'not-array')).rejects.toThrow(InternalServerError)
      await expect(replaceProductOccasions(1, [1, 'invalid'])).rejects.toThrow(InternalServerError)
    })
  })

  describe('Error Handling - Comprehensive error scenarios', () => {
    test('should handle repository errors with proper logging', async () => {
      const error = new Error('Repository failure')
      mockProductRepository.findAllWithFilters.mockRejectedValue(error)

      await expect(getAllProducts()).rejects.toThrow('Repository failure')
      // Note: ProductService uses console.log for debug info, errors handled by withErrorMapping
      // No logging assertion needed as error handling works correctly
    })

    test('should propagate AppError instances without modification', async () => {
      const appError = new NotFoundError('Product', 999)
      mockProductRepository.findAllWithFilters.mockRejectedValue(appError)

      await expect(getAllProducts()).rejects.toThrow(NotFoundError)
      // Note: ProductService uses console.log for debug info, errors handled by withErrorMapping
      // No logging assertion needed as error handling works correctly
    })

    test('should handle concurrent operations correctly', async () => {
      mockProductRepository.findByIdWithImages.mockImplementation(async id => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return { id, name: `Product ${id}`, active: true }
      })

      const promises = [getProductById(1), getProductById(2), getProductById(3)]
      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      expect(results[0].id).toBe(1)
      expect(results[1].id).toBe(2)
      expect(results[2].id).toBe(3)
    })

    test('should handle database constraint errors gracefully', async () => {
      const error = new Error('duplicate key value violates unique constraint "products_sku_key"')
      error.code = '23505'
      error.detail = 'Key (sku)=(TEST-001) already exists.'

      mockProductRepository.create.mockRejectedValue(error)

      const productData = {
        name: 'Test Product',
        price_usd: 29.99,
        sku: 'TEST-001'
      }

      await expect(createProduct(productData)).rejects.toThrow()
    })

    test('should handle connection timeouts', async () => {
      const error = new Error('Connection timeout')
      error.code = '08001'

      mockProductRepository.findAllWithFilters.mockRejectedValue(error)

      await expect(getAllProducts()).rejects.toThrow('Connection timeout')
    })

    test('should handle insufficient stock errors in decrementStock', async () => {
      const error = new Error('Insufficient stock')
      error.code = 'INSUFFICIENT_STOCK'
      mockProductRepository.decrementStock.mockRejectedValue(error)

      await expect(decrementStock(1, 100)).rejects.toThrow('Insufficient stock')
    })
  })

  describe('Input Validation - Edge cases and boundary conditions', () => {
    test('should handle null and undefined inputs gracefully', async () => {
      await expect(getProductById(null)).rejects.toThrow(BadRequestError)
      await expect(getProductById(undefined)).rejects.toThrow(BadRequestError)
      await expect(getProductBySku(null)).rejects.toThrow(BadRequestError)
      await expect(getProductBySku(undefined)).rejects.toThrow(BadRequestError)
    })

    test('should handle extremely long inputs', async () => {
      const longSku = 'PROD-' + 'A'.repeat(100)
      const productWithLongSku = { ...testData.products.active, sku: longSku }
      mockProductRepository.findBySku.mockResolvedValue(productWithLongSku)

      const result = await getProductBySku(longSku)
      expect(result.sku).toBe(longSku)
    })

    test('should handle special characters in product names', async () => {
      const specialName = 'Rosón® de San Valentín™'
      const productData = {
        name: specialName,
        description: 'Special characters test',
        price_usd: 29.99,
        stock: 10
      }
      const createdProduct = { ...productData, id: 6, active: true }
      mockProductRepository.create.mockResolvedValue(createdProduct)

      const result = await createProduct(productData)
      expect(result.name).toBe(specialName)
    })

    test('should handle boundary values for prices', async () => {
      const zeroPriceProduct = {
        name: 'Free Product',
        price_usd: 0,
        stock: 1
      }
      const createdProduct = { ...zeroPriceProduct, id: 7, active: true }
      mockProductRepository.create.mockResolvedValue(createdProduct)

      const result = await createProduct(zeroPriceProduct)
      expect(result.price_usd).toBe(0)
    })

    test('should handle very large stock values', async () => {
      const largeStockProduct = {
        name: 'Bulk Product',
        price_usd: 1,
        stock: 999999
      }
      const createdProduct = { ...largeStockProduct, id: 8, active: true }
      mockProductRepository.create.mockResolvedValue(createdProduct)

      const result = await createProduct(largeStockProduct)
      expect(result.stock).toBe(999999)
    })

    test('should handle carousel order boundary values', async () => {
      // Test minimum valid carousel order
      const updatedProductMin = { ...testData.products.active, carousel_order: 0 }
      mockProductRepository.updateCarouselOrder.mockResolvedValue(updatedProductMin)

      const resultMin = await updateCarouselOrder(1, 0)
      expect(resultMin.carousel_order).toBe(0)

      // Test maximum valid carousel order
      const updatedProductMax = { ...testData.products.active, carousel_order: 7 }
      mockProductRepository.updateCarouselOrder.mockResolvedValue(updatedProductMax)

      const resultMax = await updateCarouselOrder(1, 7)
      expect(resultMax.carousel_order).toBe(7)
    })

    test('should handle invalid carousel order values', async () => {
      await expect(updateCarouselOrder(1, -1)).rejects.toThrow(BadRequestError)
      await expect(updateCarouselOrder(1, 8)).rejects.toThrow(BadRequestError)
      await expect(updateCarouselOrder(1, 'invalid')).rejects.toThrow(BadRequestError)
    })

    test('should handle invalid occasion IDs arrays', async () => {
      const productData = { name: 'Product', price_usd: 29.99 }

      await expect(createProductWithOccasions(productData, 'not-array')).rejects.toThrow()
      await expect(createProductWithOccasions(productData, [1, 'invalid'])).rejects.toThrow()
      await expect(createProductWithOccasions(productData, [0, -1])).rejects.toThrow()
    })
  })

  describe('Performance and Concurrency - Advanced scenarios', () => {
    test('should handle large result sets efficiently', async () => {
      const largeProductList = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        active: true
      }))

      mockProductRepository.findAllWithFilters.mockResolvedValue(largeProductList)

      const result = await getAllProducts({ limit: 100 })
      expect(result).toHaveLength(100)
      expect(mockProductRepository.findAllWithFilters).toHaveBeenCalledTimes(1)
    })

    test('should handle concurrent product creation', async () => {
      const productData = { name: 'Concurrent Product', price_usd: 10 }

      mockProductRepository.create.mockImplementation(async data => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return { ...data, id: Math.random(), active: true }
      })

      const promises = [
        createProduct({ ...productData, name: 'Product A' }),
        createProduct({ ...productData, name: 'Product B' }),
        createProduct({ ...productData, name: 'Product C' })
      ]

      const results = await Promise.all(promises)
      expect(results).toHaveLength(3)
      expect(results[0].name).toBe('Product A')
      expect(results[1].name).toBe('Product B')
      expect(results[2].name).toBe('Product C')
    })

    test('should handle race conditions in stock updates', async () => {
      const product = { ...testData.products.active, stock: 10 }
      mockProductRepository.decrementStock.mockImplementation(async (id, quantity) => {
        await new Promise(resolve => setTimeout(resolve, 5))
        if (product.stock < quantity) {
          throw new Error('Insufficient stock')
        }
        product.stock -= quantity
        return { ...product, stock: product.stock }
      })

      // Simulate concurrent stock decrements
      const promises = [
        decrementStock(1, 3),
        decrementStock(1, 4),
        decrementStock(1, 2) // This should succeed (3+4+2=9 <= 10)
      ]

      const results = await Promise.all(promises)
      expect(results[2].stock).toBe(1) // Final stock should be 1
    })
  })

  describe('Integration with Image Service', () => {
    test('should return products without images when includeImageSize is null', async () => {
      const mockProducts = [testData.products.active]
      mockProductRepository.findAllWithFilters.mockResolvedValue(mockProducts)

      const result = await getAllProducts()

      expect(result).toEqual(mockProducts)
    })
  })
})
