/**
 * Winston Logger Configuration
 * Centralized logging with multiple transports and levels
 */

import winston from 'winston'
import path from 'path'

const { combine, timestamp, printf, colorize, errors } = winston.format

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `${timestamp} [${level}]: ${message}`

  // Add stack trace for errors
  if (stack) {
    log += `\n${stack}`
  }

  // Add metadata if present
  if (Object.keys(meta).length > 0) {
    log += `\n${JSON.stringify(meta, null, 2)}`
  }

  return log
})

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'warn', // Changed from 'info' to 'warn' for less verbosity
  format: combine(errors({ stack: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    // Console transport (always enabled)
    new winston.transports.Console({
      format: combine(colorize(), logFormat)
    })
  ],
  // Don't exit on error
  exitOnError: false
})

// Add file transports in production, but not in serverless environments
const IS_SERVERLESS =
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY
if (process.env.NODE_ENV === 'production' && !IS_SERVERLESS) {
  // Error log file
  logger.add(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  )

  // Combined log file
  logger.add(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  )
}

/**
 * Express middleware for logging HTTP requests
 * Only logs errors and critical requests for less verbosity
 */
export function requestLogger(req, res, next) {
  const start = Date.now()

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress
    }

    // Only log errors (4xx/5xx) and critical requests
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData)
    } else if (res.statusCode >= 500) {
      // Log server errors as error level
      logger.error('HTTP Request', logData)
    }
    // Successful requests (2xx/3xx) are not logged to reduce verbosity
  })

  next()
}

export { logger }
export default logger
