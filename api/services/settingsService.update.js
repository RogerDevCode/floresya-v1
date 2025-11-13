/**
 * Settings Service - Update Operations
 * Handles settings updates
 * LEGACY: Modularizado desde settingsService.js (PHASE 5)
 */

import {
  getSettingsRepository,
  ValidationError,
  BadRequestError
} from './settingsService.helpers.js'

/**
 * Update setting
 * @param {string} key - Setting key to update
 * @param {Object} updates - Updated setting data
 * @returns {Object} Updated setting
 * @throws {BadRequestError} If key is invalid
 * @throws {ValidationError} If update data is invalid
 */
export async function updateSetting(key, updates) {
  try {
    if (!key || typeof key !== 'string') {
      throw new BadRequestError('Setting key is required and must be a string', { key })
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new BadRequestError('No updates provided', { key })
    }

    const settingsRepository = getSettingsRepository()

    // Validate updates if value is being changed
    if (updates.value !== undefined) {
      if (typeof updates.value !== 'string') {
        throw new ValidationError('Setting value must be a string', {
          field: 'value',
          value: updates.value
        })
      }
    }

    // Use repository to update setting
    const data = await settingsRepository.updateByKey(key, updates)

    return data
  } catch (error) {
    console.error(`updateSetting(${key}) failed:`, error)
    throw error
  }
}

/**
 * Set setting value (convenience method)
 * @param {string} key - Setting key
 * @param {string} value - New value
 * @returns {Object} Updated setting
 */
export async function setSettingValue(key, value) {
  try {
    if (!key || typeof key !== 'string') {
      throw new BadRequestError('Setting key is required and must be a string', { key })
    }

    if (value === undefined || value === null) {
      throw new BadRequestError('Value is required', { key, value })
    }

    return await updateSetting(key, { value: value.toString() })
  } catch (error) {
    console.error(`setSettingValue(${key}) failed:`, error)
    throw error
  }
}
