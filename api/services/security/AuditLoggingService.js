/**
 * Comprehensive Audit Logging Service
 * Enterprise-grade security audit trail and compliance logging
 *
 * Features:
 * - Structured security event logging
 * - GDPR compliance logging
 * - SOX compliance logging
 * - PCI DSS compliance logging
 * - Real-time monitoring
 * - Alert generation
 * - Log aggregation
 * - Tamper-evident logging
 * - Retention management
 * - Anomaly detection
 */

import { createHash } from 'crypto'
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { SecurityError, ConfigurationError } from '../../errors/AppError.js'
import { logger } from '../../utils/logger.js'
// import config from '../../config/configLoader.js'

/**
 * Audit event categories
 */
const AUDIT_CATEGORIES = {
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  DATA_ACCESS: 'DATA_ACCESS',
  DATA_MODIFICATION: 'DATA_MODIFICATION',
  SYSTEM_CONFIG: 'SYSTEM_CONFIG',
  SECURITY_INCIDENT: 'SECURITY_INCIDENT',
  USER_MANAGEMENT: 'USER_MANAGEMENT',
  FILE_OPERATIONS: 'FILE_OPERATIONS',
  API_ACCESS: 'API_ACCESS',
  ADMIN_ACTIONS: 'ADMIN_ACTIONS',
  COMPLIANCE: 'COMPLIANCE',
  NETWORK: 'NETWORK',
  SESSION: 'SESSION',
  ENCRYPTION: 'ENCRYPTION'
}

/**
 * Security event types
 */
const SECURITY_EVENT_TYPES = {
  // Authentication events
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET: 'PASSWORD_RESET',
  ACCOUNT_LOCKOUT: 'ACCOUNT_LOCKOUT',
  ACCOUNT_UNLOCK: 'ACCOUNT_UNLOCK',
  MFA_ENABLED: 'MFA_ENABLED',
  MFA_DISABLED: 'MFA_DISABLED',

  // Authorization events
  ACCESS_GRANTED: 'ACCESS_GRANTED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  PRIVILEGE_ESCALATION: 'PRIVILEGE_ESCALATION',
  ROLE_CHANGE: 'ROLE_CHANGE',
  PERMISSION_CHANGE: 'PERMISSION_CHANGE',

  // Data access events
  DATA_READ: 'DATA_READ',
  DATA_WRITE: 'DATA_WRITE',
  DATA_DELETE: 'DATA_DELETE',
  DATA_EXPORT: 'DATA_EXPORT',
  DATA_IMPORT: 'DATA_IMPORT',
  PII_ACCESS: 'PII_ACCESS',
  SENSITIVE_DATA_ACCESS: 'SENSITIVE_DATA_ACCESS',

  // System events
  CONFIG_CHANGE: 'CONFIG_CHANGE',
  SYSTEM_START: 'SYSTEM_START',
  SYSTEM_SHUTDOWN: 'SYSTEM_SHUTDOWN',
  BACKUP_CREATED: 'BACKUP_CREATED',
  BACKUP_RESTORED: 'BACKUP_RESTORED',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',

  // Security incidents
  MALWARE_DETECTED: 'MALWARE_DETECTED',
  INTRUSION_ATTEMPT: 'INTRUSION_ATTEMPT',
  BRUTE_FORCE_ATTACK: 'BRUTE_FORCE_ATTACK',
  XSS_ATTEMPT: 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT: 'SQL_INJECTION_ATTEMPT',
  DOS_ATTACK: 'DOS_ATTACK',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',

  // User management
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_SUSPENDED: 'USER_SUSPENDED',
  USER_REACTIVATED: 'USER_REACTIVATED',

  // File operations
  FILE_UPLOADED: 'FILE_UPLOADED',
  FILE_DOWNLOADED: 'FILE_DOWNLOADED',
  FILE_DELETED: 'FILE_DELETED',
  FILE_QUARANTINED: 'FILE_QUARANTINED',
  FILE_RESTORED: 'FILE_RESTORED',

  // API access
  API_REQUEST: 'API_REQUEST',
  API_RESPONSE: 'API_RESPONSE',
  API_ERROR: 'API_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Admin actions
  ADMIN_LOGIN: 'ADMIN_LOGIN',
  ADMIN_ACTION: 'ADMIN_ACTION',
  SYSTEM_SETTING_CHANGE: 'SYSTEM_SETTING_CHANGE',
  AUDIT_LOG_VIEWED: 'AUDIT_LOG_VIEWED',

  // Compliance
  GDPR_REQUEST: 'GDPR_REQUEST',
  DATA_RETENTION_CLEANUP: 'DATA_RETENTION_CLEANUP',
  CONSENT_GRANTED: 'CONSENT_GRANTED',
  CONSENT_REVOKED: 'CONSENT_REVOKED',

  // Network
  IP_BLOCKED: 'IP_BLOCKED',
  IP_UNBLOCKED: 'IP_UNBLOCKED',
  FIREWALL_RULE_CHANGE: 'FIREWALL_RULE_CHANGE',

  // Session
  SESSION_CREATED: 'SESSION_CREATED',
  SESSION_DESTROYED: 'SESSION_DESTROYED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  SESSION_HIJACKING: 'SESSION_HIJACKING',

  // Encryption
  ENCRYPT_OPERATION: 'ENCRYPT_OPERATION',
  DECRYPT_OPERATION: 'DECRYPT_OPERATION',
  KEY_GENERATED: 'KEY_GENERATED',
  KEY_ROTATED: 'KEY_ROTATED'
}

