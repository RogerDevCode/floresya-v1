/**
 * Base Repository - Soft Delete Operations
 * Handles soft-delete and reactivation operations
 * LEGACY: Modularizado desde BaseRepository.js (WEEK 4)
 */

import { BaseRepository, NotFoundError } from './BaseRepository.helpers.js'

/**
 * Extend BaseRepository with soft-delete operations
 */
export class BaseRepositoryWithSoftDelete extends BaseRepository {
  /**
   * Soft delete (mark as inactive)
   * @param {number} id - Record ID
   * @param {Object} auditInfo - Audit information
   * @returns {Promise<Object>} Deleted record
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
   * Reactivate soft-deleted record
   * @param {number} id - Record ID
   * @param {number} reactivatedBy - User ID who reactivates
   * @returns {Promise<Object>} Reactivated record
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
}
