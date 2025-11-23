/**
 * Procesado por B
 */
// @ts-nocheck

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
} from '../../controllers/userController.js'

// Mock dependencies
vi.mock('../../services/userService.js', () => ({
  getAllUsers: vi.fn(),
  getUserById: vi.fn(),
  getUserByEmail: vi.fn(),
  getUsersByFilter: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  reactivateUser: vi.fn(),
  verifyUserEmail: vi.fn()
}))

vi.mock('../../services/validation/ValidatorService.js', () => ({
  ValidatorService: {
    validateId: vi.fn(),
    validateEmail: vi.fn(),
    validatePagination: vi.fn()
  }
}))

vi.mock('../../middleware/error/index.js', () => ({
  asyncHandler: vi.fn(fn => fn)
}))

vi.mock('../../errors/AppError.js', () => ({
  BadRequestError: class BadRequestError extends Error {
    constructor(message, context = {}) {
      super(message)
      this.name = 'BadRequestError'
      this.context = context
    }
  },
  UnauthorizedError: class UnauthorizedError extends Error {
    constructor(message, context = {}) {
      super(message)
      this.name = 'UnauthorizedError'
      this.context = context
    }
  }
}))

import * as userService from '../../services/userService.js'
import { ValidatorService } from '../../services/validation/ValidatorService.js'

