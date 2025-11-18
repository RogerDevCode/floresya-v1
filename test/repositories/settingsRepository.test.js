/**
 * Settings Repository Tests - Vitest Edition
 * Comprehensive testing of settings repository operations
 * Following KISS principle and Supabase best practices
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks, createMockSupabase, testData, mockErrors } from './setup.js'
import { SettingsRepository } from '../../api/repositories/SettingsRepository.js'

// Mock Supabase client
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: createMockSupabase(),
  DB_SCHEMA: {
    settings: { table: 'settings' }
  }
}))

describe('Settings Repository - Settings-specific Operations', () => {
  let mockSupabase
  let repository

  beforeEach(async () => {
    resetAllMocks()

    mockSupabase = createMockSupabase()

    // Mock the supabase import
    const supabaseModule = await import('../../api/services/supabaseClient.js')
    supabaseModule.supabase = mockSupabase

    repository = new SettingsRepository(mockSupabase)
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('findByKey - Find setting by key', () => {
    test('should return setting when found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: testData.settings.siteName, error: null })
          })
        })
      })

      const result = await repository.findByKey('site_name')

      expect(result).toEqual(testData.settings.siteName)
    })

    test('should return null when key not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: mockErrors.notFound })
          })
        })
      })

      const result = await repository.findByKey('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('findAllPublic - Find all public settings', () => {
    test('should return all public settings ordered by key', async () => {
      const mockPublicSettings = [testData.settings.siteName, testData.settings.contactEmail]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockPublicSettings, error: null })
          })
        })
      })

      const result = await repository.findAllPublic()

      expect(result).toEqual(mockPublicSettings)
    })
  })

  describe('getSettingsMap - Get settings as key-value map', () => {
    test('should return settings map for public settings only', async () => {
      const mockSettings = [
        { key: 'site_name', value: 'FloresYa', type: 'string', description: 'Site name' },
        {
          key: 'contact_email',
          value: 'contact@floresya.com',
          type: 'string',
          description: 'Contact email'
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockSettings, error: null })
          })
        })
      })

      const result = await repository.getSettingsMap(true)

      expect(result.site_name.value).toBe('FloresYa')
      expect(result.contact_email.value).toBe('contact@floresya.com')
    })

    test('should return settings map for all settings when onlyPublic is false', async () => {
      const mockSettings = [
        { key: 'site_name', value: 'FloresYa', type: 'string', description: 'Site name' },
        { key: 'private_key', value: 'secret', type: 'string', description: 'Private setting' }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockSettings, error: null })
        })
      })

      const result = await repository.getSettingsMap(false)

      expect(result.site_name.value).toBe('FloresYa')
      expect(result.private_key.value).toBe('secret')
    })
  })

  describe('updateByKey - Update setting by key', () => {
    test('should update setting successfully', async () => {
      const updates = { value: 'New Site Name', description: 'Updated description' }
      const updatedSetting = { ...testData.settings.siteName, ...updates }

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedSetting, error: null })
            })
          })
        })
      })

      const result = await repository.updateByKey('site_name', updates)

      expect(result).toEqual(updatedSetting)
    })
  })

  describe('findAllWithFilters - Find settings with filters', () => {
    test('should return settings with key filter', async () => {
      const filters = { key: 'site' }
      const mockSettings = [testData.settings.siteName]

      // Create a chainable query mock
      const chainableQuery = {
        ilike: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockSettings, error: null }),
        then: vi.fn().mockImplementation(resolve => resolve({ data: mockSettings, error: null }))
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainableQuery)
      })

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockSettings)
    })

    test('should apply type filter', async () => {
      const filters = { type: 'string' }
      const mockSettings = [testData.settings.siteName]

      // Create a chainable query mock
      const chainableQuery = {
        ilike: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockSettings, error: null }),
        then: vi.fn().mockImplementation(resolve => resolve({ data: mockSettings, error: null }))
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainableQuery)
      })

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockSettings)
    })

    test('should apply public filter', async () => {
      const filters = { is_public: true }
      const mockSettings = [testData.settings.siteName]

      // Create a chainable query mock
      const chainableQuery = {
        ilike: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockSettings, error: null }),
        then: vi.fn().mockImplementation(resolve => resolve({ data: mockSettings, error: null }))
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainableQuery)
      })

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockSettings)
    })

    test('should apply multiple filters', async () => {
      const filters = { type: 'string', is_public: true }
      const mockSettings = [testData.settings.siteName]

      // Create a chainable query mock
      const chainableQuery = {
        ilike: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockSettings, error: null }),
        then: vi.fn().mockImplementation(resolve => resolve({ data: mockSettings, error: null }))
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(chainableQuery)
      })

      const result = await repository.findAllWithFilters(filters)

      expect(result).toEqual(mockSettings)
    })
  })
})
