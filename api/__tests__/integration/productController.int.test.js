/**
 * Product Controller API Integration Tests
 * Tests all product endpoints with real API calls
 * Validates request/response formats and business logic
 * Follows KISS, DRY, and SSOT principles
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import app from '../../app.js'
import {
  createTestProduct,
  deleteTestProduct,
  createTestOccasion,
  deleteTestOccasion,
  getAdminToken
} from '../test-utils.js'

describe('Product Controller API', () => {
  let testProduct = null
  let testOccasion = null
  let authToken = null

  beforeEach(async () => {
    // Setup test entities
    testProduct = await createTestProduct()
    testOccasion = await createTestOccasion()

    // Setup auth token for admin operations
    authToken = getAdminToken()
  })

  afterEach(async () => {
    // Cleanup test entities
    if (testProduct) {
      await deleteTestProduct(testProduct.id)
    }
    if (testOccasion) {
      await deleteTestOccasion(testOccasion.id)
    }

    // Reset mocks
    vi.restoreAllMocks()
  })

  describe('GET /api/products', () => {
    it('should get all products with filters', async () => {
      const response = await request(app).get('/api/products').expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('message', 'Products retrieved successfully')
    })

    it('should handle featured filter correctly', async () => {
      const response = await request(app).get('/api/products?featured=true').expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should handle search query parameter', async () => {
      const response = await request(app)
        .get(`/api/products?search=${testProduct.name.split(' ')[0]}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should handle pagination parameters', async () => {
      const response = await request(app).get('/api/products?limit=5&offset=0').expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should handle includeInactive parameter for admin', async () => {
      const response = await request(app)
        .get('/api/products?includeInactive=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })

  describe('GET /api/products/:id', () => {
    it('should get product by ID', async () => {
      const response = await request(app).get(`/api/products/${testProduct.id}`).expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id', testProduct.id)
      expect(response.body.data).toHaveProperty('name', testProduct.name)
      expect(response.body.data).toHaveProperty('price_usd', testProduct.price_usd)
      expect(response.body).toHaveProperty('message', 'Product retrieved successfully')
    })

    it('should return 404 for non-existent product', async () => {
      const response = await request(app).get('/api/products/999999').expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 400 for invalid ID', async () => {
      const response = await request(app).get('/api/products/invalid').expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/products/sku/:sku', () => {
    it('should get product by SKU', async () => {
      const response = await request(app).get(`/api/products/sku/${testProduct.sku}`).expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id', testProduct.id)
      expect(response.body.data).toHaveProperty('sku', testProduct.sku)
      expect(response.body).toHaveProperty('message', 'Product retrieved successfully')
    })

    it('should return 404 for non-existent SKU', async () => {
      const response = await request(app).get('/api/products/sku/NONEXISTENT').expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('GET /api/products/carousel', () => {
    it('should get carousel products', async () => {
      const response = await request(app).get('/api/products/carousel').expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('message', 'Carousel products retrieved successfully')
    })
  })

  describe('GET /api/products/with-occasions', () => {
    it('should get products with occasions', async () => {
      const response = await request(app).get('/api/products/with-occasions').expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty(
        'message',
        'Products with occasions retrieved successfully'
      )
    })

    it('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/products/with-occasions?limit=10&offset=0')
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })

  describe('GET /api/products/occasion/:occasionId', () => {
    it('should get products by occasion', async () => {
      const response = await request(app)
        .get(`/api/products/occasion/${testOccasion.id}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('message', 'Products retrieved successfully')
    })

    it('should return 404 for non-existent occasion', async () => {
      const response = await request(app).get('/api/products/occasion/999999').expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should handle limit parameter', async () => {
      const response = await request(app)
        .get(`/api/products/occasion/${testOccasion.id}?limit=5`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })

  describe('POST /api/products', () => {
    it('should create a new product (admin only)', async () => {
      const newProduct = {
        name: `New Test Product ${Date.now()}`,
        price_usd: 29.99,
        summary: 'New test product for integration tests',
        description: 'This is a new test product created for integration testing',
        price_ves: 1100.5,
        stock: 50,
        sku: `NEWTEST${Date.now()}`,
        featured: true,
        carousel_order: 1
      }

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newProduct)
        .expect(201)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('name', newProduct.name)
      expect(response.body.data).toHaveProperty('price_usd', newProduct.price_usd)
      expect(response.body.data).toHaveProperty('sku', newProduct.sku)
      expect(response.body.data).toHaveProperty('featured', newProduct.featured)
      expect(response.body.data).toHaveProperty('is_active', true)
      expect(response.body).toHaveProperty('message', 'Product created successfully')

      // Cleanup
      await deleteTestProduct(response.body.data.id)
    })

    it('should return 401 for unauthorized access', async () => {
      const newProduct = {
        name: 'Unauthorized Product',
        price_usd: 25.99
      }

      await request(app).post('/api/products').send(newProduct).expect(401)
    })

    it('should return 400 for validation errors', async () => {
      const invalidProduct = {
        name: '', // Empty name should fail validation
        price_usd: -10, // Negative price should fail validation
        sku: '' // Empty SKU should fail validation
      }

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProduct)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'ValidationError')
    })
  })

  describe('PUT /api/products/:id', () => {
    it('should update an existing product (admin only)', async () => {
      const updatedData = {
        name: 'Updated Product Name',
        price_usd: 35.99,
        summary: 'Updated summary',
        stock: 75,
        featured: false
      }

      const response = await request(app)
        .put(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('name', updatedData.name)
      expect(response.body.data).toHaveProperty('price_usd', updatedData.price_usd)
      expect(response.body.data).toHaveProperty('summary', updatedData.summary)
      expect(response.body.data).toHaveProperty('stock', updatedData.stock)
      expect(response.body.data).toHaveProperty('featured', updatedData.featured)
      expect(response.body).toHaveProperty('message', 'Product updated successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      const updatedData = {
        name: 'Unauthorized Update'
      }

      await request(app).put(`/api/products/${testProduct.id}`).send(updatedData).expect(401)
    })

    it('should return 404 for non-existent product', async () => {
      const updatedData = {
        name: 'Non-existent Product'
      }

      const response = await request(app)
        .put('/api/products/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 400 for validation errors', async () => {
      const invalidData = {
        name: '', // Empty name should fail
        price_usd: -5, // Negative price should fail
        stock: -1 // Negative stock should fail
      }

      const response = await request(app)
        .put(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'ValidationError')
    })
  })

  describe('DELETE /api/products/:id', () => {
    it('should soft-delete a product (admin only)', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('message', 'Product deactivated successfully')

      // Verify it's deactivated (should return 404 when trying to get it)
      const verifyResponse = await request(app).get(`/api/products/${testProduct.id}`).expect(404)

      expect(verifyResponse.body).toHaveProperty('success', false)
      expect(verifyResponse.body).toHaveProperty('error', 'NotFoundError')
    })

    it('should return 401 for unauthorized access', async () => {
      await request(app).delete(`/api/products/${testProduct.id}`).expect(401)
    })

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .delete('/api/products/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('PATCH /api/products/:id/reactivate', () => {
    it('should reactivate a product (admin only)', async () => {
      // First deactivate the product
      await request(app)
        .delete(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Then reactivate it
      const response = await request(app)
        .patch(`/api/products/${testProduct.id}/reactivate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('is_active', true)
      expect(response.body).toHaveProperty('message', 'Product reactivated successfully')
    })

    it('should return 401 for unauthorized access', async () => {
      await request(app).patch(`/api/products/${testProduct.id}/reactivate`).expect(401)
    })

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .patch('/api/products/999999/reactivate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error', 'NotFoundError')
    })
  })

  describe('Response Structure Consistency', () => {
    it('should return consistent response structure for all endpoints', async () => {
      // Test GET all products
      const getAllResponse = await request(app).get('/api/products').expect(200)

      expect(getAllResponse.body).toHaveProperty('success', true)
      expect(getAllResponse.body).toHaveProperty('data')
      expect(getAllResponse.body).toHaveProperty('message')
      expect(typeof getAllResponse.body.message).toBe('string')

      // Test GET product by ID
      const getByIdResponse = await request(app).get(`/api/products/${testProduct.id}`).expect(200)

      expect(getByIdResponse.body).toHaveProperty('success', true)
      expect(getByIdResponse.body).toHaveProperty('data')
      expect(getByIdResponse.body).toHaveProperty('message')
      expect(typeof getByIdResponse.body.message).toBe('string')

      // Test GET carousel products
      const carouselResponse = await request(app).get('/api/products/carousel').expect(200)

      expect(carouselResponse.body).toHaveProperty('success', true)
      expect(carouselResponse.body).toHaveProperty('data')
      expect(carouselResponse.body).toHaveProperty('message')
      expect(typeof carouselResponse.body.message).toBe('string')
    })
  })

  describe('HTTP Status Codes', () => {
    it('should return correct HTTP status codes for all operations', async () => {
      // Create a new product for status code testing
      const newProduct = {
        name: `Status Test Product ${Date.now()}`,
        price_usd: 19.99,
        summary: 'Status code test product',
        sku: `STATUSTEST${Date.now()}`
      }

      // POST should return 201 (Created)
      const postResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newProduct)
        .expect(201)

      const createdProductId = postResponse.body.data.id

      // GET should return 200 (OK)
      await request(app).get(`/api/products/${createdProductId}`).expect(200)

      // PUT should return 200 (OK)
      await request(app)
        .put(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Status Test Product' })
        .expect(200)

      // DELETE should return 200 (OK)
      await request(app)
        .delete(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Cleanup
      await deleteTestProduct(createdProductId)
    })
  })
})
