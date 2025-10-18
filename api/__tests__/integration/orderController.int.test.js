/**
 * Order Controller API Integration Tests
 * Tests all order endpoints with real API calls
 * Validates request/response formats and business logic
 * Follows KISS, DRY, and SSOT principles
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import app from '../../app.js'
import {
  createTestUser,
  createTestProduct,
  deleteTestUser,
  deleteTestProduct,
  createTestOrder,
  cancelTestOrder,
  getAdminToken
} from '../test-utils.js'

describe('Order Controller API', () => {
  let testUser = null
  let testProduct = null
  let testOrder = null
  let authToken = null

  beforeEach(async () => {
    // Setup test entities
    testUser = await createTestUser()
    testProduct = await createTestProduct()

    // Setup auth token for admin operations
    authToken = getAdminToken()
  })

  afterEach(async () => {
    // Cleanup test entities
    if (testOrder) {
      try {
        await cancelTestOrder(testOrder.id)
      } catch (_error) {
        // Order might already be cancelled
      }
    }
    if (testProduct) {
      await deleteTestProduct(testProduct.id)
    }
    if (testUser) {
      await deleteTestUser(testUser.id)
    }

    // Reset mocks
    vi.restoreAllMocks()
  })

  describe('GET /api/orders', () => {
    it('should get all orders with filters (admin only)', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('message', 'Orders retrieved successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      await request(app).get('/api/orders').expect(401)
    })

    it('should handle query filters correctly', async () => {
      const response = await request(app)
        .get(`/api/orders?user_id=${testUser.id}&limit=10`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should handle status filter', async () => {
      const response = await request(app)
        .get('/api/orders?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should handle date range filters', async () => {
      const today = new Date().toISOString().split('T')[0]
      const response = await request(app)
        .get(`/api/orders?date_from=${today}&date_to=${today}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should handle search parameter', async () => {
      const response = await request(app)
        .get(`/api/orders?search=${testUser.full_name.split(' ')[0]}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })

  describe('GET /api/orders/:id', () => {
    it('should get order by ID (admin only)', async () => {
      // Create a test order first
      testOrder = await createTestOrder(testUser.id, testProduct.id)

      const response = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id', testOrder.id)
      expect(response.body.data).toHaveProperty('user_id', testUser.id)
      expect(response.body).toHaveProperty('message', 'Order retrieved successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      // Create a test order first
      testOrder = await createTestOrder(testUser.id, testProduct.id)

      await request(app).get(`/api/orders/${testOrder.id}`).expect(401)
    })

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .get('/api/orders/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/orders/user/:userId', () => {
    it('should get orders by user', async () => {
      // Create a test order first
      testOrder = await createTestOrder(testUser.id, testProduct.id)

      const response = await request(app).get(`/api/orders/user/${testUser.id}`).expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('message', 'User orders retrieved successfully')
    })

    it('should handle status filter for user orders', async () => {
      // Create a test order first
      testOrder = await createTestOrder(testUser.id, testProduct.id)

      const response = await request(app)
        .get(`/api/orders/user/${testUser.id}?status=pending`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).get('/api/orders/user/999999').expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('GET /api/orders/:id/status-history', () => {
    it('should get order status history', async () => {
      // Create a test order first
      testOrder = await createTestOrder(testUser.id, testProduct.id)

      const response = await request(app)
        .get(`/api/orders/${testOrder.id}/status-history`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('message', 'Order status history retrieved successfully')
    })

    it('should return 404 for non-existent order', async () => {
      const response = await request(app).get('/api/orders/999999/status-history').expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('POST /api/orders', () => {
    it('should create a new order with items', async () => {
      const newOrder = {
        order: {
          user_id: testUser.id,
          delivery_address: 'New Test Address 123',
          delivery_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          delivery_time: '14:00',
          special_instructions: 'Handle with extra care',
          total_usd: 25.99,
          total_ves: 950.5
        },
        items: [
          {
            product_id: testProduct.id,
            quantity: 2,
            price_usd: 12.995,
            price_ves: 475.25
          }
        ]
      }

      const response = await request(app).post('/api/orders').send(newOrder).expect(201)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('user_id', testUser.id)
      expect(response.body.data).toHaveProperty('delivery_address', newOrder.order.delivery_address)
      expect(response.body.data).toHaveProperty('total_usd', newOrder.order.total_usd)
      expect(response.body).toHaveProperty('message', 'Order created successfully')

      // Store for cleanup
      testOrder = response.body.data
    })

    it('should return 400 for validation errors', async () => {
      const invalidOrder = {
        order: {
          user_id: '', // Empty user_id should fail
          delivery_address: '', // Empty address should fail
          delivery_date: 'invalid-date', // Invalid date should fail
          total_usd: -10 // Negative total should fail
        },
        items: [] // Empty items should fail
      }

      const response = await request(app).post('/api/orders').send(invalidOrder).expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'ValidationError')
    })

    it('should return 404 for non-existent user', async () => {
      const invalidOrder = {
        order: {
          user_id: 999999, // Non-existent user
          delivery_address: 'Test Address 123',
          delivery_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          delivery_time: '10:00',
          total_usd: 25.99,
          total_ves: 950.5
        },
        items: [
          {
            product_id: testProduct.id,
            quantity: 1,
            price_usd: 25.99,
            price_ves: 950.5
          }
        ]
      }

      const response = await request(app).post('/api/orders').send(invalidOrder).expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('PUT /api/orders/:id', () => {
    it('should update an existing order (admin only)', async () => {
      // Create a test order first
      testOrder = await createTestOrder(testUser.id, testProduct.id)

      const updatedData = {
        delivery_address: 'Updated Test Address 456',
        special_instructions: 'Updated instructions',
        total_usd: 35.99
      }

      const response = await request(app)
        .put(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('delivery_address', updatedData.delivery_address)
      expect(response.body.data).toHaveProperty(
        'special_instructions',
        updatedData.special_instructions
      )
      expect(response.body.data).toHaveProperty('total_usd', updatedData.total_usd)
      expect(response.body).toHaveProperty('message', 'Order updated successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      // Create a test order first
      testOrder = await createTestOrder(testUser.id, testProduct.id)

      const updatedData = {
        delivery_address: 'Unauthorized Update'
      }

      await request(app).put(`/api/orders/${testOrder.id}`).send(updatedData).expect(401)
    })

    it('should return 404 for non-existent order', async () => {
      const updatedData = {
        delivery_address: 'Non-existent Order'
      }

      const response = await request(app)
        .put('/api/orders/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 400 for validation errors', async () => {
      // Create a test order first
      testOrder = await createTestOrder(testUser.id, testProduct.id)

      const invalidData = {
        delivery_address: '', // Empty address should fail
        total_usd: -5 // Negative total should fail
      }

      const response = await request(app)
        .put(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'ValidationError')
    })
  })

  describe('PATCH /api/orders/:id/status', () => {
    it('should update order status (admin only)', async () => {
      // Create a test order first
      testOrder = await createTestOrder(testUser.id, testProduct.id)

      const response = await request(app)
        .patch(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'confirmed', notes: 'Order confirmed by admin' })
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('status', 'confirmed')
      expect(response.body).toHaveProperty('message', 'Order status updated successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      // Create a test order first
      testOrder = await createTestOrder(testUser.id, testProduct.id)

      await request(app)
        .patch(`/api/orders/${testOrder.id}/status`)
        .send({ status: 'confirmed' })
        .expect(401)
    })

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .patch('/api/orders/999999/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'confirmed' })
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 400 for invalid status', async () => {
      // Create a test order first
      testOrder = await createTestOrder(testUser.id, testProduct.id)

      const response = await request(app)
        .patch(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid_status' })
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PATCH /api/orders/:id/cancel', () => {
    it('should cancel an order', async () => {
      // Create a test order first
      testOrder = await createTestOrder(testUser.id, testProduct.id)

      const response = await request(app)
        .patch(`/api/orders/${testOrder.id}/cancel`)
        .send({ notes: 'Cancelled by customer' })
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('status', 'cancelled')
      expect(response.body).toHaveProperty('message', 'Order cancelled successfully')
    })

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .patch('/api/orders/999999/cancel')
        .send({ notes: 'Non-existent order' })
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 400 for already cancelled order', async () => {
      // Create and cancel a test order first
      testOrder = await createTestOrder(testUser.id, testProduct.id)
      await cancelTestOrder(testOrder.id)

      const response = await request(app)
        .patch(`/api/orders/${testOrder.id}/cancel`)
        .send({ notes: 'Already cancelled' })
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('Response Structure Consistency', () => {
    it('should return consistent response structure for all endpoints', async () => {
      // Create a test order first
      testOrder = await createTestOrder(testUser.id, testProduct.id)

      // Test GET all orders
      const getAllResponse = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(getAllResponse.body).toHaveProperty('success', true)
      expect(getAllResponse.body).toHaveProperty('data')
      expect(getAllResponse.body).toHaveProperty('message')
      expect(typeof getAllResponse.body.message).toBe('string')

      // Test GET order by ID
      const getByIdResponse = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(getByIdResponse.body).toHaveProperty('success', true)
      expect(getByIdResponse.body).toHaveProperty('data')
      expect(getByIdResponse.body).toHaveProperty('message')
      expect(typeof getByIdResponse.body.message).toBe('string')

      // Test GET user orders
      const userOrdersResponse = await request(app)
        .get(`/api/orders/user/${testUser.id}`)
        .expect(200)

      expect(userOrdersResponse.body).toHaveProperty('success', true)
      expect(userOrdersResponse.body).toHaveProperty('data')
      expect(userOrdersResponse.body).toHaveProperty('message')
      expect(typeof userOrdersResponse.body.message).toBe('string')

      // Test GET status history
      const historyResponse = await request(app)
        .get(`/api/orders/${testOrder.id}/status-history`)
        .expect(200)

      expect(historyResponse.body).toHaveProperty('success', true)
      expect(historyResponse.body).toHaveProperty('data')
      expect(historyResponse.body).toHaveProperty('message')
      expect(typeof historyResponse.body.message).toBe('string')
    })
  })

  describe('HTTP Status Codes', () => {
    it('should return correct HTTP status codes for all operations', async () => {
      // POST should return 201 (Created)
      const newOrder = {
        order: {
          user_id: testUser.id,
          delivery_address: 'Status Test Address 123',
          delivery_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          delivery_time: '10:00',
          total_usd: 19.99,
          total_ves: 750.5
        },
        items: [
          {
            product_id: testProduct.id,
            quantity: 1,
            price_usd: 19.99,
            price_ves: 750.5
          }
        ]
      }

      const postResponse = await request(app).post('/api/orders').send(newOrder).expect(201)

      const createdOrderId = postResponse.body.data.id

      // GET should return 200 (OK)
      await request(app)
        .get(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // PUT should return 200 (OK)
      await request(app)
        .put(`/api/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ delivery_address: 'Updated Status Address' })
        .expect(200)

      // PATCH status should return 200 (OK)
      await request(app)
        .patch(`/api/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'confirmed' })
        .expect(200)

      // PATCH cancel should return 200 (OK)
      await request(app)
        .patch(`/api/orders/${createdOrderId}/cancel`)
        .send({ notes: 'Status test cancellation' })
        .expect(200)

      // Store for cleanup
      testOrder = { id: createdOrderId }
    })
  })
})
