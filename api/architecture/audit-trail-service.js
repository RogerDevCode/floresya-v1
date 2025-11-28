/**
 * Audit Trail Verification Service
 * Verifies that soft delete operations are properly logged
 * Ensures comprehensive audit trails for compliance
 * Follows CLAUDE.md and claude2.txt requirements for production-ready code
 */

import { DatabaseError } from '../errors/AppError.js'
// import { NotFoundError } from '../errors/AppError.js'
import { logger } from '../utils/logger.js'

/**
 * AuditTrailService
 * Manages and verifies audit trails for soft delete operations
 */
export class AuditTrailService {
  /**
   * @param {Object} supabaseClient - Supabase client instance
   */
  constructor(supabaseClient) {
    this.supabase = supabaseClient
  }

  /**
   * Create audit log entry
   * @param {Object} auditData - Audit information
   * @param {string} auditData.tableName - Table name
   * @param {string} auditData.operation - Operation type (SOFT_DELETE, REACTIVATE)
   * @param {number} auditData.recordId - Record ID
   * @param {Object} auditData.oldData - Previous record state
   * @param {Object} auditData.newData - New record state
   * @param {number} auditData.userId - User who performed operation
   * @param {string} auditData.ipAddress - IP address of operation
   * @returns {Promise<Object>} Created audit entry
   */
  async createAuditEntry(auditData) {
    try {
      const { tableName, operation, recordId, oldData, newData, userId, ipAddress } = auditData

      // Validate required fields
      if (!tableName || !operation || !recordId) {
        throw new Error('Missing required audit fields: tableName, operation, recordId')
      }

      const auditEntry = {
        table_name: tableName,
        operation: operation,
        record_id: recordId,
        old_data: oldData || null,
        new_data: newData || null,
        user_id: userId || null,
        ip_address: ipAddress || null,
        created_at: new Date().toISOString()
      }

      const { data, error } = await this.supabase
        .from('audit_log')
        .insert(auditEntry)
        .select()
        .single()

      if (error) {
        throw new DatabaseError('AUDIT_INSERT', 'audit_log', error, auditData)
      }

      logger.info(`Audit trail entry created: ${operation} on ${tableName}.${recordId}`, {
        auditId: data.id,
        userId,
        ipAddress
      })

      return data
    } catch (error) {
      logger.error('Failed to create audit entry:', error)
      throw error
    }
  }

  /**
   * Get audit history for a record
   * @param {string} tableName - Table name
   * @param {number} recordId - Record ID
   * @returns {Promise<Array>} Array of audit entries
   */
  async getAuditHistory(tableName, recordId) {
    try {
      const { data, error } = await this.supabase
        .from('audit_log')
        .select('*')
        .eq('table_name', tableName)
        .eq('record_id', recordId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new DatabaseError('AUDIT_SELECT', 'audit_log', error, { tableName, recordId })
      }

      return data || []
    } catch (error) {
      logger.error(`Failed to get audit history for ${tableName}.${recordId}:`, error)
      throw error
    }
  }

