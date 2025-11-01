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

// Global mock for errorHandler - Enhanced with proper HTTP status codes and error handling
vi.mock('../api/middleware/errorHandler.js', () => {
  // Map error types to appropriate HTTP status codes and messages
  const getErrorResponse = err => {
    // Default values
    let statusCode = 500
    let errorType = 'Internal Server Error'
    let errorMessage = err.message || 'An unexpected error occurred'
    let errorDetails = null

    // Check error type and map to appropriate status code
    if (err.name === 'ValidationError') {
      statusCode = 400
      errorType = 'Validation Error'
      errorMessage = err.message || 'Validation failed'
      errorDetails = err.details || null
    } else if (err.name === 'BadRequestError') {
      statusCode = 400
      errorType = 'Bad Request'
      errorMessage = err.message || 'Invalid request parameters'
      errorDetails = err.details || null
    } else if (err.name === 'UnauthorizedError') {
      statusCode = 401
      errorType = 'Unauthorized'
      errorMessage = err.message || 'Authentication required'
      errorDetails = null
    } else if (err.name === 'ForbiddenError') {
      statusCode = 403
      errorType = 'Forbidden'
      errorMessage = err.message || 'Access denied'
      errorDetails = null
    } else if (err.name === 'NotFoundError') {
      statusCode = 404
      errorType = 'Not Found'
      errorMessage = err.message || 'Resource not found'
      errorDetails = null
    } else if (err.name === 'DatabaseError') {
      statusCode = 500
      errorType = 'Database Error'
      errorMessage = `Database operation failed: ${err.operation || 'Unknown operation'} on ${err.table || 'Unknown table'}`
      errorDetails = err.context || null
    } else if (err.statusCode) {
      // Use statusCode from error if available
      statusCode = err.statusCode
      errorType = err.name || 'Error'
      errorMessage = err.message || 'An error occurred'
    }

    return { statusCode, errorType, errorMessage, errorDetails }
  }

  return {
    asyncHandler: vi.fn(fn => async (...args) => {
      return await fn(...args)
    }),
    errorHandler: vi.fn((err, req, res, _next) => {
      const { statusCode, errorType, errorMessage, errorDetails } = getErrorResponse(err)

      const errorResponse = {
        success: false,
        error: errorType,
        message: errorMessage
      }

      // Add details if available
      if (errorDetails) {
        errorResponse.details = errorDetails
      }

      // Add timestamp
      errorResponse.timestamp = new Date().toISOString()

      // Log error for debugging in tests
      console.error(`[Test Error Handler] ${errorType} (${statusCode}): ${errorMessage}`, {
        errorName: err.name,
        stack: err.stack
      })

      res.status(statusCode).json(errorResponse)
    }),
    notFoundHandler: vi.fn((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      })
    })
  }
})

