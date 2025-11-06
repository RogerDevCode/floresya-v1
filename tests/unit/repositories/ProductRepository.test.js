/**
 * Product Repository - Granular Unit Tests
 * Based on Kent C. Dodds Testing Trophy & Clean Architecture
 *
 * Coverage Target: 95%
 * Speed Target: < 10ms per test
 * Pattern: Arrange-Act-Assert (AAA)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProductRepository } from '../../../api/repositories/ProductRepository.js'
import { _setupProductRepositoryMock } from '../../utils/repository-mocks.js'

// Mock supabase client
const mockSupabase = _setupProductRepositoryMock()

// Mock data
const mockProduct = {
  id: 1,
  name: 'Test Product',
  sku: 'TEST-001',
  price_usd: 25.99,
  price_ves: 950,
  stock: 100,
  active: true,
  featured: false,
  description: 'Test description',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

// Helper to create mock chain
function createMockChain(response) {
  const single = vi.fn().mockResolvedValue(response)
  const select = vi.fn().mockReturnValue({ single })
  return { select, single }
}

describe('ProductRepository - Granular Unit Tests', () => {
  let repository

  beforeEach(() => {
    // Arrange: Setup repository with mocked client
    repository = new ProductRepository(mockSupabase)
    vi.clearAllMocks()
  })

  // ============================================
  // FIND BY ID TESTS
  // ============================================

  describe('findById()', () => {
    it('should return product when valid ID exists', async () => {
      // Arrange
      const mockData = { data: mockProduct, error: null }
      const selectMock = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockData)
      }
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(selectMock)
      })

      // Act
      const result = await repository.findById(1)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('products')
      expect(selectMock.eq).toHaveBeenCalledWith('id', 1)
      expect(selectMock.single).toHaveBeenCalled()
      expect(result).toEqual(mockProduct)
    })

    it('should return null when product not found', async () => {
      // Arrange
      const mockData = { data: null, error: { code: 'PGRST116' } }
      const selectMock = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockData)
      }
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(selectMock)
      })

      // Act
      const result = await repository.findById(999)

      // Assert
      expect(result).toBeNull()
    })

    it('should include inactive products when includeInactive=true', async () => {
      // Arrange
      const mockData = { data: mockProduct, error: null }
      const selectMock = {
        eq: vi.fn() // This will be called twice
      }
      selectMock.eq.mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockData)
      })
      mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(selectMock) })

      // Act
      const result = await repository.findById(1, true)

      // Assert
      expect(result).toEqual(mockProduct)
    })

    it('should throw error on database error', async () => {
      // Arrange
      const mockError = { code: 'PGRST301', message: 'Database error' }
      const selectMock = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError })
      }
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(selectMock)
      })

      // Act & Assert
      await expect(repository.findById(1)).rejects.toThrow('Database error in products.findById')
    })
  })

  // ============================================
  // FIND ALL TESTS
  // ============================================

  describe('findAll()', () => {
    it('should return all active products when no filters provided', async () => {
      // Arrange
      const mockData = { data: [mockProduct], error: null }
      const selectMock = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue(mockData)
      }
      mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(selectMock) })

      // Act
      const result = await repository.findAll()

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('products')
      expect(selectMock.eq).toHaveBeenCalledWith('active', true)
      expect(result).toEqual([mockProduct])
    })

    it('should filter products by search term', async () => {
      // Arrange
      const mockData = { data: [mockProduct], error: null }
      const selectMock = {
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue(mockData)
      }
      mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(selectMock) })

      // Act
      await repository.findAll({ search: 'Test' })

      // Assert
      expect(selectMock.or).toHaveBeenCalledWith('name.ilike.%Test%,description.ilike.%Test%')
    })

    it('should filter products by SKU', async () => {
      // Arrange
      const mockData = { data: [mockProduct], error: null }
      const selectMock = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue(mockData)
      }
      mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(selectMock) })

      // Act
      await repository.findAll({ sku: 'TEST-001' })

      // Assert
      expect(selectMock.eq).toHaveBeenCalledWith('sku', 'TEST-001')
    })

    it('should filter products by featured flag', async () => {
      // Arrange
      const mockData = { data: [mockProduct], error: null }
      const selectMock = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue(mockData)
      }
      mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(selectMock) })

      // Act
      await repository.findAll({ featured: true })

      // Assert
      expect(selectMock.eq).toHaveBeenCalledWith('featured', true)
    })

    it('should include deactivated products when includeDeactivated=true', async () => {
      // Arrange
      const mockData = { data: [mockProduct], error: null }
      const selectMock = {
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue(mockData)
      }
      mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(selectMock) })

      // Act
      await repository.findAll({ includeDeactivated: true })

      // Assert
      // Should NOT call eq for active filter
      expect(selectMock.eq).not.toHaveBeenCalled()
    })

    it('should apply sorting when sortBy provided', async () => {
      // Arrange
      const mockData = { data: [mockProduct], error: null }
      const selectMock = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue(mockData)
      }
      mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(selectMock) })

      // Act
      await repository.findAll({ sortBy: 'name', ascending: true })

      // Assert
      expect(selectMock.order).toHaveBeenCalledWith('name', { ascending: true })
    })

    it('should apply default sorting when sortBy not provided', async () => {
      // Arrange
      const mockData = { data: [mockProduct], error: null }
      const selectMock = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue(mockData)
      }
      mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(selectMock) })

      // Act
      await repository.findAll()

      // Assert
      expect(selectMock.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should apply pagination when limit provided', async () => {
      // Arrange
      const mockData = { data: [mockProduct], error: null }
      const selectMock = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue(mockData)
      }
      mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(selectMock) })

      // Act
      await repository.findAll({ limit: 10, offset: 0 })

      // Assert
      expect(selectMock.range).toHaveBeenCalledWith(0, 9)
    })

    it('should filter by occasion when occasionId provided', async () => {
      // Arrange
      const mockData = { data: [mockProduct], error: null }
      const selectMock = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue(mockData)
      }
      mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(selectMock) })

      // Act
      await repository.findAll({ occasionId: 5 })

      // Assert
      expect(selectMock.eq).toHaveBeenCalledWith('occasion_id', 5)
    })

    it('should return empty array when no products found', async () => {
      // Arrange
      const mockData = { data: null, error: null }
      const selectMock = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue(mockData)
      }
      mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(selectMock) })

      // Act
      const result = await repository.findAll()

      // Assert
      expect(result).toEqual([])
    })

    it('should throw error on database error', async () => {
      // Arrange
      const mockError = { code: 'PGRST301', message: 'Database error' }
      const selectMock = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockRejectedValue(mockError)
      }
      mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(selectMock) })

      // Act & Assert
      await expect(repository.findAll()).rejects.toThrow('Database error in products.findAll')
    })
  })

  // ============================================
  // CREATE TESTS
  // ============================================

  describe('create()', () => {
    it('should create product with valid data', async () => {
      // Arrange
      const productData = { ...mockProduct, id: undefined }
      const mockData = { data: mockProduct, error: null }
      const selectMock = { single: vi.fn().mockResolvedValue(mockData) }
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue(selectMock)
      })

      // Act
      const result = await repository.create(productData)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('products')
      expect(result).toEqual(mockProduct)
    })

    it('should throw error when duplicate SKU', async () => {
      // Arrange
      const productData = { ...mockProduct, id: undefined }
      const mockError = { code: '23505', message: 'Duplicate key value' }
      const selectMock = { single: vi.fn().mockRejectedValue(mockError) }
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue(selectMock)
      })

      // Act & Assert
      await expect(repository.create(productData)).rejects.toThrow('Duplicate entry in products')
    })

    it('should throw error when required field missing', async () => {
      // Arrange
      const productData = { name: 'Test' } // Missing required fields
      const mockError = { code: '23502', message: 'Null value in column' }
      const selectMock = { single: vi.fn().mockRejectedValue(mockError) }
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue(selectMock)
      })

      // Act & Assert
      await expect(repository.create(productData)).rejects.toThrow(
        'Required field missing in products'
      )
    })

    it('should throw error on database error', async () => {
      // Arrange
      const productData = { ...mockProduct, id: undefined }
      const mockError = { code: 'PGRST301', message: 'Database error' }
      const selectMock = { single: vi.fn().mockRejectedValue(mockError) }
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue(selectMock)
      })

      // Act & Assert
      await expect(repository.create(productData)).rejects.toThrow(
        'Database error in products.create'
      )
    })
  })

  // ============================================
  // UPDATE TESTS
  // ============================================

  describe('update()', () => {
    it('should update product with valid data', async () => {
      // Arrange
      const updateData = { name: 'Updated Product', price_usd: 29.99 }
      const mockData = { data: { ...mockProduct, ...updateData }, error: null }
      const selectMock = {
        eq: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockData)
      }
      mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(selectMock) })

      // Act
      const result = await repository.update(1, updateData)

      // Assert
      expect(result.name).toBe('Updated Product')
      expect(result.price_usd).toBe(29.99)
    })

    it('should throw error when product not found', async () => {
      // Arrange
      const updateData = { name: 'Updated Product' }
      const mockError = { code: 'PGRST116', message: 'Not found' }
      const selectMock = {
        eq: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(mockError)
      }
      mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(selectMock) })

      // Act & Assert
      await expect(repository.update(999, updateData)).rejects.toThrow('products not found')
    })
  })

  // ============================================
  // DELETE TESTS
  // ============================================

  describe('delete()', () => {
    it('should soft delete active product', async () => {
      // Arrange
      const mockData = {
        data: { ...mockProduct, is_active: false, deleted_at: '2024-01-01T00:00:00.000Z' },
        error: null
      }
      const selectMock = {
        eq: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockData)
      }
      mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(selectMock) })

      // Act
      const result = await repository.delete(1, { deletedBy: 123, reason: 'Test' })

      // Assert
      expect(result.is_active).toBe(false)
      expect(result.deleted_at).toBeDefined()
    })

    it('should throw error when product not found', async () => {
      // Arrange
      const mockError = { code: 'PGRST116', message: 'Not found' }
      const selectMock = {
        eq: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(mockError)
      }
      mockSupabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(selectMock) })

      // Act & Assert
      await expect(repository.delete(999, {})).rejects.toThrow('products not found')
    })
  })

  // ============================================
  // EXISTS TESTS
  // ============================================

  describe('exists()', () => {
    it('should return true when product exists', async () => {
      // Arrange
      const mockChain = createMockChain({ data: { id: 1 }, error: null })
      mockSupabase.from.mockReturnValue(mockChain)

      // Act
      const result = await repository.exists(1)

      // Assert
      expect(result).toBe(true)
    })

    it('should return false when product does not exist', async () => {
      // Arrange
      const mockChain = createMockChain({ data: null, error: { code: 'PGRST116' } })
      mockSupabase.from.mockReturnValue(mockChain)

      // Act
      const result = await repository.exists(999)

      // Assert
      expect(result).toBe(false)
    })
  })

  // ============================================
  // COUNT TESTS
  // ============================================

  describe('count()', () => {
    it('should return total count when no filters', async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 100, error: null })
        })
      })

      // Act
      const result = await repository.count()

      // Assert
      expect(result).toBe(100)
    })

    it('should apply filters to count', async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 25, error: null })
        })
      })

      // Act
      const result = await repository.count({ active: true })

      // Assert
      expect(result).toBe(25)
    })
  })

  // ============================================
  // DECREMENT STOCK TESTS
  // ============================================

  describe('decrementStock()', () => {
    it('should decrement stock by specified quantity', async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: { stock: 100 },
            error: null
          })
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { ...mockProduct, stock: 95 },
                error: null
              })
            })
          })
        })
      })

      // Act
      const result = await repository.decrementStock(1, 5)

      // Assert
      expect(result.stock).toBe(95)
    })

    it('should set updated_at timestamp', async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: { stock: 100 },
            error: null
          })
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { ...mockProduct, stock: 95, updated_at: '2024-01-01T00:00:00Z' },
                error: null
              })
            })
          })
        })
      })

      // Act
      await repository.decrementStock(1, 5)

      // Assert
      expect(mockSupabase.from).toHaveBeenCalled()
    })

    it('should throw error when product not found', async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }
          })
        })
      })

      // Act & Assert
      await expect(repository.decrementStock(999, 5)).rejects.toThrow()
    })
  })
})
