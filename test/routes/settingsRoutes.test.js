import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

vi.mock('../../api/controllers/settingsController.js', () => ({
  getPublicSettings: vi.fn((req, res) => res.json({ success: true, data: {} })),
  getSettingsMap: vi.fn((req, res) => res.json({ success: true, data: {} })),
  getSettingValue: vi.fn((req, res) => res.json({ success: true, data: 'value' })),
  getAllSettings: vi.fn((req, res) => res.json({ success: true, data: [] })),
  getSettingByKey: vi.fn((req, res) => res.json({ success: true, data: {} })),
  createSetting: vi.fn((req, res) => res.status(201).json({ success: true })),
  updateSetting: vi.fn((req, res) => res.json({ success: true })),
  deleteSetting: vi.fn((req, res) => res.status(204).send())
}))

vi.mock('../../api/middleware/auth/index.js', () => ({
  authenticate: vi.fn((req, res, next) => next()),
  authorize: vi.fn(() => (req, res, next) => next())
}))

vi.mock('../../api/middleware/validation/index.js', () => ({
  validate: vi.fn(() => (req, res, next) => next())
}))

describe('Settings Routes', () => {
  let app

  beforeEach(async () => {
    vi.clearAllMocks()
    const routes = await import('../../api/routes/settingsRoutes.js')
    app = express()
    app.use(express.json())
    app.use('/settings', routes.default)
  })

  it('GET /settings/public - should get public settings', async () => {
    const res = await request(app).get('/settings/public')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('GET /settings/map - should get settings map', async () => {
    const res = await request(app).get('/settings/map')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('GET /settings/:key/value - should get setting value', async () => {
    const res = await request(app).get('/settings/test-key/value')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('GET /settings - should get all settings (admin)', async () => {
    const res = await request(app).get('/settings')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('GET /settings/:key - should get setting by key (admin)', async () => {
    const res = await request(app).get('/settings/test-key')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('POST /settings - should create setting (admin)', async () => {
    const res = await request(app).post('/settings').send({ key: 'test', value: 'test' })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
  })

  it('PUT /settings/:key - should update setting (admin)', async () => {
    const res = await request(app).put('/settings/test-key').send({ value: 'updated' })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('DELETE /settings/:key - should delete setting (admin)', async () => {
    const res = await request(app).delete('/settings/test-key')
    expect(res.status).toBe(204)
  })
})
