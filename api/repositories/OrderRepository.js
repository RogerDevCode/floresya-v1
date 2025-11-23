/**
 * Procesado por B
 */

/**
 * Order Repository
 * Gestiona el acceso a datos de pedidos
 * Extiende BaseRepository con operaciones específicas de pedidos
 */

import { BaseRepository } from './BaseRepository.js'
import { BadRequestError } from '../errors/AppError.js'
import { DB_SCHEMA } from '../services/supabaseClient.js'

export class OrderRepository extends BaseRepository {
  constructor(supabaseClient) {
    super(supabaseClient, DB_SCHEMA.orders.table)
  }

  /**
   * Obtener pedidos con filtros específicos
   * ✅ OPTIMIZADO: 100% SQL filtering usando get_orders_filtered()
   * NO JavaScript filtering - todo se hace en PostgreSQL con índices
   * @param {Object} filters - Filtros para pedidos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de pedidos con order_items
   */
  async findAllWithFilters(filters = {}, options = {}) {
    // ✅ OPTIMIZACIÓN: Usar get_orders_filtered() RPC para filtrado SQL completo

    // Map sortBy to SQL function parameters
    let sortBy = 'created_at'
    let sortOrder = 'DESC'

    if (options.orderBy) {
      sortBy = options.orderBy
      sortOrder = options.ascending ? 'ASC' : 'DESC'
    }

    // Extract year from dateFrom/dateTo if no explicit year filter
    let year = filters.year || null
    if (!year && filters.dateFrom) {
      const dateObj = new Date(filters.dateFrom)
      year = dateObj.getFullYear()
    }

    const { data, error } = await this.supabase.rpc('get_orders_filtered', {
      p_status: filters.status || null,
      p_year: year,
      p_date_from: filters.dateFrom ? new Date(filters.dateFrom).toISOString().split('T')[0] : null,
      p_date_to: filters.dateTo ? new Date(filters.dateTo).toISOString().split('T')[0] : null,
      p_search: filters.search || null,
      p_sort_by: sortBy,
      p_sort_order: sortOrder,
      p_limit: options.limit || 50,
      p_offset: options.offset || 0
    })

    if (error) {
      throw this.handleError(error, 'findAllWithFilters (get_orders_filtered RPC)', {
        filters,
        options
      })
    }

    // order_items viene como JSON, ya parseado por PostgreSQL
    return data || []
  }

  /**
   * Obtener pedido por ID con items incluidos
   * @param {number} id - ID del pedido
   * @param {boolean} includeInactive - Incluir pedidos inactivos
   * @returns {Promise<Object>} Pedido con items
   */
  async findByIdWithItems(id, includeInactive = false) {
    const query = this.supabase
      .from(this.table)
      .select(
        `
        id, user_id, customer_email, customer_name, customer_phone, delivery_address, delivery_date, delivery_time_slot, delivery_notes, status, total_amount_usd, total_amount_ves, currency_rate, notes, admin_notes, created_at, updated_at, customer_name_normalized, customer_email_normalized,
        users(id, email, full_name, phone, role, active, email_verified, created_at, updated_at),
        order_items(
          id, order_id, product_id, product_name, product_summary, unit_price_usd, unit_price_ves, quantity, subtotal_usd, subtotal_ves, created_at, updated_at,
          products(id, name, summary, description, price_usd, price_ves, stock, sku, active, featured, carousel_order, created_at, updated_at)
        )
      `
      )
      .eq('id', id)

    if (!includeInactive) {
      // No active column in orders table - use status filtering instead
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw this.handleError(error, 'findByIdWithItems', { id, includeInactive })
    }

    return data
  }

  /**
   * Obtener pedidos por usuario
   * @param {number} userId - ID del usuario
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de pedidos del usuario
   */
  async findByUserId(userId, options = {}) {
    let query = this.supabase
      .from(this.table)
      .select(
        `
        id, user_id, customer_email, customer_name, customer_phone, delivery_address, delivery_date, delivery_time_slot, delivery_notes, status, total_amount_usd, total_amount_ves, currency_rate, notes, admin_notes, created_at, updated_at, customer_name_normalized, customer_email_normalized,
        order_items(id, order_id, product_id, product_name, product_summary, unit_price_usd, unit_price_ves, quantity, subtotal_usd, subtotal_ves, created_at, updated_at)
      `
      )
      .eq('user_id', userId)

    // Por defecto incluir solo activos
    if (options.includeInactive !== true) {
      // No active column in orders table - use status filtering instead
    }

    // Aplicar ordenamiento (más reciente primero)
    query = query.order('created_at', { ascending: false })

    // Aplicar límites
    if (options.limit !== undefined) {
      const offset = options.offset || 0
      query = query.range(offset, offset + options.limit - 1)
    }

    const { data, error } = await query

    if (error) {
      throw this.handleError(error, 'findByUserId', { userId, options })
    }

    return data || []
  }

