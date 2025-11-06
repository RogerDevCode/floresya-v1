/**
 * Test Setup - DI Container Configuration
 * Configura DI Container con mocks para tests
 */

import DIContainer from '../api/architecture/di-container.js'
import { createProductRepository } from '../api/repositories/ProductRepository.js'
import { createUserRepository } from '../api/repositories/UserRepository.js'
import { createOrderRepository } from '../api/repositories/OrderRepository.js'

/**
 * Configura DI Container con mocks para tests
 * @param {Object} mockSupabase - Mock de Supabase client
 */
export function setupDIContainerWithMocks(mockSupabase) {
  // Registrar repositories con mock de Supabase
  DIContainer.register('ProductRepository', createProductRepository, [mockSupabase])
  DIContainer.register('UserRepository', createUserRepository, [mockSupabase])
  DIContainer.register('OrderRepository', createOrderRepository, [mockSupabase])
  DIContainer.register('SupabaseClient', mockSupabase)

  return DIContainer
}

/**
 * Limpia DI Container después de tests
 */
export function clearDIContainer() {
  DIContainer.clear()
}

/**
 * Crea mock de Supabase para tests
 */
export function createMockSupabase() {
  return {
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
}
