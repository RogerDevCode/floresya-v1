/**
 * Unified Logger
 * Aplicando Google Engineering Practices
 *
 * Patterns:
 * - console.error() para errores
 * - console.warn() para warnings
 * - console.log() para información general
 * - console.info() para información detallada
 * - console.debug() para debugging
 */

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

const LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
}

const CONFIG = {
  level: process.env.LOG_LEVEL || 'INFO',
  enableColors: process.env.LOG_COLORS !== 'false',
  timestamp: true
}

/**
 * Format message with timestamp and level
 */
function formatMessage(level, message, error) {
  const ts = CONFIG.timestamp ? new Date().toISOString().split('T')[1].split('.')[0] : ''

  const levelStr = level.padEnd(5)
  const color = CONFIG.enableColors
    ? {
        ERROR: COLORS.red,
        WARN: COLORS.yellow,
        INFO: COLORS.green,
        DEBUG: COLORS.cyan
      }[level] || ''
    : ''

  const reset = CONFIG.enableColors ? COLORS.reset : ''

  const parts = []
  if (ts) {
    parts.push(`[${ts}]`)
  }
  parts.push(`[${levelStr}]`)
  parts.push(message)

  if (error && level === 'ERROR') {
    parts.push('\n')
    parts.push(error.stack || error.message || error)
  }

  const formatted = parts.join(' ')
  return CONFIG.enableColors ? `${color}${formatted}${reset}` : formatted
}

/**
 * Logger class
 */
class Logger {
  constructor(context = 'APP') {
    this.context = context
  }

  error(msg, err) {
    if (this.shouldLog(LEVELS.ERROR)) {
      console.error(formatMessage('ERROR', `[${this.context}] ${msg}`, err))
    }
  }

  warn(msg) {
    if (this.shouldLog(LEVELS.WARN)) {
      console.warn(formatMessage('WARN', `[${this.context}] ${msg}`))
    }
  }

  info(msg) {
    if (this.shouldLog(LEVELS.INFO)) {
      console.info(formatMessage('INFO', `[${this.context}] ${msg}`))
    }
  }

  debug(msg) {
    if (this.shouldLog(LEVELS.DEBUG)) {
      console.debug(formatMessage('DEBUG', `[${this.context}] ${msg}`))
    }
  }

  shouldLog(level) {
    return level <= LEVELS[CONFIG.level]
  }
}

/**
 * Default logger instance
 */
export default new Logger('SCRIPT')

/**
 * Factory function for named loggers
 */
export function createLogger(context) {
  return new Logger(context)
}

/**
 * Usage examples
 *

import logger from './shared/logger.js'

// Error with stack trace
try {
  throw new Error('Database connection failed')
} catch (err) {
  logger.error('Failed to connect to database', err)
}

// Warning
logger.warn('Rate limit approaching')

// Info
logger.info('Processing order #12345')

// Debug (only shown with LOG_LEVEL=DEBUG)
logger.debug('Query parameters:', query)

// Named logger
import { createLogger } from './shared/logger.js'
const dbLogger = createLogger('DATABASE')
dbLogger.error('Connection timeout', err)

 */