  /**
   * Actualizar estado del pedido
   * @param {number} id - ID del pedido
   * @param {string} status - Nuevo estado
   * @returns {Promise<Object>} Pedido actualizado
   */
  async updateStatus(id, status) {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

    if (!validStatuses.includes(status)) {
      throw new BadRequestError(`Invalid status: ${status}`, { status, validStatuses })
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
   * Actualizar estado de pago
   * @param {number} id - ID del pedido
   * @param {string} paymentStatus - Estado de pago
   * @param {string} paymentMethod - Método de pago (opcional)
   * @returns {Promise<Object>} Pedido actualizado
   */
  async updatePaymentStatus(id, paymentStatus, paymentMethod = null) {
    const validStatuses = ['pending', 'paid', 'failed', 'refunded', 'partial']

    if (!validStatuses.includes(paymentStatus)) {
      throw new BadRequestError(`Invalid payment status: ${paymentStatus}`, { paymentStatus })
    }

    const updateData = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    }

    if (paymentMethod) {
      updateData.payment_method = paymentMethod
    }

    const { data, error } = await this.supabase
      .from(this.table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw this.handleError(error, 'updatePaymentStatus', { id, paymentStatus, paymentMethod })
    }

    return data
  }

  /**
   * Obtener pedidos por estado
   * @param {string} status - Estado a filtrar
   * @param {boolean} includeInactive - Incluir inactivos
   * @returns {Promise<Array>} Lista de pedidos
   */
  async findByStatus(status, includeInactive = false) {
    const query = this.supabase
      .from(this.table)
      .select(
        'id, user_id, customer_email, customer_name, customer_phone, delivery_address, delivery_date, delivery_time_slot, delivery_notes, status, total_amount_usd, total_amount_ves, currency_rate, notes, admin_notes, created_at, updated_at, customer_name_normalized, customer_email_normalized, users(id, email, full_name, phone, role, active, email_verified, created_at, updated_at)'
      )
      .eq('status', status)

    if (!includeInactive) {
      // No active column in orders table - use status filtering instead
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw this.handleError(error, 'findByStatus', { status, includeInactive })
    }

    return data || []
  }

  /**
   * Obtener pedidos por estado de pago
   * @param {string} paymentStatus - Estado de pago a filtrar
   * @param {boolean} includeInactive - Incluir inactivos
   * @returns {Promise<Array>} Lista de pedidos
   */
  async findByPaymentStatus(paymentStatus, includeInactive = false) {
    const query = this.supabase
      .from(this.table)
      .select(
        'id, user_id, customer_email, customer_name, customer_phone, delivery_address, delivery_date, delivery_time_slot, delivery_notes, status, total_amount_usd, total_amount_ves, currency_rate, notes, admin_notes, created_at, updated_at, customer_name_normalized, customer_email_normalized, users(id, email, full_name, phone, role, active, email_verified, created_at, updated_at)'
      )
      .eq('payment_status', paymentStatus)

    if (!includeInactive) {
      // No active column in orders table - use status filtering instead
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw this.handleError(error, 'findByPaymentStatus', { paymentStatus, includeInactive })
    }

    return data || []
  }

  /**
   * Obtener estadísticas de pedidos
   * @param {Object} filters - Filtros opcionales (fechas, estado)
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats(filters = {}) {
    let query = this.supabase.from(this.table).select('status, total_amount_usd')

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
      totalAmount: data.reduce((sum, order) => sum + Number(order.total_amount_usd || 0), 0),
      // No active column - use status for filtering
      byStatus: {
        pending: data.filter(o => o.status === 'pending').length,
        verified: data.filter(o => o.status === 'verified').length,
        preparing: data.filter(o => o.status === 'preparing').length,
        shipped: data.filter(o => o.status === 'shipped').length,
        delivered: data.filter(o => o.status === 'delivered').length,
        cancelled: data.filter(o => o.status === 'cancelled').length
      }
      // Note: No payment_status column in orders - use payments table instead
    }

    return stats
  }

  /**
   * Obtener pedidos por rango de fechas
   * @param {string} dateFrom - Fecha desde (ISO string)
   * @param {string} dateTo - Fecha hasta (ISO string)
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Array>} Lista de pedidos
   */
  async findByDateRange(dateFrom, dateTo, options = {}) {
    let query = this.supabase
      .from(this.table)
      .select(
        'id, user_id, customer_email, customer_name, customer_phone, delivery_address, delivery_date, delivery_time_slot, delivery_notes, status, total_amount_usd, total_amount_ves, currency_rate, notes, admin_notes, created_at, updated_at, customer_name_normalized, customer_email_normalized, users(id, email, full_name, phone, role, active, email_verified, created_at, updated_at), order_items(id, order_id, product_id, product_name, product_summary, unit_price_usd, unit_price_ves, quantity, subtotal_usd, subtotal_ves, created_at, updated_at)'
      )
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo)

    if (!options.includeInactive) {
      // No active column in orders table - use status filtering instead
    }

    query = query.order('created_at', { ascending: false })

    // Aplicar límites
    if (options.limit !== undefined) {
      const offset = options.offset || 0
      query = query.range(offset, offset + options.limit - 1)
    }

    const { data, error } = await query

    if (error) {
      throw this.handleError(error, 'findByDateRange', { dateFrom, dateTo, options })
    }

    return data || []
  }

