/**
 * Occasion Service Unit Tests
 * Testing all functions in occasionService.js with proper mocking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as occasionService from '../../api/services/occasionService.js'
import { supabase } from '../../api/services/supabaseClient.js'

// Mock the Supabase client to avoid actual database calls
vi.mock('../../api/services/supabaseClient.js', async () => {
  const actual = await vi.importActual('../../api/services/supabaseClient.js')
  return {
    ...actual,
    supabase: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      match: vi.fn().mockReturnThis(),
      single: vi.fn(),
      rpc: vi.fn().mockReturnThis()
    }
  }
})

// Mock error classes
vi.mock('../../api/errors/AppError.js', async () => {
  const actual = await vi.importActual('../../api/errors/AppError.js')
  return {
    ...actual,
    ValidationError: class ValidationError extends Error {
      constructor(message, errors) {
        super(message)
        this.name = 'ValidationError'
        this.errors = errors
      }
    },
    NotFoundError: class NotFoundError extends Error {
      constructor(resource, id, context) {
        super(`${resource} not found with id: ${id}`)
        this.name = 'NotFoundError'
        this.resource = resource
        this.id = id
        this.context = context
      }
    },
    DatabaseError: class DatabaseError extends Error {
      constructor(operation, table, originalError, context) {
        super(`Database ${operation} failed on ${table}`)
        this.name = 'DatabaseError'
        this.operation = operation
        this.table = table
        this.originalError = originalError
        this.context = context
      }
    },
    DatabaseConstraintError: class DatabaseConstraintError extends Error {
      constructor(constraint, table, context) {
        super(`Database constraint ${constraint} violated on ${table}`)
        this.name = 'DatabaseConstraintError'
        this.constraint = constraint
        this.table = table
        this.context = context
      }
    },
    BadRequestError: class BadRequestError extends Error {
      constructor(message, context) {
        super(message)
        this.name = 'BadRequestError'
        this.context = context
      }
    }
  }
})

describe('Occasion Service Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllOccasions', () => {
    it('should return all active occasions ordered by display_order', async () => {
      // Arrange
      const mockOccasions = [
        { id: 1, name: 'Birthday', slug: 'birthday', display_order: 1, is_active: true },
        { id: 2, name: 'Anniversary', slug: 'anniversary', display_order: 2, is_active: true }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: vi.fn(resolve => resolve({ data: mockOccasions, error: null }))
      }

      vi.mocked(supabase.from).mockReturnValue(mockQuery)

      // Act
      const result = await occasionService.getAllOccasions()

      // Assert
      expect(result).toEqual(mockOccasions)
    })

    it('should include inactive occasions when includeInactive is true', async () => {
      // Arrange
      const mockOccasions = [
        { id: 1, name: 'Active Occasion', slug: 'active', is_active: true },
        { id: 2, name: 'Inactive Occasion', slug: 'inactive', is_active: false }
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(), // Define eq even if not called, for verification
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: vi.fn(resolve => resolve({ data: mockOccasions, error: null }))
      }

      vi.mocked(supabase.from).mockReturnValue(mockQuery)

      // Act
      const result = await occasionService.getAllOccasions({}, true)

      // Assert
      expect(result).toEqual(mockOccasions)
      // Verify that .eq('is_active', true) was NOT called
      expect(mockQuery.eq).not.toHaveBeenCalled()
    })

    it('should apply limit filter correctly', async () => {
      // Arrange
      const mockOccasions = [{ id: 1, name: 'Occasion 1', slug: 'occasion-1', is_active: true }]

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.order).mockReturnThis()
      vi.mocked(supabase.limit).mockReturnThis()
      vi.mocked(supabase).select().eq().order().limit.mockResolvedValue({
        data: mockOccasions,
        error: null
      })

      // Act
      const result = await occasionService.getAllOccasions({ limit: 10 })

      // Assert
      expect(result).toEqual(mockOccasions)
      expect(supabase.limit).toHaveBeenCalledWith(10)
    })
  })

  describe('getOccasionById', () => {
    it('should return an occasion by ID when it exists', async () => {
      // Arrange
      const mockOccasion = { id: 1, name: 'Birthday', slug: 'birthday', is_active: true }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: mockOccasion,
        error: null
      })

      // Act
      const result = await occasionService.getOccasionById(1)

      // Assert
      expect(result).toEqual(mockOccasion)
      expect(supabase.from).toHaveBeenCalledWith('occasions')
      expect(supabase.select).toHaveBeenCalledWith('*')
      expect(supabase.eq).toHaveBeenCalledWith('id', 1)
      expect(supabase.eq).toHaveBeenCalledWith('is_active', true)
    })

    it('should throw BadRequestError when ID is invalid', async () => {
      // Act & Assert
      await expect(occasionService.getOccasionById('invalid')).rejects.toThrow(
        'Invalid occasion ID: must be a number'
      )
      await expect(occasionService.getOccasionById(null)).rejects.toThrow(
        'Invalid occasion ID: must be a number'
      )
      await expect(occasionService.getOccasionById(0)).rejects.toThrow(
        'Invalid occasion ID: must be a number'
      )
    })

    it('should return inactive occasion when includeInactive is true', async () => {
      // Arrange
      const mockOccasion = { id: 1, name: 'Inactive Occasion', slug: 'inactive', is_active: false }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: mockOccasion,
        error: null
      })

      // Act
      const result = await occasionService.getOccasionById(1, true)

      // Assert
      expect(result).toEqual(mockOccasion)
      // Should not filter by is_active = true when includeInactive is true
      const callsToEq = vi.mocked(supabase.eq).mock.calls.map(call => call[0])
      expect(callsToEq).not.toContain('is_active')
    })
  })

  describe('getOccasionBySlug', () => {
    it('should return an occasion by slug when it exists', async () => {
      // Arrange
      const mockOccasion = { id: 1, name: 'Birthday', slug: 'birthday', is_active: true }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: mockOccasion,
        error: null
      })

      // Act
      const result = await occasionService.getOccasionBySlug('birthday')

      // Assert
      expect(result).toEqual(mockOccasion)
      expect(supabase.from).toHaveBeenCalledWith('occasions')
      expect(supabase.select).toHaveBeenCalledWith('*')
      expect(supabase.eq).toHaveBeenCalledWith('slug', 'birthday')
      expect(supabase.eq).toHaveBeenCalledWith('is_active', true)
    })

    it('should throw BadRequestError when slug is invalid', async () => {
      // Act & Assert
      await expect(occasionService.getOccasionBySlug('')).rejects.toThrow(
        'Invalid slug: must be a string'
      )
      await expect(occasionService.getOccasionBySlug(null)).rejects.toThrow(
        'Invalid slug: must be a string'
      )
      await expect(occasionService.getOccasionBySlug(123)).rejects.toThrow(
        'Invalid slug: must be a string'
      )
    })

    it('should return inactive occasion by slug when includeInactive is true', async () => {
      // Arrange
      const mockOccasion = { id: 1, name: 'Inactive Occasion', slug: 'inactive', is_active: false }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: mockOccasion,
        error: null
      })

      // Act
      const result = await occasionService.getOccasionBySlug('inactive', true)

      // Assert
      expect(result).toEqual(mockOccasion)
      // Should not filter by is_active = true when includeInactive is true
      const callsToEq = vi.mocked(supabase.eq).mock.calls.map(call => call[0])
      expect(callsToEq).not.toContain('is_active')
    })
  })

  describe('createOccasion', () => {
    it('should create an occasion with valid data', async () => {
      // Arrange
      const newOccasionData = {
        name: 'New Occasion',
        slug: 'new-occasion',
        display_order: 1
      }

      const createdOccasion = {
        id: 1,
        ...newOccasionData,
        description: null,
        is_active: true
      }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.insert).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: createdOccasion,
        error: null
      })

      // Act
      const result = await occasionService.createOccasion(newOccasionData)

      // Assert
      expect(result).toEqual(createdOccasion)
      expect(supabase.from).toHaveBeenCalledWith('occasions')
      expect(supabase.insert).toHaveBeenCalledWith({
        name: 'New Occasion',
        description: null,
        slug: 'new-occasion',
        display_order: 1,
        is_active: true
      })
      expect(supabase.select).toHaveBeenCalled()
      expect(supabase.single).toHaveBeenCalled()
    })

    it('should throw ValidationError for invalid occasion data', async () => {
      // Arrange
      const invalidOccasionData = {
        name: '', // Invalid: empty name
        slug: 'invalid slug with spaces' // Invalid: slug with spaces
      }

      // Act & Assert
      await expect(occasionService.createOccasion(invalidOccasionData)).rejects.toThrow(
        'Occasion validation failed'
      )
    })

    it('should throw DatabaseConstraintError for duplicate slug', async () => {
      // Arrange
      const occasionData = {
        name: 'Test Occasion',
        slug: 'duplicate-slug'
      }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.insert).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint' }
      })

      // Act & Assert
      await expect(occasionService.createOccasion(occasionData)).rejects.toThrow(
        'Database constraint unique_slug violated on'
      )
    })
  })

  describe('updateOccasion', () => {
    it('should update an occasion with valid changes', async () => {
      // Arrange
      const updatedOccasion = {
        id: 1,
        name: 'Updated Occasion',
        slug: 'updated-occasion',
        is_active: true
      }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.update).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: updatedOccasion,
        error: null
      })

      // Act
      const result = await occasionService.updateOccasion(1, {
        name: 'Updated Occasion',
        slug: 'updated-occasion'
      })

      // Assert
      expect(result).toEqual(updatedOccasion)
      expect(supabase.update).toHaveBeenCalledWith({
        name: 'Updated Occasion',
        slug: 'updated-occasion'
      })
      expect(supabase.eq).toHaveBeenCalledWith('id', 1)
      expect(supabase.eq).toHaveBeenCalledWith('is_active', true)
    })

    it('should throw ValidationError for invalid update data', async () => {
      // Act & Assert
      await expect(
        occasionService.updateOccasion(1, { slug: 'invalid slug with spaces' })
      ).rejects.toThrow('Occasion validation failed')
    })

    it('should throw BadRequestError for invalid occasion ID', async () => {
      // Act & Assert
      await expect(occasionService.updateOccasion('invalid', { name: 'New Name' })).rejects.toThrow(
        'Invalid occasion ID: must be a number'
      )
      await expect(occasionService.updateOccasion(0, { name: 'New Name' })).rejects.toThrow(
        'Invalid occasion ID: must be a number'
      )
    })

    it('should throw BadRequestError for empty updates', async () => {
      // Act & Assert
      await expect(occasionService.updateOccasion(1, {})).rejects.toThrow('No updates provided')
    })
  })

  describe('deleteOccasion', () => {
    it('should soft-delete an occasion by setting is_active to false', async () => {
      // Arrange
      const deactivatedOccasion = {
        id: 1,
        name: 'Deactivated Occasion',
        is_active: false
      }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.update).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: deactivatedOccasion,
        error: null
      })

      // Act
      const result = await occasionService.deleteOccasion(1)

      // Assert
      expect(result).toEqual(deactivatedOccasion)
      expect(supabase.update).toHaveBeenCalledWith({ is_active: false })
      expect(supabase.eq).toHaveBeenCalledWith('id', 1)
      expect(supabase.eq).toHaveBeenCalledWith('is_active', true) // Only active occasions can be deleted
    })

    it('should throw BadRequestError for invalid occasion ID', async () => {
      // Act & Assert
      await expect(occasionService.deleteOccasion('invalid')).rejects.toThrow(
        'Invalid occasion ID: must be a number'
      )
      await expect(occasionService.deleteOccasion(null)).rejects.toThrow(
        'Invalid occasion ID: must be a number'
      )
    })
  })

  describe('reactivateOccasion', () => {
    it('should reactivate an occasion by setting is_active to true', async () => {
      // Arrange
      const reactivatedOccasion = {
        id: 1,
        name: 'Reactivated Occasion',
        is_active: true
      }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.update).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: reactivatedOccasion,
        error: null
      })

      // Act
      const result = await occasionService.reactivateOccasion(1)

      // Assert
      expect(result).toEqual(reactivatedOccasion)
      expect(supabase.update).toHaveBeenCalledWith({ is_active: true })
      expect(supabase.eq).toHaveBeenCalledWith('id', 1)
      expect(supabase.eq).toHaveBeenCalledWith('is_active', false) // Only inactive occasions can be reactivated
    })

    it('should throw BadRequestError for invalid occasion ID', async () => {
      // Act & Assert
      await expect(occasionService.reactivateOccasion('invalid')).rejects.toThrow(
        'Invalid occasion ID: must be a number'
      )
      await expect(occasionService.reactivateOccasion(null)).rejects.toThrow(
        'Invalid occasion ID: must be a number'
      )
    })
  })

  describe('updateDisplayOrder', () => {
    it('should update display order successfully', async () => {
      // Arrange
      const updatedOccasion = {
        id: 1,
        name: 'Occasion',
        display_order: 5,
        is_active: true
      }

      vi.mocked(supabase.from).mockReturnThis()
      vi.mocked(supabase.update).mockReturnThis()
      vi.mocked(supabase.eq).mockReturnThis()
      vi.mocked(supabase.select).mockReturnThis()
      vi.mocked(supabase.single).mockResolvedValue({
        data: updatedOccasion,
        error: null
      })

      // Act
      const result = await occasionService.updateDisplayOrder(1, 5)

      // Assert
      expect(result).toEqual(updatedOccasion)
      expect(supabase.update).toHaveBeenCalledWith({ display_order: 5 })
      expect(supabase.eq).toHaveBeenCalledWith('id', 1)
      expect(supabase.eq).toHaveBeenCalledWith('is_active', true)
    })

    it('should throw error for invalid display order', async () => {
      // Act & Assert
      await expect(occasionService.updateDisplayOrder(1, -1)).rejects.toThrow(
        'Invalid display_order: must be a non-negative number'
      )
      await expect(occasionService.updateDisplayOrder(1, 'invalid')).rejects.toThrow(
        'Invalid display_order: must be a non-negative number'
      )
    })

    it('should throw error for invalid occasion ID', async () => {
      // Act & Assert
      await expect(occasionService.updateDisplayOrder('invalid', 2)).rejects.toThrow(
        'Invalid occasion ID: must be a number'
      )
      await expect(occasionService.updateDisplayOrder(null, 2)).rejects.toThrow(
        'Invalid occasion ID: must be a number'
      )
    })
  })
})
