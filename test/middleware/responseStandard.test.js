/**
 * Response Standard Middleware Tests
 * 100% success standard - Testing response format standardization middleware
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

import { standardResponse } from '../../api/middleware/api/responseStandard.js'

describe('Response Standard Middleware', () => {
  let mockRequest
  let mockResponse
  let mockNext

  beforeEach(() => {
    vi.clearAllMocks()

    mockRequest = {
      method: 'GET',
      path: '/api/test'
    }

    mockResponse = {
      statusCode: 200,
      json: vi.fn(function(data) {
        return data // Return the data for inspection
      })
    }

    mockNext = vi.fn()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Middleware Execution', () => {
    test('should call next middleware function', () => {
      // Arrange & Act
      standardResponse(mockRequest, mockResponse, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalledWith()
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    test('should override res.json method', () => {
      // Arrange & Act
      const originalJson = mockResponse.json
      standardResponse(mockRequest, mockResponse, mockNext)

      // Assert
      expect(typeof mockResponse.json).toBe('function')
      expect(mockResponse.json).not.toBe(originalJson)
    })
  })

  describe('Response Format Standardization', () => {
    test('should pass through already standardized response format', () => {
      // Arrange
      const standardData = {
        success: true,
        data: { id: 1, name: 'Test' },
        message: 'Success'
      }

      // Act
      standardResponse(mockRequest, mockResponse, mockNext)
      const result = mockResponse.json(standardData)

      // Assert
      expect(result).toEqual(standardData)
      expect(typeof mockResponse.json).toBe('function')
    })

    test('should convert legacy format to standard for successful responses', () => {
      // Arrange
      mockResponse.statusCode = 200
      const legacyData = { id: 1, name: 'Test Product' }

      // Act
      standardResponse(mockRequest, mockResponse, mockNext)
      const result = mockResponse.json(legacyData)

      // Assert
      expect(result).toEqual({
        success: true,
        data: { id: 1, name: 'Test Product' },
        message: 'Success'
      })
    })

    test('should convert legacy format to standard for error responses', () => {
      // Arrange
      mockResponse.statusCode = 400
      const errorData = { error: 'Bad Request' }

      // Act
      standardResponse(mockRequest, mockResponse, mockNext)
      const result = mockResponse.json(errorData)

      // Assert
      expect(result).toEqual({
        success: false,
        data: errorData.data || errorData,
        message: 'Error occurred',
        error: 'Bad Request'
      })
    })

    test('should handle data with message property', () => {
      // Arrange
      mockResponse.statusCode = 201
      const dataWithMessage = {
        id: 1,
        name: 'Test',
        message: 'Resource created successfully'
      }

      // Act
      standardResponse(mockRequest, mockResponse, mockNext)
      const result = mockResponse.json(dataWithMessage)

      // Assert
      expect(result).toEqual({
        success: true,
        data: dataWithMessage,
        message: 'Resource created successfully'
      })
    })

    test('should handle data with data property', () => {
      // Arrange
      mockResponse.statusCode = 200
      const dataWithDataProp = {
        data: { id: 1, name: 'Test' },
        pagination: { page: 1, limit: 10 }
      }

      // Act
      standardResponse(mockRequest, mockResponse, mockNext)
      const result = mockResponse.json(dataWithDataProp)

      // Assert
      expect(result).toEqual({
        success: true,
        data: { id: 1, name: 'Test' },
        message: 'Success'
      })
    })

    test('should handle array data', () => {
      // Arrange
      mockResponse.statusCode = 200
      const arrayData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ]

      // Act
      standardResponse(mockRequest, mockResponse, mockNext)
      const result = mockResponse.json(arrayData)

      // Assert
      expect(result).toEqual({
        success: true,
        data: arrayData,
        message: 'Success'
      })
    })

    test('should handle null data', () => {
      // Arrange
      mockResponse.statusCode = 200

      // Act
      standardResponse(mockRequest, mockResponse, mockNext)
      const result = mockResponse.json(null)

      // Assert
      expect(result).toEqual({
        success: true,
        data: null,
        message: 'Success'
      })
    })

    test('should handle empty object', () => {
      // Arrange
      mockResponse.statusCode = 200

      // Act
      standardResponse(mockRequest, mockResponse, mockNext)
      const result = mockResponse.json({})

      // Assert
      expect(result).toEqual({
        success: true,
        data: {},
        message: 'Success'
      })
    })
  })

  describe('Status Code Handling', () => {
    test('should treat 2xx status codes as success', () => {
      // Arrange & Act
      standardResponse(mockRequest, mockResponse, mockNext)

      const statusCodes = [200, 201, 204, 250, 299]
      const results = statusCodes.map(statusCode => {
        mockResponse.statusCode = statusCode
        return mockResponse.json({ test: 'data' })
      })

      // Assert
      results.forEach(result => {
        expect(result.success).toBe(true)
        expect(result.message).toBe('Success')
      })
    })

    test('should treat non-2xx status codes as error', () => {
      // Arrange & Act
      standardResponse(mockRequest, mockResponse, mockNext)

      const statusCodes = [100, 199, 300, 400, 401, 404, 500, 503]
      const results = statusCodes.map(statusCode => {
        mockResponse.statusCode = statusCode
        return mockResponse.json({ test: 'data' })
      })

      // Assert
      results.forEach(result => {
        expect(result.success).toBe(false)
        expect(result.message).toBe('Error occurred')
      })
    })
  })

  describe('Edge Cases', () => {
    test('should handle string data', () => {
      // Arrange
      mockResponse.statusCode = 200

      // Act
      standardResponse(mockRequest, mockResponse, mockNext)
      const result = mockResponse.json('Simple string')

      // Assert
      expect(result).toEqual({
        success: true,
        data: 'Simple string',
        message: 'Success'
      })
    })

    test('should handle number data', () => {
      // Arrange
      mockResponse.statusCode = 200

      // Act
      standardResponse(mockRequest, mockResponse, mockNext)
      const result = mockResponse.json(42)

      // Assert
      expect(result).toEqual({
        success: true,
        data: 42,
        message: 'Success'
      })
    })

    test('should handle boolean data', () => {
      // Arrange
      mockResponse.statusCode = 200

      // Act
      standardResponse(mockRequest, mockResponse, mockNext)
      const result = mockResponse.json(true)

      // Assert
      expect(result).toEqual({
        success: true,
        data: true,
        message: 'Success'
      })
    })

    test('should preserve error property when present', () => {
      // Arrange
      mockResponse.statusCode = 400
      const errorData = {
        message: 'Validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: ['Field required', 'Invalid format']
        }
      }

      // Act
      standardResponse(mockRequest, mockResponse, mockNext)
      const result = mockResponse.json(errorData)

      // Assert
      expect(result).toEqual({
        success: false,
        data: errorData,
        message: 'Validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: ['Field required', 'Invalid format']
        }
      })
    })

    test('should handle complex nested objects', () => {
      // Arrange
      mockResponse.statusCode = 200
      const complexData = {
        user: {
          id: 1,
          profile: {
            name: 'John Doe',
            preferences: {
              theme: 'dark',
              notifications: true
            }
          }
        },
        metadata: {
          timestamp: Date.now(),
          version: '1.0'
        }
      }

      // Act
      standardResponse(mockRequest, mockResponse, mockNext)
      const result = mockResponse.json(complexData)

      // Assert
      expect(result).toEqual({
        success: true,
        data: complexData,
        message: 'Success'
      })
    })

    test('should handle response without original json method', () => {
      // Arrange
      mockResponse = {
        statusCode: 200
        // No json method initially
      }

      // Act & Assert
      expect(() => {
        standardResponse(mockRequest, mockResponse, mockNext)
      }).not.toThrow()
      expect(mockNext).toHaveBeenCalled()
    })
  })

  describe('Method Preservation', () => {
    test('should preserve this context when calling original json', () => {
      // Arrange
      const originalJson = vi.fn(function(data) {
        this.calledWithContext = true
        return data
      })
      mockResponse.json = originalJson

      // Act
      standardResponse(mockRequest, mockResponse, mockNext)
      mockResponse.json({ test: 'data' })

      // Assert
      expect(originalJson).toHaveBeenCalled()
      expect(mockResponse.calledWithContext).toBe(true)
    })

    test('should call original json with correct arguments', () => {
      // Arrange
      const originalJson = vi.fn()
      mockResponse.json = originalJson

      // Act
      standardResponse(mockRequest, mockResponse, mockNext)
      const testData = { test: 'data' }
      mockResponse.json(testData)

      // Assert
      expect(originalJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: expect.any(Boolean),
          data: expect.any(Object),
          message: expect.any(String)
        })
      )
    })
  })

  describe('Error Handling', () => {
    test('should handle undefined data gracefully', () => {
      // Arrange
      mockResponse.statusCode = 200
      const undefinedData = undefined

      // Act
      standardResponse(mockRequest, mockResponse, mockNext)
      const result = mockResponse.json(undefinedData)

      // Assert
      expect(result).toEqual({
        success: true,
        data: null,
        message: 'Success'
      })
      expect(mockNext).toHaveBeenCalled()
    })
  })
})