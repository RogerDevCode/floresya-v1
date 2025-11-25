import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

vi.mock('../../api/controllers/occasionController.js', () => ({
  getAllOccasions: vi.fn((req, res) => res.json({ success: true, data: [] })),
  getOccasionBySlug: vi.fn((req, res) => res.json({ success: true, data: {} })),
  getOccasionById: vi.fn((req, res) => res.json({ success: true, data: {} })),
  createOccasion: vi.fn((req, res) => res.status(201).json({ success: true })),
  updateOccasion: vi.fn((req, res) => res.json({ success: true })),
  updateDisplayOrder: vi.fn((req, res) => res.json({ success: true })),
  deleteOccasion: vi.fn((req, res) => res.status(204).send()),
  reactivateOccasion: vi.fn((req, res) => res.json({ success: true }))
}))

vi.mock('../../api/middleware/auth/index.js', () => ({
  authenticate: vi.fn((req, res, next) => next()),
  authorize: vi.fn(() => (req, res, next) => next())
}))

vi.mock('../../api/middleware/validation/index.js', () => ({
  validate: vi.fn(() => (req, res, next) => next()),
  validateId: vi.fn(() => (req, res, next) => next())
}))

describe('Occasion Routes', () => {
  let app

  beforeEach(async () => {
    vi.clearAllMocks()
    const routes = await import('../../api/routes/occasionRoutes.js')
    app = express()
    app.use(express.json())
    app.use('/occasions', routes.default)
  })

  it('GET /occasions - should get all occasions', async () => {
    const res = await request(app).get('/occasions')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('GET /occasions/slug/:slug - should get occasion by slug', async () => {
    const res = await request(app).get('/occasions/slug/test-occasion')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('GET /occasions/:id - should get occasion by id', async () => {
    const res = await request(app).get('/occasions/1')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('POST /occasions - should create occasion', async () => {
    const res = await request(app).post('/occasions').send({})
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
  })

  it('PUT /occasions/:id - should update occasion', async () => {
    const res = await request(app).put('/occasions/1').send({})
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('DELETE /occasions/:id - should delete occasion', async () => {
    const res = await request(app).delete('/occasions/1')
    expect(res.status).toBe(204)
  })

  it('PATCH /occasions/:id/reactivate - should reactivate occasion', async () => {
    const res = await request(app).patch('/occasions/1/reactivate')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
