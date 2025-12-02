/**
 * Procesado por B
 */

/**
 * Payment Method Repository
 * Gestiona el acceso a datos de métodos de pago
 * Extiende BaseRepository con operaciones específicas de métodos de pago
 */

import { BaseRepository } from './BaseRepository.js'
import { DB_SCHEMA } from '../services/supabaseClient.js'

export class PaymentMethodRepository extends BaseRepository {
  constructor(supabaseClient) {
    super(supabaseClient, DB_SCHEMA.payment_methods.table)
  }

  /**
   * ✅ STATIC ASYNC FACTORY: Crea PaymentMethodRepository con inicialización completa
   * @returns {Promise<PaymentMethodRepository>} Instancia completamente inicializada
   */
  static async create() {
    try {
      // 🚀 OBTENER CLIENTE: Usar factory de BaseRepository para asegurar inicialización
      // ✅ STATIC ASYNC FACTORY: Implementar patrón correcto
      const supabaseClient = await import('../services/supabaseClient.js').then(m => m.supabase)
      return new PaymentMethodRepository(supabaseClient)
    } catch (error) {
      throw new Error(`PaymentMethodRepository.create failed: ${error.message}`)
    }
  }

  /**
   * Obtener métodos de pago activos
   * @returns {Promise<Array>} Lista de métodos de pago activos
   */
  async findActive() {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true })

    if (error) {
      throw this.handleError(error, 'findActive')
    }

    return data || []
  }

  /**
   * Obtener métodos de pago con filtros
   * @param {Object} filters - Filtros específicos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de métodos de pago
   */
  async findAllWithFilters(filters = {}, options = {}) {
    let query = this.supabase.from(this.table).select('*')

    // Aplicar filtros específicos
    if (filters.type) {
      query = query.eq('type', filters.type)
    }

    if (filters.isActive !== undefined) {
      query = query.eq('active', filters.isActive)
    }

    // Incluir inactivos solo si se especifica
    if (!filters.includeDeactivated) {
      query = query.eq('active', true)
    }

    // Aplicar ordenamiento
    const orderBy = options.orderBy || 'display_order'
    const ascending = options.ascending !== undefined ? options.ascending : true
    query = query.order(orderBy, { ascending })

    // Aplicar límites
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
   * Obtener método de pago por ID
   * @param {number} id - ID del método de pago
   * @param {boolean} includeInactive - Incluir métodos inactivos
   * @returns {Promise<Object>} Método de pago encontrado
   */
  async findById(id, includeInactive = false) {
    let query = this.supabase.from(this.table).select('*').eq('id', id)

    if (!includeInactive) {
      query = query.eq('active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw this.handleError(error, 'findById', { id })
    }

    return data
  }

  /**
   * Obtener métodos de pago por tipo
   * @param {string} type - Tipo de método de pago
   * @param {boolean} includeInactive - Incluir métodos inactivos
   * @returns {Promise<Array>} Lista de métodos de pago
   */
  async findByType(type, includeInactive = false) {
    let query = this.supabase.from(this.table).select('*').eq('type', type)

    if (!includeInactive) {
      query = query.eq('active', true)
    }

    const { data, error } = await query.order('display_order', { ascending: true })

    if (error) {
      throw this.handleError(error, 'findByType', { type })
    }

    return data || []
  }

  /**
   * Actualizar orden de visualización
   * @param {number} id - ID del método de pago
   * @param {number} order - Nuevo orden
   * @returns {Promise<Object>} Método de pago actualizado
   */
  async updateDisplayOrder(id, order) {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        display_order: order,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw this.handleError(error, 'updateDisplayOrder', { id, order })
    }

    return data
  }

  /**
   * Obtener estadísticas de métodos de pago
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats() {
    const { data, error } = await this.supabase.from(this.table).select('type, active')

    if (error) {
      throw this.handleError(error, 'getStats')
    }

    // Calcular estadísticas
    const stats = {
      total: data.length,
      active: data.filter(pm => pm.active).length,
      inactive: data.filter(pm => !pm.active).length,
      byType: {}
    }

    // Agrupar por tipo
    data.forEach(pm => {
      if (!stats.byType[pm.type]) {
        stats.byType[pm.type] = { total: 0, active: 0, inactive: 0 }
      }
      stats.byType[pm.type].total++
      if (pm.active) {
        stats.byType[pm.type].active++
      } else {
        stats.byType[pm.type].inactive++
      }
    })

    return stats
  }
}

/**
 * Factory function to create PaymentMethodRepository instance
 * @param {Object} supabaseClient - Supabase client
 * @returns {PaymentMethodRepository} Repository instance
 */
export async function createPaymentMethodRepository(supabaseClient = null) {
  if (supabaseClient) {
    return new PaymentMethodRepository(supabaseClient)
  }
  return await PaymentMethodRepository.create()
}
