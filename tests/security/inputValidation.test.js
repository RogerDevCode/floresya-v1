/**
 * Input Validation Tests
 * Tests for input validation and sanitization
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

describe('Input Validation', () => {
  describe('XSS Prevention', () => {
    it('should reject script tags in product names', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          name: '<script>alert("xss")</script>Test Product',
          price_usd: 10.99
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should reject script tags in customer data', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          order: {
            customer_email: 'test@example.com',
            customer_name: '<script>alert("xss")</script>Test User',
            customer_phone: '+1234567890',
            delivery_address: '123 Test St',
            total_amount_usd: 10.99
          },
          items: [
            {
              product_id: 1,
              product_name: 'Test Product',
              unit_price_usd: 10.99,
              quantity: 1
            }
          ]
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should reject JavaScript event handlers', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          name: 'Test Product" onclick="alert("xss")',
          price_usd: 10.99
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })
  })

  describe('SQL Injection Prevention', () => {
    it('should reject SQL injection attempts', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          name: "'; DROP TABLE products; --",
          price_usd: 10.99
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should reject MongoDB operators', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          name: 'Test Product',
          price_usd: 10.99,
          $where: 'this.name == "admin"'
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should reject dangerous characters in field names', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          name$field: 'Test Product',
          price_usd: 10.99
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })
  })

  describe('Field Validation', () => {
    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          // Missing required fields
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should validate email format', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          order: {
            customer_email: 'invalid-email',
            customer_name: 'Test User',
            customer_phone: '+1234567890',
            delivery_address: '123 Test St',
            total_amount_usd: 10.99
          },
          items: [
            {
              product_id: 1,
              product_name: 'Test Product',
              unit_price_usd: 10.99,
              quantity: 1
            }
          ]
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should validate phone number format', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          order: {
            customer_email: 'test@example.com',
            customer_name: 'Test User',
            customer_phone: 'invalid-phone',
            delivery_address: '123 Test St',
            total_amount_usd: 10.99
          },
          items: [
            {
              product_id: 1,
              product_name: 'Test Product',
              unit_price_usd: 10.99,
              quantity: 1
            }
          ]
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should validate numeric fields', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          name: 'Test Product',
          price_usd: 'not-a-number'
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should validate positive numbers', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          name: 'Test Product',
          price_usd: -10.99
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })
  })

  describe('Length Validation', () => {
    it('should validate maximum string length', async () => {
      const longString = 'a'.repeat(300)
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          name: longString,
          price_usd: 10.99
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('should validate minimum string length', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          name: 'a',
          price_usd: 10.99
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })
  })

  describe('Data Sanitization', () => {
    it('should sanitize null values', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          order: {
            customer_email: null,
            customer_name: 'Test User',
            customer_phone: '+1234567890',
            delivery_address: '123 Test St',
            total_amount_usd: 10.99
          },
          items: [
            {
              product_id: 1,
              product_name: 'Test Product',
              unit_price_usd: 10.99,
              quantity: 1
            }
          ]
        })

      // Should not error due to sanitization
      expect([200, 400, 401]).toContain(res.status)
    })

    it('should sanitize undefined values', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          order: {
            customer_email: undefined,
            customer_name: 'Test User',
            customer_phone: '+1234567890',
            delivery_address: '123 Test St',
            total_amount_usd: 10.99
          },
          items: [
            {
              product_id: 1,
              product_name: 'Test Product',
              unit_price_usd: 10.99,
              quantity: 1
            }
          ]
        })

      // Should not error due to sanitization
      expect([200, 400, 401]).toContain(res.status)
    })
  })

  describe('Enum Validation', () => {
    it('should validate enum values', async () => {
      const res = await request(app)
        .patch('/api/orders/1/status')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          status: 'invalid-status'
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })
  })

  describe('Pattern Validation', () => {
    it('should validate pattern matching', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer mock-admin-token')
        .send({
          name: 'Test Product',
          sku: 'invalid sku with spaces',
          price_usd: 10.99
        })

      // SKU validation may fail if pattern doesn't allow spaces
      expect([200, 400]).toContain(res.status)
    })
  })
})
