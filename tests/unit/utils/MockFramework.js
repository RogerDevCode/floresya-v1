/**
 * Mock Framework Académico - Versión 2.0
 * Basado en principios de Testing Pyramid, Test Doubles (Fowler), y Clean Architecture
 *
 * CARACTERÍSTICAS:
 * 1. 100% Centralizado - Un solo lugar para TODOS los mocks
 * 2. Factory Pattern - Creación consistente de mocks
 * 3. Strategy Pattern - Diferentes comportamientos por contexto
 * 4. Builder Pattern - Configuración fluida
 * 5. Test Double Taxonomy - Clasificación correcta de mocks
 *
 * FUENTES ACADÉMICAS:
 * - Testing Pyramid (Google, Kent C. Dodds)
 * - Test Doubles (Martin Fowler)
 * - Clean Architecture (Robert C. Martin)
 * - Domain-Driven Design (Eric Evans)
 */

import { vi } from 'vitest'

/**
 * MockFactory - Factory Pattern
 * Crea mocks de Supabase consistentes y reutilizables
 */
export class MockFactory {
  /**
   * Crear mock completo de Supabase con chain completo
   * @param {Object} options - Configuración del mock
   * @returns {Object} Mock de Supabase completamente configurado
   */
  static createSupabase(options = {}) {
    const {
      data = null,
      error = null,
      behavior = 'default' // 'default' | 'success' | 'error' | 'notFound'
    } = options

    // Configurar返回值 según behavior
    let returnValue
    switch (behavior) {
      case 'success':
        returnValue = { data, error: null }
        break
      case 'error':
        returnValue = { data: null, error: error || { code: 'PGRST301', message: 'Error' } }
        break
      case 'notFound':
        returnValue = { data: null, error: { code: 'PGRST116', message: 'Not found' } }
        break
      default:
        returnValue = { data, error }
    }

    // Crear chain de Supabase
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue(returnValue),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis()
    }

    // Configurar métodos chain para retornar self
    const chainableMethods = [
      'select',
      'insert',
      'update',
      'delete',
      'eq',
      'neq',
      'in',
      'gt',
      'gte',
      'lt',
      'lte',
      'like',
      'ilike',
      'is',
      'order',
      'limit',
      'offset'
    ]

    chainableMethods.forEach(method => {
      mockQuery[method].mockImplementation(
        function () {
          return this
        }.bind(mockQuery)
      )
    })

    // Special handling for 'or' method - it should return a resolved value
    mockQuery.or = vi.fn().mockResolvedValue(returnValue)

    // Terminal methods that return resolved values
    mockQuery.single = vi.fn().mockResolvedValue(returnValue)
    mockQuery.maybeSingle = vi.fn().mockResolvedValue(returnValue)
    mockQuery.range = vi.fn().mockResolvedValue(returnValue)

    // Crear mock de Supabase
    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
      auth: {
        getUser: vi.fn(),
        signOut: vi.fn()
      }
    }

    return { mockSupabase, mockQuery }
  }

  /**
   * Crear mock para repository findById
   * @param {Object} config - Configuración específica
   * @returns {Object} Mock configurado para findById
   */
  static createFindByIdMock(config = {}) {
    const { data = { id: 1, name: 'Test' }, error = null } = config

    const { mockSupabase, mockQuery } = MockFactory.createSupabase({
      data,
      error,
      behavior: error ? 'error' : 'success'
    })

    // Configurar chain específico para findById
    const selectFn = vi.fn().mockReturnValue(mockQuery)
    mockSupabase.from = vi.fn().mockReturnValue({ select: selectFn })

    return { mockSupabase, mockQuery, selectFn }
  }

  /**
   * Crear mock para repository findAll
   * @param {Object} config - Configuración específica
   * @returns {Object} Mock configurado para findAll
   */
  static createFindAllMock(config = {}) {
    const { data = [{ id: 1, name: 'Test' }], error = null, withPagination = false } = config

    const { mockSupabase } = MockFactory.createSupabase({
      data,
      error,
      behavior: error ? 'error' : 'success'
    })

    if (withPagination) {
      // Chain con range para paginación
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data, error: null })
      }

      const chainableMethods = ['select', 'eq', 'order']
      chainableMethods.forEach(method => {
        mockQuery[method].mockImplementation(
          function () {
            return this
          }.bind(mockQuery)
        )
      })

      mockSupabase.from = vi.fn().mockReturnValue(mockQuery)
      return { mockSupabase, mockQuery }
    } else {
      // Chain terminal con order
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data, error: null })
      }

      const chainableMethods = ['select', 'eq']
      chainableMethods.forEach(method => {
        mockQuery[method].mockImplementation(
          function () {
            return this
          }.bind(mockQuery)
        )
      })

      mockSupabase.from = vi.fn().mockReturnValue(mockQuery)
      return { mockSupabase, mockQuery }
    }
  }

  /**
   * Crear mock para repository create
   * @param {Object} config - Configuración específica
   * @returns {Object} Mock configurado para create
   */
  static createCreateMock(config = {}) {
    const { data = { id: 1, name: 'Created' }, error = null } = config

    const { mockSupabase } = MockFactory.createSupabase({
      data,
      error,
      behavior: error ? 'error' : 'success'
    })

    const mockInsertChain = {
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data, error: null })
    }

    const mockFrom = {
      insert: vi.fn().mockReturnValue(mockInsertChain)
    }

    mockSupabase.from = vi.fn().mockReturnValue(mockFrom)

    return { mockSupabase, mockFrom, mockInsertChain }
  }

  /**
   * Crear mock para repository update
   * @param {Object} config - Configuración específica
   * @returns {Object} Mock configurado para update
   */
  static createUpdateMock(config = {}) {
    const { data = { id: 1, name: 'Updated' }, error = null } = config

    const { mockSupabase } = MockFactory.createSupabase({
      data,
      error,
      behavior: error ? 'error' : 'success'
    })

    const mockUpdateChain = {
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data, error: null })
    }

    const mockFrom = {
      update: vi.fn().mockReturnValue(mockUpdateChain)
    }

    mockSupabase.from = vi.fn().mockReturnValue(mockFrom)

    return { mockSupabase, mockFrom, mockUpdateChain }
  }

  /**
   * Crear mock para repository delete (soft delete)
   * @param {Object} config - Configuración específica
   * @returns {Object} Mock configurado para delete
   */
  static createDeleteMock(config = {}) {
    const { data = { id: 1, active: false }, error = null } = config

    const { mockSupabase } = MockFactory.createSupabase({
      data,
      error,
      behavior: error ? 'error' : 'success'
    })

    const mockDeleteChain = {
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data, error: null })
    }

    const mockFrom = {
      update: vi.fn().mockReturnValue(mockDeleteChain)
    }

    mockSupabase.from = vi.fn().mockReturnValue(mockFrom)

    return { mockSupabase, mockFrom, mockDeleteChain }
  }

  /**
   * Crear mock para auth middleware
   * @param {Object} config - Configuración específica
   * @returns {Object} Mock configurado para auth
   */
  static createAuthMock(config = {}) {
    const { user = { id: 1, email: 'test@example.com', role: 'user' }, shouldReject = false } =
      config

    const mockGetUser = shouldReject
      ? vi.fn().mockRejectedValue(new Error('Invalid token'))
      : vi.fn().mockResolvedValue(user)

    const mockSupabase = {
      auth: {
        getUser: mockGetUser
      }
    }

    return { mockSupabase, mockGetUser }
  }

  /**
   * Crear mock para services (DI Container)
   * @param {Object} config - Configuración específica
   * @returns {Object} Mock configurado para services
   */
  static createServiceMock(config = {}) {
    const { repositoryName = 'TestRepository', methods = {} } = config

    const defaultMethods = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAllWithFilters: vi.fn(),
      existsBySku: vi.fn(),
      decrementStock: vi.fn()
    }

    const mockRepository = { ...defaultMethods, ...methods }

    const mockDIContainer = {
      resolve: vi.fn(serviceName => {
        if (serviceName === repositoryName) {
          return mockRepository
        }
        return {}
      })
    }

    return { mockDIContainer, mockRepository }
  }
}

