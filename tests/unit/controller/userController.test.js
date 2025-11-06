/**
 * User Controller - Granular Unit Tests
 * HTTP Handler Layer Testing
 *
 * Coverage Target: 85%
 * Speed Target: < 100ms per test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockUserService = {
  getAllUsers: vi.fn(),
  getUserById: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  updateUserRole: vi.fn()
}

vi.mock('../../../api/services/userService.js', async () => {
  const actual = await vi.importActual('../../../api/services/userService.js')
  return {
    ...actual,
    ...mockUserService
  }
})

vi.mock('../../../api/services/settingsService.js', () => ({
  getSettings: vi.fn()
}))

vi.mock('../../../api/middleware/error/index.js', () => ({
  errorHandler: vi.fn((err, req, res, next) => next(err)),
  notFoundHandler: vi.fn((req, res, next) => next()),
  asyncHandler: vi.fn(fn => (req, res, next) => fn(req, res, next)),
  withErrorMapping: vi.fn(fn => fn),
  createTableOperations: vi.fn(() => ({
    findById: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }))
}))

const mockUser = {
  id: 1,
  full_name: 'Test User',
  email: 'test@example.com',
  phone: '+58 412-1234567',
  role: 'customer',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockRes = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis()
  }
  return res
}

const mockReq = (overrides = {}) => ({
  query: {},
  params: {},
  body: {},
  ...overrides
})

describe('UserController - Granular Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllUsers()', () => {
    it('should return all users with default filters', async () => {
      // Arrange
      mockUserService.getAllUsers.mockResolvedValue([mockUser])
      const { getAllUsers } = await import('../../../api/controllers/userController.js')
      const req = mockReq()
      const res = mockRes()

      // Act
      await getAllUsers(req, res)

      // Assert
      expect(mockUserService.getAllUsers).toHaveBeenCalledWith({}, false)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [mockUser],
        message: 'Users retrieved successfully'
      })
    })

    it('should filter by role', async () => {
      // Arrange
      mockUserService.getAllUsers.mockResolvedValue([mockUser])
      const { getAllUsers } = await import('../../../api/controllers/userController.js')
      const req = mockReq({ query: { role: 'admin' } })
      const res = mockRes()

      // Act
      await getAllUsers(req, res)

      // Assert
      expect(mockUserService.getAllUsers).toHaveBeenCalledWith({ role: 'admin' }, false)
    })

    it('should include deactivated users for admin', async () => {
      // Arrange
      mockUserService.getAllUsers.mockResolvedValue([mockUser])
      const { getAllUsers } = await import('../../../api/controllers/userController.js')
      const req = mockReq({ query: { includeDeactivated: 'true' } })
      const res = mockRes()

      // Act
      await getAllUsers(req, res)

      // Assert
      expect(mockUserService.getAllUsers).toHaveBeenCalledWith({}, true)
    })

    it('should apply search term', async () => {
      // Arrange
      mockUserService.getAllUsers.mockResolvedValue([mockUser])
      const { getAllUsers } = await import('../../../api/controllers/userController.js')
      const req = mockReq({ query: { search: 'test user' } })
      const res = mockRes()

      // Act
      await getAllUsers(req, res)

      // Assert
      expect(mockUserService.getAllUsers).toHaveBeenCalledWith({ search: 'test user' }, false)
    })

    it('should apply pagination', async () => {
      // Arrange
      mockUserService.getAllUsers.mockResolvedValue([mockUser])
      const { getAllUsers } = await import('../../../api/controllers/userController.js')
      const req = mockReq({ query: { limit: '10', offset: '5' } })
      const res = mockRes()

      // Act
      await getAllUsers(req, res)

      // Assert
      expect(mockUserService.getAllUsers).toHaveBeenCalledWith({ limit: 10, offset: 5 }, false)
    })

    it('should return empty array when no users found', async () => {
      // Arrange
      mockUserService.getAllUsers.mockResolvedValue([])
      const { getAllUsers } = await import('../../../api/controllers/userController.js')
      const req = mockReq()
      const res = mockRes()

      // Act
      await getAllUsers(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        message: 'Users retrieved successfully'
      })
    })
  })

  describe('getUserById()', () => {
    it('should return user by valid ID', async () => {
      // Arrange
      mockUserService.getUserById.mockResolvedValue(mockUser)
      const { getUserById } = await import('../../../api/controllers/userController.js')
      const req = mockReq({ params: { id: '1' } })
      const res = mockRes()

      // Act
      await getUserById(req, res)

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(1, false)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
        message: 'User retrieved successfully'
      })
    })

    it('should include deactivated user for admin', async () => {
      // Arrange
      mockUserService.getUserById.mockResolvedValue(mockUser)
      const { getUserById } = await import('../../../api/controllers/userController.js')
      const req = mockReq({ params: { id: '1' }, query: { includeDeactivated: 'true' } })
      const res = mockRes()

      // Act
      await getUserById(req, res)

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(1, true)
    })

    it('should return 404 when user not found', async () => {
      // Arrange
      const error = new Error('User with ID 999 not found')
      error.name = 'NotFoundError'
      mockUserService.getUserById.mockRejectedValue(error)
      const { getUserById } = await import('../../../api/controllers/userController.js')
      const req = mockReq({ params: { id: '999' } })
      const res = mockRes()

      // Act
      await getUserById(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User with ID 999 not found'
      })
    })

    it('should handle string ID parameter', async () => {
      // Arrange
      mockUserService.getUserById.mockResolvedValue(mockUser)
      const { getUserById } = await import('../../../api/controllers/userController.js')
      const req = mockReq({ params: { id: '123' } })
      const res = mockRes()

      // Act
      await getUserById(req, res)

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(123, false)
    })
  })

  describe('createUser()', () => {
    const mockUserData = {
      full_name: 'New User',
      email: 'newuser@example.com',
      phone: '+58 414-1234567',
      role: 'customer'
    }

    it('should create user with valid data', async () => {
      // Arrange
      mockUserService.createUser.mockResolvedValue({ id: 2, ...mockUserData })
      const { createUser } = await import('../../../api/controllers/userController.js')
      const req = mockReq({ body: mockUserData })
      const res = mockRes()

      // Act
      await createUser(req, res)

      // Assert
      expect(mockUserService.createUser).toHaveBeenCalledWith(mockUserData)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining(mockUserData),
        message: 'User created successfully'
      })
    })

    it('should return 400 when validation fails', async () => {
      // Arrange
      const error = new Error('Validation failed')
      error.name = 'ValidationError'
      mockUserService.createUser.mockRejectedValue(error)
      const { createUser } = await import('../../../api/controllers/userController.js')
      const req = mockReq({ body: { full_name: '' } })
      const res = mockRes()

      // Act
      await createUser(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed'
      })
    })

    it('should return 400 when email already exists', async () => {
      // Arrange
      const error = new Error('User with email test@example.com already exists')
      error.name = 'DatabaseConstraintError'
      mockUserService.createUser.mockRejectedValue(error)
      const { createUser } = await import('../../../api/controllers/userController.js')
      const req = mockReq({ body: { ...mockUserData, email: 'test@example.com' } })
      const res = mockRes()

      // Act
      await createUser(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User with email test@example.com already exists'
      })
    })
  })

  describe('updateUser()', () => {
    const mockUpdateData = {
      full_name: 'Updated User',
      phone: '+58 416-9876543'
    }

    it('should update user with valid data', async () => {
      // Arrange
      mockUserService.updateUser.mockResolvedValue({ ...mockUser, ...mockUpdateData })
      const { updateUser } = await import('../../../api/controllers/userController.js')
      const req = mockReq({ params: { id: '1' }, body: mockUpdateData })
      const res = mockRes()

      // Act
      await updateUser(req, res)

      // Assert
      expect(mockUserService.updateUser).toHaveBeenCalledWith(1, mockUpdateData)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining(mockUpdateData),
        message: 'User updated successfully'
      })
    })

    it('should return 404 when user not found', async () => {
      // Arrange
      const error = new Error('User with ID 999 not found')
      error.name = 'NotFoundError'
      mockUserService.updateUser.mockRejectedValue(error)
      const { updateUser } = await import('../../../api/controllers/userController.js')
      const req = mockReq({ params: { id: '999' }, body: mockUpdateData })
      const res = mockRes()

      // Act
      await updateUser(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User with ID 999 not found'
      })
    })
  })

  describe('deleteUser()', () => {
    it('should deactivate user (soft delete)', async () => {
      // Arrange
      mockUserService.deleteUser.mockResolvedValue({ ...mockUser, active: false })
      const { deleteUser } = await import('../../../api/controllers/userController.js')
      const req = mockReq({ params: { id: '1' } })
      const res = mockRes()

      // Act
      await deleteUser(req, res)

      // Assert
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(1)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ active: false }),
        message: 'User deactivated successfully'
      })
    })

    it('should return 404 when user not found', async () => {
      // Arrange
      const error = new Error('User with ID 999 not found')
      error.name = 'NotFoundError'
      mockUserService.deleteUser.mockRejectedValue(error)
      const { deleteUser } = await import('../../../api/controllers/userController.js')
      const req = mockReq({ params: { id: '999' } })
      const res = mockRes()

      // Act
      await deleteUser(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User with ID 999 not found'
      })
    })
  })

  describe('updateUserRole()', () => {
    it('should update user role', async () => {
      // Arrange
      mockUserService.updateUserRole.mockResolvedValue({ ...mockUser, role: 'admin' })
      const { updateUserRole } = await import('../../../api/controllers/userController.js')
      const req = mockReq({ params: { id: '1' }, body: { role: 'admin' } })
      const res = mockRes()

      // Act
      await updateUserRole(req, res)

      // Assert
      expect(mockUserService.updateUserRole).toHaveBeenCalledWith(1, 'admin')
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ role: 'admin' }),
        message: 'User updated successfully'
      })
    })

    it('should return 400 for invalid role', async () => {
      // Arrange
      const error = new Error('Invalid role: must be customer, admin, or moderator')
      error.name = 'ValidationError'
      mockUserService.updateUserRole.mockRejectedValue(error)
      const { updateUserRole } = await import('../../../api/controllers/userController.js')
      const req = mockReq({ params: { id: '1' }, body: { role: 'invalid' } })
      const res = mockRes()

      // Act
      await updateUserRole(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid role: must be customer, admin, or moderator'
      })
    })
  })
})
