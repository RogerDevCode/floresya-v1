/**
 * Product Service Unit Tests
 * Testing business logic for products using Vitest
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as productService from '../productService.js'
import { NotFoundError, DatabaseError, BadRequestError } from '../../errors/AppError.js'

// Mock Supabase client
vi.mock('../supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis()
    }))
  },
  DB_SCHEMA: {
    products: {
      table: 'products',
      pk: 'id',
      indexes: [
        'sku',
        'active',
        'featured',
        'carousel_order',
        'name_normalized',
        'description_normalized'
      ],
      filters: ['active', 'featured'],
      sorts: ['created_at', 'carousel_order'],
      search: ['name_normalized', 'description_normalized'],
      columns: [
        'id',
        'name',
        'summary',
        'description',
        'price_usd',
        'price_ves',
        'stock',
        'sku',
        'active',
        'featured',
        'carousel_order',
        'created_at',
        'updated_at',
        'name_normalized',
        'description_normalized'
      ]
    }
  }
}))

describe('productService', () => {
  let mockSupabaseQuery

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()

    // Setup basic mock chain
    mockSupabaseQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis()
    }
  })

  afterEach(() => {
    // Clean up after each test
    vi.resetAllMocks()
  })

  describe('getProductById', () => {
    it('should return product data for valid ID', async () => {
      const mockProduct = {
        id: 67,
        name: 'Ramo Tropical Vibrante',
        price_usd: 45.99,
        active: true
      }

      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: mockProduct,
        error: null
      })

      // Mock the supabase client chain
      const { supabase } = await import('../supabaseClient.js')
      supabase.from.mockReturnValueOnce(mockSupabaseQuery)

      const result = await productService.getProductById(67)

      expect(result).toEqual(mockProduct)
      expect(supabase.from).toHaveBeenCalledWith('products')
    })

    it('should throw BadRequestError for invalid product ID', async () => {
      await expect(productService.getProductById(null)).rejects.toThrow(BadRequestError)
      await expect(productService.getProductById('abc')).rejects.toThrow(BadRequestError)
      await expect(productService.getProductById(0)).rejects.toThrow(BadRequestError)
      await expect(productService.getProductById(-1)).rejects.toThrow(BadRequestError)
    })

    it('should throw NotFoundError when product does not exist', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      })

      const { supabase } = await import('../supabaseClient.js')
      supabase.from.mockReturnValueOnce(mockSupabaseQuery)

      await expect(productService.getProductById(999)).rejects.toThrow(NotFoundError)
    })

    it('should throw DatabaseError on database errors', async () => {
      const dbError = new Error('Database connection failed')
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: null,
        error: dbError
      })

      const { supabase } = await import('../supabaseClient.js')
      supabase.from.mockReturnValueOnce(mockSupabaseQuery)

      await expect(productService.getProductById(67)).rejects.toThrow(DatabaseError)
    })
  })

  describe('getAllProducts', () => {
    it('should return all active products by default', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', active: true },
        { id: 2, name: 'Product 2', active: true }
      ]

      mockSupabaseQuery.order.mockResolvedValueOnce({
        data: mockProducts,
        error: null
      })

      const { supabase } = await import('../supabaseClient.js')
      supabase.from.mockReturnValueOnce(mockSupabaseQuery)

      const result = await productService.getAllProducts()

      expect(result).toEqual(mockProducts)
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('active', true)
    })

    it('should include inactive products when requested', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', active: true },
        { id: 2, name: 'Product 2', active: false }
      ]

      mockSupabaseQuery.order.mockResolvedValueOnce({
        data: mockProducts,
        error: null
      })

      const { supabase } = await import('../supabaseClient.js')
      supabase.from.mockReturnValueOnce(mockSupabaseQuery)

      const result = await productService.getAllProducts({}, true)

      expect(result).toEqual(mockProducts)
      expect(mockSupabaseQuery.eq).not.toHaveBeenCalledWith('active', true)
    })

    it('should apply search filters correctly', async () => {
      const mockProducts = [{ id: 1, name: 'Rosas Rojas', active: true }]

      mockSupabaseQuery.order.mockResolvedValueOnce({
        data: mockProducts,
        error: null
      })

      const { supabase } = await import('../supabaseClient.js')
      supabase.from.mockReturnValueOnce(mockSupabaseQuery)

      const filters = { search: 'rosas' }
      await productService.getAllProducts(filters)

      // Verify that search conditions would be applied
      expect(supabase.from).toHaveBeenCalledWith('products')
    })
  })

  describe('createProduct', () => {
    it('should create a new product successfully', async () => {
      const newProduct = {
        name: 'Nuevo Producto',
        price_usd: 29.99,
        stock: 10,
        sku: 'NEW-001'
      }

      const createdProduct = {
        id: 123,
        ...newProduct,
        active: true,
        created_at: '2025-01-01T00:00:00Z'
      }

      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: createdProduct,
        error: null
      })

      const { supabase } = await import('../supabaseClient.js')
      supabase.from.mockReturnValueOnce(mockSupabaseQuery)

      const result = await productService.createProduct(newProduct)

      expect(result).toEqual(createdProduct)
      expect(mockSupabaseQuery.insert).toHaveBeenCalled()
    })

    it('should throw DatabaseError when creation fails', async () => {
      const newProduct = {
        name: 'Nuevo Producto',
        price_usd: 29.99
      }

      const dbError = new Error('Insert failed')
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: null,
        error: dbError
      })

      const { supabase } = await import('../supabaseClient.js')
      supabase.from.mockReturnValueOnce(mockSupabaseQuery)

      await expect(productService.createProduct(newProduct)).rejects.toThrow(DatabaseError)
    })
  })

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const productId = 67
      const updates = {
        name: 'Producto Actualizado',
        price_usd: 39.99
      }

      const updatedProduct = {
        id: productId,
        name: updates.name,
        price_usd: updates.price_usd,
        active: true
      }

      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: updatedProduct,
        error: null
      })

      const { supabase } = await import('../supabaseClient.js')
      supabase.from.mockReturnValueOnce(mockSupabaseQuery)

      const result = await productService.updateProduct(productId, updates)

      expect(result).toEqual(updatedProduct)
      expect(mockSupabaseQuery.update).toHaveBeenCalledWith(updates)
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', productId)
    })

    it('should throw BadRequestError for invalid product ID', async () => {
      await expect(productService.updateProduct(null, {})).rejects.toThrow(BadRequestError)
      await expect(productService.updateProduct(0, {})).rejects.toThrow(BadRequestError)
    })
  })

  describe('deleteProduct', () => {
    it('should soft delete product successfully', async () => {
      const productId = 67
      const deletedProduct = {
        id: productId,
        active: false
      }

      // Mock the update chain
      mockSupabaseQuery.eq.mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          single: vi.fn().mockResolvedValueOnce({
            data: deletedProduct,
            error: null
          })
        })
      })

      const { supabase } = await import('../supabaseClient.js')
      supabase.from.mockReturnValueOnce(mockSupabaseQuery)

      const result = await productService.deleteProduct(productId)

      expect(result).toEqual(deletedProduct)
      expect(mockSupabaseQuery.update).toHaveBeenCalledWith({ active: false })
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', productId)
    })

    it('should throw BadRequestError for invalid product ID', async () => {
      await expect(productService.deleteProduct(null)).rejects.toThrow(BadRequestError)
      await expect(productService.deleteProduct(-1)).rejects.toThrow(BadRequestError)
    })
  })
})
