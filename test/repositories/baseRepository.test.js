/**
 * Base Repository Tests - Vitest Edition
 * Comprehensive testing of base repository CRUD operations
 * Following KISS principle and Supabase best practices
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks, createMockSupabase, mockErrors } from './setup.js'
import { BaseRepository } from '../../api/repositories/BaseRepository.js'

// Mock Supabase client
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: createMockSupabase(),
  DB_SCHEMA: {
    users: { table: 'users' },
    orders: { table: 'orders' }
  }
}))

describe('Base Repository - CRUD Operations', () => {
  let mockSupabase
  let repository

  beforeEach(async () => {
    resetAllMocks()

    mockSupabase = createMockSupabase()

    // Mock the supabase import
    const supabaseModule = await import('../../api/services/supabaseClient.js')
    supabaseModule.supabase = mockSupabase

    repository = new BaseRepository(mockSupabase, 'test_table')
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('create - Insert new record', () => {
    test('should create record successfully', async () => {
      const newData = { name: 'Test Item', active: true }
      const createdRecord = { id: 1, ...newData, created_at: '2024-01-01T00:00:00Z' }

      const mockQuery = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        insert: mockQuery,
        select: mockQuery,
        single: vi.fn().mockResolvedValue({ data: createdRecord, error: null })
      })

      const result = await repository.create(newData)

      expect(mockSupabase.from).toHaveBeenCalledWith('test_table')
      expect(mockQuery).toHaveBeenCalledWith(newData)
      expect(result).toEqual(createdRecord)
    })

    test('should handle database errors during creation', async () => {
      const newData = { name: 'Test Item' }

      const mockQuery = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        insert: mockQuery,
        select: mockQuery,
        single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.uniqueViolation })
      })

      await expect(repository.create(newData)).rejects.toThrow('Duplicate entry in test_table')
    })
  })

  describe('findById - Retrieve record by ID', () => {
    test('should return record when found', async () => {
      const mockRecord = { id: 1, name: 'Test Item', active: true }

      const mockQuery = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        select: mockQuery,
        eq: mockQuery,
        single: vi.fn().mockResolvedValue({ data: mockRecord, error: null })
      })

      const result = await repository.findById(1)

      expect(mockSupabase.from).toHaveBeenCalledWith('test_table')
      expect(mockQuery).toHaveBeenCalledWith('*')
      expect(mockQuery).toHaveBeenCalledWith('id', 1)
      expect(mockQuery).toHaveBeenCalledWith('active', true)
      expect(result).toEqual(mockRecord)
    })

    test('should return null when record not found', async () => {
      const mockQuery = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        select: mockQuery,
        eq: mockQuery,
        single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notFound })
      })

      const result = await repository.findById(999)

      expect(result).toBeNull()
    })

    test('should include inactive records when requested', async () => {
      const mockRecord = { id: 1, name: 'Test Item', active: false }

      const mockQuery = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        select: mockQuery,
        eq: mockQuery,
        single: vi.fn().mockResolvedValue({ data: mockRecord, error: null })
      })

      const result = await repository.findById(1, true)

      expect(mockQuery).not.toHaveBeenCalledWith('active', true)
      expect(result).toEqual(mockRecord)
    })

    test('should handle database errors', async () => {
      const mockQuery = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        select: mockQuery,
        eq: mockQuery,
        single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.generic })
      })

      await expect(repository.findById(1)).rejects.toThrow('Database error in test_table.findById')
    })
  })

  describe('findAll - Retrieve all records with filters', () => {
    test('should return all records without filters', async () => {
      const mockRecords = [
        { id: 1, name: 'Item 1', active: true },
        { id: 2, name: 'Item 2', active: true }
      ]

      // Mock the entire query chain
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockRecords, error: null })
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      })

      const result = await repository.findAll()

      expect(result).toEqual(mockRecords)
    })

    test('should apply role filter', async () => {
      const filters = { role: 'admin' }
      const mockRecords = [{ id: 1, name: 'Admin Item', role: 'admin', active: true }]

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockRecords, error: null })
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      })

      const result = await repository.findAll(filters)

      expect(result).toEqual(mockRecords)
    })

    test('should apply search filter', async () => {
      const filters = { search: 'test' }
      const mockRecords = [{ id: 1, name: 'Test Item', active: true }]

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockRecords, error: null })
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      })

      const result = await repository.findAll(filters)

      expect(result).toEqual(mockRecords)
    })

    test('should apply sorting and pagination', async () => {
      const filters = {}
      const options = { orderBy: 'name', ascending: true, limit: 10, offset: 5 }
      const mockRecords = [{ id: 1, name: 'Test Item', active: true }]

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockRecords, error: null })
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      })

      const result = await repository.findAll(filters, options)

      expect(result).toEqual(mockRecords)
    })

    test('should include deactivated records when specified', async () => {
      const filters = { includeDeactivated: true }
      const mockRecords = [
        { id: 1, name: 'Active Item', active: true },
        { id: 2, name: 'Inactive Item', active: false }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockRecords, error: null })
        })
      })

      const result = await repository.findAll(filters)

      expect(result).toEqual(mockRecords)
    })
  })

  describe('update - Update existing record', () => {
    test('should update record successfully', async () => {
      const updateData = { name: 'Updated Item' }
      const updatedRecord = {
        id: 1,
        name: 'Updated Item',
        active: true,
        updated_at: '2024-01-02T00:00:00Z'
      }

      const mockQuery = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        update: mockQuery,
        eq: mockQuery,
        select: mockQuery,
        single: vi.fn().mockResolvedValue({ data: updatedRecord, error: null })
      })

      const result = await repository.update(1, updateData)

      expect(mockSupabase.from).toHaveBeenCalledWith('test_table')
      expect(mockQuery).toHaveBeenCalledWith({
        ...updateData,
        updated_at: expect.any(String)
      })
      expect(result).toEqual(updatedRecord)
    })

    test('should handle update errors', async () => {
      const updateData = { name: 'Updated Item' }

      const mockQuery = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        update: mockQuery,
        eq: mockQuery,
        select: mockQuery,
        single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notNullViolation })
      })

      await expect(repository.update(1, updateData)).rejects.toThrow(
        'Required field missing in test_table'
      )
    })
  })

  describe('delete - Soft delete record', () => {
    test('should soft delete record successfully', async () => {
      const auditInfo = { deletedBy: 1, reason: 'Test deletion' }
      const deletedRecord = {
        id: 1,
        name: 'Deleted Item',
        active: false,
        deleted_at: '2024-01-02T00:00:00Z',
        deleted_by: 1,
        deletion_reason: 'Test deletion'
      }

      const mockQuery = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        update: mockQuery,
        eq: mockQuery,
        select: mockQuery,
        single: vi.fn().mockResolvedValue({ data: deletedRecord, error: null })
      })

      const result = await repository.delete(1, auditInfo)

      expect(mockQuery).toHaveBeenCalledWith({
        active: false,
        deleted_at: expect.any(String),
        deleted_by: 1,
        deletion_reason: 'Test deletion',
        deletion_ip: null
      })
      expect(result).toEqual(deletedRecord)
    })

    test('should handle delete when record not found', async () => {
      const mockQuery = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        update: mockQuery,
        eq: mockQuery,
        select: mockQuery,
        single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notFound })
      })

      await expect(repository.delete(999)).rejects.toThrow('test_table not found')
    })
  })

  describe('reactivate - Reactivate soft-deleted record', () => {
    test('should reactivate record successfully', async () => {
      const reactivatedRecord = {
        id: 1,
        name: 'Reactivated Item',
        active: true,
        deleted_at: null,
        reactivated_at: '2024-01-03T00:00:00Z',
        reactivated_by: 2
      }

      const mockQuery = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        update: mockQuery,
        eq: mockQuery,
        select: mockQuery,
        single: vi.fn().mockResolvedValue({ data: reactivatedRecord, error: null })
      })

      const result = await repository.reactivate(1, 2)

      expect(mockQuery).toHaveBeenCalledWith({
        active: true,
        deleted_at: null,
        deleted_by: null,
        deletion_reason: null,
        deletion_ip: null,
        reactivated_at: expect.any(String),
        reactivated_by: 2
      })
      expect(result).toEqual(reactivatedRecord)
    })

    test('should handle reactivation of already active record', async () => {
      const mockQuery = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        update: mockQuery,
        eq: mockQuery,
        select: mockQuery,
        single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notFound })
      })

      await expect(repository.reactivate(1)).rejects.toThrow('test_table already active')
    })
  })

  describe('exists - Check if record exists', () => {
    test('should return true when record exists', async () => {
      const criteria = { email: 'test@example.com' }

      const mockQuery = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        select: mockQuery,
        eq: vi.fn().mockResolvedValue({ count: 1, error: null })
      })

      const result = await repository.exists(criteria)

      expect(result).toBe(true)
      expect(mockQuery).toHaveBeenCalledWith('id', { count: 'exact', head: true })
    })

    test('should return false when record does not exist', async () => {
      const criteria = { email: 'nonexistent@example.com' }

      const mockQuery = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        select: mockQuery,
        eq: vi.fn().mockResolvedValue({ count: 0, error: null })
      })

      const result = await repository.exists(criteria)

      expect(result).toBe(false)
    })
  })

  describe('count - Count records with filters', () => {
    test('should count records successfully', async () => {
      const filters = { active: true }

      const mockQuery = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        select: mockQuery,
        eq: vi.fn().mockResolvedValue({ count: 5, error: null })
      })

      const result = await repository.count(filters)

      expect(result).toBe(5)
      expect(mockQuery).toHaveBeenCalledWith('*', { count: 'exact', head: true })
    })

    test('should handle count errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({ count: null, error: mockErrors.generic })
      })

      await expect(repository.count()).rejects.toThrow('Database error in test_table.count')
    })
  })

  describe('Error Handling - Comprehensive error scenarios', () => {
    test('should handle unique violation errors', async () => {
      const mockQuery = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        insert: mockQuery,
        select: mockQuery,
        single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.uniqueViolation })
      })

      await expect(repository.create({ name: 'duplicate' })).rejects.toThrow(
        'Duplicate entry in test_table'
      )
    })

    test('should handle foreign key violation errors', async () => {
      const mockQuery = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        insert: mockQuery,
        select: mockQuery,
        single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.foreignKeyViolation })
      })

      await expect(repository.create({ name: 'invalid ref' })).rejects.toThrow(
        'Referenced record not found in test_table'
      )
    })

    test('should handle not null violation errors', async () => {
      const mockQuery = vi.fn().mockReturnThis()
      mockSupabase.from.mockReturnValue({
        update: mockQuery,
        eq: mockQuery,
        select: mockQuery,
        single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notNullViolation })
      })

      await expect(repository.update(1, { name: null })).rejects.toThrow(
        'Required field missing in test_table'
      )
    })
  })
})
