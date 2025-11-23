/**
 * Occasion Controller Unit Tests
 * Following CLAUDE.md test validation rules
 */
// @ts-nocheck

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getAllOccasions,
  getOccasionById,
  getOccasionBySlug,
  createOccasion,
  updateOccasion,
  updateDisplayOrder,
  deleteOccasion,
  reactivateOccasion
} from '../occasionController.js'

// Mock dependencies
vi.mock('../../services/occasionService.js', () => ({
  getAllOccasions: vi.fn(),
  getOccasionById: vi.fn(),
  getOccasionBySlug: vi.fn(),
  createOccasion: vi.fn(),
  updateOccasion: vi.fn(),
  updateDisplayOrder: vi.fn(),
  deleteOccasion: vi.fn(),
  reactivateOccasion: vi.fn()
}))

vi.mock('../../services/validation/ValidatorService.js', () => ({
  ValidatorService: {
    validateId: vi.fn()
  }
}))

vi.mock('../../middleware/error/index.js', () => ({
  asyncHandler: vi.fn(fn => fn)
}))

vi.mock('../../errors/AppError.js', () => ({
  BadRequestError: class BadRequestError extends Error {
    constructor(message, context = {}) {
      super(message)
      this.name = 'BadRequestError'
      this.context = context
    }
  }
}))

import * as occasionService from '../../services/occasionService.js'
import { ValidatorService } from '../../services/validation/ValidatorService.js'

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

describe('Occasion Controller - Unit Tests with DI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getAllOccasions', () => {
    it('should get all occasions successfully', async () => {
      const req = mockRequest({
        query: { limit: '10' }
      })
      const res = mockResponse()
      const mockOccasions = [
        { id: 1, name: 'Birthday', slug: 'birthday' },
        { id: 2, name: 'Wedding', slug: 'wedding' }
      ]

      occasionService.getAllOccasions.mockResolvedValue(mockOccasions)

      await getAllOccasions(req, res)

      expect(occasionService.getAllOccasions).toHaveBeenCalledWith({ limit: '10' }, false)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOccasions,
        message: 'Occasions retrieved successfully'
      })
    })

    it('should handle admin includeDeactivated', async () => {
      const req = mockRequest({
        user: { role: 'admin' }
      })
      const res = mockResponse()
      const mockOccasions = []

      occasionService.getAllOccasions.mockResolvedValue(mockOccasions)

      await getAllOccasions(req, res)

      expect(occasionService.getAllOccasions).toHaveBeenCalledWith(expect.any(Object), true)
    })
  })

  describe('getOccasionById', () => {
    it('should get occasion by ID successfully', async () => {
      const req = mockRequest({
        params: { id: '1' }
      })
      const res = mockResponse()
      const mockOccasion = { id: 1, name: 'Birthday', slug: 'birthday' }

      ValidatorService.validateId.mockReturnValue(1)
      occasionService.getOccasionById.mockResolvedValue(mockOccasion)

      await getOccasionById(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'occasionId')
      expect(occasionService.getOccasionById).toHaveBeenCalledWith(1, false)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOccasion,
        message: 'Occasion retrieved successfully'
      })
    })

    it('should handle admin access', async () => {
      const req = mockRequest({
        params: { id: '1' },
        user: { role: 'admin' }
      })
      const res = mockResponse()
      const mockOccasion = { id: 1, active: false }

      ValidatorService.validateId.mockReturnValue(1)
      occasionService.getOccasionById.mockResolvedValue(mockOccasion)

      await getOccasionById(req, res)

      expect(occasionService.getOccasionById).toHaveBeenCalledWith(1, true)
    })
  })

  describe('getOccasionBySlug', () => {
    it('should get occasion by slug successfully', async () => {
      const req = mockRequest({
        params: { slug: 'birthday' }
      })
      const res = mockResponse()
      const mockOccasion = { id: 1, name: 'Birthday', slug: 'birthday' }

      occasionService.getOccasionBySlug.mockResolvedValue(mockOccasion)

      await getOccasionBySlug(req, res)

      expect(occasionService.getOccasionBySlug).toHaveBeenCalledWith('birthday', false)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOccasion,
        message: 'Occasion retrieved successfully'
      })
    })
  })

  describe('createOccasion', () => {
    it('should create occasion successfully', async () => {
      const req = mockRequest({
        body: {
          name: 'Anniversary',
          slug: 'anniversary',
          icon_name: 'heart'
        }
      })
      const res = mockResponse()
      const mockOccasion = { id: 1, ...req.body }

      occasionService.createOccasion.mockResolvedValue(mockOccasion)

      await createOccasion(req, res)

      expect(occasionService.createOccasion).toHaveBeenCalledWith(req.body)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOccasion,
        message: 'Occasion created successfully'
      })
    })
  })

  describe('updateOccasion', () => {
    it('should update occasion successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { name: 'Updated Birthday', icon_name: 'cake' }
      })
      const res = mockResponse()
      const mockOccasion = { id: 1, ...req.body }

      ValidatorService.validateId.mockReturnValue(1)
      occasionService.updateOccasion.mockResolvedValue(mockOccasion)

      await updateOccasion(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'occasionId')
      expect(occasionService.updateOccasion).toHaveBeenCalledWith(1, req.body)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOccasion,
        message: 'Occasion updated successfully'
      })
    })
  })

  describe('updateDisplayOrder', () => {
    it('should update display order successfully', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { order: 5 }
      })
      const res = mockResponse()
      const mockOccasion = { id: 1, display_order: 5 }

      ValidatorService.validateId.mockReturnValue(1)
      occasionService.updateDisplayOrder.mockResolvedValue(mockOccasion)

      await updateDisplayOrder(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'occasionId')
      expect(occasionService.updateDisplayOrder).toHaveBeenCalledWith(1, 5)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOccasion,
        message: 'Display order updated successfully'
      })
    })
  })

  describe('deleteOccasion', () => {
    it('should soft-delete occasion successfully', async () => {
      const req = mockRequest({
        params: { id: '1' }
      })
      const res = mockResponse()
      const mockOccasion = { id: 1, active: false }

      ValidatorService.validateId.mockReturnValue(1)
      occasionService.deleteOccasion.mockResolvedValue(mockOccasion)

      await deleteOccasion(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'occasionId')
      expect(occasionService.deleteOccasion).toHaveBeenCalledWith(1)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOccasion,
        message: 'Occasion deactivated successfully'
      })
    })
  })

  describe('reactivateOccasion', () => {
    it('should reactivate occasion successfully', async () => {
      const req = mockRequest({
        params: { id: '1' }
      })
      const res = mockResponse()
      const mockOccasion = { id: 1, active: true }

      ValidatorService.validateId.mockReturnValue(1)
      occasionService.reactivateOccasion.mockResolvedValue(mockOccasion)

      await reactivateOccasion(req, res)

      expect(ValidatorService.validateId).toHaveBeenCalledWith('1', 'occasionId')
      expect(occasionService.reactivateOccasion).toHaveBeenCalledWith(1)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOccasion,
        message: 'Occasion reactivated successfully'
      })
    })
  })
})
