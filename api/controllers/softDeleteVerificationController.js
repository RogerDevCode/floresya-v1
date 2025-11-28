/**
 * Soft Delete Verification Controller
 * Provides endpoints for verifying soft delete implementation
 * Ensures schema validation and audit trail compliance
 * Follows CLAUDE.md and claude2.txt requirements for production-ready code
 */

import { asyncHandler } from '../middleware/error/index.js'
import { createSchemaValidationService } from '../architecture/schema-validation-service.js'
import { createEntityCoverageService } from '../architecture/entity-coverage-service.js'
import { createAuditTrailService } from '../architecture/audit-trail-service.js'
import { logger } from '../utils/logger.js'

/**
 * Soft Delete Verification Controller
 * Endpoints for comprehensive soft delete verification
 */
class SoftDeleteVerificationController {
  /**
   * @param {Object} supabaseClient - Supabase client instance
   */
  constructor(supabaseClient) {
    this.supabase = supabaseClient
    this.schemaValidator = createSchemaValidationService(supabaseClient)
    this.entityCoverage = createEntityCoverageService(supabaseClient)
    this.auditTrail = createAuditTrailService(supabaseClient)
  }

  /**
   * Verify soft delete schema for specific table
   * GET /api/admin/soft-delete/verify/:tableName
   */
  verifyTableSchema = asyncHandler(async (req, res) => {
    const { tableName } = req.params

    if (!tableName) {
      return res.status(400).json({
        error: 'Table name is required',
        code: 'MISSING_TABLE_NAME'
      })
    }

    try {
      const validation = await this.schemaValidator.getSoftDeleteValidation(tableName)

      res.json({
        success: true,
        data: validation,
        recommendations: validation.recommendations || []
      })
    } catch (error) {
      logger.error(`Schema verification failed for ${tableName}:`, error)
      res.status(500).json({
        error: 'Schema verification failed',
        details: error.message,
        code: 'SCHEMA_VERIFICATION_ERROR'
      })
    }
  })

  /**
   * Get comprehensive entity coverage report
   * GET /api/admin/soft-delete/coverage
   */
  getEntityCoverage = asyncHandler(async (req, res) => {
    try {
      const coverage = await this.entityCoverage.verifySoftDeleteCoverage()
      const summary = await this.entityCoverage.getCoverageSummary()

      res.json({
        success: true,
        data: {
          detailed: coverage,
          summary
        }
      })
    } catch (error) {
      logger.error('Entity coverage verification failed:', error)
      res.status(500).json({
        error: 'Entity coverage verification failed',
        details: error.message,
        code: 'COVERAGE_VERIFICATION_ERROR'
      })
    }
  })

  /**
   * Get audit trail verification
   * GET /api/admin/soft-delete/audit-verification
   */
  getAuditVerification = asyncHandler(async (req, res) => {
    try {
      const auditVerification = await this.auditTrail.verifyAllAuditTrails()
      const auditStatistics = await this.auditTrail.getAuditStatistics()

      res.json({
        success: true,
        data: {
          verification: auditVerification,
          statistics: auditStatistics
        }
      })
    } catch (error) {
      logger.error('Audit verification failed:', error)
      res.status(500).json({
        error: 'Audit verification failed',
        details: error.message,
        code: 'AUDIT_VERIFICATION_ERROR'
      })
    }
  })

  /**
   * Get comprehensive soft delete health report
   * GET /api/admin/soft-delete/health
   */
  getHealthReport = asyncHandler(async (req, res) => {
    try {
      const [coverage, auditReport] = await Promise.all([
        this.entityCoverage.verifySoftDeleteCoverage(),
        this.auditTrail.createAuditReport()
      ])

      // Calculate overall health score
      const healthScore = this.calculateHealthScore(coverage, auditReport)

      res.json({
        success: true,
        data: {
          health: {
            score: healthScore,
            status: this.getHealthStatus(healthScore),
            lastChecked: new Date().toISOString()
          },
          coverage,
          auditTrail: auditReport,
          recommendations: this.generateHealthRecommendations(coverage, auditReport, healthScore)
        }
      })
    } catch (error) {
      logger.error('Health report generation failed:', error)
      res.status(500).json({
        error: 'Health report generation failed',
        details: error.message,
        code: 'HEALTH_REPORT_ERROR'
      })
    }
  })

