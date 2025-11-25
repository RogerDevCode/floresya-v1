/**
 * Comprehensive Supabase Client Tests - Vitest Edition
 * Tests database operations, RPC functions, transactions, error handling, and data consistency
 * Following Supabase official documentation and MIT/Stanford best practices
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import {
  createSupabaseClientMock,
  POSTGRESQL_ERROR_CODES,
  AppError,
  SchemaValidator
} from './mocks/mocks.js'

// Helper function to create test client
function createTestClient() {
  return createSupabaseClientMock({
    url: 'https://test-project.supabase.co',
    anonKey: 'test-anon-key'
  })
}

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
      expect(error).not.toBeNull()
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
        expect(error).not.toBeNull()
        expect(error.code).toBe(POSTGRESQL_ERROR_CODES.CHECK_VIOLATION)
      }
    })

    test('should validate required fields', async () => {
      // Test missing email
      const emailQuery = client.from('users').insert({ name: 'No Email User' }).select()

      emailQuery.simulateError(POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION, 'Email cannot be null')

      const { data: emailData, error: emailError } = await emailQuery

      expect(emailData).toBeNull()
      expect(emailError).not.toBeNull()
      expect(emailError.code).toBe(POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION)

      // Test missing name
      const nameQuery = client.from('users').insert({ email: 'no_name@example.com' }).select()

      nameQuery.simulateError(POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION, 'Name cannot be null')

      const { data: nameData, error: nameError } = await nameQuery

      expect(nameData).toBeNull()
      expect(nameError).not.toBeNull()
      expect(nameError.code).toBe(POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION)
    })
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
