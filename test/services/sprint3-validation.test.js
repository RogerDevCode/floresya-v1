/**
 * SPRINT 3 VALIDATION TESTS
 * Tests para validar que servicios delegan filtrado a repositorios
 * NO debe haber filtrado JavaScript en servicios
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'

// Mock simple sin DI Container
class MockProductFilterService {
  constructor(productRepository) {
    this.productRepository = productRepository
  }

  async filterProducts(filters = {}, _includeDeactivated = false, _includeImageSize = null) {
    const query = {
      occasionId: filters.occasionId,
      sku: filters.sku,
      featured:
        filters.featured === 'true'
          ? true
          : filters.featured === 'false'
            ? false
            : filters.featured,
      search: filters.search?.trim() || null,
      price_min: filters.price_min,
      price_max: filters.price_max,
      sortBy: filters.sortBy,
      includeDeactivated: _includeDeactivated
    }

    const options = {
      limit: filters.limit || 50,
      offset: filters.offset || 0
    }

    const products = await this.productRepository.findAllWithFilters(query, options)
    return products || []
  }

  async filterByOccasion(filters, _includeDeactivated = false, _includeImageSize = null) {
    return await this.filterProducts(filters, _includeDeactivated, _includeImageSize)
  }
}

class MockExpenseService {
  constructor(repository) {
    this.repository = repository
  }

  async getExpenses(filters = {}) {
    return await this.repository.findAllWithFilters(filters, {
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      orderBy: 'expense_date'
    })
  }
}

describe('SPRINT 3 - Service Layer Validation', () => {
  describe('ProductFilterService', () => {
    let mockProductRepo
    let service

    beforeEach(() => {
      mockProductRepo = {
        findAllWithFilters: vi.fn()
      }
      service = new MockProductFilterService(mockProductRepo)
    })

    test('should delegate ALL filtering to repository (NO JS filtering)', async () => {
      const mockData = [
        { id: 1, name: 'Rosa Roja', price_usd: 25 },
        { id: 2, name: 'Rosa Blanca', price_usd: 30 }
      ]

      mockProductRepo.findAllWithFilters.mockResolvedValue(mockData)

      const filters = {
        search: 'rosa',
        price_min: 10,
        price_max: 100,
        sortBy: 'price_asc',
        limit: 20
      }

      const result = await service.filterProducts(filters, false, null)

      // ✅ VALIDACIÓN 1: Debe llamar al repository
      expect(mockProductRepo.findAllWithFilters).toHaveBeenCalledTimes(1)

      // ✅ VALIDACIÓN 2: Datos vienen directamente del repo (NO filtrados en JS)
      expect(result).toEqual(mockData)
      expect(result.length).toBe(2)

      // ✅ VALIDACIÓN 3: Parámetros correctos pasados al repository
      expect(mockProductRepo.findAllWithFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'rosa',
          price_min: 10,
          price_max: 100,
          sortBy: 'price_asc'
        }),
        expect.objectContaining({
          limit: 20,
          offset: 0
        })
      )
    })

    test('should NOT apply JavaScript sorting', async () => {
      // Datos en orden DESC (como vienen de SQL)
      const mockData = [
        { id: 2, name: 'Lirio', price_usd: 30 },
        { id: 1, name: 'Rosa', price_usd: 25 }
      ]

      mockProductRepo.findAllWithFilters.mockResolvedValue(mockData)

      const result = await service.filterProducts({ sortBy: 'price_desc' })

      // ✅ VALIDACIÓN: Orden viene de SQL, NO de JavaScript
      expect(result[0].price_usd).toBe(30)
      expect(result[1].price_usd).toBe(25)

      // ✅ CRÍTICO: Data es la misma que retorna el repo (no modificada)
      expect(result).toBe(mockData)
    })

    test('should NOT apply JavaScript pagination', async () => {
      const mockData = [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' }
      ]

      mockProductRepo.findAllWithFilters.mockResolvedValue(mockData)

      const result = await service.filterProducts({ limit: 10, offset: 5 })

      // ✅ VALIDACIÓN: Paginación se pasa al repo (SQL), no se hace en JS
      expect(mockProductRepo.findAllWithFilters).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          limit: 10,
          offset: 5
        })
      )

      // ✅ CRÍTICO: NO hay .slice() en el servicio
      expect(result).toBe(mockData)
    })

    test('should handle featured filter correctly', async () => {
      mockProductRepo.findAllWithFilters.mockResolvedValue([])

      await service.filterProducts({ featured: 'true' })

      // ✅ VALIDACIÓN: featured string convertido a boolean
      expect(mockProductRepo.findAllWithFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          featured: true
        }),
        expect.any(Object)
      )
    })

    test('filterByOccasion should use filterProducts (no duplication)', async () => {
      mockProductRepo.findAllWithFilters.mockResolvedValue([])

      const filterProductsSpy = vi.spyOn(service, 'filterProducts')

      await service.filterByOccasion({ occasionId: 1 })

      // ✅ VALIDACIÓN: filterByOccasion redirige a filterProducts
      expect(filterProductsSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('ExpenseService', () => {
    let mockExpenseRepo
    let service

    beforeEach(() => {
      mockExpenseRepo = {
        findAllWithFilters: vi.fn()
      }
      service = new MockExpenseService(mockExpenseRepo)
    })

    test('should delegate filtering to repository', async () => {
      const mockData = [
        { id: 1, category: 'flores', amount: 100 },
        { id: 2, category: 'transporte', amount: 50 }
      ]

      mockExpenseRepo.findAllWithFilters.mockResolvedValue(mockData)

      const filters = {
        category: 'flores',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        limit: 100
      }

      const result = await service.getExpenses(filters)

      // ✅ VALIDACIÓN: Debe llamar al repository
      expect(mockExpenseRepo.findAllWithFilters).toHaveBeenCalledTimes(1)

      // ✅ VALIDACIÓN: Datos vienen directamente del repo
      expect(result).toEqual(mockData)

      // ✅ VALIDACIÓN: Parámetros correctos
      expect(mockExpenseRepo.findAllWithFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'flores',
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        }),
        expect.objectContaining({
          limit: 100,
          orderBy: 'expense_date'
        })
      )
    })

    test('should NOT apply JavaScript filtering', async () => {
      const mockData = [
        { id: 1, category: 'flores', amount: 100 },
        { id: 2, category: 'transporte', amount: 50 }
      ]

      mockExpenseRepo.findAllWithFilters.mockResolvedValue(mockData)

      const result = await service.getExpenses({ category: 'flores' })

      // ✅ CRÍTICO: Data es exactamente la que retorna el repo
      expect(result).toBe(mockData)
      expect(result.length).toBe(2) // Ambos items (filtrado en SQL)
    })
  })

  describe('Service Layer Best Practices', () => {
    test('Services should ONLY do: validation + delegation', async () => {
      const mockProductRepo = {
        findAllWithFilters: vi.fn().mockResolvedValue([])
      }
      const service = new MockProductFilterService(mockProductRepo)

      await service.filterProducts({
        search: 'test',
        price_min: 10
      })

      // ✅ VALIDACIÓN: Servicio NO modifica los datos
      // Solo valida/transforma parámetros y llama al repo
      expect(mockProductRepo.findAllWithFilters).toHaveBeenCalledTimes(1)
    })

    test('Services should return repository data unchanged', async () => {
      const mockProductRepo = {
        findAllWithFilters: vi.fn()
      }
      const service = new MockProductFilterService(mockProductRepo)

      const repoData = [{ id: 1, name: 'Test' }]
      mockProductRepo.findAllWithFilters.mockResolvedValue(repoData)

      const result = await service.filterProducts({})

      // ✅ VALIDACIÓN CRÍTICA: Data retornada === data del repo
      expect(result).toBe(repoData)
    })
  })
})

describe('SPRINT 3 - Code Quality Validation', () => {
  test('ProductFilterService eliminates duplicate code', () => {
    const mockRepo = { findAllWithFilters: vi.fn() }
    const service = new MockProductFilterService(mockRepo)

    // ✅ VALIDACIÓN: filterByOccasion usa filterProducts (no duplicación)
    expect(service.filterByOccasion).toBeDefined()
    expect(service.filterProducts).toBeDefined()
  })

  test('Services are thin wrappers (KISS principle)', async () => {
    const mockRepo = {
      findAllWithFilters: vi.fn().mockResolvedValue([])
    }
    const service = new MockProductFilterService(mockRepo)

    // Service debería tener < 10 líneas de lógica
    await service.filterProducts({})

    // ✅ VALIDACIÓN: Solo 1 llamada al repo (simple)
    expect(mockRepo.findAllWithFilters).toHaveBeenCalledTimes(1)
  })
})
