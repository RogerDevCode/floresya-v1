/**
 * Procesado por B
 */

/**
 * Settings Service
 * Key-value store operations
 * Uses indexed key column (unique)
 * Soft-delete implementation using active flag (inactive settings excluded by default)
 * ENTERPRISE FAIL-FAST: Uses custom error classes with metadata
 */

import { supabase, DB_SCHEMA } from './supabaseClient.js'
import { withErrorMapping } from '../middleware/error/index.js'
import {
  NotFoundError,
  DatabaseError,
  DatabaseConstraintError,
  BadRequestError,
  InternalServerError
} from '../errors/AppError.js'
import { validateSetting } from '../utils/validation.js'
import ValidatorService from './validation/ValidatorService.js'

const TABLE = DB_SCHEMA.settings.table

/**
 * Get all settings - optionally filter for public settings only
 * @param {boolean} [publicOnly=false] - Whether to return only public settings
 * @param {boolean} includeDeactivated - Include inactive settings (default: false, admin only)
 * @returns {Object[]} - Array of settings ordered by key
 * @throws {NotFoundError} When no settings are found
 * @throws {DatabaseError} When database query fails
 */
export async function getAllSettings(publicOnly = false, includeDeactivated = false) {
  try {
    let query = supabase.from(TABLE).select('*')

    // Apply activity filter explicitly for test compliance
    if (!includeDeactivated) {
      query = query.eq('active', true)
    }

    // Filter for public settings if requested
    if (publicOnly) {
      query = query.eq('is_public', true)
    }

    // Order by key
    query = query.order('key', { ascending: true })

    const { data, error } = await query

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error)
    }
    if (!data) {
      throw new NotFoundError('Settings')
    }

    return data
  } catch (error) {
    console.error('getAllSettings failed:', error)
    throw error
  }
}

/**
 * Get public settings only - wrapper for getAllSettings with publicOnly=true
 * @returns {Object[]} - Array of public settings ordered by key
 * @throws {NotFoundError} When no public settings are found
 * @throws {DatabaseError} When database query fails
 */
export async function getPublicSettings() {
  try {
    return await getAllSettings(true)
  } catch (error) {
    console.error('getPublicSettings failed:', error)
    throw error
  }
}

/**
 * Get setting by key (indexed column)
 * @param {string} key - Setting key to search for
 * @param {boolean} includeDeactivated - Include inactive settings (default: false, admin only)
 * @returns {Object} - Setting object
 * @throws {BadRequestError} When key is invalid
 * @throws {NotFoundError} When setting with key is not found
 * @throws {DatabaseError} When database query fails
 */
export async function getSettingById(key, includeDeactivated = false) {
  try {
    if (!key || typeof key !== 'string') {
      throw new BadRequestError('Invalid key: must be a string', { key })
    }

    let query = supabase.from(TABLE).select('*').eq('key', key)

    // Apply activity filter explicitly for test compliance
    if (!includeDeactivated) {
      query = query.eq('active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Setting', key, { key, includeDeactivated })
      }
      throw new DatabaseError('SELECT', TABLE, error, { key })
    }
    if (!data) {
      throw new NotFoundError('Setting', key, { key, includeDeactivated })
    }

    return data
  } catch (error) {
    console.error(`getSettingById(${key}) failed:`, error)
    throw error
  }
}

/**
 * Get setting by key (indexed column)
 * @param {string} key - Setting key to search for
 * @returns {Object} - Setting object
 * @throws {BadRequestError} When key is invalid
 * @throws {NotFoundError} When setting with key is not found
 * @throws {DatabaseError} When database query fails
 */
export const getSettingByKey = withErrorMapping(
  async key => {
    if (!key || typeof key !== 'string') {
      throw new BadRequestError('Invalid key: must be a string', { key })
    }

    const { data, error } = await supabase.from(TABLE).select('*').eq('key', key).single()

    if (error) {
      // Map Supabase error automatically
      throw error
    }
    if (!data) {
      throw new NotFoundError('Setting', key, { key })
    }

    return data
  },
  'SELECT',
  TABLE
)

