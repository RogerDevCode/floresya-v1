/**
 * Settings Service
 * Key-value store operations
 * Uses indexed key column (unique)
 * NO soft-delete (settings are permanent configuration)
 * ENTERPRISE FAIL-FAST: Uses custom error classes with metadata
 */

import { supabase, DB_SCHEMA } from './supabaseClient.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  DatabaseConstraintError,
  BadRequestError
} from '../errors/AppError.js'

const TABLE = DB_SCHEMA.settings.table

/**
 * Validate setting data
 */
function validateSettingData(data, isUpdate = false) {
  const errors = {}

  if (!isUpdate) {
    if (!data.key || typeof data.key !== 'string') {
      errors.key = 'Key is required and must be a non-empty string'
    }
  }

  if (data.key !== undefined && (typeof data.key !== 'string' || data.key.trim() === '')) {
    errors.key = 'Key must be a non-empty string'
  }

  if (data.type !== undefined) {
    const validTypes = ['string', 'number', 'boolean', 'json']
    if (!validTypes.includes(data.type)) {
      errors.type = `Type must be one of ${validTypes.join(', ')}`
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Setting validation failed', errors)
  }
}

/**
 * Get all settings
 */
export async function getAllSettings(publicOnly = false) {
  try {
    let query = supabase.from(TABLE).select('*')

    if (publicOnly) {
      query = query.eq('is_public', true)
    }

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
 * Get public settings only
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
 */
export async function getSettingByKey(key) {
  try {
    if (!key || typeof key !== 'string') {
      throw new BadRequestError('Invalid key: must be a string', { key })
    }

    const { data, error } = await supabase.from(TABLE).select('*').eq('key', key).single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Setting', key, { key })
      }
      throw new DatabaseError('SELECT', TABLE, error, { key })
    }
    if (!data) {
      throw new NotFoundError('Setting', key, { key })
    }

    return data
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error(`getSettingByKey(${key}) failed:`, error)
    throw new DatabaseError('SELECT', TABLE, error, { key })
  }
}

/**
 * Get setting value (typed)
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
 * Create setting
 */
export async function createSetting(settingData) {
  try {
    validateSettingData(settingData, false)

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
      throw new DatabaseError('INSERT', TABLE, new Error('No data returned after insert'), {
        settingData: newSetting
      })
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
 * Update setting
 */
export async function updateSetting(key, updates) {
  try {
    if (!key || typeof key !== 'string') {
      throw new BadRequestError('Invalid key: must be a string', { key })
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new BadRequestError('No updates provided', { key })
    }

    validateSettingData(updates, true)

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
 * Update setting value (convenience method)
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
 * Delete setting
 */
export async function deleteSetting(key) {
  try {
    if (!key || typeof key !== 'string') {
      throw new BadRequestError('Invalid key: must be a string', { key })
    }

    const { data, error } = await supabase.from(TABLE).delete().eq('key', key).select().single()

    if (error) {
      throw new DatabaseError('DELETE', TABLE, error, { key })
    }
    if (!data) {
      throw new NotFoundError('Setting', key, { key })
    }

    return data
  } catch (error) {
    console.error(`deleteSetting(${key}) failed:`, error)
    throw error
  }
}

/**
 * Bulk get settings by keys
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
 * Get settings as key-value map
 */
export async function getSettingsMap(publicOnly = false) {
  try {
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
  } catch (error) {
    console.error('getSettingsMap failed:', error)
    throw error
  }
}
