/**
 * User Controller Tests
 * Tests each controller function separately (one test per function)
 * Tests all possible combinations of scenarios
 */

import { describe, it, expect, vi } from 'vitest'
import * as userController from '../userController.js'
import * as userService from '../../services/userService.js'

// Mock the userService
vi.mock('../../services/userService.js', () => ({
  getAllUsers: vi.fn(),
  getUserById: vi.fn(),
  getUserByEmail: vi.fn(),
  getUsersByFilter: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn()
}))

// Mock asyncHandler to just return the function as-is
vi.mock('../../middleware/errorHandler.js', () => ({
  asyncHandler: fn => fn
}))

// Helper to create mock request/response objects
const createMockReq = (overrides = {}) => ({
  query: {},
  params: {},
  body: {},
  user: { role: 'user' },
  ...overrides
})

const createMockRes = () => {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('getAllUsers', () => {
  it('should get all users with default filters', async () => {
    const mockUsers = [
      { id: 1, email: 'user1@test.com', role: 'user' },
      { id: 2, email: 'user2@test.com', role: 'user' }
    ]

    userService.getAllUsers.mockResolvedValue(mockUsers)

    const req = createMockReq({
      query: { limit: '10', offset: '0' },
      user: { role: 'admin' }
    })
    const res = createMockRes()

    await userController.getAllUsers(req, res)

    expect(userService.getAllUsers).toHaveBeenCalledWith(
      {
        search: undefined,
        role: undefined,
        email_verified: undefined,
        limit: 10,
        offset: 0
      },
      true
    )
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockUsers,
      message: 'Users retrieved successfully'
    })
  })

  it('should get all users with search filter', async () => {
    const mockUsers = [{ id: 1, email: 'test@test.com', role: 'user' }]

    userService.getAllUsers.mockResolvedValue(mockUsers)

    const req = createMockReq({
      query: { search: 'test', limit: '10', offset: '0' },
      user: { role: 'admin' }
    })
    const res = createMockRes()

    await userController.getAllUsers(req, res)

    expect(userService.getAllUsers).toHaveBeenCalledWith(
      {
        search: 'test',
        role: undefined,
        email_verified: undefined,
        limit: 10,
        offset: 0
      },
      true
    )
  })

  it('should get all users with role filter', async () => {
    const mockUsers = [{ id: 1, email: 'admin@test.com', role: 'admin' }]

    userService.getAllUsers.mockResolvedValue(mockUsers)

    const req = createMockReq({
      query: { role: 'admin', limit: '10', offset: '0' },
      user: { role: 'admin' }
    })
    const res = createMockRes()

    await userController.getAllUsers(req, res)

    expect(userService.getAllUsers).toHaveBeenCalledWith(
      {
        search: undefined,
        role: 'admin',
        email_verified: undefined,
        limit: 10,
        offset: 0
      },
      true
    )
  })

  it('should include inactive users for admin', async () => {
    const mockUsers = [
      { id: 1, email: 'user1@test.com', is_active: true },
      { id: 2, email: 'user2@test.com', is_active: false }
    ]

    userService.getAllUsers.mockResolvedValue(mockUsers)

    const req = createMockReq({
      query: { limit: '10', offset: '0' },
      user: { role: 'admin' }
    })
    const res = createMockRes()

    await userController.getAllUsers(req, res)

    expect(userService.getAllUsers).toHaveBeenCalledWith(
      {
        search: undefined,
        role: undefined,
        email_verified: undefined,
        limit: 10,
        offset: 0
      },
      true
    )
  })

  it('should handle pagination parameters', async () => {
    const mockUsers = [{ id: 1, email: 'user@test.com', role: 'user' }]

    userService.getAllUsers.mockResolvedValue(mockUsers)

    const req = createMockReq({
      query: { limit: '10', offset: '20' },
      user: { role: 'admin' }
    })
    const res = createMockRes()

    await userController.getAllUsers(req, res)

    expect(userService.getAllUsers).toHaveBeenCalledWith(
      {
        search: undefined,
        role: undefined,
        email_verified: undefined,
        limit: 10,
        offset: 20
      },
      true
    )
  })

  it('should fail fast when limit and offset are missing', async () => {
    const req = createMockReq({
      query: {},
      user: { role: 'admin' }
    })
    const res = createMockRes()

    await expect(userController.getAllUsers(req, res)).rejects.toThrow(
      'Query parameters limit and offset are required'
    )
  })

  it('should fail fast when user is not admin', async () => {
    const req = createMockReq({
      query: { limit: '10', offset: '0' },
      user: { role: 'user' }
    })
    const res = createMockRes()

    await expect(userController.getAllUsers(req, res)).rejects.toThrow(
      'Admin access required to view all users'
    )
  })

  it('should fail fast when user is not authenticated', async () => {
    const req = createMockReq({
      query: { limit: '10', offset: '0' },
      user: null
    })
    const res = createMockRes()

    await expect(userController.getAllUsers(req, res)).rejects.toThrow(
      'Admin access required to view all users'
    )
  })
})

