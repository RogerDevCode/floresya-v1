/**
 * Advanced Metrics Collector
 * Comprehensive monitoring system for production metrics
 * Tracks performance, errors, and business metrics
 */

import { performance } from 'perf_hooks'
import { logger } from '../utils/logger.js'

class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byEndpoint: new Map(),
        byStatusCode: new Map(),
        responseTimes: []
      },
      performance: {
        memoryUsage: [],
        cpuUsage: [],
        eventLoopLag: [],
        gcPauses: []
      },
      business: {
        ordersCreated: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        topProducts: new Map(),
        errorRate: 0
      },
      errors: {
        byType: new Map(),
        bySeverity: new Map(),
        recent: []
      },
      circuitBreaker: {
        state: 'CLOSED',
        failureCount: 0,
        successCount: 0,
        lastFailure: null
      },
      rateLimiting: {
        requestsBlocked: 0,
        requestsAllowed: 0,
        byEndpoint: new Map()
      }
    }

    this.collectionInterval = null
    this.retentionPeriod = 24 * 60 * 60 * 1000 // 24 hours
    this.maxMetricsSize = 10000

    this.startCollection()
  }

  /**
   * Start collecting system metrics
   */
  startCollection() {
    // Collect system metrics every 10 seconds
    this.collectionInterval = setInterval(() => {
      this.collectSystemMetrics()
    }, 10000)

    logger.info('📊 Metrics collector iniciado')
  }

  /**
   * Stop collecting metrics
   */
  stopCollection() {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval)
      this.collectionInterval = null
    }
    logger.info('Metrics collector stopped')
  }

  /**
   * Collect system performance metrics
   */
  collectSystemMetrics() {
    try {
      const memUsage = process.memoryUsage()

      this.metrics.performance.memoryUsage.push({
        timestamp: new Date().toISOString(),
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      })

      // Event loop lag measurement
      const start = performance.now()
      setImmediate(() => {
        const lag = performance.now() - start
        this.metrics.performance.eventLoopLag.push({
          timestamp: new Date().toISOString(),
          lag: Math.round(lag * 100) / 100 // ms with 2 decimal places
        })
      })

      // Clean old metrics to prevent memory leaks
      this.cleanupOldMetrics()
    } catch (error) {
      logger.error('Error collecting system metrics', error)
    }
  }

  /**
   * Record HTTP request metrics
   */
  recordRequest(req, res, duration) {
    try {
      this.metrics.requests.total++

      // Track by endpoint
      const endpoint = `${req.method} ${req.path}`
      const endpointMetrics = this.metrics.requests.byEndpoint.get(endpoint) || {
        count: 0,
        totalTime: 0,
        errors: 0
      }
      endpointMetrics.count++
      endpointMetrics.totalTime += duration
      this.metrics.requests.byEndpoint.set(endpoint, endpointMetrics)

      // Track response times
      this.metrics.requests.responseTimes.push(duration)
      if (this.metrics.requests.responseTimes.length > this.maxMetricsSize) {
        this.metrics.requests.responseTimes.shift()
      }

      // Track by status code
      const statusCode = res.statusCode.toString()
      const statusMetrics = this.metrics.requests.byStatusCode.get(statusCode) || { count: 0 }
      statusMetrics.count++
      this.metrics.requests.byStatusCode.set(statusCode, statusMetrics)

      // Track success/failure
      if (res.statusCode >= 200 && res.statusCode < 400) {
        this.metrics.requests.successful++
      } else {
        this.metrics.requests.failed++
      }

      // Calculate error rate
      this.metrics.business.errorRate =
        (this.metrics.requests.failed / this.metrics.requests.total) * 100
    } catch (error) {
      logger.error('Error recording request metrics', error)
    }
  }

  /**
   * Record business metrics for orders
   */
  recordOrder(orderData) {
    try {
      this.metrics.business.ordersCreated++

      // Track revenue
      if (orderData.total_amount_usd) {
        this.metrics.business.totalRevenue += orderData.total_amount_usd

        // Update average order value
        this.metrics.business.averageOrderValue =
          this.metrics.business.totalRevenue / this.metrics.business.ordersCreated
      }

      // Track product popularity
      if (orderData.items && Array.isArray(orderData.items)) {
        orderData.items.forEach(item => {
          const productKey = item.product_name || `Product ${item.product_id}`
          const currentCount = this.metrics.business.topProducts.get(productKey) || 0
          this.metrics.business.topProducts.set(productKey, currentCount + item.quantity)
        })
      }
    } catch (error) {
      logger.error('Error recording order metrics', error)
    }
  }

  /**
   * Record error metrics
   */
  recordError(error, context = {}) {
    try {
      const errorKey = error.name || 'UnknownError'
      const currentCount = this.metrics.errors.byType.get(errorKey) || 0
      this.metrics.errors.byType.set(errorKey, currentCount + 1)

      // Track by severity
      const severity = error.severity || 'medium'
      const severityCount = this.metrics.errors.bySeverity.get(severity) || 0
      this.metrics.errors.bySeverity.set(severity, severityCount + 1)

      // Store recent errors (last 100)
      this.metrics.errors.recent.push({
        name: error.name,
        message: error.message,
        severity,
        context,
        timestamp: new Date().toISOString()
      })

      if (this.metrics.errors.recent.length > 100) {
        this.metrics.errors.recent.shift()
      }
    } catch (recordError) {
      logger.error('Error recording error metrics', recordError)
    }
  }

  /**
   * Record circuit breaker metrics
   */
  recordCircuitBreaker(state, failureCount, successCount, lastFailure) {
    this.metrics.circuitBreaker.state = state
    this.metrics.circuitBreaker.failureCount = failureCount
    this.metrics.circuitBreaker.successCount = successCount
    this.metrics.circuitBreaker.lastFailure = lastFailure
  }

  /**
   * Record rate limiting metrics
   */
  recordRateLimit(blocked, endpoint) {
    if (blocked) {
      this.metrics.rateLimiting.requestsBlocked++

      const endpointCount = this.metrics.rateLimiting.byEndpoint.get(endpoint) || 0
      this.metrics.rateLimiting.byEndpoint.set(endpoint, endpointCount + 1)
    } else {
      this.metrics.rateLimiting.requestsAllowed++
    }
  }

  /**
   * Clean up old metrics to prevent memory leaks
   */
  cleanupOldMetrics() {
    const cutoffTime = Date.now() - this.retentionPeriod

    // Clean memory usage data
    this.metrics.performance.memoryUsage = this.metrics.performance.memoryUsage.filter(
      m => new Date(m.timestamp).getTime() > cutoffTime
    )

    // Clean event loop lag data
    this.metrics.performance.eventLoopLag = this.metrics.performance.eventLoopLag.filter(
      m => new Date(m.timestamp).getTime() > cutoffTime
    )

    // Clean response times (keep only recent ones)
    if (this.metrics.requests.responseTimes.length > this.maxMetricsSize) {
      this.metrics.requests.responseTimes = this.metrics.requests.responseTimes.slice(
        -this.maxMetricsSize
      )
    }
  }

  /**
   * Calculate percentiles for response times
   */
  calculatePercentiles(values, percentiles) {
    if (values.length === 0) {
      return {}
    }

    const sorted = [...values].sort((a, b) => a - b)
    const results = {}

    for (const p of percentiles) {
      const index = Math.ceil((p / 100) * sorted.length) - 1
      results[p] = sorted[Math.max(0, index)]
    }

    return results
  }

  /**
   * Get comprehensive metrics report
   */
  getMetricsReport(timeRange = 3600000) {
    // Last hour by default
    const now = Date.now()
    const cutoffTime = now - timeRange

    // Filter recent response times
    const recentResponseTimes = this.metrics.requests.responseTimes.filter(
      time => now - time <= timeRange
    )

    const avgResponseTime =
      recentResponseTimes.length > 0
        ? recentResponseTimes.reduce((a, b) => a + b, 0) / recentResponseTimes.length
        : 0

    const percentiles = this.calculatePercentiles(recentResponseTimes, [50, 95, 99])

    // Filter recent memory usage
    const recentMemory = this.metrics.performance.memoryUsage.filter(
      m => new Date(m.timestamp).getTime() > cutoffTime
    )

    const latestMemory = recentMemory[recentMemory.length - 1] || {}

    // Get top products
    const topProducts = Array.from(this.metrics.business.topProducts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([product, count]) => ({ product, count }))

    return {
      timestamp: new Date().toISOString(),
      timeRange: `${timeRange / 1000}s`,
      requests: {
        total: this.metrics.requests.total,
        successful: this.metrics.requests.successful,
        failed: this.metrics.requests.failed,
        successRate:
          this.metrics.requests.total > 0
            ? `${((this.metrics.requests.successful / this.metrics.requests.total) * 100).toFixed(2)}%`
            : '0%',
        averageResponseTime: `${Math.round(avgResponseTime)}ms`,
        responseTimePercentiles: {
          p50: `${Math.round(percentiles[50] || 0)}ms`,
          p95: `${Math.round(percentiles[95] || 0)}ms`,
          p99: `${Math.round(percentiles[99] || 0)}ms`
        },
        byEndpoint: Object.fromEntries(
          Array.from(this.metrics.requests.byEndpoint.entries()).map(([endpoint, metrics]) => [
            endpoint,
            {
              count: metrics.count,
              averageTime: `${Math.round(metrics.totalTime / metrics.count)}ms`,
              errorRate: `${((metrics.errors / metrics.count) * 100).toFixed(2)}%`
            }
          ])
        ),
        byStatusCode: Object.fromEntries(this.metrics.requests.byStatusCode)
      },
      performance: {
        memory: {
          current: latestMemory,
          trend:
            recentMemory.length > 1
              ? recentMemory[recentMemory.length - 1].heapUsed - recentMemory[0].heapUsed
              : 0
        },
        eventLoop: {
          averageLag:
            recentResponseTimes.length > 0
              ? `${Math.round(recentResponseTimes.reduce((a, b) => a + b, 0) / recentResponseTimes.length)}ms`
              : '0ms'
        }
      },
      business: {
        ordersCreated: this.metrics.business.ordersCreated,
        totalRevenue: `$${this.metrics.business.totalRevenue.toFixed(2)}`,
        averageOrderValue: `$${this.metrics.business.averageOrderValue.toFixed(2)}`,
        topProducts,
        errorRate: `${this.metrics.business.errorRate.toFixed(2)}%`
      },
      errors: {
        total: this.metrics.errors.recent.length,
        byType: Object.fromEntries(this.metrics.errors.byType),
        bySeverity: Object.fromEntries(this.metrics.errors.bySeverity),
        recent: this.metrics.errors.recent.slice(-5) // Last 5 errors
      },
      circuitBreaker: this.metrics.circuitBreaker,
      rateLimiting: {
        requestsBlocked: this.metrics.rateLimiting.requestsBlocked,
        requestsAllowed: this.metrics.rateLimiting.requestsAllowed,
        blockRate:
          this.metrics.rateLimiting.requestsAllowed > 0
            ? `${((this.metrics.rateLimiting.requestsBlocked / (this.metrics.rateLimiting.requestsBlocked + this.metrics.rateLimiting.requestsAllowed)) * 100).toFixed(2)}%`
            : '0%',
        byEndpoint: Object.fromEntries(this.metrics.rateLimiting.byEndpoint)
      },
      health: this.calculateHealthScore()
    }
  }

  /**
   * Calculate overall system health score (0-100)
   */
  calculateHealthScore() {
    let score = 100

    // Penalize based on error rate
    const errorRate = this.metrics.business.errorRate
    if (errorRate > 5) {
      score -= 20
    }
    if (errorRate > 10) {
      score -= 30
    }
    if (errorRate > 25) {
      score -= 40
    }

    // Penalize based on circuit breaker state
    if (this.metrics.circuitBreaker.state === 'OPEN') {
      score -= 50
    }
    if (this.metrics.circuitBreaker.state === 'HALF_OPEN') {
      score -= 25
    }

    // Penalize based on memory usage
    const latestMemory =
      this.metrics.performance.memoryUsage[this.metrics.performance.memoryUsage.length - 1]
    if (latestMemory && latestMemory.heapUsed > 100) {
      score -= 10
    }
    if (latestMemory && latestMemory.heapUsed > 200) {
      score -= 20
    }

    // Penalize based on rate limiting
    const blockRate =
      this.metrics.rateLimiting.requestsAllowed > 0
        ? (this.metrics.rateLimiting.requestsBlocked /
            (this.metrics.rateLimiting.requestsBlocked +
              this.metrics.rateLimiting.requestsAllowed)) *
          100
        : 0
    if (blockRate > 10) {
      score -= 15
    }
    if (blockRate > 25) {
      score -= 30
    }

    return Math.max(0, score)
  }

  /**
   * Get real-time metrics for dashboard
   */
  getRealtimeMetrics() {
    const recentResponseTimes = this.metrics.requests.responseTimes.slice(-100) // Last 100 requests
    const avgResponseTime =
      recentResponseTimes.length > 0
        ? recentResponseTimes.reduce((a, b) => a + b, 0) / recentResponseTimes.length
        : 0

    return {
      timestamp: new Date().toISOString(),
      requestsPerSecond: this.calculateRequestsPerSecond(),
      averageResponseTime: `${Math.round(avgResponseTime)}ms`,
      errorRate: `${this.metrics.business.errorRate.toFixed(2)}%`,
      memoryUsage:
        this.metrics.performance.memoryUsage[this.metrics.performance.memoryUsage.length - 1] || {},
      circuitBreakerState: this.metrics.circuitBreaker.state,
      activeConnections: this.estimateActiveConnections(),
      healthScore: this.calculateHealthScore()
    }
  }

  /**
   * Calculate requests per second
   */
  calculateRequestsPerSecond() {
    const now = Date.now()

    // Count requests in the last second
    const recentRequests = this.metrics.requests.responseTimes.filter(time => now - time <= 1000)

    return recentRequests.length
  }

  /**
   * Estimate active connections (rough approximation)
   */
  estimateActiveConnections() {
    // This is a simple estimation based on concurrent requests
    // In a real system, you'd get this from the HTTP server
    const recentActivity = this.metrics.requests.responseTimes.filter(
      time => Date.now() - time <= 5000 // Last 5 seconds
    )

    return Math.min(recentActivity.length, 1000) // Cap at 1000
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(format = 'json') {
    const report = this.getMetricsReport()

    if (format === 'prometheus') {
      return this.exportPrometheusFormat(report)
    }

    return report
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheusFormat(report) {
    const lines = []

    // Request metrics
    lines.push(`# HELP floresya_requests_total Total number of requests`)
    lines.push(`# TYPE floresya_requests_total counter`)
    lines.push(`floresya_requests_total ${report.requests.total}`)

    lines.push(`# HELP floresya_requests_successful_total Total successful requests`)
    lines.push(`# TYPE floresya_requests_successful_total counter`)
    lines.push(`floresya_requests_successful_total ${report.requests.successful}`)

    // Response time metrics
    lines.push(`# HELP floresya_response_time_seconds Response time in seconds`)
    lines.push(`# TYPE floresya_response_time_seconds histogram`)
    lines.push(
      `floresya_response_time_seconds{p50} ${report.requests.responseTimePercentiles.p50.replace('ms', '') / 1000}`
    )
    lines.push(
      `floresya_response_time_seconds{p95} ${report.requests.responseTimePercentiles.p95.replace('ms', '') / 1000}`
    )
    lines.push(
      `floresya_response_time_seconds{p99} ${report.requests.responseTimePercentiles.p99.replace('ms', '') / 1000}`
    )

    // Business metrics
    lines.push(`# HELP floresya_orders_total Total orders created`)
    lines.push(`# TYPE floresya_orders_total counter`)
    lines.push(`floresya_orders_total ${report.business.ordersCreated}`)

    lines.push(`# HELP floresya_revenue_total Total revenue in USD`)
    lines.push(`# TYPE floresya_revenue_total counter`)
    lines.push(`floresya_revenue_total ${report.business.totalRevenue.replace('$', '')}`)

    // Health score
    lines.push(`# HELP floresya_health_score Current health score`)
    lines.push(`# TYPE floresya_health_score gauge`)
    lines.push(`floresya_health_score ${report.health}`)

    return lines.join('\n')
  }
}

// Global metrics collector instance
const metricsCollector = new MetricsCollector()

/**
 * Middleware to record request metrics
 */
export function metricsMiddleware(req, res, next) {
  const startTime = performance.now()

  // Record metrics when response finishes
  res.on('finish', () => {
    const duration = performance.now() - startTime
    metricsCollector.recordRequest(req, res, duration)
  })

  next()
}

/**
 * Middleware to record order business metrics
 */
export function orderMetricsMiddleware(req, res, next) {
  const originalSend = res.send

  res.send = function (data) {
    // Check if this is a successful order creation
    if (res.statusCode === 201 && req.method === 'POST' && req.path === '/api/orders') {
      try {
        const orderData = JSON.parse(data)
        if (orderData.success && orderData.data) {
          metricsCollector.recordOrder(orderData.data)
        }
      } catch (error) {
        console.error('Error parsing order data for metrics', error)
      }
    }

    originalSend.call(this, data)
  }

  next()
}

/**
 * Get metrics report endpoint
 */
export function getMetricsReport(req, res) {
  const timeRange = parseInt(req.query.timeRange) || 3600000 // Default 1 hour
  const format = req.query.format || 'json'

  const report = metricsCollector.getMetricsReport(timeRange)

  if (format === 'prometheus') {
    res.set('Content-Type', 'text/plain')
    res.send(metricsCollector.exportMetrics('prometheus'))
  } else {
    res.json({
      success: true,
      data: report
    })
  }
}

/**
 * Get real-time metrics endpoint
 */
export function getRealtimeMetrics(req, res) {
  const metrics = metricsCollector.getRealtimeMetrics()

  res.json({
    success: true,
    data: metrics
  })
}

/**
 * Export metrics collector for direct use
 */
export { metricsCollector }
export default metricsCollector
