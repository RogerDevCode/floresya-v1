/**
 * Occasion Repository Tests - Vitest Edition
 * Comprehensive testing of occasion repository operations
 * Following KISS principle and Supabase best practices
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks, createMockSupabase, testData, mockErrors } from './setup.js'
import { OccasionRepository } from '../../api/repositories/OccasionRepository.js'

// Mock Supabase client
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: createMockSupabase(),
  DB_SCHEMA: {
    occasions: { table: 'occasions' }
  }
}))

describe('Occasion Repository - Occasion-specific Operations', () => {
  let mockSupabase
  let repository

  beforeEach(async () => {
    resetAllMocks()

    mockSupabase = createMockSupabase()

    // Mock the supabase import
    const supabaseModule = await import('../../api/services/supabaseClient.js')
    supabaseModule.supabase = mockSupabase

    repository = new OccasionRepository(mockSupabase)
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('findBySlug - Find occasion by slug', () => {
    test('should return occasion when found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: testData.occasions.birthday, error: null })
            })
          })
        })
      })

      const result = await repository.findBySlug('birthday')

      expect(result).toEqual(testData.occasions.birthday)
    })

    test('should return null when slug not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notFound })
            })
          })
        })
      })

      const result = await repository.findBySlug('nonexistent')

      expect(result).toBeNull()
    })

    test('should include inactive occasions when requested', async () => {
      const inactiveOccasion = { ...testData.occasions.birthday, active: false }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: inactiveOccasion, error: null })
          })
        })
      })

      const result = await repository.findBySlug('birthday', true)

      expect(result).toEqual(inactiveOccasion)
    })
  })

  describe('findAllWithFilters - Find occasions with filters', () => {
    test('should return occasions with search filter', async () => {
      const filters = { search: 'birthday' }
      const mockOccasions = [testData.occasions.birthday]

      // Create a chainable query mock
      const chainableQuery = {
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockOccasions, error: null }),
        then: vi.fn().mockImplementation(resolve => resolve({ data: mockOccasions, error: null }))
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainableQuery)
      })

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockOccasions)
    })

    test('should include deactivated occasions when specified', async () => {
      const filters = { includeDeactivated: true }
      const mockOccasions = [
        testData.occasions.birthday,
        { ...testData.occasions.anniversary, active: false }
      ]

      // Create a chainable query mock
      const chainableQuery = {
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockOccasions, error: null }),
        then: vi.fn().mockImplementation(resolve => resolve({ data: mockOccasions, error: null }))
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainableQuery)
      })

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockOccasions)
    })

    test('should apply custom ordering', async () => {
      const options = { orderBy: 'name', ascending: false }
      const mockOccasions = [testData.occasions.anniversary, testData.occasions.birthday]

      // Create a chainable query mock
      const chainableQuery = {
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockOccasions, error: null }),
        then: vi.fn().mockImplementation(resolve => resolve({ data: mockOccasions, error: null }))
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainableQuery)
      })

      const result = await repository.findAllWithFilters({}, options)

      expect(result).toEqual(mockOccasions)
    })

    test('should apply pagination', async () => {
      const options = { limit: 10, offset: 5 }
      const mockOccasions = [testData.occasions.birthday]

      // Create a chainable query mock
      const chainableQuery = {
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockOccasions, error: null }),
        then: vi.fn().mockImplementation(resolve => resolve({ data: mockOccasions, error: null }))
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainableQuery)
      })

      const result = await repository.findAllWithFilters({}, options)

      expect(result).toEqual(mockOccasions)
    })
  })

  describe('findAllForDisplay - Find occasions for display', () => {
    test('should return active occasions ordered by display_order', async () => {
      const mockOccasions = [testData.occasions.birthday, testData.occasions.anniversary]

      // Create a chainable query mock
      const chainableQuery = {
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockOccasions, error: null }),
        then: vi.fn().mockImplementation(resolve => resolve({ data: mockOccasions, error: null }))
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainableQuery)
      })

      const result = await repository.findAllForDisplay()

      expect(result).toEqual(mockOccasions)
    })

    test('should include inactive occasions when requested', async () => {
      const mockOccasions = [
        testData.occasions.birthday,
        { ...testData.occasions.anniversary, active: false }
      ]

      // Create a chainable query mock
      const chainableQuery = {
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockOccasions, error: null }),
        then: vi.fn().mockImplementation(resolve => resolve({ data: mockOccasions, error: null }))
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainableQuery)
      })

      const result = await repository.findAllForDisplay(true)

      expect(result).toEqual(mockOccasions)
    })
  })
})
