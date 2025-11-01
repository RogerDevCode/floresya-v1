import request from 'supertest'
import app from '../../api/app.js'

describe('Simple 404 Test', () => {
  it('should return 404 for undefined paths', async () => {
    const response = await request(app).get('/api/nonexistent-endpoint').expect(404)

    expect(response.body.success).toBe(false)
  })
})
