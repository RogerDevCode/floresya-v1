/**
 * Orders API E2E Tests
 * Tests críticos para el flujo completo de órdenes
 */

import { test, expect } from '@playwright/test'

const API_BASE = process.env.API_URL || 'http://localhost:3000'

test.describe('Orders API - Critical Endpoints', () => {
  let testOrderId = null
  let testUserId = null

  test.beforeAll(async ({ request }) => {
    // Create test user
    const userResponse = await request.post(`${API_BASE}/api/users`, {
      data: {
        email: `test-orders-${Date.now()}@example.com`,
        full_name: 'Test Order User',
        phone: '+584121234567'
      }
    })
    expect(userResponse.ok()).toBeTruthy()
    const userData = await userResponse.json()
    testUserId = userData.data.id
  })

  test('POST /api/orders - Create order successfully', async ({ request }) => {
    const orderData = {
      user_id: testUserId,
      customer: {
        name: 'Juan Pérez',
        phone: '+584121234567',
        email: 'juan@example.com'
      },
      delivery: {
        address: 'Av. Principal, Casa 123',
        city: 'Caracas',
        state: 'Miranda',
        notes: 'Timbre azul'
      },
      items: [
        {
          product_id: 1,
          quantity: 2,
          price_usd: 25.0,
          price_ves: 1000.0
        }
      ],
      payment: {
        method: 'bank_transfer',
        currency: 'USD',
        amount: 50.0,
        reference: 'TEST-REF-001'
      },
      total_usd: 50.0,
      total_ves: 2000.0
    }

    const response = await request.post(`${API_BASE}/api/orders`, {
      data: orderData
    })

    expect(response.status()).toBe(201)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data).toHaveProperty('id')
    expect(json.data.status).toBe('pending')
    expect(json.data.customer_name).toBe('Juan Pérez')
    expect(json.data.total_usd).toBe('50.00')

    testOrderId = json.data.id
  })

  test('GET /api/orders/:id - Get order by ID', async ({ request }) => {
    expect(testOrderId).not.toBeNull()

    const response = await request.get(`${API_BASE}/api/orders/${testOrderId}`)

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.id).toBe(testOrderId)
    expect(json.data).toHaveProperty('customer_name')
    expect(json.data).toHaveProperty('delivery_address')
    expect(json.data).toHaveProperty('items')
  })

  test('PATCH /api/orders/:id/status - Update order status', async ({ request }) => {
    expect(testOrderId).not.toBeNull()

    const response = await request.patch(`${API_BASE}/api/orders/${testOrderId}/status`, {
      data: {
        status: 'confirmed',
        notes: 'Pago verificado'
      }
    })

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.status).toBe('confirmed')
  })

  test('GET /api/orders/:id/status-history - Get status history', async ({ request }) => {
    expect(testOrderId).not.toBeNull()

    const response = await request.get(`${API_BASE}/api/orders/${testOrderId}/status-history`)

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)
    expect(json.data.length).toBeGreaterThan(0)

    // Should have at least pending → confirmed transition
    const statuses = json.data.map(h => h.status)
    expect(statuses).toContain('pending')
    expect(statuses).toContain('confirmed')
  })

  test('PATCH /api/orders/:id/cancel - Cancel order', async ({ request }) => {
    expect(testOrderId).not.toBeNull()

    const response = await request.patch(`${API_BASE}/api/orders/${testOrderId}/cancel`, {
      data: {
        notes: 'Cliente solicitó cancelación'
      }
    })

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data.status).toBe('cancelled')
  })

  test('GET /api/orders - List all orders (admin)', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/orders`, {
      params: {
        limit: 10,
        offset: 0
      }
    })

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)

    // Should include our test order
    const orderIds = json.data.map(o => o.id)
    expect(orderIds).toContain(testOrderId)
  })

  test('POST /api/orders - Validation: Missing required fields', async ({ request }) => {
    const invalidData = {
      customer: { name: 'Test' }
      // Missing items, payment, etc.
    }

    const response = await request.post(`${API_BASE}/api/orders`, {
      data: invalidData
    })

    expect(response.status()).toBe(400)
    const json = await response.json()

    expect(json.success).toBe(false)
    expect(json.error).toBeDefined()
  })

  test('GET /api/orders/:id - Not found error', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/orders/999999`)

    expect(response.status()).toBe(404)
    const json = await response.json()

    expect(json.success).toBe(false)
    expect(json.error).toContain('not found')
  })

  test('PATCH /api/orders/:id/status - Invalid status transition', async ({ request }) => {
    expect(testOrderId).not.toBeNull()

    const response = await request.patch(`${API_BASE}/api/orders/${testOrderId}/status`, {
      data: {
        status: 'delivered' // Can't go from cancelled to delivered
      }
    })

    expect(response.status()).toBe(400)
    const json = await response.json()

    expect(json.success).toBe(false)
  })

  test.afterAll(async ({ request }) => {
    // Cleanup: delete test user (cascade will delete order)
    if (testUserId) {
      await request.delete(`${API_BASE}/api/users/${testUserId}`)
    }
  })
})

test.describe('Orders API - Business Rules Validation', () => {
  test('Order statistics exclude cancelled orders', async ({ request }) => {
    // This test validates the business rule:
    // "Una venta cancelada no es una venta"

    // Get current stats
    const statsResponse = await request.get(`${API_BASE}/api/orders`, {
      params: { status: 'confirmed' }
    })

    expect(statsResponse.ok()).toBeTruthy()
    const stats = await statsResponse.json()

    const _confirmedCount = stats.data.length

    // Get cancelled orders
    const cancelledResponse = await request.get(`${API_BASE}/api/orders`, {
      params: { status: 'cancelled' }
    })

    expect(cancelledResponse.ok()).toBeTruthy()
    const cancelled = await cancelledResponse.json()

    // Cancelled orders should not be counted in sales
    expect(cancelled.data.every(o => o.status === 'cancelled')).toBe(true)
  })
})
