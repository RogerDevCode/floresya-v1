/**
 * Settings Controller Unit Tests
 * Following CLAUDE.md test validation rules
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getAllSettings,
  getPublicSettings,
  getSettingsMap,
  getSettingByKey,
  createSetting,
  updateSetting,
  setSettingValue,
  deleteSetting,
  getSettingValue
} from '../settingsController.js'

// Mock dependencies
vi.mock('../../services/settingsService.js', () => ({
  getAllSettings: vi.fn(),
  getPublicSettings: vi.fn(),
  getSettingsMap: vi.fn(),
  getSettingByKey: vi.fn(),
  createSetting: vi.fn(),
  updateSetting: vi.fn(),
  setSettingValue: vi.fn(),
  deleteSetting: vi.fn(),
  getSettingValue: vi.fn()
}))

vi.mock('../../middleware/error/index.js', () => ({
  asyncHandler: vi.fn(fn => fn)
}))

import * as settingsService from '../../services/settingsService.js'

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

describe('Settings Controller - Unit Tests with DI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getAllSettings', () => {
    it('should get all settings successfully', async () => {
      const req = mockRequest()
      const res = mockResponse()
      const mockSettings = [
        { key: 'site_name', value: 'FloresYa', is_public: true },
        { key: 'admin_email', value: 'admin@example.com', is_public: false }
      ]

      settingsService.getAllSettings.mockResolvedValue(mockSettings)

      await getAllSettings(req, res)

      expect(settingsService.getAllSettings).toHaveBeenCalledWith(false, false)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSettings,
        message: 'Settings retrieved successfully'
      })
    })

    it('should get only public settings', async () => {
      const req = mockRequest({
        query: { public: 'true' }
      })
      const res = mockResponse()
      const mockSettings = [{ key: 'site_name', value: 'FloresYa', is_public: true }]

      settingsService.getAllSettings.mockResolvedValue(mockSettings)

      await getAllSettings(req, res)

      expect(settingsService.getAllSettings).toHaveBeenCalledWith(true, false)
    })

    it('should handle admin includeDeactivated', async () => {
      const req = mockRequest({
        user: { role: 'admin' }
      })
      const res = mockResponse()
      const mockSettings = []

      settingsService.getAllSettings.mockResolvedValue(mockSettings)

      await getAllSettings(req, res)

      expect(settingsService.getAllSettings).toHaveBeenCalledWith(false, true)
    })
  })

  describe('getPublicSettings', () => {
    it('should get public settings successfully', async () => {
      const req = mockRequest()
      const res = mockResponse()
      const mockSettings = [
        { key: 'site_name', value: 'FloresYa', is_public: true },
        { key: 'currency', value: 'USD', is_public: true }
      ]

      settingsService.getPublicSettings.mockResolvedValue(mockSettings)

      await getPublicSettings(req, res)

      expect(settingsService.getPublicSettings).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSettings,
        message: 'Public settings retrieved successfully'
      })
    })
  })

  describe('getSettingsMap', () => {
    it('should get settings map successfully', async () => {
      const req = mockRequest()
      const res = mockResponse()
      const mockMap = {
        site_name: 'FloresYa',
        currency: 'USD'
      }

      settingsService.getSettingsMap.mockResolvedValue(mockMap)

      await getSettingsMap(req, res)

      expect(settingsService.getSettingsMap).toHaveBeenCalledWith(false, false)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMap,
        message: 'Settings map retrieved successfully'
      })
    })

    it('should get public settings map', async () => {
      const req = mockRequest({
        query: { public: 'true' }
      })
      const res = mockResponse()
      const mockMap = { site_name: 'FloresYa' }

      settingsService.getSettingsMap.mockResolvedValue(mockMap)

      await getSettingsMap(req, res)

      expect(settingsService.getSettingsMap).toHaveBeenCalledWith(true, false)
    })
  })

  describe('getSettingByKey', () => {
    it('should get setting by key successfully', async () => {
      const req = mockRequest({
        params: { key: 'site_name' }
      })
      const res = mockResponse()
      const mockSetting = { key: 'site_name', value: 'FloresYa', is_public: true }

      settingsService.getSettingByKey.mockResolvedValue(mockSetting)

      await getSettingByKey(req, res)

      expect(settingsService.getSettingByKey).toHaveBeenCalledWith('site_name')
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSetting,
        message: 'Setting retrieved successfully'
      })
    })
  })

  describe('createSetting', () => {
    it('should create setting successfully', async () => {
      const req = mockRequest({
        body: {
          key: 'new_setting',
          value: 'test_value',
          is_public: true
        }
      })
      const res = mockResponse()
      const mockSetting = { ...req.body }

      settingsService.createSetting.mockResolvedValue(mockSetting)

      await createSetting(req, res)

      expect(settingsService.createSetting).toHaveBeenCalledWith(req.body)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSetting,
        message: 'Setting created successfully'
      })
    })
  })

  describe('updateSetting', () => {
    it('should update setting successfully', async () => {
      const req = mockRequest({
        params: { key: 'site_name' },
        body: { value: 'New Name', is_public: true }
      })
      const res = mockResponse()
      const mockSetting = { key: 'site_name', ...req.body }

      settingsService.updateSetting.mockResolvedValue(mockSetting)

      await updateSetting(req, res)

      expect(settingsService.updateSetting).toHaveBeenCalledWith('site_name', req.body)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSetting,
        message: 'Setting updated successfully'
      })
    })
  })

  describe('setSettingValue', () => {
    it('should set setting value successfully', async () => {
      const req = mockRequest({
        params: { key: 'currency' },
        body: { value: 'EUR' }
      })
      const res = mockResponse()
      const mockSetting = { key: 'currency', value: 'EUR' }

      settingsService.setSettingValue.mockResolvedValue(mockSetting)

      await setSettingValue(req, res)

      expect(settingsService.setSettingValue).toHaveBeenCalledWith('currency', 'EUR')
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSetting,
        message: 'Setting value updated successfully'
      })
    })
  })

  describe('deleteSetting', () => {
    it('should delete setting successfully', async () => {
      const req = mockRequest({
        params: { key: 'old_setting' }
      })
      const res = mockResponse()
      const mockSetting = { key: 'old_setting', active: false }

      settingsService.deleteSetting.mockResolvedValue(mockSetting)

      await deleteSetting(req, res)

      expect(settingsService.deleteSetting).toHaveBeenCalledWith('old_setting')
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSetting,
        message: 'Setting deleted successfully'
      })
    })
  })

  describe('getSettingValue', () => {
    it('should get setting value successfully', async () => {
      const req = mockRequest({
        params: { key: 'site_name' }
      })
      const res = mockResponse()
      const mockValue = 'FloresYa'

      settingsService.getSettingValue.mockResolvedValue(mockValue)

      await getSettingValue(req, res)

      expect(settingsService.getSettingValue).toHaveBeenCalledWith('site_name')
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockValue,
        message: 'Setting value retrieved successfully'
      })
    })

    it('should handle invalid key', async () => {
      const req = mockRequest({
        params: { key: '' }
      })
      const res = mockResponse()

      await getSettingValue(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid key',
        message: 'Key must be a non-empty string'
      })
    })

    it('should handle non-existent setting', async () => {
      const req = mockRequest({
        params: { key: 'non_existent' }
      })
      const res = mockResponse()
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      settingsService.getSettingValue.mockRejectedValue(new Error('Setting not found'))

      await getSettingValue(req, res)

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'Setting not found'
      })

      consoleErrorSpy.mockRestore()
    })

    it('should rethrow non-not-found errors', async () => {
      const req = mockRequest({
        params: { key: 'test_key' }
      })
      const res = mockResponse()
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      settingsService.getSettingValue.mockRejectedValue(new Error('Database connection failed'))

      await expect(getSettingValue(req, res)).rejects.toThrow('Database connection failed')

      consoleErrorSpy.mockRestore()
    })
  })
})
