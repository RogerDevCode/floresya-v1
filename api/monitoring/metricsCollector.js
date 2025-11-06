/**
 * Metrics Collector
 * Collects and analyzes system metrics for monitoring and health checks
 */

import { logger } from '../utils/logger.js'

class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byEndpoint: new Map()
      },
      performance: {
        responseTime: {
          total: 0,
          count: 0,
          average: 0
        },
        database: {
          queryTime: new Map(),
          slowQueries: []
        }
      },
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0
      },
      errors: {
        total: 0,
        byType: new Map(),
        recent: []
      },
      business: {
        orders: 0,
        products: 0,
        users: 0
      }
    }

    this.startTime = Date.now()
    this.cleanupInterval = null

    this.startCleanupTask()
  }

  /**
   * Calculate overall system health score (0-100)
   */
  calculateHealthScore() {
    const metrics = this.getRealtimeMetrics()
    let score = 100

    // Memory usage impact (max 30 points)
    const memoryMB = metrics.memoryUsage.heapUsed
    if (memoryMB > 500) {
      score -= 30
    } else if (memoryMB > 300) {
      score -= 20
    } else if (memoryMB > 200) {
      score -= 10
    }

    // Error rate impact (max 40 points)
    const errorRate = metrics.errorRate
    if (errorRate > 20) {
      score -= 40
    } else if (errorRate > 10) {
      score -= 30
    } else if (errorRate > 5) {
      score -= 20
    } else if (errorRate > 2) {
      score -= 10
    }

    // Response time impact (max 20 points)
    const avgResponseTime = metrics.performance.averageResponseTime
    if (avgResponseTime > 5000) {
      score -= 20
    } else if (avgResponseTime > 2000) {
      score -= 15
    } else if (avgResponseTime > 1000) {
      score -= 10
    } else if (avgResponseTime > 500) {
      score -= 5
    }

    // Uptime impact (max 10 points)
    const uptimeHours = (Date.now() - this.startTime) / 1000 / 60 / 60
    if (uptimeHours < 1) {
      score -= 10
    } else if (uptimeHours < 6) {
      score -= 5
    }

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  /**
   * Get real-time metrics snapshot
   */
  getRealtimeMetrics() {
    const memUsage = process.memoryUsage()

    return {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      memoryUsage: {
        heapUsed: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100, // MB
        heapTotal: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100, // MB
        external: Math.round((memUsage.external / 1024 / 1024) * 100) / 100, // MB
        rss: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100 // MB
      },
      performance: {
        averageResponseTime: this.metrics.performance.responseTime.average,
        totalRequests: this.metrics.requests.total,
        successfulRequests: this.metrics.requests.successful,
        failedRequests: this.metrics.requests.failed,
        errorRate:
          this.metrics.requests.total > 0
            ? (this.metrics.requests.failed / this.metrics.requests.total) * 100
            : 0
      },
      business: {
        orders: this.metrics.business.orders,
        products: this.metrics.business.products,
        users: this.metrics.business.users
      },
      errors: {
        total: this.metrics.errors.total,
        recent: this.metrics.errors.recent.slice(-10)
      }
    }
  }

  /**
   * Record a request metric
   */
  recordRequest(endpoint, method, responseTime, success) {
    this.metrics.requests.total++
    if (success) {
      this.metrics.requests.successful++
    } else {
      this.metrics.requests.failed++
    }

    // Update endpoint-specific metrics
    const key = `${method} ${endpoint}`
    if (!this.metrics.requests.byEndpoint.has(key)) {
      this.metrics.requests.byEndpoint.set(key, {
        total: 0,
        successful: 0,
        failed: 0,
        totalResponseTime: 0
      })
    }

    const endpointMetrics = this.metrics.requests.byEndpoint.get(key)
    endpointMetrics.total++
    endpointMetrics.totalResponseTime += responseTime
    if (success) {
      endpointMetrics.successful++
    } else {
      endpointMetrics.failed++
    }

    // Update performance metrics
    this.metrics.performance.responseTime.total += responseTime
    this.metrics.performance.responseTime.count++
    this.metrics.performance.responseTime.average =
      this.metrics.performance.responseTime.total / this.metrics.performance.responseTime.count
  }

  /**
   * Record an error
   */
  recordError(errorType, errorMessage) {
    this.metrics.errors.total++

    if (!this.metrics.errors.byType.has(errorType)) {
      this.metrics.errors.byType.set(errorType, 0)
    }
    this.metrics.errors.byType.set(errorType, this.metrics.errors.byType.get(errorType) + 1)

    this.metrics.errors.recent.push({
      type: errorType,
      message: errorMessage,
      timestamp: Date.now()
    })

    // Keep only last 100 errors
    if (this.metrics.errors.recent.length > 100) {
      this.metrics.errors.recent = this.metrics.errors.recent.slice(-100)
    }
  }

  /**
   * Record business metric
   */
  recordBusinessMetric(type, count = 1) {
    if (Object.prototype.hasOwnProperty.call(this.metrics.business, type)) {
      this.metrics.business[type] += count
    }
  }

  /**
   * Get endpoint-specific metrics
   */
  getEndpointMetrics() {
    const result = {}
    for (const [endpoint, metrics] of this.metrics.requests.byEndpoint) {
      result[endpoint] = {
        ...metrics,
        averageResponseTime: metrics.total > 0 ? metrics.totalResponseTime / metrics.total : 0
      }
    }
    return result
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const byType = {}
    for (const [type, count] of this.metrics.errors.byType) {
      byType[type] = count
    }

    return {
      total: this.metrics.errors.total,
      byType,
      recent: this.metrics.errors.recent.slice(-10)
    }
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics.requests = {
      total: 0,
      successful: 0,
      failed: 0,
      byEndpoint: new Map()
    }
    this.metrics.performance = {
      responseTime: { total: 0, count: 0, average: 0 },
      database: { queryTime: new Map(), slowQueries: [] }
    }
    this.metrics.errors = { total: 0, byType: new Map(), recent: [] }
    this.metrics.business = { orders: 0, products: 0, users: 0 }
    this.startTime = Date.now()
  }

  /**
   * Start cleanup task for old metrics
   */
  startCleanupTask() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldMetrics()
    }, 60000) // Every minute
  }

  /**
   * Clean up old metrics
   */
  cleanupOldMetrics() {
    try {
      // Clean up endpoint metrics (keep only last 1000 entries)
      if (this.metrics.requests.byEndpoint.size > 1000) {
        const entries = Array.from(this.metrics.requests.byEndpoint.entries())
        const sorted = entries.sort((a, b) => {
          const aTime = a[1].lastAccess || 0
          const bTime = b[1].lastAccess || 0
          return bTime - aTime
        })
        this.metrics.requests.byEndpoint = new Map(sorted.slice(0, 1000))
      }

      // Clean up old error entries
      const oneHourAgo = Date.now() - 3600000
      this.metrics.errors.recent = this.metrics.errors.recent.filter(e => e.timestamp > oneHourAgo)

      logger.debug('Metrics cleanup completed')
    } catch (error) {
      logger.error('Error during metrics cleanup', error)
    }
  }

  /**
   * Stop all cleanup tasks
   */
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Create singleton instance
const metricsCollector = new MetricsCollector()

