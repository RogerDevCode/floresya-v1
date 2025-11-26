import { describe, it, expect, vi } from 'vitest'
import {
  validateErrorResponse,
  validateErrorObject,
  batchValidateErrors,
  createErrorResponseTemplate,
  getErrorComplianceScore,
  generateErrorComplianceReport
} from '../../api/utils/errorResponseValidator.js'

// Mock errorCodes module
vi.mock('../../api/config/errorCodes.js', () => ({
  ERROR_CODES: {
    VALIDATION_FAILED: 1001,
    UNAUTHORIZED: 2001,
    NOT_FOUND: 3001,
    CONFLICT: 4006,
    INTERNAL_ERROR: 5001
  },
  getErrorCategory: vi.fn(code => {
    if (code >= 1000 && code < 2000) {
      return 'validation'
    }
    if (code >= 2000 && code < 3000) {
      return 'authentication'
    }
    if (code >= 3000 && code < 4000) {
      return 'not_found'
    }
    if (code >= 4000 && code < 5000) {
      return 'business'
    }
    if (code >= 5000) {
      return 'server'
    }
    return 'unknown'
  }),
  isValidationError: vi.fn(code => code >= 1000 && code < 2000),
  isAuthError: vi.fn(code => code >= 2000 && code < 3000),
  isNotFoundCode: vi.fn(code => code >= 3000 && code < 4000),
  isBusinessError: vi.fn(code => code >= 4000 && code < 5000),
  isServerError: vi.fn(code => code >= 5000)
}))

describe('validateErrorResponse', () => {
  it('should pass validation for valid error response', () => {
    const response = {
      success: false,
      error: 'ValidationError',
      code: 1001,
      message: 'Validation failed',
      category: 'validation',
      type: 'https://api.floresya.com/errors/validation/failed',
      title: 'Validation Failed',
      status: 400,
      detail: 'Input validation failed',
      instance: '/api/products',
      timestamp: '2025-11-25T12:00:00.000Z',
      errors: { name: 'required' }
    }

    const result = validateErrorResponse(response)
    expect(result.isValid).toBe(true)
    expect(result.violations).toHaveLength(0)
  })

  it('should detect missing required fields', () => {
    const response = {
      success: false,
      error: 'TestError',
      type: 'https://api.floresya.com/errors/test',
      title: 'Test',
      status: 400,
      detail: 'Test',
      instance: '/test',
      timestamp: '2025-11-25T12:00:00.000Z',
      category: 'validation'
      // missing code and message
    }

    const result = validateErrorResponse(response)
    expect(result.isValid).toBe(false)
    expect(result.violations.some(v => v.includes('code'))).toBe(true)
    expect(result.violations.some(v => v.includes('message'))).toBe(true)
  })

  it('should detect missing RFC 7807 fields', () => {
    const response = {
      success: false,
      error: 'TestError',
      code: 1001,
      message: 'Test',
      category: 'validation',
      timestamp: '2025-11-25T12:00:00.000Z',
      type: '', // empty instead of missing
      title: '',
      status: 0,
      detail: '',
      instance: ''
    }

    const result = validateErrorResponse(response)
    expect(result.isValid).toBe(false)
    // Will fail URL validation instead
  })

  it('should validate success must be false', () => {
    const response = {
      success: true,
      error: 'TestError',
      code: 1001,
      message: 'Test',
      type: 'https://api.floresya.com/errors/test',
      title: 'Test',
      status: 400,
      detail: 'Test',
      instance: '/test',
      timestamp: '2025-11-25T12:00:00.000Z',
      category: 'validation'
    }

    const result = validateErrorResponse(response)
    expect(result.violations).toContain('success must be false for errors')
  })

  it('should validate field types', () => {
    const response = {
      success: false,
      error: 123, // should be string
      code: '1001', // should be number - but still valid from ERROR_CODES
      message: true, // should be string
      type: 'https://api.floresya.com/errors/test',
      title: 'Test',
      status: 400,
      detail: 'Test',
      instance: '/test',
      timestamp: '2025-11-25T12:00:00.000Z',
      category: 'validation',
      errors: {}
    }

    const result = validateErrorResponse(response)
    expect(result.violations.some(v => v.includes('error must be a string'))).toBe(true)
    expect(result.violations.some(v => v.includes('code must be a number'))).toBe(true)
    expect(result.violations.some(v => v.includes('message must be a string'))).toBe(true)
  })

  it('should validate code is from ERROR_CODES', () => {
    const response = {
      success: false,
      error: 'TestError',
      code: 9999, // invalid code
      message: 'Test',
      type: 'https://api.floresya.com/errors/test',
      title: 'Test',
      status: 400,
      detail: 'Test',
      instance: '/test',
      timestamp: '2025-11-25T12:00:00.000Z',
      category: 'validation'
    }

    const result = validateErrorResponse(response)
    expect(result.violations).toContain('code 9999 is not in ERROR_CODES')
  })

  it('should validate category matches code', () => {
    const response = {
      success: false,
      error: 'TestError',
      code: 1001,
      message: 'Test',
      type: 'https://api.floresya.com/errors/test',
      title: 'Test',
      status: 400,
      detail: 'Test',
      instance: '/test',
      timestamp: '2025-11-25T12:00:00.000Z',
      category: 'business' // wrong category
    }

    const result = validateErrorResponse(response)
    expect(result.violations).toContain("category business doesn't match code 1001")
  })

  it('should validate HTTP status for validation errors', () => {
    const response = {
      success: false,
      error: 'ValidationError',
      code: 1001,
      message: 'Test',
      type: 'https://api.floresya.com/errors/validation',
      title: 'Test',
      status: 500, // should be 400
      detail: 'Test',
      instance: '/test',
      timestamp: '2025-11-25T12:00:00.000Z',
      category: 'validation',
      errors: {}
    }

    const result = validateErrorResponse(response)
    expect(result.violations).toContain('validation errors must have status 400')
  })

  it('should validate type URL format', () => {
    const response = {
      success: false,
      error: 'TestError',
      code: 1001,
      message: 'Test',
      type: 'invalid-url',
      title: 'Test',
      status: 400,
      detail: 'Test',
      instance: '/test',
      timestamp: '2025-11-25T12:00:00.000Z',
      category: 'validation',
      errors: {}
    }

    const result = validateErrorResponse(response)
    expect(result.violations.some(v => v.includes('type must be a valid URL'))).toBe(true)
  })

  it('should validate timestamp format', () => {
    const response = {
      success: false,
      error: 'TestError',
      code: 1001,
      message: 'Test',
      type: 'https://api.floresya.com/errors/test',
      title: 'Test',
      status: 400,
      detail: 'Test',
      instance: '/test',
      timestamp: 'invalid-timestamp',
      category: 'validation',
      errors: {}
    }

    const result = validateErrorResponse(response)
    expect(result.violations).toContain('timestamp must be in ISO 8601 format')
  })
})

