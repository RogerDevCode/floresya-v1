/**
 * Comprehensive Supabase Client Tests - Vitest Edition
 * Tests database operations, RPC functions, transactions, error handling, and data consistency
 * Following Supabase official documentation and MIT/Stanford best practices
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import {
  createSupabaseClientMock
} from './mocks/mocks.js'

// Helper function to create test client
function createTestClient() {
  return createSupabaseClientMock({
    url: 'https://test-project.supabase.co',
    anonKey: 'test-anon-key'
  })
}

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
      expect(error).not.toBeNull()
      expect(error.code).toBe(POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION)
      expect(error.message).toContain('Duplicate key value')
    })

    test('should handle foreign key violation error', async () => {
      const query = client.from('profiles').insert({ user_id: 99999, bio: 'Invalid user' })
      query.simulateError(POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION, 'Foreign key violation')

      const { data, error } = await query.select()

      expect(data).toBeNull()
      expect(error).not.toBeNull()
      expect(error.code).toBe(POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION)
    })

    test('should handle not null violation error', async () => {
      const query = client.from('users').insert({ email: null, name: 'No Email User' })
      query.simulateError(POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION, 'Null value not allowed')

      const { data, error } = await query.select()

      expect(data).toBeNull()
      expect(error).not.toBeNull()
      expect(error.code).toBe(POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION)
    })

    test('should handle check violation error', async () => {
      const query = client.from('users').insert({ email: 'invalid-email', name: 'Invalid Email' })
      query.simulateError(POSTGRESQL_ERROR_CODES.CHECK_VIOLATION, 'Check constraint violated')

      const { data, error } = await query.select()

      expect(data).toBeNull()
      expect(error).not.toBeNull()
      expect(error.code).toBe(POSTGRESQL_ERROR_CODES.CHECK_VIOLATION)
    })

    test('should handle undefined table error', async () => {
      const query = client.from('nonexistent_table').select()
      query.simulateError(POSTGRESQL_ERROR_CODES.UNDEFINED_TABLE, 'Table does not exist')

      const { data, error } = await query

      expect(data).toBeNull()
      expect(error).not.toBeNull()
      expect(error.code).toBe(POSTGRESQL_ERROR_CODES.UNDEFINED_TABLE)
    })

    test('should handle undefined column error', async () => {
      const query = client.from('users').select('nonexistent_column')
      query.simulateError(POSTGRESQL_ERROR_CODES.UNDEFINED_COLUMN, 'Column does not exist')

      const { data, error } = await query

      expect(data).toBeNull()
      expect(error).not.toBeNull()
      expect(error.code).toBe(POSTGRESQL_ERROR_CODES.UNDEFINED_COLUMN)
    })

    test('should handle syntax error', async () => {
      const query = client.from('users').select()
      query.simulateError(POSTGRESQL_ERROR_CODES.SYNTAX_ERROR, 'Syntax error in query')

      const { data, error } = await query

      expect(data).toBeNull()
      expect(error).not.toBeNull()
      expect(error.code).toBe(POSTGRESQL_ERROR_CODES.SYNTAX_ERROR)
    })

    test('should handle insufficient privilege error', async () => {
      const query = client.from('restricted_table').select()
      query.simulateError(POSTGRESQL_ERROR_CODES.INSUFFICIENT_PRIVILEGE, 'Permission denied')

      const { data, error } = await query

      expect(data).toBeNull()
      expect(error).not.toBeNull()
      expect(error.code).toBe(POSTGRESQL_ERROR_CODES.INSUFFICIENT_PRIVILEGE)
    })
  })

  describe('Network and Connection Errors', () => {
    test('should handle connection failure', async () => {
      const query = client.from('users').select()
      query.simulateConnectionError()

      const { data, error } = await query

      expect(data).toBeNull()
      expect(error).not.toBeNull()
      expect(error.message).toContain('Connection failed')
    })

    test('should handle connection timeout', async () => {
      const query = client.from('users').select()
      query.simulateTimeout()

      const { data, error } = await query

      expect(data).toBeNull()
      expect(error).not.toBeNull()
      expect(error.message).toContain('Connection timeout')
    }, 35000) // Increase timeout to 35 seconds

    test('should handle too many connections error', async () => {
      const query = client.from('users').select()
      query.simulateError(POSTGRESQL_ERROR_CODES.TOO_MANY_CONNECTIONS, 'Too many connections')

      const { data, error } = await query

      expect(data).toBeNull()
      expect(error).not.toBeNull()
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
      expect(metrics.queries[0].error).not.toBeNull()
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
    expect(error.timestamp).toEqual(expect.any(String))
    expect(error.isOperational).toBe(true)
  })
})
