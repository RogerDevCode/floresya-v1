/**
 * Product Image Controller API Integration Tests
 * Tests all product image endpoints with real API calls
 * Validates request/response formats and business logic
 * Follows KISS, DRY, and SSOT principles
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import app from '../../app.js'
import {
  createTestProduct,
  createTestProductImage,
  deleteTestProduct,
  deleteTestProductImage,
  getAdminToken
} from '../test-utils.js'

describe('Product Image Controller API', () => {
  let testProduct = null
  let testProductImage = null
  let authToken = null

  beforeEach(async () => {
    // Setup test entities
    testProduct = await createTestProduct()

    // Setup auth token for admin operations
    authToken = getAdminToken()
  })

  afterEach(async () => {
    // Cleanup test entities
    if (testProductImage) {
      await deleteTestProductImage(testProductImage.id)
    }
    if (testProduct) {
      await deleteTestProduct(testProduct.id)
    }

    // Reset mocks
    vi.restoreAllMocks()
  })

  describe('GET /api/product-images', () => {
    it('should get all product images with filters', async () => {
      // Create a test product image first
      testProductImage = await createTestProductImage(testProduct.id)

      const response = await request(app).get('/api/product-images').expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('message', 'Product images retrieved successfully')
    })

    it('should handle product_id filter correctly', async () => {
      // Create a test product image first
      testProductImage = await createTestProductImage(testProduct.id)

      const response = await request(app)
        .get(`/api/product-images?product_id=${testProduct.id}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should handle pagination parameters', async () => {
      const response = await request(app).get('/api/product-images?limit=5&offset=0').expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })

  describe('GET /api/product-images/:id', () => {
    it('should get product image by ID', async () => {
      // Create a test product image first
      testProductImage = await createTestProductImage(testProduct.id)

      const response = await request(app)
        .get(`/api/product-images/${testProductImage.id}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id', testProductImage.id)
      expect(response.body.data).toHaveProperty('product_id', testProduct.id)
      expect(response.body.data).toHaveProperty('image_url', testProductImage.image_url)
      expect(response.body).toHaveProperty('message', 'Product image retrieved successfully')
    })

    it('should return 404 for non-existent product image', async () => {
      const response = await request(app).get('/api/product-images/999999').expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 400 for invalid ID', async () => {
      const response = await request(app).get('/api/product-images/invalid').expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/product-images/product/:productId', () => {
    it('should get product images by product ID', async () => {
      // Create a test product image first
      testProductImage = await createTestProductImage(testProduct.id)

      const response = await request(app)
        .get(`/api/product-images/product/${testProduct.id}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('message', 'Product images retrieved successfully')
    })

    it('should return 404 for non-existent product', async () => {
      const response = await request(app).get('/api/product-images/product/999999').expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('POST /api/product-images', () => {
    it('should create a new product image (admin only)', async () => {
      const newProductImage = {
        product_id: testProduct.id,
        image_url: `https://example.com/new-test-image-${Date.now()}.jpg`,
        alt_text: 'New test product image',
        display_order: 2,
        is_primary: false
      }

      const response = await request(app)
        .post('/api/product-images')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newProductImage)
        .expect(201)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('product_id', newProductImage.product_id)
      expect(response.body.data).toHaveProperty('image_url', newProductImage.image_url)
      expect(response.body.data).toHaveProperty('alt_text', newProductImage.alt_text)
      expect(response.body.data).toHaveProperty('display_order', newProductImage.display_order)
      expect(response.body.data).toHaveProperty('is_primary', newProductImage.is_primary)
      expect(response.body.data).toHaveProperty('is_active', true)
      expect(response.body).toHaveProperty('message', 'Product image created successfully')

      // Cleanup
      await deleteTestProductImage(response.body.data.id)
    })

    it('should return 401 for unauthorized access', async () => {
      const newProductImage = {
        product_id: testProduct.id,
        image_url: 'https://example.com/unauthorized.jpg',
        alt_text: 'Unauthorized image'
      }

      await request(app).post('/api/product-images').send(newProductImage).expect(401)
    })

    it('should return 400 for validation errors', async () => {
      const invalidProductImage = {
        product_id: '', // Empty product_id should fail
        image_url: '', // Empty image_url should fail
        alt_text: '', // Empty alt_text should fail
        display_order: -1 // Negative order should fail
      }

      const response = await request(app)
        .post('/api/product-images')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProductImage)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'ValidationError')
    })

    it('should return 404 for non-existent product', async () => {
      const invalidProductImage = {
        product_id: 999999, // Non-existent product
        image_url: 'https://example.com/test.jpg',
        alt_text: 'Test image',
        display_order: 1
      }

      const response = await request(app)
        .post('/api/product-images')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProductImage)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('PUT /api/product-images/:id', () => {
    it('should update an existing product image (admin only)', async () => {
      // Create a test product image first
      testProductImage = await createTestProductImage(testProduct.id)

      const updatedData = {
        alt_text: 'Updated alt text',
        display_order: 3,
        is_primary: true
      }

      const response = await request(app)
        .put(`/api/product-images/${testProductImage.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('alt_text', updatedData.alt_text)
      expect(response.body.data).toHaveProperty('display_order', updatedData.display_order)
      expect(response.body.data).toHaveProperty('is_primary', updatedData.is_primary)
      expect(response.body).toHaveProperty('message', 'Product image updated successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      // Create a test product image first
      testProductImage = await createTestProductImage(testProduct.id)

      const updatedData = {
        alt_text: 'Unauthorized update'
      }

      await request(app)
        .put(`/api/product-images/${testProductImage.id}`)
        .send(updatedData)
        .expect(401)
    })

    it('should return 404 for non-existent product image', async () => {
      const updatedData = {
        alt_text: 'Non-existent image'
      }

      const response = await request(app)
        .put('/api/product-images/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 400 for validation errors', async () => {
      // Create a test product image first
      testProductImage = await createTestProductImage(testProduct.id)

      const invalidData = {
        alt_text: '', // Empty alt_text should fail
        display_order: -1 // Negative order should fail
      }

      const response = await request(app)
        .put(`/api/product-images/${testProductImage.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'ValidationError')
    })
  })

  describe('DELETE /api/product-images/:id', () => {
    it('should soft-delete a product image (admin only)', async () => {
      // Create a test product image first
      testProductImage = await createTestProductImage(testProduct.id)

      const response = await request(app)
        .delete(`/api/product-images/${testProductImage.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('message', 'Product image deactivated successfully')

      // Verify it's deactivated (should return 404 when trying to get it)
      const verifyResponse = await request(app)
        .get(`/api/product-images/${testProductImage.id}`)
        .expect(404)

      expect(verifyResponse.body).toHaveProperty('success', false)
      expect(verifyResponse.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 401 for unauthorized access', async () => {
      // Create a test product image first
      testProductImage = await createTestProductImage(testProduct.id)

      await request(app).delete(`/api/product-images/${testProductImage.id}`).expect(401)
    })

    it('should return 404 for non-existent product image', async () => {
      const response = await request(app)
        .delete('/api/product-images/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('PATCH /api/product-images/:id/reactivate', () => {
    it('should reactivate a product image (admin only)', async () => {
      // Create and deactivate a test product image first
      testProductImage = await createTestProductImage(testProduct.id)
      await request(app)
        .delete(`/api/product-images/${testProductImage.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Then reactivate it
      const response = await request(app)
        .patch(`/api/product-images/${testProductImage.id}/reactivate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('is_active', true)
      expect(response.body).toHaveProperty('message', 'Product image reactivated successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      // Create a test product image first
      testProductImage = await createTestProductImage(testProduct.id)

      await request(app).patch(`/api/product-images/${testProductImage.id}/reactivate`).expect(401)
    })

    it('should return 404 for non-existent product image', async () => {
      const response = await request(app)
        .patch('/api/product-images/999999/reactivate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('Response Structure Consistency', () => {
    it('should return consistent response structure for all endpoints', async () => {
      // Create a test product image first
      testProductImage = await createTestProductImage(testProduct.id)

      // Test GET all product images
      const getAllResponse = await request(app).get('/api/product-images').expect(200)

      expect(getAllResponse.body).toHaveProperty('success', true)
      expect(getAllResponse.body).toHaveProperty('data')
      expect(getAllResponse.body).toHaveProperty('message')
      expect(typeof getAllResponse.body.message).toBe('string')

      // Test GET product image by ID
      const getByIdResponse = await request(app)
        .get(`/api/product-images/${testProductImage.id}`)
        .expect(200)

      expect(getByIdResponse.body).toHaveProperty('success', true)
      expect(getByIdResponse.body).toHaveProperty('data')
      expect(getByIdResponse.body).toHaveProperty('message')
      expect(typeof getByIdResponse.body.message).toBe('string')

      // Test GET product images by product ID
      const getByProductResponse = await request(app)
        .get(`/api/product-images/product/${testProduct.id}`)
        .expect(200)

      expect(getByProductResponse.body).toHaveProperty('success', true)
      expect(getByProductResponse.body).toHaveProperty('data')
      expect(getByProductResponse.body).toHaveProperty('message')
      expect(typeof getByProductResponse.body.message).toBe('string')
    })
  })

  describe('HTTP Status Codes', () => {
    it('should return correct HTTP status codes for all operations', async () => {
      // Create a new product image for status code testing
      const newProductImage = {
        product_id: testProduct.id,
        image_url: `https://example.com/status-test-${Date.now()}.jpg`,
        alt_text: 'Status test product image',
        display_order: 1,
        is_primary: false
      }

      // POST should return 201 (Created)
      const postResponse = await request(app)
        .post('/api/product-images')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newProductImage)
        .expect(201)

      const createdImageId = postResponse.body.data.id

      // GET should return 200 (OK)
      await request(app).get(`/api/product-images/${createdImageId}`).expect(200)

      // PUT should return 200 (OK)
      await request(app)
        .put(`/api/product-images/${createdImageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ alt_text: 'Updated Status Test Image' })
        .expect(200)

      // DELETE should return 200 (OK)
      await request(app)
        .delete(`/api/product-images/${createdImageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Cleanup
      await deleteTestProductImage(createdImageId)
    })
  })
})
