/**
 * Global Test Setup
 * Se ejecuta antes de todos los tests
 * Configura DI Container con mocks
 */

import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import DIContainer from '../api/architecture/di-container.js'
import { createProductRepository } from '../api/repositories/ProductRepository.js'
import { createUserRepository } from '../api/repositories/UserRepository.js'
import { createOrderRepository } from '../api/repositories/OrderRepository.js'

// Mock de Supabase para todos los tests
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      single: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null })),
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null })),
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      order: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        range: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null }))
          }))
        })),
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })),
      range: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }))
}

// Inicialización asíncrona
async function setupDIContainer() {
  // Registrar repositories en DI Container
  DIContainer.registerInstance('SupabaseClient', mockSupabase)
  DIContainer.register('ProductRepository', createProductRepository, ['SupabaseClient'])
  DIContainer.register('UserRepository', createUserRepository, ['SupabaseClient'])
  DIContainer.register('OrderRepository', createOrderRepository, ['SupabaseClient'])

  // Registrar services
  // Importar dinámicamente para evitar problemas de import circular
  try {
    const { createProductService } = await import('../api/services/productService.js')
    DIContainer.register('ProductService', createProductService, ['ProductRepository'])
  } catch (error) {
    console.warn('⚠️  Could not register ProductService:', error.message)
  }
}

// Configurar antes de todos los tests
beforeAll(async () => {
  await setupDIContainer()
  console.log('✅ DI Container configured for tests')
})

// Limpiar después de todos los tests
afterAll(() => {
  DIContainer.clear()
  console.log('🧹 DI Container cleaned up')
})

// Limpiar mocks antes de cada test
beforeEach(() => {
  vi.clearAllMocks()
})

// Restaurar mocks después de cada test
afterEach(() => {
  vi.restoreAllMocks()
})
