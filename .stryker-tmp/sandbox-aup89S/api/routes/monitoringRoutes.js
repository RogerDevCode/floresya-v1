/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Monitoring Routes
 * Comprehensive health check and monitoring endpoints
 */

import { Router } from 'express'
import { getDatabaseHealth } from '../monitoring/databaseMonitor.js'
import { metricsMiddleware } from '../monitoring/metricsCollector.js'
import { getRecoveryStatus, forceRecovery, updateRecoveryConfig } from '../recovery/autoRecovery.js'

const router = Router()

/**
 * GET /health/comprehensive
 * Comprehensive health check including all system components
 */
router.get('/comprehensive', metricsMiddleware, async (req, res) => {
  try {
    const startTime = Date.now()

    // Database health
    const dbHealth = await getDatabaseHealth()

    // Recovery system status
    const recoveryStatus = getRecoveryStatus()

    // Metrics and performance
    const metrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    }

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: metrics.uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth,
      recovery: recoveryStatus,
      metrics: metrics,
      services: {
        api: 'healthy',
        database: dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
        recovery: recoveryStatus.status === 'ok' ? 'healthy' : 'unhealthy'
      }
    }

    // Determine overall health status
    const unhealthyServices = Object.values(healthData.services).filter(
      status => status !== 'healthy'
    )
    if (unhealthyServices.length > 0) {
      healthData.status = 'degraded'
      return res.status(503).json({
        success: false,
        data: healthData,
        message: 'System degraded - some services unhealthy'
      })
    }

    res.json({
      success: true,
      data: healthData,
      message: 'All systems operational'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Health check failed',
        details: error.message
      }
    })
  }
})

/**
 * GET /health/circuit-breaker
 * Circuit breaker status and configuration
 */
router.get('/circuit-breaker', (req, res) => {
  try {
    // This would integrate with your circuit breaker implementation
    const circuitBreakerStatus = {
      status: 'closed', // closed, open, half-open
      lastFailure: null,
      failureCount: 0,
      successThreshold: 5,
      failureThreshold: 5,
      timeout: 60000,
      services: {
        database: { status: 'closed', failures: 0 },
        storage: { status: 'closed', failures: 0 },
        external: { status: 'closed', failures: 0 }
      }
    }

    res.json({
      success: true,
      data: circuitBreakerStatus,
      message: 'Circuit breaker status retrieved'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get circuit breaker status',
        details: error.message
      }
    })
  }
})

/**
 * GET /health/recovery
 * Recovery system status
 */
router.get('/recovery', (req, res) => {
  try {
    const recoveryStatus = getRecoveryStatus()

    res.json({
      success: true,
      data: recoveryStatus,
      message: 'Recovery system status retrieved'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get recovery status',
        details: error.message
      }
    })
  }
})

/**
 * POST /health/recovery/force
 * Force recovery actions
 */
router.post('/recovery/force', (req, res) => {
  try {
    const result = forceRecovery()

    res.json({
      success: true,
      data: result,
      message: 'Recovery actions forced'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to force recovery',
        details: error.message
      }
    })
  }
})

/**
 * PUT /health/recovery/config
 * Update recovery configuration
 */
router.put('/recovery/config', (req, res) => {
  try {
    const result = updateRecoveryConfig(req.body)

    res.json({
      success: true,
      data: result,
      message: 'Recovery configuration updated'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update recovery config',
        details: error.message
      }
    })
  }
})

export default router
