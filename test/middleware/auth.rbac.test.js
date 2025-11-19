/**
 * Role-Based Access Control (RBAC) Tests
 * Critical security tests for authentication and authorization
 * Tests both admin and customer access to all protected routes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import { authenticate, authorize, requireEmailVerified, checkOwnership } from '../../api/middleware/auth/auth.middleware.js'
import requireAdmin from '../../api/middleware/auth/requireAdmin.js'
import { errorHandler } from '../../api/middleware/error/errorHandler.js'
import * as authService from '../../api/services/authService.index.js'

// Mock auth service
vi.mock('../../api/services/authService.index.js')

describe('RBAC - Role-Based Access Control', () => {
  let app

  // Mock users
  const adminUser = {
    id: 'admin-123',
    email: 'admin@floresya.com',
    user_metadata: { role: 'admin' },
    email_confirmed_at: '2025-01-01T00:00:00Z'
  }

  const customerUser = {
    id: 'customer-456',
    email: 'customer@example.com',
    user_metadata: { role: 'customer' },
    email_confirmed_at: '2025-01-01T00:00:00Z'
  }

  const unverifiedUser = {
    id: 'unverified-789',
    email: 'unverified@example.com',
    user_metadata: { role: 'customer' },
    email_confirmed_at: null
  }

  beforeEach(() => {
    app = express()
    app.use(express.json())
    vi.clearAllMocks()

    // Mock environment
    process.env.NODE_ENV = 'test'
  })

  describe('Authentication Middleware', () => {
    it('should reject requests without token', async () => {
      app.get('/test', authenticate, (req, res) => res.json({ success: true }))
      app.use(errorHandler)

      const response = await request(app).get('/test')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('UnauthorizedError')
      expect(response.body.message).toContain('Authentication required')
    })

    it('should reject requests with invalid token', async () => {
      authService.getUser.mockRejectedValueOnce(new Error('Invalid token'))

      app.get('/test', authenticate, (req, res) => res.json({ success: true }))
      app.use(errorHandler)

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer invalid-token')

      expect(response.status).toBe(500)
      expect(response.body.success).toBe(false)
    })

    it('should authenticate admin user successfully', async () => {
      authService.getUser.mockResolvedValueOnce(adminUser)

      app.get('/test', authenticate, (req, res) => {
        res.json({
          success: true,
          user: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.user_metadata.role
          }
        })
      })

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer admin-token')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.user.role).toBe('admin')
      expect(authService.getUser).toHaveBeenCalledWith('admin-token')
    })

    it('should authenticate customer user successfully', async () => {
      authService.getUser.mockResolvedValueOnce(customerUser)

      app.get('/test', authenticate, (req, res) => {
        res.json({
          success: true,
          user: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.user_metadata.role
          }
        })
      })

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer customer-token')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.user.role).toBe('customer')
    })
  })

  describe('Admin Authorization Middleware', () => {
    it('should allow admin access', async () => {
      authService.getUser.mockResolvedValueOnce(adminUser)

      app.get('/admin-only', authenticate, requireAdmin, (req, res) => {
        res.json({ success: true, message: 'Admin access granted' })
      })
      app.use(errorHandler)

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', 'Bearer admin-token')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should deny customer access to admin routes', async () => {
      authService.getUser.mockResolvedValueOnce(customerUser)

      app.get('/admin-only', authenticate, requireAdmin, (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandler)

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', 'Bearer customer-token')

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('ForbiddenError')
      expect(response.body.message).toContain('Admin access required')
    })

    it('should deny unauthenticated access', async () => {
      app.get('/admin-only', authenticate, requireAdmin, (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandler)

      const response = await request(app).get('/admin-only')

      expect(response.status).toBe(401)
    })
  })

  describe('Role-Based Authorization', () => {
    it('should allow admin to access admin-only route', async () => {
      authService.getUser.mockResolvedValueOnce(adminUser)

      app.get('/admin-route', authenticate, authorize('admin'), (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandler)

      const response = await request(app)
        .get('/admin-route')
        .set('Authorization', 'Bearer admin-token')

      expect(response.status).toBe(200)
    })

    it('should allow customer to access customer route', async () => {
      authService.getUser.mockResolvedValueOnce(customerUser)

      app.get('/customer-route', authenticate, authorize('customer'), (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandler)

      const response = await request(app)
        .get('/customer-route')
        .set('Authorization', 'Bearer customer-token')

      expect(response.status).toBe(200)
    })

    it('should allow multiple roles', async () => {
      authService.getUser.mockResolvedValueOnce(customerUser)

      app.get('/multi-role', authenticate, authorize(['admin', 'customer']), (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandler)

      const response = await request(app)
        .get('/multi-role')
        .set('Authorization', 'Bearer customer-token')

      expect(response.status).toBe(200)
    })

    it('should deny wrong role', async () => {
      authService.getUser.mockResolvedValueOnce(customerUser)

      app.get('/admin-only', authenticate, authorize('admin'), (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandler)

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', 'Bearer customer-token')

      expect(response.status).toBe(403)
      expect(response.body.error).toBe('ForbiddenError')
      expect(response.body.message).toContain('Insufficient permissions')
    })
  })

  describe('Email Verification Requirement', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
    })

    it('should allow verified users', async () => {
      authService.getUser.mockResolvedValueOnce(customerUser)

      app.get('/verified-only', authenticate, requireEmailVerified, (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandler)

      const response = await request(app)
        .get('/verified-only')
        .set('Authorization', 'Bearer customer-token')

      expect(response.status).toBe(200)
    })

    it('should deny unverified users in production', async () => {
      authService.getUser.mockResolvedValueOnce(unverifiedUser)

      app.get('/verified-only', authenticate, requireEmailVerified, (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandler)

      const response = await request(app)
        .get('/verified-only')
        .set('Authorization', 'Bearer unverified-token')

      expect(response.status).toBe(403)
      expect(response.body.error).toBe('ForbiddenError')
      expect(response.body.message).toContain('Email verification required')
    })
  })

  describe('Resource Ownership Check', () => {
    it('should allow owner to access their resource', async () => {
      authService.getUser.mockResolvedValueOnce(customerUser)

      app.get('/orders/:id', authenticate, checkOwnership(req => req.params.id), (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandler)

      const response = await request(app)
        .get('/orders/customer-456')
        .set('Authorization', 'Bearer customer-token')

      expect(response.status).toBe(200)
    })

    it('should deny non-owner access', async () => {
      authService.getUser.mockResolvedValueOnce(customerUser)

      app.get('/orders/:id', authenticate, checkOwnership(req => req.params.id), (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandler)

      const response = await request(app)
        .get('/orders/other-user-789')
        .set('Authorization', 'Bearer customer-token')

      expect(response.status).toBe(403)
      expect(response.body.error).toBe('ForbiddenError')
      expect(response.body.message).toContain('not resource owner')
    })

    it('should allow admin to bypass ownership check', async () => {
      authService.getUser.mockResolvedValueOnce(adminUser)

      app.get('/orders/:id', authenticate, checkOwnership(req => req.params.id), (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandler)

      const response = await request(app)
        .get('/orders/any-user-789')
        .set('Authorization', 'Bearer admin-token')

      expect(response.status).toBe(200)
    })
  })

  describe('Accounting Routes Access Control', () => {
    it('should allow admin to access accounting routes', async () => {
      authService.getUser.mockResolvedValueOnce(adminUser)

      app.get('/accounting/expenses', authenticate, requireAdmin, (req, res) => {
        res.json({ success: true, data: [] })
      })
      app.use(errorHandler)

      const response = await request(app)
        .get('/accounting/expenses')
        .set('Authorization', 'Bearer admin-token')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should deny customer access to accounting routes', async () => {
      authService.getUser.mockResolvedValueOnce(customerUser)

      app.get('/accounting/expenses', authenticate, requireAdmin, (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandler)

      const response = await request(app)
        .get('/accounting/expenses')
        .set('Authorization', 'Bearer customer-token')

      expect(response.status).toBe(403)
      expect(response.body.error).toBe('ForbiddenError')
      expect(response.body.message).toContain('Admin access required')
    })

    it('should deny unauthenticated access to accounting routes', async () => {
      app.get('/accounting/expenses', authenticate, requireAdmin, (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandler)

      const response = await request(app).get('/accounting/expenses')

      expect(response.status).toBe(401)
    })
  })

  describe('Cross-Role Security Scenarios', () => {
    it('should prevent privilege escalation', async () => {
      const customerAttemptingAdmin = {
        ...customerUser,
        user_metadata: { role: 'customer' }
      }
      authService.getUser.mockResolvedValueOnce(customerAttemptingAdmin)

      app.get('/admin-endpoint', authenticate, requireAdmin, (req, res) => {
        res.json({ success: true, sensitive: 'data' })
      })
      app.use(errorHandler)

      const response = await request(app)
        .get('/admin-endpoint')
        .set('Authorization', 'Bearer customer-token')

      expect(response.status).toBe(403)
      expect(response.body).not.toHaveProperty('sensitive')
    })

    it('should handle missing role metadata', async () => {
      const userNoRole = {
        id: 'user-999',
        email: 'norole@example.com',
        user_metadata: {},
        email_confirmed_at: '2025-01-01T00:00:00Z'
      }
      authService.getUser.mockResolvedValueOnce(userNoRole)

      app.get('/admin-endpoint', authenticate, requireAdmin, (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandler)

      const response = await request(app)
        .get('/admin-endpoint')
        .set('Authorization', 'Bearer token')

      expect(response.status).toBe(403)
    })

    it('should handle null user_metadata', async () => {
      const userNullMeta = {
        id: 'user-888',
        email: 'nullmeta@example.com',
        user_metadata: null,
        email_confirmed_at: '2025-01-01T00:00:00Z'
      }
      authService.getUser.mockResolvedValueOnce(userNullMeta)

      app.get('/admin-endpoint', authenticate, requireAdmin, (req, res) => {
        res.json({ success: true })
      })
      app.use(errorHandler)

      const response = await request(app)
        .get('/admin-endpoint')
        .set('Authorization', 'Bearer token')

      expect(response.status).toBe(403)
    })
  })
})
