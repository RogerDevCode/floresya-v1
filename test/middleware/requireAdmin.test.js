/**
 * Tests for requireAdmin middleware
 * Validates admin-only access control
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { requireAdmin } from '../../api/middleware/auth/requireAdmin.js'
import { ForbiddenError } from '../../api/errors/AppError.js'

describe('requireAdmin Middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      path: '/admin/test',
      user: null
    }
    res = {}
    next = vi.fn()
  })

  it('should allow access when user is admin', () => {
    req.user = {
      id: 1,
      email: 'admin@test.com',
      user_metadata: { role: 'admin' }
    }

    requireAdmin(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should deny access when user is not admin', () => {
    req.user = {
      id: 2,
      email: 'user@test.com',
      user_metadata: { role: 'user' }
    }

    requireAdmin(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    const error = next.mock.calls[0][0]
    expect(error).toBeInstanceOf(ForbiddenError)
    expect(error.message).toBe('Admin access required')
  })

  it('should deny access when user has no role metadata', () => {
    req.user = {
      id: 3,
      email: 'norole@test.com'
    }

    requireAdmin(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    const error = next.mock.calls[0][0]
    expect(error).toBeInstanceOf(ForbiddenError)
    expect(error.message).toBe('Admin access required')
  })

  it('should deny access when no user in request', () => {
    req.user = null

    requireAdmin(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    const error = next.mock.calls[0][0]
    expect(error).toBeInstanceOf(ForbiddenError)
    expect(error.message).toBe('Authentication required')
  })

  it('should allow access when role is in user object directly', () => {
    req.user = {
      id: 4,
      email: 'admin2@test.com',
      role: 'admin'
    }

    requireAdmin(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(next).toHaveBeenCalledTimes(1)
  })
})
