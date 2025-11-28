/**
 * Entity Coverage Verification Service
 * Verifies that all mutable entities have proper soft delete functionality
 * Ensures comprehensive coverage across all business entities
 * Follows CLAUDE.md and claude2.txt requirements for production-ready code
 */

import { createSchemaValidationService } from './schema-validation-service.js'
import { logger } from '../utils/logger.js'

/**
 * EntityCoverageService
 * Verifies soft delete coverage across all entities
 */
export class EntityCoverageService {
  /**
   * @param {Object} supabaseClient - Supabase client instance
   */
  constructor(supabaseClient) {
    this.supabase = supabaseClient
    this.schemaValidator = createSchemaValidationService(supabaseClient)
  }

  /**
   * Get all mutable entities that should have soft delete
   * @returns {Array<string>} Array of table names
   */
  getMutableEntities() {
    return [
      // Core business entities
      'products',
      'orders',
      'payments',
      'users',
      'order_items',

      // Configuration entities
      'occasions',
      'payment_methods',
      'settings',
      'product_images',

      // Audit and logging entities
      'expenses',
      'busquedas_log',
      'query_timeouts_log',
      'order_status_history',
      'product_occasions'
    ]
  }

  /**
   * Get critical business entities that must have soft delete
   * @returns {Array<string>} Array of critical table names
   */
  getCriticalEntities() {
    return [
      'products', // Core catalog
      'orders', // Customer transactions
      'payments', // Financial records
      'users', // User accounts
      'order_items' // Order details
    ]
  }

  /**
   * Get configuration entities that should have soft delete
   * @returns {Array<string>} Array of configuration table names
   */
  getConfigurationEntities() {
    return ['occasions', 'payment_methods', 'settings', 'product_images']
  }

  /**
   * Get audit/logging entities that should have soft delete
   * @returns {Array<string>} Array of audit table names
   */
  getAuditEntities() {
    return [
      'expenses',
      'busquedas_log',
      'query_timeouts_log',
      'order_status_history',
      'product_occasions'
    ]
  }

  /**
   * Verify soft delete coverage for all entities
   * @returns {Promise<Object>} Comprehensive coverage report
   */
  async verifySoftDeleteCoverage() {
    try {
      const mutableEntities = this.getMutableEntities()
      const criticalEntities = this.getCriticalEntities()
      const configEntities = this.getConfigurationEntities()
      const auditEntities = this.getAuditEntities()

      const results = {
        summary: {
          totalEntities: mutableEntities.length,
          criticalEntities: criticalEntities.length,
          configEntities: configEntities.length,
          auditEntities: auditEntities.length,
          timestamp: new Date().toISOString()
        },
        coverage: {
          total: 0,
          critical: 0,
          config: 0,
          audit: 0,
          missing: []
        },
        entities: {},
        recommendations: [],
        compliance: {
          gdpr: false,
          sox: false,
          pci: false
        }
      }

      // Check each entity
      for (const tableName of mutableEntities) {
        try {
          const validation = await this.schemaValidator.getSoftDeleteValidation(tableName)
          results.entities[tableName] = {
            ...validation,
            category: this.categorizeEntity(tableName),
            critical: criticalEntities.includes(tableName)
          }

          if (validation.canPerformSoftDelete) {
            results.coverage.total++

            if (criticalEntities.includes(tableName)) {
              results.coverage.critical++
            }
            if (configEntities.includes(tableName)) {
              results.coverage.config++
            }
            if (auditEntities.includes(tableName)) {
              results.coverage.audit++
            }
          } else {
            results.coverage.missing.push({
              tableName,
              category: this.categorizeEntity(tableName),
              critical: criticalEntities.includes(tableName),
              missingColumns: validation.missingColumns
            })
          }
        } catch (error) {
          logger.error(`Error validating entity ${tableName}:`, error)
          results.entities[tableName] = {
            error: error.message,
            category: this.categorizeEntity(tableName),
            critical: criticalEntities.includes(tableName)
          }
          results.coverage.missing.push({
            tableName,
            category: this.categorizeEntity(tableName),
            critical: criticalEntities.includes(tableName),
            error: error.message
          })
        }
      }

      // Calculate coverage percentages
      results.coverage.totalPercentage =
        (results.coverage.total / results.summary.totalEntities) * 100
      results.coverage.criticalPercentage =
        (results.coverage.critical / results.summary.criticalEntities) * 100
      results.coverage.configPercentage =
        (results.coverage.config / results.summary.configEntities) * 100
      results.coverage.auditPercentage =
        (results.coverage.audit / results.summary.auditEntities) * 100

      // Generate recommendations
      results.recommendations = this.generateCoverageRecommendations(results)

      // Assess compliance
      results.compliance = this.assessCompliance(results)

      return results
    } catch (error) {
      logger.error('Error verifying soft delete coverage:', error)
      throw error
    }
  }

