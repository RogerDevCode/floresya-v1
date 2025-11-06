/**
 * Test Helpers - Mocks and Utilities
 * Reusable mocks and helpers for unit tests
 */

import { vi } from 'vitest'

/**
 * Mock error middleware
 * Exports: errorHandler, notFoundHandler, asyncHandler, withErrorMapping, createTableOperations
 */
export function createErrorMiddlewareMock() {
  return {
    errorHandler: vi.fn((err, req, res, next) => next(err)),
    notFoundHandler: vi.fn((req, res, next) => next()),
    asyncHandler: vi.fn(fn => (req, res, next) => fn(req, res, next)),
    withErrorMapping: vi.fn(fn => fn),
    createTableOperations: vi.fn(() => ({
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }))
  }
}

/**
 * Mock Supabase client - Enhanced with proper chaining
 * Simulates PostgREST client behavior with proper method chaining
 */
export function createSupabaseClientMock() {
  const mock = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
  }

  // Make all methods chainable
  const chainableMethods = [
    'from',
    'select',
    'insert',
    'update',
    'delete',
    'eq',
    'neq',
    'in',
    'order',
    'range'
  ]
  chainableMethods.forEach(method => {
    mock[method].mockImplementation(function (..._args) {
      return mock
    })
  })

  return mock
}

/**
 * Create a vi.mock factory for error middleware
 */
export function errorMiddlewareMockFactory() {
  const mock = createErrorMiddlewareMock()
  return {
    errorHandler: mock.errorHandler,
    notFoundHandler: mock.notFoundHandler,
    asyncHandler: mock.asyncHandler,
    withErrorMapping: mock.withErrorMapping,
    createTableOperations: mock.createTableOperations
  }
}

/**
 * Create a vi.mock factory for Supabase
 */
export function supabaseMockFactory() {
  const mockClient = createSupabaseClientMock()

  return {
    default: mockClient,
    createClient: vi.fn(() => mockClient)
  }
}