/**
 * Get setting value (typed) - automatically parses value based on setting type
 * @param {string} key - Setting key to retrieve value for
 * @returns {*} - Parsed setting value (number, boolean, object, or string)
 * @throws {BadRequestError} When key is invalid
 * @throws {NotFoundError} When setting with key is not found
 * @throws {DatabaseError} When database query fails
 * @example
 * const deliveryCost = await getSettingValue('DELIVERY_COST_USD') // Returns: 7.0 (number)
 * const isMaintenance = await getSettingValue('MAINTENANCE_MODE') // Returns: false (boolean)
 */
export async function getSettingValue(key) {
  try {
    const setting = await getSettingByKey(key)

    // Parse value based on type
    switch (setting.type) {
      case 'number':
        return parseFloat(setting.value)
      case 'boolean':
        return setting.value === 'true' || setting.value === '1'
      case 'json':
        return JSON.parse(setting.value)
      default:
        return setting.value
    }
  } catch (error) {
    console.error(`getSettingValue(${key}) failed:`, error)
    throw error
  }
}

/**
 * Create setting - key-value configuration entry
 * @param {Object} settingData - Setting data to create
 * @param {string} settingData.key - Setting key (required, must be unique)
 * @param {string} settingData.value - Setting value
 * @param {string} [settingData.description] - Setting description
 * @param {string} [settingData.type='string'] - Setting type (string, number, boolean, json)
 * @param {boolean} [settingData.is_public=false] - Whether setting is publicly accessible
 * @returns {Object} - Created setting
 * @throws {ValidationError} When setting data is invalid
 * @throws {DatabaseConstraintError} When setting violates database constraints (e.g., duplicate key)
 * @throws {DatabaseError} When database insert fails
 */
export async function createSetting(settingData) {
  try {
    validateSetting(settingData, false)

    const newSetting = {
      key: settingData.key,
      value: settingData.value,
      description: settingData.description || null,
      type: settingData.type || 'string',
      is_public: settingData.is_public || false
    }

    const { data, error } = await supabase.from(TABLE).insert(newSetting).select().single()

    if (error) {
      if (error.code === '23505') {
        throw new DatabaseConstraintError('unique_key', TABLE, {
          key: settingData.key,
          message: `Setting with key "${settingData.key}" already exists`
        })
      }
      throw new DatabaseError('INSERT', TABLE, error, { settingData: newSetting })
    }

    if (!data) {
      throw new DatabaseError(
        'INSERT',
        TABLE,
        new InternalServerError('No data returned after insert'),
        {
          settingData: newSetting
        }
      )
    }

    return data
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error('createSetting failed:', error)
    throw new DatabaseError('INSERT', TABLE, error, { settingData })
  }
}

/**
 * Update setting (limited fields) - only allows updating specific setting fields
 * @param {string} key - Setting key to update
 * @param {Object} updates - Updated setting data
 * @param {string} [updates.value] - Setting value
 * @param {string} [updates.description] - Setting description
 * @param {string} [updates.type] - Setting type
 * @param {boolean} [updates.is_public] - Whether setting is publicly accessible
 * @returns {Object} - Updated setting
 * @throws {BadRequestError} When key is invalid or no valid updates are provided
 * @throws {ValidationError} When setting data is invalid
 * @throws {NotFoundError} When setting is not found
 * @throws {DatabaseError} When database update fails
 */
export async function updateSetting(key, updates) {
  try {
    if (!key || typeof key !== 'string') {
      throw new BadRequestError('Invalid key: must be a string', { key })
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new BadRequestError('No updates provided', { key })
    }

    validateSetting(updates, true)

    const allowedFields = ['value', 'description', 'type', 'is_public']
    const sanitized = {}

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitized[field] = updates[field]
      }
    }

    if (Object.keys(sanitized).length === 0) {
      throw new BadRequestError('No valid fields to update', { key })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(sanitized)
      .eq('key', key)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { key })
    }
    if (!data) {
      throw new NotFoundError('Setting', key, { key })
    }

    return data
  } catch (error) {
    console.error(`updateSetting(${key}) failed:`, error)
    throw error
  }
}

