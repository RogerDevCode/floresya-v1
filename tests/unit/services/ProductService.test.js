/**
 * Product Service - Granular Unit Tests
 * Business Logic Layer Testing
 *
 * Coverage Target: 90%
 * Speed Target: < 50ms per test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setupProductServiceMock } from '../../utils/service-mocks.js'

const mockRepository = {
  findAllWithFilters: vi.fn(),
  findByIdWithImages: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  decrementStock: vi.fn(),
  existsBySku: vi.fn()
}

const mockDIContainer = { resolve: vi.fn(() => mockRepository) }

vi.mock('../../../api/architecture/di-container.js', async () => {
  const actual = await vi.importActual('../../../api/architecture/di-container.js')
  return {
    ...actual,
    default: mockDIContainer
  }
})

vi.mock('../../../api/services/supabaseClient.js', async () => {
  const actual = await vi.importActual('../../../api/services/supabaseClient.js')
  return {
    ...actual,
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null }))
          }))
        }))
      }))
    }
  }
})

vi.mock('../../../api/utils/sanitize.js', () => ({
  sanitizeProductData: vi.fn(data => data)
}))

vi.mock('../../../api/utils/validation.js', () => ({
  validateProduct: vi.fn(() => true),
  validateId: vi.fn(() => true)
}))

vi.mock('../../../api/middleware/error/index.js', () => ({
  withErrorMapping: fn => fn
}))

vi.mock('../../../api/services/productImageService.js', () => ({
  getProductsBatchWithImageSize: vi.fn()
}))

const mockProduct = {
  id: 1,
  name: 'Test Product',
  sku: 'TEST-001',
  price_usd: 25.99,
  price_ves: 912.38,
  stock: 100,
  active: true,
  featured: false,
  carousel_order: 1,
  summary: 'Test summary',
  description: 'Test description'
}

describe('ProductService - Granular Tests', () => {
  let _productService

  beforeEach(() => {
    vi.clearAllMocks()
    _productService = setupProductServiceMock()
  })

  describe('getAllProducts()', () => {
    it('should return products with default filters', async () => {
      // Arrange
      mockRepository.findAllWithFilters.mockResolvedValue([mockProduct])
      const { getAllProducts } = await import('../../../api/services/_productService.js')

      // Act
      const result = await getAllProducts()

      // Assert
      expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(
        { occasion: null, includeDeactivated: false, sortBy: 'created_at' },
        { ascending: false }
      )
      expect(result).toEqual([mockProduct])
    })

    it('should filter by featured products', async () => {
      // Arrange
      mockRepository.findAllWithFilters.mockResolvedValue([mockProduct])
      const { getAllProducts } = await import('../../../api/services/_productService.js')

      // Act
      const result = await getAllProducts({ featured: true })

      // Assert
      expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(
        { featured: true, occasion: null, includeDeactivated: false, sortBy: 'created_at' },
        { ascending: false }
      )
      expect(result).toEqual([mockProduct])
    })

    it('should filter by occasion slug', async () => {
      // Arrange
      mockRepository.findAllWithFilters.mockResolvedValue([mockProduct])
      const { getAllProducts } = await import('../../../api/services/_productService.js')

      // Act
      const result = await getAllProducts({ occasion: 'birthday' })

      // Assert
      expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(
        { occasion: 1, includeDeactivated: false, sortBy: 'created_at' },
        { ascending: false }
      )
      expect(result).toEqual([mockProduct])
    })

    it('should apply pagination', async () => {
      // Arrange
      mockRepository.findAllWithFilters.mockResolvedValue([mockProduct])
      const { getAllProducts } = await import('../../../api/services/_productService.js')

      // Act
      const result = await getAllProducts({ limit: 10, offset: 20 })

      // Assert
      expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(
        { limit: 10, offset: 20, occasion: null, includeDeactivated: false, sortBy: 'created_at' },
        { ascending: false }
      )
      expect(result).toEqual([mockProduct])
    })

    it('should sort by price ascending', async () => {
      // Arrange
      mockRepository.findAllWithFilters.mockResolvedValue([mockProduct])
      const { getAllProducts } = await import('../../../api/services/_productService.js')

      // Act
      const result = await getAllProducts({ sortBy: 'price_asc' })

      // Assert
      expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(
        { sortBy: 'price_asc', occasion: null, includeDeactivated: false },
        { ascending: true }
      )
      expect(result).toEqual([mockProduct])
    })
  })

  describe('getProductById()', () => {
    it('should return product by valid ID', async () => {
      // Arrange
      mockRepository.findByIdWithImages.mockResolvedValue(mockProduct)
      const { getProductById } = await import('../../../api/services/_productService.js')

      // Act
      const result = await getProductById(1)

      // Assert
      expect(mockRepository.findByIdWithImages).toHaveBeenCalledWith(1, false)
      expect(result).toEqual(mockProduct)
    })

    it('should throw error for invalid ID', async () => {
      // Arrange
      const { getProductById } = await import('../../../api/services/_productService.js')

      // Act & Assert
      await expect(getProductById(0)).rejects.toThrow('Invalid product ID')
    })

    it('should throw NotFoundError when product not found', async () => {
      // Arrange
      mockRepository.findByIdWithImages.mockResolvedValue(null)
      const { getProductById } = await import('../../../api/services/_productService.js')

      // Act & Assert
      await expect(getProductById(999)).rejects.toThrow('Product with ID 999 not found')
    })

    it('should include deactivated for admin', async () => {
      // Arrange
      mockRepository.findByIdWithImages.mockResolvedValue(mockProduct)
      const { getProductById } = await import('../../../api/services/_productService.js')

      // Act
      const result = await getProductById(1, true)

      // Assert
      expect(mockRepository.findByIdWithImages).toHaveBeenCalledWith(1, true)
      expect(result).toEqual(mockProduct)
    })
  })

  describe('createProduct()', () => {
    it('should create product with valid data', async () => {
      // Arrange
      const { sanitizeProductData } = await import('../../../api/utils/sanitize.js')
      vi.mocked(sanitizeProductData).mockReturnValue(mockProduct)
      mockRepository.existsBySku.mockResolvedValue(false)
      mockRepository.create.mockResolvedValue({ id: 2, ...mockProduct })
      const { createProduct } = await import('../../../api/services/_productService.js')

      // Act
      const result = await createProduct(mockProduct)

      // Assert
      expect(sanitizeProductData).toHaveBeenCalledWith(mockProduct)
      expect(mockRepository.existsBySku).toHaveBeenCalledWith(mockProduct.sku)
      expect(mockRepository.create).toHaveBeenCalledWith(mockProduct)
      expect(result.id).toBe(2)
    })

    it('should check SKU uniqueness', async () => {
      // Arrange
      const { sanitizeProductData } = await import('../../../api/utils/sanitize.js')
      vi.mocked(sanitizeProductData).mockReturnValue(mockProduct)
      mockRepository.existsBySku.mockResolvedValue(true)
      const { createProduct } = await import('../../../api/services/_productService.js')

      // Act & Assert
      await expect(createProduct(mockProduct)).rejects.toThrow(/already exists/i)
    })

    it('should sanitize input data', async () => {
      // Arrange
      const { sanitizeProductData } = await import('../../../api/utils/sanitize.js')
      vi.mocked(sanitizeProductData).mockReturnValue(mockProduct)
      mockRepository.existsBySku.mockResolvedValue(false)
      mockRepository.create.mockResolvedValue(mockProduct)
      const { createProduct } = await import('../../../api/services/_productService.js')
      const dirtyData = { ...mockProduct, name: '  Dirty  ' }

      // Act
      const _result = await createProduct(dirtyData)

      // Assert
      expect(sanitizeProductData).toHaveBeenCalledWith(dirtyData)
      expect(mockRepository.create).toHaveBeenCalledWith(mockProduct)
    })
  })

  describe('updateProduct()', () => {
    it('should update product with valid data', async () => {
      // Arrange
      const { sanitizeProductData } = await import('../../../api/utils/sanitize.js')
      vi.mocked(sanitizeProductData).mockReturnValue(mockProduct)
      mockRepository.update.mockResolvedValue({ ...mockProduct, name: 'Updated' })
      const { updateProduct } = await import('../../../api/services/_productService.js')

      // Act
      const result = await updateProduct(1, { name: 'Updated' })

      // Assert
      expect(sanitizeProductData).toHaveBeenCalledWith({ name: 'Updated' })
      expect(mockRepository.update).toHaveBeenCalledWith(1, mockProduct)
      expect(result.name).toBe('Updated')
    })

    it('should throw NotFoundError when product does not exist', async () => {
      // Arrange
      const { sanitizeProductData } = await import('../../../api/utils/sanitize.js')
      vi.mocked(sanitizeProductData).mockReturnValue(mockProduct)
      mockRepository.update.mockRejectedValue(new Error('Product not found'))
      const { updateProduct } = await import('../../../api/services/_productService.js')

      // Act & Assert
      await expect(updateProduct(999, mockProduct)).rejects.toThrow()
    })
  })

  describe('deleteProduct()', () => {
    it('should soft delete product', async () => {
      // Arrange
      mockRepository.delete.mockResolvedValue({ ...mockProduct, active: false })
      const { deleteProduct } = await import('../../../api/services/_productService.js')

      // Act
      const result = await deleteProduct(1)

      // Assert
      expect(mockRepository.delete).toHaveBeenCalledWith(1)
      expect(result.active).toBe(false)
    })

    it('should throw NotFoundError when product does not exist', async () => {
      // Arrange
      mockRepository.delete.mockRejectedValue(new Error('Product not found'))
      const { deleteProduct } = await import('../../../api/services/_productService.js')

      // Act & Assert
      await expect(deleteProduct(999)).rejects.toThrow()
    })
  })

  describe('decrementProductStock()', () => {
    it('should decrement stock by specified quantity', async () => {
      // Arrange
      mockRepository.decrementStock.mockResolvedValue({ ...mockProduct, stock: 95 })
      const { decrementProductStock } = await import('../../../api/services/_productService.js')

      // Act
      const result = await decrementProductStock(1, 5)

      // Assert
      expect(mockRepository.decrementStock).toHaveBeenCalledWith(1, 5)
      expect(result.stock).toBe(95)
    })

    it('should throw error when stock is insufficient', async () => {
      // Arrange
      mockRepository.decrementStock.mockRejectedValue(new Error('Insufficient stock'))
      const { decrementProductStock } = await import('../../../api/services/_productService.js')

      // Act & Assert
      await expect(decrementProductStock(1, 200)).rejects.toThrow(/Insufficient stock/i)
    })

    it('should handle quantity of 1', async () => {
      // Arrange
      mockRepository.decrementStock.mockResolvedValue({ ...mockProduct, stock: 99 })
      const { decrementProductStock } = await import('../../../api/services/_productService.js')

      // Act
      const result = await decrementProductStock(1, 1)

      // Assert
      expect(mockRepository.decrementStock).toHaveBeenCalledWith(1, 1)
      expect(result.stock).toBe(99)
    })
  })

  describe('getProductsByOccasion()', () => {
    it('should filter by occasion ID', async () => {
      // Arrange
      mockRepository.findAllWithFilters.mockResolvedValue([mockProduct])
      const { getProductsByOccasion } = await import('../../../api/services/_productService.js')

      // Act
      const result = await getProductsByOccasion(5)

      // Assert
      expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(
        { occasion: 5 },
        { ascending: false }
      )
      expect(result).toEqual([mockProduct])
    })

    it('should filter by occasion slug', async () => {
      // Arrange
      mockRepository.findAllWithFilters.mockResolvedValue([mockProduct])
      const { getProductsByOccasion } = await import('../../../api/services/_productService.js')

      // Act
      const result = await getProductsByOccasion('wedding')

      // Assert
      expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(
        { occasion: 1 },
        { ascending: false }
      )
      expect(result).toEqual([mockProduct])
    })

    it('should apply pagination', async () => {
      // Arrange
      mockRepository.findAllWithFilters.mockResolvedValue([mockProduct])
      const { getProductsByOccasion } = await import('../../../api/services/_productService.js')

      // Act
      const result = await getProductsByOccasion(5, { limit: 10, offset: 0 })

      // Assert
      expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(
        { occasion: 5, limit: 10, offset: 0 },
        { ascending: false }
      )
      expect(result).toEqual([mockProduct])
    })
  })
})