/**
 * Metrics middleware for recording request metrics
 */
function metricsMiddleware(req, res, next) {
  const startTime = Date.now()

  // Override res.end to capture response
  const originalEnd = res.end
  res.end = function (...args) {
    const endTime = Date.now()
    const responseTime = endTime - startTime
    const success = res.statusCode < 400

    const endpoint = req.route ? req.route.path : req.path
    const method = req.method

    metricsCollector.recordRequest(endpoint, method, responseTime, success)

    // Call original end
    originalEnd.apply(res, args)
  }

  next()
}

/**
 * Order metrics middleware - records business metrics for orders
 */
function orderMetricsMiddleware(_req, _res, next) {
  // Increment orders counter
  metricsCollector.recordBusinessMetric('orders')

  next()
}

/**
 * Get realtime metrics wrapper
 */
function getRealtimeMetrics(_req, _res) {
  const metrics = metricsCollector.getRealtimeMetrics()
  return {
    success: true,
    data: metrics,
    message: 'Realtime metrics retrieved successfully'
  }
}

/**
 * Get metrics report
 */
function getMetricsReport() {
  return {
    realtime: metricsCollector.getRealtimeMetrics(),
    endpoints: metricsCollector.getEndpointMetrics(),
    errors: metricsCollector.getErrorStats(),
    healthScore: metricsCollector.calculateHealthScore()
  }
}

export {
  metricsCollector,
  metricsMiddleware,
  orderMetricsMiddleware,
  getRealtimeMetrics,
  getMetricsReport
}
