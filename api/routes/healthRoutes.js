/**
 * Health Check Routes
 * Comprehensive health monitoring endpoints for system observability
 */

import express from 'express'
import { metricsCollector, getMetricsReport } from '../monitoring/metricsCollector.js'
// Conditional import for clinicProfiler (not needed in tests)
let clinicProfiler = null
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  const { clinicProfiler: cp } = await import('../monitoring/clinicIntegration.js')
  clinicProfiler = cp
} else {
  // Mock clinicProfiler for tests
  clinicProfiler = {
    getProfilingStatus: () => ({
      isActive: false,
      canStart: false,
      startTime: null,
      duration: 0
    }),
    startProfiling: async () => ({
      success: false,
      message: 'Profiling disabled in test environment'
    }),
    stopProfiling: async () => ({
      success: false,
      message: 'Profiling disabled in test environment'
    })
  }
}
import { comprehensiveHealthCheck, getRecoveryStatus } from '../recovery/autoRecovery.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

/**
 * Basic health check
 * GET /health
 */
router.get('/', (req, res) => {
  const uptime = process.uptime()
  const healthScore = metricsCollector.calculateHealthScore()

  res.json({
    success: true,
    data: {
      status: healthScore >= 70 ? 'healthy' : healthScore >= 50 ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.round(uptime * 100) / 100,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    },
    message: 'Basic health check completed'
  })
})

/**
 * Comprehensive health check with detailed system analysis
 * GET /health/comprehensive
 */
router.get('/comprehensive', async (req, res) => {
  try {
    const result = await comprehensiveHealthCheck()

    // Add monitoring-specific health data
    const monitoringHealth = {
      metricsCollector: {
        active: true,
        overheadAcceptable: metricsCollector.isMonitoringOverheadAcceptable(),
        healthScore: metricsCollector.calculateHealthScore()
      },
      clinicProfiler: {
        active: clinicProfiler.getProfilingStatus().isActive,
        canStart: clinicProfiler.getProfilingStatus().canStart
      }
    }

    res.json({
      success: true,
      data: {
        ...result.data,
        monitoring: monitoringHealth
      },
      message: 'Comprehensive health check completed'
    })
  } catch (error) {
    logger.error('Comprehensive health check failed', error)
    res.status(503).json({
      success: false,
      error: 'Health check failed',
      message: error.message
    })
  }
})

/**
 * Real-time metrics endpoint
 * GET /health/metrics
 */
router.get('/metrics', (req, res) => {
  try {
    const metrics = metricsCollector.getRealtimeMetrics()

    res.json({
      success: true,
      data: metrics,
      message: 'Real-time metrics retrieved successfully'
    })
  } catch (error) {
    logger.error('Metrics retrieval failed', error)
    res.status(500).json({
      success: false,
      error: 'Metrics retrieval failed',
      message: error.message
    })
  }
})

/**
 * Detailed metrics report
 * GET /health/metrics/report
 */
router.get('/metrics/report', (req, res) => {
  try {
    const report = getMetricsReport()

    res.json({
      success: true,
      data: report,
      message: 'Metrics report generated successfully'
    })
  } catch (error) {
    logger.error('Metrics report generation failed', error)
    res.status(500).json({
      success: false,
      error: 'Metrics report generation failed',
      message: error.message
    })
  }
})

/**
 * Database health check
 * GET /health/database
 */
router.get('/database', async (req, res) => {
  try {
    const startTime = Date.now()

    // Simple database connectivity test
    const { supabase } = await import('../services/supabaseClient.js')

    // Test basic connectivity with a simple query
    const { error } = await supabase
      .from('settings')
      .select('count', { count: 'exact', head: true })

    const responseTime = Date.now() - startTime

    if (error) {
      throw error
    }

    const databaseMetrics = metricsCollector.getDatabaseMetrics()

    res.json({
      success: true,
      data: {
        status: 'connected',
        responseTime,
        connectionHealthy: responseTime < 1000, // Less than 1 second
        metrics: databaseMetrics,
        slowQueriesCount: databaseMetrics.slowQueries.length
      },
      message: 'Database health check completed'
    })
  } catch (error) {
    logger.error('Database health check failed', error)
    res.status(503).json({
      success: false,
      error: 'Database health check failed',
      message: error.message,
      details: {
        type: error.code || 'UNKNOWN_ERROR',
        hint: error.hint || null
      }
    })
  }
})

/**
 * Profiling status and controls
 * GET /health/profiling
 */
router.get('/profiling', (req, res) => {
  try {
    const profilingStatus = clinicProfiler.getProfilingStatus()

    res.json({
      success: true,
      data: profilingStatus,
      message: 'Profiling status retrieved successfully'
    })
  } catch (error) {
    logger.error('Profiling status retrieval failed', error)
    res.status(500).json({
      success: false,
      error: 'Profiling status retrieval failed',
      message: error.message
    })
  }
})