describe('validateErrorObject', () => {
  it('should validate complete error object', () => {
    const error = {
      name: 'ValidationError',
      message: 'Validation failed',
      code: 1001,
      statusCode: 400,
      status: 'fail',
      isOperational: true
    }

    const result = validateErrorObject(error)
    expect(result.isValid).toBe(true)
    expect(result.violations).toHaveLength(0)
  })

  it('should detect missing properties', () => {
    const error = {
      name: 'TestError',
      message: 'Test',
      statusCode: 400,
      status: 'fail',
      isOperational: true
      // missing code
    }

    const result = validateErrorObject(error)
    expect(result.isValid).toBe(false)
    expect(result.violations.some(v => v.includes('code'))).toBe(true)
  })

  it('should validate property types', () => {
    const error = {
      name: 'TestError',
      message: 'Test',
      code: '1001',
      statusCode: '400',
      status: 'fail',
      isOperational: 'true'
    }

    const result = validateErrorObject(error)
    expect(result.violations).toContain('code must be a number')
    expect(result.violations).toContain('statusCode must be a number')
    expect(result.violations).toContain('isOperational must be a boolean')
  })

  it('should validate status mapping for 4xx codes', () => {
    const error = {
      name: 'TestError',
      message: 'Test',
      code: 1001,
      statusCode: 400,
      status: 'error', // should be 'fail'
      isOperational: true
    }

    const result = validateErrorObject(error)
    expect(result.violations).toContain("status must be 'fail' for statusCode 400")
  })

  it('should validate status mapping for 5xx codes', () => {
    const error = {
      name: 'TestError',
      message: 'Test',
      code: 5001,
      statusCode: 500,
      status: 'fail', // should be 'error'
      isOperational: false
    }

    const result = validateErrorObject(error)
    expect(result.violations).toContain("status must be 'error' for statusCode 500")
  })
})