describe('getUserById', () => {
  it('should get user by valid ID', async () => {
    const mockUser = { id: 1, email: 'user@test.com', role: 'user', is_active: true }

    userService.getUserById.mockResolvedValue(mockUser)

    const req = createMockReq({
      params: { id: '1' },
      user: { role: 'user' }
    })
    const res = createMockRes()

    await userController.getUserById(req, res)

    expect(userService.getUserById).toHaveBeenCalledWith(1, false)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockUser,
      message: 'User retrieved successfully'
    })
  })

  it('should include inactive users for admin', async () => {
    const mockUser = { id: 1, email: 'user@test.com', role: 'user', is_active: false }

    userService.getUserById.mockResolvedValue(mockUser)

    const req = createMockReq({
      params: { id: '1' },
      user: { role: 'admin' }
    })
    const res = createMockRes()

    await userController.getUserById(req, res)

    expect(userService.getUserById).toHaveBeenCalledWith(1, true)
  })

  it('should fail fast when ID parameter is missing', async () => {
    const req = createMockReq({
      params: { id: undefined },
      user: { role: 'user' }
    })
    const res = createMockRes()

    await expect(userController.getUserById(req, res)).rejects.toThrow(
      'User ID is required in path parameters'
    )
  })

  it('should fail fast when ID parameter is invalid (not a number)', async () => {
    const req = createMockReq({
      params: { id: 'invalid' },
      user: { role: 'user' }
    })
    const res = createMockRes()

    await expect(userController.getUserById(req, res)).rejects.toThrow(
      'Invalid user ID: must be a positive number'
    )
  })

  it('should fail fast when ID parameter is zero', async () => {
    const req = createMockReq({
      params: { id: '0' },
      user: { role: 'user' }
    })
    const res = createMockRes()

    await expect(userController.getUserById(req, res)).rejects.toThrow(
      'Invalid user ID: must be a positive number'
    )
  })

  it('should fail fast when ID parameter is negative', async () => {
    const req = createMockReq({
      params: { id: '-1' },
      user: { role: 'user' }
    })
    const res = createMockRes()

    await expect(userController.getUserById(req, res)).rejects.toThrow(
      'Invalid user ID: must be a positive number'
    )
  })
})

describe('getUserByEmail', () => {
  it('should get user by email', async () => {
    const mockUser = { id: 1, email: 'user@test.com', role: 'user', is_active: true }

    userService.getUserByEmail.mockResolvedValue(mockUser)

    const req = createMockReq({
      params: { email: 'user@test.com' }
    })
    const res = createMockRes()

    await userController.getUserByEmail(req, res)

    expect(userService.getUserByEmail).toHaveBeenCalledWith('user@test.com', false)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockUser,
      message: 'User retrieved successfully'
    })
  })

  it('should fail fast when email parameter is missing', async () => {
    const req = createMockReq({
      params: { email: undefined }
    })
    const res = createMockRes()

    await expect(userController.getUserByEmail(req, res)).rejects.toThrow(
      'Email is required in path parameters'
    )
  })
})

