/**
 * Schema Validation Service
 * Validates database schema before performing soft delete operations
 * Ensures all required columns exist before attempting operations
 * Follows CLAUDE.md and claude2.txt requirements for production-ready code
 */

import { DatabaseError } from '../errors/AppError.js'
import { logger } from '../utils/logger.js'

/**
 * SchemaValidationService
 * Validates database schema for soft delete operations
 */
export class SchemaValidationService {
  /**
   * @param {Object} supabaseClient - Supabase client instance
   */
  constructor(supabaseClient) {
    this.supabase = supabaseClient
    this.schemaCache = new Map()
  }

  /**
   * Check if table has soft delete support (active column)
   * @param {string} tableName - Table name to check
   * @returns {Promise<boolean>} True if table supports soft delete
   */
  async hasSoftDeleteSupport(tableName) {
    try {
      // Check cache first
      if (this.schemaCache.has(tableName)) {
        return this.schemaCache.get(tableName)
      }

      // Query information_schema to check for active column
      const { data, error } = await this.supabase
        .from('information_schema.columns')
        .select('column_name, data_type, column_default')
        .eq('table_name', tableName)
        .eq('table_schema', 'public')
        .eq('column_name', 'active')

      if (error) {
        logger.error(`Schema validation failed for table ${tableName}:`, error)
        throw new DatabaseError('SCHEMA_VALIDATION', tableName, error)
      }

      const hasActiveColumn = data && data.length > 0

      // Cache the result
      this.schemaCache.set(tableName, hasActiveColumn)

      logger.debug(`Schema validation: ${tableName} has soft delete support: ${hasActiveColumn}`)
      return hasActiveColumn
    } catch (error) {
      logger.error(`Error checking soft delete support for ${tableName}:`, error)
      throw error
    }
  }

  /**
   * Validate soft delete columns exist
   * @param {string} tableName - Table name to validate
   * @returns {Promise<Object>} Validation result with column information
   */
  async validateSoftDeleteColumns(tableName) {
    try {
      // Check for all soft delete related columns
      const { data, error } = await this.supabase
        .from('information_schema.columns')
        .select('column_name, data_type, column_default, is_nullable')
        .eq('table_name', tableName)
        .eq('table_schema', 'public')
        .in('column_name', [
          'active',
          'deleted_at',
          'deleted_by',
          'deletion_reason',
          'deletion_ip',
          'reactivated_at',
          'reactivated_by'
        ])

      if (error) {
        throw new DatabaseError('SCHEMA_VALIDATION', tableName, error)
      }

      const columns = data || []
      const requiredColumns = ['active']
      const auditColumns = ['deleted_at', 'deleted_by', 'deletion_reason', 'deletion_ip']
      const reactivateColumns = ['reactivated_at', 'reactivated_by']

      const validation = {
        tableName,
        hasBasicSoftDelete: false,
        hasFullAuditSupport: false,
        hasReactivationSupport: false,
        missingColumns: [],
        existingColumns: columns.map(col => col.column_name),
        columnDetails: columns.reduce((acc, col) => {
          acc[col.column_name] = {
            dataType: col.data_type,
            defaultValue: col.column_default,
            nullable: col.is_nullable === 'YES'
          }
          return acc
        }, {})
      }

      // Check basic soft delete support
      validation.hasBasicSoftDelete = requiredColumns.every(col =>
        validation.existingColumns.includes(col)
      )

      // Check full audit support
      validation.hasFullAuditSupport = auditColumns.every(col =>
        validation.existingColumns.includes(col)
      )

      // Check reactivation support
      validation.hasReactivationSupport = reactivateColumns.every(col =>
        validation.existingColumns.includes(col)
      )

      // Identify missing columns
      const allExpectedColumns = [...requiredColumns, ...auditColumns, ...reactivateColumns]
      validation.missingColumns = allExpectedColumns.filter(
        col => !validation.existingColumns.includes(col)
      )

      return validation
    } catch (error) {
      logger.error(`Error validating soft delete columns for ${tableName}:`, error)
      throw error
    }
  }

  /**
   * Validate table exists
   * @param {string} tableName - Table name to check
   * @returns {Promise<boolean>} True if table exists
   */
  async tableExists(tableName) {
    try {
      const { data, error } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', tableName)
        .eq('table_schema', 'public')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return false // Table not found
        }
        throw new DatabaseError('TABLE_CHECK', tableName, error)
      }

