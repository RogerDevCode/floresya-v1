/**
 * Procesado por B
 */

/**
 * Settings Repository
 * Gestiona el acceso a datos de configuraciones
 * Extiende BaseRepository con operaciones específicas de settings
 */

import { BaseRepositoryWithErrorHandling } from './BaseRepository.errors.js'
import { DB_SCHEMA } from '../services/supabaseClient.js'

export class SettingsRepository extends BaseRepositoryWithErrorHandling {
  constructor(supabaseClient) {
    super(supabaseClient, DB_SCHEMA.settings.table)
  }

  /**
   * Obtener configuración por clave
   * @param {string} key - Clave de configuración
   * @returns {Promise<Object|null>} Configuración encontrada
   */
  async findByKey(key) {
    const { data, error } = await this.supabase.from(this.table).select('*').eq('key', key).single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw this.handleError(error, 'findByKey', { key })
    }

    return data
  }

  /**
   * Obtener configuraciones públicas
   * @returns {Promise<Array>} Lista de configuraciones públicas
   */
  async findAllPublic() {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('*')
      .eq('is_public', true)
      .order('key', { ascending: true })

    if (error) {
      throw this.handleError(error, 'findAllPublic')
    }

    return data || []
  }

  /**
   * Obtener mapa de configuraciones
   * @param {boolean} onlyPublic - Solo configuraciones públicas
   * @returns {Promise<Object>} Mapa clave-valor
   */
  async getSettingsMap(onlyPublic = true) {
    let query = this.supabase.from(this.table).select('key, value, type, description')

    if (onlyPublic) {
      query = query.eq('is_public', true)
    }

    const { data, error } = await query.order('key', { ascending: true })

    if (error) {
      throw this.handleError(error, 'getSettingsMap', { onlyPublic })
    }

    const settingsMap = {}
    data?.forEach(setting => {
      settingsMap[setting.key] = {
        value: setting.value,
        type: setting.type,
        description: setting.description
      }
    })

    return settingsMap
  }

  /**
   * Actualizar configuración por clave
   * @param {string} key - Clave de configuración
   * @param {Object} updates - Datos a actualizar
   * @returns {Promise<Object>} Configuración actualizada
   */
  async updateByKey(key, updates) {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('key', key)
      .select()
      .single()

    if (error) {
      throw this.handleError(error, 'updateByKey', { key, updates })
    }

    return data
  }

  /**
   * Obtener configuraciones con filtros
   * @param {Object} filters - Filtros específicos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de configuraciones
   */
  async findAllWithFilters(filters = {}, options = {}) {
    let query = this.supabase.from(this.table).select('*')

    if (filters.key) {
      query = query.ilike('key', `%${filters.key}%`)
    }

    if (filters.type) {
      query = query.eq('type', filters.type)
    }

    if (filters.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public)
    }

    const orderBy = options.orderBy || 'key'
    const ascending = options.ascending !== false
    query = query.order(orderBy, { ascending })

    if (options.limit !== undefined) {
      const offset = options.offset || 0
      query = query.range(offset, offset + options.limit - 1)
    }

    const { data, error } = await query

    if (error) {
      throw this.handleError(error, 'findAllWithFilters', { filters, options })
    }

    return data || []
  }
}

/**
 * Factory function to create SettingsRepository instance
 * @param {Object} supabaseClient - Supabase client instance
 * @returns {SettingsRepository} Repository instance
 */
export function createSettingsRepository(supabaseClient = null) {
  if (!supabaseClient) {
    throw new Error('SupabaseClient is required to create SettingsRepository')
  }
  return new SettingsRepository(supabaseClient)
}
