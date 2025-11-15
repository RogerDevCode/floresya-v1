/**
 * Procesado por B
 */

/**
 * Settings Service - Read Operations
 * Handles all settings retrieval operations
 * LEGACY: Modularizado desde settingsService.js (PHASE 5)
 */

import { getSettingsRepository, NotFoundError, BadRequestError } from './settingsService.helpers.js'

/**
 * Get all settings (public or admin)
 * @param {boolean} publicOnly - Only return public settings (default: false)
 * @param {boolean} includeDeactivated - Include deactivated settings (default: false)
 * @returns {Array} Array of settings
 */
export async function getAllSettings(publicOnly = false, includeDeactivated = false) {
  try {
    const settingsRepository = getSettingsRepository()
    const data = await settingsRepository.findAll({ publicOnly, includeDeactivated })
    return data || []
  } catch (error) {
    console.error('getAllSettings failed:', error)
    throw error
  }
}

/**
 * Get public settings only (for frontend)
 * @returns {Array} Array of public settings
 */
export async function getPublicSettings() {
  try {
    const settingsRepository = getSettingsRepository()
    const data = await settingsRepository.findPublic()
    return data || []
  } catch (error) {
    console.error('getPublicSettings failed:', error)
    throw error
  }
}

/**
 * Get setting by key
 * @param {string} key - Setting key
 * @param {boolean} includeDeactivated - Include deactivated settings (default: false)
 * @returns {Object|null} Setting object or null
 * @throws {BadRequestError} If key is invalid
 */
export async function getSettingById(key, includeDeactivated = false) {
  try {
    if (!key || typeof key !== 'string') {
      throw new BadRequestError('Setting key is required and must be a string', { key })
    }

    const settingsRepository = getSettingsRepository()
    const data = await settingsRepository.findByKey(key, includeDeactivated)

    if (!data) {
      throw new NotFoundError('Setting', key)
    }

    return data
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error(`getSettingById(${key}) failed:`, error)
    throw error
  }
}

/**
 * Get setting value by key (convenience method)
 * @param {string} key - Setting key
 * @returns {string|null} Setting value or null
 * @throws {NotFoundError} If setting is not found
 */
export async function getSettingValue(key) {
  try {
    const setting = await getSettingById(key)
    return setting ? setting.value : null
  } catch (error) {
    console.error(`getSettingValue(${key}) failed:`, error)
    throw error
  }
}

/**
 * Get multiple settings by keys
 * @param {Array} keys - Array of setting keys
 * @returns {Object} Object with key-value pairs
 */
export async function getSettingsByKeys(keys) {
  try {
    if (!Array.isArray(keys) || keys.length === 0) {
      throw new BadRequestError('Keys must be a non-empty array', { keys })
    }

    const settingsRepository = getSettingsRepository()
    const data = await settingsRepository.findByKeys(keys)

    return data || []
  } catch (error) {
    console.error(`getSettingsByKeys(${keys.length} keys) failed:`, error)
    throw error
  }
}
