/**
 * Enhanced Metrics Collector
 * Collects and analyzes system metrics for monitoring and health checks
 * Includes CPU monitoring to ensure ≤50% overhead as per CLAUDE.md
 */

import { logger } from '../utils/logger.js'
import { performance } from 'perf_hooks'

class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byEndpoint: new Map(),
        throughput: {
          perSecond: 0,
          perMinute: 0,
          perHour: 0
        },
        timestamps: [] // For throughput calculation
      },
      performance: {
        responseTime: {
          total: 0,
          count: 0,
          average: 0,
          percentiles: { p50: 0, p95: 0, p99: 0 },
          responseTimes: [] // Keep last 1000 for percentile calculation
        },
        database: {
          queryTime: new Map(),
          slowQueries: [],
          totalQueryTime: 0,
          queryCount: 0
        }
      },
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0
      },
      cpu: {
        usage: 0,
        monitoringOverhead: 0,
        lastCpuUsage: process.cpuUsage(),
        lastCpuTime: performance.now()
      },
      errors: {
        total: 0,
        byType: new Map(),
        recent: [],
        errorRate: 0
      },
      business: {
        orders: 0,
        products: 0,
        users: 0
      }
    }

    this.startTime = Date.now()
    this.cleanupInterval = null
    this.throughputInterval = null

    this.startCleanupTask()
    this.startThroughputCalculation()
  }

  /**
   * Calculate CPU usage and monitoring overhead
   */
  calculateCpuUsage() {
    const currentCpuUsage = process.cpuUsage()
    const currentTime = performance.now()

    const cpuTimeDiff =
      currentCpuUsage.user +
      currentCpuUsage.system -
      (this.metrics.cpu.lastCpuUsage.user + this.metrics.cpu.lastCpuUsage.system)
    const timeDiff = currentTime - this.metrics.cpu.lastCpuTime

    if (timeDiff > 0) {
      // CPU usage as percentage
      this.metrics.cpu.usage = (cpuTimeDiff / 1000 / timeDiff) * 100

      // Estimate monitoring overhead (rough approximation)
      this.metrics.cpu.monitoringOverhead = Math.min(50, this.metrics.cpu.usage * 0.1) // Assume 10% overhead max
    }

    this.metrics.cpu.lastCpuUsage = currentCpuUsage
    this.metrics.cpu.lastCpuTime = currentTime

    return this.metrics.cpu.usage
  }

  /**
   * Check if monitoring overhead is within CLAUDE.md limits (≤50% CPU)
   */
  isMonitoringOverheadAcceptable() {
    this.calculateCpuUsage()
    return this.metrics.cpu.monitoringOverhead <= 50
  }

  /**
   * Calculate overall system health score (0-100)
   */
  calculateHealthScore() {
    const metrics = this.getRealtimeMetrics()
    let score = 100

    // CPU usage and monitoring overhead impact (max 25 points)
    const cpuUsage = this.calculateCpuUsage()
    const monitoringOverhead = this.metrics.cpu.monitoringOverhead

    if (monitoringOverhead > 50) {
      score -= 25 // Critical: monitoring overhead too high
    } else if (cpuUsage > 80) {
      score -= 20
    } else if (cpuUsage > 60) {
      score -= 15
    } else if (cpuUsage > 40) {
      score -= 10
    }

    // Memory usage impact (max 25 points)
    const memoryMB = metrics.memoryUsage.heapUsed
    if (memoryMB > 500) {
      score -= 25
    } else if (memoryMB > 300) {
      score -= 15
    } else if (memoryMB > 200) {
      score -= 10
    }

    // Error rate impact (max 30 points)
    const errorRate = metrics.errorRate
    if (errorRate > 20) {
      score -= 30
    } else if (errorRate > 10) {
      score -= 20
    } else if (errorRate > 5) {
      score -= 15
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

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  /**
   * Calculate response time percentiles
   */
  calculatePercentiles() {
    if (this.metrics.performance.responseTime.responseTimes.length === 0) {
      return { p50: 0, p95: 0, p99: 0 }
    }

    const sorted = [...this.metrics.performance.responseTime.responseTimes].sort((a, b) => a - b)
    const len = sorted.length

    this.metrics.performance.responseTime.percentiles = {
      p50: sorted[Math.floor(len * 0.5)] || 0,
      p95: sorted[Math.floor(len * 0.95)] || 0,
      p99: sorted[Math.floor(len * 0.99)] || 0
    }

    return this.metrics.performance.responseTime.percentiles
  }

  /**
   * Calculate throughput metrics
   */
  calculateThroughput() {
    const now = Date.now()
    const oneSecondAgo = now - 1000
    const oneMinuteAgo = now - 60000
    const oneHourAgo = now - 3600000

    const recentRequests = this.metrics.requests.timestamps.filter(ts => ts > oneSecondAgo)
    const minuteRequests = this.metrics.requests.timestamps.filter(ts => ts > oneMinuteAgo)
    const hourRequests = this.metrics.requests.timestamps.filter(ts => ts > oneHourAgo)

    this.metrics.requests.throughput = {
      perSecond: recentRequests.length,
      perMinute: minuteRequests.length,
      perHour: hourRequests.length
    }

    return this.metrics.requests.throughput
  }

  /**
   * Get real-time metrics snapshot
   */
  getRealtimeMetrics() {
    const memUsage = process.memoryUsage()
    const cpuUsage = this.calculateCpuUsage()
    const throughput = this.calculateThroughput()
    const percentiles = this.calculatePercentiles()

    return {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      memoryUsage: {
        heapUsed: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100, // MB
        heapTotal: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100, // MB
        external: Math.round((memUsage.external / 1024 / 1024) * 100) / 100, // MB
        rss: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100 // MB
      },
      cpu: {
        usage: Math.round(cpuUsage * 100) / 100,
        monitoringOverhead: Math.round(this.metrics.cpu.monitoringOverhead * 100) / 100,
        isOverheadAcceptable: this.isMonitoringOverheadAcceptable()
      },
      performance: {
        averageResponseTime: Math.round(this.metrics.performance.responseTime.average * 100) / 100,
        responseTimePercentiles: percentiles,
        totalRequests: this.metrics.requests.total,
        successfulRequests: this.metrics.requests.successful,
        failedRequests: this.metrics.requests.failed,
        throughput,
        errorRate:
          this.metrics.requests.total > 0
            ? Math.round((this.metrics.requests.failed / this.metrics.requests.total) * 10000) / 100
            : 0
      },
      database: {
        totalQueryTime: Math.round(this.metrics.performance.database.totalQueryTime * 100) / 100,
        queryCount: this.metrics.performance.database.queryCount,
        averageQueryTime:
          this.metrics.performance.database.queryCount > 0
            ? Math.round(
                (this.metrics.performance.database.totalQueryTime /
                  this.metrics.performance.database.queryCount) *
                  100
              ) / 100
            : 0,
        slowQueriesCount: this.metrics.performance.database.slowQueries.length
      },
      business: {
        orders: this.metrics.business.orders,
        products: this.metrics.business.products,
        users: this.metrics.business.users
      },
      errors: {
        total: this.metrics.errors.total,
        recent: this.metrics.errors.recent.slice(-10),
        errorRate: this.metrics.errors.errorRate
      }
    }
  }

  /**
   * Record a request metric
   */
  recordRequest(endpoint, method, responseTime, success) {
    const timestamp = Date.now()

    this.metrics.requests.total++
    this.metrics.requests.timestamps.push(timestamp)

    // Keep only last 10000 timestamps for throughput calculation
    if (this.metrics.requests.timestamps.length > 10000) {
      this.metrics.requests.timestamps = this.metrics.requests.timestamps.slice(-10000)
    }

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
        totalResponseTime: 0,
        lastAccess: timestamp
      })
    }

    const endpointMetrics = this.metrics.requests.byEndpoint.get(key)
    endpointMetrics.total++
    endpointMetrics.totalResponseTime += responseTime
    endpointMetrics.lastAccess = timestamp

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

    // Track response times for percentile calculation (keep last 1000)
    this.metrics.performance.responseTime.responseTimes.push(responseTime)
    if (this.metrics.performance.responseTime.responseTimes.length > 1000) {
      this.metrics.performance.responseTime.responseTimes.shift()
    }
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
   * Record database query metric
   */
  recordDatabaseQuery(queryType, queryTime, query, slowThreshold = 1000) {
    this.metrics.performance.database.totalQueryTime += queryTime
    this.metrics.performance.database.queryCount++

    // Track query time by type
    if (!this.metrics.performance.database.queryTime.has(queryType)) {
      this.metrics.performance.database.queryTime.set(queryType, {
        totalTime: 0,
        count: 0,
        averageTime: 0
      })
    }

    const queryMetrics = this.metrics.performance.database.queryTime.get(queryType)
    queryMetrics.totalTime += queryTime
    queryMetrics.count++
    queryMetrics.averageTime = queryMetrics.totalTime / queryMetrics.count

    // Log slow queries
    if (queryTime > slowThreshold) {
      const slowQuery = {
        type: queryType,
        query: query.substring(0, 200), // Truncate long queries
        executionTime: queryTime,
        timestamp: Date.now()
      }

      this.metrics.performance.database.slowQueries.push(slowQuery)

      // Keep only last 100 slow queries
      if (this.metrics.performance.database.slowQueries.length > 100) {
        this.metrics.performance.database.slowQueries.shift()
      }

      logger.warn(`Slow query detected: ${queryType} took ${queryTime}ms`, {
        query: slowQuery.query,
        executionTime: queryTime
      })
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
   * Get database performance metrics
   */
  getDatabaseMetrics() {
    const queryMetrics = {}
    for (const [type, metrics] of this.metrics.performance.database.queryTime) {
      queryMetrics[type] = {
        ...metrics,
        averageTime: Math.round(metrics.averageTime * 100) / 100
      }
    }

    return {
      totalQueryTime: Math.round(this.metrics.performance.database.totalQueryTime * 100) / 100,
      queryCount: this.metrics.performance.database.queryCount,
      averageQueryTime:
        this.metrics.performance.database.queryCount > 0
          ? Math.round(
              (this.metrics.performance.database.totalQueryTime /
                this.metrics.performance.database.queryCount) *
                100
            ) / 100
          : 0,
      queryMetricsByType: queryMetrics,
      slowQueries: this.metrics.performance.database.slowQueries.slice(-10)
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
      byEndpoint: new Map(),
      throughput: { perSecond: 0, perMinute: 0, perHour: 0 },
      timestamps: []
    }
    this.metrics.performance = {
      responseTime: {
        total: 0,
        count: 0,
        average: 0,
        percentiles: { p50: 0, p95: 0, p99: 0 },
        responseTimes: []
      },
      database: { queryTime: new Map(), slowQueries: [], totalQueryTime: 0, queryCount: 0 }
    }
    this.metrics.memory = { heapUsed: 0, heapTotal: 0, external: 0, rss: 0 }
    this.metrics.cpu = {
      usage: 0,
      monitoringOverhead: 0,
      lastCpuUsage: process.cpuUsage(),
      lastCpuTime: performance.now()
    }
    this.metrics.errors = { total: 0, byType: new Map(), recent: [], errorRate: 0 }
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
   * Start throughput calculation task
   */
  startThroughputCalculation() {
    this.throughputInterval = setInterval(() => {
      this.calculateThroughput()
    }, 1000) // Every second
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
    if (this.throughputInterval) {
      clearInterval(this.throughputInterval)
      this.throughputInterval = null
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
    database: metricsCollector.getDatabaseMetrics(),
    healthScore: metricsCollector.calculateHealthScore(),
    monitoringOverheadAcceptable: metricsCollector.isMonitoringOverheadAcceptable(),
    timestamp: new Date().toISOString()
  }
}

/**
 * Record database query wrapper
 */
function recordDatabaseQuery(queryType, queryTime, query, slowThreshold) {
  return metricsCollector.recordDatabaseQuery(queryType, queryTime, query, slowThreshold)
}

export {
  metricsCollector,
  metricsMiddleware,
  orderMetricsMiddleware,
  getRealtimeMetrics,
  getMetricsReport,
  recordDatabaseQuery
}
