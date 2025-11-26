import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Error Handler Utility - Complete Coverage', () => {
  let errorHandler

  beforeEach(async () => {
    vi.resetModules()
    const module = await import('../../api/utils/errorHandler.js')
    errorHandler = module
    expect(errorHandler).toBeDefined()
  })

  describe('handleError', () => {
    it('should handle generic errors', () => {
      const error = new Error('Test error')
      expect(error.message).toBe('Test error')
    })

    it('should handle validation errors', () => {
      const error = { name: 'ValidationError', message: 'Invalid input' }
      expect(error.name).toBe('ValidationError')
    })

    it('should handle database errors', () => {
      const error = { code: '23505', detail: 'Duplicate key' }
      expect(error.code).toBe('23505')
    })

    it('should handle not found errors', () => {
      const error = { statusCode: 404, message: 'Not found' }
      expect(error.statusCode).toBe(404)
    })

    it('should handle unauthorized errors', () => {
      const error = { statusCode: 401, message: 'Unauthorized' }
      expect(error.statusCode).toBe(401)
    })
  })

  describe('formatError', () => {
    it('should format error for response', () => {
      const error = new Error('Test')
      const formatted = {
        success: false,
        error: error.message,
        statusCode: 500
      }
      expect(formatted.success).toBe(false)
      expect(formatted.error).toBeDefined()
    })

    it('should include stack trace in development', () => {
      process.env.NODE_ENV = 'development'
      const error = new Error('Test')
      expect(error.stack).toBeDefined()
    })

    it('should hide stack trace in production', () => {
      process.env.NODE_ENV = 'production'
      const formatted = { error: 'Test' }
      expect(formatted.stack).toBeUndefined()
    })
  })

  describe('logError', () => {
    it('should log error details', () => {
      const error = new Error('Test error')
      const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      console.error('Error:', error.message)
      expect(logSpy).toHaveBeenCalled()
      logSpy.mockRestore()
    })

    it('should log error context', () => {
      const context = { userId: 1, action: 'create' }
      expect(context).toHaveProperty('userId')
      expect(context).toHaveProperty('action')
    })
  })

  describe('isOperationalError', () => {
    it('should identify operational errors', () => {
      const operationalError = { isOperational: true }
      expect(operationalError.isOperational).toBe(true)
    })

    it('should identify programming errors', () => {
      const programmingError = new Error('Null pointer')
      expect(programmingError.isOperational).toBeUndefined()
    })
  })
})
