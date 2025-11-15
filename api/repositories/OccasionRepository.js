/**
 * Procesado por B
 */

/**
 * Occasion Repository
 * Gestiona el acceso a datos de ocasiones
 * Extiende BaseRepository con operaciones específicas de ocasiones
 */

import { BaseRepository } from './BaseRepository.js'
import { DB_SCHEMA } from '../services/supabaseClient.js'

export class OccasionRepository extends BaseRepository {
  constructor(supabaseClient) {
    super(supabaseClient, DB_SCHEMA.occasions.table)
  }

  /**
   * Obtener ocasión por slug
   * @param {string} slug - Slug de la ocasión
   * @param {boolean} includeInactive - Incluir ocasiones inactivas
   * @returns {Promise<Object|null>} Occasión encontrada
   */
  async findBySlug(slug, includeInactive = false) {
    let query = this.supabase.from(this.table).select('*').eq('slug', slug)

    if (!includeInactive) {
      query = query.eq('active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw this.handleError(error, 'findBySlug', { slug, includeInactive })
    }

    return data
  }

  /**
   * Obtener ocasiones con filtros
   * @param {Object} filters - Filtros específicos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de ocasiones
   */
  async findAllWithFilters(filters = {}, options = {}) {
    let query = this.supabase.from(this.table).select('*')

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (!filters.includeDeactivated) {
      query = query.eq('active', true)
    }

    const orderBy = options.orderBy || 'display_order'
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

  /**
   * Obtener ocasiones ordenadas para display
   * @param {boolean} includeInactive - Incluir inactivas
   * @returns {Promise<Array>} Lista de ocasiones ordenadas
   */
  async findAllForDisplay(includeInactive = false) {
    return await this.findAllWithFilters(
      { includeDeactivated: includeInactive },
      { orderBy: 'display_order', ascending: true }
    )
  }
}

/**
 * Factory function to create OccasionRepository instance
 * @param {Object} supabaseClient - Supabase client instance
 * @returns {OccasionRepository} Repository instance
 */
export function createOccasionRepository(supabaseClient = null) {
  if (!supabaseClient) {
    throw new Error('SupabaseClient is required to create OccasionRepository')
  }
  return new OccasionRepository(supabaseClient)
}
