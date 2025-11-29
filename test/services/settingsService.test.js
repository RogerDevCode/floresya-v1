/**
 * Tests for Settings Service (Monolithic)
 * Coverage for: create, read, update, delete operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as SettingsService from '../../api/services/settingsService.js'

// Mock Supabase Client
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()
const mockSingle = vi.fn()
const mockIn = vi.fn()

const mockQueryBuilder = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  eq: mockEq,
  order: mockOrder,
  limit: mockLimit,
  single: mockSingle,
  in: mockIn
}

// Chainable methods return the query builder
mockSelect.mockReturnValue(mockQueryBuilder)
mockInsert.mockReturnValue(mockQueryBuilder)
mockUpdate.mockReturnValue(mockQueryBuilder)
mockDelete.mockReturnValue(mockQueryBuilder)
mockEq.mockReturnValue(mockQueryBuilder)
mockOrder.mockReturnValue(mockQueryBuilder)
mockLimit.mockReturnValue(mockQueryBuilder)
mockIn.mockReturnValue(mockQueryBuilder)

vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => mockQueryBuilder)
  },
  DB_SCHEMA: {
    settings: {
      table: 'settings'
    }
  }
}))

// Mock validation
vi.mock('../../api/utils/validation.js', () => ({
  validateSetting: vi.fn()
}))

describe('Settings Service (Monolithic)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset default return values
    mockSelect.mockReturnValue(mockQueryBuilder)
    mockInsert.mockReturnValue(mockQueryBuilder)
    mockUpdate.mockReturnValue(mockQueryBuilder)
    mockEq.mockReturnValue(mockQueryBuilder)
    mockOrder.mockReturnValue(mockQueryBuilder)
    mockLimit.mockReturnValue(mockQueryBuilder)
    mockIn.mockReturnValue(mockQueryBuilder)
  })

  describe('getAllSettings', () => {
    it('should return all settings', async () => {
      const settings = [{ key: 'test', value: '1' }]
      mockQueryBuilder.then = vi.fn((resolve) => resolve({ data: settings, error: null }))

      const result = await SettingsService.getAllSettings()

      expect(result).toEqual(settings)
      expect(mockEq).toHaveBeenCalledWith('active', true)
    })

    it('should filter public settings', async () => {
      const settings = [{ key: 'test', value: '1', is_public: true }]
      mockQueryBuilder.then = vi.fn((resolve) => resolve({ data: settings, error: null }))

      await SettingsService.getAllSettings(true)

      expect(mockEq).toHaveBeenCalledWith('is_public', true)
    })
  })

  describe('getSettingByKey', () => {
    it('should return setting by key', async () => {
      const setting = { key: 'test', value: '1' }
      mockSingle.mockResolvedValue({ data: setting, error: null })

      const result = await SettingsService.getSettingByKey('test')

      expect(result).toEqual(setting)
      expect(mockEq).toHaveBeenCalledWith('key', 'test')
    })

    it('should throw NotFoundError when not found', async () => {
      mockSingle.mockResolvedValue({ data: null, error: null })

      await expect(SettingsService.getSettingByKey('test')).rejects.toThrow('Setting with ID test not found')
    })
  })

  describe('getSettingValue', () => {
    it('should return parsed number value', async () => {
      const setting = { key: 'cost', value: '10.5', type: 'number' }
      mockSingle.mockResolvedValue({ data: setting, error: null })

      const result = await SettingsService.getSettingValue('cost')

      expect(result).toBe(10.5)
    })

    it('should return parsed boolean value', async () => {
      const setting = { key: 'active', value: 'true', type: 'boolean' }
      mockSingle.mockResolvedValue({ data: setting, error: null })

      const result = await SettingsService.getSettingValue('active')

      expect(result).toBe(true)
    })

    it('should return parsed json value', async () => {
      const setting = { key: 'config', value: '{"a":1}', type: 'json' }
      mockSingle.mockResolvedValue({ data: setting, error: null })

      const result = await SettingsService.getSettingValue('config')

      expect(result).toEqual({ a: 1 })
    })
  })

  describe('createSetting', () => {
    it('should create setting', async () => {
      const settingData = { key: 'new', value: 'val' }
      const createdSetting = { ...settingData }
      mockSingle.mockResolvedValue({ data: createdSetting, error: null })

      const result = await SettingsService.createSetting(settingData)

      expect(result).toEqual(createdSetting)
      expect(mockInsert).toHaveBeenCalled()
    })

    it('should throw DatabaseConstraintError on duplicate', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { code: '23505' } })

      await expect(SettingsService.createSetting({ key: 'dup', value: 'v' })).rejects.toThrow('Database constraint violation')
    })
  })

  describe('updateSetting', () => {
    it('should update setting', async () => {
      const updates = { value: 'newVal' }
      const updatedSetting = { key: 'test', value: 'newVal' }
      mockSingle.mockResolvedValue({ data: updatedSetting, error: null })

      const result = await SettingsService.updateSetting('test', updates)

      expect(result).toEqual(updatedSetting)
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining(updates))
    })
  })

  describe('deleteSetting', () => {
    it('should soft delete setting', async () => {
      const deletedSetting = { key: 'test', active: false }
      mockSingle.mockResolvedValue({ data: deletedSetting, error: null })

      const result = await SettingsService.deleteSetting('test')

      expect(result).toEqual(deletedSetting)
      expect(mockUpdate).toHaveBeenCalledWith({ active: false })
    })
  })

  describe('getSettingsMap', () => {
    it('should return map of settings', async () => {
      const settings = [
        { key: 's1', value: '1', type: 'number' },
        { key: 's2', value: 'true', type: 'boolean' }
      ]
      mockQueryBuilder.then = vi.fn((resolve) => resolve({ data: settings, error: null }))

      const result = await SettingsService.getSettingsMap()

      expect(result).toEqual({
        s1: 1,
        s2: true
      })
    })
  })

  describe('setSettingValue', () => {
    it('should update setting value', async () => {
      const updatedSetting = { key: 'test', value: '123' }
      mockSingle.mockResolvedValue({ data: updatedSetting, error: null })

      const result = await SettingsService.setSettingValue('test', 123)

      expect(result).toEqual(updatedSetting)
      expect(mockUpdate).toHaveBeenCalledWith({ value: '123' })
    })
  })

  describe('reactivateSetting', () => {
    it('should reactivate setting', async () => {
      const reactivatedSetting = { key: 'test', active: true }
      mockSingle.mockResolvedValue({ data: reactivatedSetting, error: null })

      const result = await SettingsService.reactivateSetting('test')

      expect(result).toEqual(reactivatedSetting)
      expect(mockUpdate).toHaveBeenCalledWith({ active: true })
    })
  })

  describe('getSettingsByKeys', () => {
    it('should return settings by keys', async () => {
      const settings = [{ key: 's1' }, { key: 's2' }]
      mockQueryBuilder.then = vi.fn((resolve) => resolve({ data: settings, error: null }))

      const result = await SettingsService.getSettingsByKeys(['s1', 's2'])

      expect(result).toEqual(settings)
      expect(mockIn).toHaveBeenCalledWith('key', ['s1', 's2'])
    })

    it('should throw BadRequestError for invalid keys', async () => {
      await expect(SettingsService.getSettingsByKeys([])).rejects.toThrow('Invalid keys')
    })
  })
})
