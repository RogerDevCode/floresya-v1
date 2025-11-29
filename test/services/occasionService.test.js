/**
 * Tests for Occasion Service (Monolithic)
 * Coverage for: create, read, update, delete operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as OccasionService from '../../api/services/occasionService.js'
import DIContainer from '../../api/architecture/di-container.js'

// Mock DIContainer
vi.mock('../../api/architecture/di-container.js', () => ({
  default: {
    resolve: vi.fn()
  }
}))

// Mock ValidatorService
vi.mock('../../api/services/validation/ValidatorService.js', () => ({
  default: {
    validateId: vi.fn((id) => {
      if (!id || id === 'invalid') {
        throw new Error('Invalid ID')
      }
      return id
    })
  }
}))

// Mock utils/validation
vi.mock('../../api/utils/validation.js', () => ({
  validateOccasion: vi.fn()
}))

describe('Occasion Service (Monolithic)', () => {
  let mockRepository

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findAllWithFilters: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      update: vi.fn()
    }
    vi.mocked(DIContainer.resolve).mockReturnValue(mockRepository)
  })

  describe('getAllOccasions', () => {
    it('should return all occasions', async () => {
      const occasions = [
        { id: 1, name: 'Birthday', slug: 'birthday' },
        { id: 2, name: 'Wedding', slug: 'wedding' }
      ]
      mockRepository.findAllWithFilters.mockResolvedValue(occasions)

      const result = await OccasionService.getAllOccasions()

      expect(result).toEqual(occasions)
      expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(
        { includeDeactivated: false },
        expect.objectContaining({ orderBy: 'display_order' })
      )
    })

    it('should return occasions with filters', async () => {
      const filters = { limit: 10 }
      const occasions = [{ id: 1, name: 'Birthday', slug: 'birthday' }]
      mockRepository.findAllWithFilters.mockResolvedValue(occasions)

      const result = await OccasionService.getAllOccasions(filters, true)

      expect(result).toEqual(occasions)
      expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(
        { limit: 10, includeDeactivated: true },
        expect.any(Object)
      )
    })

    it('should return empty array when no occasions found', async () => {
      mockRepository.findAllWithFilters.mockResolvedValue(null)

      const result = await OccasionService.getAllOccasions()

      expect(result).toEqual([])
    })
  })

  describe('getOccasionById', () => {
    it('should return occasion by id', async () => {
      const occasion = { id: 1, name: 'Birthday', slug: 'birthday' }
      mockRepository.findById.mockResolvedValue(occasion)

      const result = await OccasionService.getOccasionById(1)

      expect(result).toEqual(occasion)
      expect(mockRepository.findById).toHaveBeenCalledWith(1, false)
    })

    it('should throw NotFoundError when occasion not found', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(OccasionService.getOccasionById(999)).rejects.toThrow('Occasion with ID 999 not found')
    })
  })

  describe('getOccasionBySlug', () => {
    it('should return occasion by slug', async () => {
      const occasion = { id: 1, name: 'Birthday', slug: 'birthday' }
      mockRepository.findBySlug.mockResolvedValue(occasion)

      const result = await OccasionService.getOccasionBySlug('birthday')

      expect(result).toEqual(occasion)
      expect(mockRepository.findBySlug).toHaveBeenCalledWith('birthday', false)
    })

    it('should throw BadRequestError when slug is invalid', async () => {
      await expect(OccasionService.getOccasionBySlug(123)).rejects.toThrow('Invalid slug')
    })

    it('should throw NotFoundError when occasion not found', async () => {
      mockRepository.findBySlug.mockResolvedValue(null)

      await expect(OccasionService.getOccasionBySlug('nonexistent')).rejects.toThrow('Occasion with ID nonexistent not found')
    })
  })

  describe('createOccasion', () => {
    it('should create occasion with valid data', async () => {
      const occasionData = {
        name: 'Birthday',
        slug: 'birthday',
        description: 'Birthday occasions',
        display_order: 1
      }

      const expectedOccasion = { id: 1, ...occasionData, active: true }
      mockRepository.create.mockResolvedValue(expectedOccasion)

      const result = await OccasionService.createOccasion(occasionData)

      expect(result).toEqual(expectedOccasion)
      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Birthday',
        slug: 'birthday',
        active: true
      }))
    })
  })

  describe('updateOccasion', () => {
    it('should update occasion with valid data', async () => {
      const updates = { name: 'Updated Name' }
      const updatedOccasion = { id: 1, ...updates }
      mockRepository.update.mockResolvedValue(updatedOccasion)

      const result = await OccasionService.updateOccasion(1, updates)

      expect(result).toEqual(updatedOccasion)
      expect(mockRepository.update).toHaveBeenCalledWith(1, updates)
    })

    it('should throw BadRequestError when no updates provided', async () => {
      await expect(OccasionService.updateOccasion(1, {})).rejects.toThrow('No updates provided')
    })

    it('should throw BadRequestError when no valid fields to update', async () => {
      await expect(OccasionService.updateOccasion(1, { invalidField: 'value' })).rejects.toThrow('No valid fields to update')
    })

    it('should throw NotFoundError when update fails (returns null)', async () => {
      mockRepository.update.mockResolvedValue(null)
      await expect(OccasionService.updateOccasion(1, { name: 'Test' })).rejects.toThrow('Occasion with ID 1 not found')
    })
  })

  describe('deleteOccasion', () => {
    it('should delete occasion', async () => {
      const deletedOccasion = { id: 1, active: false }
      mockRepository.update.mockResolvedValue(deletedOccasion)

      const result = await OccasionService.deleteOccasion(1)

      expect(result).toEqual(deletedOccasion)
      expect(mockRepository.update).toHaveBeenCalledWith(1, { active: false })
    })

    it('should throw NotFoundError when delete fails', async () => {
      mockRepository.update.mockResolvedValue(null)
      await expect(OccasionService.deleteOccasion(1)).rejects.toThrow('Occasion with ID 1 not found')
    })
  })

  describe('reactivateOccasion', () => {
    it('should reactivate occasion', async () => {
      const reactivatedOccasion = { id: 1, active: true }
      mockRepository.update.mockResolvedValue(reactivatedOccasion)

      const result = await OccasionService.reactivateOccasion(1)

      expect(result).toEqual(reactivatedOccasion)
      expect(mockRepository.update).toHaveBeenCalledWith(1, { active: true })
    })

    it('should throw NotFoundError when reactivate fails', async () => {
      mockRepository.update.mockResolvedValue(null)
      await expect(OccasionService.reactivateOccasion(1)).rejects.toThrow('Occasion with ID 1 not found')
    })
  })

  describe('updateDisplayOrder', () => {
    it('should update display order', async () => {
      const updatedOccasion = { id: 1, display_order: 5 }
      mockRepository.update.mockResolvedValue(updatedOccasion)

      const result = await OccasionService.updateDisplayOrder(1, 5)

      expect(result).toEqual(updatedOccasion)
      expect(mockRepository.update).toHaveBeenCalledWith(1, { display_order: 5 })
    })

    it('should throw BadRequestError when order is invalid', async () => {
      await expect(OccasionService.updateDisplayOrder(1, -1)).rejects.toThrow('Invalid display_order')
    })
  })
})