  /**
   * Get soft delete statistics
   * GET /api/admin/soft-delete/statistics
   */
  getStatistics = asyncHandler(async (req, res) => {
    try {
      const { dateFrom, dateTo } = req.query

      const [auditStats, coverage] = await Promise.all([
        this.auditTrail.getAuditStatistics({ dateFrom, dateTo }),
        this.entityCoverage.getCoverageSummary()
      ])

      res.json({
        success: true,
        data: {
          audit: auditStats,
          coverage,
          queryParameters: { dateFrom, dateTo }
        }
      })
    } catch (error) {
      logger.error('Statistics retrieval failed:', error)
      res.status(500).json({
        error: 'Statistics retrieval failed',
        details: error.message,
        code: 'STATISTICS_ERROR'
      })
    }
  })

  /**
   * Validate all tables for soft delete support
   * POST /api/admin/soft-delete/validate-all
   */
  validateAllTables = asyncHandler(async (req, res) => {
    try {
      const tables = [
        'products',
        'orders',
        'payments',
        'users',
        'order_items',
        'occasions',
        'payment_methods',
        'settings',
        'product_images',
        'expenses',
        'busquedas_log',
        'query_timeouts_log'
      ]

      const validationPromises = tables.map(async tableName => {
        try {
          const validation = await this.schemaValidator.getSoftDeleteValidation(tableName)
          return {
            tableName,
            success: true,
            validation
          }
        } catch (error) {
          return {
            tableName,
            success: false,
            error: error.message
          }
        }
      })

      const results = await Promise.all(validationPromises)

      const summary = {
        totalTables: tables.length,
        validTables: results.filter(r => r.success).length,
        invalidTables: results.filter(r => !r.success).length,
        tablesWithSoftDelete: results.filter(r => r.success && r.validation.canPerformSoftDelete)
          .length
      }

      res.json({
        success: true,
        data: {
          summary,
          tables: results
        }
      })
    } catch (error) {
      logger.error('Table validation failed:', error)
      res.status(500).json({
        error: 'Table validation failed',
        details: error.message,
        code: 'TABLE_VALIDATION_ERROR'
      })
    }
  })

  /**
   * Get migration recommendations
   * GET /api/admin/soft-delete/migration-recommendations
   */
  getMigrationRecommendations = asyncHandler(async (req, res) => {
    try {
      const coverage = await this.entityCoverage.verifySoftDeleteCoverage()
      const recommendations = []

      // Generate SQL for missing columns
      for (const [tableName, validation] of Object.entries(coverage.entities)) {
        if (validation.missingColumns && validation.missingColumns.length > 0) {
          const sql = this.generateMigrationSQL(tableName, validation.missingColumns)
          recommendations.push({
            tableName,
            priority: validation.critical ? 'CRITICAL' : 'HIGH',
            missingColumns: validation.missingColumns,
            sql,
            description: `Add soft delete support to ${tableName}`
          })
        }
      }

      res.json({
        success: true,
        data: {
          recommendations,
          summary: {
            totalRecommendations: recommendations.length,
            criticalRecommendations: recommendations.filter(r => r.priority === 'CRITICAL').length,
            highPriorityRecommendations: recommendations.filter(r => r.priority === 'HIGH').length
          }
        }
      })
    } catch (error) {
      logger.error('Migration recommendations failed:', error)
      res.status(500).json({
        error: 'Migration recommendations failed',
        details: error.message,
        code: 'MIGRATION_RECOMMENDATIONS_ERROR'
      })
    }
  })

  /**
   * Calculate overall health score
   * @param {Object} coverage - Entity coverage report
   * @param {Object} auditReport - Audit trail report
   * @returns {number} Health score (0-100)
   */
  calculateHealthScore(coverage, auditReport) {
    let score = 0

    // Entity coverage (40% weight)
    const coverageScore = coverage.coverage.totalPercentage || 0
    score += coverageScore * 0.4

    // Critical entity coverage (30% weight)
    const criticalScore = coverage.coverage.criticalPercentage || 0
    score += criticalScore * 0.3

    // Audit trail completeness (20% weight)
    const auditScore = auditReport.summary.overallCompleteness || 0
    score += auditScore * 0.2

    // Compliance score (10% weight)
    const complianceScore =
      Math.max(auditReport.compliance.gdpr.score || 0, auditReport.compliance.sox.score || 0) / 100
    score += complianceScore * 0.1

    return Math.round(score)
  }