  /**
   * Calcular total de pedido basado en items
   * @param {Array} items - Items del pedido con precios
   * @returns {number} Total calculado
   */
  calculateOrderTotal(items) {
    return items.reduce((total, item) => {
      const price = Number(item.price || 0)
      const quantity = Number(item.quantity || 1)
      const discount = Number(item.discount || 0)

      const itemTotal = price * quantity - discount
      return total + itemTotal
    }, 0)
  }

  /**
   * Buscar pedidos por término
   * @param {string} searchTerm - Término de búsqueda (ID, email, etc.)
   * @param {boolean} includeInactive - Incluir inactivos
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Lista de pedidos
   */
  async searchOrders(searchTerm, includeInactive = false, limit = 50) {
    let query = this.supabase
      .from(this.table)
      .select(
        `
        id, user_id, customer_email, customer_name, customer_phone, delivery_address, delivery_date, delivery_time_slot, delivery_notes, status, total_amount_usd, total_amount_ves, currency_rate, notes, admin_notes, created_at, updated_at, customer_name_normalized, customer_email_normalized,
        users!inner(email, full_name),
        order_items(id, order_id, product_id, product_name, product_summary, unit_price_usd, unit_price_ves, quantity, subtotal_usd, subtotal_ves, created_at, updated_at)
      `
      )
      .or(
        `id.ilike.%${searchTerm}%,users.email.ilike.%${searchTerm}%,users.full_name.ilike.%${searchTerm}%`
      )

    if (!includeInactive) {
      // No active column in orders table - use status filtering instead
    }

    query = query.limit(limit).order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      throw this.handleError(error, 'searchOrders', { searchTerm, includeInactive, limit })
    }

    return data || []
  }

  /**
   * Cancelar pedido
   * @param {number} id - ID del pedido
   * @param {string} reason - Razón de cancelación
   * @returns {Promise<Object>} Pedido cancelado
   */
  async cancel(id, reason) {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw this.handleError(error, 'cancel', { id, reason })
    }

    return data
  }

  /**
   * Obtener historial de estados de un pedido
   * @param {number} orderId - ID del pedido
   * @returns {Promise<Array>} Historial de estados
   */
  async findStatusHistoryByOrderId(orderId) {
    const { data, error } = await this.supabase
      .from(DB_SCHEMA.order_status_history.table)
      .select('id, order_id, old_status, new_status, notes, changed_by, created_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })

    if (error) {
      throw this.handleError(error, 'findStatusHistoryByOrderId', { orderId })
    }

    return data || []
  }
}

/**
 * Factory function to create OrderRepository instance
 * @param {Object} supabaseClient - Supabase client
 * @returns {OrderRepository} Repository instance
 */
export function createOrderRepository(supabaseClient = null) {
  return new OrderRepository(supabaseClient)
}
