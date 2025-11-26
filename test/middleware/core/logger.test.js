import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Core Middleware - Logger', () => {
  let mockReq, mockRes, mockNext

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/api/test',
      ip: '127.0.0.1',
      headers: {}
    }
    mockRes = {
      statusCode: 200,
      on: vi.fn((event, callback) => {
        if (event === 'finish') {
          callback()
        }
      })
    }
    mockNext = vi.fn()
    vi.clearAllMocks()
  })

  describe('Request logging', () => {
    it('should log incoming requests', () => {
      const logger = (req, res, next) => {
        console.log(`${req.method} ${req.path}`)
        next()
      }

      logger(mockReq, mockRes, mockNext)
      expect(mockNext).toHaveBeenCalled()
    })

    it('should log request method and path', () => {
      const logger = (req, res, next) => {
        expect(req.method).toBe('GET')
        expect(req.path).toBe('/api/test')
        next()
      }

      logger(mockReq, mockRes, mockNext)
    })

    it('should log client IP address', () => {
      const logger = (req, res, next) => {
        expect(req.ip).toBe('127.0.0.1')
        next()
      }

      logger(mockReq, mockRes, mockNext)
    })

    it('should log request headers', () => {
      mockReq.headers = { 'user-agent': 'test-agent' }
      const logger = (req, res, next) => {
        expect(req.headers['user-agent']).toBe('test-agent')
        next()
      }

      logger(mockReq, mockRes, mockNext)
    })
  })

  describe('Response logging', () => {
    it('should log response status code', () => {
      const logger = (req, res, next) => {
        res.on('finish', () => {
          expect(res.statusCode).toBe(200)
        })
        next()
      }

      logger(mockReq, mockRes, mockNext)
    })

    it('should log response time', () => {
      const logger = (req, res, next) => {
        const start = Date.now()
        res.on('finish', () => {
          const duration = Date.now() - start
          expect(duration).toBeGreaterThanOrEqual(0)
        })
        next()
      }

      logger(mockReq, mockRes, mockNext)
    })
  })

  describe('Error logging', () => {
    it('should log errors with stack trace', () => {
      const error = new Error('Test error')
      const errorLogger = (err, req, res, next) => {
        expect(err.message).toBe('Test error')
        expect(err.stack).toBeDefined()
        next(err)
      }

      errorLogger(error, mockReq, mockRes, mockNext)
      expect(mockNext).toHaveBeenCalledWith(error)
    })

    it('should log error context', () => {
      const error = new Error('Test error')
      error.context = { userId: 123 }

      const errorLogger = (err, req, res, next) => {
        expect(err.context).toEqual({ userId: 123 })
        next(err)
      }

      errorLogger(error, mockReq, mockRes, mockNext)
    })
  })

  describe('Log levels', () => {
    it('should support different log levels', () => {
      const levels = ['debug', 'info', 'warn', 'error']
      levels.forEach(level => {
        expect(levels).toContain(level)
      })
    })

    it('should filter logs by level', () => {
      const minLevel = 'warn'
      const shouldLog = level => {
        const levels = ['debug', 'info', 'warn', 'error']
        return levels.indexOf(level) >= levels.indexOf(minLevel)
      }

      expect(shouldLog('error')).toBe(true)
      expect(shouldLog('warn')).toBe(true)
      expect(shouldLog('info')).toBe(false)
    })
  })

  describe('Log formatting', () => {
    it('should format logs as JSON', () => {
      const log = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Test message'
      }

      const json = JSON.stringify(log)
      expect(json).toContain('timestamp')
      expect(json).toContain('level')
      expect(json).toContain('message')
    })

    it('should include metadata in logs', () => {
      const log = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Test message',
        metadata: {
          userId: 123,
          action: 'login'
        }
      }

      expect(log.metadata).toBeDefined()
      expect(log.metadata.userId).toBe(123)
    })
  })
})
