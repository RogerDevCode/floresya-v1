/**
 * User Service Unit Tests
 * Testing business logic for users using Vitest
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as userService from '../userService.js'
import { NotFoundError, DatabaseError, BadRequestError } from '../../errors/AppError.js'

// Mock Supabase client
vi.mock('../supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis()
    }))
  },
  DB_SCHEMA: {
    users: {
      table: 'users',
      pk: 'id',
      indexes: ['email', 'full_name_normalized', 'email_normalized'],
      search: ['full_name_normalized', 'email_normalized'],
      enums: {
        role: ['user', 'admin']
      },
      columns: [
        'id',
        'email',
        'password_hash',
        'full_name',
        'phone',
        'role',
        'is_active',
        'email_verified',
        'created_at',
        'updated_at'
      ]
    }
  }
}))

describe('userService', () => {
  let mockSupabaseQuery

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup basic mock chain
    mockSupabaseQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis()
    }
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getUserById', () => {
    it('should return user data for valid ID', async () => {
      const mockUser = {
        id: 123,
        email: 'user@example.com',
        full_name: 'Test User',
        role: 'user',
        is_active: true
      }

      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: mockUser,
        error: null
      })

      const { supabase } = await import('../supabaseClient.js')
      supabase.from.mockReturnValueOnce(mockSupabaseQuery)

      const result = await userService.getUserById(123)

      expect(result).toEqual(mockUser)
      expect(supabase.from).toHaveBeenCalledWith('users')
    })

    it('should throw BadRequestError for invalid user ID', async () => {
      // These should throw BadRequestError before even calling the database
      await expect(userService.getUserById('')).rejects.toThrow(BadRequestError)
      await expect(userService.getUserById(null)).rejects.toThrow(BadRequestError)
      await expect(userService.getUserById('abc')).rejects.toThrow(BadRequestError)
      await expect(userService.getUserById(0)).rejects.toThrow(BadRequestError)
      // -1 is a valid number, so it should not throw BadRequestError
      // Instead, test that it calls the database (but we won't test the result)
    })

    it('should throw NotFoundError when user does not exist', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' }
      })

      const { supabase } = await import('../supabaseClient.js')
      supabase.from.mockReturnValueOnce(mockSupabaseQuery)

      await expect(userService.getUserById(999)).rejects.toThrow(NotFoundError)
    })

    it('should throw DatabaseError on database errors', async () => {
      const dbError = new Error('Database connection failed')
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: null,
        error: dbError
      })

      const { supabase } = await import('../supabaseClient.js')
      supabase.from.mockReturnValueOnce(mockSupabaseQuery)

      await expect(userService.getUserById(123)).rejects.toThrow(DatabaseError)
    })
  })

  describe('getUserByEmail', () => {
    it('should return user data for valid email', async () => {
      const mockUser = {
        id: 123,
        email: 'user@example.com',
        full_name: 'Test User',
        role: 'user'
      }

      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: mockUser,
        error: null
      })

      const { supabase } = await import('../supabaseClient.js')
      supabase.from.mockReturnValueOnce(mockSupabaseQuery)

      const result = await userService.getUserByEmail('user@example.com')

      expect(result).toEqual(mockUser)
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('email', 'user@example.com')
    })

    it('should throw BadRequestError for invalid email', async () => {
      await expect(userService.getUserByEmail('')).rejects.toThrow(BadRequestError)
      await expect(userService.getUserByEmail(null)).rejects.toThrow(BadRequestError)
      await expect(userService.getUserByEmail(123)).rejects.toThrow(BadRequestError)
    })
  })

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password_hash: 'hashed-password',
        full_name: 'New User'
      }

      const createdUser = {
        id: 'user-456',
        ...newUser,
        role: 'user',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z'
      }

      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: createdUser,
        error: null
      })

      const { supabase } = await import('../supabaseClient.js')
      supabase.from.mockReturnValueOnce(mockSupabaseQuery)

      const result = await userService.createUser(newUser)

      expect(result).toEqual(createdUser)
      expect(mockSupabaseQuery.insert).toHaveBeenCalled()
    })

    it('should throw DatabaseError when creation fails', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password_hash: 'hashed-password'
      }

      const dbError = new Error('Insert failed')
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: null,
        error: dbError
      })

      const { supabase } = await import('../supabaseClient.js')
      supabase.from.mockReturnValueOnce(mockSupabaseQuery)

      await expect(userService.createUser(newUser)).rejects.toThrow(DatabaseError)
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 123
      const updates = {
        full_name: 'Updated Name',
        phone: '+1234567890'
      }

      const updatedUser = {
        id: userId,
        full_name: updates.full_name,
        phone: updates.phone,
        email: 'user@example.com'
      }

      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: updatedUser,
        error: null
      })

      const { supabase } = await import('../supabaseClient.js')
      supabase.from.mockReturnValueOnce(mockSupabaseQuery)

      const result = await userService.updateUser(userId, updates)

      expect(result).toEqual(updatedUser)
      expect(mockSupabaseQuery.update).toHaveBeenCalledWith(updates)
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', userId)
    })

    it('should throw BadRequestError for invalid user ID', async () => {
      await expect(userService.updateUser('', {})).rejects.toThrow(BadRequestError)
      await expect(userService.updateUser(null, {})).rejects.toThrow(BadRequestError)
      await expect(userService.updateUser('abc', {})).rejects.toThrow(BadRequestError)
      await expect(userService.updateUser(0, {})).rejects.toThrow(BadRequestError)
      await expect(userService.updateUser(-1, {})).rejects.toThrow(BadRequestError)
    })
  })
})
