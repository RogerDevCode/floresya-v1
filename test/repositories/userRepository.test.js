/**
 * User Repository Tests - Vitest Edition
 * Comprehensive testing of user repository operations
 * Following KISS principle and Supabase best practices
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks, createMockSupabase, testData, mockErrors } from './setup.js'
import { UserRepository } from '../../api/repositories/UserRepository.js'

// Mock Supabase client
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: createMockSupabase(),
  DB_SCHEMA: {
    users: { table: 'users' }
  }
}))

// Mock SchemaValidationService
vi.mock('../../api/architecture/schema-validation-service.js', () => ({
  createSchemaValidationService: vi.fn(() => ({
    getSoftDeleteValidation: vi.fn().mockResolvedValue({
      tableExists: true,
      canPerformSoftDelete: true,
      hasFullAuditSupport: true,
      hasReactivationSupport: true,
      missingColumns: [],
      existingColumns: [
        'active',
        'deleted_at',
        'deleted_by',
        'deletion_reason',
        'deletion_ip',
        'reactivated_at',
        'reactivated_by'
      ]
    })
  })),
  SchemaValidationError: class SchemaValidationError extends Error {}
}))

describe('User Repository - User-specific Operations', () => {
  let mockSupabase
  let repository

  beforeEach(async () => {
    resetAllMocks()

    mockSupabase = createMockSupabase()

    repository = new UserRepository(mockSupabase)
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('findByEmail - Find user by email', () => {
    test('should return user when found', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: testData.users.active, error: null })
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      })

      const result = await repository.findByEmail('user@example.com')

      expect(mockSupabase.from).toHaveBeenCalledWith('users')
      expect(mockQuery.eq).toHaveBeenCalledWith('email', 'user@example.com')
      expect(mockQuery.eq).toHaveBeenCalledWith('active', true)
      expect(result).toEqual(testData.users.active)
    })

    test('should return null when user not found', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notFound })
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      })

      const result = await repository.findByEmail('nonexistent@example.com')

      expect(result).toBeNull()
    })

    test('should include inactive users when requested', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: testData.users.inactive, error: null })
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      })

      const result = await repository.findByEmail('inactive@example.com', true)

      expect(mockQuery.eq).not.toHaveBeenCalledWith('active', true)
      expect(result).toEqual(testData.users.inactive)
    })
  })

  describe('findAllWithFilters - Find users with filters', () => {
    test('should apply role filter', async () => {
      const filters = { role: 'admin' }
      const mockUsers = [testData.users.admin]

      // Mock the entire query chain properly
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockUsers, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockUsers)
    })

    test('should apply email_verified filter', async () => {
      const filters = { email_verified: true }
      const mockUsers = [testData.users.active]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockUsers, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockUsers)
    })

    test('should apply search filter', async () => {
      const filters = { search: 'john' }
      const mockUsers = [testData.users.active]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
        range: vi.fn().mockResolvedValue({ data: mockUsers, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockUsers)
    })
  })

  describe('findByFilter - Find users with state filter', () => {
    test('should filter by active state', async () => {
      const filters = { state: true, offset: 0, limit: 10 }
      const mockUsers = [testData.users.active]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({ data: mockUsers, error: null })
          })
        })
      })

      const result = await repository.findByFilter(filters)

      expect(result).toEqual(mockUsers)
    })

    test('should filter by inactive state', async () => {
      const filters = { state: false, offset: 0, limit: 10 }
      const mockUsers = [testData.users.inactive]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({ data: mockUsers, error: null })
          })
        })
      })

      const result = await repository.findByFilter(filters)

      expect(result).toEqual(mockUsers)
    })
  })

  describe('createWithReactivation - Create or reactivate user', () => {
    test('should create new user when email does not exist', async () => {
      const userData = {
        email: 'new@example.com',
        password_hash: 'hashed_password',
        full_name: 'New User'
      }

      // Mock existing user check - no existing user
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
            })
          })
        })
        .mockReturnValueOnce({
          // Mock create call
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 3, ...userData }, error: null })
            })
          })
        })

      const result = await repository.createWithReactivation(userData)

      expect(result).toEqual({ id: 3, ...userData })
    })

    test('should reactivate inactive user', async () => {
      const userData = {
        email: 'inactive@example.com',
        password_hash: 'hashed_password',
        full_name: 'Jane Doe'
      }

      const reactivatedUser = { ...testData.users.inactive, active: true }

      // Mock existing inactive user
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: testData.users.inactive, error: null })
          })
        })
      })

      // Mock reactivate call
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: reactivatedUser, error: null })
              })
            })
          })
        })
      })

      const result = await repository.createWithReactivation(userData)

      expect(result).toEqual(reactivatedUser)
    })

    test('should throw ConflictError for active existing user', async () => {
      const userData = {
        email: 'user@example.com',
        password_hash: 'hashed_password',
        full_name: 'John Doe'
      }

      // Mock existing active user
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: testData.users.active, error: null })
          })
        })
      })

      await expect(repository.createWithReactivation(userData)).rejects.toThrow(
        'User with this email already exists'
      )
    })
  })

  describe('verifyEmail - Verify user email', () => {
    test('should verify email successfully', async () => {
      const verifiedUser = { ...testData.users.active, email_verified: true }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: verifiedUser, error: null })
            })
          })
        })
      })

      const result = await repository.verifyEmail(1)

      expect(result).toEqual(verifiedUser)
    })
  })

  describe('getAuditHistory - Get user audit history', () => {
    test('should return audit history', async () => {
      const auditData = {
        id: 1,
        deleted_at: null,
        deleted_by: null,
        deletion_reason: null,
        deletion_ip: null,
        reactivated_at: null,
        reactivated_by: null
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: auditData, error: null })
          })
        })
      })

      const result = await repository.getAuditHistory(1)

      expect(result).toEqual(auditData)
    })
  })

  describe('hasPermission - Check user permissions', () => {
    test('should return true for sufficient permissions', () => {
      const adminUser = testData.users.admin
      const result = repository.hasPermission(adminUser, 'user')
      expect(result).toBe(true)
    })

    test('should return false for insufficient permissions', () => {
      const regularUser = testData.users.active
      const result = repository.hasPermission(regularUser, 'super_admin')
      expect(result).toBe(false)
    })
  })

  describe('findByRole - Find users by role', () => {
    test('should return users with specified role', async () => {
      const mockUsers = [testData.users.admin]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockUsers, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findByRole('admin')

      expect(mockQuery.eq).toHaveBeenCalledWith('role', 'admin')
      expect(result).toEqual(mockUsers)
    })

    test('should include inactive users when requested', async () => {
      const mockUsers = [testData.users.admin, { ...testData.users.admin, active: false }]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockUsers, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findByRole('admin', true)

      expect(mockQuery.eq).not.toHaveBeenCalledWith('active', true)
      expect(result).toEqual(mockUsers)
    })
  })

  describe('findByEmailVerificationStatus - Find users by email verification', () => {
    test('should return verified users', async () => {
      const mockUsers = [testData.users.active]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockUsers, error: null })
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await repository.findByEmailVerificationStatus(true)

      expect(mockQuery.eq).toHaveBeenCalledWith('email_verified', true)
      expect(result).toEqual(mockUsers)
    })
  })

  describe('searchUsers - Search users by term', () => {
    test('should search users by term', async () => {
      const searchTerm = 'john'
      const mockUsers = [testData.users.active]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockUsers, error: null })
              })
            })
          })
        })
      })

      const result = await repository.searchUsers(searchTerm)

      expect(result).toEqual(mockUsers)
    })
  })

  describe('updateLastAccess - Update user last access', () => {
    test('should update last access timestamp', async () => {
      const updatedUser = { ...testData.users.active, last_access: '2024-01-02T00:00:00Z' }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedUser, error: null })
            })
          })
        })
      })

      const result = await repository.updateLastAccess(1)

      expect(result).toEqual(updatedUser)
    })
  })

  describe('getStats - Get user statistics', () => {
    test('should return user statistics', async () => {
      const mockUsers = [testData.users.active, testData.users.inactive, testData.users.admin]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockUsers, error: null })
      })

      const result = await repository.getStats()

      expect(result.total).toBe(3)
      expect(result.active).toBe(2)
      expect(result.verified).toBe(2)
      expect(result.byRole.user).toBe(2)
      expect(result.byRole.admin).toBe(1)
    })
  })
})