/**
 * Severity levels
 */
const SEVERITY_LEVELS = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO'
}

/**
 * Compliance frameworks
 */
const COMPLIANCE_FRAMEWORKS = {
  GDPR: 'GDPR',
  SOX: 'SOX',
  PCI_DSS: 'PCI_DSS',
  HIPAA: 'HIPAA',
  ISO27001: 'ISO27001'
}

/**
 * Audit Logging Service
 */
export class AuditLoggingService {
  constructor() {
    this.auditLogs = new Map()
    this.alertThresholds = new Map()
    this.logDirectory = process.env.AUDIT_LOG_DIR || './logs/audit'
    this.complianceRequirements = new Map()
    this.initializeService()
  }

  /**
   * Initialize the audit service
   */
  initializeService() {
    try {
      // Ensure log directory exists
      if (!existsSync(this.logDirectory)) {
        mkdirSync(this.logDirectory, { recursive: true })
      }

      // Initialize alert thresholds
      this.initializeAlertThresholds()

      // Initialize compliance requirements
      this.initializeComplianceRequirements()

      // Start log rotation
      this.startLogRotation()

      logger.info('Audit logging service initialized', {
        logDirectory: this.logDirectory,
        alertThresholds: this.alertThresholds.size,
        complianceFrameworks: Object.keys(COMPLIANCE_FRAMEWORKS)
      })
    } catch (error) {
      logger.error('Failed to initialize audit service', { error: error.message })
      throw new ConfigurationError('Audit service initialization failed', {
        error: error.message
      })
    }
  }

  /**
   * Log security event
   * @param {string} eventType - Event type
   * @param {string} category - Event category
   * @param {string} severity - Severity level
   * @param {Object} eventData - Event data
   * @param {Object} options - Logging options
   */
  logEvent(eventType, category, severity, eventData = {}, options = {}) {
    try {
      const {
        userId = null,
        sessionId = null,
        ipAddress = null,
        userAgent = null,
        requestId = null,
        complianceFrameworks = [],
        additionalContext = {}
      } = options

      const auditEvent = {
        // Core event data
        eventId: this.generateEventId(),
        timestamp: new Date().toISOString(),
        eventType,
        category,
        severity,

        // Context information
        userId,
        sessionId,
        ipAddress,
        userAgent,
        requestId,

        // Event data
        eventData: this.sanitizeEventData(eventData),

        // Compliance information
        complianceFrameworks,
        retentionPeriod: this.calculateRetentionPeriod(category, severity),

        // Integrity verification
        checksum: null, // Will be calculated after event creation
        previousChecksum: this.getLastChecksum(),

        // Additional context
        ...additionalContext
      }

      // Calculate checksum for integrity
      auditEvent.checksum = this.calculateEventChecksum(auditEvent)

      // Store event
      this.storeAuditEvent(auditEvent)

      // Check for alerts
      this.checkAlertThresholds(auditEvent)

      // Log to main logger
      this.logToMainLogger(auditEvent)

      // Update last checksum
      this.updateLastChecksum(auditEvent.checksum)

      return auditEvent
    } catch (error) {
      logger.error('Failed to log audit event', {
        eventType,
        error: error.message
      })
      throw new SecurityError('Audit logging failed', {
        eventType,
        error: error.message
      })
    }
  }

