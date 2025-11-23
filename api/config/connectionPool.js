/**
 * Procesado por B
 */

/**
 * Connection Pool Configuration
 * Optimized Supabase connection pooling for production
 */

import { createClient } from '@supabase/supabase-js'
import { logger } from '../utils/logger.js'

// Pool configuration
const POOL_CONFIG = {
  // Connection pool settings
  db: {
    schema: 'public',
    pool: {
      min: 2, // Minimum connections in pool
      max: 10, // Maximum connections in pool
      acquireTimeoutMillis: 60000, // 60 seconds
      createTimeoutMillis: 30000, // 30 seconds
      destroyTimeoutMillis: 5000, // 5 seconds
      idleTimeoutMillis: 30000, // 30 seconds
      reapIntervalMillis: 1000, // 1 second
      createRetryIntervalMillis: 200 // 200ms
    },
    // Query optimization settings
    query: {
      timeout: 30000, // 30 second query timeout
      retries: 3 // Retry failed queries 3 times
    }
  },

  // Global fetch configuration
  fetch: {
    // Connection keep-alive
    keepalive: true,
    // Timeout for requests
    timeout: 30000 // 30 seconds
  },

  // Rate limiting
  rateLimit: {
    maxRequests: 1000, // Max requests per minute
    windowMs: 60000 // 1 minute window
  }
}

// Request tracking for rate limiting
const requestTracker = {
  requests: [],
  maxRequests: POOL_CONFIG.rateLimit.maxRequests,
  windowMs: POOL_CONFIG.rateLimit.windowMs,

  trackRequest() {
    const now = Date.now()
    this.requests.push(now)

    // Remove old requests outside window
    this.requests = this.requests.filter(time => now - time < this.windowMs)

    return this.requests.length <= this.maxRequests
  },

  getRequestsInWindow() {
    const now = Date.now()
    return this.requests.filter(time => now - time < this.windowMs).length
  },

  getRemainingRequests() {
    return Math.max(0, this.maxRequests - this.getRequestsInWindow())
  }
}

// Connection pool metrics
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  activeConnections: 0,
  poolSize: 0,
  startTime: Date.now(),

  // Track response times
  responseTimes: [],

  recordRequest(responseTime, success = true) {
    this.totalRequests++
    this.responseTimes.push(responseTime)

    // Keep only last 1000 response times for average calculation
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift()
    }

    if (success) {
      this.successfulRequests++
    } else {
      this.failedRequests++
    }

    // Calculate average response time
    const sum = this.responseTimes.reduce((a, b) => a + b, 0)
    this.averageResponseTime = sum / this.responseTimes.length
  },

  getStats() {
    const uptime = Date.now() - this.startTime
    const successRate =
      this.totalRequests > 0 ? ((this.successfulRequests / this.totalRequests) * 100).toFixed(2) : 0

    return {
      uptime: `${Math.floor(uptime / 1000)}s`,
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      successRate: `${successRate}%`,
      averageResponseTime: `${this.averageResponseTime.toFixed(2)}ms`,
      requestsPerMinute: requestTracker.getRequestsInWindow(),
      remainingRequests: requestTracker.getRemainingRequests(),
      poolConfig: {
        min: POOL_CONFIG.db.pool.min,
        max: POOL_CONFIG.db.pool.max,
        acquireTimeout: `${POOL_CONFIG.db.pool.acquireTimeoutMillis}ms`,
        idleTimeout: `${POOL_CONFIG.db.pool.idleTimeoutMillis}ms`
      }
    }
  },

  reset() {
    this.totalRequests = 0
    this.successfulRequests = 0
    this.failedRequests = 0
    this.responseTimes = []
    this.averageResponseTime = 0
    this.startTime = Date.now()
  }
}

// Optimized query execution wrapper
export async function executeQuery(queryFn, options = {}) {
  const startTime = Date.now()
  const { retries = POOL_CONFIG.db.query.retries } = options

  // Rate limiting check
  if (!requestTracker.trackRequest()) {
    const error = new Error('Rate limit exceeded')
    error.code = 'RATE_LIMIT_EXCEEDED'
    throw error
  }

  let lastError
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await queryFn()

      const responseTime = Date.now() - startTime
      metrics.recordRequest(responseTime, true)

      return result
    } catch (error) {
      lastError = error
      metrics.recordRequest(Date.now() - startTime, false)

      // Don't retry on certain errors
      if (
        error.code === 'PGRST116' || // Not found
        error.code === '42501' || // Permission denied
        error.message?.includes('Invalid login credentials')
      ) {
        break
      }

      // Exponential backoff for retries
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

// Connection health check
export async function healthCheck(supabase) {
  try {
    const start = Date.now()
    const { error } = await supabase.from('products').select('id').limit(1)

    const responseTime = Date.now() - start

    if (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        responseTime
      }
    }

    return {
      status: 'healthy',
      responseTime,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

// Create optimized Supabase client
export function createOptimizedClient(url, key, options = {}) {
  const config = {
    auth: {
      autoRefreshToken: true,
      persistSession: false, // Server-side only
      detectSessionInUrl: false
    },
    db: {
      schema: POOL_CONFIG.db.schema
    },
    global: {
      headers: {
        'x-application-name': 'floresya-api',
        'x-client-info': 'optimized-pool'
      },
      fetch: (url, options = {}) => {
        // Apply custom timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), POOL_CONFIG.fetch.timeout)

        return globalThis
          .fetch(url, {
            ...options,
            signal: controller.signal,
            keepalive: POOL_CONFIG.fetch.keepalive
          })
          .finally(() => {
            clearTimeout(timeoutId)
          })
      }
    },
    realtime: {
      disabled: true // Disable real-time for server-side usage
    },
    ...options
  }

  return createClient(url, key, config)
}

// Batch query executor for multiple operations
export async function executeBatch(operations) {
  const results = []
  const errors = []

  for (const operation of operations) {
    try {
      const result = await executeQuery(operation.queryFn, operation.options)
      results.push({ success: true, data: result, operation: operation.name })
    } catch (error) {
      errors.push({ success: false, error: error.message, operation: operation.name })
      results.push({ success: false, error: error, operation: operation.name })
    }
  }

  return {
    results,
    errors,
    total: operations.length,
    successful: results.filter(r => r.success).length
  }
}

// Memory usage monitoring
export function getMemoryUsage() {
  const usage = process.memoryUsage()
  return {
    rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`
  }
}

// Performance monitoring middleware
export function performanceMiddleware(req, res, next) {
  const start = Date.now()

  // Add performance headers
  res.on('finish', () => {
    const duration = Date.now() - start
    res.setHeader('x-response-time', `${duration}ms`)
    res.setHeader('x-request-id', req.id || 'unknown')
  })

  next()
}

// Get all performance stats
export function getPerformanceStats() {
  return {
    connectionPool: metrics.getStats(),
    memory: getMemoryUsage(),
    rateLimit: {
      current: requestTracker.getRequestsInWindow(),
      limit: requestTracker.maxRequests,
      remaining: requestTracker.getRemainingRequests()
    },
    uptime: `${Math.floor((Date.now() - metrics.startTime) / 1000)}s`,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  }
}

// Reset all metrics
export function resetMetrics() {
  metrics.reset()
  requestTracker.requests = []
  logger.info('Performance metrics reset')
}

export default {
  executeQuery,
  healthCheck,
  createOptimizedClient,
  executeBatch,
  getPerformanceStats,
  resetMetrics,
  performanceMiddleware
}
