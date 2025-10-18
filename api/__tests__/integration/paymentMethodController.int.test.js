/**
 * Payment Method Controller API Integration Tests
 * Tests all payment method endpoints with real API calls
 * Validates request/response formats and business logic
 * Follows KISS, DRY, and SSOT principles
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import app from '../../app.js'
import { createTestPaymentMethod, deleteTestPaymentMethod, getAdminToken } from '../test-utils.js'

describe('Payment Method Controller API', () => {
  let testPaymentMethod = null
  let authToken = null

  beforeEach(async () => {
    // Setup test payment method
    testPaymentMethod = await createTestPaymentMethod()

    // Setup auth token for admin operations
    authToken = getAdminToken()
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
      expect(response.body).toHaveProperty('message', 'Payment methods retrieved successfully')
    })

    it('should handle limit parameter correctly', async () => {
      const response = await request(app).get('/api/payment-methods?limit=5').expect(200)

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
      expect(response.body.data).toHaveProperty('type', testPaymentMethod.type)
      expect(response.body).toHaveProperty('message', 'Payment method retrieved successfully')
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
        name: `New Test Payment Method ${Date.now()}`,
        type: 'credit_card',
        description: 'New test payment method for integration tests',
        account_info: '4111-1111-1111-1111',
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
      expect(response.body.data).toHaveProperty('account_info', newPaymentMethod.account_info)
      expect(response.body.data).toHaveProperty('display_order', newPaymentMethod.display_order)
      expect(response.body.data).toHaveProperty('is_active', true)
      expect(response.body).toHaveProperty('message', 'Payment method created successfully')

      // Cleanup
      await deleteTestPaymentMethod(response.body.data.id)
    })

    it('should return 401 for unauthorized access', async () => {
      const newPaymentMethod = {
        name: 'Unauthorized Payment Method',
        type: 'bank_transfer'
      }

      await request(app).post('/api/payment-methods').send(newPaymentMethod).expect(401)
    })

    it('should return 400 for validation errors', async () => {
      const invalidPaymentMethod = {
        name: '', // Empty name should fail validation
        type: 'invalid_type', // Invalid type should fail validation
        display_order: -1 // Negative order should fail validation
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
        name: 'Updated Payment Method Name',
        description: 'Updated description for the payment method',
        display_order: 5,
        account_info: '5555-5555-5555-5555'
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
      expect(response.body.data).toHaveProperty('account_info', updatedData.account_info)
      expect(response.body).toHaveProperty('message', 'Payment method updated successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      const updatedData = {
        name: 'Unauthorized Update'
      }

      await request(app)
        .put(`/api/payment-methods/${testPaymentMethod.id}`)
        .send(updatedData)
        .expect(401)
    })

    it('should return 404 for non-existent payment method', async () => {
      const updatedData = {
        name: 'Non-existent Payment Method'
      }

      const response = await request(app)
        .put('/api/payment-methods/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 400 for validation errors', async () => {
      const invalidData = {
        name: '', // Empty name should fail
        type: 'invalid_type', // Invalid type should fail
        display_order: -5 // Negative order should fail
      }

      const response = await request(app)
        .put(`/api/payment-methods/${testPaymentMethod.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'ValidationError')
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
      expect(response.body).toHaveProperty('message', 'Payment method deactivated successfully')

      // Verify it's deactivated (should return 404 when trying to get it)
      const verifyResponse = await request(app)
        .get(`/api/payment-methods/${testPaymentMethod.id}`)
        .expect(404)

      expect(verifyResponse.body).toHaveProperty('success', false)
      expect(verifyResponse.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 401 for unauthorized access', async () => {
      await request(app).delete(`/api/payment-methods/${testPaymentMethod.id}`).expect(401)
    })

    it('should return 404 for non-existent payment method', async () => {
      const response = await request(app)
        .delete('/api/payment-methods/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
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
      expect(response.body).toHaveProperty('message', 'Payment method reactivated successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      await request(app)
        .patch(`/api/payment-methods/${testPaymentMethod.id}/reactivate`)
        .expect(401)
    })

    it('should return 404 for non-existent payment method', async () => {
      const response = await request(app)
        .patch('/api/payment-methods/999999/reactivate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
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
      expect(response.body).toHaveProperty('message', 'Display order updated successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      await request(app)
        .patch(`/api/payment-methods/${testPaymentMethod.id}/display-order`)
        .send({ order: 10 })
        .expect(401)
    })

    it('should return 404 for non-existent payment method', async () => {
      const response = await request(app)
        .patch('/api/payment-methods/999999/display-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ order: 10 })
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
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

  describe('Response Structure Consistency', () => {
    it('should return consistent response structure for all endpoints', async () => {
      // Test GET all payment methods
      const getAllResponse = await request(app).get('/api/payment-methods').expect(200)

      expect(getAllResponse.body).toHaveProperty('success', true)
      expect(getAllResponse.body).toHaveProperty('data')
      expect(getAllResponse.body).toHaveProperty('message')
      expect(typeof getAllResponse.body.message).toBe('string')

      // Test GET payment method by ID
      const getByIdResponse = await request(app)
        .get(`/api/payment-methods/${testPaymentMethod.id}`)
        .expect(200)

      expect(getByIdResponse.body).toHaveProperty('success', true)
      expect(getByIdResponse.body).toHaveProperty('data')
      expect(getByIdResponse.body).toHaveProperty('message')
      expect(typeof getByIdResponse.body.message).toBe('string')
    })
  })

  describe('HTTP Status Codes', () => {
    it('should return correct HTTP status codes for all operations', async () => {
      // Create a new payment method for status code testing
      const newPaymentMethod = {
        name: `Status Test Payment Method ${Date.now()}`,
        type: 'bank_transfer',
        description: 'Status code test payment method',
        account_info: '0123-4567-8901-2345',
        display_order: 5
      }

      // POST should return 201 (Created)
      const postResponse = await request(app)
        .post('/api/payment-methods')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPaymentMethod)
        .expect(201)

      const createdPaymentMethodId = postResponse.body.data.id

      // GET should return 200 (OK)
      await request(app).get(`/api/payment-methods/${createdPaymentMethodId}`).expect(200)

      // PUT should return 200 (OK)
      await request(app)
        .put(`/api/payment-methods/${createdPaymentMethodId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Status Test Payment Method' })
        .expect(200)

      // DELETE should return 200 (OK)
      await request(app)
        .delete(`/api/payment-methods/${createdPaymentMethodId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Cleanup
      await deleteTestPaymentMethod(createdPaymentMethodId)
    })
  })
})
