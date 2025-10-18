/**
 * Payment Controller API Integration Tests
 * Tests all payment endpoints with real API calls
 * Validates request/response formats and business logic
 * Follows KISS, DRY, and SSOT principles
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import app from '../../app.js'
import {
  createTestUser,
  createTestOrder,
  createTestPaymentMethod,
  deleteTestUser,
  deleteTestPaymentMethod,
  cancelTestOrder,
  getAdminToken
} from '../test-utils.js'

describe('Payment Controller API', () => {
  let testUser = null
  let testOrder = null
  let testPaymentMethod = null
  let authToken = null

  beforeEach(async () => {
    // Setup test entities
    testUser = await createTestUser()
    testPaymentMethod = await createTestPaymentMethod()

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
    if (testPaymentMethod) {
      await deleteTestPaymentMethod(testPaymentMethod.id)
    }
    if (testUser) {
      await deleteTestUser(testUser.id)
    }

    // Reset mocks
    vi.restoreAllMocks()
  })

  describe('GET /api/payments', () => {
    it('should get all payments with filters (admin only)', async () => {
      const response = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('message', 'Payments retrieved successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      await request(app).get('/api/payments').expect(401)
    })

    it('should handle query filters correctly', async () => {
      const response = await request(app)
        .get(`/api/payments?user_id=${testUser.id}&limit=10`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should handle status filter', async () => {
      const response = await request(app)
        .get('/api/payments?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should handle date range filters', async () => {
      const today = new Date().toISOString().split('T')[0]
      const response = await request(app)
        .get(`/api/payments?date_from=${today}&date_to=${today}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })

  describe('GET /api/payments/:id', () => {
    it('should get payment by ID (admin only)', async () => {
      // Create a test order first (payments are usually created with orders)
      testOrder = await createTestOrder(testUser.id, null) // We'll create a minimal product later if needed

      // Try to get a payment (might be empty but should not error)
      const response = await request(app)
        .get(`/api/payments/${testOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('message', 'Payment retrieved successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      await request(app).get('/api/payments/1').expect(401)
    })

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .get('/api/payments/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('GET /api/payments/order/:orderId', () => {
    it('should get payments by order ID', async () => {
      // Create a test order first
      testOrder = await createTestOrder(testUser.id, null)

      const response = await request(app).get(`/api/payments/order/${testOrder.id}`).expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('message', 'Order payments retrieved successfully')
    })

    it('should return 404 for non-existent order', async () => {
      const response = await request(app).get('/api/payments/order/999999').expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('GET /api/payments/user/:userId', () => {
    it('should get payments by user ID', async () => {
      const response = await request(app).get(`/api/payments/user/${testUser.id}`).expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('message', 'User payments retrieved successfully')
    })

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).get('/api/payments/user/999999').expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('POST /api/payments', () => {
    it('should create a new payment (admin only)', async () => {
      // Create a test order first
      testOrder = await createTestOrder(testUser.id, null)

      const newPayment = {
        order_id: testOrder.id,
        payment_method_id: testPaymentMethod.id,
        amount_usd: 25.99,
        amount_ves: 950.5,
        status: 'pending',
        payment_details: {
          reference: `TEST${Date.now()}`,
          notes: 'Test payment for integration tests'
        }
      }

      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPayment)
        .expect(201)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('order_id', newPayment.order_id)
      expect(response.body.data).toHaveProperty('payment_method_id', newPayment.payment_method_id)
      expect(response.body.data).toHaveProperty('amount_usd', newPayment.amount_usd)
      expect(response.body.data).toHaveProperty('status', newPayment.status)
      expect(response.body).toHaveProperty('message', 'Payment created successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      const newPayment = {
        order_id: 1,
        payment_method_id: testPaymentMethod.id,
        amount_usd: 25.99,
        status: 'pending'
      }

      await request(app).post('/api/payments').send(newPayment).expect(401)
    })

    it('should return 400 for validation errors', async () => {
      const invalidPayment = {
        order_id: '', // Empty order_id should fail
        payment_method_id: '', // Empty payment_method_id should fail
        amount_usd: -10, // Negative amount should fail
        status: 'invalid_status' // Invalid status should fail
      }

      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPayment)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'ValidationError')
    })

    it('should return 404 for non-existent order', async () => {
      const invalidPayment = {
        order_id: 999999, // Non-existent order
        payment_method_id: testPaymentMethod.id,
        amount_usd: 25.99,
        status: 'pending'
      }

      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPayment)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('PUT /api/payments/:id', () => {
    it('should update an existing payment (admin only)', async () => {
      // Create a test order and payment first
      testOrder = await createTestOrder(testUser.id, null)

      const newPayment = {
        order_id: testOrder.id,
        payment_method_id: testPaymentMethod.id,
        amount_usd: 25.99,
        amount_ves: 950.5,
        status: 'pending'
      }

      const createResponse = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPayment)

      const paymentId = createResponse.body.data.id

      // Now update the payment
      const updatedData = {
        status: 'completed',
        amount_ves: 1000.0,
        payment_details: {
          reference: `UPDATED${Date.now()}`,
          completed_at: new Date().toISOString()
        }
      }

      const response = await request(app)
        .put(`/api/payments/${paymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('status', updatedData.status)
      expect(response.body.data).toHaveProperty('amount_ves', updatedData.amount_ves)
      expect(response.body).toHaveProperty('message', 'Payment updated successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      const updatedData = {
        status: 'completed'
      }

      await request(app).put('/api/payments/1').send(updatedData).expect(401)
    })

    it('should return 404 for non-existent payment', async () => {
      const updatedData = {
        status: 'completed'
      }

      const response = await request(app)
        .put('/api/payments/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 400 for validation errors', async () => {
      const invalidData = {
        status: 'invalid_status', // Invalid status should fail
        amount_usd: -5 // Negative amount should fail
      }

      const response = await request(app)
        .put('/api/payments/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'ValidationError')
    })
  })

  describe('PATCH /api/payments/:id/status', () => {
    it('should update payment status (admin only)', async () => {
      // Create a test order and payment first
      testOrder = await createTestOrder(testUser.id, null)

      const newPayment = {
        order_id: testOrder.id,
        payment_method_id: testPaymentMethod.id,
        amount_usd: 25.99,
        amount_ves: 950.5,
        status: 'pending'
      }

      const createResponse = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPayment)

      const paymentId = createResponse.body.data.id

      // Update payment status
      const response = await request(app)
        .patch(`/api/payments/${paymentId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed', notes: 'Payment completed successfully' })
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('status', 'completed')
      expect(response.body).toHaveProperty('message', 'Payment status updated successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      await request(app).patch('/api/payments/1/status').send({ status: 'completed' }).expect(401)
    })

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .patch('/api/payments/999999/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' })
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .patch('/api/payments/1/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid_status' })
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/payments/:id', () => {
    it('should soft-delete a payment (admin only)', async () => {
      // Create a test order and payment first
      testOrder = await createTestOrder(testUser.id, null)

      const newPayment = {
        order_id: testOrder.id,
        payment_method_id: testPaymentMethod.id,
        amount_usd: 25.99,
        amount_ves: 950.5,
        status: 'pending'
      }

      const createResponse = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPayment)

      const paymentId = createResponse.body.data.id

      // Delete the payment
      const response = await request(app)
        .delete(`/api/payments/${paymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('message', 'Payment deactivated successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      await request(app).delete('/api/payments/1').expect(401)
    })

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .delete('/api/payments/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('Response Structure Consistency', () => {
    it('should return consistent response structure for all endpoints', async () => {
      // Test GET all payments
      const getAllResponse = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(getAllResponse.body).toHaveProperty('success', true)
      expect(getAllResponse.body).toHaveProperty('data')
      expect(getAllResponse.body).toHaveProperty('message')
      expect(typeof getAllResponse.body.message).toBe('string')

      // Test GET payments by user
      const userPaymentsResponse = await request(app)
        .get(`/api/payments/user/${testUser.id}`)
        .expect(200)

      expect(userPaymentsResponse.body).toHaveProperty('success', true)
      expect(userPaymentsResponse.body).toHaveProperty('data')
      expect(userPaymentsResponse.body).toHaveProperty('message')
      expect(typeof userPaymentsResponse.body.message).toBe('string')
    })
  })

  describe('HTTP Status Codes', () => {
    it('should return correct HTTP status codes for all operations', async () => {
      // Create a test order first
      testOrder = await createTestOrder(testUser.id, null)

      // Create a new payment for status code testing
      const newPayment = {
        order_id: testOrder.id,
        payment_method_id: testPaymentMethod.id,
        amount_usd: 19.99,
        amount_ves: 750.5,
        status: 'pending'
      }

      // POST should return 201 (Created)
      const postResponse = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPayment)
        .expect(201)

      const createdPaymentId = postResponse.body.data.id

      // GET should return 200 (OK)
      await request(app)
        .get(`/api/payments/${createdPaymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // PUT should return 200 (OK)
      await request(app)
        .put(`/api/payments/${createdPaymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'processing' })
        .expect(200)

      // PATCH status should return 200 (OK)
      await request(app)
        .patch(`/api/payments/${createdPaymentId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' })
        .expect(200)

      // DELETE should return 200 (OK)
      await request(app)
        .delete(`/api/payments/${createdPaymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
    })
  })
})
