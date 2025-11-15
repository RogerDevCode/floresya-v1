/**
 * Procesado por B
 */

/**
 * Integration Test Setup
 * Configures Supabase mocking and app initialization for integration tests
 * Ensures proper isolation between tests
 */

import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { createMockSupabaseClient, mockDatabase } from '../test-utils.js'
import { initializeDIContainer } from '../../architecture/di-container.js'

// Global test configuration
process.env.NODE_ENV = 'test'

// Mock swagger.js before any other imports to prevent fileURLToPath issues
vi.mock(
  '../../config/swagger.js',
  () => ({
    swaggerSpec: {
      openapi: '3.1.0',
      info: { title: 'FloresYa API', version: '1.0.0' },
      paths: {},
      components: { schemas: {} }
    }
  }),
  { virtual: false }
)

// Mock Supabase client globally for all integration tests
const mockSupabase = createMockSupabaseClient({
  mockResponses: {
    // Default empty responses - tests can override as needed
    products: { data: [], error: null },
    users: { data: [], error: null },
    orders: { data: [], error: null },
    occasions: { data: [], error: null },
    payments: { data: [], error: null },
    payment_methods: { data: [], error: null },
    settings: { data: [], error: null },
    product_images: { data: [], error: null },
    order_items: { data: [], error: null },
    order_status_history: { data: [], error: null }
  },
  authResponses: {
    getUser: { data: { user: null }, error: null },
    getSession: { data: { session: null }, error: null }
  },
  storageResponses: {
    upload: { data: { path: 'test-path' }, error: null },
    getPublicUrl: { data: { publicUrl: 'https://test-url.com' } }
  }
})

// Mock the supabaseClient module
vi.mock('../../services/supabaseClient.js', () => ({
  supabase: mockSupabase,
  DB_SCHEMA: {
    users: {
      table: 'users',
      pk: 'id',
      enums: {
        role: ['user', 'admin']
      }
    },
    occasions: {
      table: 'occasions',
      pk: 'id'
    },
    products: {
      table: 'products',
      pk: 'id'
    },
    product_occasions: {
      table: 'product_occasions',
      pk: 'id'
    },
    product_images: {
      table: 'product_images',
      pk: 'id',
      enums: {
        size: ['thumb', 'small', 'medium', 'large']
      }
    },
    orders: {
      table: 'orders',
      pk: 'id',
      enums: {
        status: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled']
      }
    },
    order_items: {
      table: 'order_items',
      pk: 'id'
    },
    order_status_history: {
      table: 'order_status_history',
      pk: 'id'
    },
    payment_methods: {
      table: 'payment_methods',
      pk: 'id',
      enums: {
        type: ['bank_transfer', 'mobile_payment', 'cash', 'crypto', 'international']
      }
    },
    payments: {
      table: 'payments',
      pk: 'id',
      enums: {
        status: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded']
      }
    },
    settings: {
      table: 'settings',
      pk: 'id'
    }
  },
  DB_FUNCTIONS: {}
}))

// Mock individual auth service modules
vi.mock('../../services/authService.helpers.js', () => ({
  getUserRole: vi.fn(),
  validateEmail: vi.fn(),
  validatePassword: vi.fn()
}))

vi.mock('../../services/authService.auth.js', () => ({
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn()
}))

vi.mock('../../services/authService.session.js', () => ({
  getSession: vi.fn(),
  refreshSession: vi.fn()
}))

vi.mock('../../services/authService.user.js', () => ({
  getUser: vi.fn(token => {
    if (!token || token === 'invalid-token') {
      const { UnauthorizedError } = require('../../errors/AppError.js')
      throw new UnauthorizedError('Authentication required: No valid token provided')
    }
    // Return a mock user for testing
    return {
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          user_metadata: { role: 'user' }
        }
      },
      error: null
    }
  })
}))

// Mock the original authService for backward compatibility
vi.mock('../../services/authService.js', () => ({
  getUser: vi.fn(token => {
    if (!token || token === 'invalid-token') {
      const { UnauthorizedError } = require('../../errors/AppError.js')
      throw new UnauthorizedError('Authentication required: No valid token provided')
    }
    // Return a mock user for testing
    return {
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          user_metadata: { role: 'user' }
        }
      },
      error: null
    }
  }),
  getSession: vi.fn(),
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn()
}))

// Mock the modularized authService version (barrel export)
vi.mock('../../services/authService.index.js', () => ({
  getUser: vi.fn(token => {
    if (!token || token === 'invalid-token') {
      const { UnauthorizedError } = require('../../errors/AppError.js')
      throw new UnauthorizedError('Authentication required: No valid token provided')
    }
    // Return a mock user for testing
    return {
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          user_metadata: { role: 'user' }
        }
      },
      error: null
    }
  }),
  getSession: vi.fn(),
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn()
}))

// Mock other external dependencies that might cause issues in tests
vi.mock('../../monitoring/databaseMonitor.js', () => ({
  createMonitoredSupabaseClient: client => client
}))

vi.mock('../../monitoring/metricsCollector.js', () => ({
  metricsMiddleware: (req, res, next) => next(),
  orderMetricsMiddleware: (req, res, next) => next()
}))

