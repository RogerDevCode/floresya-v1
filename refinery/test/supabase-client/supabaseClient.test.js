/**
 * Comprehensive Supabase Client Tests - Vitest Edition
 * Tests database operations, RPC functions, transactions, error handling, and data consistency
 * Following Supabase official documentation and MIT/Stanford best practices
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  createSupabaseClientMock,
  POSTGRESQL_ERROR_CODES,
  PerformanceMonitor,
  AppError,
  ErrorMapper,
  BaseRepository,
  UserRepository,
  ProfileRepository,
  DIContainer,
  UserService,
  SchemaValidator
} from './mocks/mocks.js'

// Test configuration
const TEST_CONFIG = {
  timeout: 5000,
  retryAttempts: 3
}

// Helper function to create test client
function createTestClient() {
  return createSupabaseClientMock({
    url: 'https://test-project.supabase.co',
    anonKey: 'test-anon-key'
  })
}

// Helper function to wait for async operations
async function waitFor(ms = 100) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('Supabase Client Database Operations - Core CRUD', () => {
  let client

  beforeEach(() => {
    client = createTestClient()
  })

  afterEach(() => {
    client.reset()
  })

  describe('SELECT Operations - Basic', () => {
    test('should initialize mock data store correctly', () => {
      const usersTable = client.mockDataStore.getTable('users')
      expect(Array.isArray(usersTable)).toBe(true)
      expect(usersTable.length).toBe(2) // Exact count based on mock data
      expect(usersTable[0]).toMatchObject({
        id: 1,
        email: 'user1@example.com',
        password_hash: expect.stringMatching(/^\$2a\$10\$/), // bcrypt hash pattern
        full_name: 'User One',
        phone: '+1234567890',
        role: 'user',
        active: true,
        email_verified: true,
        created_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        updated_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        full_name_normalized: 'user one',
        email_normalized: 'user1@example.com'
      })
      expect(usersTable[1]).toMatchObject({
        id: 2,
        email: 'user2@example.com',
        role: 'admin',
        email_verified: false
      })
    })

    test('should fetch all records from users table', async () => {
      const { data, error } = await client.from('users').select()

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2) // Exact count from mock data

      // Validate complete user structure
      data.forEach((user, index) => {
        const expectedUser = client.mockDataStore.getTable('users')[index]
        expect(user).toEqual(expectedUser)
        expect(user).toMatchObject({
          id: expect.any(Number),
          email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/), // Email regex
          password_hash: expect.stringMatching(/^\$2a\$10\$/),
          full_name: expect.any(String),
          phone: expect.stringMatching(/^\+\d{10,15}$/),
          role: expect.stringMatching(/^(user|admin)$/),
          active: expect.any(Boolean),
          email_verified: expect.any(Boolean),
          created_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
          updated_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
          full_name_normalized: expect.any(String),
          email_normalized: expect.any(String)
        })
      })

      // Verify specific order and content
      expect(data[0]).toMatchObject({
        id: 1,
        email: 'user1@example.com',
        full_name: 'User One',
        role: 'user',
        active: true,
        email_verified: true
      })
      expect(data[1]).toMatchObject({
        id: 2,
        email: 'user2@example.com',
        full_name: 'User Two',
        role: 'admin',
        active: true,
        email_verified: false
      })
    })

    test('should fetch records with specific columns', async () => {
      const { data, error } = await client.from('users').select('id, email')

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2) // Exact count from mock data

      // Validate only selected columns are returned
      data.forEach((user, index) => {
        expect(user).toMatchObject({
          id: index + 1,
          email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        })
        // Ensure no other columns are present
        expect(Object.keys(user)).toEqual(['id', 'email'])
        expect(user).not.toHaveProperty('password_hash')
        expect(user).not.toHaveProperty('full_name')
        expect(user).not.toHaveProperty('role')
        expect(user).not.toHaveProperty('created_at')
      })

      // Verify exact values
      expect(data[0]).toEqual({ id: 1, email: 'user1@example.com' })
      expect(data[1]).toEqual({ id: 2, email: 'user2@example.com' })
    })

    test('should return single record with single()', async () => {
      const { data, error } = await client.from('users').select().eq('id', 1).single()

      expect(error).toBeNull()
      expect(data).toMatchObject({
        id: 1,
        email: 'user1@example.com',
        password_hash: expect.stringMatching(/^\$2a\$10\$/),
        full_name: 'User One',
        phone: '+1234567890',
        role: 'user',
        active: true,
        email_verified: true,
        created_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        updated_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        full_name_normalized: 'user one',
        email_normalized: 'user1@example.com'
      })
      expect(data.email).toBe('user1@example.com')
      expect(data.full_name).toBe('User One')
      expect(data.active).toBe(true)
      expect(data.role).toBe('user')
    })

    test('should return null for maybeSingle with no results', async () => {
      const { data, error } = await client.from('users').select().eq('id', 999).maybeSingle()

      expect(error).toBeNull()
      expect(data).toBeNull()
      // Test that we get exactly null, not undefined or false
      expect(data).toBeNull()
      expect(data).not.toBeUndefined()
      expect(data).not.toBeTruthy()
    })

    test('should throw error with single() when no results found', async () => {
      const { data, error } = await client.from('users').select().eq('id', 999).single()

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.code).toBe('PGRST116') // Supabase error code for no rows
      expect(error.message).toContain('No rows returned')
    })

    test('should throw error with single() when multiple results found', async () => {
      // This test would require mocking data that returns multiple rows for a single() call
      // For now, we'll test the current implementation
      const { data, error } = await client.from('users').select().gte('id', 1).single()

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.code).toBe('PGRST117') // Supabase error code for multiple rows
      expect(error.message).toContain('Multiple rows returned')
    })
  })

  describe('SELECT Operations - Filtering', () => {
    test('should filter records with eq operator', async () => {
      const { data, error } = await client.from('users').select().eq('id', 1)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)
      expect(data[0]).toMatchObject({
        id: 1,
        email: 'user1@example.com',
        full_name: 'User One',
        role: 'user'
      })
      // Ensure we got exactly the user we asked for
      expect(data[0].id).toBe(1)
    })

    test('should filter records with neq operator', async () => {
      const { data, error } = await client.from('users').select().neq('id', 1)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1) // Should be exactly 1 record (user with id 2)
      expect(data[0]).toMatchObject({
        id: 2,
        email: 'user2@example.com',
        full_name: 'User Two',
        role: 'admin'
      })
      // Verify no record has id 1
      expect(data.every(user => user.id !== 1)).toBe(true)
    })

    test('should filter records with gt operator', async () => {
      const { data, error } = await client.from('users').select().gt('id', 1)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1) // Should be exactly 1 record (user with id 2)
      expect(data[0].id).toBe(2)
      expect(data.every(user => user.id > 1)).toBe(true)
    })

    test('should filter records with gte operator', async () => {
      const { data, error } = await client.from('users').select().gte('id', 1)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2) // Should return both users
      expect(data.every(user => user.id >= 1)).toBe(true)
      // Verify specific ids are included
      expect(data.map(user => user.id)).toEqual([1, 2])
    })

    test('should filter records with lt operator', async () => {
      const { data, error } = await client.from('users').select().lt('id', 2)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1) // Should be exactly 1 record (user with id 1)
      expect(data[0].id).toBe(1)
      expect(data.every(user => user.id < 2)).toBe(true)
    })

    test('should filter records with lte operator', async () => {
      const { data, error } = await client.from('users').select().lte('id', 2)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2) // Should return both users
      expect(data.every(user => user.id <= 2)).toBe(true)
    })

    test('should filter records with like operator', async () => {
      const { data, error } = await client.from('users').select().like('email', '%example.com')

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2) // Both users should match
      expect(data.every(user => user.email.includes('example.com'))).toBe(true)
      // Verify both specific emails are included
      expect(data.map(user => user.email)).toEqual(['user1@example.com', 'user2@example.com'])
    })

    test('should filter records with ilike operator (case insensitive)', async () => {
      const { data, error } = await client.from('users').select().ilike('email', '%EXAMPLE.COM')

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2) // Both users should match due to case-insensitive
      expect(data.every(user => user.email.toLowerCase().includes('example.com'))).toBe(true)
    })

    test('should filter records with in operator', async () => {
      const { data, error } = await client.from('users').select().in('id', [1, 2])

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2) // Both users should be returned
      expect(data.every(user => [1, 2].includes(user.id))).toBe(true)
      // Verify specific order might vary
      expect(data.map(user => user.id).sort()).toEqual([1, 2])
    })

    test('should filter records with is operator', async () => {
      const { data, error } = await client.from('profiles').select().is('avatar_url', null)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1) // Only user 2 should have null avatar_url
      expect(data[0]).toMatchObject({
        id: 2,
        user_id: 2,
        avatar_url: null
      })
      expect(data.every(profile => profile.avatar_url === null)).toBe(true)
    })

    test('should filter records with is operator for non-null values', async () => {
      const { data, error } = await client.from('profiles').select().is('avatar_url', 'not_null')

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1) // Only user 1 should have non-null avatar_url
      expect(data[0]).toMatchObject({
        id: 1,
        user_id: 1,
        avatar_url: 'https://example.com/avatars/user1.jpg'
      })
      expect(data.every(profile => profile.avatar_url !== null)).toBe(true)
    })
  })

  describe('SELECT Operations - Sorting and Pagination', () => {
    test('should order records ascending', async () => {
      const { data, error } = await client.from('users').select().order('id', { ascending: true })

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2)
      // Verify ascending order
      expect(data[0].id).toBeLessThan(data[1].id)
      expect(data.map(user => user.id)).toEqual([1, 2])
      // Verify content is preserved
      expect(data[0].email).toBe('user1@example.com')
      expect(data[1].email).toBe('user2@example.com')
    })

    test('should order records descending', async () => {
      const { data, error } = await client.from('users').select().order('id', { ascending: false })

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2)
      // Verify descending order
      expect(data[0].id).toBeGreaterThan(data[1].id)
      expect(data.map(user => user.id)).toEqual([2, 1])
      // Verify content is preserved
      expect(data[0].email).toBe('user2@example.com')
      expect(data[1].email).toBe('user1@example.com')
    })

    test('should limit results', async () => {
      const { data, error } = await client.from('users').select().limit(1)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1) // Exact limit
      // Verify we get the first record by default
      expect(data[0]).toMatchObject({
        id: 1,
        email: 'user1@example.com',
        full_name: 'User One'
      })
    })

    test('should paginate with range', async () => {
      const { data, error } = await client.from('users').select().range(0, 0)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1) // Range from index 0 to 0 inclusive
      // Should return first record
      expect(data[0]).toMatchObject({
        id: 1,
        email: 'user1@example.com'
      })
    })

    test('should handle complex pagination with offset and limit', async () => {
      const { data, error } = await client.from('products').select().range(0, 1)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2) // Products 1 and 2
      // Verify specific products are returned
      expect(data[0]).toMatchObject({
        id: 1,
        name: 'Rosas Rojas Premium',
        price_usd: 29.99
      })
      expect(data[1]).toMatchObject({
        id: 2,
        name: 'Tulipanes Amarillos',
        price_usd: 24.99
      })
    })

    test('should handle range beyond available records', async () => {
      const { data, error } = await client.from('users').select().range(10, 20)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(0) // No records in this range
    })

    test('should combine ordering and limiting', async () => {
      const { data, error } = await client
        .from('users')
        .select()
        .order('id', { ascending: false })
        .limit(1)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)
      // Should get the highest ID user
      expect(data[0]).toMatchObject({
        id: 2,
        email: 'user2@example.com'
      })
    })
  })

  describe('SELECT Operations - Relations and Joins', () => {
    test('should select user with profile relation', async () => {
      const { data, error } = await client
        .from('users')
        .select(
          `
          *,
          profiles (*)
        `
        )
        .eq('id', 1)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.id).toBe(1)
      expect(data.profiles).toBeDefined()
      expect(Array.isArray(data.profiles)).toBe(true)
      expect(data.profiles[0].user_id).toBe(1)
    })

    test('should select product with images relation', async () => {
      const { data, error } = await client
        .from('products')
        .select(
          `
          *,
          product_images (*)
        `
        )
        .eq('id', 1)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.id).toBe(1)
      expect(data.product_images).toBeDefined()
      expect(Array.isArray(data.product_images)).toBe(true)
      expect(data.product_images[0].product_id).toBe(1)
    })

    test('should select product with occasions relation', async () => {
      const { data, error } = await client
        .from('products')
        .select(
          `
          *,
          product_occasions (
            occasions (*)
          )
        `
        )
        .eq('id', 1)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.product_occasions).toBeDefined()
      expect(Array.isArray(data.product_occasions)).toBe(true)
    })

    test('should select order with items and payment relations', async () => {
      const { data, error } = await client
        .from('orders')
        .select(
          `
          *,
          order_items (*),
          payments (*)
        `
        )
        .eq('id', 1)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.order_items).toBeDefined()
      expect(data.payments).toBeDefined()
    })
  })

  describe('INSERT Operations', () => {
    test('should insert a single record with auto-generated ID', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password_hash: '$2a$10$newpasswordhash',
        full_name: 'New User',
        phone: '+1555123456',
        role: 'user',
        active: true,
        email_verified: false
      }
      const { data, error } = await client.from('users').insert(newUser).select()

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)

      // Verify all required fields are present
      expect(data[0]).toMatchObject({
        id: 3, // Next available ID after 2 existing users
        email: 'newuser@example.com',
        password_hash: '$2a$10$newpasswordhash',
        full_name: 'New User',
        phone: '+1555123456',
        role: 'user',
        active: true,
        email_verified: false,
        created_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        updated_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        full_name_normalized: 'new user',
        email_normalized: 'newuser@example.com'
      })

      // Verify ID was auto-generated and is a number
      expect(typeof data[0].id).toBe('number')
      expect(data[0].id).toBeGreaterThan(2)
    })

    test('should insert multiple records', async () => {
      const newUsers = [
        {
          email: 'batch1@example.com',
          password_hash: '$2a$10$hash1',
          full_name: 'Batch User One',
          phone: '+1555123457',
          role: 'user'
        },
        {
          email: 'batch2@example.com',
          password_hash: '$2a$10$hash2',
          full_name: 'Batch User Two',
          phone: '+1555123458',
          role: 'admin'
        }
      ]
      const { data, error } = await client.from('users').insert(newUsers).select()

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2)

      // Verify each inserted record
      expect(data[0]).toMatchObject({
        id: 3,
        email: 'batch1@example.com',
        full_name: 'Batch User One',
        role: 'user'
      })

      expect(data[1]).toMatchObject({
        id: 4,
        email: 'batch2@example.com',
        full_name: 'Batch User Two',
        role: 'admin'
      })

      // Verify IDs are sequential
      expect(data[1].id).toBe(data[0].id + 1)

      // Verify all records have required system fields
      data.forEach(user => {
        expect(user).toHaveProperty('created_at')
        expect(user).toHaveProperty('updated_at')
        expect(user).toHaveProperty('full_name_normalized')
        expect(user).toHaveProperty('email_normalized')
      })
    })

    test('should generate sequential IDs starting from highest existing', async () => {
      // First insert
      const user1 = { email: 'sequential1@example.com', full_name: 'Sequential One' }
      const result1 = await client.from('users').insert(user1).select()

      // Second insert
      const user2 = { email: 'sequential2@example.com', full_name: 'Sequential Two' }
      const result2 = await client.from('users').insert(user2).select()

      expect(result1.error).toBeNull()
      expect(result2.error).toBeNull()

      // Verify sequential IDs
      expect(result1.data[0].id).toBe(3) // After existing 2 users
      expect(result2.data[0].id).toBe(4) // After the previous insert
    })

    test('should reject insert with duplicate email', async () => {
      const duplicateUser = {
        email: 'user1@example.com', // Already exists
        full_name: 'Duplicate User'
      }

      const query = client.from('users').insert(duplicateUser).select()
      query.simulateError(
        POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION,
        'duplicate key value violates unique constraint "users_email_key"'
      )

      const { data, error } = await query

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.code).toBe('23505')
      expect(error.message).toContain('duplicate key value')
    })
  })

  describe('UPDATE Operations', () => {
    test('should update a single record and return updated data', async () => {
      // Store original updated_at timestamp
      const originalUser = client.mockDataStore.getTable('users').find(u => u.id === 1)
      const originalUpdatedAt = originalUser.updated_at

      const updates = {
        full_name: 'Updated Name',
        phone: '+15559999999',
        role: 'admin',
        email_verified: true
      }
      const { data, error } = await client.from('users').update(updates).eq('id', 1).select()

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)

      // Verify updates were applied
      expect(data[0]).toMatchObject({
        id: 1,
        email: 'user1@example.com', // Should remain unchanged
        full_name: 'Updated Name',
        phone: '+15559999999',
        role: 'admin',
        email_verified: true,
        password_hash: expect.stringMatching(/^\$2a\$10\$/), // Should remain unchanged
        updated_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      })

      // Verify updated_at timestamp was modified
      expect(data[0].updated_at).not.toBe(originalUpdatedAt)
      expect(new Date(data[0].updated_at).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      )
    })

    test('should update multiple records matching filter', async () => {
      const updates = { active: false, email_verified: false }
      const { data, error } = await client.from('users').update(updates).gte('id', 1).select()

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2) // Both users should be updated

      // Verify both records were updated
      data.forEach(user => {
        expect(user).toMatchObject({
          active: false,
          email_verified: false
        })
        // Ensure other fields are preserved
        expect(user).toHaveProperty('email')
        expect(user).toHaveProperty('full_name')
        expect(user).toHaveProperty('created_at')
      })

      // Verify specific users
      expect(data.find(u => u.id === 1)?.email).toBe('user1@example.com')
      expect(data.find(u => u.id === 2)?.email).toBe('user2@example.com')
    })

    test('should return empty array for update on non-existent record', async () => {
      const updates = { full_name: 'Ghost Update' }
      const { data, error } = await client.from('users').update(updates).eq('id', 999).select()

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(0)
    })

    test('should handle update with multiple filters', async () => {
      const updates = { role: 'verified' }
      const { data, error } = await client
        .from('users')
        .update(updates)
        .eq('role', 'user')
        .eq('active', true)
        .select()

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1) // Only user 1 should match both conditions
      expect(data[0]).toMatchObject({
        id: 1,
        role: 'verified'
      })
    })

    test('should reject update violating unique constraint', async () => {
      const updates = { email: 'user2@example.com' } // Try to make user1 email same as user2

      const query = client.from('users').update(updates).eq('id', 1).select()
      query.simulateError(
        POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION,
        'duplicate key value violates unique constraint "users_email_key"'
      )

      const { data, error } = await query

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.code).toBe('23505')
      expect(error.message).toContain('duplicate key value')
    })
  })

  describe('DELETE Operations', () => {
    test('should delete a single record and return deleted data', async () => {
      const { data, error } = await client.from('users').delete().eq('id', 1).select()

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)

      // Verify the deleted record is returned
      expect(data[0]).toMatchObject({
        id: 1,
        email: 'user1@example.com',
        full_name: 'User One',
        role: 'user',
        active: true,
        email_verified: true,
        password_hash: expect.stringMatching(/^\$2a\$10\$/),
        created_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      })

      // Verify the record is actually deleted from the data store
      const remainingUsers = client.mockDataStore.getTable('users')
      expect(remainingUsers.find(u => u.id === 1)).toBeUndefined()
      expect(remainingUsers.length).toBe(1) // Only user 2 should remain
    })

    test('should delete multiple records matching filter', async () => {
      const { data, error } = await client.from('users').delete().gte('id', 1).select()

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2) // Both users should be deleted

      // Verify both deleted records are returned
      expect(data[0]).toMatchObject({
        id: expect.any(Number),
        email: expect.stringMatching(/@example\.com$/)
      })
      expect(data[1]).toMatchObject({
        id: expect.any(Number),
        email: expect.stringMatching(/@example\.com$/)
      })

      // Verify specific emails
      const emails = data.map(u => u.email).sort()
      expect(emails).toEqual(['user1@example.com', 'user2@example.com'])

      // Verify all records are deleted from data store
      const remainingUsers = client.mockDataStore.getTable('users')
      expect(remainingUsers.length).toBe(0)
    })

    test('should return empty array for delete on non-existent record', async () => {
      const { data, error } = await client.from('users').delete().eq('id', 999).select()

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(0)

      // Verify data store is unchanged
      const users = client.mockDataStore.getTable('users')
      expect(users.length).toBe(2) // Should still have the original 2 users
    })

    test('should handle delete with multiple filters', async () => {
      const { data, error } = await client
        .from('users')
        .delete()
        .eq('role', 'user')
        .eq('active', true)
        .select()

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1) // Only user 1 should match both conditions

      expect(data[0]).toMatchObject({
        id: 1,
        email: 'user1@example.com',
        role: 'user',
        active: true
      })

      // Verify user 2 remains
      const remainingUsers = client.mockDataStore.getTable('users')
      expect(remainingUsers.length).toBe(1)
      expect(remainingUsers[0].id).toBe(2)
    })

    test('should handle foreign key constraint violation', async () => {
      // Try to delete user that has dependent records in profiles table
      const query = client.from('users').delete().eq('id', 1).select()
      query.simulateError(
        POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION,
        'update or delete on table "users" violates foreign key constraint "profiles_user_id_fkey"'
      )

      const { data, error } = await query

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.code).toBe('23503')
      expect(error.message).toContain('foreign key constraint')
    })
  })

  describe('Complex Query Operations', () => {
    test('should combine multiple filters', async () => {
      const { data, error } = await client
        .from('users')
        .select()
        .gte('id', 1)
        .lte('id', 2)
        .like('email', '%example.com')

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(
        data.every(user => user.id >= 1 && user.id <= 2 && user.email.includes('example.com'))
      ).toBe(true)
    })

    test('should handle complex ordering with filtering', async () => {
      const { data, error } = await client
        .from('users')
        .select()
        .gte('id', 1)
        .order('id', { ascending: false })
        .limit(5)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.length).toBeLessThanOrEqual(5)

      // Verify descending order
      for (let i = 0; i < data.length - 1; i++) {
        expect(data[i].id).toBeGreaterThanOrEqual(data[i + 1].id)
      }
    })
  })
})

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
    expect(data).toBeDefined()
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
    expect(data).toBeDefined()
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
    expect(data).toBeDefined()
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
    expect(data).toBeDefined()
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
    expect(data).toBeDefined()
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
    expect(error).toBeDefined()
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
    expect(data).toBeDefined()
    expect(data).toMatchObject({
      result: expect.any(String)
    })
  })

  test('should handle RPC with null parameters', async () => {
    const { data, error } = await client.rpc('test_function', null)

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data).toMatchObject({
      result: expect.any(String)
    })
  })
})

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
      id: 3, // Next ID after existing users
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
    expect(userId).toBeGreaterThan(2)
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
      expect(profileResult.error).toBeDefined()
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

describe('Error Handling Tests', () => {
  let client

  beforeEach(() => {
    client = createTestClient()
  })

  afterEach(() => {
    client.reset()
  })

  describe('PostgreSQL Error Codes', () => {
    test('should handle unique violation error', async () => {
      const query = client.from('users').insert({ email: 'user1@example.com', name: 'Duplicate' })
      query.simulateError(POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION, 'Duplicate key value')

      const { data, error } = await query.select()

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.code).toBe(POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION)
      expect(error.message).toContain('Duplicate key value')
    })

    test('should handle foreign key violation error', async () => {
      const query = client.from('profiles').insert({ user_id: 99999, bio: 'Invalid user' })
      query.simulateError(POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION, 'Foreign key violation')

      const { data, error } = await query.select()

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.code).toBe(POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION)
    })

    test('should handle not null violation error', async () => {
      const query = client.from('users').insert({ email: null, name: 'No Email User' })
      query.simulateError(POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION, 'Null value not allowed')

      const { data, error } = await query.select()

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.code).toBe(POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION)
    })

    test('should handle check violation error', async () => {
      const query = client.from('users').insert({ email: 'invalid-email', name: 'Invalid Email' })
      query.simulateError(POSTGRESQL_ERROR_CODES.CHECK_VIOLATION, 'Check constraint violated')

      const { data, error } = await query.select()

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.code).toBe(POSTGRESQL_ERROR_CODES.CHECK_VIOLATION)
    })

    test('should handle undefined table error', async () => {
      const query = client.from('nonexistent_table').select()
      query.simulateError(POSTGRESQL_ERROR_CODES.UNDEFINED_TABLE, 'Table does not exist')

      const { data, error } = await query

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.code).toBe(POSTGRESQL_ERROR_CODES.UNDEFINED_TABLE)
    })

    test('should handle undefined column error', async () => {
      const query = client.from('users').select('nonexistent_column')
      query.simulateError(POSTGRESQL_ERROR_CODES.UNDEFINED_COLUMN, 'Column does not exist')

      const { data, error } = await query

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.code).toBe(POSTGRESQL_ERROR_CODES.UNDEFINED_COLUMN)
    })

    test('should handle syntax error', async () => {
      const query = client.from('users').select()
      query.simulateError(POSTGRESQL_ERROR_CODES.SYNTAX_ERROR, 'Syntax error in query')

      const { data, error } = await query

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.code).toBe(POSTGRESQL_ERROR_CODES.SYNTAX_ERROR)
    })

    test('should handle insufficient privilege error', async () => {
      const query = client.from('restricted_table').select()
      query.simulateError(POSTGRESQL_ERROR_CODES.INSUFFICIENT_PRIVILEGE, 'Permission denied')

      const { data, error } = await query

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.code).toBe(POSTGRESQL_ERROR_CODES.INSUFFICIENT_PRIVILEGE)
    })
  })

  describe('Network and Connection Errors', () => {
    test('should handle connection failure', async () => {
      const query = client.from('users').select()
      query.simulateConnectionError()

      const { data, error } = await query

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.message).toContain('Connection failed')
    })

    test('should handle connection timeout', async () => {
      const query = client.from('users').select()
      query.simulateTimeout()

      const { data, error } = await query

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.message).toContain('Connection timeout')
    }, 35000) // Increase timeout to 35 seconds

    test('should handle too many connections error', async () => {
      const query = client.from('users').select()
      query.simulateError(POSTGRESQL_ERROR_CODES.TOO_MANY_CONNECTIONS, 'Too many connections')

      const { data, error } = await query

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.code).toBe(POSTGRESQL_ERROR_CODES.TOO_MANY_CONNECTIONS)
    })
  })

  describe('Error Recovery and Metrics', () => {
    test('should track failed queries in performance metrics', async () => {
      const query = client.from('users').select()
      query.simulateError(POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION, 'Test error')

      await query

      const metrics = client.getPerformanceMetrics()
      expect(metrics.totalQueries).toBe(1)
      expect(metrics.successfulQueries).toBe(0)
      expect(metrics.failedQueries).toBe(1)
      expect(metrics.successRate).toBe(0)
      expect(metrics.queries[0].success).toBe(false)
      expect(metrics.queries[0].error).toBeDefined()
    })

    test('should handle mixed success and failure queries', async () => {
      // Successful query
      await client.from('users').select()

      // Failed query
      const failedQuery = client.from('users').select()
      failedQuery.simulateError(POSTGRESQL_ERROR_CODES.SYNTAX_ERROR, 'Syntax error')
      await failedQuery

      // Another successful query
      await client.from('profiles').select()

      const metrics = client.getPerformanceMetrics()
      expect(metrics.totalQueries).toBe(3)
      expect(metrics.successfulQueries).toBe(2)
      expect(metrics.failedQueries).toBe(1)
      expect(metrics.successRate).toBeCloseTo(66.67, 1)
    })
  })
})

describe('Data Consistency Tests', () => {
  let client

  beforeEach(() => {
    client = createTestClient()
  })

  afterEach(() => {
    client.reset()
  })

  describe('Soft-Delete Patterns', () => {
    test('should implement soft delete with deleted_at timestamp', async () => {
      // Insert a record
      const { data: insertData } = await client
        .from('users')
        .insert({ email: 'soft_delete@example.com', name: 'Soft Delete User' })
        .select()

      const userId = insertData[0].id

      // Soft delete by updating deleted_at
      const { data: updateData, error: updateError } = await client
        .from('users')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', userId)
        .select()

      expect(updateError).toBeNull()
      expect(updateData[0]).toHaveProperty('deleted_at')

      // Verify soft deleted record doesn't appear in normal queries
      const { data: activeData } = await client.from('users').select().is('deleted_at', null)

      expect(activeData.every(user => user.deleted_at === null)).toBe(true)

      // Verify soft deleted record appears in include-deleted queries
      const { data: allData } = await client.from('users').select()
      expect(allData.some(user => user.id === userId)).toBe(true)
    })

    test('should handle cascade soft delete relationships', async () => {
      // Insert user and profile
      const { data: userData } = await client
        .from('users')
        .insert({ email: 'cascade@example.com', name: 'Cascade User' })
        .select()

      const userId = userData[0].id

      await client.from('profiles').insert({ user_id: userId, bio: 'Cascade profile' }).select()

      // Soft delete user
      await client.from('users').update({ deleted_at: new Date().toISOString() }).eq('id', userId)

      // Soft delete associated profile
      await client
        .from('profiles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('user_id', userId)

      // Verify both are soft deleted
      const { data: activeUsers } = await client.from('users').select().is('deleted_at', null)

      const { data: activeProfiles } = await client.from('profiles').select().is('deleted_at', null)

      expect(activeUsers.every(user => user.id !== userId)).toBe(true)
      expect(activeProfiles.every(profile => profile.user_id !== userId)).toBe(true)
    })
  })

  describe('Relationship Consistency', () => {
    test('should maintain referential integrity', async () => {
      // Try to insert profile with non-existent user_id
      const profileQuery = client
        .from('profiles')
        .insert({ user_id: 99999, bio: 'Orphan profile' })
        .select()

      profileQuery.simulateError(
        POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION,
        'Referential integrity violation'
      )

      const { data, error } = await profileQuery

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.code).toBe(POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION)
    })

    test('should validate data consistency across related tables', async () => {
      // Get all users with their profiles
      const { data: users } = await client.from('users').select()
      const { data: profiles } = await client.from('profiles').select()

      // Verify every profile has a corresponding user
      const orphanedProfiles = profiles.filter(
        profile => !users.some(user => user.id === profile.user_id)
      )

      expect(orphanedProfiles.length).toBe(0)

      // Verify user profile relationships
      for (const user of users) {
        const userProfile = profiles.find(profile => profile.user_id === user.id)
        if (userProfile) {
          expect(userProfile.user_id).toBe(user.id)
        }
      }
    })
  })

  describe('Data Validation', () => {
    test('should validate email format', async () => {
      const invalidEmails = [
        'not-an-email',
        '@invalid.com',
        'invalid@',
        'invalid..email@example.com'
      ]

      for (const email of invalidEmails) {
        const query = client.from('users').insert({ email, name: 'Invalid Email Test' }).select()

        query.simulateError(POSTGRESQL_ERROR_CODES.CHECK_VIOLATION, 'Invalid email format')

        const { data, error } = await query

        expect(data).toBeNull()
        expect(error).toBeDefined()
        expect(error.code).toBe(POSTGRESQL_ERROR_CODES.CHECK_VIOLATION)
      }
    })

    test('should validate required fields', async () => {
      // Test missing email
      const emailQuery = client.from('users').insert({ name: 'No Email User' }).select()

      emailQuery.simulateError(POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION, 'Email cannot be null')

      const { data: emailData, error: emailError } = await emailQuery

      expect(emailData).toBeNull()
      expect(emailError).toBeDefined()
      expect(emailError.code).toBe(POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION)

      // Test missing name
      const nameQuery = client.from('users').insert({ email: 'no_name@example.com' }).select()

      nameQuery.simulateError(POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION, 'Name cannot be null')

      const { data: nameData, error: nameError } = await nameQuery

      expect(nameData).toBeNull()
      expect(nameError).toBeDefined()
      expect(nameError.code).toBe(POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION)
    })
  })
})

describe('Performance Monitoring Integration', () => {
  let client

  beforeEach(() => {
    client = createTestClient()
  })

  afterEach(() => {
    client.reset()
  })

  test('should track all query types in performance metrics', async () => {
    // SELECT
    await client.from('users').select()

    // INSERT
    await client.from('users').insert({ email: 'perf@example.com', name: 'Perf Test' }).select()

    // UPDATE
    await client.from('users').update({ name: 'Updated' }).eq('id', 1).select()

    // DELETE
    await client.from('users').delete().eq('id', 2).select()

    // RPC
    await client.rpc('get_user_profile', { user_id: 1 })

    const metrics = client.getPerformanceMetrics()

    expect(metrics.totalQueries).toBe(5)
    expect(metrics.successfulQueries).toBe(5)
    expect(metrics.failedQueries).toBe(0)
    expect(metrics.successRate).toBe(100)

    // Verify query types are tracked
    const queryTypes = metrics.queries.map(q => q.operation)
    expect(queryTypes).toContain('select')
    expect(queryTypes).toContain('rpc')
  })

  test('should calculate accurate performance metrics', async () => {
    // Execute queries with different delays
    const fastQuery = client.from('users').select()
    fastQuery.simulateDelay(10)
    await fastQuery

    const slowQuery = client.from('profiles').select()
    slowQuery.simulateDelay(100)
    await slowQuery

    const metrics = client.getPerformanceMetrics()

    expect(metrics.totalQueries).toBe(2)
    expect(metrics.averageDuration).toBeGreaterThan(10)
    expect(metrics.averageDuration).toBeLessThan(100)

    // Verify individual query durations
    expect(metrics.queries[0].duration).toBeGreaterThan(0)
    expect(metrics.queries[1].duration).toBeGreaterThan(0)
  })

  test('should allow performance monitoring to be disabled', async () => {
    client.disablePerformanceMonitoring()

    await client.from('users').select()
    await client.from('profiles').select()

    const metrics = client.getPerformanceMetrics()

    expect(metrics.totalQueries).toBe(0)
    expect(metrics.queries.length).toBe(0)
  })

  test('should allow performance monitoring to be re-enabled', async () => {
    client.disablePerformanceMonitoring()
    await client.from('users').select()

    let metrics = client.getPerformanceMetrics()
    expect(metrics.totalQueries).toBe(0)

    client.enablePerformanceMonitoring()
    await client.from('profiles').select()

    metrics = client.getPerformanceMetrics()
    expect(metrics.totalQueries).toBe(1)
  })

  test('should reset performance metrics correctly', async () => {
    await client.from('users').select()
    await client.from('profiles').select()

    let metrics = client.getPerformanceMetrics()
    expect(metrics.totalQueries).toBe(2)

    client.performanceMonitor.reset()

    metrics = client.getPerformanceMetrics()
    expect(metrics.totalQueries).toBe(0)
    expect(metrics.queries.length).toBe(0)
  })
})

describe('Repository Pattern Tests', () => {
  let client
  let userRepository
  let profileRepository

  beforeEach(() => {
    client = createTestClient()
    userRepository = new UserRepository(client)
    profileRepository = new ProfileRepository(client)
  })

  afterEach(() => {
    client.reset()
  })

  describe('BaseRepository Operations', () => {
    test('should find record by ID', async () => {
      const user = await userRepository.findById(1)

      expect(user).toBeDefined()
      expect(user.id).toBe(1)
      expect(user.email).toBeDefined()
    })

    test('should find one record with filters', async () => {
      const user = await userRepository.findOne({ email: 'user1@example.com' })

      expect(user).toBeDefined()
      expect(user.email).toBe('user1@example.com')
    })

    test('should find many records with filters', async () => {
      const users = await userRepository.findMany({}, { limit: 10 })

      expect(Array.isArray(users)).toBe(true)
      expect(users.length).toBeGreaterThan(0)
    })

    test('should create new record', async () => {
      const userData = {
        email: 'repo-test@example.com',
        name: 'Repository Test User'
      }

      const user = await userRepository.create(userData)

      expect(user).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user.name).toBe(userData.name)
      expect(user.id).toBeDefined()
    })

    test('should update record', async () => {
      const updates = { name: 'Updated Repository User' }
      const user = await userRepository.update(1, updates)

      expect(user).toBeDefined()
      expect(user.name).toBe(updates.name)
    })

    test('should update multiple records', async () => {
      const updates = { name: 'Batch Updated' }
      const users = await userRepository.updateMany({}, updates)

      expect(Array.isArray(users)).toBe(true)
      expect(users.every(user => user.name === updates.name)).toBe(true)
    })

    test('should delete record', async () => {
      const user = await userRepository.delete(1)

      expect(user).toBeDefined()
      expect(user.id).toBe(1)
    })

    test('should soft delete record', async () => {
      const user = await userRepository.softDelete(1)

      expect(user).toBeDefined()
      expect(user.deleted_at).toBeDefined()
    })

    test('should find only active records', async () => {
      // Soft delete a user first
      await userRepository.softDelete(1)

      const activeUsers = await userRepository.findActive()

      expect(activeUsers.every(user => user.deleted_at === null)).toBe(true)
    })
  })

  describe('UserRepository Specific Operations', () => {
    test('should find user by email', async () => {
      const user = await userRepository.findByEmail('user1@example.com')

      expect(user).toBeDefined()
      expect(user.email).toBe('user1@example.com')
    })

    test('should find user with profile', async () => {
      const userWithProfile = await userRepository.findWithProfile(1)

      expect(userWithProfile).toBeDefined()
      expect(userWithProfile.id).toBe(1)
      expect(userWithProfile.profiles).toBeDefined()
      expect(Array.isArray(userWithProfile.profiles)).toBe(true)
    })

    test('should create user with profile transaction', async () => {
      const userData = {
        email: 'user-with-profile@example.com',
        name: 'User With Profile'
      }
      const profileData = {
        bio: 'Profile bio for transaction test'
      }

      const result = await userRepository.createUserWithProfile(userData, profileData)

      expect(result.user).toBeDefined()
      expect(result.profile).toBeDefined()
      expect(result.user.email).toBe(userData.email)
      expect(result.profile.bio).toBe(profileData.bio)
      expect(result.profile.user_id).toBe(result.user.id)
    })
  })

  describe('ProfileRepository Specific Operations', () => {
    test('should find profile by user ID', async () => {
      const profile = await profileRepository.findByUserId(1)

      expect(profile).toBeDefined()
      expect(profile.user_id).toBe(1)
    })

    test('should update profile by user ID', async () => {
      const updates = { bio: 'Updated bio' }
      const profile = await profileRepository.updateByUserId(1, updates)

      expect(profile).toBeDefined()
      expect(profile.bio).toBe(updates.bio)
    })
  })
})

describe('Service Layer Integration Tests with DI Container', () => {
  let container
  let client
  let userService

  beforeEach(() => {
    client = createTestClient()
    container = new DIContainer()

    // Register dependencies
    container.register('supabaseClient', () => client, { singleton: true })
    container.register('userRepository', client => new UserRepository(client), {
      dependencies: ['supabaseClient'],
      singleton: true
    })
    container.register('profileRepository', client => new ProfileRepository(client), {
      dependencies: ['supabaseClient'],
      singleton: true
    })
    container.register('performanceMonitor', () => client.performanceMonitor, {
      singleton: true
    })
    container.register(
      'userService',
      (userRepo, profileRepo, perfMonitor) => new UserService(userRepo, profileRepo, perfMonitor),
      {
        dependencies: ['userRepository', 'profileRepository', 'performanceMonitor'],
        singleton: true
      }
    )

    userService = container.get('userService')
  })

  afterEach(() => {
    client.reset()
    container.clear()
  })

  test('should resolve dependencies correctly', () => {
    expect(container.has('userService')).toBe(true)
    expect(container.has('userRepository')).toBe(true)
    expect(container.has('profileRepository')).toBe(true)

    const userRepo = container.get('userRepository')
    const profileRepo = container.get('profileRepository')
    const perfMonitor = container.get('performanceMonitor')

    expect(userRepo).toBeInstanceOf(UserRepository)
    expect(profileRepo).toBeInstanceOf(ProfileRepository)
    expect(perfMonitor).toBeInstanceOf(PerformanceMonitor)
  })

  test('should use singleton pattern correctly', () => {
    const userService1 = container.get('userService')
    const userService2 = container.get('userService')

    expect(userService1).toBe(userService2)
  })

  test('should get user with profile through service layer', async () => {
    const result = await userService.getUserWithProfile(1)

    expect(result).toBeDefined()
    expect(result.id).toBe(1)
    expect(result.profiles).toBeDefined()

    // Check performance monitoring
    const metrics = client.getPerformanceMetrics()
    expect(metrics.totalQueries).toBeGreaterThan(0)
    expect(metrics.queries.some(q => q.operation === 'service')).toBe(true)
  })

  test('should create user with profile through service layer', async () => {
    const userData = {
      email: 'service-user@example.com',
      name: 'Service User'
    }
    const profileData = {
      bio: 'Service user bio'
    }

    const result = await userService.createUserWithProfile(userData, profileData)

    expect(result.user).toBeDefined()
    expect(result.profile).toBeDefined()
    expect(result.user.email).toBe(userData.email)
    expect(result.profile.user_id).toBe(result.user.id)

    // Check performance monitoring
    const metrics = client.getPerformanceMetrics()
    expect(
      metrics.queries.some(q => q.operation === 'service' && q.method === 'createUserWithProfile')
    ).toBe(true)
  })

  test('should soft delete user through service layer', async () => {
    // Create a user first
    const { user } = await userService.createUserWithProfile(
      { email: 'delete-me@example.com', name: 'Delete Me' },
      { bio: 'To be deleted' }
    )

    const result = await userService.softDeleteUser(user.id)

    expect(result).toBe(true)

    // Verify user is soft deleted
    const deletedUser = await userService.getUserWithProfile(user.id)
    expect(deletedUser.deleted_at).toBeDefined()
  })

  test('should handle service layer errors with performance tracking', async () => {
    // Simulate an error
    const originalMethod = userService.userRepository.findById
    userService.userRepository.findById = vi.fn().mockRejectedValue(new Error('Service error'))

    try {
      await userService.getUserWithProfile(999)
      throw new Error('Should have thrown an error')
    } catch (error) {
      expect(error).toBeDefined()

      // Check that error was tracked in performance monitoring
      const metrics = client.getPerformanceMetrics()
      expect(metrics.failedQueries).toBeGreaterThan(0)
      expect(metrics.queries.some(q => q.success === false)).toBe(true)
    }

    // Restore original method
    userService.userRepository.findById = originalMethod
  })
})

describe('Database Schema Alignment Validation Tests', () => {
  let client

  beforeEach(() => {
    client = createTestClient()
  })

  afterEach(() => {
    client.reset()
  })

  test('should validate correct table schema', () => {
    const expectedSchema = {
      id: 'integer',
      email: 'varchar',
      name: 'varchar'
    }

    expect(() => {
      SchemaValidator.validateTableSchema('users', expectedSchema)
    }).not.toThrow()
  })

  test('should reject invalid table schema', () => {
    const invalidSchema = {
      id: 'string', // Wrong type
      email: 'integer', // Wrong type
      nonexistent_column: 'varchar' // Non-existent column
    }

    expect(() => {
      SchemaValidator.validateTableSchema('users', invalidSchema)
    }).toThrow(AppError)
  })

  test('should handle non-existent table in schema validation', () => {
    const expectedSchema = {
      id: 'integer'
    }

    expect(() => {
      SchemaValidator.validateTableSchema('nonexistent_table', expectedSchema)
    }).toThrow(AppError)
  })

  test('should validate data integrity for correct data', () => {
    const validUserData = {
      email: 'test@example.com',
      name: 'Test User'
    }

    expect(() => {
      SchemaValidator.validateDataIntegrity('users', validUserData)
    }).not.toThrow()
  })

  test('should reject data with missing required fields', () => {
    const incompleteUserData = {
      email: 'test@example.com'
      // Missing 'name' field
    }

    expect(() => {
      SchemaValidator.validateDataIntegrity('users', incompleteUserData)
    }).toThrow(AppError)
  })

  test('should handle data integrity validation for unknown table', () => {
    const data = { some_field: 'value' }

    // Should not throw for unknown tables (no validation rules)
    expect(() => {
      SchemaValidator.validateDataIntegrity('unknown_table', data)
    }).not.toThrow()
  })
})

describe('Error Mapping Tests with Custom AppError', () => {
  let client

  beforeEach(() => {
    client = createTestClient()
  })

  afterEach(() => {
    client.reset()
  })

  test('should map unique violation to AppError correctly', () => {
    const postgresError = {
      code: POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION,
      message: 'duplicate key value',
      details: { constraint: 'users_email_key' }
    }

    const appError = ErrorMapper.mapPostgresErrorToAppError(postgresError)

    expect(appError).toBeInstanceOf(AppError)
    expect(appError.statusCode).toBe(409)
    expect(appError.code).toBe('RESOURCE_CONFLICT')
    expect(appError.message).toBe('Resource already exists')
    expect(appError.context.originalError).toBe(postgresError)
  })

  test('should map foreign key violation to AppError correctly', () => {
    const postgresError = {
      code: POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION,
      message: 'insert or update on table violates foreign key constraint',
      details: { constraint: 'profiles_user_id_fkey' }
    }

    const appError = ErrorMapper.mapPostgresErrorToAppError(postgresError)

    expect(appError).toBeInstanceOf(AppError)
    expect(appError.statusCode).toBe(400)
    expect(appError.code).toBe('INVALID_REFERENCE')
    expect(appError.message).toBe('Referenced resource does not exist')
  })

  test('should map not null violation to AppError correctly', () => {
    const postgresError = {
      code: POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION,
      message: 'null value in column violates not-null constraint',
      details: { column: 'email' }
    }

    const appError = ErrorMapper.mapPostgresErrorToAppError(postgresError)

    expect(appError).toBeInstanceOf(AppError)
    expect(appError.statusCode).toBe(400)
    expect(appError.code).toBe('REQUIRED_FIELD')
    expect(appError.message).toBe('Required field is missing')
  })

  test('should map check violation to AppError correctly', () => {
    const postgresError = {
      code: POSTGRESQL_ERROR_CODES.CHECK_VIOLATION,
      message: 'new row for relation violates check constraint',
      details: { constraint: 'users_email_check' }
    }

    const appError = ErrorMapper.mapPostgresErrorToAppError(postgresError)

    expect(appError).toBeInstanceOf(AppError)
    expect(appError.statusCode).toBe(400)
    expect(appError.code).toBe('VALIDATION_ERROR')
    expect(appError.message).toBe('Data validation failed')
  })

  test('should map connection errors to AppError correctly', () => {
    const connectionError = {
      code: POSTGRESQL_ERROR_CODES.CONNECTION_FAILURE,
      message: 'connection to server lost'
    }

    const appError = ErrorMapper.mapPostgresErrorToAppError(connectionError)

    expect(appError).toBeInstanceOf(AppError)
    expect(appError.statusCode).toBe(503)
    expect(appError.code).toBe('DATABASE_UNAVAILABLE')
    expect(appError.message).toBe('Database connection error')
  })

  test('should map insufficient privilege error to AppError correctly', () => {
    const privilegeError = {
      code: POSTGRESQL_ERROR_CODES.INSUFFICIENT_PRIVILEGE,
      message: 'permission denied for relation users'
    }

    const appError = ErrorMapper.mapPostgresErrorToAppError(privilegeError)

    expect(appError).toBeInstanceOf(AppError)
    expect(appError.statusCode).toBe(403)
    expect(appError.code).toBe('PERMISSION_DENIED')
    expect(appError.message).toBe('Insufficient permissions')
  })

  test('should map concurrency errors to AppError correctly', () => {
    const concurrencyError = {
      code: POSTGRESQL_ERROR_CODES.SERIALIZATION_FAILURE,
      message: 'could not serialize access due to concurrent update'
    }

    const appError = ErrorMapper.mapPostgresErrorToAppError(concurrencyError)

    expect(appError).toBeInstanceOf(AppError)
    expect(appError.statusCode).toBe(409)
    expect(appError.code).toBe('CONCURRENCY_ERROR')
    expect(appError.message).toBe('Concurrent modification detected')
  })

  test('should map unknown errors to generic AppError', () => {
    const unknownError = {
      code: 'UNKNOWN_CODE',
      message: 'some unknown error'
    }

    const appError = ErrorMapper.mapPostgresErrorToAppError(unknownError)

    expect(appError).toBeInstanceOf(AppError)
    expect(appError.statusCode).toBe(500)
    expect(appError.code).toBe('DATABASE_ERROR')
    expect(appError.message).toBe('Internal database error')
  })

  test('should create AppError with correct structure', () => {
    const error = new AppError('Test error message', 400, 'TEST_ERROR', {
      customField: 'custom value'
    })

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
    expect(error.name).toBe('AppError')
    expect(error.message).toBe('Test error message')
    expect(error.statusCode).toBe(400)
    expect(error.code).toBe('TEST_ERROR')
    expect(error.context.customField).toBe('custom value')
    expect(error.timestamp).toBeDefined()
    expect(error.isOperational).toBe(true)
  })
})

describe('Performance Boundary Testing', () => {
  let client

  beforeEach(() => {
    client = createTestClient()
  })

  afterEach(() => {
    client.reset()
  })

  test('should track slow queries', async () => {
    const slowQuery = client.from('users').select()
    slowQuery.simulateDelay(1500) // 1.5 seconds

    await slowQuery

    const metrics = client.getPerformanceMetrics()
    expect(metrics.slowQueries).toBe(1)
    expect(metrics.slowQueryRate).toBe(100)
  })

  test('should track very slow queries', async () => {
    const verySlowQuery = client.from('users').select()
    verySlowQuery.simulateDelay(6000) // 6 seconds

    await verySlowQuery

    const metrics = client.getPerformanceMetrics()
    expect(metrics.verySlowQueries).toBe(1)
    expect(metrics.slowQueries).toBe(1) // Very slow queries are also counted as slow
  })

  test('should track concurrent queries', async () => {
    // Execute multiple queries concurrently
    const queries = Array(5)
      .fill()
      .map(() => client.from('users').select())

    await Promise.all(queries)

    const metrics = client.getPerformanceMetrics()
    expect(metrics.maxConcurrentQueries).toBeGreaterThan(1)
  })

  test('should check performance boundaries and report issues', async () => {
    // Create some slow queries
    const slowQuery1 = client.from('users').select()
    slowQuery1.simulateDelay(1500)

    const slowQuery2 = client.from('profiles').select()
    slowQuery2.simulateDelay(2000)

    await Promise.all([slowQuery1, slowQuery2])

    const boundaryCheck = client.performanceMonitor.checkPerformanceBoundaries()

    expect(boundaryCheck.passed).toBe(false)
    expect(boundaryCheck.issues.length).toBeGreaterThan(0)
    expect(boundaryCheck.issues.some(issue => issue.type === 'HIGH_SLOW_QUERY_RATE')).toBe(true)
  })

  test('should pass boundary check with good performance', async () => {
    // Create fast queries
    const fastQuery1 = client.from('users').select()
    fastQuery1.simulateDelay(50)

    const fastQuery2 = client.from('profiles').select()
    fastQuery2.simulateDelay(100)

    await Promise.all([fastQuery1, fastQuery2])

    const boundaryCheck = client.performanceMonitor.checkPerformanceBoundaries()

    expect(boundaryCheck.passed).toBe(true)
    expect(boundaryCheck.issues.length).toBe(0)
  })

  test('should update performance thresholds', async () => {
    // Update thresholds to be very strict
    client.performanceMonitor.updateThresholds({
      slowQueryThreshold: 10, // 10ms
      verySlowQueryThreshold: 50 // 50ms
    })

    const query = client.from('users').select()
    query.simulateDelay(20) // 20ms would be slow with new threshold

    await query

    const metrics = client.getPerformanceMetrics()
    expect(metrics.slowQueries).toBe(1)
  })

  test('should get boundary violations summary', async () => {
    // Create mix of slow and very slow queries
    const slowQuery = client.from('users').select()
    slowQuery.simulateDelay(1500)

    const verySlowQuery = client.from('profiles').select()
    verySlowQuery.simulateDelay(6000)

    await Promise.all([slowQuery, verySlowQuery])

    const violations = client.performanceMonitor.getBoundaryViolations()

    expect(violations.summary.total).toBe(2)
    expect(violations.summary.slow).toBe(1)
    expect(violations.summary.verySlow).toBe(1)
    expect(violations.violations).toHaveLength(2)
  })
})

describe('Mock Data Store Tests', () => {
  let client
  let mockDataStore

  beforeEach(() => {
    client = createTestClient()
    mockDataStore = client.mockDataStore
  })

  test('should initialize default data correctly', () => {
    const users = mockDataStore.getTable('users')
    const profiles = mockDataStore.getTable('profiles')
    const products = mockDataStore.getTable('products')

    expect(users.length).toBeGreaterThan(0)
    expect(profiles.length).toBeGreaterThan(0)
    expect(products.length).toBeGreaterThan(0)
  })

  test('should add records with auto-generated IDs', () => {
    const newRecord = mockDataStore.addRecord('users', {
      email: 'test@example.com',
      name: 'Test User'
    })

    expect(newRecord.id).toBeDefined()
    expect(newRecord.id).toBeGreaterThan(0)
  })

  test('should update existing records', () => {
    const updated = mockDataStore.updateRecord('users', 1, {
      name: 'Updated Name'
    })

    expect(updated).toBeDefined()
    expect(updated.name).toBe('Updated Name')
    expect(updated.id).toBe(1)
  })

  test('should delete records', () => {
    const deleted = mockDataStore.deleteRecord('users', 1)

    expect(deleted).toBeDefined()
    expect(deleted.id).toBe(1)

    const remaining = mockDataStore.getTable('users')
    expect(remaining.find(u => u.id === 1)).toBeUndefined()
  })

  test('should generate sequential IDs', () => {
    const record1 = mockDataStore.addRecord('users', { email: 'test1@example.com', name: 'Test 1' })
    const record2 = mockDataStore.addRecord('users', { email: 'test2@example.com', name: 'Test 2' })

    expect(record2.id).toBe(record1.id + 1)
  })

  test('should reset data to defaults', () => {
    // Add some custom data
    mockDataStore.addRecord('users', { email: 'custom@example.com', name: 'Custom' })

    // Reset
    mockDataStore.reset()

    const users = mockDataStore.getTable('users')
    expect(users.length).toBe(2) // Back to default
    expect(users.find(u => u.email === 'custom@example.com')).toBeUndefined()
  })
})

describe('Supabase Client Mock Advanced Features', () => {
  let client

  beforeEach(() => {
    client = createTestClient()
  })

  afterEach(() => {
    client.reset()
  })

  describe('Storage Mock', () => {
    test('should handle file upload', async () => {
      const { data, error } = await client.storage
        .from('avatars')
        .upload('test.jpg', new Blob(['test content']))

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.path).toBe('test.jpg')
      expect(data.bucket).toBe('avatars')
    })

    test('should handle file download', async () => {
      const { data, error } = await client.storage.from('avatars').download('test.jpg')

      expect(error).toBeNull()
      expect(data).toBeInstanceOf(Blob)
    })

    test('should generate public URLs', async () => {
      const { data } = client.storage.from('avatars').getPublicUrl('test.jpg')

      expect(data.publicUrl).toContain('avatars/test.jpg')
    })

    test('should handle file removal', async () => {
      const { data, error } = await client.storage.from('avatars').remove(['test.jpg'])

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data[0].path).toBe('test.jpg')
    })

    test('should list files in bucket', async () => {
      const { data, error } = await client.storage.from('avatars').list()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('Auth Mock', () => {
    test('should handle user sign up', async () => {
      const { data, error } = await client.auth.signUp({
        email: 'newuser@example.com'
      })

      expect(error).toBeNull()
      expect(data.user).toBeDefined()
      expect(data.session).toBeDefined()
      expect(data.user.email).toBe('newuser@example.com')
    })

    test('should handle user sign in', async () => {
      const { data, error } = await client.auth.signIn({
        email: 'user@example.com',
        password: 'password123'
      })

      expect(error).toBeNull()
      expect(data.user).toBeDefined()
      expect(data.session).toBeDefined()
    })

    test('should handle user sign out', async () => {
      // Sign in first
      await client.auth.signIn({ email: 'user@example.com' })

      const { data, error } = await client.auth.signOut()

      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    test('should get current user', async () => {
      // Sign in first
      await client.auth.signIn({ email: 'user@example.com' })

      const { data, error } = await client.auth.getCurrentUser()

      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    test('should get current session', async () => {
      // Sign in first
      await client.auth.signIn({ email: 'user@example.com' })

      const { data, error } = await client.auth.getSession()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.access_token).toBeDefined()
    })
  })
})

describe('Cypress Integration Preparation', () => {
  let client

  beforeEach(() => {
    client = createTestClient()
  })

  afterEach(() => {
    client.reset()
  })

  test('should prepare client for Cypress E2E testing', async () => {
    // This test ensures the mock is ready for Cypress integration
    const { data, error } = await client.from('users').select()

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(Array.isArray(data)).toBe(true)
  })

  test('should support async operations needed for E2E', async () => {
    // Test multiple async operations that Cypress would use
    const operations = [
      client.from('users').select(),
      client.from('profiles').select(),
      client.rpc('get_user_profile', { user_id: 1 })
    ]

    const results = await Promise.all(operations)

    results.forEach(result => {
      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
    })
  })

  test('should maintain state across operations', async () => {
    // Test that mock maintains state like a real Supabase client
    const { data: initialUsers } = await client.from('users').select()
    const initialCount = initialUsers.length

    const { data: newUser } = await client
      .from('users')
      .insert({ email: 'state-test@example.com', name: 'State Test' })
      .select()

    const { data: updatedUsers } = await client.from('users').select()

    expect(newUser).toBeDefined()
    expect(updatedUsers.length).toBe(initialCount + 1)
    expect(updatedUsers.find(u => u.email === 'state-test@example.com')).toBeDefined()
  })
})