  /**
   * Categorize an entity by business function
   * @param {string} tableName - Table name
   * @returns {string} Entity category
   */
  categorizeEntity(tableName) {
    const critical = this.getCriticalEntities()
    const config = this.getConfigurationEntities()
    const audit = this.getAuditEntities()

    if (critical.includes(tableName)) {
      return 'critical'
    }
    if (config.includes(tableName)) {
      return 'configuration'
    }
    if (audit.includes(tableName)) {
      return 'audit'
    }
    return 'unknown'
  }

  /**
   * Generate recommendations based on coverage analysis
   * @param {Object} results - Coverage verification results
   * @returns {Array<Object>} Array of recommendations
   */
  generateCoverageRecommendations(results) {
    const recommendations = []

    // Critical entity recommendations
    if (results.coverage.criticalPercentage < 100) {
      const missingCritical = results.coverage.missing.filter(e => e.critical)
      recommendations.push({
        priority: 'CRITICAL',
        type: 'COVERAGE_CRITICAL',
        title: 'Critical Entities Missing Soft Delete',
        description: `${missingCritical.length} critical business entities lack soft delete support`,
        entities: missingCritical.map(e => e.tableName),
        impact: 'HIGH - Data loss risk for core business operations',
        action: 'Run migration script immediately to add soft delete support'
      })
    }

    // Overall coverage recommendations
    if (results.coverage.totalPercentage < 100) {
      recommendations.push({
        priority: 'HIGH',
        type: 'COVERAGE_INCOMPLETE',
        title: 'Incomplete Soft Delete Coverage',
        description: `${results.coverage.missing.length} entities lack soft delete support`,
        entities: results.coverage.missing.map(e => e.tableName),
        impact: 'MEDIUM - Inconsistent data handling across entities',
        action: 'Apply schema validation and migration scripts'
      })
    }

    // Audit trail recommendations
    const entitiesWithoutAudit = Object.entries(results.entities)
      .filter(([_, validation]) => validation.hasBasicSoftDelete && !validation.hasFullAuditSupport)
      .map(([tableName, _]) => tableName)

    if (entitiesWithoutAudit.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'AUDIT_TRAIL_INCOMPLETE',
        title: 'Incomplete Audit Trail Support',
        description: `${entitiesWithoutAudit.length} entities lack full audit trail`,
        entities: entitiesWithoutAudit,
        impact: 'MEDIUM - Compliance and forensic analysis limitations',
        action: 'Add audit columns (deleted_at, deleted_by, deletion_reason, deletion_ip)'
      })
    }

    // Reactivation recommendations
    const entitiesWithoutReactivation = Object.entries(results.entities)
      .filter(
        ([_, validation]) => validation.hasBasicSoftDelete && !validation.hasReactivationSupport
      )
      .map(([tableName, _]) => tableName)

    if (entitiesWithoutReactivation.length > 0) {
      recommendations.push({
        priority: 'LOW',
        type: 'REACTIVATION_MISSING',
        title: 'Missing Reactivation Support',
        description: `${entitiesWithoutReactivation.length} entities lack reactivation support`,
        entities: entitiesWithoutReactivation,
        impact: 'LOW - Limited data recovery capabilities',
        action: 'Add reactivation columns (reactivated_at, reactivated_by)'
      })
    }

    return recommendations
  }

  /**
   * Assess compliance based on coverage
   * @param {Object} results - Coverage verification results
   * @returns {Object} Compliance assessment
   */
  assessCompliance(results) {
    const compliance = {
      gdpr: {
        compliant: false,
        score: 0,
        requirements: ['Right to erasure', 'Data portability', 'Audit trail'],
        gaps: []
      },
      sox: {
        compliant: false,
        score: 0,
        requirements: ['Data integrity', 'Audit controls', 'Change management'],
        gaps: []
      },
      pci: {
        compliant: false,
        score: 0,
        requirements: ['Data retention', 'Access control', 'Audit logging'],
        gaps: []
      }
    }

    // GDPR compliance
    const gdprRequirements = [
      results.coverage.criticalPercentage >= 100, // Right to erasure
      results.coverage.totalPercentage >= 90, // Data portability
      this.hasAuditTrailSupport(results) // Audit trail
    ]
    compliance.gdpr.score =
      (gdprRequirements.filter(Boolean).length / gdprRequirements.length) * 100
    compliance.gdpr.compliant = compliance.gdpr.score >= 90

    if (!gdprRequirements[0]) {
      compliance.gdpr.gaps.push('Critical entities lack soft delete')
    }
    if (!gdprRequirements[1]) {
      compliance.gdpr.gaps.push('Incomplete entity coverage')
    }
    if (!gdprRequirements[2]) {
      compliance.gdpr.gaps.push('Missing audit trail support')
    }

    // SOX compliance
    const soxRequirements = [
      results.coverage.criticalPercentage >= 100, // Data integrity
      this.hasAuditTrailSupport(results), // Audit controls
      results.coverage.totalPercentage >= 85 // Change management
    ]
    compliance.sox.score = (soxRequirements.filter(Boolean).length / soxRequirements.length) * 100
    compliance.sox.compliant = compliance.sox.score >= 85

    if (!soxRequirements[0]) {
      compliance.sox.gaps.push('Critical entities lack soft delete')
    }
    if (!soxRequirements[1]) {
      compliance.sox.gaps.push('Missing audit trail support')
    }
    if (!soxRequirements[2]) {
      compliance.sox.gaps.push('Incomplete change management')
    }

    // PCI compliance
    const pciRequirements = [
      results.coverage.criticalPercentage >= 100, // Data retention
      results.coverage.criticalPercentage >= 100, // Access control (for critical data)
      this.hasAuditTrailSupport(results) // Audit logging
    ]
    compliance.pci.score = (pciRequirements.filter(Boolean).length / pciRequirements.length) * 100
    compliance.pci.compliant = compliance.pci.score >= 95

    if (!pciRequirements[0]) {
      compliance.pci.gaps.push('Payment entities lack soft delete')
    }
    if (!pciRequirements[1]) {
      compliance.pci.gaps.push('Insufficient access controls')
    }
    if (!pciRequirements[2]) {
      compliance.pci.gaps.push('Missing audit logging')
    }

    return compliance
  }

  /**
   * Check if system has adequate audit trail support
   * @param {Object} results - Coverage verification results
   * @returns {boolean} True if audit trail is adequate
   */
  hasAuditTrailSupport(results) {
    const entitiesWithAudit = Object.entries(results.entities).filter(
      ([_, validation]) => validation.hasFullAuditSupport
    ).length

    const totalEntities = Object.keys(results.entities).length
    return entitiesWithAudit / totalEntities >= 0.8 // 80% threshold
  }

  /**
   * Generate coverage report for specific entity
   * @param {string} tableName - Table name to analyze
   * @returns {Promise<Object>} Entity coverage report
   */
  async getEntityCoverage(tableName) {
    try {
      const validation = await this.schemaValidator.getSoftDeleteValidation(tableName)
      const category = this.categorizeEntity(tableName)
      const critical = this.getCriticalEntities().includes(tableName)

      return {
        tableName,
        category,
        critical,
        validation,
        recommendations: this.generateEntityRecommendations(
          tableName,
          validation,
          category,
          critical
        )
      }
    } catch (error) {
      logger.error(`Error getting entity coverage for ${tableName}:`, error)
      return {
        tableName,
        error: error.message,
        recommendations: [
          {
            priority: 'HIGH',
            type: 'ENTITY_ERROR',
            description: 'Unable to validate entity schema',
            action: 'Check table existence and permissions'
          }
        ]
      }
    }
  }

  /**
   * Generate recommendations for specific entity
   * @param {string} tableName - Table name
   * @param {Object} validation - Schema validation result
   * @param {string} category - Entity category
   * @param {boolean} critical - Whether entity is critical
   * @returns {Array<Object>} Array of recommendations
   */
  generateEntityRecommendations(tableName, validation, category, critical) {
    const recommendations = []

    if (!validation.canPerformSoftDelete) {
      recommendations.push({
        priority: critical ? 'CRITICAL' : 'HIGH',
        type: 'ADD_SOFT_DELETE',
        description: `Add soft delete support to ${tableName}`,
        sql: this.schemaValidator.generateAddActiveColumnSQL(tableName)
      })
    }

    if (validation.hasBasicSoftDelete && !validation.hasFullAuditSupport) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'ADD_AUDIT_TRAIL',
        description: `Add audit trail support to ${tableName}`,
        sql: this.schemaValidator.generateAuditColumnsSQL(tableName, validation.missingColumns)
      })
    }

    if (validation.hasBasicSoftDelete && !validation.hasReactivationSupport) {
      recommendations.push({
        priority: 'LOW',
        type: 'ADD_REACTIVATION',
        description: `Add reactivation support to ${tableName}`,
        sql: this.schemaValidator.generateReactivationColumnsSQL(
          tableName,
          validation.missingColumns
        )
      })
    }

    return recommendations
  }

  /**
   * Get coverage summary statistics
   * @returns {Promise<Object>} Coverage summary
   */
  async getCoverageSummary() {
    const fullReport = await this.verifySoftDeleteCoverage()

    return {
      overview: {
        totalEntities: fullReport.summary.totalEntities,
        coveredEntities: fullReport.coverage.total,
        coveragePercentage: Math.round(fullReport.coverage.totalPercentage),
        lastUpdated: fullReport.summary.timestamp
      },
      byCategory: {
        critical: {
          total: fullReport.summary.criticalEntities,
          covered: fullReport.coverage.critical,
          percentage: Math.round(fullReport.coverage.criticalPercentage)
        },
        configuration: {
          total: fullReport.summary.configEntities,
          covered: fullReport.coverage.config,
          percentage: Math.round(fullReport.coverage.configPercentage)
        },
        audit: {
          total: fullReport.summary.auditEntities,
          covered: fullReport.coverage.audit,
          percentage: Math.round(fullReport.coverage.auditPercentage)
        }
      },
      compliance: fullReport.compliance,
      highPriorityIssues: fullReport.recommendations.filter(
        r => r.priority === 'CRITICAL' || r.priority === 'HIGH'
      )
    }
  }
}

/**
 * Factory function to create EntityCoverageService
 * @param {Object} supabaseClient - Supabase client
 * @returns {EntityCoverageService} Configured service
 */
export function createEntityCoverageService(supabaseClient) {
  return new EntityCoverageService(supabaseClient)
}
