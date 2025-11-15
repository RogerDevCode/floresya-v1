/**
 * Procesado por B
 */

/**
 * Performance Monitoring Middleware
 * Tracks and logs API response times and resource usage
 *
 * PRINCIPLES APPLIED:
 * - Service Layer Exclusive: Monitoring for services
 * - Performance: Real-time metrics collection
 * - Clean Architecture: Standalone monitoring component
 */

import { getPerformanceStats } from '../../config/connectionPool.js'
import { logger } from '../../utils/logger.js'

/**
 * Track request performance
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export function performanceMonitor(req, res, next) {
  const start = process.hrtime.bigint()

  // Add performance headers
  res.on('finish', () => {
    const end = process.hrtime.bigint()
    const duration = Number(end - start) / 1_000_000 // Convert to milliseconds

    // Log slow requests (>500ms)
    if (duration > 500) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      })
    }

    // Add performance header
    res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`)
  })

  next()
}

/**
 * Get performance metrics for monitoring
 * @returns {Object} Performance statistics
 */
export function getMetrics() {
  const stats = getPerformanceStats()

  return {
    timestamp: new Date().toISOString(),
    uptime: stats.uptime,
    requests: {
      total: stats.connectionPool.totalRequests,
      successful: stats.connectionPool.successfulRequests,
      failed: stats.connectionPool.failedRequests,
      successRate: stats.connectionPool.successRate,
      averageResponseTime: stats.connectionPool.averageResponseTime,
      requestsPerMinute: stats.rateLimit.current
    },
    memory: stats.memory,
    connectionPool: stats.connectionPool.poolConfig,
    rateLimit: {
      current: stats.rateLimit.current,
      limit: stats.rateLimit.limit,
      remaining: stats.rateLimit.remaining
    }
  }
}

/**
 * Middleware to expose metrics endpoint
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export function metricsEndpoint(req, res) {
  try {
    const metrics = getMetrics()
    res.json({
      success: true,
      data: metrics
    })
  } catch (error) {
    logger.error('Failed to get metrics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics',
      message: error.message
    })
  }
}

/**
 * Periodic performance logging
 * Logs metrics every 5 minutes in production
 */
export function startPeriodicLogging() {
  if (process.env.NODE_ENV === 'production') {
    setInterval(
      () => {
        try {
          const metrics = getMetrics()
          logger.info('Performance metrics', {
            uptime: metrics.uptime,
            requestsPerMinute: metrics.requests.requestsPerMinute,
            averageResponseTime: metrics.requests.averageResponseTime,
            memoryHeapUsed: metrics.memory.heapUsed,
            successRate: metrics.requests.successRate
          })
        } catch (error) {
          logger.error('Failed to log periodic metrics:', error)
        }
      },
      5 * 60 * 1000
    ) // 5 minutes
  }
}

export default {
  performanceMonitor,
  getMetrics,
  metricsEndpoint,
  startPeriodicLogging
}
