/**
 * SPRINT 2 VALIDATION TESTS
 * Tests específicos para validar refactorización de repositorios
 * Valida que se usan RPC calls y NO hay filtrado JavaScript
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { ProductRepository } from '../../api/repositories/ProductRepository.js'
import { OrderRepository } from '../../api/repositories/OrderRepository.js'
import expenseRepository from '../../api/repositories/expenseRepository.js'

// Mock Supabase client
const createMockSupabase = () => ({
  from: vi.fn(),
  rpc: vi.fn()
})

describe('SPRINT 2 - Repository RPC Validation', () => {
  let mockSupabase

  beforeEach(() => {
    mockSupabase = createMockSupabase()
  })

  describe('ProductRepository.findAllWithFilters', () => {
    test('should call get_products_filtered RPC (not query builder)', async () => {
      const repository = new ProductRepository(mockSupabase)

      // Mock RPC response
      mockSupabase.rpc.mockResolvedValue({
        data: [{ id: 1, name: 'Test Product' }],
        error: null
      })

      const filters = {
        search: 'rosa',
        price_min: 10,
        price_max: 100,
        featured: true,
        occasionId: 2
      }

      const options = { limit: 20, offset: 0 }

      await repository.findAllWithFilters(filters, options)

      // ✅ VALIDACIÓN: Debe llamar a RPC, NO a from()
      expect(mockSupabase.rpc).toHaveBeenCalledTimes(1)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_products_filtered', {
        p_occasion_id: 2,
        p_search: 'rosa',
        p_price_min: 10,
        p_price_max: 100,
        p_featured: true,
        p_sku: null,
        p_sort_by: 'created_at',
        p_sort_order: 'DESC',
        p_limit: 20,
        p_offset: 0,
        p_include_inactive: false
      })

      // ✅ VALIDACIÓN: NO debe usar query builder
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    test('should map sortBy to SQL parameters correctly', async () => {
      const repository = new ProductRepository(mockSupabase)

      mockSupabase.rpc.mockResolvedValue({ data: [], error: null })

      // Test price_asc
      await repository.findAllWithFilters({ sortBy: 'price_asc' })
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'get_products_filtered',
        expect.objectContaining({
          p_sort_by: 'price_usd',
          p_sort_order: 'ASC'
        })
      )

      // Test price_desc
      await repository.findAllWithFilters({ sortBy: 'price_desc' })
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'get_products_filtered',
        expect.objectContaining({
          p_sort_by: 'price_usd',
          p_sort_order: 'DESC'
        })
      )

      // Test name_asc
      await repository.findAllWithFilters({ sortBy: 'name_asc' })
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'get_products_filtered',
        expect.objectContaining({
          p_sort_by: 'name',
          p_sort_order: 'ASC'
        })
      )
    })

    test('should return data from RPC without JavaScript filtering', async () => {
      const repository = new ProductRepository(mockSupabase)

      const mockData = [
        { id: 1, name: 'Rosa Roja', price_usd: 25 },
        { id: 2, name: 'Rosa Blanca', price_usd: 30 }
      ]

      mockSupabase.rpc.mockResolvedValue({ data: mockData, error: null })

      const result = await repository.findAllWithFilters({ search: 'rosa' })

      // ✅ VALIDACIÓN: Data viene directamente del RPC (no filtrada en JS)
      expect(result).toEqual(mockData)
      expect(result.length).toBe(2)
    })

    test('should handle RPC errors correctly', async () => {
      const repository = new ProductRepository(mockSupabase)

      const mockError = { message: 'RPC failed', code: '42P01' }
      mockSupabase.rpc.mockResolvedValue({ data: null, error: mockError })

      await expect(repository.findAllWithFilters({ search: 'test' })).rejects.toThrow()
    })
  })

  describe('OrderRepository.findAllWithFilters', () => {
    test('should call get_orders_filtered RPC (not query builder)', async () => {
      const repository = new OrderRepository(mockSupabase)

      mockSupabase.rpc.mockResolvedValue({
        data: [{ id: 1, customer_name: 'Test' }],
        error: null
      })

      const filters = {
        status: 'pending',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
        search: 'test',
        year: 2024 // Explicit year
      }

      const options = { limit: 50, offset: 0, orderBy: 'created_at' }

      await repository.findAllWithFilters(filters, options)

      // ✅ VALIDACIÓN: Debe llamar a RPC
      expect(mockSupabase.rpc).toHaveBeenCalledTimes(1)
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'get_orders_filtered',
        expect.objectContaining({
          p_status: 'pending',
          p_year: 2024,
          p_date_from: '2024-01-01',
          p_date_to: '2024-12-31',
          p_search: 'test',
          p_sort_by: 'created_at',
          p_sort_order: 'DESC',
          p_limit: 50,
          p_offset: 0
        })
      )

      // ✅ VALIDACIÓN: NO debe usar query builder
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    test('should extract year from dateFrom if no explicit year', async () => {
      const repository = new OrderRepository(mockSupabase)

      mockSupabase.rpc.mockResolvedValue({ data: [], error: null })

      await repository.findAllWithFilters({
        dateFrom: '2023-06-15'
      })

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'get_orders_filtered',
        expect.objectContaining({
          p_year: 2023
        })
      )
    })

    test('should return order_items as parsed JSON', async () => {
      const repository = new OrderRepository(mockSupabase)

      const mockData = [
        {
          id: 1,
          customer_name: 'Test',
          order_items: [
            // Ya viene como array (parseado por PostgreSQL)
            { id: 1, product_name: 'Rosa', quantity: 2 }
          ]
        }
      ]

      mockSupabase.rpc.mockResolvedValue({ data: mockData, error: null })

      const result = await repository.findAllWithFilters()

      // ✅ VALIDACIÓN: order_items es un array (no string JSON)
      expect(result[0].order_items).toBeInstanceOf(Array)
      expect(result[0].order_items[0].product_name).toBe('Rosa')
    })
  })

  describe('ExpenseRepository.findAllWithFilters', () => {
    test('should call get_expenses_filtered RPC (not query builder)', async () => {
      // Mock supabase en el repositorio singleton
      expenseRepository.supabase = mockSupabase

      mockSupabase.rpc.mockResolvedValue({
        data: [{ id: 1, category: 'flores' }],
        error: null
      })

      const filters = {
        category: 'flores',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        paymentMethod: 'efectivo'
      }

      const options = { limit: 100, offset: 0 }

      await expenseRepository.findAllWithFilters(filters, options)

      // ✅ VALIDACIÓN: Debe llamar a RPC
      expect(mockSupabase.rpc).toHaveBeenCalledTimes(1)
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_expenses_filtered', {
        p_category: 'flores',
        p_date_from: '2024-01-01',
        p_date_to: '2024-12-31',
        p_payment_method: 'efectivo',
        p_sort_by: 'expense_date',
        p_sort_order: 'DESC',
        p_limit: 100,
        p_offset: 0
      })

      // ✅ VALIDACIÓN: NO debe usar query builder
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    test('findByDateRange should use findAllWithFilters', async () => {
      expenseRepository.supabase = mockSupabase

      mockSupabase.rpc.mockResolvedValue({ data: [], error: null })

      // Spy on findAllWithFilters
      const findAllSpy = vi.spyOn(expenseRepository, 'findAllWithFilters')

      await expenseRepository.findByDateRange('2024-01-01', '2024-12-31', {
        category: 'flores',
        limit: 50
      })

      // ✅ VALIDACIÓN: findByDateRange usa findAllWithFilters
      expect(findAllSpy).toHaveBeenCalledTimes(1)
      expect(findAllSpy).toHaveBeenCalledWith(
        {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          category: 'flores'
        },
        { limit: 50 }
      )
    })
  })

  describe('REGRESSION - Backward Compatibility', () => {
    test('ProductRepository methods with old signature still work', async () => {
      const repository = new ProductRepository(mockSupabase)

      mockSupabase.rpc.mockResolvedValue({ data: [], error: null })

      // Old usage style should still work
      await repository.findAllWithFilters({ sku: 'TEST-001' }, { limit: 10 })

      expect(mockSupabase.rpc).toHaveBeenCalled()
    })

    test('OrderRepository methods with old signature still work', async () => {
      const repository = new OrderRepository(mockSupabase)

      mockSupabase.rpc.mockResolvedValue({ data: [], error: null })

      // Old usage style should still work
      await repository.findAllWithFilters(
        { userId: 1, status: 'pending' },
        { orderBy: 'created_at', ascending: false }
      )

      expect(mockSupabase.rpc).toHaveBeenCalled()
    })
  })

  describe('NO JavaScript Filtering Validation', () => {
    test('ProductRepository should NOT use .filter() after RPC', async () => {
      const repository = new ProductRepository(mockSupabase)

      const mockData = [
        { id: 1, name: 'Rosa', price_usd: 25 },
        { id: 2, name: 'Lirio', price_usd: 30 }
      ]

      mockSupabase.rpc.mockResolvedValue({ data: mockData, error: null })

      const result = await repository.findAllWithFilters({ search: 'rosa' })

      // ✅ VALIDACIÓN CRÍTICA: Data NO debe ser filtrada en JavaScript
      // Si hubiera filtrado JS, result.length sería 1 (solo 'Rosa')
      // Pero como todo se hace en SQL, retorna lo que SQL devuelve
      expect(result).toEqual(mockData)
      expect(result.length).toBe(2) // Ambos items (SQL ya filtró)
    })

    test('ProductRepository should NOT use .sort() after RPC', async () => {
      const repository = new ProductRepository(mockSupabase)

      // Mock data en orden DESC (como viene de SQL)
      const mockData = [
        { id: 2, name: 'Lirio', price_usd: 30 },
        { id: 1, name: 'Rosa', price_usd: 25 }
      ]

      mockSupabase.rpc.mockResolvedValue({ data: mockData, error: null })

      const result = await repository.findAllWithFilters({ sortBy: 'price_desc' })

      // ✅ VALIDACIÓN: Orden viene de SQL, no de JavaScript
      expect(result[0].price_usd).toBe(30)
      expect(result[1].price_usd).toBe(25)
    })
  })
})

describe('SPRINT 2 - Performance Validation', () => {
  test('should make only ONE RPC call per filter operation', async () => {
    const mockSupabase = createMockSupabase()
    const repository = new ProductRepository(mockSupabase)

    mockSupabase.rpc.mockResolvedValue({ data: [], error: null })

    await repository.findAllWithFilters({
      search: 'test',
      price_min: 10,
      price_max: 100,
      featured: true,
      occasionId: 1
    })

    // ✅ VALIDACIÓN: Solo 1 llamada RPC (no múltiples queries)
    expect(mockSupabase.rpc).toHaveBeenCalledTimes(1)
  })

  test('should NOT transfer unnecessary data from database', async () => {
    const mockSupabase = createMockSupabase()
    const repository = new ProductRepository(mockSupabase)

    // Mock de 1000 productos
    const mockData = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Product ${i}`
    }))

    mockSupabase.rpc.mockResolvedValue({ data: mockData, error: null })

    await repository.findAllWithFilters({}, { limit: 10 })

    // ✅ VALIDACIÓN: Límite se aplicó en SQL (no en JS)
    // Si fuera filtrado JS, mockSupabase.rpc habría retornado 1000 items
    // Pero como es SQL, solo retorna lo solicitado
    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'get_products_filtered',
      expect.objectContaining({
        p_limit: 10
      })
    )
  })
})
