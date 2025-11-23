/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Base Repository
 * Proporciona operaciones CRUD comunes para todas las entidades
 * Implementa el patrón Repository para abstraer acceso a datos
 * @abstract
 */

import { NotFoundError, ConflictError } from '../errors/AppError.js'

export class BaseRepository {
  /**
   * @param {Object} supabaseClient - Cliente de Supabase
   * @param {string} tableName - Nombre de la tabla
   */
  constructor(supabaseClient, tableName) {
    this.supabase = supabaseClient
    this.table = tableName
  }

  /**
   * Crear nuevo registro
   * @param {Object} data - Datos del registro
   * @returns {Promise<Object>} Registro creado
   */
  async create(data) {
    const { data: result, error } = await this.supabase
      .from(this.table)
      .insert(data)
      .select()
      .single()

    if (error) {
      throw this.handleError(error, 'create')
    }

    return result
  }

  /**
   * Obtener registro por ID
   * @param {number} id - ID del registro
   * @param {boolean} includeInactive - Incluir registros inactivos
   * @returns {Promise<Object>} Registro encontrado
   * @note ASSUMES table has 'active' column. Override in repositories where this doesn't apply.
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
   * Obtener todos los registros con filtros opcionales
   * @param {Object} filters - Filtros a aplicar
   * @param {Object} options - Opciones adicionales (orden, límites)
   * @returns {Promise<Array>} Lista de registros
   */
  async findAll(filters = {}, options = {}) {
    let query = this.supabase.from(this.table).select('*')

    // Aplicar filtros
    if (filters.role) {
      query = query.eq('role', filters.role)
    }

    if (filters.email_verified !== undefined) {
      query = query.eq('email_verified', filters.email_verified)
    }

    if (filters.search) {
      query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`)
    }

    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }

    // Incluir inactivos solo si se especifica explícitamente
    // @note ASSUMES 'active' column exists
    if (!filters.includeDeactivated) {
      query = query.eq('active', true)
    }

    // Aplicar ordenamiento
    const orderBy = options.orderBy || 'created_at'
    query = query.order(orderBy, { ascending: options.ascending || false })

    // Aplicar límites
    if (options.limit !== undefined) {
      const offset = options.offset || 0
      query = query.range(offset, offset + options.limit - 1)
    }

    const { data, error } = await query

    if (error) {
      throw this.handleError(error, 'findAll', { filters, options })
    }

    return data || []
  }

  /**
   * Actualizar registro por ID
   * @param {number} id - ID del registro
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Registro actualizado
   */
  async update(id, data) {
    const { data: result, error } = await this.supabase
      .from(this.table)
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw this.handleError(error, 'update', { id, data })
    }

    return result
  }

  /**
   * Soft delete (marcar como inactivo)
   * @param {number} id - ID del registro
   * @param {Object} auditInfo - Información de auditoría
   * @returns {Promise<Object>} Registro eliminado
   * @note ASSUMES 'active' column exists
   */
  async delete(id, auditInfo = {}) {
    const updateData = {
      active: false,
      deleted_at: new Date().toISOString(),
      deleted_by: auditInfo.deletedBy || null,
      deletion_reason: auditInfo.reason || 'Not specified',
      deletion_ip: auditInfo.ipAddress || null
    }

    const { data, error } = await this.supabase
      .from(this.table)
      .update(updateData)
      .eq('id', id)
      .eq('active', true)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError(`${this.table} not found`, { table: this.table })
      }
      throw this.handleError(error, 'delete', { id, auditInfo })
    }

    return data
  }

  /**
   * Reactivar registro soft-deleted
   * @param {number} id - ID del registro
   * @param {number} reactivatedBy - ID del usuario que reactiva
   * @returns {Promise<Object>} Registro reactivado
   * @note ASSUMES 'active' column exists
   */
  async reactivate(id, reactivatedBy = null) {
    const updateData = {
      active: true,
      deleted_at: null,
      deleted_by: null,
      deletion_reason: null,
      deletion_ip: null,
      reactivated_at: new Date().toISOString(),
      reactivated_by: reactivatedBy
    }

    const { data, error } = await this.supabase
      .from(this.table)
      .update(updateData)
      .eq('id', id)
      .eq('active', false)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ConflictError(`${this.table} already active`, { table: this.table })
      }
      throw this.handleError(error, 'reactivate', { id, reactivatedBy })
    }

    return data
  }

  /**
   * Verificar si existe un registro
   * @param {Object} criteria - Criterios de búsqueda
   * @returns {Promise<boolean>} True si existe
   */
  async exists(criteria) {
    let query = this.supabase.from(this.table).select('id', { count: 'exact', head: true })

    Object.keys(criteria).forEach(key => {
      query = query.eq(key, criteria[key])
    })

    const { count, error } = await query

    if (error) {
      throw this.handleError(error, 'exists', { criteria })
    }

    return count > 0
  }

  /**
   * Contar registros con filtros
   * @param {Object} filters - Filtros a aplicar
   * @returns {Promise<number>} Número de registros
   */
  async count(filters = {}) {
    let query = this.supabase.from(this.table).select('*', { count: 'exact', head: true })

    Object.keys(filters).forEach(key => {
      query = query.eq(key, filters[key])
    })

    const { count, error } = await query

    if (error) {
      throw this.handleError(error, 'count', { filters })
    }

    return count
  }

  /**
   * Manejar errores de Supabase
   * @param {Object} error - Error de Supabase
   * @param {string} operation - Operación que falló
   * @param {Object} context - Contexto adicional
   * @returns {Error} Error formateado
   */
  handleError(error, operation, context = {}) {
    console.error(`[${this.table} Repository] Error in ${operation}:`, error, context)

    // Personalizar mensajes de error según el código
    if (error.code === '23505') {
      // Unique violation
      return new Error(`Duplicate entry in ${this.table}: ${error.message}`)
    }

    if (error.code === '23503') {
      // Foreign key violation
      return new Error(`Referenced record not found in ${this.table}: ${error.message}`)
    }

    if (error.code === '23502') {
      // Not null violation
      return new Error(`Required field missing in ${this.table}: ${error.message}`)
    }

    // Error genérico
    return new Error(`Database error in ${this.table}.${operation}: ${error.message}`)
  }
}
