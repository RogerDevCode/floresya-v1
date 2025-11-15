/**
 * Procesado por B
 */

/**
 * Settings Service - Create Operations
 * Handles settings creation
 * LEGACY: Modularizado desde settingsService.js (PHASE 5)
 */

import { getSettingsRepository, ValidationError } from './settingsService.helpers.js'

/**
 * Create new setting
 * @param {Object} settingData - Setting data
 * @returns {Object} Created setting
 * @throws {ValidationError} If setting data is invalid
 */
export async function createSetting(settingData) {
  try {
    const settingsRepository = getSettingsRepository()

    // Validate required fields
    if (!settingData.key || typeof settingData.key !== 'string') {
      throw new ValidationError('Setting key is required and must be a string', {
        field: 'key',
        value: settingData.key
      })
    }

    if (!settingData.value || typeof settingData.value !== 'string') {
      throw new ValidationError('Setting value is required and must be a string', {
        field: 'value',
        value: settingData.value
      })
    }

    // Prepare setting data
    const newSetting = {
      key: settingData.key,
      value: settingData.value,
      description: settingData.description || null,
      category: settingData.category || 'general',
      is_public: settingData.is_public || false,
      data_type: settingData.data_type || 'string',
      validation_rules: settingData.validation_rules || null
    }

    // Use repository to create setting
    const data = await settingsRepository.create(newSetting)

    return data
  } catch (error) {
    console.error('createSetting failed:', error)
    throw error
  }
}
