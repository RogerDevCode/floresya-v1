/**
 * Settings Service
 * Key-value store operations
 * Uses indexed key column (unique)
 * NO soft-delete (settings are permanent configuration)
 */

import { supabase, DB_SCHEMA } from './supabaseClient.js'

const TABLE = DB_SCHEMA.settings.table

/**
 * Validate setting data
 */
function validateSettingData(data, isUpdate = false) {
  if (!isUpdate) {
    if (!data.key || typeof data.key !== 'string') {
      throw new Error('Invalid key: must be a non-empty string')
    }
  }

  if (data.key !== undefined && (typeof data.key !== 'string' || data.key.trim() === '')) {
    throw new Error('Invalid key: must be a non-empty string')
  }

  if (data.type !== undefined) {
    const validTypes = ['string', 'number', 'boolean', 'json']
    if (!validTypes.includes(data.type)) {
      throw new Error(`Invalid type: must be one of ${validTypes.join(', ')}`)
    }
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
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error('No settings found')
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
      throw new Error('Invalid key: must be a string')
    }

    const { data, error } = await supabase.from(TABLE).select('*').eq('key', key).single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`Setting with key "${key}" not found`)
      }
      throw new Error(`Database error: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error(`getSettingByKey(${key}) failed:`, error)
    throw error
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
        throw new Error(`Setting with key "${settingData.key}" already exists`)
      }
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data) {
      throw new Error('Failed to create setting')
    }

    return data
  } catch (error) {
    console.error('createSetting failed:', error)
    throw error
  }
}

/**
 * Update setting
 */
export async function updateSetting(key, updates) {
  try {
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid key: must be a string')
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('No updates provided')
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
      throw new Error('No valid fields to update')
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(sanitized)
      .eq('key', key)
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error(`Setting with key "${key}" not found`)
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
      throw new Error('Invalid key: must be a string')
    }

    const { data, error } = await supabase.from(TABLE).delete().eq('key', key).select().single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error(`Setting with key "${key}" not found`)
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
      throw new Error('Invalid keys: must be a non-empty array')
    }

    const { data, error } = await supabase.from(TABLE).select('*').in('key', keys)

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error('No settings found')
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
