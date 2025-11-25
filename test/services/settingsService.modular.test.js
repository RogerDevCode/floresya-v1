/**
 * Tests for Settings Service Modular Operations
 * Coverage for: create, read, update, delete operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as CreateOps from '../../api/services/settingsService.create.js'
import * as ReadOps from '../../api/services/settingsService.read.js'
import * as UpdateOps from '../../api/services/settingsService.update.js'
import * as DeleteOps from '../../api/services/settingsService.delete.js'
import * as Helpers from '../../api/services/settingsService.helpers.js'

vi.mock('../../api/services/settingsService.helpers.js', () => ({
  getSettingsRepository: vi.fn(),
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
    }
  }
}))

describe('Settings Service - Create Operations', () => {
  let mockRepository

  beforeEach(() => {
    mockRepository = { create: vi.fn() }
    vi.mocked(Helpers.getSettingsRepository).mockReturnValue(mockRepository)
  })

  it('should create setting with all fields', async () => {
    const settingData = {
      key: 'site_title',
      value: 'FloresYa',
      description: 'Site title',
      category: 'general',
      is_public: true,
      data_type: 'string',
      validation_rules: null
    }
    mockRepository.create.mockResolvedValue({ id: 1, ...settingData })

    const result = await CreateOps.createSetting(settingData)

    expect(result).toHaveProperty('key', 'site_title')
    expect(mockRepository.create).toHaveBeenCalledWith(settingData)
  })

  it('should create setting with minimal data', async () => {
    const settingData = { key: 'test_key', value: 'test_value' }
    mockRepository.create.mockResolvedValue({ id: 1, ...settingData })

    await CreateOps.createSetting(settingData)

    expect(mockRepository.create).toHaveBeenCalledWith({
      key: 'test_key',
      value: 'test_value',
      description: null,
      category: 'general',
      is_public: false,
      data_type: 'string',
      validation_rules: null
    })
  })

  it('should throw ValidationError when key is missing', async () => {
    await expect(CreateOps.createSetting({ value: 'test' })).rejects.toThrow('Setting key is required')
  })

  it('should throw ValidationError when value is missing', async () => {
    await expect(CreateOps.createSetting({ key: 'test' })).rejects.toThrow('Setting value is required')
  })

  it('should throw ValidationError when key is not string', async () => {
    await expect(CreateOps.createSetting({ key: 123, value: 'test' })).rejects.toThrow('must be a string')
  })
})

describe('Settings Service - Read Operations', () => {
  let mockRepository

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      findPublic: vi.fn(),
      findByKey: vi.fn(),
      findByKeys: vi.fn()
    }
    vi.mocked(Helpers.getSettingsRepository).mockReturnValue(mockRepository)
  })

  describe('getAllSettings', () => {
    it('should return all settings', async () => {
      const settings = [{ key: 'k1', value: 'v1' }, { key: 'k2', value: 'v2' }]
      mockRepository.findAll.mockResolvedValue(settings)

      const result = await ReadOps.getAllSettings()

      expect(result).toEqual(settings)
      expect(mockRepository.findAll).toHaveBeenCalledWith({ publicOnly: false, includeDeactivated: false })
    })

    it('should return public settings only', async () => {
      const settings = [{ key: 'k1', value: 'v1', is_public: true }]
      mockRepository.findAll.mockResolvedValue(settings)

      await ReadOps.getAllSettings(true)

      expect(mockRepository.findAll).toHaveBeenCalledWith({ publicOnly: true, includeDeactivated: false })
    })

    it('should return empty array when null', async () => {
      mockRepository.findAll.mockResolvedValue(null)

      const result = await ReadOps.getAllSettings()

      expect(result).toEqual([])
    })
  })

  describe('getPublicSettings', () => {
    it('should return public settings', async () => {
      const settings = [{ key: 'k1', value: 'v1', is_public: true }]
      mockRepository.findPublic.mockResolvedValue(settings)

      const result = await ReadOps.getPublicSettings()

      expect(result).toEqual(settings)
    })
  })

  describe('getSettingById', () => {
    it('should return setting by key', async () => {
      const setting = { key: 'test', value: 'value' }
      mockRepository.findByKey.mockResolvedValue(setting)

      const result = await ReadOps.getSettingById('test')

      expect(result).toEqual(setting)
    })

    it('should throw BadRequestError when key is invalid', async () => {
      await expect(ReadOps.getSettingById(123)).rejects.toThrow('must be a string')
    })

    it('should throw NotFoundError when not found', async () => {
      mockRepository.findByKey.mockResolvedValue(null)

      await expect(ReadOps.getSettingById('nonexistent')).rejects.toThrow('not found')
    })
  })

  describe('getSettingValue', () => {
    it('should return setting value', async () => {
      const setting = { key: 'test', value: 'myvalue' }
      mockRepository.findByKey.mockResolvedValue(setting)

      const result = await ReadOps.getSettingValue('test')

      expect(result).toBe('myvalue')
    })

    it('should return null when setting has no value', async () => {
      mockRepository.findByKey.mockResolvedValue({ key: 'test', value: null })

      const result = await ReadOps.getSettingValue('test')

      expect(result).toBe(null)
    })
  })

  describe('getSettingsByKeys', () => {
    it('should return multiple settings', async () => {
      const settings = [{ key: 'k1', value: 'v1' }, { key: 'k2', value: 'v2' }]
      mockRepository.findByKeys.mockResolvedValue(settings)

      const result = await ReadOps.getSettingsByKeys(['k1', 'k2'])

      expect(result).toEqual(settings)
    })

    it('should throw BadRequestError when keys is not array', async () => {
      await expect(ReadOps.getSettingsByKeys('invalid')).rejects.toThrow('must be a non-empty array')
    })

    it('should throw BadRequestError when keys is empty', async () => {
      await expect(ReadOps.getSettingsByKeys([])).rejects.toThrow('must be a non-empty array')
    })
  })
})

describe('Settings Service - Update Operations', () => {
  let mockRepository

  beforeEach(() => {
    mockRepository = { updateByKey: vi.fn() }
    vi.mocked(Helpers.getSettingsRepository).mockReturnValue(mockRepository)
  })

  describe('updateSetting', () => {
    it('should update setting', async () => {
      const updates = { value: 'new_value', description: 'Updated' }
      mockRepository.updateByKey.mockResolvedValue({ key: 'test', ...updates })

      const result = await UpdateOps.updateSetting('test', updates)

      expect(result.value).toBe('new_value')
      expect(mockRepository.updateByKey).toHaveBeenCalledWith('test', updates)
    })

    it('should throw BadRequestError when key is invalid', async () => {
      await expect(UpdateOps.updateSetting(null, { value: 'test' })).rejects.toThrow('must be a string')
    })

    it('should throw BadRequestError when no updates', async () => {
      await expect(UpdateOps.updateSetting('test', {})).rejects.toThrow('No updates provided')
    })

    it('should throw ValidationError when value is not string', async () => {
      await expect(UpdateOps.updateSetting('test', { value: 123 })).rejects.toThrow('must be a string')
    })
  })

  describe('setSettingValue', () => {
    it('should set setting value', async () => {
      mockRepository.updateByKey.mockResolvedValue({ key: 'test', value: 'newval' })

      const result = await UpdateOps.setSettingValue('test', 'newval')

      expect(result.value).toBe('newval')
    })

    it('should convert value to string', async () => {
      mockRepository.updateByKey.mockResolvedValue({ key: 'test', value: '123' })

      await UpdateOps.setSettingValue('test', 123)

      expect(mockRepository.updateByKey).toHaveBeenCalledWith('test', { value: '123' })
    })

    it('should throw BadRequestError when value is undefined', async () => {
      await expect(UpdateOps.setSettingValue('test', undefined)).rejects.toThrow('Value is required')
    })

    it('should throw BadRequestError when value is null', async () => {
      await expect(UpdateOps.setSettingValue('test', null)).rejects.toThrow('Value is required')
    })
  })
})

describe('Settings Service - Delete Operations', () => {
  let mockRepository

  beforeEach(() => {
    mockRepository = {
      deleteByKey: vi.fn(),
      reactivateByKey: vi.fn()
    }
    vi.mocked(Helpers.getSettingsRepository).mockReturnValue(mockRepository)
  })

  describe('deleteSetting', () => {
    it('should delete setting', async () => {
      mockRepository.deleteByKey.mockResolvedValue({ key: 'test', active: false })

      const result = await DeleteOps.deleteSetting('test')

      expect(result.active).toBe(false)
    })

    it('should throw BadRequestError when key is invalid', async () => {
      await expect(DeleteOps.deleteSetting(null)).rejects.toThrow('must be a string')
    })
  })

  describe('reactivateSetting', () => {
    it('should reactivate setting', async () => {
      mockRepository.reactivateByKey.mockResolvedValue({ key: 'test', active: true })

      const result = await DeleteOps.reactivateSetting('test')

      expect(result.active).toBe(true)
    })

    it('should throw BadRequestError when key is invalid', async () => {
      await expect(DeleteOps.reactivateSetting(null)).rejects.toThrow('must be a string')
    })
  })
})
