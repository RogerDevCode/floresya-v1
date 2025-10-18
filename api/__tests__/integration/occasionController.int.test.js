/**
 * Occasion Controller API Integration Tests
 * Tests all occasion endpoints with real API calls
 * Validates request/response formats and business logic
 * Follows KISS, DRY, and SSOT principles
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import app from '../../app.js'
import { createTestOccasion, deleteTestOccasion, getAdminToken } from '../test-utils.js'

describe('Occasion Controller API', () => {
  let testOccasion = null
  let authToken = null

  beforeEach(async () => {
    // Setup test occasion
    testOccasion = await createTestOccasion()

    // Setup auth token for admin operations
    authToken = getAdminToken()
  })

  afterEach(async () => {
    // Cleanup test occasion
    if (testOccasion) {
      await deleteTestOccasion(testOccasion.id)
    }

    // Reset mocks
    vi.restoreAllMocks()
  })

  describe('GET /api/occasions', () => {
    it('should get all active occasions', async () => {
      const response = await request(app).get('/api/occasions').expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('message', 'Occasions retrieved successfully')
    })

    it('should handle limit parameter correctly', async () => {
      const response = await request(app).get('/api/occasions?limit=5').expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should handle includeInactive parameter for admin', async () => {
      const response = await request(app)
        .get('/api/occasions?includeInactive=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })

  describe('GET /api/occasions/:id', () => {
    it('should get occasion by ID', async () => {
      const response = await request(app).get(`/api/occasions/${testOccasion.id}`).expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id', testOccasion.id)
      expect(response.body.data).toHaveProperty('name', testOccasion.name)
      expect(response.body.data).toHaveProperty('slug', testOccasion.slug)
      expect(response.body).toHaveProperty('message', 'Occasion retrieved successfully')
    })

    it('should return 404 for non-existent occasion', async () => {
      const response = await request(app).get('/api/occasions/999999').expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 400 for invalid ID', async () => {
      const response = await request(app).get('/api/occasions/invalid').expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/occasions/slug/:slug', () => {
    it('should get occasion by slug', async () => {
      const response = await request(app)
        .get(`/api/occasions/slug/${testOccasion.slug}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id', testOccasion.id)
      expect(response.body.data).toHaveProperty('slug', testOccasion.slug)
      expect(response.body).toHaveProperty('message', 'Occasion retrieved successfully')
    })

    it('should return 404 for non-existent slug', async () => {
      const response = await request(app).get('/api/occasions/slug/non-existent-slug').expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('POST /api/occasions', () => {
    it('should create a new occasion (admin only)', async () => {
      const newOccasion = {
        name: `New Test Occasion ${Date.now()}`,
        description: 'New test occasion for integration tests',
        slug: `new-test-occasion-${Date.now()}`,
        display_order: 10
      }

      const response = await request(app)
        .post('/api/occasions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newOccasion)
        .expect(201)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('name', newOccasion.name)
      expect(response.body.data).toHaveProperty('slug', newOccasion.slug)
      expect(response.body.data).toHaveProperty('display_order', newOccasion.display_order)
      expect(response.body.data).toHaveProperty('is_active', true)
      expect(response.body).toHaveProperty('message', 'Occasion created successfully')

      // Cleanup
      await deleteTestOccasion(response.body.data.id)
    })

    it('should return 401 for unauthorized access', async () => {
      const newOccasion = {
        name: 'Unauthorized Occasion',
        slug: 'unauthorized-occasion'
      }

      await request(app).post('/api/occasions').send(newOccasion).expect(401)
    })

    it('should return 400 for validation errors', async () => {
      const invalidOccasion = {
        name: '', // Empty name should fail validation
        slug: '', // Empty slug should fail validation
        display_order: -1 // Negative order should fail validation
      }

      const response = await request(app)
        .post('/api/occasions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidOccasion)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'ValidationError')
    })
  })

  describe('PUT /api/occasions/:id', () => {
    it('should update an existing occasion (admin only)', async () => {
      const updatedData = {
        name: 'Updated Occasion Name',
        description: 'Updated description for the occasion',
        display_order: 5
      }

      const response = await request(app)
        .put(`/api/occasions/${testOccasion.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('name', updatedData.name)
      expect(response.body.data).toHaveProperty('description', updatedData.description)
      expect(response.body.data).toHaveProperty('display_order', updatedData.display_order)
      expect(response.body).toHaveProperty('message', 'Occasion updated successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      const updatedData = {
        name: 'Unauthorized Update'
      }

      await request(app).put(`/api/occasions/${testOccasion.id}`).send(updatedData).expect(401)
    })

    it('should return 404 for non-existent occasion', async () => {
      const updatedData = {
        name: 'Non-existent Occasion'
      }

      const response = await request(app)
        .put('/api/occasions/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 400 for validation errors', async () => {
      const invalidData = {
        name: '', // Empty name should fail
        display_order: -5 // Negative order should fail
      }

      const response = await request(app)
        .put(`/api/occasions/${testOccasion.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'ValidationError')
    })
  })

  describe('PATCH /api/occasions/:id/display-order', () => {
    it('should update display order (admin only)', async () => {
      const response = await request(app)
        .patch(`/api/occasions/${testOccasion.id}/display-order`)
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
        .patch(`/api/occasions/${testOccasion.id}/display-order`)
        .send({ order: 10 })
        .expect(401)
    })

    it('should return 404 for non-existent occasion', async () => {
      const response = await request(app)
        .patch('/api/occasions/999999/display-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ order: 10 })
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 400 for invalid order parameter', async () => {
      const response = await request(app)
        .patch(`/api/occasions/${testOccasion.id}/display-order`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ order: -1 }) // Negative order should fail
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/occasions/:id', () => {
    it('should soft-delete an occasion (admin only)', async () => {
      const response = await request(app)
        .delete(`/api/occasions/${testOccasion.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('message', 'Occasion deactivated successfully')

      // Verify it's deactivated (should return 404 when trying to get it)
      const verifyResponse = await request(app).get(`/api/occasions/${testOccasion.id}`).expect(404)

      expect(verifyResponse.body).toHaveProperty('success', false)
      expect(verifyResponse.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 401 for unauthorized access', async () => {
      await request(app).delete(`/api/occasions/${testOccasion.id}`).expect(401)
    })

    it('should return 404 for non-existent occasion', async () => {
      const response = await request(app)
        .delete('/api/occasions/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('PATCH /api/occasions/:id/reactivate', () => {
    it('should reactivate an occasion (admin only)', async () => {
      // First deactivate the occasion
      await request(app)
        .delete(`/api/occasions/${testOccasion.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Then reactivate it
      const response = await request(app)
        .patch(`/api/occasions/${testOccasion.id}/reactivate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('is_active', true)
      expect(response.body).toHaveProperty('message', 'Occasion reactivated successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      await request(app).patch(`/api/occasions/${testOccasion.id}/reactivate`).expect(401)
    })

    it('should return 404 for non-existent occasion', async () => {
      const response = await request(app)
        .patch('/api/occasions/999999/reactivate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('Response Structure Consistency', () => {
    it('should return consistent response structure for all endpoints', async () => {
      // Test GET all occasions
      const getAllResponse = await request(app).get('/api/occasions').expect(200)

      expect(getAllResponse.body).toHaveProperty('success', true)
      expect(getAllResponse.body).toHaveProperty('data')
      expect(getAllResponse.body).toHaveProperty('message')
      expect(typeof getAllResponse.body.message).toBe('string')

      // Test GET occasion by ID
      const getByIdResponse = await request(app)
        .get(`/api/occasions/${testOccasion.id}`)
        .expect(200)

      expect(getByIdResponse.body).toHaveProperty('success', true)
      expect(getByIdResponse.body).toHaveProperty('data')
      expect(getByIdResponse.body).toHaveProperty('message')
      expect(typeof getByIdResponse.body.message).toBe('string')

      // Test GET occasion by slug
      const getBySlugResponse = await request(app)
        .get(`/api/occasions/slug/${testOccasion.slug}`)
        .expect(200)

      expect(getBySlugResponse.body).toHaveProperty('success', true)
      expect(getBySlugResponse.body).toHaveProperty('data')
      expect(getBySlugResponse.body).toHaveProperty('message')
      expect(typeof getBySlugResponse.body.message).toBe('string')
    })
  })

  describe('HTTP Status Codes', () => {
    it('should return correct HTTP status codes for all operations', async () => {
      // Create a new occasion for status code testing
      const newOccasion = {
        name: `Status Test Occasion ${Date.now()}`,
        description: 'Status code test occasion',
        slug: `status-test-occasion-${Date.now()}`,
        display_order: 5
      }

      // POST should return 201 (Created)
      const postResponse = await request(app)
        .post('/api/occasions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newOccasion)
        .expect(201)

      const createdOccasionId = postResponse.body.data.id

      // GET should return 200 (OK)
      await request(app).get(`/api/occasions/${createdOccasionId}`).expect(200)

      // PUT should return 200 (OK)
      await request(app)
        .put(`/api/occasions/${createdOccasionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Status Test Occasion' })
        .expect(200)

      // DELETE should return 200 (OK)
      await request(app)
        .delete(`/api/occasions/${createdOccasionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Cleanup
      await deleteTestOccasion(createdOccasionId)
    })
  })
})
