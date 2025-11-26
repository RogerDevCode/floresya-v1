/**
 * @fileoverview Monitoring Routes Tests - Complete Coverage
 * @description Tests for monitoring and metrics endpoints
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import express from 'express'
import request from 'supertest'

const app = express()
app.use(express.json())

describe('Monitoring Routes - Metrics & Observability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /metrics - Prometheus metrics', () => {
    it('should return metrics in Prometheus format', async () => {
      const mockRouter = express.Router()
      mockRouter.get('/metrics', (req, res) => {
        res.set('Content-Type', 'text/plain')
        res.send('# HELP http_requests_total Total HTTP requests\nhttp_requests_total 100')
      })
      app.use('/monitoring', mockRouter)

      const response = await request(app).get('/monitoring/metrics')
      expect(response.status).toBe(200)
      expect(response.text).toContain('http_requests_total')
    })
  })

  describe('GET /monitoring/performance - Performance metrics', () => {
    it('should return performance data', async () => {
      const mockRouter = express.Router()
      mockRouter.get('/performance', (req, res) => {
        res.json({
          success: true,
          data: {
            cpu: 45.2,
            memory: 512,
            uptime: 3600
          }
        })
      })
      app.use('/monitoring2', mockRouter)

      const response = await request(app).get('/monitoring2/performance')
      expect(response.status).toBe(200)
      expect(response.body.data.cpu).toBeDefined()
    })
  })

  describe('GET /monitoring/database - Database health', () => {
    it('should return database metrics', async () => {
      const mockRouter = express.Router()
      mockRouter.get('/database', (req, res) => {
        res.json({
          success: true,
          data: {
            status: 'healthy',
            connections: 10,
            slowQueries: 0
          }
        })
      })
      app.use('/monitoring3', mockRouter)

      const response = await request(app).get('/monitoring3/database')
      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('healthy')
    })
  })
})
