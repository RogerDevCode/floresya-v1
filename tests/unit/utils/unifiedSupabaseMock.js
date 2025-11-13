/**
 * Unified Supabase Mock - Solución Integral
 *
 * Problemas resueltos:
 * 1. Mock chain roto: from().select().eq() no funciona
 * 2. Diferentes tipos de retornos (single, range, data)
 * 3. Múltiples repositorios con necesidades diferentes
 * 4. Inconsistencia en la configuración de mocks
 *
 * Este mock unificado resuelve todos los problemas de encadenamiento
 * y proporciona una API consistente para todos los tests.
 */

import { vi } from 'vitest'

/**
 * Crea un mock chain de Supabase completamente funcional
 * @param {Object} config - Configuración del mock
 * @returns {Object} Mock de Supabase con chain completo
 */
export function createUnifiedSupabaseMock(config = {}) {
  const { defaultData = null, defaultError = null, tableConfig = {} } = config

  // Almacenamiento interno para múltiples llamadas
  const callHistory = []

  // Función para crear un chain completo
  const createChain = (returnValue = { data: defaultData, error: defaultError }, path = []) => {
    const chain = {
      // Métodos que retornan el mismo chain (encadenables)
      select: vi.fn().mockImplementation(_query => {
        path.push('select')
        return chain
      }),

      from: vi.fn().mockImplementation(table => {
        path.push('from', table)
        return chain
      }),

      insert: vi.fn().mockImplementation(data => {
        path.push('insert', data)
        return chain
      }),

      update: vi.fn().mockImplementation(data => {
        path.push('update', data)
        return chain
      }),

      delete: vi.fn().mockImplementation(() => {
        path.push('delete')
        return chain
      }),

      eq: vi.fn().mockImplementation((column, value) => {
        path.push('eq', column, value)
        return chain
      }),

      neq: vi.fn().mockImplementation((column, value) => {
        path.push('neq', column, value)
        return chain
      }),

      in: vi.fn().mockImplementation((column, values) => {
        path.push('in', column, values)
        return chain
      }),

      gt: vi.fn().mockImplementation((column, value) => {
        path.push('gt', column, value)
        return chain
      }),

      gte: vi.fn().mockImplementation((column, value) => {
        path.push('gte', column, value)
        return chain
      }),

      lt: vi.fn().mockImplementation((column, value) => {
        path.push('lt', column, value)
        return chain
      }),

      lte: vi.fn().mockImplementation((column, value) => {
        path.push('lte', column, value)
        return chain
      }),

      like: vi.fn().mockImplementation((column, value) => {
        path.push('like', column, value)
        return chain
      }),

      ilike: vi.fn().mockImplementation((column, value) => {
        path.push('ilike', column, value)
        return chain
      }),

      is: vi.fn().mockImplementation((column, value) => {
        path.push('is', column, value)
        return chain
      }),

      or: vi.fn().mockImplementation(filters => {
        path.push('or', filters)
        return chain
      }),

      order: vi.fn().mockImplementation((column, options) => {
        path.push('order', column, options)
        return chain
      }),

      limit: vi.fn().mockImplementation(limit => {
        path.push('limit', limit)
        return chain
      }),

      offset: vi.fn().mockImplementation(offset => {
        path.push('offset', offset)
        return chain
      }),

      // Métodos terminales que retornan promesas
      single: vi.fn().mockResolvedValue(returnValue),

      maybeSingle: vi.fn().mockResolvedValue(returnValue),

      range: vi.fn().mockImplementation((from, to) => {
        path.push('range', from, to)
        return Promise.resolve(returnValue)
      }),

      // Guardar historial de llamadas
      _path: path,
      _saveCall: () => {
        callHistory.push([...path])
        path.length = 0 // Reset path
      }
    }

    return chain
  }

  // Mock principal de Supabase
  const supabaseMock = {
    from: vi.fn().mockImplementation(table => {
      const tableSpecificConfig = tableConfig[table] || {}
      const mockData = tableSpecificConfig.data || defaultData
      const mockError = tableSpecificConfig.error || defaultError

      const chain = createChain({ data: mockData, error: mockError }, ['from', table])

      // Configurar comportamiento especial según la tabla
      if (table === 'products') {
        // Para productos, mock especial para decrementStock
        if (tableSpecificConfig.decrementStock) {
          return createMockForDecrementStock(tableSpecificConfig.decrementStock)
        }
      }

      if (table === 'orders') {
        // Para órdenes, mock especial para relaciones
        return createMockForOrders(mockData, mockError)
      }

      return chain
    }),

    // Para llamadas RPC
    rpc: vi.fn().mockImplementation((fnName, params) => {
      path.push('rpc', fnName, params)
      return Promise.resolve({ data: defaultData, error: defaultError })
    }),

    // Métodos de utilidad
    _getCallHistory: () => [...callHistory],
    _clearCallHistory: () => {
      callHistory.length = 0
    },

    // Métodos helpers para configurar respuestas específicas
    configureTableResponse: (table, response) => {
      tableConfig[table] = { ...tableConfig[table], ...response }
    }
  }

  return supabaseMock
}

/**
 * Mock especializado para decrementStock (dos llamadas consecutivas)
 */
function createMockForDecrementStock(config) {
  const { currentStock, updatedProduct } = config

  // Primera llamada: obtener stock actual
  const firstCall = {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { stock: currentStock },
          error: null
        })
      })
    })
  }

  // Segunda llamada: actualizar stock
  const secondCall = {
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: updatedProduct,
            error: null
          })
        })
      })
    })
  }

  const mockFrom = vi.fn()
  mockFrom.mockReturnValueOnce(firstCall).mockReturnValueOnce(secondCall)

  return mockFrom
}

/**
 * Mock especializado para órdenes con relaciones
 */
function createMockForOrders(data, error) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data, error })
      })
    })
  }
}

/**
 * Helper para configurar mocks comunes
 */
export const supabaseMockHelpers = {
  /**
   * Mock para findById exitoso
   */
  findById: (table, id, data) => {
    const mock = createUnifiedSupabaseMock()
    mock.configureTableResponse(table, {
      data,
      mockType: 'findById'
    })
    return mock
  },

  /**
   * Mock para findAll con filtros
   */
  findAll: (table, dataArray) => {
    const mock = createUnifiedSupabaseMock()
    mock.configureTableResponse(table, {
      data: dataArray,
      mockType: 'findAll'
    })
    return mock
  },

  /**
   * Mock para error 404 (not found)
   */
  notFound: table => {
    const mock = createUnifiedSupabaseMock()
    mock.configureTableResponse(table, {
      data: null,
      error: { code: 'PGRST116', message: 'Not found' },
      mockType: 'notFound'
    })
    return mock
  },

  /**
   * Mock para decrementStock
   */
  decrementStock: (currentStock, updatedProduct) => {
    const mock = createUnifiedSupabaseMock({
      tableConfig: {
        products: {
          decrementStock: { currentStock, updatedProduct }
        }
      }
    })
    return mock
  }
}

/**
 * Mock por defecto exportado para uso común
 */
export const defaultSupabaseMock = createUnifiedSupabaseMock({
  defaultData: { id: 1, name: 'Test' },
  tableConfig: {
    products: {
      data: { id: 1, name: 'Test Product', stock: 100 },
      mockType: 'default'
    },
    orders: {
      data: { id: 1, status: 'pending' },
      mockType: 'default'
    }
  }
})