  /**
   * Log authentication event
   * @param {string} eventType - Event type
   * @param {Object} eventData - Event data
   * @param {Object} options - Additional options
   */
  logAuthEvent(eventType, eventData, options = {}) {
    return this.logEvent(
      eventType,
      AUDIT_CATEGORIES.AUTHENTICATION,
      this.getSeverityForAuthEvent(eventType),
      eventData,
      {
        complianceFrameworks: [COMPLIANCE_FRAMEWORKS.GDPR, COMPLIANCE_FRAMEWORKS.SOX],
        ...options
      }
    )
  }

  /**
   * Log data access event
   * @param {string} eventType - Event type
   * @param {Object} eventData - Event data
   * @param {Object} options - Additional options
   */
  logDataAccessEvent(eventType, eventData, options = {}) {
    return this.logEvent(
      eventType,
      AUDIT_CATEGORIES.DATA_ACCESS,
      this.getSeverityForDataAccessEvent(eventType),
      eventData,
      {
        complianceFrameworks: [COMPLIANCE_FRAMEWORKS.GDPR, COMPLIANCE_FRAMEWORKS.PCI_DSS],
        ...options
      }
    )
  }

  /**
   * Log security incident
   * @param {string} eventType - Event type
   * @param {Object} eventData - Event data
   * @param {Object} options - Additional options
   */
  logSecurityIncident(eventType, eventData, options = {}) {
    return this.logEvent(
      eventType,
      AUDIT_CATEGORIES.SECURITY_INCIDENT,
      SEVERITY_LEVELS.HIGH,
      eventData,
      {
        complianceFrameworks: Object.values(COMPLIANCE_FRAMEWORKS),
        ...options
      }
    )
  }

  /**
   * Log admin action
   * @param {string} eventType - Event type
   * @param {Object} eventData - Event data
   * @param {Object} options - Additional options
   */
  logAdminAction(eventType, eventData, options = {}) {
    return this.logEvent(
      eventType,
      AUDIT_CATEGORIES.ADMIN_ACTIONS,
      SEVERITY_LEVELS.MEDIUM,
      eventData,
      {
        complianceFrameworks: [COMPLIANCE_FRAMEWORKS.SOX, COMPLIANCE_FRAMEWORKS.ISO27001],
        ...options
      }
    )
  }

  /**
   * Generate unique event ID
   * @returns {string} Event ID
   */
  generateEventId() {
    const timestamp = Date.now().toString(36)
    const random = require('crypto').randomBytes(8).toString('hex')
    return `audit_${timestamp}_${random}`
  }

  /**
   * Calculate event checksum for integrity
   * @param {Object} event - Event object
   * @returns {string} Checksum
   */
  calculateEventChecksum(event) {
    const eventString = JSON.stringify({
      eventId: event.eventId,
      timestamp: event.timestamp,
      eventType: event.eventType,
      category: event.category,
      userId: event.userId,
      eventData: event.eventData
    })

    return createHash('sha256').update(eventString).digest('hex')
  }

  /**
   * Get last checksum for chain of custody
   * @returns {string} Last checksum
   */
  getLastChecksum() {
    const checksumFile = join(this.logDirectory, '.last_checksum')

    if (existsSync(checksumFile)) {
      return readFileSync(checksumFile, 'utf8').trim()
    }

    return null
  }

  /**
   * Update last checksum
   * @param {string} checksum - New checksum
   */
  updateLastChecksum(checksum) {
    const checksumFile = join(this.logDirectory, '.last_checksum')
    writeFileSync(checksumFile, checksum, { mode: 0o600 })
  }

  /**
   * Store audit event
   * @param {Object} event - Event to store
   */
  storeAuditEvent(event) {
    const key = `${event.category}:${new Date(event.timestamp).toISOString().substring(0, 7)}`

    if (!this.auditLogs.has(key)) {
      this.auditLogs.set(key, [])
    }

    const events = this.auditLogs.get(key)
    events.push(event)

    // Keep only last 10000 events per category/month
    if (events.length > 10000) {
      events.splice(0, events.length - 10000)
    }

    // Write to file
    this.writeEventToFile(event)
  }

  /**
   * Write event to file
   * @param {Object} event - Event to write
   */
  writeEventToFile(event) {
    try {
      const date = new Date(event.timestamp)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      const filename = `audit_${year}_${month}_${day}.log`
      const filepath = join(this.logDirectory, filename)

      const logEntry = JSON.stringify(event) + '\n'
      writeFileSync(filepath, logEntry, { flag: 'a' })
    } catch (error) {
      logger.error('Failed to write audit event to file', {
        eventId: event.eventId,
        error: error.message
      })
    }
  }

