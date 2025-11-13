/**
 * Simple Supabase Mocking Demo
 * Demonstrates the core mocking utilities without complex imports
 */

import { describe, it, expect } from 'vitest'
import {
  createMockSupabaseClient,
  mockDataFactories,
  mockDatabase,
  createMockQueryBuilder
} from '../mocking-utils.js'

describe('Simple Supabase Mocking Demo', () => {
  describe('Mock Data Factories', () => {
    it('should generate consistent test data', () => {
      const user = mockDataFactories.user()
      const product = mockDataFactories.product()
      const order = mockDataFactories.order()

      expect(user).toHaveProperty('id', 1)
      expect(user).toHaveProperty('email', 'test@example.com')
      expect(user).toHaveProperty('role', 'user')

      expect(product).toHaveProperty('name', 'Test Product')
      expect(product).toHaveProperty('price_usd', 25.99)
      expect(product).toHaveProperty('active', true)

      expect(order).toHaveProperty('status', 'pending')
      expect(order).toHaveProperty('total_amount_usd', 25.99)
    })

    it('should support data overrides', () => {
      const customProduct = mockDataFactories.product({
        name: 'Custom Product',
        price_usd: 99.99,
        active: false
      })

      expect(customProduct.name).toBe('Custom Product')
      expect(customProduct.price_usd).toBe(99.99)
      expect(customProduct.active).toBe(false)
    })
  })

  describe('Mock Supabase Client Creation', () => {
    it('should create a mock Supabase client with default responses', () => {
      const mockSupabase = createMockSupabaseClient()

      expect(mockSupabase).toHaveProperty('from')
      expect(mockSupabase).toHaveProperty('rpc')
      expect(mockSupabase).toHaveProperty('auth')
      expect(mockSupabase).toHaveProperty('storage')
      expect(typeof mockSupabase.from).toBe('function')
      expect(typeof mockSupabase.rpc).toBe('function')
    })

    it('should create mock client with custom responses', () => {
      const customData = [mockDataFactories.product({ id: 999, name: 'Custom Product' })]
      const mockSupabase = createMockSupabaseClient({
        mockResponses: {
          products: { data: customData, error: null }
        }
      })

      expect(mockSupabase.from).toBeDefined()
    })
  })

  describe('Mock Query Builder', () => {
    it('should create a mock query builder', () => {
      const mockData = [mockDataFactories.product()]
      const queryBuilder = createMockQueryBuilder({ data: mockData })

      expect(queryBuilder).toHaveProperty('select')
      expect(queryBuilder).toHaveProperty('insert')
      expect(queryBuilder).toHaveProperty('update')
      expect(queryBuilder).toHaveProperty('delete')
      expect(queryBuilder).toHaveProperty('single')
      expect(typeof queryBuilder.select).toBe('function')
    })

    it('should support method chaining', () => {
      const queryBuilder = createMockQueryBuilder()

      const result = queryBuilder
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(10)

      expect(result).toBe(queryBuilder) // Should return self for chaining
    })

    it('should resolve with mock data', async () => {
      const mockData = mockDataFactories.product({ id: 123 })
      const queryBuilder = createMockQueryBuilder({ data: mockData })

      const result = await queryBuilder.single()

      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('error')
      expect(result.data).toBe(mockData)
      expect(result.error).toBeNull()
    })

    it('should support error responses', async () => {
      const mockError = { code: 'PGRST116', message: 'Not found' }
      const queryBuilder = createMockQueryBuilder({ data: null, error: mockError })

      const result = await queryBuilder.single()

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('Database Simulation', () => {
    beforeEach(() => {
      mockDatabase.reset()
    })

    it('should simulate database operations', async () => {
      const testProduct = mockDataFactories.product()

      // Create
      const createResult = await mockDatabase.create('products', testProduct)
      expect(createResult.data.id).toBe(1)
      expect(createResult.error).toBeNull()

      // Read
      const findResult = await mockDatabase.findById('products', 1)
      expect(findResult.data.name).toBe(testProduct.name)

      // Update
      const updateResult = await mockDatabase.update('products', 1, { name: 'Updated' })
      expect(updateResult.data.name).toBe('Updated')

      // Delete
      const deleteResult = await mockDatabase.delete('products', 1)
      expect(deleteResult.data.id).toBe(1)
    })

    it('should handle not found errors', async () => {
      const result = await mockDatabase.findById('products', 999)
      expect(result.data).toBeNull()
      expect(result.error.code).toBe('PGRST116')
    })

    it('should support bulk operations', async () => {
      const products = [
        mockDataFactories.product({ name: 'Product 1' }),
        mockDataFactories.product({ name: 'Product 2' })
      ]

      const results = await mockDatabase.bulkCreate('products', products)
      expect(results).toHaveLength(2)
      expect(results[0].data.id).toBe(1)
      expect(results[1].data.id).toBe(2)
    })
  })

  describe('Mock Supabase with Auth and Storage', () => {
    it('should mock auth operations', () => {
      const mockSupabase = createMockSupabaseClient()

      expect(mockSupabase.auth).toHaveProperty('signUp')
      expect(mockSupabase.auth).toHaveProperty('signInWithPassword')
      expect(mockSupabase.auth).toHaveProperty('getUser')
      expect(mockSupabase.auth).toHaveProperty('signOut')
    })

    it('should mock storage operations', () => {
      const mockSupabase = createMockSupabaseClient()

      expect(mockSupabase.storage).toHaveProperty('from')
      expect(typeof mockSupabase.storage.from).toBe('function')
    })

    it('should create storage bucket mock', () => {
      const mockSupabase = createMockSupabaseClient()
      const bucket = mockSupabase.storage.from('test-bucket')

      expect(bucket).toHaveProperty('upload')
      expect(bucket).toHaveProperty('download')
      expect(bucket).toHaveProperty('getPublicUrl')
      expect(bucket).toHaveProperty('remove')
    })
  })
})
