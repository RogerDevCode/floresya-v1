/**
 * Tests for authorize middleware
 * Validates role-based authorization
 */
// @ts-nocheck

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authorize } from '../../api/middleware/auth/auth.middleware.js'
import { ForbiddenError, UnauthorizedError } from '../../api/errors/AppError.js'

describe('authorize Middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      path: '/api/test',
      method: 'GET',
      user: null
    }
    res = {}
    next = vi.fn()
  })

  describe('Single role authorization', () => {
    it('should allow access when user has required role', () => {
      req.user = {
        id: 1,
        email: 'admin@test.com',
        user_metadata: { role: 'admin' }
      }

      const middleware = authorize('admin')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('should deny access when user does not have required role', () => {
      req.user = {
        id: 2,
        email: 'user@test.com',
        user_metadata: { role: 'user' }
      }

      const middleware = authorize('admin')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledTimes(1)
      const error = next.mock.calls[0][0]
      expect(error).toBeInstanceOf(ForbiddenError)
      expect(error.message).toContain('Insufficient permissions')
    })

    it('should deny access when no user in request', () => {
      req.user = null

      const middleware = authorize('admin')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledTimes(1)
      const error = next.mock.calls[0][0]
      expect(error).toBeInstanceOf(UnauthorizedError)
      expect(error.message).toBe('Authentication required')
    })
  })

  describe('Multiple roles authorization', () => {
    it('should allow access when user has one of allowed roles', () => {
      req.user = {
        id: 3,
        email: 'user@test.com',
        user_metadata: { role: 'user' }
      }

      const middleware = authorize(['admin', 'user'])
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('should allow admin access with multiple roles', () => {
      req.user = {
        id: 4,
        email: 'admin@test.com',
        user_metadata: { role: 'admin' }
      }

      const middleware = authorize(['admin', 'user'])
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('should deny access when user role not in allowed list', () => {
      req.user = {
        id: 5,
        email: 'guest@test.com',
        user_metadata: { role: 'guest' }
      }

      const middleware = authorize(['admin', 'user'])
      middleware(req, res, next)

      expect(next).toHaveBeenCalledTimes(1)
      const error = next.mock.calls[0][0]
      expect(error).toBeInstanceOf(ForbiddenError)
    })
  })

  describe('Role fallback logic', () => {
    it('should read role from user object when user_metadata missing', () => {
      req.user = {
        id: 6,
        email: 'admin@test.com',
        role: 'admin'
      }

      const middleware = authorize('admin')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('should default to "user" role when no role specified', () => {
      req.user = {
        id: 7,
        email: 'norole@test.com'
      }

      const middleware = authorize('user')
      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(next).toHaveBeenCalledTimes(1)
    })
  })
})
