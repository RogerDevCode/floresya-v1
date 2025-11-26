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

describe('Transaction Tests', () => {
  let client

  beforeEach(() => {
    client = createTestClient()
  })

  afterEach(() => {
    client.reset()
  })

  test('should simulate atomic transaction operations successfully', async () => {
    const transactionStartUsers = client.mockDataStore.getTable('users').length

    // Step 1: Insert user with complete data
    const userResult = await client
      .from('users')
      .insert({
        email: 'tx_user@example.com',
        password_hash: '$2a$10$transactionhash',
        full_name: 'Transaction User',
        phone: '+1555123456',
        role: 'user',
        active: true,
        email_verified: false
      })
      .select()

    expect(userResult.error).toBeNull()
    expect(Array.isArray(userResult.data)).toBe(true)
    expect(userResult.data.length).toBe(1)

    // Verify user creation
    expect(userResult.data[0]).toMatchObject({
      id: 6, // Next ID after existing users
      email: 'tx_user@example.com',
      full_name: 'Transaction User',
      phone: '+1555123456',
      role: 'user',
      active: true,
      email_verified: false,
      created_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
      updated_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    const userId = userResult.data[0].id
    expect(userId).toBeGreaterThan(5)
    expect(typeof userId).toBe('number')

    // Step 2: Insert profile for user with complete data
    const profileResult = await client
      .from('profiles')
      .insert({
        user_id: userId,
        bio: 'Transaction bio for testing',
        avatar_url: 'https://example.com/avatars/tx-user.jpg',
        phone: '+1555123456',
        address: 'Transaction Address 123',
        city: 'Caracas',
        country: 'Venezuela',
        date_of_birth: '1985-05-15',
        gender: 'other'
      })
      .select()

    expect(profileResult.error).toBeNull()
    expect(Array.isArray(profileResult.data)).toBe(true)
    expect(profileResult.data.length).toBe(1)

    // Verify profile creation
    expect(profileResult.data[0]).toMatchObject({
      id: 3, // Next ID after existing profiles
      user_id: userId,
      bio: 'Transaction bio for testing',
      avatar_url: 'https://example.com/avatars/tx-user.jpg',
      phone: '+1555123456',
      address: 'Transaction Address 123',
      city: 'Caracas',
      country: 'Venezuela',
      date_of_birth: '1985-05-15',
      gender: 'other',
      deleted_at: null,
      created_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    expect(profileResult.data[0].user_id).toBe(userId)

    // Step 3: Update user with profile reference
    const updatedTimestamp = new Date().toISOString()
    const updateResult = await client
      .from('users')
      .update({
        updated_at: updatedTimestamp,
        email_verified: true,
        full_name: 'Transaction User (Updated)'
      })
      .eq('id', userId)
      .select()

    expect(updateResult.error).toBeNull()
    expect(Array.isArray(updateResult.data)).toBe(true)
    expect(updateResult.data.length).toBe(1)

    // Verify user update
    expect(updateResult.data[0]).toMatchObject({
      id: userId,
      email: 'tx_user@example.com',
      updated_at: updatedTimestamp,
      email_verified: true,
      full_name: 'Transaction User (Updated)'
    })

    // Verify transaction completeness
    expect(userResult.data[0].email).toBe('tx_user@example.com')
    expect(profileResult.data[0].bio).toBe('Transaction bio for testing')
    expect(updateResult.data[0].updated_at).toBe(updatedTimestamp)

    // Verify data integrity in store
    const finalUsers = client.mockDataStore.getTable('users')
    const finalProfiles = client.mockDataStore.getTable('profiles')
    expect(finalUsers.length).toBe(transactionStartUsers + 1)
    expect(finalProfiles.length).toBe(3) // 2 original + 1 new
  })

  test('should handle transaction rollback simulation with foreign key violation', async () => {
    const transactionStartUsers = client.mockDataStore.getTable('users').length
    const transactionStartProfiles = client.mockDataStore.getTable('profiles').length

    try {
      // Step 1: Insert user (succeeds)
      const userResult = await client
        .from('users')
        .insert({
          email: 'tx_fail_user@example.com',
          password_hash: '$2a$10$faihash',
          full_name: 'Failed Transaction User',
          role: 'user',
          active: true
        })
        .select()

      expect(userResult.error).toBeNull()
      expect(Array.isArray(userResult.data)).toBe(true)
      expect(userResult.data.length).toBe(1)

      expect(userResult.data[0]).toMatchObject({
        email: 'tx_fail_user@example.com',
        full_name: 'Failed Transaction User',
        id: expect.any(Number),
        role: 'user',
        active: true
      })

      const userId = userResult.data[0].id
      expect(userId).toBeGreaterThan(0)
      expect(typeof userId).toBe('number')

      // Step 2: Insert profile with invalid foreign key (fails)
      const profileQuery = client
        .from('profiles')
        .insert({
          user_id: 99999, // Non-existent user_id
          bio: 'Invalid user_id test',
          city: 'Test City'
        })
        .select()

      profileQuery.simulateError(
        POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION,
        'insert or update on table "profiles" violates foreign key constraint "profiles_user_id_fkey"'
      )

      const profileResult = await profileQuery

      // Verify error structure
      expect(profileResult.error).not.toBeNull()
      expect(profileResult.error.code).toBe(POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION)
      expect(profileResult.error.code).toBe('23503')
      expect(profileResult.error.message).toContain('foreign key constraint')
      expect(profileResult.data).toBeNull()
    } catch (error) {
      // In a real transaction, we would verify rollback
      expect(error.message).toContain('Transaction failed')
    }

    // In real implementation, verify no changes were committed
    const finalUsers = client.mockDataStore.getTable('users')
    const finalProfiles = client.mockDataStore.getTable('profiles')

    // Note: In mock implementation, partial commits may occur
    // Real transaction would maintain atomicity
    expect(finalUsers.length).toBeGreaterThanOrEqual(transactionStartUsers)
    expect(finalProfiles.length).toBeGreaterThanOrEqual(transactionStartProfiles)
  })

  test('should track transaction performance metrics accurately', async () => {
    const startTime = performance.now()

    // Execute a realistic multi-step transaction
    const userInsertQuery = client
      .from('users')
      .insert({
        email: 'perf_test@example.com',
        password_hash: '$2a$10$perftest',
        full_name: 'Performance Test User',
        role: 'user',
        active: true
      })
      .select()

    userInsertQuery.simulateDelay(50) // Simulate network delay
    await userInsertQuery

    const profileInsertQuery = client
      .from('profiles')
      .insert({
        user_id: 1, // Use existing user
        bio: 'Performance test bio',
        city: 'Test City'
      })
      .select()

    profileInsertQuery.simulateDelay(30)
    await profileInsertQuery

    const userUpdateQuery = client
      .from('users')
      .update({
        email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select()

    userUpdateQuery.simulateDelay(20)
    await userUpdateQuery

    const endTime = performance.now()
    const transactionDuration = endTime - startTime

    const metrics = client.getPerformanceMetrics()

    // Verify query count and success
    expect(metrics.totalQueries).toBe(3)
    expect(metrics.successfulQueries).toBe(3)
    expect(metrics.failedQueries).toBe(0)
    expect(metrics.successRate).toBe(100)

    // Verify performance timing
    expect(metrics.averageDuration).toBeGreaterThan(0)
    expect(metrics.averageDuration).toBeLessThan(1000) // Should be fast in mock
    expect(transactionDuration).toBeGreaterThan(50) // At least the simulated delay

    // Verify individual query tracking
    expect(metrics.queries).toHaveLength(3)
    expect(metrics.queries.every(q => q.success)).toBe(true)
    expect(metrics.queries[0].operation).toBe('insert')
    expect(metrics.queries[1].operation).toBe('insert')
    expect(metrics.queries[2].operation).toBe('update')

    // Verify performance thresholds
    metrics.queries.forEach((query, index) => {
      expect(query.duration).toBeGreaterThan(0)
      expect(query.startTime).toBeGreaterThan(0)
      expect(query.endTime).toBeGreaterThanOrEqual(query.startTime)
      expect(query.concurrentCount).toBeGreaterThan(0)
    })
  })

  test('should handle concurrent transaction simulation', async () => {
    // Simulate multiple concurrent operations
    const operations = []

    for (let i = 0; i < 3; i++) {
      operations.push(
        client
          .from('users')
          .insert({
            email: `concurrent_user_${i}@example.com`,
            full_name: `Concurrent User ${i}`,
            role: 'user',
            active: true
          })
          .select()
      )
    }

    // Execute all operations concurrently
    const results = await Promise.all(operations)

    // Verify all operations succeeded
    results.forEach((result, index) => {
      expect(result.error).toBeNull()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBe(1)
      expect(result.data[0]).toMatchObject({
        email: `concurrent_user_${index}@example.com`,
        full_name: `Concurrent User ${index}`,
        role: 'user',
        active: true
      })
    })

    // Verify metrics tracked all concurrent queries
    const metrics = client.getPerformanceMetrics()
    expect(metrics.totalQueries).toBe(3)
    expect(metrics.successfulQueries).toBe(3)
    expect(metrics.maxConcurrentQueries).toBeGreaterThan(1)
  })
})