/**
 * Update setting value (convenience method) - automatically converts value to string
 * @param {string} key - Setting key to update
 * @param {*} value - New value (will be converted to string)
 * @returns {Object} - Updated setting
 * @throws {BadRequestError} When key is invalid
 * @throws {NotFoundError} When setting is not found
 * @throws {DatabaseError} When database update fails
 * @example
 * const setting = await setSettingValue('DELIVERY_COST_USD', 8.50)
 */
export async function setSettingValue(key, value) {
  try {
    return await updateSetting(key, { value: String(value) })
  } catch (error) {
    console.error(`setSettingValue(${key}) failed:`, error)
    throw error
  }
}

/**
 * Soft-delete setting (sets active to false)
 * @param {string} key - Setting key to delete
 * @returns {Object} - Deactivated setting
 * @throws {BadRequestError} When key is invalid
 * @throws {NotFoundError} When setting is not found or already inactive
 * @throws {DatabaseError} When database update fails
 */
export async function deleteSetting(key) {
  try {
    if (!key || typeof key !== 'string') {
      throw new BadRequestError('Invalid key: must be a string', { key })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ active: false })
      .eq('key', key)
      .eq('active', true)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { key })
    }
    if (!data) {
      throw new NotFoundError('Setting', key, { active: true })
    }

    return data
  } catch (error) {
    console.error(`deleteSetting(${key}) failed:`, error)
    throw error
  }
}

/**
 * Reactivate setting (reverse soft-delete)
 * @param {string} key - Setting key to reactivate
 * @returns {Object} - Reactivated setting
 * @throws {BadRequestError} When key is invalid
 * @throws {NotFoundError} When setting is not found or already active
 * @throws {DatabaseError} When database update fails
 */
export async function reactivateSetting(key) {
  try {
    if (!key || typeof key !== 'string') {
      throw new BadRequestError('Invalid key: must be a string', { key })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ active: true })
      .eq('key', key)
      .eq('active', false)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { key })
    }
    if (!data) {
      throw new NotFoundError('Setting', key, { active: false })
    }

    return data
  } catch (error) {
    console.error(`reactivateSetting(${key}) failed:`, error)
    throw error
  }
}

/**
 * Bulk get settings by keys - retrieves multiple settings in a single query
 * @param {string[]} keys - Array of setting keys to retrieve
 * @returns {Object[]} - Array of setting objects for the requested keys
 * @throws {BadRequestError} When keys array is invalid
 * @throws {NotFoundError} When no settings are found for the requested keys
 * @throws {DatabaseError} When database query fails
 * @example
 * const settings = await getSettingsByKeys(['DELIVERY_COST_USD', 'bcv_usd_rate'])
 */
export async function getSettingsByKeys(keys) {
  try {
    if (!Array.isArray(keys) || keys.length === 0) {
      throw new BadRequestError('Invalid keys: must be a non-empty array', { keys })
    }

    const { data, error } = await supabase.from(TABLE).select('*').in('key', keys)

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error, { keys })
    }
    if (!data) {
      throw new NotFoundError('Settings', keys, { keys })
    }

    return data
  } catch (error) {
    console.error('getSettingsByKeys failed:', error)
    throw error
  }
}

/**
 * Get settings as key-value map - returns typed values based on setting type
 * @param {boolean} [publicOnly=false] - Whether to return only public settings
 * @returns {Object} - Map of setting keys to parsed values
 * @throws {NotFoundError} When no settings are found
 * @throws {DatabaseError} When database query fails
 * @example
 * const settings = await getSettingsMap()
 * // Returns: { DELIVERY_COST_USD: 7.0, bcv_usd_rate: 40.0, MAINTENANCE_MODE: false }
 */
export const getSettingsMap = withErrorMapping(
  async (publicOnly = false) => {
    const settings = await getAllSettings(publicOnly)

    const map = {}
    for (const setting of settings) {
      // Parse value based on type
      switch (setting.type) {
        case 'number':
          map[setting.key] = parseFloat(setting.value)
          break
        case 'boolean':
          map[setting.key] = setting.value === 'true' || setting.value === '1'
          break
        case 'json':
          map[setting.key] = JSON.parse(setting.value)
          break
        default:
          map[setting.key] = setting.value
      }
    }

    return map
  },
  'SELECT',
  TABLE
)
