/**
 * Auth Service Tests - Vitest Edition
 * Comprehensive testing of authentication service operations
 * Following KISS principle and Supabase best practices
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks } from './setup.js'
import {
  UnauthorizedError,
  BadRequestError,
  ConflictError,
  DatabaseError
} from '../../api/errors/AppError.js'

// Unmock error mapping to allow real error wrapping
vi.unmock('../../api/middleware/error/index.js')

// Mock Supabase client
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      refreshSession: vi.fn(),
      getUser: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn()
    }
  }
}))

// Import services after mocks are set up
import {
  signUp,
  signIn,
  signOut,
  refreshToken,
  getUser,
  resetPassword,
  updatePassword
} from '../../api/services/authService.js'

describe('Auth Service - Authentication Operations', () => {
  let mockSupabase

  beforeEach(async () => {
    resetAllMocks()

    // Get the mocked supabase instance
    const { supabase } = await import('../../api/services/supabaseClient.js')
    mockSupabase = supabase

    // Initialize all auth mocks
    mockSupabase.auth.signUp = vi.fn()
    mockSupabase.auth.signInWithPassword = vi.fn()
    mockSupabase.auth.signOut = vi.fn()
    mockSupabase.auth.refreshSession = vi.fn()
    mockSupabase.auth.getUser = vi.fn()
    mockSupabase.auth.resetPasswordForEmail = vi.fn()
    mockSupabase.auth.updateUser = vi.fn()
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('signUp - User registration', () => {
    test('should successfully register new user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User', phone: '+1234567890' }
      }
      const mockSession = { access_token: 'token123', refresh_token: 'refresh123' }

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await signUp('test@example.com', 'Password123!', {
        full_name: 'Test User',
        phone: '+1234567890'
      })

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
        options: {
          data: {
            full_name: 'Test User',
            phone: '+1234567890',
            role: 'user'
          }
        }
      })
      expect(result).toEqual({
        user: mockUser,
        session: mockSession,
        message: 'Check your email to verify your account'
      })
    })

    test('should throw BadRequestError for invalid email', async () => {
      await expect(signUp('', 'Password123!')).rejects.toThrow(BadRequestError)
      await expect(signUp(null, 'Password123!')).rejects.toThrow(BadRequestError)
      await expect(signUp(123, 'Password123!')).rejects.toThrow(BadRequestError)
    })

    test('should throw BadRequestError for invalid email format', async () => {
      await expect(signUp('invalid-email', 'Password123!')).rejects.toThrow(BadRequestError)
    })

    test('should throw BadRequestError for invalid password', async () => {
      await expect(signUp('test@example.com', '')).rejects.toThrow(BadRequestError)
      await expect(signUp('test@example.com', null)).rejects.toThrow(BadRequestError)
      await expect(signUp('test@example.com', 123)).rejects.toThrow(BadRequestError)
    })

    test('should throw BadRequestError for weak password - too short', async () => {
      await expect(signUp('test@example.com', 'Short1!')).rejects.toThrow(BadRequestError)
    })

    test('should throw BadRequestError for weak password - no uppercase', async () => {
      await expect(signUp('test@example.com', 'password123!')).rejects.toThrow(BadRequestError)
    })

    test('should throw BadRequestError for weak password - no lowercase', async () => {
      await expect(signUp('test@example.com', 'PASSWORD123!')).rejects.toThrow(BadRequestError)
    })

    test('should throw BadRequestError for weak password - no number', async () => {
      await expect(signUp('test@example.com', 'Password!')).rejects.toThrow(BadRequestError)
    })

    test('should throw BadRequestError for weak password - no special character', async () => {
      await expect(signUp('test@example.com', 'Password123')).rejects.toThrow(BadRequestError)
    })

    test('should throw ConflictError for existing email', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' }
      })

      await expect(signUp('existing@example.com', 'Password123!')).rejects.toThrow(ConflictError)
    })

    test('should throw DatabaseError when signup fails', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      await expect(signUp('test@example.com', 'Password123!')).rejects.toEqual({
        message: 'Database error'
      })
    })

    test('should throw DatabaseError when no user returned', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: null
      })

      await expect(signUp('test@example.com', 'Password123!')).rejects.toThrow(DatabaseError)
    })
  })

  describe('signIn - User authentication', () => {
    test('should successfully sign in user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com'
      }
      const mockSession = {
        access_token: 'access123',
        refresh_token: 'refresh123'
      }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await signIn('test@example.com', 'Password123!')

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!'
      })
      expect(result).toEqual({
        user: mockUser,
        session: mockSession,
        accessToken: 'access123',
        refreshToken: 'refresh123'
      })
    })

    test('should throw BadRequestError for invalid email', async () => {
      await expect(signIn('', 'Password123!')).rejects.toThrow(BadRequestError)
      await expect(signIn(null, 'Password123!')).rejects.toThrow(BadRequestError)
    })

    test('should throw BadRequestError for invalid password', async () => {
      await expect(signIn('test@example.com', '')).rejects.toThrow(BadRequestError)
      await expect(signIn('test@example.com', null)).rejects.toThrow(BadRequestError)
    })

    test('should throw UnauthorizedError for invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' }
      })

      await expect(signIn('test@example.com', 'wrongpassword')).rejects.toThrow(UnauthorizedError)
    })

    test('should throw UnauthorizedError when no session returned', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123' }, session: null },
        error: null
      })

      await expect(signIn('test@example.com', 'Password123!')).rejects.toThrow(UnauthorizedError)
    })

    test('should throw UnauthorizedError when signin fails with database error', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      })

      await expect(signIn('test@example.com', 'Password123!')).rejects.toThrow(UnauthorizedError)
    })
  })

  describe('signOut - User logout', () => {
    test('should successfully sign out user', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      })

      const result = await signOut('token123')

      expect(mockSupabase.auth.signOut).toHaveBeenCalledWith('token123')
      expect(result).toEqual({ message: 'Signed out successfully' })
    })

    test('should throw DatabaseError when signout fails', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Signout failed' }
      })

      await expect(signOut('token123')).rejects.toThrow(DatabaseError)
    })
  })

  describe('refreshToken - Token refresh', () => {
    test('should successfully refresh token', async () => {
      const mockSession = {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token'
      }

      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const result = await refreshToken('old_refresh_token')

      expect(mockSupabase.auth.refreshSession).toHaveBeenCalledWith({
        refreshToken: 'old_refresh_token'
      })
      expect(result).toEqual({
        session: mockSession,
        accessToken: 'new_access_token'
      })
    })

    test('should throw UnauthorizedError for invalid refresh token', async () => {
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: null,
        error: { message: 'Invalid refresh token' }
      })

      await expect(refreshToken('invalid_token')).rejects.toThrow(UnauthorizedError)
    })

    test('should throw UnauthorizedError when no session returned', async () => {
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      await expect(refreshToken('token')).rejects.toThrow(UnauthorizedError)
    })

    test('should throw UnauthorizedError when refresh fails with database error', async () => {
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      await expect(refreshToken('token')).rejects.toThrow(UnauthorizedError)
    })
  })

  describe('getUser - Get user from token', () => {
    test('should successfully get user from token', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com'
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await getUser('access_token')

      expect(mockSupabase.auth.getUser).toHaveBeenCalledWith('access_token')
      expect(result).toEqual(mockUser)
    })

    test('should throw UnauthorizedError for invalid token', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: null,
        error: { message: 'Invalid token' }
      })

      await expect(getUser('invalid_token')).rejects.toThrow(UnauthorizedError)
    })

    test('should throw UnauthorizedError when no user returned', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      await expect(getUser('token')).rejects.toThrow(UnauthorizedError)
    })

    test('should throw UnauthorizedError when getUser fails with database error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      await expect(getUser('token')).rejects.toThrow(UnauthorizedError)
    })
  })

  describe('resetPassword - Password reset request', () => {
    test('should successfully send password reset email', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: null
      })

      const result = await resetPassword('test@example.com')

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: expect.stringContaining('/reset-password')
      })
      expect(result).toEqual({
        message: 'Password reset email sent. Check your inbox.'
      })
    })

    test('should throw BadRequestError for invalid email', async () => {
      await expect(resetPassword('')).rejects.toThrow(BadRequestError)
      await expect(resetPassword(null)).rejects.toThrow(BadRequestError)
    })

    test('should throw DatabaseError when reset fails', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: { message: 'Reset failed' }
      })

      await expect(resetPassword('test@example.com')).rejects.toThrow(DatabaseError)
    })
  })

  describe('updatePassword - Password update', () => {
    test('should successfully update password', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      mockSupabase.auth.updateUser.mockResolvedValue({
        error: null
      })

      const result = await updatePassword('access_token', 'NewPassword123!')

      expect(mockSupabase.auth.getUser).toHaveBeenCalledWith('access_token')
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'NewPassword123!'
      })
      expect(result).toEqual({
        message: 'Password updated successfully'
      })
    })

    test('should throw BadRequestError for invalid password', async () => {
      await expect(updatePassword('token', '')).rejects.toThrow(BadRequestError)
      await expect(updatePassword('token', null)).rejects.toThrow(BadRequestError)
    })

    test('should throw BadRequestError for weak password', async () => {
      await expect(updatePassword('token', 'weak')).rejects.toThrow(BadRequestError)
    })

    test('should throw UnauthorizedError for invalid token', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: null,
        error: { message: 'Invalid token' }
      })

      await expect(updatePassword('invalid_token', 'NewPassword123!')).rejects.toThrow(
        UnauthorizedError
      )
    })

    test('should throw DatabaseError when update fails', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      mockSupabase.auth.updateUser.mockResolvedValue({
        error: { message: 'Update failed' }
      })

      await expect(updatePassword('token', 'NewPassword123!')).rejects.toThrow(DatabaseError)
    })
  })
})