describe('getUsersByFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should filter users by role', async () => {
    const mockUsers = [{ id: 1, email: 'admin@test.com', role: 'admin', is_active: true }]

    userService.getUsersByFilter.mockResolvedValue(mockUsers)

    const req = createMockReq({
      query: { role: 'admin', limit: '10', offset: '0' }
    })
    const res = createMockRes()

    await userController.getUsersByFilter(req, res)

    expect(userService.getUsersByFilter).toHaveBeenCalledWith({
      role: 'admin',
      state: undefined,
      email_verified: undefined,
      limit: 10,
      offset: 0
    })
  })

  it('should filter users by state', async () => {
    const mockUsers = [{ id: 1, email: 'user@test.com', is_active: false }]

    userService.getUsersByFilter.mockResolvedValue(mockUsers)

    const req = createMockReq({
      query: { state: 'false', limit: '10', offset: '0' }
    })
    const res = createMockRes()

    await userController.getUsersByFilter(req, res)

    expect(userService.getUsersByFilter).toHaveBeenCalledWith({
      role: undefined,
      state: false,
      email_verified: undefined,
      limit: 10,
      offset: 0
    })
  })

  it('should filter users by email verified status', async () => {
    const mockUsers = [{ id: 1, email: 'user@test.com', email_verified: true, is_active: true }]

    userService.getUsersByFilter.mockResolvedValue(mockUsers)

    const req = createMockReq({
      query: { email_verified: 'true', limit: '10', offset: '0' }
    })
    const res = createMockRes()

    await userController.getUsersByFilter(req, res)

    expect(userService.getUsersByFilter).toHaveBeenCalledWith({
      role: undefined,
      state: undefined,
      email_verified: true,
      limit: 10,
      offset: 0
    })
  })

  it('should combine multiple filters', async () => {
    const mockUsers = [
      { id: 1, email: 'admin@test.com', role: 'admin', is_active: true, email_verified: true }
    ]

    userService.getUsersByFilter.mockResolvedValue(mockUsers)

    const req = createMockReq({
      query: {
        role: 'admin',
        state: 'true',
        email_verified: 'true',
        limit: '10',
        offset: '0'
      }
    })
    const res = createMockRes()

    await userController.getUsersByFilter(req, res)

    expect(userService.getUsersByFilter).toHaveBeenCalledWith({
      role: 'admin',
      state: true,
      email_verified: true,
      limit: 10,
      offset: 0
    })
  })

  it('should handle pagination in filter', async () => {
    const mockUsers = [{ id: 1, email: 'user@test.com', is_active: true }]

    userService.getUsersByFilter.mockResolvedValue(mockUsers)

    const req = createMockReq({
      query: {
        role: 'admin', // Need at least one filter parameter
        limit: '5',
        offset: '10'
      }
    })
    const res = createMockRes()

    await userController.getUsersByFilter(req, res)

    expect(userService.getUsersByFilter).toHaveBeenCalledWith({
      role: 'admin',
      state: undefined,
      email_verified: undefined,
      limit: 5,
      offset: 10
    })
  })

  it('should fail fast when no filter parameters are provided', async () => {
    const req = createMockReq({
      query: { limit: '10', offset: '0' }
    })
    const res = createMockRes()

    await expect(userController.getUsersByFilter(req, res)).rejects.toThrow(
      'At least one filter parameter is required: role, state, or email_verified'
    )
  })

  it('should fail fast when limit and offset are missing', async () => {
    const req = createMockReq({
      query: { role: 'admin' }
    })
    const res = createMockRes()

    await expect(userController.getUsersByFilter(req, res)).rejects.toThrow(
      'Query parameters limit and offset are required'
    )
  })
})

describe('createUser', () => {
  it('should create user with valid data', async () => {
    const userData = {
      email: 'client@test.com',
      full_name: 'Client User'
    }

    const mockCreatedUser = {
      id: 1,
      ...userData,
      role: 'user',
      is_active: true,
      email_verified: false
    }

    userService.createUser.mockResolvedValue(mockCreatedUser)

    const req = createMockReq({
      body: userData
    })
    const res = createMockRes()

    await userController.createUser(req, res)

    expect(userService.createUser).toHaveBeenCalledWith(userData)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockCreatedUser,
      message: 'User created successfully'
    })
  })
})

