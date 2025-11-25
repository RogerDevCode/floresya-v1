/**
 * Tests for Rate Limit Middleware
 * Coverage for rate limiting functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('../../../api/errors/AppError.js', () => ({
  RateLimitExceededError: class RateLimitExceededError extends Error {
    constructor(message, context) {
      super(message)
      this.name = 'RateLimitExceededError'
      this.context = context
      this.statusCode = 429
    }
  }
}))

vi.mock('../../../api/utils/logger.js', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}))

describe('Rate Limit Middleware', () => {
  let rateLimitFuncs

  beforeEach(async () => {
    vi.clearAllMocks()
    rateLimitFuncs = await import('../../../api/middleware/security/rateLimit.js')
  })

  describe('rateLimit function', () => {
    it('should export rateLimit function', () => {
      expect(typeof rateLimitFuncs.rateLimit).toBe('function')
    })

    it('should return a middleware function', () => {
      const middleware = rateLimitFuncs.rateLimit('general')
      expect(typeof middleware).toBe('function')
    })
  })

  describe('specific rate limiters', () => {
    it('should export rateLimitOrderCreate', () => {
      expect(typeof rateLimitFuncs.rateLimitOrderCreate).toBe('function')
    })

    it('should export rateLimitOrderRead', () => {
      expect(typeof rateLimitFuncs.rateLimitOrderRead).toBe('function')
    })

    it('should export rateLimitAdmin', () => {
      expect(typeof rateLimitFuncs.rateLimitAdmin).toBe('function')
    })

    it('should export rateLimitFileUpload', () => {
      expect(typeof rateLimitFuncs.rateLimitFileUpload).toBe('function')
    })

    it('should export rateLimitCritical', () => {
      expect(typeof rateLimitFuncs.rateLimitCritical).toBe('function')
    })
  })

  describe('utility functions', () => {
    it('should export getRateLimitStats', () => {
      expect(typeof rateLimitFuncs.getRateLimitStats).toBe('function')
    })

    it('should export resetRateLimit', () => {
      expect(typeof rateLimitFuncs.resetRateLimit).toBe('function')
    })

    it('should export resetAllRateLimits', () => {
      expect(typeof rateLimitFuncs.resetAllRateLimits).toBe('function')
    })

    it('should return stats object', () => {
      const stats = rateLimitFuncs.getRateLimitStats()
      
      expect(stats).toBeDefined()
      expect(typeof stats).toBe('object')
    })
  })

  describe('protection middlewares', () => {
    it('should export protectOrderCreation', () => {
      expect(typeof rateLimitFuncs.protectOrderCreation).toBe('function')
    })

    it('should export protectAdminOperations', () => {
      expect(typeof rateLimitFuncs.protectAdminOperations).toBe('function')
    })

    it('should export getRateLimitHealth', () => {
      expect(typeof rateLimitFuncs.getRateLimitHealth).toBe('function')
    })
  })

  describe('request processing', () => {
    it('should export requestMetrics', () => {
      expect(typeof rateLimitFuncs.requestMetrics).toBe('function')
    })

    it('should export adaptiveRateLimit', () => {
      expect(typeof rateLimitFuncs.adaptiveRateLimit).toBe('function')
    })

    it('should export requestSizeLimit', () => {
      expect(typeof rateLimitFuncs.requestSizeLimit).toBe('function')
    })
  })
})
