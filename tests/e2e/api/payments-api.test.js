/**
 * Payments API E2E Tests
 * Tests para confirmación de pagos
 */

import { test, expect } from '@playwright/test'

const API_BASE = process.env.API_URL || 'http://localhost:3000'

test.describe('Payments API - Critical Endpoints', () => {
  let testOrderId = null
  let testUserId = null

  test.beforeAll(async ({ request }) => {
    // Create test user
    const userResponse = await request.post(`${API_BASE}/api/users`, {
      data: {
        email: `test-payment-${Date.now()}@example.com`,
        full_name: 'Test Payment User',
        phone: '+584121234567'
      }
    })
    const userData = await userResponse.json()
    testUserId = userData.data.id

    // Create test order
    const orderResponse = await request.post(`${API_BASE}/api/orders`, {
      data: {
        user_id: testUserId,
        customer: {
          name: 'Test Customer',
          phone: '+584121234567',
          email: 'test@example.com'
        },
        delivery: {
          address: 'Test Address',
          city: 'Caracas',
          state: 'Miranda'
        },
        items: [
          {
            product_id: 1,
            quantity: 1,
            price_usd: 25.0,
            price_ves: 1000.0
          }
        ],
        payment: {
          method: 'bank_transfer',
          currency: 'USD',
          amount: 25.0,
          reference: 'TEST-REF'
        },
        total_usd: 25.0,
        total_ves: 1000.0
      }
    })
    const orderData = await orderResponse.json()
    testOrderId = orderData.data.id
  })

  test('GET /api/payments/methods - Get available payment methods', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/payments/methods`)

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)

    // Should include common payment methods
    const types = json.data.map(m => m.type)
    expect(types).toContain('bank_transfer')
    expect(types).toContain('mobile_payment')
  })

  test('POST /api/payments/:id/confirm - Confirm payment successfully', async ({ request }) => {
    expect(testOrderId).not.toBeNull()

    const paymentData = {
      payment_reference: `CONF-${Date.now()}`,
      payment_date: new Date().toISOString(),
      payment_method: 'bank_transfer',
      amount: 25.0,
      currency: 'USD',
      notes: 'Pago verificado en sistema bancario'
    }

    const response = await request.post(`${API_BASE}/api/payments/${testOrderId}/confirm`, {
      data: paymentData
    })

    expect(response.status()).toBe(200)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.data).toHaveProperty('id')
    expect(json.data.status).toBe('confirmed')
  })

  test('POST /api/payments/:id/confirm - Not found error for invalid order', async ({
    request
  }) => {
    const paymentData = {
      payment_reference: 'TEST-REF',
      payment_date: new Date().toISOString(),
      payment_method: 'bank_transfer',
      amount: 25.0,
      currency: 'USD'
    }

    const response = await request.post(`${API_BASE}/api/payments/999999/confirm`, {
      data: paymentData
    })

    expect(response.status()).toBe(404)
    const json = await response.json()

    expect(json.success).toBe(false)
    expect(json.error).toContain('not found')
  })

  test('POST /api/payments/:id/confirm - Validation: Missing required fields', async ({
    request
  }) => {
    expect(testOrderId).not.toBeNull()

    const invalidData = {
      payment_reference: 'TEST' // Missing other required fields
    }

    const response = await request.post(`${API_BASE}/api/payments/${testOrderId}/confirm`, {
      data: invalidData
    })

    expect(response.status()).toBe(400)
    const json = await response.json()

    expect(json.success).toBe(false)
    expect(json.error).toBeDefined()
  })

  test('POST /api/payments/:id/confirm - Cannot confirm already confirmed payment', async ({
    request
  }) => {
    expect(testOrderId).not.toBeNull()

    const paymentData = {
      payment_reference: `DUPLICATE-${Date.now()}`,
      payment_date: new Date().toISOString(),
      payment_method: 'bank_transfer',
      amount: 25.0,
      currency: 'USD'
    }

    const response = await request.post(`${API_BASE}/api/payments/${testOrderId}/confirm`, {
      data: paymentData
    })

    expect(response.status()).toBe(400)
    const json = await response.json()

    expect(json.success).toBe(false)
    expect(json.error).toMatch(/already confirmed|duplicate/i)
  })

  test.afterAll(async ({ request }) => {
    // Cleanup
    if (testUserId) {
      await request.delete(`${API_BASE}/api/users/${testUserId}`)
    }
  })
})

test.describe('Payments API - Business Rules', () => {
  test('Payment confirmation updates order status', async ({ request }) => {
    // Create test order
    const orderResponse = await request.post(`${API_BASE}/api/orders`, {
      data: {
        customer: { name: 'Test', phone: '123', email: 'test@test.com' },
        delivery: { address: 'Test', city: 'Test', state: 'Test' },
        items: [{ product_id: 1, quantity: 1, price_usd: 10, price_ves: 400 }],
        payment: { method: 'bank_transfer', currency: 'USD', amount: 10, reference: 'TEST' },
        total_usd: 10,
        total_ves: 400
      }
    })

    const order = await orderResponse.json()
    const orderId = order.data.id

    // Initial status should be pending
    expect(order.data.status).toBe('pending')

    // Confirm payment
    await request.post(`${API_BASE}/api/payments/${orderId}/confirm`, {
      data: {
        payment_reference: 'CONFIRMED',
        payment_date: new Date().toISOString(),
        payment_method: 'bank_transfer',
        amount: 10,
        currency: 'USD'
      }
    })

    // Check order status changed
    const updatedOrderResponse = await request.get(`${API_BASE}/api/orders/${orderId}`)
    const updatedOrder = await updatedOrderResponse.json()

    expect(updatedOrder.data.status).toBe('confirmed')
  })

  test('Payment methods match order currency', async ({ request }) => {
    const methods = await request.get(`${API_BASE}/api/payments/methods`)
    const methodsJson = await methods.json()

    // All methods should support Venezuelan payments
    expect(methodsJson.data.length).toBeGreaterThan(0)

    // Should have methods for both USD and VES
    const hasUSDMethods = methodsJson.data.some(
      m => m.type === 'bank_transfer' || m.type === 'crypto'
    )
    const hasVESMethods = methodsJson.data.some(
      m => m.type === 'mobile_payment' || m.type === 'cash'
    )

    expect(hasUSDMethods).toBe(true)
    expect(hasVESMethods).toBe(true)
  })
})