describe('updateUser', () => {
  it('should update user with valid data', async () => {
    const updates = { full_name: 'Updated Name' }
    const mockUpdatedUser = {
      id: 1,
      email: 'user@test.com',
      full_name: 'Updated Name',
      is_active: true
    }

    userService.updateUser.mockResolvedValue(mockUpdatedUser)

    const req = createMockReq({
      params: { id: '1' },
      body: updates
    })
    const res = createMockRes()

    await userController.updateUser(req, res)

    expect(userService.updateUser).toHaveBeenCalledWith(1, updates)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockUpdatedUser,
      message: 'User updated successfully'
    })
  })

  it('should fail fast when ID parameter is missing', async () => {
    const updates = { full_name: 'Updated Name' }
    const req = createMockReq({
      params: { id: undefined },
      body: updates
    })
    const res = createMockRes()

    await expect(userController.updateUser(req, res)).rejects.toThrow(
      'User ID is required in path parameters'
    )
  })

  it('should fail fast when ID parameter is invalid (not a number)', async () => {
    const updates = { full_name: 'Updated Name' }
    const req = createMockReq({
      params: { id: 'invalid' },
      body: updates
    })
    const res = createMockRes()

    await expect(userController.updateUser(req, res)).rejects.toThrow(
      'Invalid user ID: must be a positive number'
    )
  })

  it('should fail fast when ID parameter is zero', async () => {
    const updates = { full_name: 'Updated Name' }
    const req = createMockReq({
      params: { id: '0' },
      body: updates
    })
    const res = createMockRes()

    await expect(userController.updateUser(req, res)).rejects.toThrow(
      'Invalid user ID: must be a positive number'
    )
  })

  it('should fail fast when request body is missing', async () => {
    const req = createMockReq({
      params: { id: '1' },
      body: undefined
    })
    const res = createMockRes()

    await expect(userController.updateUser(req, res)).rejects.toThrow(
      'Request body is required with update data'
    )
  })

  it('should fail fast when request body is empty', async () => {
    const req = createMockReq({
      params: { id: '1' },
      body: {}
    })
    const res = createMockRes()

    await expect(userController.updateUser(req, res)).rejects.toThrow(
      'Request body is required with update data'
    )
  })
})

describe('deleteUser', () => {
  it('should soft delete user', async () => {
    const mockDeletedUser = {
      id: 1,
      email: 'user@test.com',
      is_active: false
    }

    userService.deleteUser.mockResolvedValue(mockDeletedUser)

    const req = createMockReq({
      params: { id: '1' }
    })
    const res = createMockRes()

    await userController.deleteUser(req, res)

    expect(userService.deleteUser).toHaveBeenCalledWith(1)
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockDeletedUser,
      message: 'User deactivated successfully'
    })
  })

  it('should fail fast when ID parameter is missing', async () => {
    const req = createMockReq({
      params: { id: undefined }
    })
    const res = createMockRes()

    await expect(userController.deleteUser(req, res)).rejects.toThrow(
      'User ID is required in path parameters'
    )
  })

  it('should fail fast when ID parameter is invalid (not a number)', async () => {
    const req = createMockReq({
      params: { id: 'invalid' }
    })
    const res = createMockRes()

    await expect(userController.deleteUser(req, res)).rejects.toThrow(
      'Invalid user ID: must be a positive number'
    )
  })

  it('should fail fast when ID parameter is zero', async () => {
    const req = createMockReq({
      params: { id: '0' }
    })
    const res = createMockRes()

    await expect(userController.deleteUser(req, res)).rejects.toThrow(
      'Invalid user ID: must be a positive number'
    )
  })

  it('should fail fast when ID parameter is negative', async () => {
    const req = createMockReq({
      params: { id: '-1' }
    })
    const res = createMockRes()

    await expect(userController.deleteUser(req, res)).rejects.toThrow(
      'Invalid user ID: must be a positive number'
    )
  })
})
