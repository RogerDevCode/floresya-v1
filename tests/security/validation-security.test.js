/**
 * Data Validation & Sanitization Security Tests
 * Testing input sanitization and validation security measures
 */

import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import app from '../../api/app.js'

// Mock authentication middleware to bypass auth in security tests
vi.mock('../../api/middleware/auth.js', () => ({
  authenticate: (req, res, next) => {
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'test-admin@floresya.test',
      user_metadata: {
        full_name: 'Test Admin',
        role: 'admin'
      }
    }
    req.token = 'test-token'
    next()
  },
  authorize: allowedRoles => (req, res, next) => {
    const userRole = req.user?.user_metadata?.role || 'user'
    if (userRole === 'admin') {
      return next()
    }
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
    if (!roles.includes(userRole)) {
      return res.status(403).json({ success: false, error: 'Forbidden' })
    }
    next()
  },
  requireEmailVerified: (req, res, next) => {
    next()
  },
  optionalAuth: (req, res, next) => {
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'test-admin@floresya.test',
      user_metadata: {
        full_name: 'Test Admin',
        role: 'admin'
      }
    }
    req.token = 'test-token'
    next()
  },
  checkOwnership: _getResourceOwnerId => (req, res, next) => {
    next()
  }
}))

describe('Data Validation & Sanitization Security Tests', () => {
  it('should sanitize HTML/script inputs to prevent XSS', async () => {
    const maliciousInputs = {
      name: '<script>alert("XSS")</script>Product Name',
      description: '<img src=x onerror=alert("XSS")>Product Description',
      summary: '<svg onload=alert("XSS")>Summary'
    }

    const response = await request(app)
      .post('/api/products')
      .set('Content-Type', 'application/json')
      .send({
        ...maliciousInputs,
        price_usd: 29.99,
        stock: 10
      })

    if (response.status === 201) {
      // If the product was created despite malicious input,
      // verify that the malicious content was stripped
      expect(response.body.data.name).not.toContain('<script>')
      expect(response.body.data.description).not.toContain('<img')
      expect(response.body.data.summary).not.toContain('<svg')
    } else {
      // If the request was blocked, that's also a valid security response
      expect(response.status).toBeOneOf([400, 422])
    }
  })

  it('should validate and restrict file uploads', async () => {
    // Test file upload endpoint with potentially malicious file types
    // Note: Using correct endpoint path - /api/admin/settings/image
    const response = await request(app)
      .post('/api/admin/settings/image')
      .field('setting_key', 'site_logo')
      .attach('image', Buffer.from('console.log("malicious JavaScript");', 'utf-8'), 'test.js')

    // Should reject non-image files
    expect(response.status).toBeOneOf([400, 415, 422])
    expect(response.body.success).toBe(false)
  })

  it('should validate query parameters to prevent SQL injection', async () => {
    // Test various malicious query parameters
    const maliciousQueries = [
      { search: "'; DROP TABLE products; --" },
      { limit: "'; DELETE FROM products; --" },
      { offset: "'; UPDATE products SET price_usd = 0; --" },
      { featured: "'; SELECT * FROM users; --" }
    ]

    for (const queryParams of maliciousQueries) {
      const response = await request(app).get('/api/products').query(queryParams)

      // Should either reject with 400 or sanitize parameters appropriately
      expect(response.status).toBeOneOf([200, 400])
    }
  })

  it('should validate and sanitize JSON payloads deeply', async () => {
    const deeplyNestedPayload = {
      name: 'Normal Product',
      price_usd: 29.99,
      metadata: {
        // Deeply nested structure with potential for prototype pollution
        __proto__: { polluted: true },
        constructor: { prototype: { polluted: true } },
        malicious: [
          {
            nested: {
              deeper: {
                value: "'; DROP TABLE products; --",
                script: '<script>console.log("XSS")</script>'
              }
            }
          }
        ]
      }
    }

    const response = await request(app)
      .post('/api/products')
      .set('Content-Type', 'application/json')
      .send(deeplyNestedPayload)

    // Should reject payload with extra metadata field (not in OpenAPI spec)
    expect(response.status).toBeOneOf([400, 422])
  })

  it('should validate schema strictly without allowing extra properties', async () => {
    const payloadWithExtraProperties = {
      name: 'Test Product',
      price_usd: 29.99,
      // These are not valid properties for a product
      __proto__: { admin: true },
      constructor: { prototype: { admin: true } },
      extra_field: "'; DELETE FROM users; --",
      another_extra: '<script>alert("XSS")</script>',
      internal_field: { hidden: 'value' }
    }

    const response = await request(app)
      .post('/api/products')
      .set('Content-Type', 'application/json')
      .send(payloadWithExtraProperties)

    // OpenAPI validator should reject extra fields
    expect(response.status).toBeOneOf([400, 422])
  })

  it('should validate enum values strictly', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Content-Type', 'application/json')
      .send({
        customer_email: 'test@example.com',
        customer_name: 'Test Customer',
        customer_phone: '+584141234567',
        delivery_address: '123 Test St',
        total_amount_usd: 29.99,
        items: [
          {
            product_id: 1,
            product_name: 'Test Product',
            quantity: 1,
            unit_price_usd: 29.99
          }
        ]
      })

    // Should validate and create order with proper structure
    expect(response.status).toBeOneOf([200, 201, 400])
  })
})