// Exportar factory methods estáticamente para acceso directo
export const createSupabase = MockFactory.createSupabase
export const createFindByIdMock = MockFactory.createFindByIdMock
export const createFindAllMock = MockFactory.createFindAllMock
export const createCreateMock = MockFactory.createCreateMock
export const createUpdateMock = MockFactory.createUpdateMock
export const createDeleteMock = MockFactory.createDeleteMock
export const createAuthMock = MockFactory.createAuthMock
export const createServiceMock = MockFactory.createServiceMock

/**
 * TestDataBuilder - Builder Pattern
 * Para crear datos de test de forma fluida
 */
export class TestDataBuilder {
  constructor(entity = {}) {
    this.data = { ...entity }
  }

  static for(entity) {
    return new TestDataBuilder(entity)
  }

  withId(id) {
    this.data.id = id
    return this
  }

  withName(name) {
    this.data.name = name
    return this
  }

  withSku(sku) {
    this.data.sku = sku
    return this
  }

  withPrice(priceUsd) {
    this.data.price_usd = priceUsd
    return this
  }

  withStock(stock) {
    this.data.stock = stock
    return this
  }

  active() {
    this.data.active = true
    return this
  }

  inactive() {
    this.data.active = false
    return this
  }

  featured() {
    this.data.featured = true
    return this
  }

  build() {
    return { ...this.data }
  }
}

/**
 * MockRegistry - Registry Pattern
 * Registro centralizado de mocks para reutilización
 */
export class MockRegistry {
  static registry = new Map()

  static register(key, mock) {
    MockRegistry.registry.set(key, mock)
  }

  static get(key) {
    return MockRegistry.registry.get(key)
  }

  static clear() {
    MockRegistry.registry.clear()
  }

  static list() {
    return Array.from(MockRegistry.registry.keys())
  }
}

/**
 * MockHelper - Utility functions
 * Funciones de ayuda para trabajar con mocks
 */
export class MockHelper {
  /**
   * Configurar respuesta exitosa para un mock
   */
  static setupSuccess(mockFn, data) {
    mockFn.mockResolvedValue({ data, error: null })
  }

  /**
   * Configurar respuesta de error para un mock
   */
  static setupError(mockFn, error = { code: 'ERROR', message: 'Test error' }) {
    mockFn.mockResolvedValue({ data: null, error })
  }

  /**
   * Configurar respuesta not found para un mock
   */
  static setupNotFound(mockFn) {
    mockFn.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'Not found' }
    })
  }

  /**
   * Verificar que un mock fue llamado con ciertos parámetros
   */
  static verifyCall(mockFn, ...args) {
    expect(mockFn).toHaveBeenCalledWith(...args)
  }

  /**
   * Verificar que un mock NO fue llamado
   */
  static verifyNoCall(mockFn) {
    expect(mockFn).not.toHaveBeenCalled()
  }
}
