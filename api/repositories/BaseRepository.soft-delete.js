/**
 * Procesado por B
 */

/**
 * Base Repository - Soft Delete Operations
 * Handles soft-delete and reactivation operations
 * LEGACY: Modularizado desde BaseRepository.js (WEEK 4)
 */

import {
  BaseRepository,
  NotFoundError,
  ConflictError,
  DatabaseError
} from './BaseRepository.helpers.js'
import {
  createSchemaValidationService,
  SchemaValidationError
} from '../architecture/schema-validation-service.js'

/**
 * Extend BaseRepository with soft-delete operations
 */
export class BaseRepositoryWithSoftDelete extends BaseRepository {
  /**
   * @param {Object} supabaseClient - Supabase client instance
   * @param {string} tableName - Table name for operations
   */
  constructor(supabaseClient, tableName) {
    super(supabaseClient, tableName)
    this.schemaValidator = createSchemaValidationService(supabaseClient)
  }

  /**
   * Soft delete (mark as inactive)
   * @param {number} id - Record ID
   * @param {Object} auditInfo - Audit information
   * @returns {Promise<Object>} Deleted record
   * @note Validates 'active' column exists before proceeding
   */
  async delete(id, auditInfo = {}) {
    // Validate schema before proceeding
    await this.validateSoftDeleteSchema()
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
   * @note Validates 'active' column exists before proceeding
   */
  async reactivate(id, reactivatedBy = null) {
    // Validate schema before proceeding
    await this.validateSoftDeleteSchema()
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
   * Validate that table supports soft delete operations
   * @throws {SchemaValidationError} When table doesn't support soft delete
   * @throws {DatabaseError} When schema validation fails
   */
  async validateSoftDeleteSchema() {
    try {
      const validation = await this.schemaValidator.getSoftDeleteValidation(this.table)

      if (!validation.tableExists) {
        throw new SchemaValidationError(
          `Table ${this.table} does not exist`,
          this.table,
          validation
        )
      }

      if (!validation.canPerformSoftDelete) {
        const missingCols = validation.missingColumns.join(', ')
        throw new SchemaValidationError(
          `Table ${this.table} does not support soft delete operations. Missing columns: ${missingCols}`,
          this.table,
          validation
        )
      }

      // Log warnings for incomplete audit support
      if (!validation.hasFullAuditSupport) {
        logger.warn(`Table ${this.table} has incomplete audit support`, {
          table: this.table,
          missingAuditColumns: validation.missingColumns.filter(col =>
            ['deleted_at', 'deleted_by', 'deletion_reason', 'deletion_ip'].includes(col)
          ),
          recommendations: validation.recommendations
        })
      }

      return validation
    } catch (error) {
      if (error instanceof SchemaValidationError) {
        throw error
      }

      logger.error(`Schema validation failed for ${this.table}:`, error)
      throw new DatabaseError('SCHEMA_VALIDATION', this.table, error)
    }
  }

  /**
   * Get schema validation information for table
   * @returns {Promise<Object>} Schema validation result
   */
  async getSchemaValidation() {
    return await this.schemaValidator.getSoftDeleteValidation(this.table)
  }

  /**
   * Check if table supports soft delete without throwing errors
   * @returns {Promise<boolean>} True if soft delete is supported
   */
  async hasSoftDeleteSupport() {
    try {
      const validation = await this.schemaValidator.getSoftDeleteValidation(this.table)
      return validation.canPerformSoftDelete
    } catch (error) {
      logger.warn(`Error checking soft delete support for ${this.table}:`, error)
      return false
    }
  }
}
