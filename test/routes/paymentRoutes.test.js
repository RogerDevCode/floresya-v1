import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

vi.mock('../../api/controllers/paymentController.js', () => ({
  getPaymentMethods: vi.fn((req, res) => res.json({ success: true, data: [] })),
  confirmPayment: vi.fn((req, res) => res.json({ success: true }))
}))

vi.mock('../../api/middleware/auth/index.js', () => ({
  authenticate: vi.fn((req, res, next) => next())
}))

vi.mock('../../api/middleware/validation/index.js', () => ({
  validate: vi.fn(() => (req, res, next) => next()),
  validateId: vi.fn(() => (req, res, next) => next()),
  paymentConfirmSchema: {}
}))

vi.mock('../../api/middleware/security/index.js', () => ({
  rateLimitCritical: vi.fn((req, res, next) => next())
}))

describe('Payment Routes', () => {
  let app

  beforeEach(async () => {
    vi.clearAllMocks()
    const routes = await import('../../api/routes/paymentRoutes.js')
    app = express()
    app.use(express.json())
    app.use('/payments', routes.default)
  })

  it('GET /payments/methods - should get payment methods', async () => {
    const res = await request(app).get('/payments/methods')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('POST /payments/:id/confirm - should confirm payment', async () => {
    const res = await request(app).post('/payments/1/confirm').send({})
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
