/**
 * Product Controller Tests
 * Testing HTTP endpoints for products (focus on getProductById)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../app.js'

// Mock productService
vi.mock('../../services/productService.js', () => ({
  getProductById: vi.fn((productId, _includeInactive) => {
    if (productId === 67) {
      return Promise.resolve({
        id: 67,
        name: 'Ramo Tropical Vibrante',
        summary: 'Explosión de colores tropicales',
        description:
          'Explosión de colores tropicales con aves del paraíso, heliconias y flores exóticas',
        price_usd: 45.99,
        price_ves: 1837.96,
        stock: 15,
        sku: 'FY-001',
        active: true,
        featured: true,
        carousel_order: 1,
        created_at: '2025-09-30T02:22:35.04999+00:00',
        updated_at: '2025-09-30T02:22:35.04999+00:00'
      })
    }
    if (productId === 999) {
      throw new Error('Product 999 not found')
    }
    throw new Error('Invalid product ID')
  }),
  getAllProducts: vi.fn((_filters, _includeInactive) => {
    return Promise.resolve([
      {
        id: 67,
        name: 'Ramo Tropical Vibrante',
        price_usd: 45.99,
        active: true,
        featured: true
      }
    ])
  })
}))

describe('Product Controller - getProductById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/products/:id', () => {
    it('should return product data for valid ID', async () => {
      const response = await request(app).get('/api/products/67').expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: 'Product retrieved successfully'
      })
      expect(response.body.data).toBeDefined()
      expect(response.body.data.id).toBe(67)
      expect(response.body.data.name).toBe('Ramo Tropical Vibrante')
      expect(response.body.data.price_usd).toBe(45.99)
      expect(response.body.data.stock).toBe(15)
    })

    it('should return 400 for invalid product ID (non-numeric)', async () => {
      const response = await request(app).get('/api/products/abc').expect(400)

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid id: must be a positive integer',
        message: 'Invalid id: must be a positive integer'
      })
    })

    it('should return 500 for non-existent product ID', async () => {
      const response = await request(app).get('/api/products/999').expect(500)

      expect(response.body).toMatchObject({
        success: false,
        error: 'Product 999 not found'
      })
    })

    it('should return 400 for negative product ID', async () => {
      const response = await request(app).get('/api/products/-1').expect(400)

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid id: must be a positive integer'
      })
    })

    it('should return 400 for zero product ID', async () => {
      const response = await request(app).get('/api/products/0').expect(400)

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid id: must be a positive integer'
      })
    })

    it('should include all required product fields', async () => {
      const response = await request(app).get('/api/products/67').expect(200)

      const product = response.body.data
      expect(product).toHaveProperty('id')
      expect(product).toHaveProperty('name')
      expect(product).toHaveProperty('description')
      expect(product).toHaveProperty('price_usd')
      expect(product).toHaveProperty('stock')
      expect(product).toHaveProperty('sku')
      expect(product).toHaveProperty('active')
      expect(product).toHaveProperty('featured')
    })

    it('should return active products by default', async () => {
      const response = await request(app).get('/api/products/67').expect(200)

      expect(response.body.data.active).toBe(true)
    })
  })

  describe('GET /api/products (for comparison)', () => {
    it('should return products list', async () => {
      const response = await request(app).get('/api/products').expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: 'Products retrieved successfully'
      })
      expect(response.body.data).toBeInstanceOf(Array)
    })
  })
})

describe('Product Controller - Integration with product-detail page', () => {
  it('should support product-detail page workflow', async () => {
    // Step 1: Get product by ID (as done in product-detail.js)
    const productResponse = await request(app).get('/api/products/67').expect(200)

    expect(productResponse.body.success).toBe(true)
    expect(productResponse.body.data.id).toBe(67)

    // Step 2: Get product images (as done in product-detail.js)
    // Note: This would require productImageController to be working
    // For now, we just verify the product data is sufficient for the detail page

    const product = productResponse.body.data

    // Verify all fields needed by product-detail.html are present
    expect(product.name).toBeDefined()
    expect(product.description).toBeDefined()
    expect(product.price_usd).toBeDefined()
    expect(product.stock).toBeDefined()

    // Verify numeric types
    expect(typeof product.price_usd).toBe('number')
    expect(typeof product.stock).toBe('number')
    expect(product.stock).toBeGreaterThanOrEqual(0)
  })
})