// Global mock for supabase client - Enhanced with proper method chaining
vi.mock('../api/services/supabaseClient.js', () => {
  // Mock data for tests
  const mockProducts = [
    { id: 1, nombre: 'Test Product', precio: 100, active: true },
    { id: 2, nombre: 'Test Product 2', precio: 200, active: false }
  ]

  const mockOrders = [
    { id: 1, customer_name: 'John Doe', status: 'pending', total_amount: 99.99, active: true }
  ]

  const createMockQuery = data => {
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
      single: vi
        .fn()
        .mockResolvedValue({ data: data[0] || null, error: data[0] ? null : { code: 'PGRST116' } }),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis()
    }
    return mockQuery
  }

  return {
    supabase: {
      from: vi.fn(table => {
        if (table === 'products') {
          return createMockQuery(mockProducts)
        }
        if (table === 'orders') {
          return createMockQuery(mockOrders)
        }
        return createMockQuery([])
      }),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
      storage: {
        from: vi.fn(() => ({
          getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'test-url' } }))
        }))
      }
    },
    DB_SCHEMA: {
      products: {
        table: 'products',
        pk: 'id',
        indexes: [
          'sku',
          'active',
          'featured',
          'carousel_order',
          'name_normalized',
          'description_normalized'
        ],
        filters: ['active', 'featured'],
        sorts: ['created_at', 'carousel_order'],
        search: ['name_normalized', 'description_normalized'],
        enums: {},
        columns: [
          'id',
          'name',
          'summary',
          'description',
          'price_usd',
          'price_ves',
          'stock',
          'sku',
          'active',
          'featured',
          'carousel_order',
          'created_at',
          'updated_at',
          'name_normalized',
          'description_normalized'
        ]
      },
      product_images: {
        table: 'product_images',
        pk: 'id',
        indexes: ['product_id', 'size', 'is_primary'],
        unique: ['product_id', 'image_index', 'size'],
        enums: {
          size: ['thumb', 'small', 'medium', 'large']
        },
        columns: [
          'id',
          'product_id',
          'url',
          'image_index',
          'size',
          'is_primary',
          'file_hash',
          'mime_type',
          'created_at',
          'updated_at'
        ]
      },
      orders: {
        table: 'orders',
        pk: 'id',
        indexes: [
          'user_id',
          'status',
          'created_at',
          'customer_email',
          'customer_name_normalized',
          'customer_email_normalized'
        ],
        filters: ['status', 'user_id', 'customer_email'],
        sorts: ['created_at'],
        search: ['customer_name_normalized', 'customer_email_normalized'],
        enums: {
          status: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled']
        },
        columns: [
          'id',
          'user_id',
          'customer_email',
          'customer_name',
          'customer_phone',
          'delivery_address',
          'delivery_date',
          'delivery_time_slot',
          'delivery_notes',
          'status',
          'total_amount_usd',
          'total_amount_ves',
          'currency_rate',
          'notes',
          'admin_notes',
          'created_at',
          'updated_at',
          'customer_name_normalized',
          'customer_email_normalized'
        ]
      },
      users: {
        table: 'users',
        pk: 'id',
        indexes: ['email', 'full_name_normalized', 'email_normalized'],
        search: ['full_name_normalized', 'email_normalized'],
        enums: {
          role: ['user', 'admin']
        },
        columns: [
          'id',
          'email',
          'password_hash',
          'full_name',
          'phone',
          'role',
          'is_active',
          'email_verified',
          'created_at',
          'updated_at',
          'full_name_normalized',
          'email_normalized'
        ]
      },
      occasions: {
        table: 'occasions',
        pk: 'id',
        indexes: ['slug'],
        filters: ['is_active', 'display_order'],
        columns: [
          'id',
          'name',
          'description',
          'is_active',
          'display_order',
          'created_at',
          'updated_at',
          'slug'
        ]
      },
      product_occasions: {
        table: 'product_occasions',
        pk: 'id',
        indexes: ['product_id', 'occasion_id'],
        unique: ['product_id', 'occasion_id'],
        columns: ['id', 'product_id', 'occasion_id', 'created_at']
      },
      order_items: {
        table: 'order_items',
        pk: 'id',
        indexes: ['order_id', 'product_id'],
        filters: ['order_id', 'product_id'],
        columns: [
          'id',
          'order_id',
          'product_id',
          'product_name',
          'product_summary',
          'unit_price_usd',
          'unit_price_ves',
          'quantity',
          'subtotal_usd',
          'subtotal_ves'
        ]
      },
      payments: {
        table: 'payments',
        pk: 'id',
        indexes: ['order_id', 'status', 'payment_method'],
        filters: ['order_id', 'status', 'payment_method'],
        enums: {
          status: ['pending', 'completed', 'failed', 'refunded'],
          payment_method: ['cash', 'card', 'bank_transfer', 'zelle', 'paypal']
        },
        columns: [
          'id',
          'order_id',
          'amount_usd',
          'amount_ves',
          'currency_rate',
          'payment_method',
          'status',
          'transaction_id',
          'payment_date',
          'created_at',
          'updated_at'
        ]
      },
      settings: {
        table: 'settings',
        pk: 'id',
        indexes: ['key'],
        unique: ['key'],
        columns: ['id', 'key', 'value', 'type', 'description', 'updated_at']
      },
      payment_methods: {
        table: 'payment_methods',
        pk: 'id',
        indexes: ['user_id', 'is_default'],
        filters: ['user_id', 'is_default'],
        enums: {
          type: ['card', 'bank_account', 'digital_wallet']
        },
        columns: ['id', 'user_id', 'type', 'details', 'is_default', 'created_at', 'updated_at']
      }
    }
  }
})

