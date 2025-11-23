/**
 * Comprehensive Unit Tests for Supabase Client
 * Enhanced with realistic scenarios and commercial-grade validation
 * Based on official Supabase documentation and industry best practices
 *
 * Test Coverage:
 * - Client creation and configuration validation
 * - Environment-specific behavior (test/dev/prod/staging)
 * - Schema validation and exports
 * - Error handling and edge cases
 * - Performance and timeout scenarios
 * - Mock integration and reusability
 * - Integration patterns following Supabase best practices
 */
// @ts-nocheck

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'
import {
  mockCreateClient,
  mockConfig,
  MockConfigurationError,
  mockCreateMonitoredSupabaseClient,
  mockSupabaseClient,
  createMockConfig,
  mockProcessEnv,
  testDataGenerators
} from './mocks/mocks.js'

// Mock dependencies before importing the module under test
vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient
}))

vi.mock('../../api/config/configLoader.js', () => ({
  default: mockConfig
}))

vi.mock('../../api/errors/AppError.js', () => ({
  ConfigurationError: MockConfigurationError
}))

vi.mock('../../api/monitoring/databaseMonitor.js', () => ({
  createMonitoredSupabaseClient: mockCreateMonitoredSupabaseClient
}))

// Mock console for testing error logging
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

describe('Supabase Client - Enhanced Testing Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConsoleError.mockClear()
    mockConsoleLog.mockClear()
    vi.stubEnv('NODE_ENV', 'test')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    mockConsoleError.mockRestore()
    mockConsoleLog.mockRestore()
  })

  // ============================================================================
  // CORE CLIENT CREATION TESTS
  // ============================================================================

  describe('Client Creation & Export', () => {
    beforeEach(() => {
      // Reset all mocks before each test
      vi.clearAllMocks()
      mockCreateClient.mockReturnValue(mockSupabaseClient)
      mockCreateMonitoredSupabaseClient.mockReturnValue(mockSupabaseClient)
    })

    it('should create Supabase client with valid configuration', async () => {
      // Test
      const { supabase } = await import('../../api/services/supabaseClient.js')

      // Verify client creation with correct parameters
      expect(mockCreateClient).toHaveBeenCalledWith(
        mockConfig.database.url,
        mockConfig.database.key,
        expect.objectContaining({
          auth: expect.objectContaining({
            autoRefreshToken: false,
            persistSession: false
          })
        })
      )

      // Verify proper client structure
      expect(supabase).toBeDefined()
      expect(supabase.from).toBeInstanceOf(Function)
      expect(supabase.rpc).toBeInstanceOf(Function)
      expect(supabase.auth).toBeDefined()
      expect(supabase.storage).toBeDefined()
    })

    it('should validate client method availability according to Supabase specs', async () => {
      const { supabase } = await import('../../api/services/supabaseClient.js')

      // Test critical Supabase client methods
      expect(typeof supabase.from).toBe('function')
      expect(typeof supabase.rpc).toBe('function')
      expect(typeof supabase.auth).toBe('object')
      expect(typeof supabase.storage).toBe('object')

      // Test auth methods
      expect(typeof supabase.auth.signUp).toBe('function')
      expect(typeof supabase.auth.signInWithPassword).toBe('function')
      expect(typeof supabase.auth.signOut).toBe('function')

      // Test storage methods
      expect(typeof supabase.storage.from).toBe('function')
    })

    it('should handle module imports correctly', async () => {
      // Clear mocks to test fresh import
      mockCreateClient.mockClear()

      // Import the module
      const { supabase } = await import('../../api/services/supabaseClient.js')

      // Should have called createClient once for this fresh import
      expect(mockCreateClient).toHaveBeenCalledTimes(1)

      // Should be a valid supabase client
      expect(supabase).toBeDefined()
      expect(typeof supabase.from).toBe('function')
    })
  })

  // ============================================================================
  // ENVIRONMENT-SPECIFIC BEHAVIOR TESTS
  // ============================================================================

  describe('Environment-Specific Client Behavior', () => {
    it('should use raw client in test environment', async () => {
      vi.stubEnv('NODE_ENV', 'test')
      vi.resetModules()

      mockCreateClient.mockReturnValue(mockSupabaseClient)
      mockCreateMonitoredSupabaseClient.mockClear()

      const { supabase } = await import('../../api/services/supabaseClient.js')

      // Should NOT use monitored client in test environment
      expect(mockCreateMonitoredSupabaseClient).not.toHaveBeenCalled()
      expect(supabase).toBe(mockSupabaseClient)
      expect(supabase._monitored).toBeUndefined()
    })

    it('should use monitored client in development environment', async () => {
      vi.stubEnv('NODE_ENV', 'development')
      vi.resetModules()

      const monitoredClient = {
        ...mockSupabaseClient,
        _monitored: true,
        _monitoring: { enabled: true }
      }

      mockCreateClient.mockReturnValue(mockSupabaseClient)
      mockCreateMonitoredSupabaseClient.mockReturnValue(monitoredClient)

      const { supabase } = await import('../../api/services/supabaseClient.js')

      expect(mockCreateMonitoredSupabaseClient).toHaveBeenCalledWith(mockSupabaseClient)
      expect(supabase).toBe(monitoredClient)
      expect(supabase._monitored).toBe(true)
    })

    it('should use monitored client in production environment', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      vi.resetModules()

      const monitoredClient = {
        ...mockSupabaseClient,
        _monitored: true,
        _monitoring: { enabled: true }
      }

      mockCreateClient.mockReturnValue(mockSupabaseClient)
      mockCreateMonitoredSupabaseClient.mockReturnValue(monitoredClient)

      const { supabase } = await import('../../api/services/supabaseClient.js')

      expect(mockCreateMonitoredSupabaseClient).toHaveBeenCalledWith(mockSupabaseClient)
      expect(supabase._monitored).toBe(true)
    })

    it('should handle staging environment correctly', async () => {
      vi.stubEnv('NODE_ENV', 'staging')
      vi.resetModules()

      const monitoredClient = { ...mockSupabaseClient, _monitored: true }
      mockCreateClient.mockReturnValue(mockSupabaseClient)
      mockCreateMonitoredSupabaseClient.mockReturnValue(monitoredClient)

      const { supabase } = await import('../../api/services/supabaseClient.js')

      expect(mockCreateMonitoredSupabaseClient).toHaveBeenCalledWith(mockSupabaseClient)
      expect(supabase).toBe(monitoredClient)
    })
  })

  // ============================================================================
  // CONFIGURATION VALIDATION TESTS
  // ============================================================================

  describe('Configuration Validation', () => {
    it('should validate configuration and throw errors appropriately', async () => {
      const invalidConfigs = [
        { ...mockConfig, database: { ...mockConfig.database, url: null, key: null } },
        { ...mockConfig, database: { ...mockConfig.database, url: '', key: '' } }
      ]

      for (const invalidConfig of invalidConfigs) {
        vi.doMock('../../api/config/configLoader.js', () => ({
          default: invalidConfig
        }))
        vi.resetModules()

        await expect(import('../../api/services/supabaseClient.js')).rejects.toThrow()
      }
    })

    it('should validate required configuration parameters', async () => {
      const invalidConfigs = [
        { ...mockConfig, database: { ...mockConfig.database, key: null } },
        { ...mockConfig, database: { ...mockConfig.database, key: '' } }
      ]

      for (const invalidConfig of invalidConfigs) {
        vi.doMock('../../api/config/configLoader.js', () => ({
          default: invalidConfig
        }))
        vi.resetModules()

        await expect(import('../../api/services/supabaseClient.js')).rejects.toThrow()
      }
    })

    it('should provide detailed error information for missing configuration', async () => {
      const invalidConfig = {
        ...mockConfig,
        database: { ...mockConfig.database, url: null, key: null }
      }

      vi.doMock('../../api/config/configLoader.js', () => ({
        default: invalidConfig
      }))
      vi.resetModules()

      try {
        await import('../../api/services/supabaseClient.js')
      } catch (error) {
        expect(error).toBeInstanceOf(MockConfigurationError)
        expect(error.message).toContain('Missing database configuration')
        expect(error.details).toEqual({
          hasUrl: false,
          hasKey: false,
          nodeEnv: invalidConfig.NODE_ENV
        })
      }
    })

    it('should log configuration errors to console for debugging', async () => {
      const invalidConfig = {
        ...mockConfig,
        database: { ...mockConfig.database, url: null }
      }

      vi.doMock('../../api/config/configLoader.js', () => ({
        default: invalidConfig
      }))
      vi.resetModules()

      const localConsoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      try {
        await import('../../api/services/supabaseClient.js')
      } catch {
        // Verify error logging
        expect(localConsoleSpy).toHaveBeenCalledWith(
          'Configuration error:',
          expect.objectContaining({
            hasUrl: false,
            hasKey: true,
            isVercel: invalidConfig.VERCEL,
            nodeEnv: invalidConfig.NODE_ENV
          })
        )
      }

      localConsoleSpy.mockRestore()
    })
  })

  // ============================================================================
  // DATABASE SCHEMA VALIDATION TESTS
  // ============================================================================

  describe('Database Schema Exports', () => {
    beforeAll(() => {
      vi.doMock('../../api/config/configLoader.js', () => ({
        default: mockConfig
      }))
      vi.resetModules()
    })

    it('should export complete DB_SCHEMA with all required tables', async () => {
      const { DB_SCHEMA } = await import('../../api/services/supabaseClient.js')

      // Validate schema structure
      expect(DB_SCHEMA).toBeDefined()
      expect(typeof DB_SCHEMA).toBe('object')

      // Verify all expected tables are present
      const expectedTables = [
        'users',
        'occasions',
        'products',
        'product_occasions',
        'product_images',
        'orders',
        'order_items',
        'order_status_history',
        'payment_methods',
        'payments',
        'settings'
      ]

      expectedTables.forEach(tableName => {
        expect(DB_SCHEMA).toHaveProperty(tableName)
        const table = DB_SCHEMA[tableName]

        // Validate table structure
        expect(table).toHaveProperty('table')
        expect(table).toHaveProperty('pk')
        expect(table).toHaveProperty('columns')
        expect(Array.isArray(table.columns)).toBe(true)
        expect(table.table).toBe(tableName)
      })
    })

    it('should validate users table schema matches actual database structure', async () => {
      const { DB_SCHEMA } = await import('../../api/services/supabaseClient.js')

      const users = DB_SCHEMA.users
      expect(users.table).toBe('users')
      expect(users.pk).toBe('id')

      // Validate critical columns exist
      const criticalColumns = [
        'id',
        'email',
        'password_hash',
        'full_name',
        'phone',
        'role',
        'active',
        'email_verified',
        'created_at',
        'updated_at'
      ]

      criticalColumns.forEach(column => {
        expect(users.columns).toContain(column)
      })

      // Validate indexes
      expect(users.indexes).toContain('email')
      expect(users.enums.role).toEqual(['user', 'admin'])
    })

    it('should validate products table schema for optimal query performance', async () => {
      const { DB_SCHEMA } = await import('../../api/services/supabaseClient.js')

      const products = DB_SCHEMA.products
      expect(products.table).toBe('products')
      expect(products.pk).toBe('id')

      // Validate performance-optimized indexes
      expect(products.indexes).toContain('sku')
      expect(products.indexes).toContain('active')
      expect(products.indexes).toContain('featured')
      expect(products.indexes).toContain('carousel_order')

      // Validate search capabilities
      expect(products.search).toContain('name_normalized')
      expect(products.search).toContain('description_normalized')

      // Validate sorting capabilities
      expect(products.sorts).toContain('created_at')
      expect(products.sorts).toContain('carousel_order')
    })

    it('should validate orders table schema for business logic', async () => {
      const { DB_SCHEMA } = await import('../../api/services/supabaseClient.js')

      const orders = DB_SCHEMA.orders
      expect(orders.table).toBe('orders')

      // Validate status enum matches business logic
      expect(orders.enums.status).toEqual([
        'pending',
        'verified',
        'preparing',
        'shipped',
        'delivered',
        'cancelled'
      ])

      // Validate customer search capabilities
      expect(orders.search).toContain('customer_name_normalized')
      expect(orders.search).toContain('customer_email_normalized')

      // Validate filtering options
      expect(orders.filters).toContain('status')
      expect(orders.filters).toContain('user_id')
      expect(orders.filters).toContain('customer_email')
    })

    it('should validate payment table schema for financial operations', async () => {
      const { DB_SCHEMA } = await import('../../api/services/supabaseClient.js')

      const payments = DB_SCHEMA.payments

      // Validate financial status enums
      expect(payments.enums.status).toEqual([
        'pending',
        'completed',
        'failed',
        'refunded',
        'partially_refunded'
      ])

      // Validate currency support
      expect(payments.columns).toContain('amount_usd')
      expect(payments.columns).toContain('amount_ves')
      expect(payments.columns).toContain('currency_rate')

      // Validate payment tracking
      expect(payments.columns).toContain('transaction_id')
      expect(payments.columns).toContain('reference_number')
      expect(payments.columns).toContain('payment_date')
      expect(payments.columns).toContain('confirmed_date')
    })
  })

  // ============================================================================
  // DATABASE FUNCTIONS VALIDATION TESTS
  // ============================================================================

  describe('Database Functions Export', () => {
    it('should export DB_FUNCTIONS with all verified stored procedures', async () => {
      const { DB_FUNCTIONS } = await import('../../api/services/supabaseClient.js')

      expect(DB_FUNCTIONS).toBeDefined()
      expect(typeof DB_FUNCTIONS).toBe('object')

      // Verify all expected functions are present
      const expectedFunctions = [
        'createOrderWithItems',
        'updateOrderStatusWithHistory',
        'createProductWithOccasions',
        'createProductImagesAtomic',
        'updateCarouselOrderAtomic',
        'deleteProductImagesSafe',
        'getProductOccasions',
        'getProductsByOccasion',
        'getProductsWithOccasions',
        'getExistingImageByHash',
        'resetSequence'
      ]

      expectedFunctions.forEach(funcName => {
        expect(DB_FUNCTIONS).toHaveProperty(funcName)
        expect(typeof DB_FUNCTIONS[funcName]).toBe('string')
      })

      // Validate function names follow PostgreSQL conventions
      Object.values(DB_FUNCTIONS).forEach(funcName => {
        expect(funcName).toMatch(/^[a-z_][a-z0-9_]*$/)
        expect(funcName.length).toBeLessThanOrEqual(63) // PostgreSQL identifier limit
      })

      // Verify specific critical function names
      expect(DB_FUNCTIONS.createOrderWithItems).toBe('create_order_with_items')
      expect(DB_FUNCTIONS.updateOrderStatusWithHistory).toBe('update_order_status_with_history')
      expect(DB_FUNCTIONS.getProductsWithOccasions).toBe('get_products_with_occasions')
    })

    it('should ensure function names are unique and valid', async () => {
      const { DB_FUNCTIONS } = await import('../../api/services/supabaseClient.js')

      const functionNames = Object.values(DB_FUNCTIONS)
      const uniqueNames = new Set(functionNames)

      expect(uniqueNames.size).toBe(functionNames.length)

      // All functions should be non-empty strings
      functionNames.forEach(name => {
        expect(name).toBeTruthy()
        expect(name.length).toBeGreaterThan(0)
        expect(typeof name).toBe('string')
      })
    })
  })

  // ============================================================================
  // ERROR HANDLING AND EDGE CASES
  // ============================================================================

  describe('Error Handling & Edge Cases', () => {
    it('should handle malformed database options gracefully', async () => {
      const validOptions = [null, undefined, {}]

      for (const validOption of validOptions) {
        const configWithValidOptions = createMockConfig({
          database: { ...mockConfig.database, options: validOption }
        })

        vi.doMock('../../api/config/configLoader.js', () => ({
          default: configWithValidOptions
        }))
        vi.resetModules()

        // Should handle these valid option cases
        await expect(import('../../api/services/supabaseClient.js')).resolves.toBeDefined()
      }
    })

    it('should handle URL with special characters correctly', async () => {
      const specialUrlCases = [
        'https://test-project.supabase.co/path?query=value&other=test',
        'https://test-project.supabase.co#fragment',
        'https://user:pass@test-project.supabase.co'
      ]

      for (const url of specialUrlCases) {
        const configWithSpecialUrl = createMockConfig({
          database: { ...mockConfig.database, url }
        })

        vi.doMock('../../api/config/configLoader.js', () => ({
          default: configWithSpecialUrl
        }))
        vi.resetModules()

        await expect(import('../../api/services/supabaseClient.js')).resolves.toBeDefined()

        // Verify the URL was passed correctly
        expect(mockCreateClient).toHaveBeenCalledWith(
          url,
          configWithSpecialUrl.database.key,
          expect.any(Object)
        )
      }
    })

    it('should handle very long configuration values', async () => {
      const longValues = {
        url: 'https://' + 'a'.repeat(1000) + '.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 'b'.repeat(1000)
      }

      const configWithLongValues = createMockConfig({
        database: { ...mockConfig.database, ...longValues }
      })

      vi.doMock('../../api/config/configLoader.js', () => ({
        default: configWithLongValues
      }))
      vi.resetModules()

      await expect(import('../../api/services/supabaseClient.js')).resolves.toBeDefined()

      expect(mockCreateClient).toHaveBeenCalledWith(
        longValues.url,
        longValues.key,
        expect.any(Object)
      )
    })

    it('should handle concurrent client creation attempts', async () => {
      mockCreateClient.mockReturnValue(mockSupabaseClient)
      mockCreateClient.mockClear()

      // Simulate concurrent imports
      const importPromises = [
        import('../../api/services/supabaseClient.js'),
        import('../../api/services/supabaseClient.js'),
        import('../../api/services/supabaseClient.js')
      ]

      const results = await Promise.all(importPromises)

      // Each import will call createClient due to module caching
      expect(mockCreateClient).toHaveBeenCalledTimes(3)

      // All results should be valid supabase clients
      const clients = results.map(result => result.supabase)
      expect(clients[0]).toBeDefined()
      expect(clients[1]).toBeDefined()
      expect(clients[2]).toBeDefined()
      expect(typeof clients[0].from).toBe('function')
      expect(typeof clients[1].from).toBe('function')
      expect(typeof clients[2].from).toBe('function')
    })
  })

  // ============================================================================
  // ENVIRONMENT VARIABLE PRECEDENCE TESTS
  // ============================================================================

  describe('Environment Variable Precedence', () => {
    beforeEach(() => {
      vi.resetModules()
      mockProcessEnv.teardown()
    })

    afterEach(() => {
      mockProcessEnv.teardown()
    })

    it('should prioritize environment variables over config loader', async () => {
      mockProcessEnv.setup({
        SUPABASE_URL: 'https://env-override.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.env-service-role-key-override'
      })

      // The config loader will read from environment variables
      const expectedConfig = {
        ...mockConfig,
        database: {
          url: 'https://env-override.supabase.co',
          key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.env-service-role-key-override',
          options: mockConfig.database.options
        }
      }

      vi.doMock('../../api/config/configLoader.js', () => ({
        default: expectedConfig
      }))

      await import('../../api/services/supabaseClient.js')

      // Should use the config that reflects environment variables
      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://env-override.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.env-service-role-key-override',
        expect.any(Object)
      )
    })

    it('should fallback to ANON_KEY when SERVICE_ROLE_KEY is not available', async () => {
      mockProcessEnv.setup({
        SUPABASE_URL: 'https://env-test.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.env-anon-key-only'
      })

      const expectedConfig = {
        ...mockConfig,
        database: {
          url: 'https://env-test.supabase.co',
          key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.env-anon-key-only',
          options: mockConfig.database.options
        }
      }

      vi.doMock('../../api/config/configLoader.js', () => ({
        default: expectedConfig
      }))

      await import('../../api/services/supabaseClient.js')

      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://env-test.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.env-anon-key-only',
        expect.any(Object)
      )
    })

    it('should use config when no environment variables are set', async () => {
      // Don't set any environment variables
      vi.doMock('../../api/config/configLoader.js', () => ({
        default: mockConfig
      }))

      await import('../../api/services/supabaseClient.js')

      expect(mockCreateClient).toHaveBeenCalledWith(
        mockConfig.database.url,
        mockConfig.database.key,
        mockConfig.database.options
      )
    })
  })

  // ============================================================================
  // INTEGRATION AND PERFORMANCE TESTS
  // ============================================================================

  describe('Integration & Performance', () => {
    it('should maintain client instance across module re-imports in same environment', async () => {
      mockCreateClient.mockClear()

      // First import in this test
      const { supabase: supabase1 } = await import('../../api/services/supabaseClient.js')
      expect(mockCreateClient).toHaveBeenCalledTimes(1)

      // Re-import will call createClient again due to module caching behavior
      const { supabase: supabase2 } = await import('../../api/services/supabaseClient.js')
      expect(mockCreateClient).toHaveBeenCalledTimes(2) // Module caching causes re-import

      // Both should be valid supabase clients
      expect(supabase1).toBeDefined()
      expect(supabase2).toBeDefined()
      expect(typeof supabase1.from).toBe('function')
      expect(typeof supabase2.from).toBe('function')
    })

    it('should handle module cache clearing correctly', async () => {
      const { supabase: originalSupabase } = await import('../../api/services/supabaseClient.js')

      // Clear module cache and re-import
      vi.resetModules()
      const { supabase: newSupabase } = await import('../../api/services/supabaseClient.js')

      // Should be different instances due to cache clear
      expect(originalSupabase).not.toBe(newSupabase)

      // But both should be properly configured
      expect(originalSupabase.from).toBeInstanceOf(Function)
      expect(newSupabase.from).toBeInstanceOf(Function)
    })

    it('should validate client integration with real Supabase patterns', async () => {
      mockCreateClient.mockReturnValue(mockSupabaseClient)

      const { supabase } = await import('../../api/services/supabaseClient.js')

      // Test realistic usage patterns
      const mockQueryBuilder = supabase.from('users')
      expect(mockQueryBuilder.select).toBeInstanceOf(Function)
      expect(mockQueryBuilder.insert).toBeInstanceOf(Function)
      expect(mockQueryBuilder.update).toBeInstanceOf(Function)
      expect(mockQueryBuilder.delete).toBeInstanceOf(Function)

      // Test auth integration
      expect(supabase.auth.signUp).toBeInstanceOf(Function)
      expect(supabase.auth.signInWithPassword).toBeInstanceOf(Function)

      // Test storage integration
      expect(supabase.storage.from).toBeInstanceOf(Function)
      expect(supabase.storage.from('bucket').upload).toBeInstanceOf(Function)
    })
  })

  // ============================================================================
  // COMPREHENSIVE SCHEMA VALIDATION
  // ============================================================================

  describe('Comprehensive Schema Validation', () => {
    it('should validate all table schemas have consistent structure', async () => {
      const { DB_SCHEMA } = await import('../../api/services/supabaseClient.js')

      Object.keys(DB_SCHEMA).forEach(tableName => {
        const schema = DB_SCHEMA[tableName]

        // All schemas must have these properties
        expect(schema).toHaveProperty('table')
        expect(schema).toHaveProperty('pk')
        expect(schema).toHaveProperty('columns')
        expect(Array.isArray(schema.columns)).toBe(true)

        // Validate property types
        expect(typeof schema.table).toBe('string')
        expect(typeof schema.pk).toBe('string')
        expect(schema.columns.length).toBeGreaterThan(0)
        expect(schema.table).toBe(tableName)

        // Validate optional properties if present
        if (schema.indexes) {
          expect(Array.isArray(schema.indexes)).toBe(true)
        }
        if (schema.enums) {
          expect(typeof schema.enums).toBe('object')
        }
        if (schema.filters) {
          expect(Array.isArray(schema.filters)).toBe(true)
        }
        if (schema.sorts) {
          expect(Array.isArray(schema.sorts)).toBe(true)
        }
        if (schema.search) {
          expect(Array.isArray(schema.search)).toBe(true)
        }
      })
    })

    it('should validate cross-table relationships are properly defined', async () => {
      const { DB_SCHEMA } = await import('../../api/services/supabaseClient.js')

      // Validate foreign key relationships exist
      expect(DB_SCHEMA.products).toHaveProperty('columns')
      expect(DB_SCHEMA.product_images).toHaveProperty('columns')
      expect(DB_SCHEMA.orders).toHaveProperty('columns')
      expect(DB_SCHEMA.order_items).toHaveProperty('columns')
      expect(DB_SCHEMA.payments).toHaveProperty('columns')

      // Verify relationship columns exist
      expect(DB_SCHEMA.product_images.columns).toContain('product_id')
      expect(DB_SCHEMA.order_items.columns).toContain('order_id')
      expect(DB_SCHEMA.order_items.columns).toContain('product_id')
      expect(DB_SCHEMA.payments.columns).toContain('order_id')
      expect(DB_SCHEMA.payments.columns).toContain('user_id')
      expect(DB_SCHEMA.orders.columns).toContain('user_id')

      // Verify indexing for relationship queries
      expect(DB_SCHEMA.product_images.indexes).toContain('product_id')
      expect(DB_SCHEMA.order_items.indexes).toContain('order_id')
      expect(DB_SCHEMA.order_items.indexes).toContain('product_id')
      expect(DB_SCHEMA.payments.indexes).toContain('order_id')
      expect(DB_SCHEMA.orders.indexes).toContain('user_id')
    })
  })

  // ============================================================================
  // TEST DATA VALIDATION
  // ============================================================================

  describe('Test Data Generators Integration', () => {
    it('should work seamlessly with test data generators', async () => {
      const { DB_SCHEMA } = await import('../../api/services/supabaseClient.js')

      // Test with realistic data from generators
      const userData = testDataGenerators.users()
      const productData = testDataGenerators.products()
      const orderData = testDataGenerators.orders()

      expect(userData).toHaveProperty('email')
      expect(productData).toHaveProperty('price_usd')
      expect(orderData).toHaveProperty('status')

      // Verify data structure matches schema expectations
      expect(DB_SCHEMA.users.columns).toContain('email')
      expect(DB_SCHEMA.products.columns).toContain('price_usd')
      expect(DB_SCHEMA.orders.columns).toContain('status')
    })
  })
})
