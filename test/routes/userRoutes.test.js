import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

// Mock controllers y middleware antes de importar routes
vi.mock('../../api/controllers/userController.js', () => ({
  getAllUsers: vi.fn((req, res) => res.json({ success: true, data: [] })),
  getUserById: vi.fn((req, res) => res.json({ success: true, data: { id: 1 } })),
  getUserByEmail: vi.fn((req, res) =>
    res.json({ success: true, data: { email: 'test@test.com' } })
  ),
  createUser: vi.fn((req, res) => res.status(201).json({ success: true, data: { id: 1 } })),
  updateUser: vi.fn((req, res) => res.json({ success: true, data: { id: 1 } })),
  deleteUser: vi.fn((req, res) => res.status(204).send()),
  reactivateUser: vi.fn((req, res) => res.json({ success: true })),
  verifyUserEmail: vi.fn((req, res) => res.json({ success: true }))
}))

vi.mock('../../api/middleware/auth/index.js', () => ({
  authenticate: vi.fn((req, res, next) => next()),
  authorize: vi.fn(() => (req, res, next) => next()),
  checkOwnership: vi.fn(() => (req, res, next) => next())
}))

vi.mock('../../api/middleware/validation/index.js', () => ({
  validate: vi.fn(() => (req, res, next) => next()),
  validateId: vi.fn(() => (req, res, next) => next()),
  validatePagination: vi.fn((req, res, next) => next())
}))

describe('User Routes', () => {
  let app

  beforeEach(async () => {
    vi.clearAllMocks()
    const routes = await import('../../api/routes/userRoutes.js')
    app = express()
    app.use(express.json())
    app.use('/users', routes.default)
  })

  describe('GET /users', () => {
    it('should get all users', async () => {
      const res = await request(app).get('/users')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })

  describe('GET /users/:id', () => {
    it('should get user by id', async () => {
      const res = await request(app).get('/users/1')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })

  describe('GET /users/email/:email', () => {
    it('should get user by email', async () => {
      const res = await request(app).get('/users/email/test@test.com')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })

  describe('POST /users', () => {
    it('should create user', async () => {
      const res = await request(app)
        .post('/users')
        .send({ email: 'new@test.com', full_name: 'Test User' })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
    })
  })

  describe('PUT /users/:id', () => {
    it('should update user', async () => {
      const res = await request(app).put('/users/1').send({ full_name: 'Updated Name' })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })

  describe('DELETE /users/:id', () => {
    it('should delete user', async () => {
      const res = await request(app).delete('/users/1')
      expect(res.status).toBe(204)
    })
  })

  describe('PATCH /users/:id/reactivate', () => {
    it('should reactivate user', async () => {
      const res = await request(app).patch('/users/1/reactivate')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })

  describe('PATCH /users/:id/verify-email', () => {
    it('should verify user email', async () => {
      const res = await request(app).patch('/users/1/verify-email')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })
})
