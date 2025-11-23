/**
 * User Service Tests - Vitest Edition
 * Comprehensive testing of user service business logic
 * Following KISS principle and Supabase best practices
 */
// @ts-nocheck

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks, createMockRepository, testData } from './setup.js'
import { ValidationError, NotFoundError, BadRequestError } from '../../api/errors/AppError.js'

// Mock DIContainer before importing services
vi.mock('../../api/architecture/di-container.js', () => ({
  default: {
    resolve: vi.fn(),
    register: vi.fn(),
    registerInstance: vi.fn(),
    has: vi.fn(),
    clear: vi.fn()
  }
}))

// Import services after mocks are set up
import {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getUsersByFilter,
  createUser,
  updateUser,
  deleteUser,
  reactivateUser,
  verifyUserEmail
} from '../../api/services/userService.js'

describe('User Service - Business Logic Layer', () => {
  let mockUserRepository
  let mockLogger

  beforeEach(async () => {
    resetAllMocks()

    // Setup specific mocks for this test suite
    mockUserRepository = createMockRepository({
      findAllWithFilters: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      reactivate: vi.fn(),
      verifyEmail: vi.fn()
    })

    mockLogger = {
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn()
    }

    // Setup DIContainer mocks
    const { default: DIContainer } = await import('../../api/architecture/di-container.js')
    DIContainer.resolve.mockImplementation(name => {
      if (name === 'UserRepository') {
        return mockUserRepository
      }
      if (name === 'Logger') {
        return mockLogger
      }
      return createMockRepository()
    })
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('getAllUsers - Retrieve all users with filters', () => {
    test('should return all users when no filters provided', async () => {
      const mockUsers = [testData.users.valid, testData.users.admin]
      mockUserRepository.findAllWithFilters.mockResolvedValue(mockUsers)

      const result = await getAllUsers()

      expect(mockUserRepository.findAllWithFilters).toHaveBeenCalledWith(
        {},
        {
          includeDeactivated: false,
          orderBy: 'created_at',
          ascending: false
        }
      )
      expect(result).toEqual(mockUsers)
    })

    test('should apply filters correctly', async () => {
      const filters = { role: 'admin', active: true }
      const mockUsers = [testData.users.admin]
      mockUserRepository.findAllWithFilters.mockResolvedValue(mockUsers)

      const result = await getAllUsers(filters, true)

      expect(mockUserRepository.findAllWithFilters).toHaveBeenCalledWith(filters, {
        includeDeactivated: true,
        orderBy: 'created_at',
        ascending: false
      })
      expect(result).toEqual(mockUsers)
    })

    test('should handle repository errors gracefully', async () => {
      const error = new Error('Database connection failed')
      mockUserRepository.findAllWithFilters.mockRejectedValue(error)

      await expect(getAllUsers()).rejects.toThrow('Database connection failed')
      expect(mockLogger.error).toHaveBeenCalledWith('getAllUsers failed:', error, {
        filters: {},
        includeDeactivated: false
      })
    })

    test('should return empty array when no users found', async () => {
      mockUserRepository.findAllWithFilters.mockResolvedValue([])

      const result = await getAllUsers()

      expect(result).toEqual([])
    })
  })

  describe('getUserById - Retrieve single user by ID', () => {
    test('should return user when found', async () => {
      mockUserRepository.findById.mockResolvedValue(testData.users.valid)

      const result = await getUserById(1)

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1, false)
      expect(result).toEqual(testData.users.valid)
    })

    test('should include deactivated users when requested', async () => {
      mockUserRepository.findById.mockResolvedValue(testData.users.inactive)

      const result = await getUserById(3, true)

      expect(mockUserRepository.findById).toHaveBeenCalledWith(3, true)
      expect(result).toEqual(testData.users.inactive)
    })

    test('should throw NotFoundError when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null)

      await expect(getUserById(999)).rejects.toThrow(NotFoundError)
      expect(mockUserRepository.findById).toHaveBeenCalledWith(999, false)
    })

    test('should throw BadRequestError for invalid ID type', async () => {
      await expect(getUserById('invalid')).rejects.toThrow(BadRequestError)
    })

    test('should throw BadRequestError for null ID', async () => {
      await expect(getUserById(null)).rejects.toThrow(BadRequestError)
    })
  })

  describe('getUserByEmail - Retrieve user by email address', () => {
    test('should return user when found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(testData.users.valid)

      const result = await getUserByEmail('test@example.com')

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com', false)
      expect(result).toEqual(testData.users.valid)
    })

    test('should include deactivated users when requested', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(testData.users.inactive)

      const result = await getUserByEmail('inactive@example.com', true)

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('inactive@example.com', true)
      expect(result).toEqual(testData.users.inactive)
    })

    test('should throw NotFoundError when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null)

      await expect(getUserByEmail('notfound@example.com')).rejects.toThrow(NotFoundError)
    })

    test('should throw BadRequestError for invalid email', async () => {
      await expect(getUserByEmail('')).rejects.toThrow(BadRequestError)
      await expect(getUserByEmail(null)).rejects.toThrow(BadRequestError)
      await expect(getUserByEmail(123)).rejects.toThrow(BadRequestError)
    })

    test('should throw ValidationError for malformed email', async () => {
      await expect(getUserByEmail('not-an-email')).rejects.toThrow(ValidationError)
      await expect(getUserByEmail('email@')).rejects.toThrow(ValidationError)
      await expect(getUserByEmail('example.com')).rejects.toThrow(ValidationError)
    })
  })

  describe('getUsersByFilter - Advanced filtering with pagination', () => {
    test('should return filtered users with pagination', async () => {
      const filters = { role: 'user', limit: 10, offset: 0 }
      const mockUsers = [testData.users.valid]
      mockUserRepository.findAll.mockResolvedValue(mockUsers)

      const result = await getUsersByFilter(filters)

      expect(mockUserRepository.findAll).toHaveBeenCalledWith(
        { role: 'user' },
        {
          limit: 10,
          offset: 0,
          orderBy: 'created_at',
          ascending: false
        }
      )
      expect(result).toEqual(mockUsers)
    })

    test('should filter by state correctly', async () => {
      const filters = { state: true, limit: 5, offset: 0 }
      const mockUsers = [testData.users.valid, testData.users.admin]
      mockUserRepository.findAll.mockResolvedValue(mockUsers)

      const result = await getUsersByFilter(filters)

      expect(mockUserRepository.findAll).toHaveBeenCalledWith(
        { active: true },
        {
          limit: 5,
          offset: 0,
          orderBy: 'created_at',
          ascending: false
        }
      )
      expect(result).toEqual(mockUsers)
    })

    test('should filter by email verification status', async () => {
      const filters = { email_verified: true, limit: 20, offset: 10 }
      const mockUsers = [testData.users.admin]
      mockUserRepository.findAll.mockResolvedValue(mockUsers)

      const result = await getUsersByFilter(filters)

      expect(mockUserRepository.findAll).toHaveBeenCalledWith(
        { email_verified: true },
        {
          limit: 20,
          offset: 10,
          orderBy: 'created_at',
          ascending: false
        }
      )
      expect(result).toEqual(mockUsers)
    })

    test('should throw BadRequestError when no filters provided', async () => {
      await expect(getUsersByFilter({})).rejects.toThrow(BadRequestError)
    })

    test('should throw BadRequestError when pagination parameters missing', async () => {
      const filters = { role: 'user' }
      await expect(getUsersByFilter(filters)).rejects.toThrow(BadRequestError)
    })

    test('should throw BadRequestError for invalid limit', async () => {
      const filters = { role: 'user', limit: 0, offset: 0 }
      await expect(getUsersByFilter(filters)).rejects.toThrow(BadRequestError)

      const filters2 = { role: 'user', limit: 101, offset: 0 }
      await expect(getUsersByFilter(filters2)).rejects.toThrow(BadRequestError)

      const filters3 = { role: 'user', limit: 'invalid', offset: 0 }
      await expect(getUsersByFilter(filters3)).rejects.toThrow(BadRequestError)
    })

    test('should throw BadRequestError for invalid offset', async () => {
      const filters = { role: 'user', limit: 10, offset: -1 }
      await expect(getUsersByFilter(filters)).rejects.toThrow(BadRequestError)

      const filters2 = { role: 'user', limit: 10, offset: 'invalid' }
      await expect(getUsersByFilter(filters2)).rejects.toThrow(BadRequestError)
    })

    test('should throw NotFoundError when no users found', async () => {
      mockUserRepository.findAll.mockResolvedValue(null)

      const filters = { role: 'user', limit: 10, offset: 0 }
      await expect(getUsersByFilter(filters)).rejects.toThrow(NotFoundError)
    })
  })

  describe('createUser - Create new user', () => {
    test('should create user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        full_name: 'New User',
        phone: '+1234567890',
        role: 'user'
      }
      const createdUser = { ...userData, id: 4, active: true, email_verified: false }
      mockUserRepository.create.mockResolvedValue(createdUser)

      const result = await createUser(userData)

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        full_name: 'New User',
        phone: '+1234567890',
        role: 'user',
        password_hash: null,
        active: true,
        email_verified: false
      })
      expect(result).toEqual(createdUser)
    })

    test('should create admin user with password', async () => {
      const userData = {
        email: 'admin@example.com',
        full_name: 'Admin User',
        role: 'admin',
        password_hash: 'hashedpassword'
      }
      const createdUser = { ...userData, id: 5, active: true, email_verified: false }
      mockUserRepository.create.mockResolvedValue(createdUser)

      const result = await createUser(userData)

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'admin@example.com',
        full_name: 'Admin User',
        phone: null,
        role: 'admin',
        password_hash: 'hashedpassword',
        active: true,
        email_verified: false
      })
      expect(result).toEqual(createdUser)
    })

    test('should throw ValidationError for missing email', async () => {
      const userData = { full_name: 'No Email User' }
      await expect(createUser(userData)).rejects.toThrow(ValidationError)
    })

    test('should throw ValidationError for invalid email format', async () => {
      const userData = { email: 'invalid-email', full_name: 'Invalid Email User' }
      await expect(createUser(userData)).rejects.toThrow(ValidationError)
    })

    test('should throw ValidationError for invalid role', async () => {
      const userData = { email: 'test@example.com', role: 'invalid' }
      await expect(createUser(userData)).rejects.toThrow(ValidationError)
    })

    test('should throw ValidationError for admin without password', async () => {
      const userData = { email: 'admin@example.com', role: 'admin' }
      await expect(createUser(userData)).rejects.toThrow(ValidationError)
    })
  })

  describe('updateUser - Update existing user', () => {
    test('should update user successfully', async () => {
      const updates = { full_name: 'Updated Name', phone: '+0987654321' }
      const updatedUser = { ...testData.users.valid, ...updates }
      mockUserRepository.update.mockResolvedValue(updatedUser)

      const result = await updateUser(1, updates)

      expect(mockUserRepository.update).toHaveBeenCalledWith(1, updates)
      expect(result).toEqual(updatedUser)
    })

    test('should throw BadRequestError for invalid ID', async () => {
      await expect(updateUser('invalid', { full_name: 'Test' })).rejects.toThrow(BadRequestError)
    })

    test('should throw BadRequestError for empty updates', async () => {
      await expect(updateUser(1, {})).rejects.toThrow(BadRequestError)
    })

    test('should throw ValidationError for invalid role', async () => {
      const updates = { role: 'invalid' }
      await expect(updateUser(1, updates)).rejects.toThrow(ValidationError)
    })
  })

  describe('deleteUser - Soft delete user', () => {
    test('should delete user successfully', async () => {
      const deletedUser = { ...testData.users.valid, deleted_at: new Date().toISOString() }
      mockUserRepository.delete.mockResolvedValue(deletedUser)

      const result = await deleteUser(1)

      expect(mockUserRepository.delete).toHaveBeenCalledWith(1)
      expect(result).toEqual(deletedUser)
    })

    test('should throw BadRequestError for invalid ID', async () => {
      await expect(deleteUser(null)).rejects.toThrow(BadRequestError)
    })
  })

  describe('reactivateUser - Reactivate soft-deleted user', () => {
    test('should reactivate user successfully', async () => {
      const reactivatedUser = { ...testData.users.inactive, active: true, deleted_at: null }
      mockUserRepository.reactivate.mockResolvedValue(reactivatedUser)

      const result = await reactivateUser(3)

      expect(mockUserRepository.reactivate).toHaveBeenCalledWith(3)
      expect(result).toEqual(reactivatedUser)
    })

    test('should throw BadRequestError for invalid ID', async () => {
      await expect(reactivateUser('invalid')).rejects.toThrow(BadRequestError)
    })
  })

  describe('verifyUserEmail - Verify user email', () => {
    test('should verify email successfully', async () => {
      const verifiedUser = { ...testData.users.valid, email_verified: true }
      mockUserRepository.verifyEmail.mockResolvedValue(verifiedUser)

      const result = await verifyUserEmail(1)

      expect(mockUserRepository.verifyEmail).toHaveBeenCalledWith(1)
      expect(result).toEqual(verifiedUser)
    })

    test('should throw BadRequestError for invalid ID', async () => {
      await expect(verifyUserEmail(null)).rejects.toThrow(BadRequestError)
    })
  })

  describe('Error Handling - Comprehensive error scenarios', () => {
    test('should handle repository errors with proper logging', async () => {
      const error = new Error('Repository failure')
      mockUserRepository.findAllWithFilters.mockRejectedValue(error)

      await expect(getAllUsers()).rejects.toThrow('Repository failure')
      expect(mockLogger.error).toHaveBeenCalledWith('getAllUsers failed:', error, {
        filters: {},
        includeDeactivated: false
      })
    })

    test('should propagate AppError instances without modification', async () => {
      const appError = new NotFoundError('User', 999)
      mockUserRepository.findAllWithFilters.mockRejectedValue(appError)

      await expect(getAllUsers()).rejects.toThrow(NotFoundError)
      expect(mockLogger.error).toHaveBeenCalledWith('getAllUsers failed:', appError, {
        filters: {},
        includeDeactivated: false
      })
    })

    test('should handle concurrent operations correctly', async () => {
      mockUserRepository.findById.mockImplementation(async id => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return { id, email: `user${id}@example.com` }
      })

      const promises = [getUserById(1), getUserById(2), getUserById(3)]
      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      expect(results[0].id).toBe(1)
      expect(results[1].id).toBe(2)
      expect(results[2].id).toBe(3)
    })
  })

  describe('Input Validation - Edge cases and boundary conditions', () => {
    test('should handle null and undefined inputs gracefully', async () => {
      await expect(getUserById(null)).rejects.toThrow(BadRequestError)
      await expect(getUserById(undefined)).rejects.toThrow(BadRequestError)
      await expect(getUserByEmail(null)).rejects.toThrow(BadRequestError)
      await expect(getUserByEmail(undefined)).rejects.toThrow(BadRequestError)
    })

    test('should handle extremely long inputs', async () => {
      const longEmail = 'a'.repeat(200) + '@example.com'
      mockUserRepository.findByEmail.mockResolvedValue({ id: 1, email: longEmail })

      const result = await getUserByEmail(longEmail)
      expect(result.email).toBe(longEmail)
    })

    test('should handle special characters in inputs', async () => {
      const specialEmail = 'test+tag@example.com'
      mockUserRepository.findByEmail.mockResolvedValue({ id: 1, email: specialEmail })

      const result = await getUserByEmail(specialEmail)
      expect(result.email).toBe(specialEmail)
    })

    test('should handle Unicode characters in names', async () => {
      const unicodeName = 'José María ñoño'
      const userData = { email: 'unicode@example.com', full_name: unicodeName }
      const createdUser = { ...userData, id: 6, active: true, email_verified: false }
      mockUserRepository.create.mockResolvedValue(createdUser)

      const result = await createUser(userData)
      expect(result.full_name).toBe(unicodeName)
    })
  })
})
