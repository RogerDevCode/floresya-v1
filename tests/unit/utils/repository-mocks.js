/**
 * Repository Mocks Configuration
 * Comprehensive mock setup for all repository tests
 */

import { vi } from 'vitest'

/**
 * Create a fully functional Supabase mock for repositories
 */
export function createRepositorySupabaseMock(data = []) {
  // Create a chainable mock
  const chainableMock = {
    data: data,
    error: null,
    count: data.length,
    from: vi.fn().mockReturnThis(),
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
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: data[0] || null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: data[0] || null, error: null }),
    then: vi.fn().mockImplementation(resolve => resolve({ data, error: null }))
  }

  // Make all methods chainable by returning the same mock
  const methods = [
    'from',
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
    'range'
  ]

  methods.forEach(method => {
    chainableMock[method].mockImplementation(function (..._args) {
      return chainableMock
    })
  })

  // Special handling for single/maybeSingle
  chainableMock.single.mockResolvedValue({ data: data[0] || null, error: null })
  chainableMock.maybeSingle.mockResolvedValue({ data: data[0] || null, error: null })

  return {
    from: chainableMock.from,
    auth: {
      uid: vi.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: '123e4567-e89b-12d3-a456-426614174000' } },
        error: null
      })
    },
    // Add a property to access the chainable mock
    _mock: chainableMock
  }
}

/**
 * Setup Order Repository Mock
 */
export function setupOrderRepositoryMock() {
  const mockOrders = [
    {
      id: 1,
      user_id: 123,
      status: 'pending',
      total_amount_usd: 50.99,
      total_amount_ves: 1860,
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    }
  ]

  return createRepositorySupabaseMock(mockOrders)
}

/**
 * Setup Product Repository Mock
 */
export function setupProductRepositoryMock() {
  const mockProducts = [
    {
      id: 1,
      name: 'Test Product',
      sku: 'TEST-001',
      price_usd: 25.99,
      stock: 100,
      active: true,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    }
  ]

  return createRepositorySupabaseMock(mockProducts)
}

/**
 * Setup User Repository Mock
 */
export function _setupUserRepositoryMock() {
  const mockUsers = [
    {
      id: 1,
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '+584141234567',
      role: 'customer',
      active: true,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    }
  ]

  return createRepositorySupabaseMock(mockUsers)
}
