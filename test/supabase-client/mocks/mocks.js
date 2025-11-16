/**
 * Enhanced Mocks for Supabase Client Testing
 * Based on official Supabase documentation and Vitest best practices
 * Centralized mock management following KISS principle
 */

import { vi } from 'vitest'

// ============================================================================
// CORE SUPABASE CLIENT MOCK - Enhanced with realistic behaviors
// ============================================================================

/**
 * Creates a realistic Supabase client mock with proper method chaining
 * and error handling simulation based on Supabase official patterns
 */
export function createSupabaseClientMock() {
  // Create query builder mock for realistic chaining
  const createQueryBuilder = () => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),

    // Filter methods
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    and: vi.fn().mockReturnThis(),

    // Query modifiers
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),

    // Result methods
    single: vi.fn(),
    maybeSingle: vi.fn(),
    csv: vi.fn(),

    // Execution
    then: vi.fn(), // For async/await support
    catch: vi.fn()
  })

  // Storage query builder
  const createStorageQueryBuilder = () => ({
    upload: vi.fn(),
    download: vi.fn(),
    remove: vi.fn(),
    list: vi.fn(),
    getPublicUrl: vi.fn(),
    update: vi.fn(),
    move: vi.fn(),
    copy: vi.fn(),
    createSignedUrl: vi.fn()
  })

  return {
    // Main query interface
    from: vi.fn(() => createQueryBuilder()),

    // RPC calls
    rpc: vi.fn(),

    // Authentication
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      refreshSession: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn()
    },

    // Storage
    storage: {
      from: vi.fn(() => createStorageQueryBuilder()),
      getBucket: vi.fn(),
      listBuckets: vi.fn(),
      createBucket: vi.fn(),
      deleteBucket: vi.fn()
    }
  }
}

// ============================================================================
// CONFIGURATION MOCKS - Production-ready configuration patterns
// ============================================================================

/**
 * Base mock configuration following project standards
 */
export const mockConfig = {
  database: {
    url: 'https://test-project.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-service-role-key',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-anon-key',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-service-role-key',
    options: {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'X-Client-Info': 'floresya-test'
        }
      }
    }
  },
  VERCEL: false,
  NODE_ENV: 'development',
  security: {
    jwt: { secret: 'test-jwt-secret' },
    session: { secret: 'test-session-secret' }
  },
  business: {
    defaultCurrencyRate: 40,
    supportEmail: 'support@floresya.com'
  }
}

/**
 * Enhanced config factory for testing different scenarios
 */
export function createMockConfig(overrides = {}) {
  const merged = {
    ...mockConfig,
    ...overrides,
    database: {
      ...mockConfig.database,
      ...overrides.database
    }
  }

  // Validate required structure
  if (!merged.database.url || !merged.database.key) {
    throw new Error('Config must have at least url and key')
  }

  return merged
}

// ============================================================================
// ERROR CLASSES - Following project error patterns
// ============================================================================

export class MockConfigurationError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = 'ConfigurationError'
    this.details = details
    this.isOperational = true
  }
}

export class MockDatabaseError extends Error {
  constructor(message, code = 'PGRST116', details = {}) {
    super(message)
    this.name = 'DatabaseError'
    this.code = code
    this.details = details
    this.isOperational = true
  }
}

export class MockAuthError extends Error {
  constructor(message, status = 401, details = {}) {
    super(message)
    this.name = 'AuthError'
    this.status = status
    this.details = details
    this.isOperational = true
  }
}

// ============================================================================
// MOCK FACTORIES - Centralized mock creation
// ============================================================================

/**
 * Enhanced createClient mock with realistic validation
 * Less strict validation to allow test scenarios
 */
export const mockCreateClient = vi.fn((url, key, options = {}) => {
  // Basic validation only - let actual Supabase client handle strict validation
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid Supabase URL. Expected a string URL.')
  }

  if (!key || typeof key !== 'string') {
    throw new Error('Invalid Supabase key. Expected a string key.')
  }

  // Only validate if it looks like a real JWT (starts with eyJ)
  // Allow test keys to pass through
  if (key.startsWith('eyJ') && !key.includes('test')) {
    if (!key.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')) {
      throw new Error('Invalid Supabase key format')
    }
  }

  // Only validate options if it's clearly not an object
  if (options !== undefined && options !== null && typeof options !== 'object') {
    throw new Error('Invalid options object.')
  }

  return createSupabaseClientMock()
})

/**
 * Monitored client creator mock
 */
export const mockCreateMonitoredSupabaseClient = vi.fn(client => ({
  ...client,
  _monitored: true,
  _monitoring: {
    enabled: true,
    slowQueryThreshold: 1000,
    trackQueries: true
  }
}))

// ============================================================================
// UTILITY MOCKS - Test environment management
// ============================================================================

/**
 * Enhanced environment variable mocking
 */
export const mockProcessEnv = {
  defaults: {
    NODE_ENV: 'test',
    SUPABASE_URL: 'https://test-project.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-service-role-key',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-anon-key',
    JWT_SECRET: 'test-jwt-secret-for-testing',
    SESSION_SECRET: 'test-session-secret-for-testing'
  },

  /**
   * Setup environment for testing
   */
  setup: function (customEnv = {}) {
    const env = { ...this.defaults, ...customEnv }

    // Set NODE_ENV first
    if (env.NODE_ENV) {
      vi.stubEnv('NODE_ENV', env.NODE_ENV)
    }

    // Set all other environment variables
    Object.keys(env).forEach(key => {
      if (key !== 'NODE_ENV') {
        vi.stubEnv(key, env[key])
      }
    })

    return env
  },

  /**
   * Clean up environment
   */
  teardown: function () {
    vi.unstubAllEnvs()
  }
}

// ============================================================================
// TEST DATA GENERATORS - Realistic test scenarios
// ============================================================================

/**
 * Generate realistic test data for different tables
 */
export const testDataGenerators = {
  users: () => ({
    id: 'test-user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '+1234567890',
    role: 'user',
    active: true,
    email_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }),

  products: () => ({
    id: 'test-product-123',
    name: 'Beautiful Rose Bouquet',
    summary: 'A stunning bouquet of red roses',
    description: 'Fresh red roses arranged in an elegant bouquet',
    price_usd: 29.99,
    price_ves: 1199.6,
    stock: 50,
    sku: 'ROSE-001',
    active: true,
    featured: false,
    carousel_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }),

  orders: () => ({
    id: 'test-order-123',
    user_id: 'test-user-123',
    customer_email: 'customer@example.com',
    customer_name: 'John Doe',
    customer_phone: '+1234567890',
    delivery_address: '123 Main St, City, State',
    delivery_date: '2024-02-14',
    delivery_time_slot: 'morning',
    status: 'pending',
    total_amount_usd: 59.98,
    total_amount_ves: 2399.2,
    currency_rate: 40,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }),

  payments: () => ({
    id: 'test-payment-123',
    order_id: 'test-order-123',
    payment_method_id: 'bank-transfer-1',
    user_id: 'test-user-123',
    amount_usd: 59.98,
    amount_ves: 2399.2,
    currency_rate: 40,
    status: 'pending',
    payment_method_name: 'Bank Transfer',
    transaction_id: 'txn_123456789',
    reference_number: 'REF-123456',
    payment_date: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  })
}

// ============================================================================
// EXPORTS - Backward compatibility
// ============================================================================

// Export the enhanced client for backward compatibility
export const mockSupabaseClient = createSupabaseClientMock()

// Export configuration utilities
export { mockConfig as default }
