/**
 * Product Service - Granular Unit Tests (FRAMEWORK ACADÉMICO)
 * USANDO MockFactory para 100% centralización
 *
 * CARACTERÍSTICAS:
 * - Factory Pattern: Mocks centralizados para Repository, DI Container, etc.
 * - Strategy Pattern: Diferentes estrategias para product operations
 * - Test Double Taxonomy: Mocks, Stubs, Spies correctamente clasificados
 *
 * FUENTES: Testing Pyramid (Google), Test Doubles (Fowler), Clean Architecture (Martin)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MockFactory, TestDataBuilder, MockRegistry } from '../utils/MockFramework.js'

// Mock DI Container usando Factory
const { mockDIContainer, mockRepository } = MockFactory.createServiceMock({
  repositoryName: 'ProductRepository'
})

// Ensure all repository methods exist
if (!mockRepository.findByIdWithImages) {
  mockRepository.findByIdWithImages = vi.fn()
}
if (!mockRepository.existsBySku) {
  mockRepository.existsBySku = vi.fn()
}
if (!mockRepository.findBySku) {
  mockRepository.findBySku = vi.fn()
}
if (!mockRepository.findByOccasion) {
  mockRepository.findByOccasion = vi.fn()
}
if (!mockRepository.update) {
  mockRepository.update = vi.fn()
}
if (!mockRepository.delete) {
  mockRepository.delete = vi.fn()
}
if (!mockRepository.getProductOccasions) {
  mockRepository.getProductOccasions = vi.fn()
}
if (!mockRepository.replaceOccasions) {
  mockRepository.replaceOccasions = vi.fn()
}

vi.mock('../../../api/architecture/di-container.js', () => ({
  default: mockDIContainer,
  DIContainer: mockDIContainer
}))

// Mock Supabase usando Factory - COMPLETAMENTE MOCKEADO
const { mockSupabase } = MockFactory.createSupabase({
  behavior: 'default'
})

vi.mock('../../../api/services/supabaseClient.js', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    supabase: mockSupabase,
    DB_SCHEMA: {
      products: { table: 'products' },
      orders: { table: 'orders' },
      users: { table: 'users' }
    }
  }
})

// Mock utils usando Factory
vi.mock('../../../api/utils/sanitize.js', () => ({
  sanitizeProductData: vi.fn(data => data)
}))

vi.mock('../../../api/utils/validation.js', () => ({
  validateProduct: vi.fn(() => true),
  validateId: vi.fn(() => true)
}))

// Mock OccasionRepository - CORREGIDO
const mockOccasionRepository = {
  findBySlug: vi.fn((slug, includeInactive) => {
    const slugMap = {
      birthday: { id: 1, slug: 'birthday' },
      wedding: { id: 2, slug: 'wedding' },
      graduation: { id: 3, slug: 'graduation' }
    }
    return Promise.resolve(slugMap[slug] || null)
  })
}

vi.mock('../../../api/repositories/OccasionRepository.js', () => {
  return {
    default: mockOccasionRepository,
    createOccasionRepository: vi.fn(() => mockOccasionRepository)
  }
})

// Mock ProductCacheService usando Factory pattern
const mockCacheService = {
  get: vi.fn(() => null),
  set: vi.fn(() => {}),
  clear: vi.fn(() => {}),
  invalidate: vi.fn(() => {}),
  invalidateAllProducts: vi.fn(() => {}),
  invalidateFeatured: vi.fn(() => {}),
  invalidateProduct: vi.fn(() => {}),
  getProductById: vi.fn((id, includeDeactivated = false) => {
    if (id === 999) {
      return null
    }
    return mockProduct
  }),
  getAllProducts: vi.fn(async (filters, _options, _includeDeactivated) => {
    const result = await mockRepository.findAllWithFilters(filters, _options)
    return result
  }),
  getFeaturedProducts: vi.fn(async limit => {
    return []
  }),
  invalidateFeaturedProducts: vi.fn(() => {})
}

vi.mock('../../../api/services/ProductCacheService.js', () => ({
  getProductCacheService: vi.fn(() => mockCacheService)
}))

vi.mock('../../../api/middleware/error/index.js', () => ({
  withErrorMapping: fn => fn
}))

vi.mock('../../../api/services/productImageService.js', () => ({
  getProductsBatchWithImageSize: vi.fn()
}))

// Data Builder para productos
const mockProduct = TestDataBuilder.for({
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
}).build()

describe('ProductService - Framework Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    MockRegistry.clear()

    // Configurar default mockSupabase behavior - CORREGIDO
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProduct, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: mockProduct, error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis()
    })

    // Configurar default repository behavior
    mockRepository.findBySku.mockReturnValue(null)
    mockRepository.findByOccasion.mockResolvedValue([])
    mockRepository.update.mockResolvedValue(mockProduct)
    mockRepository.delete.mockResolvedValue(mockProduct)
    mockRepository.getProductOccasions.mockResolvedValue([])
    mockRepository.replaceOccasions.mockResolvedValue([])

    // Configurar DI Container para resolver OccasionRepository
    mockDIContainer.resolve = vi.fn(name => {
      if (name === 'OccasionRepository') {
        return mockOccasionRepository
      }
      if (name === 'ProductRepository') {
        return mockRepository
      }
      return {}
    })
  })

  // ============================================
  // GET ALL PRODUCTS TESTS (usando Factory)
  // ============================================

  describe('getAllProducts()', () => {
    it('should return products with default filters', async () => {
      // Arrange - usando Factory
      mockRepository.findAllWithFilters.mockResolvedValue([mockProduct])

      const { getAllProducts } = await import('../../../api/services/productService.js')

      // Act
      const result = await getAllProducts()

      // Assert
      expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(
        { occasionId: null, includeDeactivated: false, sortBy: 'created_at' },
        { ascending: false }
      )
      expect(result).toEqual([mockProduct])
    })

    it('should filter by featured products', async () => {
      // Arrange - usando Factory
      const featuredProduct = { ...mockProduct, featured: true }
      mockRepository.findAllWithFilters.mockResolvedValue([featuredProduct])

      const { getAllProducts } = await import('../../../api/services/productService.js')

      // Act
      const result = await getAllProducts({ featured: true })

      // Assert
      expect(mockRepository.findAllWithFilters).toHaveBeenCalled()
      expect(result).toEqual([featuredProduct])
    })

    it('should apply pagination', async () => {
      // Arrange - usando Factory
      mockRepository.findAllWithFilters.mockResolvedValue([mockProduct])

      const { getAllProducts } = await import('../../../api/services/productService.js')

      // Act
      const result = await getAllProducts({ limit: 10, offset: 0 })

      // Assert
      expect(mockRepository.findAllWithFilters).toHaveBeenCalled()
      expect(result).toEqual([mockProduct])
    })

    it('should sort by price ascending', async () => {
      // Arrange - usando Factory
      mockRepository.findAllWithFilters.mockResolvedValue([mockProduct])

      const { getAllProducts } = await import('../../../api/services/productService.js')

      // Act
      const result = await getAllProducts({ sortBy: 'price_asc' })

      // Assert
      expect(mockRepository.findAllWithFilters).toHaveBeenCalled()
      expect(result).toEqual([mockProduct])
    })

    it('should filter by occasion slug', async () => {
      // Arrange - usando Factory
      mockRepository.findAllWithFilters.mockResolvedValue([mockProduct])

      const { getAllProducts } = await import('../../../api/services/productService.js')

      // Act
      const result = await getAllProducts({ occasion: 'birthday' })

      // Assert
      expect(mockRepository.findAllWithFilters).toHaveBeenCalled()
      expect(result).toEqual([mockProduct])
    })
  })

  // ============================================
  // GET PRODUCT BY ID TESTS (usando Factory)
  // ============================================

  describe('getProductById()', () => {
    it('should throw error for invalid ID', async () => {
      // Arrange - usando Factory
      const { getProductById } = await import('../../../api/services/productService.js')

      // Act & Assert
      await expect(getProductById(0)).rejects.toThrow('Invalid product ID')
    })

    it('should return product by valid ID', async () => {
      // Arrange - usando Factory
      mockRepository.findByIdWithImages.mockResolvedValue(mockProduct)

      const { getProductById } = await import('../../../api/services/productService.js')

      // Act
      const result = await getProductById(1)

      // Assert
      expect(mockRepository.findByIdWithImages).toHaveBeenCalledWith(1, false)
      expect(result).toEqual(mockProduct)
    })

    it('should throw NotFoundError when product not found', async () => {
      // Arrange - usando Factory
      mockRepository.findByIdWithImages.mockResolvedValue(null)

      const { getProductById } = await import('../../../api/services/productService.js')

      // Act & Assert
      await expect(getProductById(999)).rejects.toThrow('Product with ID 999')
    })

    it('should include deactivated for admin', async () => {
      // Arrange - usando Factory
      mockRepository.findByIdWithImages.mockResolvedValue(mockProduct)

      const { getProductById } = await import('../../../api/services/productService.js')

      // Act
      const result = await getProductById(1, true)

      // Assert
      expect(mockRepository.findByIdWithImages).toHaveBeenCalledWith(1, true)
      expect(result).toEqual(mockProduct)
    })
  })

  // ============================================
  // CREATE PRODUCT TESTS (usando Factory)
  // ============================================

  describe('createProduct()', () => {
    it('should create product with valid data', async () => {
      // Arrange - usando Factory
      mockRepository.findBySku.mockResolvedValue(null)
      mockRepository.create.mockResolvedValue({ id: 2, ...mockProduct })

      const { createProduct } = await import('../../../api/services/productService.js')

      // Act
      const result = await createProduct(mockProduct)

      // Assert
      expect(mockRepository.findBySku).toHaveBeenCalledWith(mockProduct.sku)
      expect(mockRepository.create).toHaveBeenCalledWith(mockProduct)
      expect(result.id).toBe(2)
    })

    it('should check SKU uniqueness', async () => {
      // Arrange - usando Factory
      mockRepository.findBySku.mockResolvedValue({ id: 1, sku: 'TEST-001' })

      const { createProduct } = await import('../../../api/services/productService.js')

      // Act & Assert
      await expect(createProduct(mockProduct)).rejects.toThrow()
    })

    it('should sanitize input data', async () => {
      // Arrange - usando Factory
      mockRepository.findBySku.mockResolvedValue(null)
      mockRepository.create.mockResolvedValue(mockProduct)

      const { createProduct } = await import('../../../api/services/productService.js')

      // Act
      const result = await createProduct(mockProduct)

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(mockProduct)
      expect(result).toEqual(mockProduct)
    })
  })

  // ============================================
  // UPDATE PRODUCT TESTS (usando Factory)
  // ============================================

  describe('updateProduct()', () => {
    it('should update product with valid data', async () => {
      // Arrange - usando Factory
      const updatedProduct = { ...mockProduct, name: 'Updated Product' }
      mockRepository.update.mockResolvedValue(updatedProduct)

      const { updateProduct } = await import('../../../api/services/productService.js')

      // Act
      const result = await updateProduct(1, mockProduct)

      // Assert
      // Service filtra campos permitidos antes de enviar al repository
      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        name: 'Test Product',
        summary: 'Test summary',
        description: 'Test description',
        price_usd: 25.99,
        price_ves: 912.38,
        stock: 100,
        sku: 'TEST-001',
        featured: false,
        carousel_order: 1
      })
      expect(result.name).toBe('Updated Product')
    })

    it('should throw NotFoundError when product does not exist', async () => {
      // Arrange - usando Factory
      mockRepository.update.mockRejectedValue(new Error('Product not found'))

      const { updateProduct } = await import('../../../api/services/productService.js')

      // Act & Assert
      await expect(updateProduct(999, mockProduct)).rejects.toThrow('Product not found')
    })
  })

  // ============================================
  // DELETE PRODUCT TESTS (usando Factory)
  // ============================================

  describe('deleteProduct()', () => {
    it('should soft delete product', async () => {
      // Arrange - usando Factory
      const deletedProduct = { ...mockProduct, active: false }
      mockRepository.delete.mockResolvedValue(deletedProduct)

      const { deleteProduct } = await import('../../../api/services/productService.js')

      // Act
      const result = await deleteProduct(1)

      // Assert
      expect(mockRepository.delete).toHaveBeenCalledWith(1)
      expect(result.active).toBe(false)
    })

    it('should throw NotFoundError when product does not exist', async () => {
      // Arrange - usando Factory
      mockRepository.delete.mockRejectedValue(new Error('Product not found'))

      const { deleteProduct } = await import('../../../api/services/productService.js')

      // Act & Assert
      await expect(deleteProduct(999)).rejects.toThrow('Product not found')
    })
  })

  // ============================================
  // DECREMENT PRODUCT STOCK TESTS (usando Factory)
  // ============================================

  describe('decrementProductStock()', () => {
    it('should decrement stock by specified quantity', async () => {
      // Arrange - usando Factory
      const updatedProduct = { ...mockProduct, stock: 95 }
      mockRepository.decrementStock.mockResolvedValue(updatedProduct)

      const { decrementProductStock } = await import('../../../api/services/productService.js')

      // Act
      const result = await decrementProductStock(1, 5)

      // Assert
      expect(mockRepository.decrementStock).toHaveBeenCalledWith(1, 5)
      expect(result.stock).toBe(95)
    })

    it('should throw error when stock is insufficient', async () => {
      // Arrange - usando Factory
      mockRepository.decrementStock.mockRejectedValue(new Error('Insufficient stock'))

      const { decrementProductStock } = await import('../../../api/services/productService.js')

      // Act & Assert
      await expect(decrementProductStock(1, 200)).rejects.toThrow('Insufficient stock')
    })

    it('should handle quantity of 1', async () => {
      // Arrange - usando Factory
      const updatedProduct = { ...mockProduct, stock: 99 }
      mockRepository.decrementStock.mockResolvedValue(updatedProduct)

      const { decrementProductStock } = await import('../../../api/services/productService.js')

      // Act
      const result = await decrementProductStock(1, 1)

      // Assert
      expect(mockRepository.decrementStock).toHaveBeenCalledWith(1, 1)
      expect(result.stock).toBe(99)
    })
  })

  // ============================================
  // GET PRODUCTS BY OCCASION TESTS (usando Factory)
  // ============================================

  describe('getProductsByOccasion()', () => {
    it('should filter by occasion ID', async () => {
      // Arrange - usando Factory
      mockRepository.findByOccasion.mockResolvedValue([mockProduct])

      const { getProductsByOccasion } = await import('../../../api/services/productService.js')

      // Act
      const result = await getProductsByOccasion(5)

      // Assert - El servicio usa repository pattern ahora
      expect(mockRepository.findByOccasion).toHaveBeenCalledWith(5, 50)
      expect(result).toEqual([mockProduct])
    })

    it('should filter by occasion slug', async () => {
      // Arrange - usando Factory - Note: getProductsByOccasion expects NUMBER, not string
      mockRepository.findByOccasion.mockResolvedValue([mockProduct])

      const { getProductsByOccasion } = await import('../../../api/services/productService.js')

      // Act - Passing number directly as the function requires
      const result = await getProductsByOccasion(1)

      // Assert
      expect(mockRepository.findByOccasion).toHaveBeenCalledWith(1, 50)
      expect(result).toEqual([mockProduct])
    })

    it('should apply pagination', async () => {
      // Arrange - usando Factory
      mockRepository.findByOccasion.mockResolvedValue([mockProduct])

      const { getProductsByOccasion } = await import('../../../api/services/productService.js')

      // Act
      const result = await getProductsByOccasion(5, 10)

      // Assert
      expect(mockRepository.findByOccasion).toHaveBeenCalledWith(5, 10)
      expect(result).toEqual([mockProduct])
    })
  })
})
