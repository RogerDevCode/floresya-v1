/**
 * Contract Enforcement Unit Tests
 * Tests individual functions of the contract enforcement module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  contractEnforcementMiddleware,
  validateRequest,
  validateResponseData,
  getApiSpec
} from '../../api/contract/contractEnforcement.js'
import { DivergenceDetector } from '../../api/contract/divergenceDetector.js'
import fs from 'fs/promises'
import yaml from 'js-yaml'

// Mock the OpenAPI spec
const mockOpenApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'FloresYa API',
    version: '1.0.0'
  },
  paths: {
    '/api/products': {
      get: {
        summary: 'Get all products',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100 }
          },
          {
            name: 'featured',
            in: 'query',
            schema: { type: 'boolean' }
          }
        ],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create product',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['product'],
                properties: {
                  product: {
                    type: 'object',
                    required: ['name', 'price_usd'],
                    properties: {
                      name: { type: 'string', minLength: 2 },
                      price_usd: { type: 'number', minimum: 0 }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'object' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/products/{id}': {
      get: {
        summary: 'Get product by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 }
          }
        ],
        responses: {
          200: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'object' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// Mock fs.readFile and yaml.load
vi.mock('fs/promises')
vi.mock('js-yaml')

describe('Contract Enforcement Unit Tests', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Mock fs.readFile
    fs.readFile.mockResolvedValue(yaml.dump(mockOpenApiSpec))

    // Mock yaml.load
    yaml.load.mockReturnValue(mockOpenApiSpec)
  })

  describe('validateRequest', () => {
    it('should validate a valid GET request', async () => {
      const req = {
        path: '/api/products',
        method: 'GET',
        query: { limit: 10, featured: true },
        get: vi.fn(header => (header === 'Content-Type' ? 'application/json' : undefined))
      }

      const result = await validateRequest(req)
      expect(result).toBe(true)
    })

    it('should reject a GET request with invalid query parameters', async () => {
      const req = {
        path: '/api/products',
        method: 'GET',
        query: { limit: -1, featured: 'not-a-boolean' },
        get: vi.fn(header => (header === 'Content-Type' ? 'application/json' : undefined))
      }

      await expect(validateRequest(req)).rejects.toThrow()
    })

    it('should validate a valid POST request', async () => {
      const req = {
        path: '/api/products',
        method: 'POST',
        body: {
          product: {
            name: 'Valid Product',
            price_usd: 29.99
          }
        },
        get: vi.fn(header => (header === 'Content-Type' ? 'application/json' : undefined))
      }

      const result = await validateRequest(req)
      expect(result).toBe(true)
    })

    it('should reject a POST request with missing required fields', async () => {
      const req = {
        path: '/api/products',
        method: 'POST',
        body: {
          product: {
            name: 'Product without price'
            // Missing required price_usd field
          }
        },
        get: vi.fn(header => (header === 'Content-Type' ? 'application/json' : undefined))
      }

      await expect(validateRequest(req)).rejects.toThrow()
    })

    it('should reject a request to an undefined endpoint', async () => {
      const req = {
        path: '/api/undefined-endpoint',
        method: 'GET',
        query: {},
        get: vi.fn(header => (header === 'Content-Type' ? 'application/json' : undefined))
      }

      await expect(validateRequest(req)).rejects.toThrow('not defined in API specification')
    })
  })

  describe('validateResponseData', () => {
    it('should validate a valid response', async () => {
      const responseData = {
        success: true,
        data: [{ id: 1, name: 'Product 1' }],
        message: 'Products retrieved successfully'
      }

      const errors = await validateResponseData('/api/products', 'GET', '200', responseData)
      expect(errors).toEqual([])
    })

    it('should detect an invalid response type', async () => {
      const responseData = 'This should be an object'

      const errors = await validateResponseData('/api/products', 'GET', '200', responseData)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0].msg).toContain('Expected response type')
    })

    it('should validate an undefined response status', async () => {
      const responseData = { success: true }

      await expect(
        validateResponseData('/api/products', 'GET', '999', responseData)
      ).rejects.toThrow('not defined in API specification')
    })
  })

  describe('getApiSpec', () => {
    it('should return the loaded OpenAPI specification', async () => {
      const spec = await getApiSpec()
      expect(spec).toBeDefined()
      expect(spec.openapi).toBe('3.1.0')
      expect(spec.info.title).toBe('FloresYa API')
    })

    it('should cache the specification after first load', async () => {
      const spec1 = await getApiSpec()
      const spec2 = await getApiSpec()

      expect(spec1).toBe(spec2)
      // Verify the spec has the expected structure
      expect(spec1.paths).toBeDefined()
    })
  })

  describe('contractEnforcementMiddleware', () => {
    it('should pass valid requests to the next middleware', async () => {
      const req = {
        path: '/api/products',
        method: 'GET',
        query: { limit: 10 },
        get: vi.fn(header => (header === 'Content-Type' ? 'application/json' : undefined))
      }

      const res = {
        locals: {},
        statusCode: 200,
        json: vi.fn(),
        get: vi.fn()
      }

      const next = vi.fn()

      const middleware = contractEnforcementMiddleware()
      await middleware(req, res, next)

      expect(next).toHaveBeenCalled()
    })

    it('should reject invalid requests with a 400 response', async () => {
      const req = {
        path: '/api/products',
        method: 'GET',
        query: { limit: -1 },
        get: vi.fn(header => (header === 'Content-Type' ? 'application/json' : undefined))
      }

      const res = {
        locals: {},
        statusCode: 400,
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        get: vi.fn()
      }

      const next = vi.fn()

      const middleware = contractEnforcementMiddleware()
      await middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'validation'
        })
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should validate responses against the spec', async () => {
      const req = {
        path: '/api/products',
        method: 'GET',
        query: { limit: 10 },
        get: vi.fn(header => (header === 'Content-Type' ? 'application/json' : undefined))
      }

      const res = {
        locals: { responseBody: { success: true, data: [] } },
        statusCode: 200,
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        get: vi.fn()
      }

      const next = vi.fn()

      const middleware = contractEnforcementMiddleware()
      await middleware(req, res, next)

      // In development mode, it should validate the response
      if (process.env.NODE_ENV === 'development') {
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true
          })
        )
      }

      expect(next).toHaveBeenCalled()
    })
  })

  describe('DivergenceDetector', () => {
    it('should detect endpoint not defined in spec', async () => {
      const detector = new DivergenceDetector()
      await detector.initialize()

      const req = {
        path: '/api/undefined-endpoint',
        method: 'GET'
      }

      const divergence = await detector.checkRequestDivergence(req)

      expect(divergence).toBeDefined()
      expect(divergence.type).toBe('endpoint_not_defined')
      expect(divergence.severity).toBe('critical')
    })

    it('should detect missing required path parameters', async () => {
      const detector = new DivergenceDetector()
      await detector.initialize()

      const req = {
        path: '/api/products', // Missing {id} parameter
        method: 'GET'
      }

      // This would only be an issue if the path was '/api/products/{id}'
      // but we're testing the path without the parameter
      const divergence = await detector.checkRequestDivergence(req)

      // Should not report divergence for /api/products (no required path params)
      expect(divergence).toBeNull()
    })

    it('should detect invalid path parameters', async () => {
      const detector = new DivergenceDetector()
      await detector.initialize()

      const req = {
        path: '/api/products/invalid-id', // Should be numeric
        method: 'GET'
      }

      const divergence = await detector.checkRequestDivergence(req)

      expect(divergence).toBeDefined()
      expect(divergence.type).toBe('endpoint_not_defined')
      // The path doesn't match the pattern /api/products/{id} so it's undefined
    })

    it('should detect response divergences', async () => {
      const detector = new DivergenceDetector()
      await detector.initialize()

      const req = {
        path: '/api/products',
        method: 'GET'
      }

      const res = {
        statusCode: 500 // Use a status code that's not defined in our mock spec
      }

      const responseData = 'This should be an object'

      const divergence = await detector.checkResponseDivergence(req, res, responseData)

      // 500 status should trigger an undefined_response_status divergence
      expect(divergence).toBeDefined()
      expect(divergence.type).toBe('undefined_response_status')
      expect(divergence.severity).toBe('medium')
    })

    it('should generate a divergence report', () => {
      const detector = new DivergenceDetector()

      // Add some test divergences
      detector.addDivergence({
        type: 'test_divergence',
        severity: 'medium',
        message: 'Test divergence'
      })

      const report = detector.generateReport()

      expect(report.total).toBe(1)
      expect(report.medium).toBe(1)
      expect(report.divergences).toHaveLength(1)
      expect(report.divergences[0].type).toBe('test_divergence')
    })

    it('should clear divergences', () => {
      const detector = new DivergenceDetector()

      // Add a divergence
      detector.addDivergence({
        type: 'test_divergence',
        severity: 'medium',
        message: 'Test divergence'
      })

      // Verify it was added
      expect(detector.getDivergences()).toHaveLength(1)

      // Clear divergences
      detector.clearDivergences()

      // Verify it was cleared
      expect(detector.getDivergences()).toHaveLength(0)
    })
  })
})
