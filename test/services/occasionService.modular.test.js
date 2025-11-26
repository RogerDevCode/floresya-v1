/**
 * Tests for Occasion Service Modular Operations
 * Coverage for: create, read, update, delete operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as CreateOps from '../../api/services/occasionService.create.js'
import * as ReadOps from '../../api/services/occasionService.read.js'
import * as UpdateOps from '../../api/services/occasionService.update.js'
import * as DeleteOps from '../../api/services/occasionService.delete.js'
import * as Helpers from '../../api/services/occasionService.helpers.js'

// Mock the helpers module
vi.mock('../../api/services/occasionService.helpers.js', () => ({
  getOccasionRepository: vi.fn(),
  ValidationError: class ValidationError extends Error {
    constructor(message, context) {
      super(message)
      this.name = 'ValidationError'
      this.context = context
    }
  },
  BadRequestError: class BadRequestError extends Error {
    constructor(message, context) {
      super(message)
      this.name = 'BadRequestError'
      this.context = context
    }
  },
  NotFoundError: class NotFoundError extends Error {
    constructor(resource, id) {
      super(`${resource} with ID ${id} not found`)
      this.name = 'NotFoundError'
      this.resource = resource
      this.id = id
    }
  }
}))

describe('Occasion Service - Create Operations', () => {
  let mockRepository

  beforeEach(() => {
    mockRepository = {
      create: vi.fn()
    }
    vi.mocked(Helpers.getOccasionRepository).mockReturnValue(mockRepository)
  })

  describe('createOccasion', () => {
    it('should create occasion with valid data', async () => {
      const occasionData = {
        name: 'Birthday',
        slug: 'birthday',
        description: 'Birthday occasions',
        display_order: 1,
        active: true
      }

      const expectedOccasion = { id: 1, ...occasionData }
      mockRepository.create.mockResolvedValue(expectedOccasion)

      const result = await CreateOps.createOccasion(occasionData)

      expect(result).toEqual(expectedOccasion)
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'Birthday',
        slug: 'birthday',
        description: 'Birthday occasions',
        display_order: 1,
        active: true
      })
    })

    it('should create occasion with minimal data', async () => {
      const occasionData = {
        name: 'Wedding',
        slug: 'wedding'
      }

      const expectedOccasion = {
        id: 2,
        ...occasionData,
        description: null,
        display_order: 0,
        active: true
      }
      mockRepository.create.mockResolvedValue(expectedOccasion)

      const result = await CreateOps.createOccasion(occasionData)

      expect(result).toEqual(expectedOccasion)
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'Wedding',
        slug: 'wedding',
        description: null,
        display_order: 0,
        active: true
      })
    })

    it('should throw ValidationError when name is missing', async () => {
      const occasionData = { slug: 'test' }

      await expect(CreateOps.createOccasion(occasionData)).rejects.toThrow(
        'Occasion name is required'
      )
    })

    it('should throw ValidationError when name is not a string', async () => {
      const occasionData = { name: 123, slug: 'test' }

      await expect(CreateOps.createOccasion(occasionData)).rejects.toThrow('must be a string')
    })

    it('should throw ValidationError when slug is missing', async () => {
      const occasionData = { name: 'Test' }

      await expect(CreateOps.createOccasion(occasionData)).rejects.toThrow(
        'Occasion slug is required'
      )
    })

    it('should throw ValidationError when slug is not a string', async () => {
      const occasionData = { name: 'Test', slug: 123 }

      await expect(CreateOps.createOccasion(occasionData)).rejects.toThrow('must be a string')
    })

    it('should handle repository errors', async () => {
      const occasionData = { name: 'Test', slug: 'test' }
      mockRepository.create.mockRejectedValue(new Error('DB error'))

      await expect(CreateOps.createOccasion(occasionData)).rejects.toThrow('DB error')
    })
  })
})

describe('Occasion Service - Read Operations', () => {
  let mockRepository

  beforeEach(() => {
    mockRepository = {
      findAllWithFilters: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn()
    }
    vi.mocked(Helpers.getOccasionRepository).mockReturnValue(mockRepository)
  })

  describe('getAllOccasions', () => {
    it('should return all occasions', async () => {
      const occasions = [
        { id: 1, name: 'Birthday', slug: 'birthday' },
        { id: 2, name: 'Wedding', slug: 'wedding' }
      ]
      mockRepository.findAllWithFilters.mockResolvedValue(occasions)

      const result = await ReadOps.getAllOccasions()

      expect(result).toEqual(occasions)
      expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(
        {},
        { includeDeactivated: false }
      )
    })

    it('should return occasions with filters', async () => {
      const filters = { active: true }
      const occasions = [{ id: 1, name: 'Birthday', slug: 'birthday' }]
      mockRepository.findAllWithFilters.mockResolvedValue(occasions)

      const result = await ReadOps.getAllOccasions(filters, true)

      expect(result).toEqual(occasions)
      expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(filters, {
        includeDeactivated: true
      })
    })

    it('should return empty array when no occasions found', async () => {
      mockRepository.findAllWithFilters.mockResolvedValue(null)

      const result = await ReadOps.getAllOccasions()

      expect(result).toEqual([])
    })

    it('should handle repository errors', async () => {
      mockRepository.findAllWithFilters.mockRejectedValue(new Error('DB error'))

      await expect(ReadOps.getAllOccasions()).rejects.toThrow('DB error')
    })
  })

  describe('getOccasionById', () => {
    it('should return occasion by id', async () => {
      const occasion = { id: 1, name: 'Birthday', slug: 'birthday' }
      mockRepository.findById.mockResolvedValue(occasion)

      const result = await ReadOps.getOccasionById(1)

      expect(result).toEqual(occasion)
      expect(mockRepository.findById).toHaveBeenCalledWith(1, false)
    })

    it('should throw BadRequestError when id is not a number', async () => {
      await expect(ReadOps.getOccasionById('invalid')).rejects.toThrow('Invalid occasion ID')
    })

    it('should throw BadRequestError when id is missing', async () => {
      await expect(ReadOps.getOccasionById(null)).rejects.toThrow('Invalid occasion ID')
    })

    it('should throw NotFoundError when occasion not found', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(ReadOps.getOccasionById(999)).rejects.toThrow('not found')
    })

    it('should include deactivated when specified', async () => {
      const occasion = { id: 1, name: 'Birthday', active: false }
      mockRepository.findById.mockResolvedValue(occasion)

      const result = await ReadOps.getOccasionById(1, true)

      expect(result).toEqual(occasion)
      expect(mockRepository.findById).toHaveBeenCalledWith(1, true)
    })
  })

  describe('getOccasionBySlug', () => {
    it('should return occasion by slug', async () => {
      const occasion = { id: 1, name: 'Birthday', slug: 'birthday' }
      mockRepository.findBySlug.mockResolvedValue(occasion)

      const result = await ReadOps.getOccasionBySlug('birthday')

      expect(result).toEqual(occasion)
      expect(mockRepository.findBySlug).toHaveBeenCalledWith('birthday', false)
    })

    it('should throw BadRequestError when slug is not a string', async () => {
      await expect(ReadOps.getOccasionBySlug(123)).rejects.toThrow('Invalid occasion slug')
    })

    it('should throw BadRequestError when slug is missing', async () => {
      await expect(ReadOps.getOccasionBySlug(null)).rejects.toThrow('Invalid occasion slug')
    })

    it('should throw NotFoundError when occasion not found', async () => {
      mockRepository.findBySlug.mockResolvedValue(null)

      await expect(ReadOps.getOccasionBySlug('nonexistent')).rejects.toThrow('not found')
    })

    it('should include deactivated when specified', async () => {
      const occasion = { id: 1, name: 'Birthday', slug: 'birthday', active: false }
      mockRepository.findBySlug.mockResolvedValue(occasion)

      const result = await ReadOps.getOccasionBySlug('birthday', true)

      expect(result).toEqual(occasion)
      expect(mockRepository.findBySlug).toHaveBeenCalledWith('birthday', true)
    })
  })
})

describe('Occasion Service - Update Operations', () => {
  let mockRepository

  beforeEach(() => {
    mockRepository = {
      update: vi.fn()
    }
    vi.mocked(Helpers.getOccasionRepository).mockReturnValue(mockRepository)
  })

  describe('updateOccasion', () => {
    it('should update occasion with valid data', async () => {
      const updates = { name: 'Updated Name', description: 'New description' }
      const updatedOccasion = { id: 1, ...updates }
      mockRepository.update.mockResolvedValue(updatedOccasion)

      const result = await UpdateOps.updateOccasion(1, updates)

      expect(result).toEqual(updatedOccasion)
      expect(mockRepository.update).toHaveBeenCalledWith(1, updates)
    })

    it('should throw BadRequestError when id is invalid', async () => {
      await expect(UpdateOps.updateOccasion('invalid', { name: 'Test' })).rejects.toThrow(
        'Invalid occasion ID'
      )
    })

    it('should throw BadRequestError when no updates provided', async () => {
      await expect(UpdateOps.updateOccasion(1, {})).rejects.toThrow('No updates provided')
    })

    it('should throw ValidationError when name is not a string', async () => {
      await expect(UpdateOps.updateOccasion(1, { name: 123 })).rejects.toThrow('must be a string')
    })

    it('should throw ValidationError when slug is not a string', async () => {
      await expect(UpdateOps.updateOccasion(1, { slug: 123 })).rejects.toThrow('must be a string')
    })

    it('should handle repository errors', async () => {
      mockRepository.update.mockRejectedValue(new Error('DB error'))

      await expect(UpdateOps.updateOccasion(1, { name: 'Test' })).rejects.toThrow('DB error')
    })
  })

  describe('updateDisplayOrder', () => {
    it('should update display order', async () => {
      const updatedOccasion = { id: 1, display_order: 5 }
      mockRepository.update.mockResolvedValue(updatedOccasion)

      const result = await UpdateOps.updateDisplayOrder(1, 5)

      expect(result).toEqual(updatedOccasion)
      expect(mockRepository.update).toHaveBeenCalledWith(1, { display_order: 5 })
    })

    it('should throw BadRequestError when id is invalid', async () => {
      await expect(UpdateOps.updateDisplayOrder('invalid', 5)).rejects.toThrow(
        'Invalid occasion ID'
      )
    })

    it('should throw BadRequestError when order is negative', async () => {
      await expect(UpdateOps.updateDisplayOrder(1, -1)).rejects.toThrow('Invalid display order')
    })

    it('should throw BadRequestError when order is not a number', async () => {
      await expect(UpdateOps.updateDisplayOrder(1, 'invalid')).rejects.toThrow(
        'Invalid display order'
      )
    })

    it('should allow zero as display order', async () => {
      const updatedOccasion = { id: 1, display_order: 0 }
      mockRepository.update.mockResolvedValue(updatedOccasion)

      const result = await UpdateOps.updateDisplayOrder(1, 0)

      expect(result).toEqual(updatedOccasion)
    })
  })
})

describe('Occasion Service - Delete Operations', () => {
  let mockRepository

  beforeEach(() => {
    mockRepository = {
      delete: vi.fn(),
      reactivate: vi.fn()
    }
    vi.mocked(Helpers.getOccasionRepository).mockReturnValue(mockRepository)
  })

  describe('deleteOccasion', () => {
    it('should delete occasion', async () => {
      const deletedOccasion = { id: 1, active: false }
      mockRepository.delete.mockResolvedValue(deletedOccasion)

      const result = await DeleteOps.deleteOccasion(1)

      expect(result).toEqual(deletedOccasion)
      expect(mockRepository.delete).toHaveBeenCalledWith(1)
    })

    it('should throw BadRequestError when id is invalid', async () => {
      await expect(DeleteOps.deleteOccasion('invalid')).rejects.toThrow('Invalid occasion ID')
    })

    it('should handle repository errors', async () => {
      mockRepository.delete.mockRejectedValue(new Error('DB error'))

      await expect(DeleteOps.deleteOccasion(1)).rejects.toThrow('DB error')
    })
  })

  describe('reactivateOccasion', () => {
    it('should reactivate occasion', async () => {
      const reactivatedOccasion = { id: 1, active: true }
      mockRepository.reactivate.mockResolvedValue(reactivatedOccasion)

      const result = await DeleteOps.reactivateOccasion(1)

      expect(result).toEqual(reactivatedOccasion)
      expect(mockRepository.reactivate).toHaveBeenCalledWith(1)
    })

    it('should throw BadRequestError when id is invalid', async () => {
      await expect(DeleteOps.reactivateOccasion('invalid')).rejects.toThrow('Invalid occasion ID')
    })

    it('should handle repository errors', async () => {
      mockRepository.reactivate.mockRejectedValue(new Error('DB error'))

      await expect(DeleteOps.reactivateOccasion(1)).rejects.toThrow('DB error')
    })
  })
})
