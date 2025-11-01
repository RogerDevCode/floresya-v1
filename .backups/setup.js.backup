/**
 * Global Test Setup
 * Configures global mocks and test environment
 */

import { vi, beforeEach, afterEach, beforeAll, afterAll, describe, test, it, expect } from 'vitest'

// Make globals available manually since we disabled them globally
global.vi = vi
global.beforeEach = beforeEach
global.afterEach = afterEach
global.beforeAll = beforeAll
global.afterAll = afterAll
global.describe = describe
global.test = test
global.it = it
global.expect = expect

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_KEY = 'test-key'

// Global mock for errorHandler - this will be available in all tests
vi.mock('../api/middleware/errorHandler.js', () => ({
  asyncHandler: vi.fn(fn => fn),
  errorHandler: vi.fn((err, req, res, _next) => {
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message
    })
  }),
  notFoundHandler: vi.fn((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: 'Route not found'
    })
  })
}))

// Global mock for supabase client - Enhanced with proper method chaining
vi.mock('../api/services/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => {
      // Create a complete chainable mock
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        select: vi.fn(() => mockQuery)
      }
      return mockQuery
    }),
    storage: {
      from: vi.fn(() => ({
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'test-url' } }))
      }))
    }
  },
  DB_SCHEMA: {
    products: { table: 'products' },
    product_images: { table: 'product_images' },
    categories: { table: 'categories' }
  }
}))

// Global mock for error classes
vi.mock('../api/errors/AppError.js', () => ({
  ValidationError: class ValidationError extends Error {
    constructor(message, details) {
      super(message)
      this.name = 'ValidationError'
      this.details = details
    }
  },
  NotFoundError: class NotFoundError extends Error {
    constructor(entity, id) {
      super(`${entity} with ID ${id} not found`)
      this.name = 'NotFoundError'
    }
  },
  DatabaseError: class DatabaseError extends Error {
    constructor(operation, table, originalError, context) {
      super(`Database ${operation} failed on ${table}`)
      this.name = 'DatabaseError'
      this.operation = operation
      this.table = table
      this.originalError = originalError
      this.context = context
    }
  },
  BadRequestError: class BadRequestError extends Error {
    constructor(message, details) {
      super(message)
      this.name = 'BadRequestError'
      this.details = details
    }
  }
}))

console.log('🧪 Global test setup completed')
