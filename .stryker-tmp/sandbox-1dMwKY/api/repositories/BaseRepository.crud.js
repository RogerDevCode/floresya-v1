/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Base Repository - CRUD Operations
 * Handles basic Create, Read, Update operations
 * LEGACY: Modularizado desde BaseRepository.js (WEEK 4)
 */

import { BaseRepository } from './BaseRepository.helpers.js'

/**
 * Extend BaseRepository with CRUD operations
 */
export class BaseRepositoryWithCRUD extends BaseRepository {
  /**
   * Create new record
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record
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
   * Find record by ID
   * @param {number} id - Record ID
   * @param {boolean} includeInactive - Include inactive records
   * @returns {Promise<Object>} Found record
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
   * Find all records with optional filters
   * @param {Object} filters - Filters to apply
   * @param {Object} options - Additional options (order, limits)
   * @returns {Promise<Array>} List of records
   */
  async findAll(filters = {}, options = {}) {
    let query = this.supabase.from(this.table).select('*')

    // Apply filters
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

    // Include inactive only if explicitly specified
    // @note ASSUMES 'active' column exists
    if (!filters.includeDeactivated) {
      query = query.eq('active', true)
    }

    // Apply ordering
    const orderBy = options.orderBy || 'created_at'
    query = query.order(orderBy, { ascending: options.ascending || false })

    // Apply limits
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
   * Update record by ID
   * @param {number} id - Record ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} Updated record
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
}
