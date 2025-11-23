/**
 * Services Test Setup
 * Provides centralized mocking for all service tests
 * Following KISS principle and Supabase best practices
 */
// @ts-nocheck

import { vi } from 'vitest'
import { createSupabaseClientMock } from '../supabase-client/mocks/mocks.js'

// Mock DIContainer globally
vi.mock('../../api/architecture/di-container.js', () => {
  const mockDIContainer = {
    resolve: vi.fn(),
    register: vi.fn(),
    registerInstance: vi.fn(),
    has: vi.fn(),
    clear: vi.fn()
  }

  return {
    default: mockDIContainer,
    initializeDIContainer: vi.fn(() => mockDIContainer)
  }
})

// Logger is mocked per test in DIContainer

// Validation utilities are not mocked - we want to test the actual validation

// Mock sanitize utilities
vi.mock('../../api/utils/sanitize.js', () => ({
  sanitizeOrderData: vi.fn(data => data),
  sanitizeOrderItemData: vi.fn(data => data),
  sanitizeProductData: vi.fn(data => data)
}))

// Mock error mapping
vi.mock('../../api/middleware/error/index.js', () => ({
  withErrorMapping: vi.fn(fn => fn)
}))

// Mock supabase client
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: createSupabaseClientMock(),
  DB_SCHEMA: {
    users: {
      table: 'users',
      enums: {
        role: ['user', 'admin']
      }
    },
    orders: {
      table: 'orders',
      enums: {
        status: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled']
      }
    },
    products: {
      table: 'products',
      enums: {}
    },
    occasions: {
      table: 'occasions',
      enums: {}
    },
    payments: {
      table: 'payments',
      enums: {}
    },
    settings: {
      table: 'settings',
      enums: {}
    }
  }
}))

// Mock AppError classes
vi.mock('../../api/errors/AppError.js', () => ({
  ValidationError: class ValidationError extends Error {
    constructor(message, context = {}) {
      super(message)
      this.name = 'ValidationError'
      this.context = context
    }
  },
  NotFoundError: class NotFoundError extends Error {
    constructor(resource, id, context = {}) {
      super(`${resource}${id ? ` ${id}` : ''} not found`)
      this.name = 'NotFoundError'
      this.resource = resource
      this.id = id
      this.context = context
    }
  },
  BadRequestError: class BadRequestError extends Error {
    constructor(message, context = {}) {
      super(message)
      this.name = 'BadRequestError'
      this.context = context
    }
  },
  DatabaseError: class DatabaseError extends Error {
    constructor(operation, table, originalError, context = {}) {
      super(`Database error in ${operation} on ${table}`)
      this.name = 'DatabaseError'
      this.operation = operation
      this.table = table
      this.originalError = originalError
      this.context = context
    }
  },
  DatabaseConstraintError: class DatabaseConstraintError extends Error {
    constructor(code, table, context = {}) {
      super(`Database constraint error in ${table}`)
      this.name = 'DatabaseConstraintError'
      this.code = code
      this.table = table
      this.context = context
    }
  },
  UnauthorizedError: class UnauthorizedError extends Error {
    constructor(message, context = {}) {
      super(message)
      this.name = 'UnauthorizedError'
      this.context = context
    }
  },
  ConflictError: class ConflictError extends Error {
    constructor(message, context = {}) {
      super(message)
      this.name = 'ConflictError'
      this.context = context
    }
  },
  InternalServerError: class InternalServerError extends Error {
    constructor(message, context = {}) {
      super(message)
      this.name = 'InternalServerError'
      this.context = context
    }
  }
}))

// Helper function to create mock repository
export function createMockRepository(methods = {}) {
  const defaultMethods = {
    findById: vi.fn(),
    findOne: vi.fn(),
    findMany: vi.fn(),
    findAll: vi.fn(),
    findAllWithFilters: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    softDelete: vi.fn(),
    reactivate: vi.fn(),
    verifyEmail: vi.fn(),
    findByEmail: vi.fn(),
    findWithProfile: vi.fn(),
    createUserWithProfile: vi.fn(),
    updateByUserId: vi.fn(),
    findByIdWithItems: vi.fn(),
    findStatusHistoryByOrderId: vi.fn(),
    cancel: vi.fn()
  }

  return {
    ...defaultMethods,
    ...methods
  }
}

// Helper function to setup DIContainer mocks
export async function setupDIContainerMocks(mocks = {}) {
  const { default: DIContainer } = await import('../../api/architecture/di-container.js')

  // Create default mocks for common repositories
  const defaultMocks = {
    UserRepository: createMockRepository(),
    OrderRepository: createMockRepository(),
    ProductRepository: createMockRepository(),
    OccasionRepository: createMockRepository(),
    PaymentRepository: createMockRepository(),
    SettingsRepository: createMockRepository(),
    PaymentMethodRepository: createMockRepository(),
    ProductImageRepository: createMockRepository(),
    Logger: {
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn()
    }
  }

  // Merge with provided mocks
  const allMocks = { ...defaultMocks, ...mocks }

  // Mock the resolve method
  DIContainer.resolve.mockImplementation(name => {
    if (allMocks[name]) {
      return allMocks[name]
    }
    return createMockRepository()
  })

  // Mock other methods
  DIContainer.has.mockImplementation(name => true)
  DIContainer.register.mockImplementation(() => {})
  DIContainer.registerInstance.mockImplementation(() => {})
  DIContainer.clear.mockImplementation(() => {})

  return DIContainer
}

// Helper function to reset all mocks
export function resetAllMocks() {
  vi.clearAllMocks()
  vi.resetAllMocks()
}

// Helper function to create test data
export const testData = {
  users: {
    valid: {
      id: 1,
      email: 'test@example.com',
      full_name: 'Test User',
      phone: '+1234567890',
      role: 'user',
      active: true,
      email_verified: false
    },
    admin: {
      id: 2,
      email: 'admin@example.com',
      full_name: 'Admin User',
      role: 'admin',
      active: true,
      email_verified: true
    },
    inactive: {
      id: 3,
      email: 'inactive@example.com',
      full_name: 'Inactive User',
      active: false
    }
  },
  orders: {
    pending: {
      id: 1,
      user_id: 1,
      customer_email: 'customer@example.com',
      customer_name: 'Customer Name',
      status: 'pending',
      total_amount_usd: 29.99,
      delivery_address: 'Test Address 123'
    },
    delivered: {
      id: 2,
      user_id: 1,
      status: 'delivered',
      total_amount_usd: 59.98
    }
  },
  products: {
    active: {
      id: 1,
      name: 'Test Product',
      price_usd: 19.99,
      stock: 10,
      active: true
    },
    inactive: {
      id: 2,
      name: 'Inactive Product',
      active: false
    }
  }
}

// Export common test utilities
export { createSupabaseClientMock }