// Mock response and request objects
const mockResponse = () => {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

const mockRequest = (overrides = {}) => ({
  query: {},
  params: {},
  body: {},
  user: null,
  ...overrides
})

describe('User Controller - Unit Tests with DI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getAllUsers', () => {
    it('should get all users successfully with admin access', async () => {
      const req = mockRequest({
        query: { search: 'john', role: 'user', email_verified: 'true' },
        user: { user_metadata: { role: 'admin' }, role: 'admin' }
      })
      const res = mockResponse()
      const mockUsers = [
        { id: 1, email: 'john@example.com', role: 'user' },
        { id: 2, email: 'jane@example.com', role: 'user' }
      ]

      userService.getAllUsers.mockResolvedValue(mockUsers)

      await getAllUsers(req, res)

      expect(userService.getAllUsers).toHaveBeenCalledWith(
        { search: 'john', role: 'user', email_verified: 'true' },
        true // includeDeactivated for admin
      )
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
        message: 'Users retrieved successfully'
      })
    })

    it('should get all users with pagination', async () => {
      const req = mockRequest({
        query: { limit: '10', offset: '0', search: 'test' },
        user: { user_metadata: { role: 'admin' }, role: 'admin' }
      })
      const res = mockResponse()
      const mockUsers = [{ id: 1, email: 'test@example.com' }]

      userService.getAllUsers.mockResolvedValue(mockUsers)

      await getAllUsers(req, res)

      expect(userService.getAllUsers).toHaveBeenCalledWith(
        { search: 'test', limit: 10, offset: 0 },
        true
      )
    })

    it('should throw error for invalid offset', async () => {
      const req = mockRequest({
        query: { limit: '10', offset: '-1' },
        user: { user_metadata: { role: 'admin' } }
      })
      const res = mockResponse()

      await expect(getAllUsers(req, res)).rejects.toThrow(
        'Invalid offset: must be a non-negative number'
      )
    })

    it('should throw error when user is not authenticated', async () => {
      const req = mockRequest({ user: null })
      const res = mockResponse()

      await expect(getAllUsers(req, res)).rejects.toThrow('Authentication required')
    })

    it('should throw error when user is not admin', async () => {
      const req = mockRequest({
        user: { user_metadata: { role: 'user' }, role: 'user' }
      })
      const res = mockResponse()

      await expect(getAllUsers(req, res)).rejects.toThrow('Admin access required to view all users')
    })

    it('should handle service errors', async () => {
      const req = mockRequest({
        user: { user_metadata: { role: 'admin' } }
      })
      const res = mockResponse()
      const error = new Error('Database error')

      userService.getAllUsers.mockRejectedValue(error)

      await expect(getAllUsers(req, res)).rejects.toThrow('Database error')
    })
  })

  describe('getUserById', () => {
    it('should get user by ID successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        user: { user_metadata: { role: 'admin' } }
      })
      const res = mockResponse()
      const mockUser = { id: 1, email: 'user@example.com', role: 'user' }

      ValidatorService.validateId.mockReturnValue(1)
      userService.getUserById.mockResolvedValue(mockUser)

      await getUserById(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'userId')
      expect(userService.getUserById).toHaveBeenCalledWith(1, true) // includeDeactivated for admin
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
        message: 'User retrieved successfully'
      })
    })

    it('should get user by ID without admin access (active users only)', async () => {
      const req = mockRequest({
        params: { id: '1' },
        user: { user_metadata: { role: 'user' } }
      })
      const res = mockResponse()
      const mockUser = { id: 1, email: 'user@example.com', role: 'user' }

      ValidatorService.validateId.mockReturnValue(1)
      userService.getUserById.mockResolvedValue(mockUser)

      await getUserById(req, res)

      expect(userService.getUserById).toHaveBeenCalledWith(1, false) // no includeDeactivated for non-admin
    })

    it('should handle service errors', async () => {
      const req = mockRequest({
        params: { id: '1' },
        user: { user_metadata: { role: 'admin' } }
      })
      const res = mockResponse()
      const error = new Error('User not found')

      ValidatorService.validateId.mockReturnValue(1)
      userService.getUserById.mockRejectedValue(error)

      await expect(getUserById(req, res)).rejects.toThrow('User not found')
    })
  })

  describe('getUserByEmail', () => {
    it('should get user by email successfully', async () => {
      const req = mockRequest({
        params: { email: 'user@example.com' }
      })
      const res = mockResponse()
      const mockUser = { id: 1, email: 'user@example.com', role: 'user' }

      ValidatorService.validateEmail.mockReturnValue(true)
      userService.getUserByEmail.mockResolvedValue(mockUser)

      await getUserByEmail(req, res)

      expect(ValidatorService.validateEmail).toHaveBeenCalledWith('user@example.com', 'email')
      expect(userService.getUserByEmail).toHaveBeenCalledWith('user@example.com', false)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
        message: 'User retrieved successfully'
      })
    })

    it('should handle service errors', async () => {
      const req = mockRequest({
        params: { email: 'invalid@example.com' }
      })
      const res = mockResponse()
      const error = new Error('User not found')

      ValidatorService.validateEmail.mockReturnValue(true)
      userService.getUserByEmail.mockRejectedValue(error)

      await expect(getUserByEmail(req, res)).rejects.toThrow('User not found')
    })
  })

  describe('getUsersByFilter', () => {
    it('should get users by role filter successfully', async () => {
      const req = mockRequest({
        query: { role: 'admin', limit: '10', offset: '0' }
      })
      const res = mockResponse()
      const mockUsers = [{ id: 1, email: 'admin@example.com', role: 'admin' }]

      ValidatorService.validatePagination.mockReturnValue({ limit: 10, offset: 0 })
      userService.getUsersByFilter.mockResolvedValue(mockUsers)

      await getUsersByFilter(req, res)

      expect(ValidatorService.validatePagination).toHaveBeenCalledWith(10, 0, 'users')
      expect(userService.getUsersByFilter).toHaveBeenCalledWith({
        role: 'admin',
        limit: 10,
        offset: 0
      })
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
        message: 'Users retrieved successfully'
      })
    })

    it('should get users by state filter', async () => {
      const req = mockRequest({
        query: { state: 'true', limit: '5', offset: '0' }
      })
      const res = mockResponse()
      const mockUsers = [{ id: 1, active: true }]

      ValidatorService.validatePagination.mockReturnValue({ limit: 5, offset: 0 })
      userService.getUsersByFilter.mockResolvedValue(mockUsers)

      await getUsersByFilter(req, res)

      expect(userService.getUsersByFilter).toHaveBeenCalledWith({
        state: true,
        limit: 5,
        offset: 0
      })
    })

    it('should get users by email_verified filter', async () => {
      const req = mockRequest({
        query: { email_verified: 'false', limit: '5', offset: '0' }
      })
      const res = mockResponse()
      const mockUsers = [{ id: 1, email_verified: false }]

      ValidatorService.validatePagination.mockReturnValue({ limit: 5, offset: 0 })
      userService.getUsersByFilter.mockResolvedValue(mockUsers)

      await getUsersByFilter(req, res)

      expect(userService.getUsersByFilter).toHaveBeenCalledWith({
        email_verified: false,
        limit: 5,
        offset: 0
      })
    })

    it('should throw error when no filters provided', async () => {
      const req = mockRequest({
        query: { limit: '10', offset: '0' }
      })
      const res = mockResponse()

      await expect(getUsersByFilter(req, res)).rejects.toThrow(
        'At least one filter parameter is required: role, state, or email_verified'
      )
    })

    it('should handle service errors', async () => {
      const req = mockRequest({
        query: { role: 'user', limit: '10', offset: '0' }
      })
      const res = mockResponse()
      const error = new Error('Filter error')

      ValidatorService.validatePagination.mockReturnValue({ limit: 10, offset: 0 })
      userService.getUsersByFilter.mockRejectedValue(error)

      await expect(getUsersByFilter(req, res)).rejects.toThrow('Filter error')
    })
  })

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const req = mockRequest({
        body: { email: 'newuser@example.com', full_name: 'New User' }
      })
      const res = mockResponse()
      const mockCreatedUser = { id: 1, email: 'newuser@example.com', full_name: 'New User' }

      userService.createUser.mockResolvedValue(mockCreatedUser)

      await createUser(req, res)

      expect(userService.createUser).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        full_name: 'New User'
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedUser,
        message: 'User created successfully'
      })
    })

    it('should handle service errors', async () => {
      const req = mockRequest({
        body: { email: 'invalid', full_name: 'Test' }
      })
      const res = mockResponse()
      const error = new Error('Invalid email format')

      userService.createUser.mockRejectedValue(error)

      await expect(createUser(req, res)).rejects.toThrow('Invalid email format')
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { full_name: 'Updated Name' }
      })
      const res = mockResponse()
      const mockUpdatedUser = { id: 1, email: 'user@example.com', full_name: 'Updated Name' }

      ValidatorService.validateId.mockReturnValue(1)
      userService.updateUser.mockResolvedValue(mockUpdatedUser)

      await updateUser(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'userId')
      expect(userService.updateUser).toHaveBeenCalledWith(1, { full_name: 'Updated Name' })
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedUser,
        message: 'User updated successfully'
      })
    })

    it('should throw error for empty request body', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: {}
      })
      const res = mockResponse()

      ValidatorService.validateId.mockReturnValue(1)

      await expect(updateUser(req, res)).rejects.toThrow(
        'Request body is required with update data'
      )
    })

    it('should handle service errors', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { full_name: 'Test' }
      })
      const res = mockResponse()
      const error = new Error('Update failed')

      ValidatorService.validateId.mockReturnValue(1)
      userService.updateUser.mockRejectedValue(error)

      await expect(updateUser(req, res)).rejects.toThrow('Update failed')
    })
  })

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const req = mockRequest({
        params: { id: '1' }
      })
      const res = mockResponse()
      const mockDeletedUser = { id: 1, active: false }

      ValidatorService.validateId.mockReturnValue(1)
      userService.deleteUser.mockResolvedValue(mockDeletedUser)

      await deleteUser(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'userId')
      expect(userService.deleteUser).toHaveBeenCalledWith(1)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDeletedUser,
        message: 'User deactivated successfully'
      })
    })

    it('should handle service errors', async () => {
      const req = mockRequest({
        params: { id: '1' }
      })
      const res = mockResponse()
      const error = new Error('Delete failed')

      ValidatorService.validateId.mockReturnValue(1)
      userService.deleteUser.mockRejectedValue(error)

      await expect(deleteUser(req, res)).rejects.toThrow('Delete failed')
    })
  })

  describe('reactivateUser', () => {
    it('should reactivate user successfully', async () => {
      const req = mockRequest({
        params: { id: '1' }
      })
      const res = mockResponse()
      const mockReactivatedUser = { id: 1, active: true }

      ValidatorService.validateId.mockReturnValue(1)
      userService.reactivateUser.mockResolvedValue(mockReactivatedUser)

      await reactivateUser(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'userId')
      expect(userService.reactivateUser).toHaveBeenCalledWith(1)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockReactivatedUser,
        message: 'User updated successfully'
      })
    })

    it('should handle service errors', async () => {
      const req = mockRequest({
        params: { id: '1' }
      })
      const res = mockResponse()
      const error = new Error('Reactivate failed')

      ValidatorService.validateId.mockReturnValue(1)
      userService.reactivateUser.mockRejectedValue(error)

      await expect(reactivateUser(req, res)).rejects.toThrow('Reactivate failed')
    })
  })

  describe('verifyUserEmail', () => {
    it('should verify user email successfully', async () => {
      const req = mockRequest({
        params: { id: '1' }
      })
      const res = mockResponse()
      const mockVerifiedUser = { id: 1, email_verified: true }

      ValidatorService.validateId.mockReturnValue(1)
      userService.verifyUserEmail.mockResolvedValue(mockVerifiedUser)

      await verifyUserEmail(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'userId')
      expect(userService.verifyUserEmail).toHaveBeenCalledWith(1)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockVerifiedUser,
        message: 'User updated successfully'
      })
    })

    it('should handle service errors', async () => {
      const req = mockRequest({
        params: { id: '1' }
      })
      const res = mockResponse()
      const error = new Error('Verification failed')

      ValidatorService.validateId.mockReturnValue(1)
      userService.verifyUserEmail.mockRejectedValue(error)

      await expect(verifyUserEmail(req, res)).rejects.toThrow('Verification failed')
    })
  })

  describe('Error handling and validation', () => {
    it('should handle ValidatorService errors', async () => {
      const req = mockRequest({ params: { id: 'invalid' } })
      const res = mockResponse()

      ValidatorService.validateId.mockImplementation(() => {
        throw new Error('Invalid ID format')
      })

      await expect(getUserById(req, res)).rejects.toThrow('Invalid ID format')
    })

    it('should handle email validation errors', async () => {
      const req = mockRequest({ params: { email: 'invalid-email' } })
      const res = mockResponse()

      ValidatorService.validateEmail.mockImplementation(() => {
        throw new Error('Invalid email format')
      })

      await expect(getUserByEmail(req, res)).rejects.toThrow('Invalid email format')
    })

    it('should handle pagination validation errors', async () => {
      const req = mockRequest({
        query: { role: 'user', limit: 'invalid', offset: '0' }
      })
      const res = mockResponse()

      ValidatorService.validatePagination.mockImplementation(() => {
        throw new Error('Invalid pagination parameters')
      })

      await expect(getUsersByFilter(req, res)).rejects.toThrow('Invalid pagination parameters')
    })
  })

  describe('Authentication and authorization', () => {
    it('should handle missing user in getAllUsers', async () => {
      const req = mockRequest({ user: null })
      const res = mockResponse()

      await expect(getAllUsers(req, res)).rejects.toThrow('Authentication required')
    })

    it('should handle non-admin user in getAllUsers', async () => {
      const req = mockRequest({
        user: { user_metadata: { role: 'user' } }
      })
      const res = mockResponse()

      await expect(getAllUsers(req, res)).rejects.toThrow('Admin access required to view all users')
    })

    it('should handle user with role in different location', async () => {
      const req = mockRequest({
        user: { role: 'admin' } // role directly on user object
      })
      const res = mockResponse()
      const mockUsers = [{ id: 1, email: 'test@example.com' }]

      userService.getAllUsers.mockResolvedValue(mockUsers)

      await getAllUsers(req, res)

      expect(userService.getAllUsers).toHaveBeenCalledWith({}, true)
    })
  })

  describe('Role-based access control', () => {
    it('should allow admin to access deactivated users in getAllUsers', async () => {
      const req = mockRequest({
        query: { includeDeactivated: 'true' },
        user: { user_metadata: { role: 'admin' }, role: 'admin' }
      })
      const res = mockResponse()
      const mockUsers = [{ id: 1, active: false }]

      userService.getAllUsers.mockResolvedValue(mockUsers)

      await getAllUsers(req, res)

      expect(userService.getAllUsers).toHaveBeenCalledWith(
        {
          search: undefined,
          role: undefined,
          email_verified: undefined
        },
        true
      )
    })

    it('should default includeDeactivated to true for admin in getAllUsers', async () => {
      const req = mockRequest({
        user: { user_metadata: { role: 'admin' }, role: 'admin' }
      })
      const res = mockResponse()
      const mockUsers = [{ id: 1, active: false }]

      userService.getAllUsers.mockResolvedValue(mockUsers)

      await getAllUsers(req, res)

      expect(userService.getAllUsers).toHaveBeenCalledWith({}, true)
    })

    it('should allow admin to access deactivated users in getUserById', async () => {
      const req = mockRequest({
        params: { id: '1' },
        user: { user_metadata: { role: 'admin' } }
      })
      const res = mockResponse()
      const mockUser = { id: 1, active: false }

      ValidatorService.validateId.mockReturnValue(1)
      userService.getUserById.mockResolvedValue(mockUser)

      await getUserById(req, res)

      expect(userService.getUserById).toHaveBeenCalledWith(1, true)
    })

    it('should restrict non-admin to active users only in getUserById', async () => {
      const req = mockRequest({
        params: { id: '1' },
        user: { user_metadata: { role: 'user' } }
      })
      const res = mockResponse()
      const mockUser = { id: 1, active: true }

      ValidatorService.validateId.mockReturnValue(1)
      userService.getUserById.mockResolvedValue(mockUser)

      await getUserById(req, res)

      expect(userService.getUserById).toHaveBeenCalledWith(1, false)
    })
  })
})
