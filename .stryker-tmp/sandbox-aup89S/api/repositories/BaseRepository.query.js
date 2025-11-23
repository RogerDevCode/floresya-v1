/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Base Repository - Query Operations
 * Handles existence checks and counting operations
 * LEGACY: Modularizado desde BaseRepository.js (WEEK 4)
 */

import { BaseRepository } from './BaseRepository.helpers.js'

/**
 * Extend BaseRepository with query operations
 */
export class BaseRepositoryWithQuery extends BaseRepository {
  /**
   * Check if a record exists
   * @param {Object} criteria - Search criteria
   * @returns {Promise<boolean>} True if exists
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
   * Count records with filters
   * @param {Object} filters - Filters to apply
   * @returns {Promise<number>} Number of records
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
}
