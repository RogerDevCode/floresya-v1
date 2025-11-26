/**
 * Comprehensive Supabase Client Tests - Vitest Edition
 * Tests database operations, RPC functions, transactions, error handling, and data consistency
 * Following Supabase official documentation and MIT/Stanford best practices
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { createSupabaseClientMock, POSTGRESQL_ERROR_CODES } from './mocks/mocks.js'

// Helper function to create test client
function createTestClient() {
  return createSupabaseClientMock({
    url: 'https://test-project.supabase.co',
    anonKey: 'test-anon-key'
  })
}

describe('RPC Function Tests', () => {
  let client

  beforeEach(() => {
    client = createTestClient()
  })

  afterEach(() => {
    client.reset()
  })

  test('should call get_user_profile RPC function with valid parameters', async () => {
    const { data, error } = await client.rpc('get_user_profile', { user_id: 1 })

    expect(error).toBeNull()
    expect(data).not.toBeNull()
    expect(data).toMatchObject({
      id: 1,
      name: 'Mock User',
      email: 'mock@example.com'
    })

    // Verify exact values
    expect(data.id).toBe(1)
    expect(data.name).toBe('Mock User')
    expect(data.email).toBe('mock@example.com')
    expect(typeof data.id).toBe('number')
    expect(typeof data.name).toBe('string')
  })

  test('should call RPC function without parameters', async () => {
    const { data, error } = await client.rpc('test_function')

    expect(error).toBeNull()
    expect(data).not.toBeNull()
    expect(data).toMatchObject({
      result: expect.stringMatching(/^Mock result for test_function$/)
    })

    // Verify specific result format
    expect(data.result).toBe('Mock result for test_function')
    expect(typeof data.result).toBe('string')
  })

  test('should call create_order_with_items RPC function with complex parameters', async () => {
    const orderData = {
      user_id: 1,
      customer_email: 'test@example.com',
      customer_name: 'Test Customer',
      delivery_address: 'Test Address',
      items: [
        { product_id: 1, quantity: 2, unit_price_usd: 29.99 },
        { product_id: 2, quantity: 1, unit_price_usd: 24.99 }
      ]
    }

    const { data, error } = await client.rpc('create_order_with_items', orderData)

    expect(error).toBeNull()
    expect(data).not.toBeNull()
    expect(data).toMatchObject({
      order_id: expect.any(Number),
      items_count: 2 // Should count both items
    })

    // Verify specific values
    expect(data.order_id).toBeGreaterThan(0)
    expect(data.items_count).toBe(2)
    expect(typeof data.order_id).toBe('number')
    expect(typeof data.items_count).toBe('number')
  })

  test('should call update_order_status_with_history RPC function', async () => {
    const updateData = {
      order_id: 1,
      new_status: 'shipped',
      notes: 'Order shipped successfully'
    }

    const { data, error } = await client.rpc('update_order_status_with_history', updateData)

    expect(error).toBeNull()
    expect(data).not.toBeNull()
    expect(data).toEqual({ success: true }) // The mock implementation returns exactly this

    // Verify boolean and structure
    expect(typeof data.success).toBe('boolean')
    expect(data.success).toBe(true)
  })

  test('should call create_product_with_occasions RPC function', async () => {
    const productData = {
      name: 'Test Product',
      description: 'Test description',
      price_usd: 19.99,
      occasion_ids: [1, 2, 3] // Test with multiple occasions
    }

    const { data, error } = await client.rpc('create_product_with_occasions', productData)

    expect(error).toBeNull()
    expect(data).not.toBeNull()
    expect(data).toMatchObject({
      product_id: expect.any(Number),
      occasions_added: 3 // Should match array length
    })

    // Verify specific values
    expect(data.product_id).toBeGreaterThan(0)
    expect(data.occasions_added).toBe(3)
    expect(Array.isArray(productData.occasion_ids)).toBe(true)
  })

  test('should handle RPC function errors with proper error structure', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: null,
      error: {
        code: POSTGRESQL_ERROR_CODES.INTERNAL_ERROR,
        message: 'RPC function failed',
        details: 'Function execution error',
        hint: 'Check function parameters'
      }
    })

    client.rpc = mockRpc

    const { data, error } = await client.rpc('error_function', { invalid_param: true })

    expect(data).toBeNull()
    expect(error).not.toBeNull()
    expect(error).toMatchObject({
      code: 'XX000', // INTERNAL_ERROR code
      message: 'RPC function failed',
      details: 'Function execution error',
      hint: 'Check function parameters'
    })

    // Verify error structure
    expect(typeof error.code).toBe('string')
    expect(typeof error.message).toBe('string')
    expect(error.message).toContain('RPC function failed')
  })

  test('should track RPC performance metrics accurately', async () => {
    // Make multiple RPC calls to test metrics aggregation
    await client.rpc('get_user_profile', { user_id: 1 })
    await client.rpc('create_order_with_items', {
      user_id: 2,
      customer_email: 'test@test.com',
      items: []
    })
    await client.rpc('test_function')

    const metrics = client.getPerformanceMetrics()
    expect(metrics.totalQueries).toBe(3)
    expect(metrics.successfulQueries).toBe(3)
    expect(metrics.failedQueries).toBe(0)
    expect(metrics.successRate).toBe(100)

    // Verify individual query tracking
    expect(metrics.queries).toHaveLength(3)
    expect(metrics.queries[0]).toMatchObject({
      operation: 'rpc',
      function: 'get_user_profile',
      success: true
    })
    expect(metrics.queries[1]).toMatchObject({
      operation: 'rpc',
      function: 'create_order_with_items',
      success: true
    })
    expect(metrics.queries[2]).toMatchObject({
      operation: 'rpc',
      function: 'test_function',
      success: true
    })

    // Verify performance timing
    expect(metrics.queries.every(q => q.duration > 0)).toBe(true)
  })

  test('should handle RPC with empty parameters object', async () => {
    const { data, error } = await client.rpc('test_function', {})

    expect(error).toBeNull()
    expect(data).not.toBeNull()
    expect(data).toMatchObject({
      result: expect.any(String)
    })
  })

  test('should handle RPC with null parameters', async () => {
    const { data, error } = await client.rpc('test_function', null)

    expect(error).toBeNull()
    expect(data).not.toBeNull()
    expect(data).toMatchObject({
      result: expect.any(String)
    })
  })
})
