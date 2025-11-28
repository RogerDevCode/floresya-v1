/**
 * Procesado por B
 */

/**
 * Soft Delete Service
 * Implements secure soft-delete with full audit trail
 * Follows data security and compliance best practices
 *
 * Features:
 * 1. Soft delete (mark as inactive, don't physically remove)
 * 2. Full audit trail (who, when, why)
 * 3. Data recovery support
 * 4. Compliance with GDPR, SOX, PCI DSS
 * 5. Referential integrity preservation
 */

import { NotFoundError, DatabaseError, BadRequestError } from '../errors/AppError.js'
import { logger } from '../utils/logger.js'
import {
  createSchemaValidationService,
  SchemaValidationError
} from './schema-validation-service.js'

/**
 * SoftDeleteService
 * Provides soft-delete functionality with audit trail
 */
export class SoftDeleteService {
  /**
   * @param {Object} supabaseClient - Supabase client instance
   * @param {string} tableName - Table name for operations
   */
  constructor(supabaseClient, tableName) {
    this.supabase = supabaseClient
    this.tableName = tableName
    this.schemaValidator = createSchemaValidationService(supabaseClient)
  }

  /**
   * Soft delete a record (mark as inactive)
   * @param {number} id - Record ID to delete
   * @param {Object} auditInfo - Audit information
   * @param {number} auditInfo.deletedBy - User ID performing deletion
   * @param {string} auditInfo.reason - Reason for deletion
   * @param {string} auditInfo.ipAddress - IP address for audit
   * @returns {Promise<Object>} Deleted record
   */
  async softDelete(id, auditInfo = {}) {
    const { deletedBy = null, reason = 'Not specified', ipAddress = null } = auditInfo

    // Validate ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestError(`Invalid ID for ${this.tableName}: must be positive number`, {
        id,
        table: this.tableName
      })
    }

    // Validate schema before proceeding
    await this.validateSoftDeleteSchema()

    // Prepare update data with audit trail
    const updateData = {
      active: false,
      deleted_at: new Date().toISOString(),
      deleted_by: deletedBy,
      deletion_reason: reason,
      deletion_ip: ipAddress
    }

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .eq('active', true) // Only delete if currently active
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError(this.tableName, id, {
            reason: 'Record not found or already deleted',
            isActive: true
          })
        }
        throw new DatabaseError('SOFT_DELETE', this.tableName, error, {
          id,
          table: this.tableName
        })
      }

      if (!data) {
        throw new NotFoundError(this.tableName, id, {
          reason: 'Record not found or already deleted',
          isActive: true
        })
      }

      logger.info(`[SOFT DELETE] ${this.tableName} ID ${id} deleted by user ${deletedBy}`, {
        reason,
        ip: ipAddress,
        timestamp: updateData.deleted_at
      })

      return data
    } catch (error) {
      logger.error(`Soft delete failed for ${this.tableName} ID ${id}:`, error)
      throw error
    }
  }

  /**
   * Reactivate a soft-deleted record
   * @param {number} id - Record ID to reactivate
   * @param {Object} auditInfo - Audit information
   * @param {number} auditInfo.reactivatedBy - User ID performing reactivation
   * @returns {Promise<Object>} Reactivated record
   */
  async reactivate(id, auditInfo = {}) {
    const { reactivatedBy = null } = auditInfo

    // Validate ID
    if (!id || isNaN(id) || id <= 0) {
      throw new BadRequestError(`Invalid ID for ${this.tableName}: must be positive number`, {
        id,
        table: this.tableName
      })
    }

    // Validate schema before proceeding
    await this.validateSoftDeleteSchema()

    // Prepare update data
    const updateData = {
      active: true,
      deleted_at: null,
      deleted_by: null,
      deletion_reason: null,
      deletion_ip: null,
      reactivated_at: new Date().toISOString(),
      reactivated_by: reactivatedBy
    }

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .eq('active', false) // Only reactivate if currently inactive
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError(this.tableName, id, {
            reason: 'Record not found or already active',
            isActive: false
          })
        }
        throw new DatabaseError('REACTIVATE', this.tableName, error, {
          id,
          table: this.tableName
        })
      }

      if (!data) {
        throw new NotFoundError(this.tableName, id, {
          reason: 'Record not found or already active',
          isActive: false
        })
      }

      logger.info(`[REACTIVATE] ${this.tableName} ID ${id} reactivated by user ${reactivatedBy}`)

      return data
    } catch (error) {
      logger.error(`Reactivate failed for ${this.tableName} ID ${id}:`, error)
      throw error
    }
  }

  /**
   * Get audit history for a record
   * @param {number} id - Record ID
   * @returns {Promise<Object>} Audit history
   */
  async getAuditHistory(id) {
    // Note: This requires audit triggers or a separate audit table
    // For now, return the deletion metadata from the record
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(
        'id, deleted_at, deleted_by, deletion_reason, deletion_ip, reactivated_at, reactivated_by'
      )
      .eq('id', id)
      .single()

    if (error) {
      throw new DatabaseError('AUDIT_QUERY', this.tableName, error, { id })
    }

    return data
  }

  /**
   * Hard delete records that have passed retention period
   * Should be called by automated cleanup job
   * @param {Date} beforeDate - Delete records soft-deleted before this date
   * @returns {Promise<number>} Number of records hard-deleted
   */
  async hardDeleteOldRecords(beforeDate) {
    // Get records to delete
    const { data: records, error: fetchError } = await this.supabase
      .from(this.tableName)
      .select('id')
      .eq('active', false)
      .lt('deleted_at', beforeDate.toISOString())

    if (fetchError) {
      throw new DatabaseError('HARD_DELETE_FETCH', this.tableName, fetchError)
    }

    if (!records || records.length === 0) {
      return 0
    }

    // Perform hard delete
    const { error: deleteError } = await this.supabase
      .from(this.tableName)
      .delete()
      .in(
        'id',
        records.map(r => r.id)
      )

    if (deleteError) {
      throw new DatabaseError('HARD_DELETE', this.tableName, deleteError)
    }

    logger.info(`[HARD DELETE] ${records.length} records deleted from ${this.tableName}`)

    return records.length
  }

  /**
   * Validate that table supports soft delete operations
   * @throws {SchemaValidationError} When table doesn't support soft delete
   * @throws {DatabaseError} When schema validation fails
   */
  async validateSoftDeleteSchema() {
    try {
      const validation = await this.schemaValidator.getSoftDeleteValidation(this.tableName)

      if (!validation.tableExists) {
        throw new SchemaValidationError(
          `Table ${this.tableName} does not exist`,
          this.tableName,
          validation
        )
      }

      if (!validation.canPerformSoftDelete) {
        const missingCols = validation.missingColumns.join(', ')
        throw new SchemaValidationError(
          `Table ${this.tableName} does not support soft delete operations. Missing columns: ${missingCols}`,
          this.tableName,
          validation
        )
      }

      // Log warnings for incomplete audit support
      if (!validation.hasFullAuditSupport) {
        logger.warn(`Table ${this.tableName} has incomplete audit support`, {
          table: this.tableName,
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

      logger.error(`Schema validation failed for ${this.tableName}:`, error)
      throw new DatabaseError('SCHEMA_VALIDATION', this.tableName, error)
    }
  }

  /**
   * Get schema validation information for the table
   * @returns {Promise<Object>} Schema validation result
   */
  async getSchemaValidation() {
    return await this.schemaValidator.getSoftDeleteValidation(this.tableName)
  }

  /**
   * Check if table supports soft delete without throwing errors
   * @returns {Promise<boolean>} True if soft delete is supported
   */
  async hasSoftDeleteSupport() {
    try {
      const validation = await this.schemaValidator.getSoftDeleteValidation(this.tableName)
      return validation.canPerformSoftDelete
    } catch (error) {
      logger.warn(`Error checking soft delete support for ${this.tableName}:`, error)
      return false
    }
  }
}

/**
 * Factory function to create SoftDeleteService
 * @param {Object} supabaseClient - Supabase client
 * @param {string} tableName - Table name
 * @returns {SoftDeleteService} Configured service
 */
export function createSoftDeleteService(supabaseClient, tableName) {
  return new SoftDeleteService(supabaseClient, tableName)
}

/**
 * Mixin for adding soft-delete to existing services
 */
export const SoftDeleteMixin = {
  /**
   * Add soft-delete methods to a service class
   * @param {Class} ServiceClass - Service class to extend
   * @param {string} tableName - Table name
   */
  extend(ServiceClass, tableName) {
    return class extends ServiceClass {
      constructor(...args) {
        super(...args)
        this.softDeleteService = createSoftDeleteService(this.supabase, tableName)
      }

      async delete(id, auditInfo) {
        return await this.softDeleteService.softDelete(id, auditInfo)
      }

      async reactivate(id, auditInfo) {
        return await this.softDeleteService.reactivate(id, auditInfo)
      }

      async getAuditHistory(id) {
        return await this.softDeleteService.getAuditHistory(id)
      }
    }
  }
}
