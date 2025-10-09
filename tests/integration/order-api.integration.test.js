/**
 * Order API Integration Tests
 * Testing the complete order API flow
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'
import app from '../../api/app.js'

// Mock authentication middleware for integration tests
vi.mock('../../api/middleware/auth.js', () => ({
  authenticate: (req, res, next) => {
    // Mock admin user for all authenticated requests
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

  authorize: () => (req, res, next) => {
    // Always allow for admin role
    next()
  },

  checkOwnership: () => (req, res, next) => {
    // Admin bypasses ownership check
    next()
  }
}))

describe('Order API Integration Tests', () => {
  let createdOrderId = null
  let createdProductId = null

  const testProduct = {
    name: 'Order Test Product',
    price_usd: 24.99,
    stock: 100,
    sku: 'ORD-TEST-001'
  }

  const testOrder = {
    customer_email: 'integration-test@example.com',
    customer_name: 'Integration Test Customer',
    delivery_address: '123 Test Street',
    total_amount_usd: 49.98, // 2 items at $24.99 each
    user_id: null
  }

  const orderItems = [
    {
      product_id: null, // Will be set after product creation
      product_name: 'Order Test Product',
      quantity: 2,
      unit_price_usd: 24.99,
      subtotal_usd: 49.98
    }
  ]

  beforeAll(async () => {
    // Create a test product first
    const productResponse = await request(app)
      .post('/api/products')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer admin-token')
      .send(testProduct)

    expect(productResponse.status).toBe(201)
    createdProductId = productResponse.body.data.id
    orderItems[0].product_id = createdProductId
  })

  afterAll(async () => {
    // Clean up created test order
    if (createdOrderId) {
      await request(app)
        .delete(`/api/orders/${createdOrderId}`)
        .set('Authorization', 'Bearer admin-token')
    }

    // Clean up created test product
    if (createdProductId) {
      await request(app)
        .delete(`/api/products/${createdProductId}`)
        .set('Authorization', 'Bearer admin-token')
    }
  })

  it('should create a new order with items', async () => {
    // Create order with items
    const response = await request(app)
      .post('/api/orders')
      .set('Content-Type', 'application/json')
      .send({
        order: testOrder,
        items: orderItems
      })

    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveProperty('id')
    expect(response.body.data.customer_email).toBe(testOrder.customer_email)
    expect(response.body.data.total_amount_usd).toBe(testOrder.total_amount_usd)
    expect(Array.isArray(response.body.data.order_items)).toBe(true)
    expect(response.body.data.order_items.length).toBe(1)

    createdOrderId = response.body.data.id
  })

  it('should retrieve the created order by ID', async () => {
    const response = await request(app)
      .get(`/api/orders/${createdOrderId}`)
      .set('Authorization', 'Bearer admin-token')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.id).toBe(createdOrderId)
    expect(response.body.data.customer_email).toBe(testOrder.customer_email)
    expect(Array.isArray(response.body.data.order_items)).toBe(true)
  })

  it('should retrieve all orders with filtering', async () => {
    const response = await request(app)
      .get('/api/orders')
      .query({
        customer_email: 'integration-test@example.com',
        status: 'pending'
      })
      .set('Authorization', 'Bearer admin-token')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(Array.isArray(response.body.data)).toBe(true)
    expect(response.body.data).toContainEqual(
      expect.objectContaining({
        id: createdOrderId,
        customer_email: testOrder.customer_email
      })
    )
  })

  it('should update order status', async () => {
    const response = await request(app)
      .patch(`/api/orders/${createdOrderId}/status`)
      .set('Content-Type', 'application/json')
      .send({ new_status: 'verified' })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.status).toBe('verified')
  })

  it('should update order details', async () => {
    const response = await request(app)
      .put(`/api/orders/${createdOrderId}`)
      .set('Content-Type', 'application/json')
      .send({
        delivery_address: '456 Updated Street',
        delivery_notes: 'Leave at front desk'
      })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.delivery_address).toBe('456 Updated Street')
    expect(response.body.data.delivery_notes).toBe('Leave at front desk')
  })

  it('should get order status history', async () => {
    const response = await request(app)
      .get(`/api/orders/${createdOrderId}/status-history`)
      .set('Authorization', 'Bearer admin-token')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(Array.isArray(response.body.data)).toBe(true)
    expect(response.body.data.length).toBeGreaterThan(0)

    // Check that the history includes the status changes we made
    expect(response.body.data).toContainEqual(
      expect.objectContaining({
        order_id: createdOrderId,
        new_status: 'verified'
      })
    )
  })

  it('should cancel the order', async () => {
    const response = await request(app)
      .patch(`/api/orders/${createdOrderId}/cancel`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer admin-token')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.status).toBe('cancelled')
  })
})
