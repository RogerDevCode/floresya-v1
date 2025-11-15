/**
 * Procesado por B
 */

/**
 * Structured Logging System
 * Provides comprehensive logging with different levels and structured output
 * Essential for debugging, monitoring, and audit trails
 */

import fs from 'fs'
import path from 'path'

// Log levels in order of severity
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
}

// Current log level (can be set via environment variable)
const CURRENT_LOG_LEVEL = process.env.LOG_LEVEL?.toUpperCase() || 'INFO'
const LOG_LEVEL_VALUE = LOG_LEVELS[CURRENT_LOG_LEVEL] || LOG_LEVELS.INFO

/**
 * Logger class with structured output
 */
class StructuredLogger {
  constructor(options = {}) {
    this.logDir = options.logDir || path.join(process.cwd(), 'logs')
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024 // 10MB
    this.maxFiles = options.maxFiles || 5
    this.enableConsole = options.enableConsole !== false
    this.enableFile = options.enableFile !== false

    // Ensure log directory exists
    if (this.enableFile) {
      this.ensureLogDirectory()
    }

    // Request ID for tracking requests across the application
    this.requestCounter = 0
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true })
      }
    } catch (error) {
      console.error('Failed to create log directory:', error)
      this.enableFile = false
    }
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${++this.requestCounter}`
  }

  /**
   * Get current timestamp in ISO format
   */
  getTimestamp() {
    return new Date().toISOString()
  }

  /**
   * Get caller information for debugging
   */
  getCallerInfo() {
    // Use Error.prepareStackTrace for more efficient stack capture
    const stackInfo = {}
    Error.captureStackTrace(stackInfo)

    // Create temporary error to get stack
    const tempError = {}
    Error.captureStackTrace(tempError)
    const stack = tempError.stack
    const lines = stack.split('\n')

    // Find the first line that's not from the logger itself
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line && !line.includes('logger.js') && !line.includes('node_modules')) {
        const match = line.match(/at (\w+) \(([^)]+)\)/) || line.match(/at ([^)]+)/)
        if (match) {
          return {
            function: match[1] || 'unknown',
            file: match[2] || line
          }
        }
      }
    }

    return { function: 'unknown', file: 'unknown' }
  }

  /**
   * Format log entry as structured JSON
   */
  formatLogEntry(level, message, context = {}) {
    const caller = this.getCallerInfo()

    const logEntry = {
      timestamp: this.getTimestamp(),
      level: level,
      message: message,
      caller: {
        function: caller.function,
        file: caller.file
      },
      context: context
    }

    // Add request ID if available in context
    if (context.requestId) {
      logEntry.requestId = context.requestId
    }

    // Add user ID if available
    if (context.userId) {
      logEntry.userId = context.userId
    }

    // Add session ID if available
    if (context.sessionId) {
      logEntry.sessionId = context.sessionId
    }

    return JSON.stringify(logEntry)
  }

  /**
   * Write log to console
   */
  writeToConsole(formattedEntry, level) {
    if (!this.enableConsole) {
      return
    }

    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m', // Green
      WARN: '\x1b[33m', // Yellow
      ERROR: '\x1b[31m', // Red
      FATAL: '\x1b[35m' // Magenta
    }

    const color = colors[level] || colors.INFO
    const resetColor = '\x1b[0m'

    console.log(`${color}[${level}]${resetColor} ${formattedEntry}`)
  }

  /**
   * Write log to file
   */
  writeToFile(formattedEntry, level) {
    if (!this.enableFile) {
      return
    }

    try {
      const date = new Date()
      const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
      const logFile = path.join(this.logDir, `${level.toLowerCase()}_${dateStr}.log`)

      // Check if file needs rotation
      this.rotateLogFile(logFile)

      fs.appendFileSync(logFile, formattedEntry + '\n')
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  }

  /**
   * Rotate log file if it's too large
   */
  rotateLogFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath)
        if (stats.size > this.maxFileSize) {
          // Rename current file with timestamp
          const timestamp = Date.now()
          const rotatedPath = filePath.replace('.log', `_${timestamp}.log`)
          fs.renameSync(filePath, rotatedPath)

          // Keep only the latest maxFiles files
          this.cleanupOldFiles(filePath.replace('.log', '_*.log'))
        }
      }
    } catch (error) {
      console.error('Failed to rotate log file:', error)
    }
  }

  /**
   * Clean up old log files
   */
  cleanupOldFiles(pattern) {
    try {
      const files = fs
        .readdirSync(this.logDir)
        .filter(file => file.includes(pattern.split('_')[0]))
        .map(file => ({
          name: file,
          path: path.join(this.logDir, file),
          mtime: fs.statSync(path.join(this.logDir, file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime)

      // Keep only the latest maxFiles files
      if (files.length > this.maxFiles) {
        files.slice(this.maxFiles).forEach(file => {
          fs.unlinkSync(file.path)
        })
      }
    } catch (error) {
      console.error('Failed to cleanup old log files:', error)
    }
  }

  /**
   * Core logging method
   */
  log(level, message, context = {}) {
    // Check if this level should be logged
    if (LOG_LEVELS[level] < LOG_LEVEL_VALUE) {
      return
    }

    const formattedEntry = this.formatLogEntry(level, message, context)

    // Write to console
    this.writeToConsole(formattedEntry, level)

    // Write to file
    this.writeToFile(formattedEntry, level)
  }

  /**
   * Debug level logging
   */
  debug(message, context = {}) {
    this.log('DEBUG', message, context)
  }

  /**
   * Info level logging
   */
  info(message, context = {}) {
    this.log('INFO', message, context)
  }

  /**
   * Warning level logging
   */
  warn(message, context = {}) {
    this.log('WARN', message, context)
  }

  /**
   * Error level logging
   */
  error(message, error = null, context = {}) {
    if (error) {
      context.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }
    this.log('ERROR', message, context)
  }

  /**
   * Fatal level logging
   */
  fatal(message, error = null, context = {}) {
    if (error) {
      context.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }
    this.log('FATAL', message, context)
  }

  /**
   * Request-specific logging
   */
  logRequest(req, context = {}) {
    const requestId = this.generateRequestId()
    const requestContext = {
      requestId,
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      ...context
    }

    this.info(`${req.method} ${req.url}`, requestContext)
    return requestId
  }

  /**
   * Response-specific logging
   */
  logResponse(requestId, statusCode, duration, context = {}) {
    const responseContext = {
      requestId,
      statusCode,
      duration: `${duration}ms`,
      ...context
    }

    const level = statusCode >= 400 ? 'WARN' : 'INFO'
    this.log(level, `Response: ${statusCode} (${duration}ms)`, responseContext)
  }

  /**
   * Database operation logging
   */
  logDatabase(operation, table, duration, context = {}) {
    const dbContext = {
      operation,
      table,
      duration: `${duration}ms`,
      ...context
    }

    this.debug(`Database ${operation} on ${table}: ${duration}ms`, dbContext)
  }

  /**
   * Business logic logging
   */
  logBusiness(event, details, context = {}) {
    const businessContext = {
      event,
      details,
      ...context
    }

    this.info(`Business Event: ${event}`, businessContext)
  }

  /**
   * Security event logging
   */
  logSecurity(event, severity = 'medium', context = {}) {
    const securityContext = {
      event,
      severity,
      ...context
    }

    const level = severity === 'high' ? 'ERROR' : 'WARN'
    this.log(level, `Security Event: ${event}`, securityContext)
  }

  /**
   * Performance monitoring logging
   */
  logPerformance(metric, value, threshold = null, context = {}) {
    const perfContext = {
      metric,
      value,
      threshold,
      ...context
    }

    const level = threshold && value > threshold ? 'WARN' : 'DEBUG'
    this.log(level, `Performance: ${metric} = ${value}`, perfContext)
  }

  /**
   * Get logger statistics
   */
  getStats() {
    return {
      currentLevel: CURRENT_LOG_LEVEL,
      logDir: this.logDir,
      enableConsole: this.enableConsole,
      enableFile: this.enableFile,
      requestCounter: this.requestCounter
    }
  }
}

// Create global logger instance
const logger = new StructuredLogger({
  logDir: path.join(process.cwd(), 'logs'),
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  enableConsole: true,
  enableFile: true
})

/**
 * Middleware to add request ID and logging to each request
 */
export function requestLoggingMiddleware(req, res, next) {
  const requestId = logger.logRequest(req)
  req.requestId = requestId

  const startTime = Date.now()

  // Log response when request finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime
    logger.logResponse(requestId, res.statusCode, duration, {
      userId: req.user?.id,
      method: req.method,
      url: req.url
    })
  })

  next()
}

/**
 * Middleware to log slow requests
 */
export function slowRequestMiddleware(threshold = 2000) {
  return (req, res, next) => {
    const startTime = Date.now()

    res.on('finish', () => {
      const duration = Date.now() - startTime
      if (duration > threshold) {
        logger.warn('Slow request detected', {
          requestId: req.requestId,
          method: req.method,
          url: req.url,
          duration: `${duration}ms`,
          threshold: `${threshold}ms`,
          userId: req.user?.id
        })
      }
    })

    next()
  }
}

/**
 * Error logging middleware
 */
export function errorLoggingMiddleware(error, req, res, next) {
  logger.error('Unhandled error', error, {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userId: req.user?.id,
    body: req.body,
    query: req.query,
    params: req.params
  })

  next(error)
}

/**
 * Database operation logging middleware
 *
 * IMPORTANT: This middleware has been modified to comply with the "Service Layer Exclusivo" rule.
 * The original implementation attempted to directly wrap req.supabase methods, which would have
 * bypassed the service layer. Now, services should use the logging functionality directly when needed.
 */
export function databaseLoggingMiddleware(req, res, next) {
  // Add logger to request object for services to use
  req.dbLogger = logger

  next()
}

// Export logger instance and utilities
export { logger }
export default logger

// Convenience functions for direct use
export const log = {
  debug: (message, context) => logger.debug(message, context),
  info: (message, context) => logger.info(message, context),
  warn: (message, context) => logger.warn(message, context),
  error: (message, error, context) => logger.error(message, error, context),
  fatal: (message, error, context) => logger.fatal(message, error, context),

  request: (req, context) => logger.logRequest(req, context),
  response: (requestId, statusCode, duration, context) =>
    logger.logResponse(requestId, statusCode, duration, context),
  database: (operation, table, duration, context) =>
    logger.logDatabase(operation, table, duration, context),
  business: (event, details, context) => logger.logBusiness(event, details, context),
  security: (event, severity, context) => logger.logSecurity(event, severity, context),
  performance: (metric, value, threshold, context) =>
    logger.logPerformance(metric, value, threshold, context)
}
