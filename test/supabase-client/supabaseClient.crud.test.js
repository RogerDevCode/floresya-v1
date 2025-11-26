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
      expect(usersTable.length).toBe(5) // Enhanced mock data with 5 users
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
      // Verify additional users exist
      expect(usersTable[2]).toMatchObject({
        id: 3,
        email: 'inactive@example.com',
        active: false,
        email_verified: true
      })
      expect(usersTable[3]).toMatchObject({
        id: 4,
        email: 'unverified@example.com',
        active: true,
        email_verified: false
      })
      expect(usersTable[4]).toMatchObject({
        id: 5,
        email: 'admin2@example.com',
        role: 'admin',
        active: true,
        email_verified: true
      })
    })

    test('should fetch all records from users table', async () => {
      const { data, error } = await client.from('users').select()

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(5) // Enhanced mock data with 5 users

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
      // Verify additional users
      expect(data[2]).toMatchObject({
        id: 3,
        email: 'inactive@example.com',
        full_name: 'Inactive User',
        role: 'user',
        active: false,
        email_verified: true
      })
      expect(data[3]).toMatchObject({
        id: 4,
        email: 'unverified@example.com',
        full_name: 'Unverified User',
        role: 'user',
        active: true,
        email_verified: false
      })
      expect(data[4]).toMatchObject({
        id: 5,
        email: 'admin2@example.com',
        full_name: 'Admin Two',
        role: 'admin',
        active: true,
        email_verified: true
      })
    })

    test('should fetch records with specific columns', async () => {
      const { data, error } = await client.from('users').select('id, email')

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(5) // Enhanced mock data with 5 users

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

      // Verify exact values for all users
      expect(data[0]).toEqual({ id: 1, email: 'user1@example.com' })
      expect(data[1]).toEqual({ id: 2, email: 'user2@example.com' })
      expect(data[2]).toEqual({ id: 3, email: 'inactive@example.com' })
      expect(data[3]).toEqual({ id: 4, email: 'unverified@example.com' })
      expect(data[4]).toEqual({ id: 5, email: 'admin2@example.com' })
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
      expect(data).toBeNull()
    })

    test('should throw error with single() when no results found', async () => {
      const { data, error } = await client.from('users').select().eq('id', 999).single()

      expect(data).toBeNull()
      expect(error).not.toBeNull()
      expect(error.code).toBe('PGRST116') // Supabase error code for no rows
      expect(error.message).toContain('No rows returned')
    })

    test('should throw error with single() when multiple results found', async () => {
      // This test would require mocking data that returns multiple rows for a single() call
      // For now, we'll test the current implementation
      const { data, error } = await client.from('users').select().gte('id', 1).single()

      expect(data).toBeNull()
      expect(error).not.toBeNull()
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
      expect(data.length).toBe(4) // Should be 4 records (all users except id 1)
      expect(data[0]).toMatchObject({
        id: 2,
        email: 'user2@example.com',
        full_name: 'User Two',
        role: 'admin'
      })
      // Verify no record has id 1
      expect(data.every(user => user.id !== 1)).toBe(true)
      // Verify all expected users are present
      const ids = data.map(u => u.id).sort()
      expect(ids).toEqual([2, 3, 4, 5])
    })

    test('should filter records with gt operator', async () => {
      const { data, error } = await client.from('users').select().gt('id', 1)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(4) // Should be 4 records (users with ids 2, 3, 4, 5)
      expect(data.every(user => user.id > 1)).toBe(true)
      // Verify all expected IDs are present
      const ids = data.map(u => u.id).sort()
      expect(ids).toEqual([2, 3, 4, 5])
    })

    test('should filter records with gte operator', async () => {
      const { data, error } = await client.from('users').select().gte('id', 1)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(5) // Should return all 5 users
      expect(data.every(user => user.id >= 1)).toBe(true)
      // Verify specific ids are included
      expect(data.map(user => user.id).sort()).toEqual([1, 2, 3, 4, 5])
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
      expect(data.length).toBe(2) // Should return both users with id 1 and 2
      expect(data.every(user => user.id <= 2)).toBe(true)
    })

    test('should filter records with like operator', async () => {
      const { data, error } = await client.from('users').select().like('email', '%example.com')

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(5) // All 5 users should match
      expect(data.every(user => user.email.includes('example.com'))).toBe(true)
      // Verify all specific emails are included
      expect(data.map(user => user.email).sort()).toEqual([
        'admin2@example.com',
        'inactive@example.com',
        'unverified@example.com',
        'user1@example.com',
        'user2@example.com'
      ])
    })

    test('should filter records with ilike operator (case insensitive)', async () => {
      const { data, error } = await client.from('users').select().ilike('email', '%EXAMPLE.COM')

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(5) // All 5 users should match due to case-insensitive
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
      expect(data.length).toBe(5)
      // Verify ascending order
      expect(data[0].id).toBeLessThan(data[1].id)
      expect(data.map(user => user.id)).toEqual([1, 2, 3, 4, 5])
      // Verify content is preserved
      expect(data[0].email).toBe('user1@example.com')
      expect(data[1].email).toBe('user2@example.com')
      expect(data[2].email).toBe('inactive@example.com')
      expect(data[3].email).toBe('unverified@example.com')
      expect(data[4].email).toBe('admin2@example.com')
    })

    test('should order records descending', async () => {
      const { data, error } = await client.from('users').select().order('id', { ascending: false })

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(5)
      // Verify descending order
      expect(data[0].id).toBeGreaterThan(data[1].id)
      expect(data.map(user => user.id)).toEqual([5, 4, 3, 2, 1])
      // Verify content is preserved
      expect(data[0].email).toBe('admin2@example.com')
      expect(data[1].email).toBe('unverified@example.com')
      expect(data[2].email).toBe('inactive@example.com')
      expect(data[3].email).toBe('user2@example.com')
      expect(data[4].email).toBe('user1@example.com')
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
        id: 5,
        email: 'admin2@example.com'
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
      expect(data).not.toBeNull()
      expect(data.id).toBe(1)
      expect(data.profiles).toEqual(expect.any(Array))
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
      expect(data).not.toBeNull()
      expect(data.id).toBe(1)
      expect(data.product_images).toEqual(expect.any(Array))
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
      expect(data).not.toBeNull()
      expect(data.product_occasions).toEqual(expect.any(Array))
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
      expect(data).not.toBeNull()
      expect(data.order_items).toEqual(expect.any(Array))
      expect(data.payments).not.toBeNull()
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
        id: 6, // Next available ID after 5 existing users
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
      expect(data[0].id).toBeGreaterThan(5)
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
        id: 6,
        email: 'batch1@example.com',
        full_name: 'Batch User One',
        role: 'user'
      })

      expect(data[1]).toMatchObject({
        id: 7,
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
      expect(result1.data[0].id).toBe(6) // After existing 5 users
      expect(result2.data[0].id).toBe(7) // After the previous insert
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
      expect(error).not.toBeNull()
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
      expect(data.length).toBe(5) // All 5 users should be updated

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
      expect(data.length).toBe(2) // Users 1 and 4 should match both conditions (role='user' and active=true)
      expect(data.every(user => user.role === 'verified')).toBe(true)
      // Verify specific users were updated
      const updatedIds = data.map(u => u.id).sort()
      expect(updatedIds).toEqual([1, 4])
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
      expect(error).not.toBeNull()
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
      expect(remainingUsers.length).toBe(4) // 4 users should remain (2, 3, 4, 5)
    })

    test('should delete multiple records matching filter', async () => {
      const { data, error } = await client.from('users').delete().gte('id', 1).select()

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(5) // All 5 users should be deleted

      // Verify all deleted records are returned
      data.forEach(user => {
        expect(user).toMatchObject({
          id: expect.any(Number),
          email: expect.stringMatching(/@example\.com$/)
        })
      })

      // Verify specific emails (all users)
      const emails = data.map(u => u.email).sort()
      expect(emails).toEqual([
        'admin2@example.com',
        'inactive@example.com',
        'unverified@example.com',
        'user1@example.com',
        'user2@example.com'
      ])

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
      expect(users.length).toBe(5) // Should still have the original 5 users
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
      expect(data.length).toBe(2) // Users 1 and 4 should match (role='user' and active=true)

      // Verify the deleted users
      const deletedIds = data.map(u => u.id).sort()
      expect(deletedIds).toEqual([1, 4])

      // Verify remaining users (user 2, 3, 5 remain: 2 and 5 are admins, 3 is inactive)
      const remainingUsers = client.mockDataStore.getTable('users')
      expect(remainingUsers.length).toBe(3)
      const remainingIds = remainingUsers.map(u => u.id).sort()
      expect(remainingIds).toEqual([2, 3, 5])
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
      expect(error).not.toBeNull()
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
      expect(data).not.toBeNull()
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
      expect(data).not.toBeNull()
      expect(data.length).toBeLessThanOrEqual(5)

      // Verify descending order
      for (let i = 0; i < data.length - 1; i++) {
        expect(data[i].id).toBeGreaterThanOrEqual(data[i + 1].id)
      }
    })
  })
})
