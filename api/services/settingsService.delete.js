/**
 * Settings Service - Delete Operations
 * Handles settings deletion and reactivation
 * LEGACY: Modularizado desde settingsService.js (PHASE 5)
 */

import { getSettingsRepository, BadRequestError } from './settingsService.helpers.js'

/**
 * Delete setting (soft delete)
 * @param {string} key - Setting key to delete
 * @returns {Object} Deleted setting
 * @throws {BadRequestError} If key is invalid
 */
export async function deleteSetting(key) {
  try {
    if (!key || typeof key !== 'string') {
      throw new BadRequestError('Setting key is required and must be a string', { key })
    }

    const settingsRepository = getSettingsRepository()
    const data = await settingsRepository.deleteByKey(key)

    return data
  } catch (error) {
    console.error(`deleteSetting(${key}) failed:`, error)
    throw error
  }
}

/**
 * Reactivate deleted setting
 * @param {string} key - Setting key to reactivate
 * @returns {Object} Reactivated setting
 * @throws {BadRequestError} If key is invalid
 */
export async function reactivateSetting(key) {
  try {
    if (!key || typeof key !== 'string') {
      throw new BadRequestError('Setting key is required and must be a string', { key })
    }

    const settingsRepository = getSettingsRepository()
    const data = await settingsRepository.reactivateByKey(key)

    return data
  } catch (error) {
    console.error(`reactivateSetting(${key}) failed:`, error)
    throw error
  }
}