// Mock authService for testing - Critical for authentication middleware
vi.mock('../api/services/authService.js', () => {
  // Mock user for testing - Admin privileges
  const mockAdminUser = {
    id: 1,
    email: 'admin@test.com',
    role: 'admin',
    full_name: 'Test Admin',
    user_metadata: { role: 'admin' }
  }

  return {
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    refreshToken: vi.fn(),
    // getUser should return the mock user for valid tokens
    // Returns just the user object (not wrapped in {data, error})
    getUser: vi.fn(async token => {
      // For test tokens, return mock admin user
      if (token && token.includes('token')) {
        return mockAdminUser
      }
      // For invalid tokens, throw UnauthorizedError
      const { UnauthorizedError } = await import('../api/errors/AppError.js')
      throw new UnauthorizedError('Invalid or expired token', {})
    }),
    resetPassword: vi.fn(),
    updatePassword: vi.fn()
  }
})

// Global mock for error classes - Enhanced with ERROR_CODES and RFC 7807 compliance
vi.mock('../api/errors/AppError.js', async importOriginal => {
  const original = await importOriginal()

  // Mock ERROR_CODES
  const ERROR_CODES = {
    VALIDATION_FAILED: 1001,
    INVALID_INPUT: 1002,
    MISSING_REQUIRED_FIELD: 1003,
    UNAUTHORIZED: 2001,
    FORBIDDEN: 2004,
    RESOURCE_NOT_FOUND: 3001,
    PRODUCT_NOT_FOUND: 3003,
    INSUFFICIENT_STOCK: 4001,
    PAYMENT_FAILED: 4002,
    RESOURCE_CONFLICT: 4006,
    INTERNAL_SERVER_ERROR: 5001,
    DATABASE_ERROR: 5002,
    EXTERNAL_SERVICE_ERROR: 5003,
    SERVICE_UNAVAILABLE: 5004
  }

  // Mock getErrorCategory
  const getErrorCategory = code => {
    if (code >= 1001 && code <= 1999) {
      return 'validation'
    }
    if (code >= 2001 && code <= 2999) {
      return 'authentication'
    }
    if (code >= 3001 && code <= 3999) {
      return 'not_found'
    }
    if (code >= 4001 && code <= 4999) {
      return 'business'
    }
    if (code >= 5001 && code <= 5999) {
      return 'server'
    }
    return 'unknown'
  }

  return {
    ...original,
    ERROR_CODES,
    getErrorCategory
  }
})

// Import and setup DOM environment for frontend tests
import('happy-dom').then(({ Window }) => {
  if (typeof window === 'undefined') {
    const testWindow = new Window()
    global.window = testWindow
    global.document = testWindow.document
    global.HTMLElement = testWindow.HTMLElement
    global.navigator = testWindow.navigator
    global.HTMLCollection = testWindow.HTMLCollection
    global.NodeList = testWindow.NodeList
    global.requestAnimationFrame = cb => setTimeout(cb, 0)
    global.cancelAnimationFrame = () => {}
    global.fetch = vi.fn(() => Promise.resolve({}))
    global.Response = class Response {}
    global.Headers = class Headers {}
    global.URL = testWindow.URL
    global.location = testWindow.location
    global.localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
    global.sessionStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
  }
})

console.log('🧪 Global test setup completed')
