/**
 * Tests for Settings Service (Monolithic)
 * Coverage for: create, read, update, delete operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as SettingsService from '../../api/services/settingsService.js'

// Mock Repository using vi.hoisted
const mocks = vi.hoisted(() => ({
  findAll: vi.fn(),
  findByKey: vi.fn(),
  findByKeys: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  reactivate: vi.fn()
}))

vi.mock('../../api/repositories/settingsRepository.js', () => mocks)

// Mock validation
vi.mock('../../api/utils/validation.js', () => ({
  validateSetting: vi.fn()
}))

describe('Settings Service (Monolithic)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllSettings', () => {
    it('should return all settings', async () => {
      const settings = [{ key: 'test', value: '1' }]
      mocks.findAll.mockResolvedValue(settings)

      const result = await SettingsService.getAllSettings()

      expect(result).toEqual(settings)
      expect(mocks.findAll).toHaveBeenCalledWith({ publicOnly: false, includeDeactivated: false })
    })

    it('should filter public settings', async () => {
      const settings = [{ key: 'test', value: '1', is_public: true }]
      mocks.findAll.mockResolvedValue(settings)

      await SettingsService.getAllSettings(true)

      expect(mocks.findAll).toHaveBeenCalledWith({ publicOnly: true, includeDeactivated: false })
    })
  })

  describe('getSettingByKey', () => {
    it('should return setting by key', async () => {
      const setting = { key: 'test', value: '1' }
      mocks.findByKey.mockResolvedValue(setting)

      const result = await SettingsService.getSettingByKey('test')

      expect(result).toEqual(setting)
      expect(mocks.findByKey).toHaveBeenCalledWith('test')
    })

    it('should throw NotFoundError when not found', async () => {
      mocks.findByKey.mockResolvedValue(null)

      await expect(SettingsService.getSettingByKey('test')).rejects.toThrow(
        'Setting with ID test not found'
      )
    })
  })

  describe('getSettingValue', () => {
    it('should return parsed number value', async () => {
      const setting = { key: 'cost', value: '10.5', type: 'number' }
      mocks.findByKey.mockResolvedValue(setting)

      const result = await SettingsService.getSettingValue('cost')

      expect(result).toBe(10.5)
    })

    it('should return parsed boolean value', async () => {
      const setting = { key: 'active', value: 'true', type: 'boolean' }
      mocks.findByKey.mockResolvedValue(setting)

      const result = await SettingsService.getSettingValue('active')

      expect(result).toBe(true)
    })

    it('should return parsed json value', async () => {
      const setting = { key: 'config', value: '{"a":1}', type: 'json' }
      mocks.findByKey.mockResolvedValue(setting)

      const result = await SettingsService.getSettingValue('config')

      expect(result).toEqual({ a: 1 })
    })
  })

  describe('createSetting', () => {
    it('should create setting', async () => {
      const settingData = { key: 'new', value: 'val' }
      const createdSetting = { ...settingData }
      mocks.create.mockResolvedValue(createdSetting)

      const result = await SettingsService.createSetting(settingData)

      expect(result).toEqual(createdSetting)
      expect(mocks.create).toHaveBeenCalled()
    })
  })

  describe('updateSetting', () => {
    it('should update setting', async () => {
      const updates = { value: 'newVal' }
      const updatedSetting = { key: 'test', value: 'newVal' }
      mocks.update.mockResolvedValue(updatedSetting)

      const result = await SettingsService.updateSetting('test', updates)

      expect(result).toEqual(updatedSetting)
      expect(mocks.update).toHaveBeenCalledWith('test', expect.objectContaining(updates))
    })
  })

  describe('deleteSetting', () => {
    it('should soft delete setting', async () => {
      const deletedSetting = { key: 'test', active: false }
      mocks.softDelete.mockResolvedValue(deletedSetting)

      const result = await SettingsService.deleteSetting('test')

      expect(result).toEqual(deletedSetting)
      expect(mocks.softDelete).toHaveBeenCalledWith('test')
    })
  })

  describe('getSettingsMap', () => {
    it('should return map of settings', async () => {
      const settings = [
        { key: 's1', value: '1', type: 'number' },
        { key: 's2', value: 'true', type: 'boolean' }
      ]
      mocks.findAll.mockResolvedValue(settings)

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
      mocks.update.mockResolvedValue(updatedSetting)

      const result = await SettingsService.setSettingValue('test', 123)

      expect(result).toEqual(updatedSetting)
      expect(mocks.update).toHaveBeenCalledWith('test', { value: '123' })
    })
  })

  describe('reactivateSetting', () => {
    it('should reactivate setting', async () => {
      const reactivatedSetting = { key: 'test', active: true }
      mocks.reactivate.mockResolvedValue(reactivatedSetting)

      const result = await SettingsService.reactivateSetting('test')

      expect(result).toEqual(reactivatedSetting)
      expect(mocks.reactivate).toHaveBeenCalledWith('test')
    })
  })

  describe('getSettingsByKeys', () => {
    it('should return settings by keys', async () => {
      const settings = [{ key: 's1' }, { key: 's2' }]
      mocks.findByKeys.mockResolvedValue(settings)

      const result = await SettingsService.getSettingsByKeys(['s1', 's2'])

      expect(result).toEqual(settings)
      expect(mocks.findByKeys).toHaveBeenCalledWith(['s1', 's2'])
    })

    it('should throw BadRequestError for invalid keys', async () => {
      await expect(SettingsService.getSettingsByKeys([])).rejects.toThrow('Invalid keys')
    })
  })
})
