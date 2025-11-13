/**
 * Supabase Client Mocking Test
 * Tests basic Supabase operations with proper Vitest mocking
 *
 * Sources:
 * - Vitest docs: https://vitest.dev/guide/mocking.html
 * - Supabase testing guide: https://supabase.com/docs/guides/testing
 * - Jest/Vitest best practices: https://jestjs.io/docs/mock-functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase client using vi.mock() - following Vitest best practices
vi.mock('../api/services/supabaseClient.js', () => {
  // Create mock query chain following Supabase client structure
  const createMockQuery = () => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }) // Default resolved value
  })

  return {
    supabase: {
      from: vi.fn(table => createMockQuery()),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'test-url' } })
        }))
      }
    },
    DB_SCHEMA: {
      products: {
        table: 'products',
        columns: ['id', 'name', 'active']
      }
    }
  }
})

// Import after mocking
import { supabase } from '../api/services/supabaseClient.js'

describe('Supabase Client Mocking Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Supabase Operations', () => {
    it('should mock select query successfully', async () => {
      // Arrange
      const mockData = { id: 1, name: 'Test Product', active: true }

      // Configure mock response - override the default single method
      const mockQuery = supabase.from('products')
      mockQuery.single = vi.fn().mockResolvedValue({
        data: mockData,
        error: null
      })

      // Act
      const { data, error } = await mockQuery.select('*').eq('id', 1).single()

      // Assert
      expect(error).toBeNull()
      expect(data).toEqual(mockData)
      expect(data.name).toBe('Test Product')
      expect(supabase.from).toHaveBeenCalledWith('products')
    })

    it('should handle select query errors', async () => {
      // Arrange
      const mockError = { code: 'PGRST116', message: 'Not found' }

      // Configure mock to return error - need to create a fresh query instance
      const mockQuery = supabase.from('products')
      // Override the single method for this specific test
      mockQuery.single = vi.fn().mockResolvedValueOnce({
        data: null,
        error: mockError
      })

      // Act
      const { data, error } = await mockQuery.select('*').eq('id', 999).single()

      // Assert
      expect(data).toBeNull()
      expect(error).toEqual(mockError)
      expect(error.code).toBe('PGRST116')
    })

    it('should mock insert operation', async () => {
      // Arrange
      const newProduct = { name: 'New Product', active: true }
      const insertedProduct = { id: 2, ...newProduct }

      // Configure mock response - create fresh query instance
      const mockQuery = supabase.from('products')
      mockQuery.single = vi.fn().mockResolvedValueOnce({
        data: insertedProduct,
        error: null
      })

      // Act
      const { data, error } = await mockQuery.insert(newProduct).select().single()

      // Assert
      expect(error).toBeNull()
      expect(data).toEqual(insertedProduct)
      expect(data.id).toBe(2)
      expect(data.name).toBe('New Product')
    })

    it('should mock update operation', async () => {
      // Arrange
      const updatedProduct = { id: 1, name: 'Updated Product', active: true }

      // Configure mock response - create fresh query instance
      const mockQuery = supabase.from('products')
      mockQuery.single = vi.fn().mockResolvedValueOnce({
        data: updatedProduct,
        error: null
      })

      // Act
      const { data, error } = await mockQuery
        .update({ name: 'Updated Product' })
        .eq('id', 1)
        .select()
        .single()

      // Assert
      expect(error).toBeNull()
      expect(data).toEqual(updatedProduct)
      expect(data.name).toBe('Updated Product')
    })

    it('should mock delete operation', async () => {
      // Arrange
      // Configure mock response for delete - create fresh query instance
      const mockQuery = supabase.from('products')
      mockQuery.single = vi.fn().mockResolvedValue({
        data: null,
        error: null
      })

      // Act
      const result = await mockQuery.delete().eq('id', 1).single()

      // Assert
      expect(result).toEqual({ data: null, error: null })
    })
  })

  describe('Storage Operations', () => {
    it('should mock file upload', async () => {
      // Arrange
      const mockResponse = { data: { path: 'uploads/test.jpg' }, error: null }

      // Configure mock - create fresh storage instance
      const storageMock = supabase.storage.from('products')
      storageMock.upload = vi.fn().mockResolvedValue(mockResponse)

      // Act
      const result = await storageMock.upload('test.jpg', new Blob(['test']))

      // Assert
      expect(result.error).toBeNull()
      expect(result.data.path).toBe('uploads/test.jpg')
    })

    it('should mock public URL generation', async () => {
      // Arrange
      const mockUrl = { data: { publicUrl: 'https://cdn.example.com/test.jpg' } }

      // Configure mock - create fresh storage instance
      const storageMock = supabase.storage.from('products')
      storageMock.getPublicUrl = vi.fn().mockReturnValue(mockUrl)

      // Act
      const result = storageMock.getPublicUrl('test.jpg')

      // Assert
      expect(result.data.publicUrl).toBe('https://cdn.example.com/test.jpg')
    })
  })

  describe('RPC Operations', () => {
    it('should mock stored procedure calls', async () => {
      // Arrange
      const mockResponse = { data: { success: true }, error: null }

      // Configure mock
      supabase.rpc.mockResolvedValueOnce(mockResponse)

      // Act
      const result = await supabase.rpc('test_function', { param: 'value' })

      // Assert
      expect(result.error).toBeNull()
      expect(result.data.success).toBe(true)
      expect(supabase.rpc).toHaveBeenCalledWith('test_function', { param: 'value' })
    })
  })
})
