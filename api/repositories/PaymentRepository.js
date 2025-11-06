/**
 * Payment Repository
 * Gestiona el acceso a datos de pagos
 * Extiende BaseRepository con operaciones específicas de pagos
 */

import { BaseRepository } from './BaseRepository.js'
import { DB_SCHEMA } from '../services/supabaseClient.js'

export class PaymentRepository extends BaseRepository {
  constructor(supabaseClient) {
    super(supabaseClient, DB_SCHEMA.payments.table)
  }

  /**
   * Obtener pagos con filtros específicos
   * @param {Object} filters - Filtros para pagos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de pagos
   */
  async findAllWithFilters(filters = {}, options = {}) {
    let query = this.supabase.from(this.table).select(`
        *,
        orders(*),
        payment_methods(*)
      `)

    // Aplicar filtros específicos
    if (filters.orderId) {
      query = query.eq('order_id', filters.orderId)
    }

    if (filters.paymentMethodId) {
      query = query.eq('payment_method_id', filters.paymentMethodId)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.reference) {
      query = query.ilike('reference', `%${filters.reference}%`)
    }

    // Filtrar por rango de fechas
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    // No active column in payments table - use status filtering instead
    // Inactive payments are those with status 'failed' or 'refunded'

    // Aplicar ordenamiento
    const orderBy = options.orderBy || 'created_at'
    const ascending = options.ascending || false
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
   * Obtener pago por ID
   * @param {number} id - ID del pago
   * @param {boolean} includeInactive - Incluir pagos inactivos
   * @returns {Promise<Object>} Pago encontrado
   */
  async findById(id, includeInactive = false) {
    let query = this.supabase
      .from(this.table)
      .select(
        `
        *,
        orders(*),
        payment_methods(*)
      `
      )
      .eq('id', id)

    // No active column - use status filtering instead
    if (!includeInactive) {
      // Only include non-refunded/failed payments
      query = query.neq('status', 'refunded')
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
   * Obtener pagos por order_id
   * @param {number} orderId - ID del pedido
   * @param {boolean} includeInactive - Incluir pagos inactivos
   * @returns {Promise<Array>} Lista de pagos
   */
  async findByOrderId(orderId, includeInactive = false) {
    let query = this.supabase
      .from(this.table)
      .select(
        `
        *,
        payment_methods(*)
      `
      )
      .eq('order_id', orderId)

    // No active column - use status filtering instead
    if (!includeInactive) {
      // Only include non-refunded/failed payments
      query = query.neq('status', 'refunded')
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw this.handleError(error, 'findByOrderId', { orderId })
    }

    return data || []
  }

  /**
   * Obtener pagos por reference
   * @param {string} reference - Reference del pago
   * @returns {Promise<Object>} Pago encontrado
   */
  async findByReference(reference) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
        *,
        orders(*),
        payment_methods(*)
      `
      )
      .eq('reference', reference)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw this.handleError(error, 'findByReference', { reference })
    }

    return data
  }

  /**
   * Actualizar estado del pago
   * @param {number} id - ID del pago
   * @param {string} status - Nuevo estado
   * @returns {Promise<Object>} Pago actualizado
   */
  async updateStatus(id, status) {
    const validStatuses = ['pending', 'completed', 'failed', 'cancelled', 'refunded']

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`)
    }

    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw this.handleError(error, 'updateStatus', { id, status })
    }

    return data
  }

  /**
   * Actualizar transaction_id
   * @param {number} id - ID del pago
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Pago actualizado
   */
  async updateTransactionId(id, transactionId) {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        transaction_id: transactionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw this.handleError(error, 'updateTransactionId', { id, transactionId })
    }

    return data
  }

  /**
   * Obtener estadísticas de pagos
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats(filters = {}) {
    let query = this.supabase.from(this.table).select('status, amount_usd')

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    const { data, error } = await query

    if (error) {
      throw this.handleError(error, 'getStats', { filters })
    }

    // Calcular estadísticas
    const stats = {
      total: data.length,
      totalAmount: data.reduce((sum, payment) => sum + Number(payment.amount_usd || 0), 0),
      // No active column - use status for filtering
      byStatus: {
        pending: data.filter(p => p.status === 'pending').length,
        completed: data.filter(p => p.status === 'completed').length,
        failed: data.filter(p => p.status === 'failed').length,
        refunded: data.filter(p => p.status === 'refunded').length,
        partially_refunded: data.filter(p => p.status === 'partially_refunded').length
      }
    }

    return stats
  }
}

/**
 * Factory function to create PaymentRepository instance
 * @param {Object} supabaseClient - Supabase client
 * @returns {PaymentRepository} Repository instance
 */
export function createPaymentRepository(supabaseClient = null) {
  return new PaymentRepository(supabaseClient)
}
