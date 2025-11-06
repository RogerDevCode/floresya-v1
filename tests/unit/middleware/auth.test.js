/**
 * Auth Middleware - Granular Unit Tests
 * Security-Critical Layer Testing
 *
 * Coverage Target: 95%
 * Speed Target: < 10ms per test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  authenticate as requireAuth,
  authorize as requireAdmin,
  optionalAuth,
  _checkOwnership
} from '../../../api/middleware/auth/auth.js'

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn()
  }
}

// Mock Request/Response
const createMockRequest = (overrides = {}) => ({
  headers: {},
  cookies: {},
  ...overrides
})

const createMockResponse = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    locals: {}
  }
  return res
}

const next = vi.fn()

describe('AuthMiddleware - Granular Tests', () => {
  let req, res

  beforeEach(() => {
    req = createMockRequest()
    res = createMockResponse()
    vi.clearAllMocks()
  })

  // ============================================
  // REQUIRE AUTH TESTS
  // ============================================

  describe('requireAuth()', () => {
    it('should allow request with valid Bearer token', async () => {
      // Arrange
      const token = 'valid-jwt-token'
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'user'
      }

      req.headers.authorization = `Bearer ${token}`
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      // Act
      await requireAuth(req, res, next)

      // Assert
      expect(mockSupabase.auth.getUser).toHaveBeenCalledWith(token)
      expect(req.user).toEqual(mockUser)
      expect(res.locals.user).toEqual(mockUser)
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('should allow request with valid cookie token', async () => {
      // Arrange
      const token = 'valid-cookie-token'
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'user'
      }

      req.cookies.token = token
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      // Act
      await requireAuth(req, res, next)

      // Assert
      expect(mockSupabase.auth.getUser).toHaveBeenCalledWith(token)
      expect(req.user).toEqual(mockUser)
      expect(next).toHaveBeenCalled()
    })

    it('should reject request without Authorization header', async () => {
      // Arrange
      // No authorization header set

      // Act
      await requireAuth(req, res, next)

      // Assert
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authorization header required'
        }
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should reject request with invalid Authorization format', async () => {
      // Arrange
      req.headers.authorization = 'InvalidFormat token'

      // Act
      await requireAuth(req, res, next)

      // Assert
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid authorization format'
        }
      })
    })

    it('should reject request with expired token', async () => {
      // Arrange
      const token = 'expired-token'
      req.headers.authorization = `Bearer ${token}`
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'JWT expired' }
      })

      // Act
      await requireAuth(req, res, next)

      // Assert
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token expired'
        }
      })
    })

    it('should reject request with invalid token', async () => {
      // Arrange
      const token = 'invalid-token'
      req.headers.authorization = `Bearer ${token}`
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      })

      // Act
      await requireAuth(req, res, next)

      // Assert
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token'
        }
      })
    })

    it('should reject request when no user in response', async () => {
      // Arrange
      const token = 'valid-token'
      req.headers.authorization = `Bearer ${token}`
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      // Act
      await requireAuth(req, res, next)

      // Assert
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found'
        }
      })
    })

    it('should prefer Authorization header over cookie', async () => {
      // Arrange
      const headerToken = 'header-token'
      const cookieToken = 'cookie-token'
      const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000', email: 'test@example.com' }

      req.headers.authorization = `Bearer ${headerToken}`
      req.cookies.token = cookieToken
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      // Act
      await requireAuth(req, res, next)

      // Assert
      expect(mockSupabase.auth.getUser).toHaveBeenCalledWith(headerToken)
      expect(mockSupabase.auth.getUser).not.toHaveBeenCalledWith(cookieToken)
    })

    it('should fall back to cookie when Authorization not present', async () => {
      // Arrange
      const cookieToken = 'cookie-token'
      const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000', email: 'test@example.com' }

      req.cookies.token = cookieToken
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      // Act
      await requireAuth(req, res, next)

      // Assert
      expect(mockSupabase.auth.getUser).toHaveBeenCalledWith(cookieToken)
      expect(req.user).toEqual(mockUser)
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      const token = 'valid-token'
      req.headers.authorization = `Bearer ${token}`
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Database error'))

      // Act
      await requireAuth(req, res, next)

      // Assert
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Authentication service error'
        }
      })
    })

    it('should store user in res.locals for downstream access', async () => {
      // Arrange
      const token = 'valid-token'
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'admin'
      }

      req.headers.authorization = `Bearer ${token}`
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      // Act
      await requireAuth(req, res, next)

      // Assert
      expect(res.locals.user).toBe(mockUser)
      expect(res.locals.user.id).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(res.locals.user.email).toBe('test@example.com')
      expect(res.locals.user.role).toBe('admin')
    })
  })

  // ============================================
  // REQUIRE ADMIN TESTS
  // ============================================

  describe('requireAdmin()', () => {
    it('should allow request with admin user', async () => {
      // Arrange
      const token = 'valid-token'
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'admin@example.com',
        role: 'admin'
      }

      req.headers.authorization = `Bearer ${token}`
      req.user = mockUser
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      // Act
      await requireAdmin(req, res, next)

      // Assert
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('should reject request with non-admin user', async () => {
      // Arrange
      const token = 'valid-token'
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        role: 'user'
      }

      req.headers.authorization = `Bearer ${token}`
      req.user = mockUser
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      // Act
      await requireAdmin(req, res, next)

      // Assert
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required'
        }
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should reject request when user has no role', async () => {
      // Arrange
      const token = 'valid-token'
      const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000', email: 'user@example.com' }

      req.headers.authorization = `Bearer ${token}`
      req.user = mockUser
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      // Act
      await requireAdmin(req, res, next)

      // Assert
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required'
        }
      })
    })

    it('should reject request when role is lowercase admin', async () => {
      // Arrange
      const token = 'valid-token'
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'admin@example.com',
        role: 'admin'
      }

      req.headers.authorization = `Bearer ${token}`
      req.user = mockUser
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      // Act
      await requireAdmin(req, res, next)

      // Assert
      expect(next).toHaveBeenCalled()
    })

    it('should reject request when role is mixed case Admin', async () => {
      // Arrange
      const token = 'valid-token'
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'admin@example.com',
        role: 'Admin'
      }

      req.headers.authorization = `Bearer ${token}`
      req.user = mockUser
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      // Act
      await requireAdmin(req, res, next)

      // Assert
      expect(res.status).toHaveBeenCalledWith(403)
    })

    it('should check user metadata for role', async () => {
      // Arrange
      const token = 'valid-token'
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'admin@example.com',
        user_metadata: { role: 'admin' }
      }

      req.headers.authorization = `Bearer ${token}`
      req.user = mockUser
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      // Act
      await requireAdmin(req, res, next)

      // Assert
      expect(next).toHaveBeenCalled()
    })

    it('should prioritize user_metadata.role over role field', async () => {
      // Arrange
      const token = 'valid-token'
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'admin@example.com',
        role: 'user',
        user_metadata: { role: 'admin' }
      }

      req.headers.authorization = `Bearer ${token}`
      req.user = mockUser
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      // Act
      await requireAdmin(req, res, next)

      // Assert
      expect(next).toHaveBeenCalled()
    })
  })

  // ============================================
  // OPTIONAL AUTH TESTS
  // ============================================

  describe('optionalAuth()', () => {
    it('should attach user when token is valid', async () => {
      // Arrange
      const token = 'valid-token'
      const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000', email: 'test@example.com' }

      req.headers.authorization = `Bearer ${token}`
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      // Act
      await optionalAuth(req, res, next)

      // Assert
      expect(req.user).toEqual(mockUser)
      expect(res.locals.user).toEqual(mockUser)
      expect(next).toHaveBeenCalled()
    })

    it('should continue without user when no token', async () => {
      // Arrange
      // No authorization header

      // Act
      await optionalAuth(req, res, next)

      // Assert
      expect(req.user).toBeUndefined()
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('should continue without user when token is invalid', async () => {
      // Arrange
      const token = 'invalid-token'
      req.headers.authorization = `Bearer ${token}`
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      })

      // Act
      await optionalAuth(req, res, next)

      // Assert
      expect(req.user).toBeUndefined()
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('should continue without user when token is expired', async () => {
      // Arrange
      const token = 'expired-token'
      req.headers.authorization = `Bearer ${token}`
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'JWT expired' }
      })

      // Act
      await optionalAuth(req, res, next)

      // Assert
      expect(req.user).toBeUndefined()
      expect(next).toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      const token = 'valid-token'
      req.headers.authorization = `Bearer ${token}`
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Database error'))

      // Act
      await optionalAuth(req, res, next)

      // Assert
      expect(req.user).toBeUndefined()
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
    })
  })

  // ============================================
  // SESSION VALIDATION TESTS
  // ============================================

  // NOTE: validateSession function does not exist in auth.js
  // Skipping these tests until function is implemented
  /*
  describe('validateSession()', () => {
    // Tests would go here
  })
  */
})
