/**
 * Payment Method API Integration Tests
 * Tests all payment method endpoints with real API calls
 * Validates request/response formats and business logic
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import app from '../../app.js'
import { createTestPaymentMethod, deleteTestPaymentMethod } from '../test-utils.js'

describe('Payment Method API', () => {
  let testPaymentMethod = null
  let authToken = null

  beforeEach(async () => {
    // Setup test payment method
    testPaymentMethod = await createTestPaymentMethod()

    // Setup auth token for admin operations
    authToken = process.env.TEST_ADMIN_TOKEN || 'test-admin-token'
  })

  afterEach(async () => {
    // Cleanup test payment method
    if (testPaymentMethod) {
      await deleteTestPaymentMethod(testPaymentMethod.id)
    }

    // Reset mocks
    vi.restoreAllMocks()
  })

  describe('GET /api/payment-methods', () => {
    it('should get all active payment methods', async () => {
      const response = await request(app).get('/api/payment-methods').expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should handle invalid limit parameter', async () => {
      const response = await request(app).get('/api/payment-methods?limit=invalid').expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/payment-methods/:id', () => {
    it('should get payment method by ID', async () => {
      const response = await request(app)
        .get(`/api/payment-methods/${testPaymentMethod.id}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id', testPaymentMethod.id)
      expect(response.body.data).toHaveProperty('name', testPaymentMethod.name)
    })

    it('should return 404 for non-existent payment method', async () => {
      const response = await request(app).get('/api/payment-methods/999999').expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 400 for invalid ID', async () => {
      const response = await request(app).get('/api/payment-methods/invalid').expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/payment-methods', () => {
    it('should create a new payment method (admin only)', async () => {
      const newPaymentMethod = {
        name: 'Test Payment Method',
        type: 'bank_transfer',
        description: 'Test payment method for integration tests',
        account_info: '0123-4567-8901-2345',
        display_order: 10
      }

      const response = await request(app)
        .post('/api/payment-methods')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPaymentMethod)
        .expect(201)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('name', newPaymentMethod.name)
      expect(response.body.data).toHaveProperty('type', newPaymentMethod.type)
      expect(response.body.data).toHaveProperty('is_active', true)

      // Cleanup
      await deleteTestPaymentMethod(response.body.data.id)
    })

    it('should return 401 for unauthorized access', async () => {
      const newPaymentMethod = {
        name: 'Test Payment Method',
        type: 'bank_transfer'
      }

      await request(app).post('/api/payment-methods').send(newPaymentMethod).expect(401)
    })

    it('should return 400 for validation errors', async () => {
      const invalidPaymentMethod = {
        name: '', // Empty name should fail validation
        type: 'invalid_type' // Invalid type should fail validation
      }

      const response = await request(app)
        .post('/api/payment-methods')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPaymentMethod)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'ValidationError')
    })
  })

  describe('PUT /api/payment-methods/:id', () => {
    it('should update an existing payment method (admin only)', async () => {
      const updatedData = {
        name: 'Updated Payment Method',
        description: 'Updated description',
        display_order: 5
      }

      const response = await request(app)
        .put(`/api/payment-methods/${testPaymentMethod.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('name', updatedData.name)
      expect(response.body.data).toHaveProperty('description', updatedData.description)
      expect(response.body.data).toHaveProperty('display_order', updatedData.display_order)
    })

    it('should return 401 for unauthorized access', async () => {
      const updatedData = {
        name: 'Updated Payment Method'
      }

      await request(app)
        .put(`/api/payment-methods/${testPaymentMethod.id}`)
        .send(updatedData)
        .expect(401)
    })

    it('should return 404 for non-existent payment method', async () => {
      const updatedData = {
        name: 'Updated Payment Method'
      }

      const response = await request(app)
        .put('/api/payment-methods/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('DELETE /api/payment-methods/:id', () => {
    it('should soft-delete a payment method (admin only)', async () => {
      const response = await request(app)
        .delete(`/api/payment-methods/${testPaymentMethod.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')

      // Verify it's deactivated
      const verifyResponse = await request(app)
        .get(`/api/payment-methods/${testPaymentMethod.id}`)
        .expect(404)

      expect(verifyResponse.body).toHaveProperty('success', false)
      expect(verifyResponse.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 401 for unauthorized access', async () => {
      await request(app).delete(`/api/payment-methods/${testPaymentMethod.id}`).expect(401)
    })
  })

  describe('PATCH /api/payment-methods/:id/reactivate', () => {
    it('should reactivate a payment method (admin only)', async () => {
      // First deactivate the payment method
      await request(app)
        .delete(`/api/payment-methods/${testPaymentMethod.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Then reactivate it
      const response = await request(app)
        .patch(`/api/payment-methods/${testPaymentMethod.id}/reactivate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('is_active', true)
    })

    it('should return 401 for unauthorized access', async () => {
      await request(app)
        .patch(`/api/payment-methods/${testPaymentMethod.id}/reactivate`)
        .expect(401)
    })
  })

  describe('PATCH /api/payment-methods/:id/display-order', () => {
    it('should update payment method display order (admin only)', async () => {
      const response = await request(app)
        .patch(`/api/payment-methods/${testPaymentMethod.id}/display-order`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ order: 15 })
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('display_order', 15)
    })

    it('should return 401 for unauthorized access', async () => {
      await request(app)
        .patch(`/api/payment-methods/${testPaymentMethod.id}/display-order`)
        .send({ order: 15 })
        .expect(401)
    })

    it('should return 400 for invalid order parameter', async () => {
      const response = await request(app)
        .patch(`/api/payment-methods/${testPaymentMethod.id}/display-order`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ order: -1 }) // Negative order should fail
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })
  })
})