  /**
   * Sanitize event data for logging
   * @param {Object} eventData - Raw event data
   * @returns {Object} Sanitized event data
   */
  sanitizeEventData(eventData) {
    if (typeof eventData !== 'object' || eventData === null) {
      return eventData
    }

    const sanitized = {}
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'ssn', 'creditCard']

    for (const [key, value] of Object.entries(eventData)) {
      const isSensitive = sensitiveFields.some(field => key.toLowerCase().includes(field))

      if (isSensitive && typeof value === 'string') {
        sanitized[key] = value.length > 0 ? '******' : value
      } else if (typeof value === 'string' && value.length > 1000) {
        sanitized[key] = value.substring(0, 1000) + '...[truncated]'
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  /**
   * Get severity for authentication events
   * @param {string} eventType - Event type
   * @returns {string} Severity level
   */
  getSeverityForAuthEvent(eventType) {
    const severityMap = {
      [SECURITY_EVENT_TYPES.LOGIN_SUCCESS]: SEVERITY_LEVELS.INFO,
      [SECURITY_EVENT_TYPES.LOGIN_FAILED]: SEVERITY_LEVELS.MEDIUM,
      [SECURITY_EVENT_TYPES.ACCOUNT_LOCKOUT]: SEVERITY_LEVELS.HIGH,
      [SECURITY_EVENT_TYPES.MALWARE_DETECTED]: SEVERITY_LEVELS.CRITICAL,
      [SECURITY_EVENT_TYPES.INTRUSION_ATTEMPT]: SEVERITY_LEVELS.CRITICAL
    }

    return severityMap[eventType] || SEVERITY_LEVELS.MEDIUM
  }

  /**
   * Get severity for data access events
   * @param {string} eventType - Event type
   * @returns {string} Severity level
   */
  getSeverityForDataAccessEvent(eventType) {
    const severityMap = {
      [SECURITY_EVENT_TYPES.DATA_READ]: SEVERITY_LEVELS.INFO,
      [SECURITY_EVENT_TYPES.DATA_WRITE]: SEVERITY_LEVELS.MEDIUM,
      [SECURITY_EVENT_TYPES.DATA_DELETE]: SEVERITY_LEVELS.HIGH,
      [SECURITY_EVENT_TYPES.PII_ACCESS]: SEVERITY_LEVELS.HIGH,
      [SECURITY_EVENT_TYPES.SENSITIVE_DATA_ACCESS]: SEVERITY_LEVELS.HIGH
    }

    return severityMap[eventType] || SEVERITY_LEVELS.MEDIUM
  }

  /**
   * Calculate retention period based on category and severity
   * @param {string} category - Event category
   * @param {string} severity - Event severity
   * @returns {number} Retention period in days
   */
  calculateRetentionPeriod(category, severity) {
    const baseRetention = {
      [AUDIT_CATEGORIES.AUTHENTICATION]: 2555, // 7 years
      [AUDIT_CATEGORIES.AUTHORIZATION]: 2555, // 7 years
      [AUDIT_CATEGORIES.DATA_ACCESS]: 2555, // 7 years
      [AUDIT_CATEGORIES.DATA_MODIFICATION]: 2555, // 7 years
      [AUDIT_CATEGORIES.SECURITY_INCIDENT]: 3650, // 10 years
      [AUDIT_CATEGORIES.ADMIN_ACTIONS]: 3650, // 10 years
      [AUDIT_CATEGORIES.COMPLIANCE]: 3650 // 10 years
    }

    const severityMultiplier = {
      [SEVERITY_LEVELS.CRITICAL]: 1.5,
      [SEVERITY_LEVELS.HIGH]: 1.2,
      [SEVERITY_LEVELS.MEDIUM]: 1.0,
      [SEVERITY_LEVELS.LOW]: 0.8,
      [SEVERITY_LEVELS.INFO]: 0.5
    }

    const baseDays = baseRetention[category] || 1095 // Default 3 years
    const multiplier = severityMultiplier[severity] || 1.0

    return Math.floor(baseDays * multiplier)
  }

  /**
   * Initialize alert thresholds
   */
  initializeAlertThresholds() {
    this.alertThresholds.set('FAILED_LOGIN_ATTEMPTS', {
      threshold: 5,
      window: 15 * 60 * 1000, // 15 minutes
      severity: SEVERITY_LEVELS.HIGH
    })

    this.alertThresholds.set('PRIVILEGE_ESCALATION', {
      threshold: 1,
      window: 60 * 60 * 1000, // 1 hour
      severity: SEVERITY_LEVELS.CRITICAL
    })

    this.alertThresholds.set('PII_ACCESS', {
      threshold: 10,
      window: 60 * 60 * 1000, // 1 hour
      severity: SEVERITY_LEVELS.MEDIUM
    })
  }

  /**
   * Initialize compliance requirements
   */
  initializeComplianceRequirements() {
    // GDPR requirements
    this.complianceRequirements.set(COMPLIANCE_FRAMEWORKS.GDPR, {
      requiresConsent: true,
      dataMinimization: true,
      rightToErasure: true,
      dataPortability: true,
      breachNotification: 72 * 60 * 60 * 1000 // 72 hours
    })

    // SOX requirements
    this.complianceRequirements.set(COMPLIANCE_FRAMEWORKS.SOX, {
      requiresAuditTrail: true,
      dataIntegrity: true,
      accessControls: true,
      retentionPeriod: 7 * 365 * 24 * 60 * 60 * 1000 // 7 years
    })

    // PCI DSS requirements
    this.complianceRequirements.set(COMPLIANCE_FRAMEWORKS.PCI_DSS, {
      requiresEncryption: true,
      accessControls: true,
      networkSecurity: true,
      vulnerabilityManagement: true,
      retentionPeriod: 365 * 24 * 60 * 60 * 1000 // 1 year
    })
  }

  /**
   * Check alert thresholds
   * @param {Object} event - Current event
   */
  checkAlertThresholds(event) {
    for (const [thresholdName, threshold] of this.alertThresholds.entries()) {
      if (this.shouldTriggerAlert(event, threshold)) {
        this.generateAlert(thresholdName, event, threshold)
      }
    }
  }

  /**
   * Check if alert should be triggered
   * @param {Object} event - Current event
   * @param {Object} threshold - Threshold configuration
   * @returns {boolean} Should trigger alert
   */
  shouldTriggerAlert(event, threshold) {
    // This is a simplified implementation
    // In production, this would be more sophisticated
    const now = Date.now()
    const windowStart = now - threshold.window

    // Count similar events in window
    let count = 0
    for (const events of this.auditLogs.values()) {
      for (const pastEvent of events) {
        if (
          pastEvent.eventType === event.eventType &&
          new Date(pastEvent.timestamp).getTime() > windowStart
        ) {
          count++
        }
      }
    }

    return count >= threshold.threshold
  }

  /**
   * Generate security alert
   * @param {string} thresholdName - Threshold name
   * @param {Object} event - Triggering event
   * @param {Object} threshold - Threshold configuration
   */
  generateAlert(thresholdName, event, threshold) {
    const alert = {
      alertId: this.generateEventId(),
      timestamp: new Date().toISOString(),
      thresholdName,
      severity: threshold.severity,
      triggerEvent: event.eventId,
      description: `Security threshold exceeded: ${thresholdName}`,
      requiresAction: true
    }

    logger.error('SECURITY ALERT', {
      alertId: alert.alertId,
      thresholdName,
      severity: alert.severity,
      triggerEvent: event.eventId,
      description: alert.description
    })

    // In production, this would send notifications
    // to security team, administrators, etc.
  }

  /**
   * Log to main logger
   * @param {Object} event - Event to log
   */
  logToMainLogger(event) {
    const logMethod = this.getLogMethodForSeverity(event.severity)

    logMethod('AUDIT_EVENT', {
      eventId: event.eventId,
      eventType: event.eventType,
      category: event.category,
      severity: event.severity,
      userId: event.userId,
      ipAddress: event.ipAddress,
      timestamp: event.timestamp
    })
  }

  /**
   * Get log method for severity
   * @param {string} severity - Severity level
   * @returns {Function} Logger method
   */
  getLogMethodForSeverity(severity) {
    switch (severity) {
      case SEVERITY_LEVELS.CRITICAL:
        return logger.error.bind(logger)
      case SEVERITY_LEVELS.HIGH:
        return logger.error.bind(logger)
      case SEVERITY_LEVELS.MEDIUM:
        return logger.warn.bind(logger)
      case SEVERITY_LEVELS.LOW:
        return logger.info.bind(logger)
      case SEVERITY_LEVELS.INFO:
      default:
        return logger.info.bind(logger)
    }
  }

  /**
   * Start log rotation
   */
  startLogRotation() {
    // Rotate logs daily at midnight
    setInterval(
      () => {
        this.rotateLogs()
      },
      24 * 60 * 60 * 1000
    )
  }

  /**
   * Rotate old logs
   */
  rotateLogs() {
    try {
      const now = new Date()
      const cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) // 90 days

      // Clean up in-memory logs
      for (const [key, events] of this.auditLogs.entries()) {
        const filteredEvents = events.filter(event => new Date(event.timestamp) > cutoffDate)

        if (filteredEvents.length === 0) {
          this.auditLogs.delete(key)
        } else {
          this.auditLogs.set(key, filteredEvents)
        }
      }

      // Clean up old log files
      // This would implement file-based log rotation
      logger.info('Audit logs rotated', {
        cutoffDate: cutoffDate.toISOString(),
        totalEvents: Array.from(this.auditLogs.values()).reduce(
          (total, events) => total + events.length,
          0
        )
      })
    } catch (error) {
      logger.error('Failed to rotate audit logs', { error: error.message })
    }
  }

  /**
   * Get audit statistics
   * @returns {Object} Audit statistics
   */
  getAuditStats() {
    const totalEvents = Array.from(this.auditLogs.values()).reduce(
      (total, events) => total + events.length,
      0
    )

    const eventsByCategory = {}
    const eventsBySeverity = {}
    const recentEvents = []

    for (const [category, events] of this.auditLogs.entries()) {
      eventsByCategory[category] = events.length

      for (const event of events) {
        eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1

        const eventAge = Date.now() - new Date(event.timestamp).getTime()
        if (eventAge < 24 * 60 * 60 * 1000) {
          // Last 24 hours
          recentEvents.push(event)
        }
      }
    }

    return {
      totalEvents,
      eventsByCategory,
      eventsBySeverity,
      recentEventsCount: recentEvents.length,
      logDirectory: this.logDirectory,
      alertThresholds: this.alertThresholds.size,
      complianceFrameworks: Object.keys(COMPLIANCE_FRAMEWORKS)
    }
  }

  /**
   * Search audit logs
   * @param {Object} criteria - Search criteria
   * @returns {Array} Matching events
   */
  searchAuditLogs(criteria = {}) {
    const {
      eventType,
      category,
      severity,
      userId,
      startDate,
      endDate,
      ipAddress,
      limit = 100
    } = criteria

    const results = []

    for (const events of this.auditLogs.values()) {
      for (const event of events) {
        if (eventType && event.eventType !== eventType) {
          continue
        }
        if (category && event.category !== category) {
          continue
        }
        if (severity && event.severity !== severity) {
          continue
        }
        if (userId && event.userId !== userId) {
          continue
        }
        if (ipAddress && event.ipAddress !== ipAddress) {
          continue
        }

        const eventDate = new Date(event.timestamp)
        if (startDate && eventDate < new Date(startDate)) {
          continue
        }
        if (endDate && eventDate > new Date(endDate)) {
          continue
        }

        results.push(event)

        if (results.length >= limit) {
          break
        }
      }

      if (results.length >= limit) {
        break
      }
    }

    return results
  }

  /**
   * Export audit logs for compliance
   * @param {string} framework - Compliance framework
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Object} Export data
   */
  exportForCompliance(framework, startDate, endDate) {
    const requirements = this.complianceRequirements.get(framework)
    if (!requirements) {
      throw new SecurityError('Unsupported compliance framework', {
        framework,
        supported: Object.keys(COMPLIANCE_FRAMEWORKS)
      })
    }

    const events = this.searchAuditLogs({
      startDate,
      endDate,
      limit: 10000
    })

    return {
      framework,
      requirements,
      exportDate: new Date().toISOString(),
      eventCount: events.length,
      events,
      checksum: this.calculateExportChecksum(events)
    }
  }

  /**
   * Calculate export checksum
   * @param {Array} events - Events to checksum
   * @returns {string} Checksum
   */
  calculateExportChecksum(events) {
    const exportString = JSON.stringify(events, null, 2)
    return createHash('sha256').update(exportString).digest('hex')
  }
}

// Global instance
const auditLoggingService = new AuditLoggingService()

export default auditLoggingService
export { AUDIT_CATEGORIES, SECURITY_EVENT_TYPES, SEVERITY_LEVELS, COMPLIANCE_FRAMEWORKS }