      return !!data
    } catch (error) {
      logger.error(`Error checking if table ${tableName} exists:`, error)
      throw error
    }
  }

  /**
   * Get comprehensive schema validation for soft delete operations
   * @param {string} tableName - Table name to validate
   * @returns {Promise<Object>} Comprehensive validation result
   */
  async getSoftDeleteValidation(tableName) {
    try {
      const tableExists = await this.tableExists(tableName)

      if (!tableExists) {
        return {
          tableName,
          tableExists: false,
          hasSoftDeleteSupport: false,
          canPerformSoftDelete: false,
          canPerformHardDelete: false,
          error: `Table ${tableName} does not exist`
        }
      }

      const columnValidation = await this.validateSoftDeleteColumns(tableName)
      const hasActiveColumn = await this.hasSoftDeleteSupport(tableName)

      return {
        tableName,
        tableExists: true,
        hasSoftDeleteSupport: hasActiveColumn,
        hasBasicSoftDelete: columnValidation.hasBasicSoftDelete,
        hasFullAuditSupport: columnValidation.hasFullAuditSupport,
        hasReactivationSupport: columnValidation.hasReactivationSupport,
        canPerformSoftDelete: columnValidation.hasBasicSoftDelete,
        canPerformHardDelete: true, // Always can hard delete if table exists
        missingColumns: columnValidation.missingColumns,
        existingColumns: columnValidation.existingColumns,
        columnDetails: columnValidation.columnDetails,
        recommendations: this.generateRecommendations(columnValidation)
      }
    } catch (error) {
      logger.error(`Error getting soft delete validation for ${tableName}:`, error)
      throw error
    }
  }

  /**
   * Generate recommendations based on schema validation
   * @param {Object} validation - Column validation result
   * @returns {Array<Array>} Array of recommendations with priority and description
   */
  generateRecommendations(validation) {
    const recommendations = []

    if (!validation.hasBasicSoftDelete) {
      recommendations.push({
        priority: 'HIGH',
        type: 'SOFT_DELETE_BASIC',
        description: 'Add basic soft delete support by adding active column',
        sql: this.generateAddActiveColumnSQL(validation.tableName)
      })
    }

    if (!validation.hasFullAuditSupport && validation.hasBasicSoftDelete) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'SOFT_DELETE_AUDIT',
        description: 'Add full audit trail support for compliance',
        sql: this.generateAuditColumnsSQL(validation.tableName, validation.missingColumns)
      })
    }

    if (!validation.hasReactivationSupport && validation.hasBasicSoftDelete) {
      recommendations.push({
        priority: 'LOW',
        type: 'SOFT_DELETE_REACTIVATE',
        description: 'Add reactivation support for data recovery',
        sql: this.generateReactivationColumnsSQL(validation.tableName, validation.missingColumns)
      })
    }

    return recommendations
  }

  /**
   * Generate SQL for adding active column
   * @param {string} tableName - Table name
   * @returns {string} SQL statement
   */
  generateAddActiveColumnSQL(tableName) {
    return `-- Add soft delete support to ${tableName}
ALTER TABLE public.${tableName} 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true NOT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_${tableName}_active ON public.${tableName}(active) WHERE active = true;

-- Update RLS policies if needed
-- Note: Review existing RLS policies to include active = true condition`
  }

  /**
   * Generate SQL for adding audit columns
   * @param {string} tableName - Table name
   * @param {Array} missingColumns - Array of missing column names
   * @returns {string} SQL statements
   */
  generateAuditColumnsSQL(tableName, missingColumns) {
    const auditSQL = []

    if (missingColumns.includes('deleted_at')) {
      auditSQL.push(
        `ALTER TABLE public.${tableName} ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;`
      )
    }

    if (missingColumns.includes('deleted_by')) {
      auditSQL.push(`ALTER TABLE public.${tableName} ADD COLUMN IF NOT EXISTS deleted_by INTEGER;`)
    }

    if (missingColumns.includes('deletion_reason')) {
      auditSQL.push(
        `ALTER TABLE public.${tableName} ADD COLUMN IF NOT EXISTS deletion_reason TEXT;`
      )
    }

    if (missingColumns.includes('deletion_ip')) {
      auditSQL.push(`ALTER TABLE public.${tableName} ADD COLUMN IF NOT EXISTS deletion_ip TEXT;`)
    }

    return `-- Add audit trail support to ${tableName}
${auditSQL.join('\n')}

-- Create index for deleted_at for performance
CREATE INDEX IF NOT EXISTS idx_${tableName}_deleted_at ON public.${tableName}(deleted_at) WHERE deleted_at IS NOT NULL;`
  }

  /**
   * Generate SQL for adding reactivation columns
   * @param {string} tableName - Table name
   * @param {Array} missingColumns - Array of missing column names
   * @returns {string} SQL statements
   */
  generateReactivationColumnsSQL(tableName, missingColumns) {
    const reactivateSQL = []

    if (missingColumns.includes('reactivated_at')) {
      reactivateSQL.push(
        `ALTER TABLE public.${tableName} ADD COLUMN IF NOT EXISTS reactivated_at TIMESTAMP WITH TIME ZONE;`
      )
    }

    if (missingColumns.includes('reactivated_by')) {
      reactivateSQL.push(
        `ALTER TABLE public.${tableName} ADD COLUMN IF NOT EXISTS reactivated_by INTEGER;`
      )
    }

    return `-- Add reactivation support to ${tableName}
${reactivateSQL.join('\n')}

-- Create index for reactivated_at for performance
CREATE INDEX IF NOT EXISTS idx_${tableName}_reactivated_at ON public.${tableName}(reactivated_at) WHERE reactivated_at IS NOT NULL;`
  }

  /**
   * Clear schema cache
   * @param {string} [tableName] - Specific table to clear, or clear all if not provided
   */
  clearCache(tableName = null) {
    if (tableName) {
      this.schemaCache.delete(tableName)
      logger.debug(`Cleared schema cache for ${tableName}`)
    } else {
      this.schemaCache.clear()
      logger.debug('Cleared all schema cache')
    }
  }

  /**
   * Get cached schema information
   * @param {string} tableName - Table name
   * @returns {boolean|null} Cached value or null if not cached
   */
  getCachedSchema(tableName) {
    return this.schemaCache.get(tableName) || null
  }
}

/**
 * Factory function to create SchemaValidationService
 * @param {Object} supabaseClient - Supabase client
 * @returns {SchemaValidationService} Configured service
 */
export function createSchemaValidationService(supabaseClient) {
  return new SchemaValidationService(supabaseClient)
}

/**
 * Validation error for schema operations
 */
export class SchemaValidationError extends Error {
  constructor(message, tableName, validationDetails = {}) {
    super(message)
    this.name = 'SchemaValidationError'
    this.tableName = tableName
    this.validationDetails = validationDetails
  }
}
