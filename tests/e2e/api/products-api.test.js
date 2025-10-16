/**
 * Products API E2E Tests
 * Tests para operaciones CRUD de productos
 */

import { test, expect } from '@playwright/test'

const API_BASE = process.env.API_URL || 'http://localhost:3000'

test.describe('Products API - Public Endpoints', () => {
  test('GET /api/products - List all products', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/products`, {
      params: {
        limit: 20,
        offset: 0
      }
    })

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)

    // Validate product structure
    if (json.data.length > 0) {
      const product = json.data[0]
      expect(product).toHaveProperty('id')
      expect(product).toHaveProperty('name')
      expect(product).toHaveProperty('price_usd')
      expect(product).toHaveProperty('stock')
      expect(product.active).toBe(true) // Public endpoint only shows active
    }
  })

  test('GET /api/products/:id - Get product by ID', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/products/1`)

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.id).toBe(1)
    expect(json.data).toHaveProperty('name')
    expect(json.data).toHaveProperty('description')
    expect(json.data).toHaveProperty('price_usd')
  })

  test('GET /api/products/carousel - Get carousel products', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/products/carousel`)

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)

    // Carousel products should be featured
    json.data.forEach(product => {
      expect(product.featured).toBe(true)
      expect(product.carousel_order).toBeDefined()
    })
  })

  test('GET /api/products/with-occasions - Get products with occasions', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/products/with-occasions`)

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)

    // Should include occasion data
    if (json.data.length > 0) {
      const product = json.data[0]
      expect(product).toHaveProperty('occasions')
    }
  })

  test('GET /api/products/:id - Not found error', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/products/999999`)

    expect(response.status()).toBe(404)
    const json = await response.json()

    expect(json.success).toBe(false)
    expect(json.error).toBeDefined()
  })

  test('GET /api/products - Pagination works', async ({ request }) => {
    const page1 = await request.get(`${API_BASE}/api/products`, {
      params: { limit: 5, offset: 0 }
    })
    const page2 = await request.get(`${API_BASE}/api/products`, {
      params: { limit: 5, offset: 5 }
    })

    expect(page1.ok()).toBeTruthy()
    expect(page2.ok()).toBeTruthy()

    const json1 = await page1.json()
    const json2 = await page2.json()

    expect(json1.data.length).toBeLessThanOrEqual(5)
    expect(json2.data.length).toBeLessThanOrEqual(5)

    // Pages should have different products
    if (json1.data.length > 0 && json2.data.length > 0) {
      expect(json1.data[0].id).not.toBe(json2.data[0].id)
    }
  })
})

test.describe('Products API - Admin Endpoints', () => {
  let testProductId = null

  test('POST /api/products - Create product (admin)', async ({ request }) => {
    const productData = {
      name: `Test Product ${Date.now()}`,
      summary: 'Test product summary',
      description: 'Detailed test product description',
      price_usd: 29.99,
      price_ves: 1200.0,
      stock: 50,
      sku: `TEST-SKU-${Date.now()}`,
      featured: false,
      active: true
    }

    const response = await request.post(`${API_BASE}/api/products`, {
      data: productData,
      headers: {
        Authorization: 'Bearer mock-admin-token' // Mock auth
      }
    })

    expect(response.status()).toBe(201)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data).toHaveProperty('id')
    expect(json.data.name).toBe(productData.name)
    expect(json.data.price_usd).toBe(String(productData.price_usd))

    testProductId = json.data.id
  })

  test('PUT /api/products/:id - Update product (admin)', async ({ request }) => {
    expect(testProductId).not.toBeNull()

    const updateData = {
      name: 'Updated Test Product',
      price_usd: 35.99,
      stock: 100
    }

    const response = await request.put(`${API_BASE}/api/products/${testProductId}`, {
      data: updateData,
      headers: {
        Authorization: 'Bearer mock-admin-token'
      }
    })

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.name).toBe(updateData.name)
    expect(parseFloat(json.data.price_usd)).toBe(updateData.price_usd)
  })

  test('PATCH /api/products/:id/stock - Update stock (admin)', async ({ request }) => {
    expect(testProductId).not.toBeNull()

    const response = await request.patch(`${API_BASE}/api/products/${testProductId}/stock`, {
      data: { quantity: 75 },
      headers: {
        Authorization: 'Bearer mock-admin-token'
      }
    })

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.stock).toBe(75)
  })

  test('PATCH /api/products/:id/carousel-order - Update carousel order (admin)', async ({
    request
  }) => {
    expect(testProductId).not.toBeNull()

    const response = await request.patch(
      `${API_BASE}/api/products/${testProductId}/carousel-order`,
      {
        data: { order: 5 },
        headers: {
          Authorization: 'Bearer mock-admin-token'
        }
      }
    )

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.carousel_order).toBe(5)
  })

  test('DELETE /api/products/:id - Soft delete product (admin)', async ({ request }) => {
    expect(testProductId).not.toBeNull()

    const response = await request.delete(`${API_BASE}/api/products/${testProductId}`, {
      headers: {
        Authorization: 'Bearer mock-admin-token'
      }
    })

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.active).toBe(false)
  })

  test('PATCH /api/products/:id/reactivate - Reactivate product (admin)', async ({ request }) => {
    expect(testProductId).not.toBeNull()

    const response = await request.patch(`${API_BASE}/api/products/${testProductId}/reactivate`, {
      headers: {
        Authorization: 'Bearer mock-admin-token'
      }
    })

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.active).toBe(true)
  })

  test('POST /api/products - Validation: Missing required fields', async ({ request }) => {
    const invalidData = {
      name: 'Test' // Missing price, stock, etc.
    }

    const response = await request.post(`${API_BASE}/api/products`, {
      data: invalidData,
      headers: {
        Authorization: 'Bearer mock-admin-token'
      }
    })

    expect(response.status()).toBe(400)
    const json = await response.json()

    expect(json.success).toBe(false)
    expect(json.error).toBeDefined()
  })

  test('POST /api/products - Validation: Invalid price', async ({ request }) => {
    const invalidData = {
      name: 'Test Product',
      price_usd: -10, // Negative price
      stock: 50
    }

    const response = await request.post(`${API_BASE}/api/products`, {
      data: invalidData,
      headers: {
        Authorization: 'Bearer mock-admin-token'
      }
    })

    expect(response.status()).toBe(400)
    const json = await response.json()

    expect(json.success).toBe(false)
  })

  test.afterAll(async ({ request }) => {
    // Cleanup: delete test product
    if (testProductId) {
      await request.delete(`${API_BASE}/api/products/${testProductId}`, {
        headers: {
          Authorization: 'Bearer mock-admin-token'
        }
      })
    }
  })
})

test.describe('Products API - Product Images', () => {
  test('GET /api/products/:id/images - Get product images', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/products/1/images`)

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)
  })

  test('GET /api/products/:id/images/primary - Get primary image', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/products/1/images/primary`)

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    if (json.data) {
      expect(json.data).toHaveProperty('url')
      expect(json.data.is_primary).toBe(true)
    }
  })
})
