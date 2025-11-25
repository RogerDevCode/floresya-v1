/**
 * Tests for User Service Modular Operations
 * Coverage for: create, read, update, delete operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as CreateOps from '../../api/services/userService.create.js'
import * as ReadOps from '../../api/services/userService.read.js'
import * as UpdateOps from '../../api/services/userService.update.js'
import * as DeleteOps from '../../api/services/userService.delete.js'
import * as Helpers from '../../api/services/userService.helpers.js'

vi.mock('../../api/services/userService.helpers.js', () => ({
  getUserRepository: vi.fn(),
  withErrorHandling: vi.fn((fn) => fn()),
  withErrorMapping: vi.fn((fn) => fn),
  validateUserId: vi.fn((id) => {
    if (!id || typeof id !== 'number') {
      throw new Error('Invalid user ID')
    }
  }),
  VALID_ROLES: ['user', 'admin'],
  TABLE: 'users',
  ValidationError: class ValidationError extends Error {
    constructor(message, context) {
      super(message)
      this.name = 'ValidationError'
      this.context = context
    }
  },
  BadRequestError: class BadRequestError extends Error {
    constructor(message, context) {
      super(message)
      this.name = 'BadRequestError'
      this.context = context
    }
  },
  NotFoundError: class NotFoundError extends Error {
    constructor(resource, id, context) {
      super(`${resource} with ID ${id} not found`)
      this.name = 'NotFoundError'
    }
  }
}))

describe('User Service - Create Operations', () => {
  let mockRepository

  beforeEach(() => {
    mockRepository = { create: vi.fn() }
    vi.mocked(Helpers.getUserRepository).mockReturnValue(mockRepository)
  })

  it('should create user with valid email', async () => {
    const userData = { email: 'test@example.com', full_name: 'Test User' }
    mockRepository.create.mockResolvedValue({ id: 1, ...userData })

    const result = await CreateOps.createUser(userData)

    expect(result.email).toBe('test@example.com')
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        full_name: 'Test User',
        active: true
      })
    )
  })

  it('should create user with minimal data', async () => {
    const userData = { email: 'user@test.com' }
    mockRepository.create.mockResolvedValue({ id: 2, ...userData })

    await CreateOps.createUser(userData)

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@test.com',
        role: 'user',
        active: true,
        email_verified: false
      })
    )
  })

  it('should throw ValidationError when email is missing', async () => {
    await expect(CreateOps.createUser({})).rejects.toThrow('Email is required')
  })

  it('should throw ValidationError when email has no @', async () => {
    await expect(CreateOps.createUser({ email: 'invalidemail.com' })).rejects.toThrow('Invalid email format')
  })

  it('should throw ValidationError when email has no dot', async () => {
    await expect(CreateOps.createUser({ email: 'invalid@email' })).rejects.toThrow('Invalid email format')
  })

  it('should throw ValidationError for invalid role', async () => {
    await expect(
      CreateOps.createUser({ email: 'test@test.com', role: 'superuser' })
    ).rejects.toThrow('Invalid role')
  })

  it('should throw ValidationError when admin has no password', async () => {
    await expect(
      CreateOps.createUser({ email: 'admin@test.com', role: 'admin' })
    ).rejects.toThrow('Password is required for admin users')
  })

  it('should allow admin creation with password', async () => {
    const userData = { 
      email: 'admin@test.com', 
      role: 'admin', 
      password_hash: 'hashed123' 
    }
    mockRepository.create.mockResolvedValue({ id: 3, ...userData })

    const result = await CreateOps.createUser(userData)

    expect(result.role).toBe('admin')
  })
})

describe('User Service - Read Operations', () => {
  let mockRepository

  beforeEach(() => {
    mockRepository = {
      findAllWithFilters: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findByFilter: vi.fn()
    }
    vi.mocked(Helpers.getUserRepository).mockReturnValue(mockRepository)
  })

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [{ id: 1, email: 'u1@test.com' }, { id: 2, email: 'u2@test.com' }]
      mockRepository.findAllWithFilters.mockResolvedValue(users)

      const result = await ReadOps.getAllUsers()

      expect(result).toEqual(users)
      expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(
        {},
        expect.objectContaining({ includeDeactivated: false })
      )
    })

    it('should apply filters', async () => {
      const filters = { role: 'admin' }
      mockRepository.findAllWithFilters.mockResolvedValue([])

      await ReadOps.getAllUsers(filters, true)

      expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(
        filters,
        expect.objectContaining({ includeDeactivated: true })
      )
    })

    it('should return empty array when no users', async () => {
      mockRepository.findAllWithFilters.mockResolvedValue(null)

      const result = await ReadOps.getAllUsers()

      expect(result).toEqual([])
    })
  })

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const user = { id: 1, email: 'user@test.com' }
      mockRepository.findById.mockResolvedValue(user)

      const result = await ReadOps.getUserById(1)

      expect(result).toEqual(user)
    })

    it('should throw BadRequestError for invalid id', async () => {
      await expect(ReadOps.getUserById('invalid')).rejects.toThrow('Invalid user ID')
    })

    it('should throw NotFoundError when user not found', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(ReadOps.getUserById(999)).rejects.toThrow('not found')
    })
  })

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      const user = { id: 1, email: 'test@example.com' }
      mockRepository.findByEmail.mockResolvedValue(user)

      const result = await ReadOps.getUserByEmail('test@example.com')

      expect(result).toEqual(user)
    })

    it('should throw BadRequestError when email is missing', async () => {
      await expect(ReadOps.getUserByEmail('')).rejects.toThrow('Email is required')
    })

    it('should throw BadRequestError when email is not string', async () => {
      await expect(ReadOps.getUserByEmail(123)).rejects.toThrow('must be a string')
    })

    it('should throw ValidationError for invalid email format', async () => {
      await expect(ReadOps.getUserByEmail('notemail')).rejects.toThrow('Invalid email format')
    })

    it('should throw NotFoundError when user not found', async () => {
      mockRepository.findByEmail.mockResolvedValue(null)

      await expect(ReadOps.getUserByEmail('notfound@test.com')).rejects.toThrow('not found')
    })
  })

  describe('getUsersByFilter', () => {
    it('should return filtered users', async () => {
      const users = [{ id: 1, role: 'admin' }]
      mockRepository.findByFilter.mockResolvedValue(users)

      const result = await ReadOps.getUsersByFilter({ role: 'admin' })

      expect(result).toEqual(users)
    })

    it('should handle empty filters', async () => {
      mockRepository.findByFilter.mockResolvedValue([])

      const result = await ReadOps.getUsersByFilter()

      expect(result).toEqual([])
    })
  })
})

describe('User Service - Update Operations', () => {
  let mockRepository

  beforeEach(() => {
    mockRepository = { update: vi.fn() }
    vi.mocked(Helpers.getUserRepository).mockReturnValue(mockRepository)
  })

  it('should update user', async () => {
    const updates = { full_name: 'Updated Name' }
    mockRepository.update.mockResolvedValue({ id: 1, ...updates })

    const result = await UpdateOps.updateUser(1, updates)

    expect(result.full_name).toBe('Updated Name')
  })

  it('should throw BadRequestError for invalid id', async () => {
    await expect(UpdateOps.updateUser('invalid', { name: 'Test' })).rejects.toThrow('Invalid user ID')
  })

  it('should throw BadRequestError when no updates', async () => {
    await expect(UpdateOps.updateUser(1, {})).rejects.toThrow('No updates provided')
  })

  it('should throw ValidationError for invalid role', async () => {
    await expect(UpdateOps.updateUser(1, { role: 'superuser' })).rejects.toThrow('Invalid role')
  })

  it('should allow valid role update', async () => {
    const updates = { role: 'admin' }
    mockRepository.update.mockResolvedValue({ id: 1, role: 'admin' })

    const result = await UpdateOps.updateUser(1, updates)

    expect(result.role).toBe('admin')
  })
})

describe('User Service - Delete Operations', () => {
  let mockRepository

  beforeEach(() => {
    mockRepository = {
      delete: vi.fn(),
      reactivate: vi.fn()
    }
    vi.mocked(Helpers.getUserRepository).mockReturnValue(mockRepository)
    vi.mocked(Helpers.validateUserId).mockImplementation((id) => {
      if (!id || typeof id !== 'number') {
        throw new Error('Invalid user ID')
      }
    })
  })

  describe('deleteUser', () => {
    it('should delete user', async () => {
      mockRepository.delete.mockResolvedValue({ id: 1, active: false })

      const result = await DeleteOps.deleteUser(1)

      expect(result.active).toBe(false)
      expect(Helpers.validateUserId).toHaveBeenCalledWith(1, 'deleteUser')
    })

    it('should throw error for invalid id', async () => {
      await expect(DeleteOps.deleteUser('invalid')).rejects.toThrow('Invalid user ID')
    })
  })

  describe('reactivateUser', () => {
    it('should reactivate user', async () => {
      mockRepository.reactivate.mockResolvedValue({ id: 1, active: true })

      const result = await DeleteOps.reactivateUser(1)

      expect(result.active).toBe(true)
      expect(Helpers.validateUserId).toHaveBeenCalledWith(1, 'reactivateUser')
    })

    it('should throw error for invalid id', async () => {
      await expect(DeleteOps.reactivateUser(null)).rejects.toThrow('Invalid user ID')
    })
  })
})
