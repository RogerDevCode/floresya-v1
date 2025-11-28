/**
 * Migration Controller Unit Tests
 * Following CLAUDE.md test validation rules
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { addIsActiveToSettings } from '../migrationController.js'

// Mock dependencies
vi.mock('../../services/migrationService.js', () => ({
  addIsActiveToSettings: vi.fn()
}))

vi.mock('../../utils/logger.js', () => ({
  log: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}))

vi.mock('../../errors/AppError.js', () => ({
  DatabaseError: class DatabaseError extends Error {
    constructor(operation, table, originalError, context = {}) {
      super(`Database error in ${operation} on ${table}`)
      this.name = 'DatabaseError'
      this.operation = operation
      this.table = table
      this.originalError = originalError
      this.context = context
    }
  }
}))

import * as migrationService from '../../services/migrationService.js'
import { DatabaseError } from '../../errors/AppError.js'

// Mock response and request objects
const mockResponse = () => {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

const mockRequest = (overrides = {}) => ({
  query: {},
  params: {},
  body: {},
  user: null,
  ...overrides
})

const mockNext = vi.fn()

describe('Migration Controller - Unit Tests with DI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('addIsActiveToSettings', () => {
    it('should execute migration successfully', async () => {
      const req = mockRequest()
      const res = mockResponse()
      const mockResult = {
        success: true,
        message: 'Migration executed successfully',
        changes: ['Added is_active column to settings table']
      }

      migrationService.addIsActiveToSettings.mockResolvedValue(mockResult)

      await addIsActiveToSettings(req, res, mockNext)

      expect(migrationService.addIsActiveToSettings).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Migration executed successfully'
      })
    })

    it('should handle DatabaseError during migration', async () => {
      const req = mockRequest()
      const res = mockResponse()
      const dbError = new DatabaseError(
        'ALTER_TABLE',
        'settings',
        new Error('Column already exists'),
        { column: 'is_active' }
      )

      migrationService.addIsActiveToSettings.mockRejectedValue(dbError)

      await addIsActiveToSettings(req, res, mockNext)

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'DatabaseError',
          operation: 'ALTER_TABLE'
        })
      )
    })

    it('should handle generic errors during migration', async () => {
      const req = mockRequest()
      const res = mockResponse()
      const genericError = new Error('Connection timeout')

      migrationService.addIsActiveToSettings.mockRejectedValue(genericError)

      await addIsActiveToSettings(req, res, mockNext)

      expect(mockNext).toHaveBeenCalledWith(genericError)
    })

    it('should handle migration with no changes needed', async () => {
      const req = mockRequest()
      const res = mockResponse()
      const mockResult = {
        success: true,
        message: 'No changes needed - already up to date',
        changes: []
      }

      migrationService.addIsActiveToSettings.mockResolvedValue(mockResult)

      await addIsActiveToSettings(req, res, mockNext)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'No changes needed - already up to date'
      })
    })
  })
})
