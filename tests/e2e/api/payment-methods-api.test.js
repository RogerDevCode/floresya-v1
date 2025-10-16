/**
 * Payment Methods API E2E Tests
 * Tests para gestión de métodos de pago
 */

import { test, expect } from '@playwright/test'

const API_BASE = process.env.API_URL || 'http://localhost:3000'

test.describe('Payment Methods API - Public Endpoints', () => {
  test('GET /api/payment-methods - List all active payment methods', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/payment-methods`)

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)

    // Validate payment method structure
    if (json.data.length > 0) {
      const method = json.data[0]
      expect(method).toHaveProperty('id')
      expect(method).toHaveProperty('name')
      expect(method).toHaveProperty('type')
      expect(method).toHaveProperty('display_order')
      expect(method.is_active).toBe(true) // Public endpoint only shows active
    }
  })

  test('GET /api/payment-methods/:id - Get payment method by ID', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/payment-methods/1`)

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.id).toBe(1)
    expect(json.data).toHaveProperty('name')
    expect(json.data).toHaveProperty('type')
    expect(json.data).toHaveProperty('description')
  })

  test('GET /api/payment-methods/:id - Not found error', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/payment-methods/999999`)

    expect(response.status()).toBe(404)
    const json = await response.json()

    expect(json.success).toBe(false)
    expect(json.error).toBeDefined()
  })

  test('GET /api/payment-methods - Results sorted by display_order', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/payment-methods`)

    expect(response.ok()).toBeTruthy()
    const json = await response.json()

    if (json.data.length > 1) {
      // Verify ascending order
      for (let i = 0; i < json.data.length - 1; i++) {
        expect(json.data[i].display_order).toBeLessThanOrEqual(json.data[i + 1].display_order)
      }
    }
  })
})

test.describe('Payment Methods API - Admin Endpoints', () => {
  let testMethodId = null

  test('POST /api/payment-methods - Create payment method (admin)', async ({ request }) => {
    const methodData = {
      name: `Test Payment Method ${Date.now()}`,
      type: 'bank_transfer',
      description: 'Test payment method for E2E testing',
      account_info: 'Bank: Test Bank, Account: 0123456789',
      is_active: true,
      display_order: 99
    }

    const response = await request.post(`${API_BASE}/api/payment-methods`, {
      data: methodData,
      headers: {
        Authorization: 'Bearer mock-admin-token'
      }
    })

    expect(response.status()).toBe(201)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data).toHaveProperty('id')
    expect(json.data.name).toBe(methodData.name)
    expect(json.data.type).toBe(methodData.type)
    expect(json.data.display_order).toBe(methodData.display_order)

    testMethodId = json.data.id
  })

  test('PUT /api/payment-methods/:id - Update payment method (admin)', async ({ request }) => {
    expect(testMethodId).not.toBeNull()

    const updateData = {
      name: 'Updated Test Payment Method',
      description: 'Updated description',
      account_info: 'Updated account info'
    }

    const response = await request.put(`${API_BASE}/api/payment-methods/${testMethodId}`, {
      data: updateData,
      headers: {
        Authorization: 'Bearer mock-admin-token'
      }
    })

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.name).toBe(updateData.name)
    expect(json.data.description).toBe(updateData.description)
  })

  test('PATCH /api/payment-methods/:id/display-order - Update display order (admin)', async ({
    request
  }) => {
    expect(testMethodId).not.toBeNull()

    const response = await request.patch(
      `${API_BASE}/api/payment-methods/${testMethodId}/display-order`,
      {
        data: { order: 50 },
        headers: {
          Authorization: 'Bearer mock-admin-token'
        }
      }
    )

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.display_order).toBe(50)
  })

  test('DELETE /api/payment-methods/:id - Soft delete payment method (admin)', async ({
    request
  }) => {
    expect(testMethodId).not.toBeNull()

    const response = await request.delete(`${API_BASE}/api/payment-methods/${testMethodId}`, {
      headers: {
        Authorization: 'Bearer mock-admin-token'
      }
    })

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.is_active).toBe(false)

    // Verify it doesn't appear in public list
    const publicResponse = await request.get(`${API_BASE}/api/payment-methods`)
    const publicJson = await publicResponse.json()

    const foundInPublic = publicJson.data.find(m => m.id === testMethodId)
    expect(foundInPublic).toBeUndefined()
  })

  test('PATCH /api/payment-methods/:id/reactivate - Reactivate payment method (admin)', async ({
    request
  }) => {
    expect(testMethodId).not.toBeNull()

    const response = await request.patch(
      `${API_BASE}/api/payment-methods/${testMethodId}/reactivate`,
      {
        headers: {
          Authorization: 'Bearer mock-admin-token'
        }
      }
    )

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.is_active).toBe(true)

    // Verify it appears in public list again
    const publicResponse = await request.get(`${API_BASE}/api/payment-methods`)
    const publicJson = await publicResponse.json()

    const foundInPublic = publicJson.data.find(m => m.id === testMethodId)
    expect(foundInPublic).toBeDefined()
  })

  test('POST /api/payment-methods - Validation: Missing required fields', async ({ request }) => {
    const invalidData = {
      name: 'Test' // Missing type
    }

    const response = await request.post(`${API_BASE}/api/payment-methods`, {
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

  test('POST /api/payment-methods - Validation: Invalid type enum', async ({ request }) => {
    const invalidData = {
      name: 'Test Method',
      type: 'invalid_type', // Not in enum
      description: 'Test'
    }

    const response = await request.post(`${API_BASE}/api/payment-methods`, {
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
    // Cleanup: delete test payment method
    if (testMethodId) {
      await request.delete(`${API_BASE}/api/payment-methods/${testMethodId}`, {
        headers: {
          Authorization: 'Bearer mock-admin-token'
        }
      })
    }
  })
})

test.describe('Payment Methods API - Business Logic', () => {
  test('Payment methods support all required types', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/payment-methods`)
    const json = await response.json()

    const types = json.data.map(m => m.type)
    const expectedTypes = ['bank_transfer', 'mobile_payment', 'cash']

    // Should have at least the basic types
    expectedTypes.forEach(type => {
      expect(types).toContain(type)
    })
  })

  test('Display order determines sort order in public list', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/payment-methods`)
    const json = await response.json()

    // All payment methods should be sorted by display_order
    const orders = json.data.map(m => m.display_order)
    const sortedOrders = [...orders].sort((a, b) => a - b)

    expect(orders).toEqual(sortedOrders)
  })
})
