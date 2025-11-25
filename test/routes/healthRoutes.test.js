/**
 * Health Routes Tests
 * Comprehensive tests for health check endpoints
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import healthRoutes from '../../api/routes/healthRoutes.js'

describe('Health Routes - System Monitoring', () => {
  let app

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use('/health', healthRoutes)
  })

  afterAll(() => {
    vi.clearAllMocks()
  })

  describe('GET /health - Basic health check', () => {
    it('should return health status successfully', async () => {
      const response = await request(app).get('/health')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('status')
      expect(response.body.data).toHaveProperty('uptime')
      expect(response.body.data).toHaveProperty('timestamp')
    })

    it('should return valid uptime', async () => {
      const response = await request(app).get('/health')

      expect(response.body.data.uptime).toBeGreaterThan(0)
      expect(typeof response.body.data.uptime).toBe('number')
    })

    it('should return valid status', async () => {
      const response = await request(app).get('/health')

      expect(response.body.data).toHaveProperty('status')
      expect(['healthy', 'degraded', 'unhealthy']).toContain(response.body.data.status)
    })
  })

  describe('GET /health/comprehensive - Comprehensive health check', () => {
    it('should handle comprehensive check', async () => {
      const response = await request(app).get('/health/comprehensive')

      // Can return 200 or 503 depending on system health
      expect([200, 503]).toContain(response.status)
      expect(response.body).toHaveProperty('success')
    })
  })

  describe('GET /health/metrics - Metrics report', () => {
    it('should return metrics report', async () => {
      const response = await request(app).get('/health/metrics')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
    })

    it('should include metrics data', async () => {
      const response = await request(app).get('/health/metrics')

      expect(response.body).toHaveProperty('data')
      expect(typeof response.body.data).toBe('object')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid routes gracefully', async () => {
      const response = await request(app).get('/health/invalid')

      expect(response.status).toBe(404)
    })
  })
})