/**
 * Start profiling session
 * POST /health/profiling/start
 */
router.post('/profiling/start', async (req, res) => {
  try {
    const options = req.body || {}
    const result = await clinicProfiler.startProfiling(options)

    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: 'Profiling started successfully'
      })
    } else {
      res.status(400).json({
        success: false,
        error: result.message,
        message: 'Failed to start profiling'
      })
    }
  } catch (error) {
    logger.error('Profiling start failed', error)
    res.status(500).json({
      success: false,
      error: 'Profiling start failed',
      message: error.message
    })
  }
})

/**
 * Stop profiling session
 * POST /health/profiling/stop
 */
router.post('/profiling/stop', async (req, res) => {
  try {
    const result = await clinicProfiler.stopProfiling()

    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: 'Profiling stopped successfully'
      })
    } else {
      res.status(400).json({
        success: false,
        error: result.message,
        message: 'Failed to stop profiling'
      })
    }
  } catch (error) {
    logger.error('Profiling stop failed', error)
    res.status(500).json({
      success: false,
      error: 'Profiling stop failed',
      message: error.message
    })
  }
})

/**
 * Recovery status
 * GET /health/recovery
 */
router.get('/recovery', (req, res) => {
  try {
    const recoveryStatus = getRecoveryStatus()

    res.json({
      success: true,
      data: recoveryStatus,
      message: 'Recovery status retrieved successfully'
    })
  } catch (error) {
    logger.error('Recovery status retrieval failed', error)
    res.status(500).json({
      success: false,
      error: 'Recovery status retrieval failed',
      message: error.message
    })
  }
})

/**
 * Circuit breaker status
 * GET /health/circuit-breaker
 */
router.get('/circuit-breaker', (req, res) => {
  try {
    // Circuit breaker status based on recent metrics
    const metrics = metricsCollector.getRealtimeMetrics()
    const recentErrors = metrics.errorCount || 0
    const recentRequests = metrics.requestCount || 1
    const errorRate = (recentErrors / recentRequests) * 100

    // Determine circuit breaker state
    let circuitBreakerStatus = 'closed'
    let failureCount = 0

    if (errorRate > 50) {
      circuitBreakerStatus = 'open'
      failureCount = recentErrors
    } else if (errorRate > 25) {
      circuitBreakerStatus = 'half-open'
      failureCount = recentErrors
    }

    const circuitBreakerData = {
      status: circuitBreakerStatus, // closed, open, half-open
      lastFailure: metrics.lastErrorTime || null,
      failureCount: failureCount,
      successThreshold: 5,
      failureThreshold: 5,
      timeout: 60000,
      errorRate: Math.round(errorRate * 100) / 100,
      services: {
        database: {
          status: metrics.databaseResponseTime < 1000 ? 'closed' : 'open',
          failures: metrics.databaseErrorCount || 0,
          responseTime: metrics.databaseResponseTime || 0
        },
        storage: {
          status: metrics.storageResponseTime < 2000 ? 'closed' : 'open',
          failures: metrics.storageErrorCount || 0,
          responseTime: metrics.storageResponseTime || 0
        },
        external: {
          status: errorRate < 10 ? 'closed' : 'open',
          failures: metrics.externalErrorCount || 0
        }
      },
      metrics: {
        recentErrors,
        recentRequests,
        errorRate: Math.round(errorRate * 100) / 100,
        uptime: process.uptime(),
        lastReset: new Date().toISOString()
      }
    }

    res.json({
      success: true,
      data: circuitBreakerData,
      message: 'Circuit breaker status retrieved'
    })
  } catch (error) {
    logger.error('Circuit breaker status retrieval failed', error)
    res.status(500).json({
      success: false,
      error: 'Circuit breaker status retrieval failed',
      message: error.message
    })
  }
})

/**
 * System diagnostics endpoint
 * GET /health/diagnostics
 */
router.get('/diagnostics', (req, res) => {
  try {
    const diagnostics = {
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        version: process.version,
        platform: process.platform,
        arch: process.arch
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: new Date().toISOString()
      },
      monitoring: {
        overheadAcceptable: metricsCollector.isMonitoringOverheadAcceptable(),
        healthScore: metricsCollector.calculateHealthScore(),
        profilingActive: clinicProfiler.getProfilingStatus().isActive
      }
    }

    res.json({
      success: true,
      data: diagnostics,
      message: 'System diagnostics retrieved successfully'
    })
  } catch (error) {
    logger.error('Diagnostics retrieval failed', error)
    res.status(500).json({
      success: false,
      error: 'Diagnostics retrieval failed',
      message: error.message
    })
  }
})

export default router