vi.mock('../../middleware/performance/index.js', () => ({
  cacheMiddleware: (req, res, next) => next(),
  withDatabaseCircuitBreaker: () => (req, res, next) => next(),
  circuitBreakerHealthCheck: (req, res) => res.json({ success: true, data: { status: 'CLOSED' } }),
  getCircuitBreakerStatus: () => ({
    database: {
      failureCount: 0,
      isHealthy: true,
      lastFailureTime: null,
      name: 'database',
      nextAttempt: null,
      state: 'CLOSED',
      successCount: 0
    },
    timestamp: new Date().toISOString()
  }),
  resetCircuitBreaker: vi.fn()
}))

vi.mock('../../services/businessRules.js', () => ({
  validateBusinessRules: vi.fn((rule, data) => Promise.resolve()),
  getBusinessRulesStatus: vi.fn(() => ({ status: 'ok', rules: [] }))
}))

vi.mock('../../contract/divergenceDetector.js', () => ({
  createDivergenceDetectionMiddleware: () => (req, res, next) => next()
}))

vi.mock('../../contract/documentationSync.js', () => ({
  createDocumentationComplianceMiddleware: () => (req, res, next) => next()
}))

vi.mock('../../recovery/autoRecovery.js', () => ({
  comprehensiveHealthCheck: vi.fn(() => ({
    healthScore: 80,
    isHealthy: true,
    timestamp: new Date().toISOString(),
    uptime: 4.672748048,
    metrics: {
      business: { orders: 0, products: 0, users: 0 },
      cpu: { isOverheadAcceptable: true, monitoringOverhead: 10.22, usage: 102.19 },
      database: { averageQueryTime: 0, queryCount: 0, slowQueriesCount: 0, totalQueryTime: 0 },
      errors: { errorRate: 0, recent: [], total: 0 },
      memoryUsage: { external: 3.7, heapTotal: 83.3, heapUsed: 56.55, rss: 146.29 },
      performance: {
        averageResponseTime: 0,
        errorRate: 0,
        failedRequests: 0,
        responseTimePercentiles: { p50: 0, p95: 0, p99: 0 },
        successfulRequests: 0,
        throughput: { perHour: 0, perMinute: 0, perSecond: 0 },
        totalRequests: 0
      },
      timestamp: new Date().toISOString(),
      uptime: 1728
    },
    circuitBreaker: {
      database: {
        failureCount: 0,
        isHealthy: true,
        lastFailureTime: null,
        name: 'database',
        nextAttempt: null,
        state: 'CLOSED',
        successCount: 0
      },
      timestamp: new Date().toISOString()
    },
    recovery: {
      config: {
        healthCheckInterval: 30000,
        maxRecoveryAttempts: 3,
        memoryThreshold: 200,
        recoveryCooldown: 300000,
        recoveryThreshold: 60
      },
      isActive: true,
      isRecovering: false,
      lastHealthCheck: new Date().toISOString(),
      stats: {
        failedRecoveries: 0,
        lastRecovery: null,
        recoveryAttempts: 0,
        successfulRecoveries: 0,
        totalRecoveries: 0
      }
    }
  })),
  getRecoveryStatus: vi.fn(() => ({
    isActive: true,
    isRecovering: false,
    lastHealthCheck: new Date().toISOString(),
    stats: {
      failedRecoveries: 0,
      lastRecovery: null,
      recoveryAttempts: 0,
      successfulRecoveries: 0,
      totalRecoveries: 0
    },
    config: {
      healthCheckInterval: 30000,
      maxRecoveryAttempts: 3,
      memoryThreshold: 200,
      recoveryCooldown: 300000,
      recoveryThreshold: 60
    }
  })),
  forceRecovery: vi.fn(() => ({ status: 'recovered' })),
  updateRecoveryConfig: vi.fn(() => ({ status: 'updated' }))
}))

vi.mock('../../middleware/api/index.js', () => ({
  standardResponse: (req, res, next) => next(),
  initializeOpenApiValidator: vi.fn(() => Promise.resolve())
}))

vi.mock('../../middleware/auth/index.js', () => ({
  configureSecureSession: () => (req, res, next) => next(),
  sessionSecurityHeaders: (req, res, next) => next(),
  validateSession: (req, res, next) => next(),
  csrfToken: (req, res, next) => next(),
  validateCsrf: (req, res, next) => next()
}))

vi.mock('url', () => ({
  fileURLToPath: vi.fn(() => '/mock/path')
}))

vi.mock('path', () => ({
  dirname: vi.fn(() => '/mock/dir'),
  join: vi.fn((...args) => args.join('/')),
  resolve: vi.fn((...args) => args.join('/'))
}))

// Global test setup
beforeAll(async () => {
  // Initialize DI container once for all tests
  initializeDIContainer()

  // CRITICAL FIX: Override the SupabaseClient in DI container with mock client
  // This ensures all repositories use the mocked client instead of the real one
  const DIContainer = await import('../../architecture/di-container.js')
  DIContainer.default.registerInstance('SupabaseClient', mockSupabase)

  // Clear repository instances so they get recreated with mock client
  DIContainer.default.instances.delete('SettingsRepository')
})

afterAll(() => {
  vi.restoreAllMocks()
})

beforeEach(() => {
  // Reset mock database if available
  if (typeof mockDatabase !== 'undefined') {
    mockDatabase.reset()
  }
})

afterEach(() => {
  // Clean up after each test
  if (typeof mockDatabase !== 'undefined') {
    mockDatabase.reset()
  }
})

// Export utilities for tests
export { mockSupabase }
export { mockDataFactories } from '../test-utils.js'

// Export authService mocks for use in tests
export const mockAuthService = {
  getUser: vi.fn(),
  getSession: vi.fn(),
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn()
}