  /**
   * Get health status based on score
   * @param {number} score - Health score
   * @returns {string} Health status
   */
  getHealthStatus(score) {
    if (score >= 95) {
      return 'EXCELLENT'
    }
    if (score >= 85) {
      return 'GOOD'
    }
    if (score >= 70) {
      return 'FAIR'
    }
    if (score >= 50) {
      return 'POOR'
    }
    return 'CRITICAL'
  }

  /**
   * Generate health recommendations
   * @param {Object} coverage - Entity coverage report
   * @param {Object} auditReport - Audit trail report
   * @param {number} healthScore - Overall health score
   * @returns {Array<Object>} Array of recommendations
   */
  generateHealthRecommendations(coverage, auditReport, healthScore) {
    const recommendations = []

    if (healthScore < 50) {
      recommendations.push({
        priority: 'CRITICAL',
        type: 'OVERALL_HEALTH',
        title: 'Critical Soft Delete Issues',
        description: 'Multiple critical issues with soft delete implementation',
        action: 'Immediate attention required - run migration scripts'
      })
    }

    // Coverage recommendations
    if (coverage.coverage.criticalPercentage < 100) {
      recommendations.push({
        priority: 'HIGH',
        type: 'CRITICAL_COVERAGE',
        title: 'Critical Entities Missing Soft Delete',
        description: `${coverage.coverage.missing.filter(e => e.critical).length} critical entities lack soft delete`,
        action: 'Run migration script for critical entities'
      })
    }

    // Audit recommendations
    if (auditReport.summary.overallCompleteness < 95) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'AUDIT_COMPLETENESS',
        title: 'Incomplete Audit Trail',
        description: `Audit trail completeness is ${auditReport.summary.overallCompleteness}%`,
        action: 'Review and fix audit triggers'
      })
    }

    // Compliance recommendations
    if (!auditReport.compliance.gdpr.compliant) {
      recommendations.push({
        priority: 'HIGH',
        type: 'GDPR_COMPLIANCE',
        title: 'GDPR Compliance Issues',
        description: 'Soft delete implementation not GDPR compliant',
        action: 'Implement missing GDPR requirements'
      })
    }

    return recommendations
  }

  /**
   * Generate migration SQL for missing columns
   * @param {string} tableName - Table name
   * @param {Array} missingColumns - Array of missing column names
   * @returns {string} SQL statements
   */
  generateMigrationSQL(tableName, missingColumns) {
    const sqlStatements = []

    // Add active column if missing
    if (missingColumns.includes('active')) {
      sqlStatements.push(
        `ALTER TABLE public.${tableName} ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true NOT NULL;`
      )
      sqlStatements.push(
        `CREATE INDEX IF NOT EXISTS idx_${tableName}_active ON public.${tableName}(active) WHERE active = true;`
      )
    }

    // Add audit columns
    const auditColumns = ['deleted_at', 'deleted_by', 'deletion_reason', 'deletion_ip']
    const missingAuditColumns = missingColumns.filter(col => auditColumns.includes(col))

    if (missingAuditColumns.length > 0) {
      missingAuditColumns.forEach(col => {
        let columnDef = ''
        switch (col) {
          case 'deleted_at':
            columnDef = 'TIMESTAMP WITH TIME ZONE'
            break
          case 'deleted_by':
          case 'reactivated_by':
            columnDef = 'INTEGER'
            break
          default:
            columnDef = 'TEXT'
        }
        sqlStatements.push(
          `ALTER TABLE public.${tableName} ADD COLUMN IF NOT EXISTS ${col} ${columnDef};`
        )
      })
      sqlStatements.push(
        `CREATE INDEX IF NOT EXISTS idx_${tableName}_deleted_at ON public.${tableName}(deleted_at) WHERE deleted_at IS NOT NULL;`
      )
    }

    // Add reactivation columns
    const reactivateColumns = ['reactivated_at', 'reactivated_by']
    const missingReactivateColumns = missingColumns.filter(col => reactivateColumns.includes(col))

    if (missingReactivateColumns.length > 0) {
      sqlStatements.push(
        `CREATE INDEX IF NOT EXISTS idx_${tableName}_reactivated_at ON public.${tableName}(reactivated_at) WHERE reactivated_at IS NOT NULL;`
      )
    }

    return `-- Migration SQL for ${tableName}\n${sqlStatements.join('\n')}\n`
  }
}

export default SoftDeleteVerificationController