describe('createErrorResponseTemplate', () => {
  it('should create validation error template', () => {
    const template = createErrorResponseTemplate('validation')
    expect(template.success).toBe(false)
    expect(template.category).toBe('validation')
    expect(template.status).toBe(400)
    expect(template.errors).toBeDefined()
  })

  it('should create authentication error template', () => {
    const template = createErrorResponseTemplate('authentication')
    expect(template.category).toBe('authentication')
    expect(template.status).toBe(401)
  })

  it('should create not_found error template', () => {
    const template = createErrorResponseTemplate('not_found')
    expect(template.category).toBe('not_found')
    expect(template.status).toBe(404)
  })

  it('should create business error template', () => {
    const template = createErrorResponseTemplate('business')
    expect(template.category).toBe('business')
    expect(template.status).toBe(409)
  })

  it('should create server error template', () => {
    const template = createErrorResponseTemplate('server')
    expect(template.category).toBe('server')
    expect(template.status).toBe(500)
  })
})

describe('batchValidateErrors', () => {
  it('should validate multiple errors', () => {
    const errors = [
      {
        name: 'Error1',
        message: 'Test1',
        code: 1001,
        statusCode: 400,
        status: 'fail',
        isOperational: true
      },
      {
        name: 'Error2',
        message: 'Test2',
        code: 2001,
        statusCode: 401,
        status: 'fail',
        isOperational: true
      }
    ]

    const result = batchValidateErrors(errors)
    expect(result.total).toBe(2)
    expect(result.valid).toBe(2)
    expect(result.invalid).toBe(0)
  })

  it('should count invalid errors', () => {
    const errors = [
      {
        name: 'Valid',
        message: 'Test',
        code: 1001,
        statusCode: 400,
        status: 'fail',
        isOperational: true
      },
      {
        name: 'Invalid',
        message: 'Test',
        code: 1001,
        statusCode: 400,
        status: 'error', // wrong status for 400
        isOperational: true
      }
    ]

    const result = batchValidateErrors(errors)
    expect(result.total).toBe(2)
    expect(result.valid).toBe(1)
    expect(result.invalid).toBe(1)
    expect(result.violations[1]).toBeDefined()
  })
})

describe('getErrorComplianceScore', () => {
  it('should return high score for compliant error', () => {
    const error = {
      toJSON: () => ({
        success: false,
        error: 'ValidationError',
        code: 1001,
        message: 'Test',
        type: 'https://api.floresya.com/errors/validation',
        title: 'Validation',
        status: 400,
        detail: 'Test',
        instance: '/test',
        timestamp: '2025-11-25T12:00:00.000Z',
        category: 'validation',
        errors: {}
      })
    }

    const score = getErrorComplianceScore(error)
    expect(score).toBeGreaterThan(80)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('should return low score for non-compliant error', () => {
    const error = {
      toJSON: () => ({
        success: false,
        error: 'TestError',
        code: 9999,
        message: 'Test',
        type: 'https://api.floresya.com/errors/test',
        title: 'Test',
        status: 400,
        detail: 'Test',
        instance: '/test',
        timestamp: '2025-11-25T12:00:00.000Z',
        category: 'validation'
      })
    }

    const score = getErrorComplianceScore(error)
    expect(score).toBeLessThan(100) // Will have some violations
  })
})

describe('generateErrorComplianceReport', () => {
  it('should generate compliance report', () => {
    const errors = [
      {
        name: 'Test',
        message: 'Test',
        code: 1001,
        statusCode: 400,
        status: 'fail',
        isOperational: true,
        toJSON: () => ({
          success: false,
          error: 'TestError',
          code: 1001,
          message: 'Test',
          type: 'https://api.floresya.com/errors/test',
          title: 'Test',
          status: 400,
          detail: 'Test',
          instance: '/test',
          timestamp: '2025-11-25T12:00:00.000Z',
          category: 'validation',
          errors: {}
        })
      }
    ]

    const report = generateErrorComplianceReport(errors)
    expect(report.totalErrors).toBe(1)
    expect(report.averageComplianceScore).toBeGreaterThan(0)
    expect(report.message).toBeDefined()
  })

  it('should report when all errors comply', () => {
    const errors = [
      {
        name: 'Test',
        message: 'Test',
        code: 1001,
        statusCode: 400,
        status: 'fail',
        isOperational: true,
        toJSON: () => ({
          success: false,
          error: 'TestError',
          code: 1001,
          message: 'Test',
          type: 'https://api.floresya.com/errors/test',
          title: 'Test',
          status: 400,
          detail: 'Test',
          instance: '/test',
          timestamp: '2025-11-25T12:00:00.000Z',
          category: 'validation',
          errors: {}
        })
      }
    ]

    const report = generateErrorComplianceReport(errors)
    expect(report.passed).toBe(true)
    expect(report.message).toBe('All errors comply with standards')
  })
})