  /**
   * Get audit history by user
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of audit entries
   */
  async getAuditHistoryByUser(userId, options = {}) {
    try {
      let query = this.supabase.from('audit_log').select('*').eq('user_id', userId)

      // Apply filters
      if (options.tableName) {
        query = query.eq('table_name', options.tableName)
      }

      if (options.operation) {
        query = query.eq('operation', options.operation)
      }

      if (options.dateFrom) {
        query = query.gte('created_at', options.dateFrom)
      }

      if (options.dateTo) {
        query = query.lte('created_at', options.dateTo)
      }

      // Apply ordering and pagination
      query = query.order('created_at', { ascending: false })

      if (options.limit) {
        const offset = options.offset || 0
        query = query.range(offset, offset + options.limit - 1)
      }

      const { data, error } = await query

      if (error) {
        throw new DatabaseError('AUDIT_SELECT', 'audit_log', error, { userId, options })
      }

      return data || []
    } catch (error) {
      logger.error(`Failed to get audit history for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Verify audit trail completeness for a table
   * @param {string} tableName - Table name to verify
   * @returns {Promise<Object>} Verification result
   */
  async verifyAuditTrailCompleteness(tableName) {
    try {
      // Check if audit_log table exists and has records
      const { data: auditExists, error: auditError } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'audit_log')
        .eq('table_schema', 'public')
        .single()

      if (auditError || !auditExists) {
        return {
          tableName,
          auditTableExists: false,
          auditTrailComplete: false,
          issues: ['audit_log table does not exist'],
          recommendations: ['Create audit_log table and triggers']
        }
      }

      // Count soft delete operations in target table
      const { data: softDeletes, error: softDeleteError } = await this.supabase
        .from(tableName)
        .select('id, deleted_at, deleted_by')
        .not('deleted_at', 'is', null)
        .limit(100) // Sample for performance

      if (softDeleteError) {
        throw new DatabaseError('SOFT_DELETE_CHECK', tableName, softDeleteError)
      }

      // Count corresponding audit entries
      const softDeleteIds = softDeletes.map(record => record.id)
      let auditEntries = []

      if (softDeleteIds.length > 0) {
        const { data: auditData, error: auditFetchError } = await this.supabase
          .from('audit_log')
          .select('record_id, operation, created_at')
          .eq('table_name', tableName)
          .eq('operation', 'SOFT_DELETE')
          .in('record_id', softDeleteIds)

        if (auditFetchError) {
          throw new DatabaseError('AUDIT_CHECK', 'audit_log', auditFetchError)
        }

        auditEntries = auditData || []
      }

      // Calculate completeness
      const totalSoftDeletes = softDeleteIds.length
      const totalAuditEntries = auditEntries.length
      const completenessPercentage =
        totalSoftDeletes > 0 ? (totalAuditEntries / totalSoftDeletes) * 100 : 100

      const issues = []
      const recommendations = []

      if (completenessPercentage < 100) {
        issues.push(
          `${totalSoftDeletes - totalAuditEntries} soft delete operations lack audit entries`
        )
        recommendations.push('Check audit triggers and ensure they fire correctly')
      }

      if (totalSoftDeletes === 0) {
        recommendations.push('No soft delete operations found to verify')
      }

      return {
        tableName,
        auditTableExists: true,
        auditTrailComplete: completenessPercentage >= 95, // 95% threshold
        completenessPercentage: Math.round(completenessPercentage),
        totalSoftDeletes,
        totalAuditEntries,
        missingAuditEntries: totalSoftDeletes - totalAuditEntries,
        issues,
        recommendations,
        sampleSize: Math.min(totalSoftDeletes, 100)
      }
    } catch (error) {
      logger.error(`Error verifying audit trail completeness for ${tableName}:`, error)
      return {
        tableName,
        auditTableExists: false,
        auditTrailComplete: false,
        issues: [`Error during verification: ${error.message}`],
        recommendations: ['Check database permissions and table structure']
      }
    }
  }

  /**
   * Verify audit trail completeness across all tables
   * @returns {Promise<Object>} Comprehensive verification result
   */
  async verifyAllAuditTrails() {
    try {
      const tablesToVerify = [
        'products',
        'orders',
        'payments',
        'users',
        'order_items',
        'expenses',
        'occasions',
        'payment_methods',
        'settings',
        'product_images'
      ]

      const results = {
        summary: {
          totalTables: tablesToVerify.length,
          completeTables: 0,
          incompleteTables: 0,
          overallCompleteness: 0,
          timestamp: new Date().toISOString()
        },
        tables: {},
        issues: [],
        recommendations: []
      }

      let totalCompleteness = 0

      for (const tableName of tablesToVerify) {
        const verification = await this.verifyAuditTrailCompleteness(tableName)
        results.tables[tableName] = verification

        if (verification.auditTrailComplete) {
          results.summary.completeTables++
        } else {
          results.summary.incompleteTables++
          results.issues.push(...verification.issues)
        }

        totalCompleteness += verification.completenessPercentage
      }

      results.summary.overallCompleteness = Math.round(totalCompleteness / tablesToVerify.length)

      // Generate overall recommendations
      if (results.summary.incompleteTables > 0) {
        results.recommendations.push({
          priority: 'HIGH',
          type: 'AUDIT_TRAIL_INCOMPLETE',
          description: `${results.summary.incompleteTables} tables have incomplete audit trails`,
          action: 'Review and fix audit triggers for affected tables'
        })
      }

      if (results.summary.overallCompleteness < 95) {
        results.recommendations.push({
          priority: 'MEDIUM',
          type: 'AUDIT_COVERAGE_LOW',
          description: `Overall audit trail completeness is ${results.summary.overallCompleteness}%`,
          action: 'Implement comprehensive audit monitoring and alerts'
        })
      }

      return results
    } catch (error) {
      logger.error('Error verifying all audit trails:', error)
      throw error
    }
  }

  /**
   * Get audit trail statistics
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Audit statistics
   */
  async getAuditStatistics(options = {}) {
    try {
      let query = this.supabase.from('audit_log').select('*')

      // Apply date filters
      if (options.dateFrom) {
        query = query.gte('created_at', options.dateFrom)
      }

      if (options.dateTo) {
        query = query.lte('created_at', options.dateTo)
      }

      const { data, error } = await query

      if (error) {
        throw new DatabaseError('AUDIT_SELECT', 'audit_log', error, options)
      }

      const auditRecords = data || []

      // Calculate statistics
      const stats = {
        totalOperations: auditRecords.length,
        operationsByType: {},
        operationsByTable: {},
        operationsByUser: {},
        timeRange: {
          earliest: null,
          latest: null
        },
        recentActivity: auditRecords.slice(0, 10) // Last 10 operations
      }

      auditRecords.forEach(record => {
        // Count by operation type
        stats.operationsByType[record.operation] =
          (stats.operationsByType[record.operation] || 0) + 1

        // Count by table
        stats.operationsByTable[record.table_name] =
          (stats.operationsByTable[record.table_name] || 0) + 1

        // Count by user
        if (record.user_id) {
          stats.operationsByUser[record.user_id] = (stats.operationsByUser[record.user_id] || 0) + 1
        }

        // Track time range
        if (!stats.timeRange.earliest || record.created_at < stats.timeRange.earliest) {
          stats.timeRange.earliest = record.created_at
        }
        if (!stats.timeRange.latest || record.created_at > stats.timeRange.latest) {
          stats.timeRange.latest = record.created_at
        }
      })

      return stats
    } catch (error) {
      logger.error('Error getting audit statistics:', error)
      throw error
    }
  }

  /**
   * Create comprehensive audit report
   * @param {Object} options - Report options
   * @returns {Promise<Object>} Comprehensive audit report
   */
  async createAuditReport(options = {}) {
    try {
      const [allTrails, statistics] = await Promise.all([
        this.verifyAllAuditTrails(),
        this.getAuditStatistics(options)
      ])

      return {
        summary: {
          generatedAt: new Date().toISOString(),
          overallHealth:
            allTrails.summary.overallCompleteness >= 95 ? 'HEALTHY' : 'NEEDS_ATTENTION',
          totalTables: allTrails.summary.totalTables,
          completeTables: allTrails.summary.completeTables,
          overallCompleteness: allTrails.summary.overallCompleteness
        },
        trailVerification: allTrails,
        statistics,
        compliance: {
          gdpr: {
            compliant: allTrails.summary.overallCompleteness >= 90,
            score: Math.min(allTrails.summary.overallCompleteness, 100),
            requirements: ['Right to erasure tracking', 'Data processing records', 'Audit trail']
          },
          sox: {
            compliant: allTrails.summary.overallCompleteness >= 85,
            score: Math.min(allTrails.summary.overallCompleteness, 100),
            requirements: ['Change management', 'Access controls', 'Audit controls']
          }
        },
        recommendations: allTrails.recommendations
      }
    } catch (error) {
      logger.error('Error creating audit report:', error)
      throw error
    }
  }

  /**
   * Clean up old audit records
   * @param {Date} cutoffDate - Delete records older than this date
   * @returns {Promise<number>} Number of records deleted
   */
  async cleanupOldAuditRecords(cutoffDate) {
    try {
      const { data, error } = await this.supabase
        .from('audit_log')
        .delete()
        .lt('created_at', cutoffDate.toISOString())

      if (error) {
        throw new DatabaseError('AUDIT_CLEANUP', 'audit_log', error, { cutoffDate })
      }

      const deletedCount = Array.isArray(data) ? data.length : 0

      logger.info(`Cleaned up ${deletedCount} old audit records`, {
        cutoffDate: cutoffDate.toISOString(),
        deletedCount
      })

      return deletedCount
    } catch (error) {
      logger.error('Error cleaning up old audit records:', error)
      throw error
    }
  }
}

/**
 * Factory function to create AuditTrailService
 * @param {Object} supabaseClient - Supabase client
 * @returns {AuditTrailService} Configured service
 */
export function createAuditTrailService(supabaseClient) {
  return new AuditTrailService(supabaseClient)
}
