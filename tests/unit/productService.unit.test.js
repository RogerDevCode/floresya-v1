/**
 * Product Service Unit Tests
 * Testing all functions in productService.js with proper mocking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as productService from '../../api/services/productService.js'
import { supabase } from '../../api/services/supabaseClient.js'

// Mock the Supabase client to avoid actual database calls
vi.mock('../../api/services/supabaseClient.js', async () => {
  const actual = await vi.importActual('../../api/services/supabaseClient.js')
  return {
    ...actual,
    supabase: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      rpc: vi.fn().mockReturnThis()
    }
  }
})

// Mock error classes
vi.mock('../../api/errors/AppError.js', async () => {
  const actual = await vi.importActual('../../api/errors/AppError.js')
  return {
    ...actual,
    ValidationError: class ValidationError extends Error {
      constructor(message, errors) {
        super(message)
        this.name = 'ValidationError'
        this.errors = errors
      }
    },
    NotFoundError: class NotFoundError extends Error {
      constructor(resource, id, context) {
        super(`${resource} not found with id: ${id}`)
        this.name = 'NotFoundError'
        this.resource = resource
        this.id = id
        this.context = context
      }
    },
    DatabaseError: class DatabaseError extends Error {
      constructor(operation, table, originalError, context) {
        super(`Database ${operation} failed on ${table}`)
        this.name = 'DatabaseError'
        this.operation = operation
        this.table = table
        this.originalError = originalError
        this.context = context
      }
    },
    DatabaseConstraintError: class DatabaseConstraintError extends Error {
      constructor(constraint, table, context) {
        super(`Database constraint ${constraint} violated on ${table}`)
        this.name = 'DatabaseConstraintError'
        this.constraint = constraint
        this.table = table
        this.context = context
      }
    },
    BadRequestError: class BadRequestError extends Error {
      constructor(message, context) {
        super(message)
        this.name = 'BadRequestError'
        this.context = context
      }
    },
    InsufficientStockError: class InsufficientStockError extends Error {
      constructor(productId, requested, available) {
        super(
          `Insufficient stock for product ${productId}: requested ${requested}, available ${available}`
        )
        this.name = 'InsufficientStockError'
        this.productId = productId
        this.requested = requested
        this.available = available
      }
    }
  }
})

// Mock the productImageService for functions that import it
vi.mock('../../api/services/productImageService.js', () => ({
  getProductsBatchWithImageSize: vi.fn(),
  getProductWithImageSize: vi.fn()
}))

describe('Product Service Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllProducts', () => {
    it('should return active products with default filters', async () => {
      // Arrange
      const mockProducts = [
        { id: 1, name: 'Product 1', active: true },
        { id: 2, name: 'Product 2', active: true }
      ]

      // Create a mock query object that returns data when awaited
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        // The key is that the query itself is awaitable
        then: vi.fn(resolve => resolve({ data: mockProducts, error: null }))
      }

      vi.mocked(supabase.from).mockReturnValue(mockQuery)

      // Act
      const result = await productService.getAllProducts()

      // Assert
      expect(result).toEqual(mockProducts)
      expect(supabase.from).toHaveBeenCalledWith('products')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('active', true)
    })

    it('should include inactive products when includeInactive is true', async () => {
      // Arrange
      const mockProducts = [
        { id: 1, name: 'Active Product', active: true },
        { id: 2, name: 'Inactive Product', active: false }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: vi.fn(resolve => resolve({ data: mockProducts, error: null }))
      }

      vi.mocked(supabase.from).mockReturnValue(mockQuery)

      // Act
      const result = await productService.getAllProducts({}, true)

      // Assert
      expect(result).toEqual(mockProducts)
    })

    it('should apply search filters correctly', async () => {
      // Arrange
      const mockProducts = [{ id: 1, name: 'Search Result', active: true }]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: vi.fn(resolve => resolve({ data: mockProducts, error: null }))
      }

      vi.mocked(supabase.from).mockReturnValue(mockQuery)

      // Act
      const result = await productService.getAllProducts({ search: 'test' })

      // Assert
      expect(result).toEqual(mockProducts)
    })
  })

  describe('getProductById', () => {
    it('should return a product by ID when it exists', async () => {
      // Arrange
      const mockProduct = { id: 1, name: 'Test Product', active: true }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: mockProduct,
        error: null
      })

      // Act
      const result = await productService.getProductById(1)

      // Assert
      expect(result).toEqual(mockProduct)
      expect(supabase.from).toHaveBeenCalledWith('products')
      expect(supabase.select).toHaveBeenCalledWith('*')
      expect(supabase.eq).toHaveBeenCalledWith('id', 1)
      expect(supabase.eq).toHaveBeenCalledWith('active', true)
    })

    it('should throw ValidationError when ID is invalid', async () => {
      // Act & Assert
      await expect(productService.getProductById('invalid')).rejects.toThrow(
        'Invalid product ID: must be a number'
      )
      await expect(productService.getProductById(null)).rejects.toThrow(
        'Invalid product ID: must be a number'
      )
      await expect(productService.getProductById(0)).rejects.toThrow(
        'Invalid product ID: must be a number'
      )
    })

    it('should return inactive product when includeInactive is true', async () => {
      // Arrange
      const mockProduct = { id: 1, name: 'Inactive Product', active: false }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: mockProduct,
        error: null
      })

      // Act
      const result = await productService.getProductById(1, true)

      // Assert
      expect(result).toEqual(mockProduct)
      // Should not filter by active = true when includeInactive is true
      const callsToEq = vi.mocked(supabase.eq).mock.calls.map(call => call[0])
      expect(callsToEq).not.toContain('active')
    })
  })

  describe('createProduct', () => {
    it('should create a product with valid data', async () => {
      // Arrange
      const newProductData = {
        name: 'New Product',
        price_usd: 29.99,
        stock: 10
      }

      const createdProduct = {
        id: 1,
        ...newProductData,
        active: true,
        featured: false
      }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.insert).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: createdProduct,
        error: null
      })

      // Act
      const result = await productService.createProduct(newProductData)

      // Assert
      expect(result).toEqual(createdProduct)
      expect(supabase.from).toHaveBeenCalledWith('products')
      expect(supabase.insert).toHaveBeenCalledWith({
        name: 'New Product',
        summary: null,
        description: null,
        price_usd: 29.99,
        price_ves: null,
        stock: 10,
        sku: null,
        active: true,
        featured: false,
        carousel_order: null
      })
      expect(supabase.select).toHaveBeenCalled()
      expect(supabase.single).toHaveBeenCalled()
    })

    it('should throw ValidationError for invalid product data', async () => {
      // Arrange
      const invalidProductData = {
        name: '', // Invalid: empty name
        price_usd: -10 // Invalid: negative price
      }

      // Act & Assert
      await expect(productService.createProduct(invalidProductData)).rejects.toThrow(
        'Product validation failed'
      )
    })

    it('should throw DatabaseConstraintError for duplicate SKU', async () => {
      // Arrange
      const productData = {
        name: 'Test Product',
        price_usd: 29.99,
        sku: 'DUPLICATE-SKU'
      }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.insert).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint' }
      })

      // Act & Assert
      await expect(productService.createProduct(productData)).rejects.toThrow(
        'Database constraint unique_sku violated on'
      )
    })
  })

  describe('updateProduct', () => {
    it('should update a product with valid changes', async () => {
      // Arrange
      const updatedProduct = {
        id: 1,
        name: 'Updated Product',
        price_usd: 39.99,
        active: true
      }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.update).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: updatedProduct,
        error: null
      })

      // Act
      const result = await productService.updateProduct(1, {
        name: 'Updated Product',
        price_usd: 39.99
      })

      // Assert
      expect(result).toEqual(updatedProduct)
      expect(supabase.update).toHaveBeenCalledWith({
        name: 'Updated Product',
        price_usd: 39.99
      })
      expect(supabase.eq).toHaveBeenCalledWith('id', 1)
      expect(supabase.eq).toHaveBeenCalledWith('active', true)
    })

    it('should throw ValidationError for invalid update data', async () => {
      // Act & Assert
      await expect(productService.updateProduct(1, { price_usd: -10 })).rejects.toThrow(
        'Product validation failed'
      )
    })

    it('should throw BadRequestError for invalid product ID', async () => {
      // Act & Assert
      await expect(productService.updateProduct('invalid', { name: 'New Name' })).rejects.toThrow(
        'Invalid product ID: must be a number'
      )
      await expect(productService.updateProduct(0, { name: 'New Name' })).rejects.toThrow(
        'Invalid product ID: must be a number'
      )
    })
  })

  describe('deleteProduct', () => {
    it('should soft-delete a product by setting active to false', async () => {
      // Arrange
      const deactivatedProduct = {
        id: 1,
        name: 'Deactivated Product',
        active: false
      }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.update).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: deactivatedProduct,
        error: null
      })

      // Act
      const result = await productService.deleteProduct(1)

      // Assert
      expect(result).toEqual(deactivatedProduct)
      expect(supabase.update).toHaveBeenCalledWith({ active: false })
      expect(supabase.eq).toHaveBeenCalledWith('id', 1)
      expect(supabase.eq).toHaveBeenCalledWith('active', true) // Only active products can be deleted
    })

    it('should throw BadRequestError for invalid product ID', async () => {
      // Act & Assert
      await expect(productService.deleteProduct('invalid')).rejects.toThrow(
        'Invalid product ID: must be a number'
      )
      await expect(productService.deleteProduct(null)).rejects.toThrow(
        'Invalid product ID: must be a number'
      )
    })
  })

  describe('getCarouselProducts', () => {
    it('should return products for carousel display', async () => {
      // Arrange
      const mockProducts = [
        { id: 1, name: 'Carousel Product 1', carousel_order: 1, active: true },
        { id: 2, name: 'Carousel Product 2', carousel_order: 2, active: true }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: vi.fn(resolve => resolve({ data: mockProducts, error: null }))
      }

      vi.mocked(supabase.from).mockReturnValue(mockQuery)

      // Mock the productImageService function that gets called
      const { getProductsBatchWithImageSize } = await import(
        '../../api/services/productImageService.js'
      )
      vi.mocked(getProductsBatchWithImageSize).mockResolvedValue(mockProducts)

      // Act
      const result = await productService.getCarouselProducts()

      // Assert
      expect(result).toEqual(mockProducts)
    })
  })

  describe('updateStock', () => {
    it('should update product stock successfully', async () => {
      // Arrange
      const updatedProduct = { id: 1, name: 'Product', stock: 50, active: true }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.update).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: updatedProduct,
        error: null
      })

      // Act
      const result = await productService.updateStock(1, 50)

      // Assert
      expect(result).toEqual(updatedProduct)
      expect(supabase.update).toHaveBeenCalledWith({ stock: 50 })
      expect(supabase.eq).toHaveBeenCalledWith('id', 1)
      expect(supabase.eq).toHaveBeenCalledWith('active', true)
    })

    it('should throw error for invalid quantity', async () => {
      // Act & Assert
      await expect(productService.updateStock(1, -5)).rejects.toThrow(
        'Invalid quantity: must be a non-negative number'
      )
      await expect(productService.updateStock(1, 'invalid')).rejects.toThrow(
        'Invalid quantity: must be a non-negative number'
      )
    })
  })

  describe('decrementStock', () => {
    it('should decrement stock when sufficient quantity available', async () => {
      // Arrange - First call is for getProductById, second for updateStock
      const productWithStock = { id: 1, name: 'Product', stock: 10, active: true }
      const updatedProduct = { id: 1, name: 'Product', stock: 8, active: true }

      // Mock the calls in sequence
      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.single)
        .mockResolvedValueOnce({
          data: productWithStock,
          error: null
        })
        .mockResolvedValueOnce({
          data: updatedProduct,
          error: null
        })

      // Act
      const result = await productService.decrementStock(1, 2)

      // Assert
      expect(result).toEqual(updatedProduct)
      expect(supabase.update).toHaveBeenCalledWith({ stock: 8 }) // 10 - 2 = 8
    })

    it('should throw InsufficientStockError when current stock is less than requested decrement', async () => {
      // Arrange
      const productWithLowStock = { id: 1, name: 'Product', stock: 1, active: true }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValueOnce({
        data: productWithLowStock,
        error: null
      })

      // Act & Assert
      await expect(productService.decrementStock(1, 5)).rejects.toThrow(
        'Insufficient stock for product 1: requested 5, available 1'
      )
    })
  })
})
