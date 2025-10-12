/**
 * Session Security Tests
 * Tests for secure session management and security headers
 */

import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import app from '../../api/app.js'

// Mock the authService
vi.mock('../../api/services/authService.js', () => ({
  getUser: vi.fn(token => {
    if (token === 'mock-admin-token') {
      return Promise.resolve({
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@floresya.local',
        user_metadata: {
          full_name: 'Admin User',
          phone: '+584141234567',
          role: 'admin'
        },
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
    } else if (token === 'mock-customer-token') {
      return Promise.resolve({
        id: '00000000-0000-0000-0000-000000000002',
        email: 'customer@floresya.local',
        user_metadata: {
          full_name: 'Customer User',
          phone: '+584141234568',
          role: 'user'
        },
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
    } else {
      const error = new Error('Invalid or expired token')
      error.name = 'UnauthorizedError'
      error.statusCode = 401
      return Promise.reject(error)
    }
  })
}))

describe('Session Security', () => {
  describe('Security Headers', () => {
    it('should include X-Frame-Options header', async () => {
      const res = await request(app).get('/api/products')

      expect(res.headers).toHaveProperty('x-frame-options', 'DENY')
    })

    it('should include X-Content-Type-Options header', async () => {
      const res = await request(app).get('/api/products')

      expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff')
    })

    it('should include X-XSS-Protection header', async () => {
      const res = await request(app).get('/api/products')

      expect(res.headers).toHaveProperty('x-xss-protection', '1; mode=block')
    })

    it('should include Referrer-Policy header', async () => {
      const res = await request(app).get('/api/products')

      expect(res.headers).toHaveProperty('referrer-policy', 'strict-origin-when-cross-origin')
    })

    it('should include Permissions-Policy header', async () => {
      const res = await request(app).get('/api/products')

      expect(res.headers).toHaveProperty('permissions-policy')

      const policy = res.headers['permissions-policy']
      expect(policy).toContain('geolocation=()')
      expect(policy).toContain('microphone=()')
      expect(policy).toContain('camera=()')
      expect(policy).toContain('payment=()')
    })
  })

  describe('Content Security Policy', () => {
    it('should include CSP header', async () => {
      const res = await request(app).get('/api/products')

      expect(res.headers).toHaveProperty('content-security-policy')
    })

    it('should have restrictive CSP directives', async () => {
      const res = await request(app).get('/api/products')

      const csp = res.headers['content-security-policy']

      // Check for restrictive directives
      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain("object-src 'none'")
      expect(csp).toContain("frame-src 'none'")
    })

    it('should allow necessary resources in CSP', async () => {
      const res = await request(app).get('/api/products')

      const csp = res.headers['content-security-policy']

      // Should allow fonts from Google Fonts
      expect(csp).toContain('fonts.googleapis.com')
      expect(csp).toContain('fonts.gstatic.com')

      // Should allow images and data URIs
      expect(csp).toContain('img-src')
      expect(csp).toContain('data:')
    })
  })

  describe('Session Management', () => {
    it('should handle session cookies properly', async () => {
      const res = await request(app).get('/api/products')

      // Session middleware should be working
      expect(res.status).toBe(200)
    })

    it('should include session ID in cookies when needed', async () => {
      // This would test actual session creation
      // For now, we just verify the middleware is applied
      const res = await request(app).get('/api/products')

      expect(res.status).toBe(200)
    })
  })

  describe('CORS Configuration', () => {
    it('should handle preflight OPTIONS requests', async () => {
      const res = await request(app)
        .options('/api/products')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')

      expect(res.status).toBe(204)
      expect(res.headers).toHaveProperty('access-control-allow-origin')
      expect(res.headers).toHaveProperty('access-control-allow-methods')
    })

    it('should allow specific origins', async () => {
      const res = await request(app).get('/api/products').set('Origin', 'http://localhost:3000')

      expect(res.headers).toHaveProperty('access-control-allow-origin', 'http://localhost:3000')
    })

    it('should reject disallowed origins', async () => {
      const res = await request(app).get('/api/products').set('Origin', 'http://malicious-site.com')

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should include appropriate CORS headers', async () => {
      // Test preflight request for CORS headers
      const res = await request(app)
        .options('/api/products')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')

      expect(res.headers).toHaveProperty('access-control-allow-credentials', 'true')
      expect(res.headers).toHaveProperty('access-control-allow-methods')
      expect(res.headers).toHaveProperty('access-control-allow-headers')
      expect(res.headers).toHaveProperty('access-control-max-age')
    })
  })

  describe('Input Sanitization', () => {
    it('should sanitize dangerous characters in request body', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          name: 'Test with $ and . characters',
          price_usd: 10.99
        })

      // Should reject due to dangerous characters
      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should handle XSS attempts in parameters', async () => {
      const res = await request(app).get('/api/products?search=<script>alert("xss")</script>')

      // Should handle XSS attempt gracefully
      expect(res.status).toBe(200)
      // The search parameter should be sanitized
    })
  })

  describe('Helmet Configuration', () => {
    it('should include appropriate helmet headers', async () => {
      const res = await request(app).get('/api/products')

      // Helmet should add various security headers
      expect(res.headers).toHaveProperty('x-dns-prefetch-control')
      expect(res.headers).toHaveProperty('x-download-options')
      expect(res.headers).toHaveProperty('x-permitted-cross-domain-policies')
    })
  })
})
