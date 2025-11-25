/**
 * Procesado por B
 */

/**
 * Automatic Recovery System
 * Monitors system health and implements automatic recovery mechanisms
 * Handles memory leaks, circuit breaker recovery, and system health
 */

import { logger } from '../utils/logger.js'
import { metricsCollector } from '../monitoring/metricsCollector.js'
import { resetCircuitBreaker, getCircuitBreakerStatus } from '../middleware/performance/index.js'
import { ValidationError } from '../errors/AppError.js'
import { resetAllRateLimits } from '../middleware/security/index.js'

class AutoRecoverySystem {
  constructor() {
    this.recoveryInterval = null
    this.healthCheckInterval = null
    this.isRecovering = false

    this.config = {
      healthCheckInterval: 30000, // 30 seconds
      recoveryThreshold: 60, // Health score below 60 triggers recovery
      memoryThreshold: 200, // MB - trigger GC if heap exceeds this
      maxRecoveryAttempts: 3,
      recoveryCooldown: 300000 // 5 minutes between recovery attempts
    }

    this.recoveryStats = {
      totalRecoveries: 0,
      lastRecovery: null,
      recoveryAttempts: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0
    }

    this.start()
  }

  /**
   * Start the auto recovery system
   */
  start() {
    logger.info('🔧 Sistema de recuperación automática iniciado')

    // Health monitoring every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck()
    }, this.config.healthCheckInterval)

    // Recovery actions every 5 minutes
    this.recoveryInterval = setInterval(() => {
      this.performMaintenanceRecovery()
    }, 300000)
  }

  /**
   * Stop the auto recovery system
   */
  stop() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }

    if (this.recoveryInterval) {
      clearInterval(this.recoveryInterval)
      this.recoveryInterval = null
    }

    logger.info('Automatic recovery system stopped')
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    try {
      const healthScore = metricsCollector.calculateHealthScore()
      const realtimeMetrics = metricsCollector.getRealtimeMetrics()
      const circuitBreakerStatus = getCircuitBreakerStatus()

      // Log current health status
      logger.debug('Health check performed', {
        healthScore,
        circuitBreakerState: circuitBreakerStatus.database.state,
        memoryUsage: realtimeMetrics.memoryUsage.heapUsed,
        errorRate: realtimeMetrics.errorRate
      })

      // Check if recovery is needed
      if (healthScore < this.config.recoveryThreshold) {
        logger.warn(
          `Health score ${healthScore} below threshold ${this.config.recoveryThreshold}. Initiating recovery.`
        )
        await this.initiateRecovery('low_health_score', { healthScore, realtimeMetrics })
      }

      // Check for specific issues
      await this.checkSpecificIssues(realtimeMetrics, circuitBreakerStatus)
    } catch (error) {
      logger.error('Error during health check', error)
    }
  }

  /**
   * Check for specific system issues
   */
  async checkSpecificIssues(realtimeMetrics, circuitBreakerStatus) {
    // Check for high memory usage
    if (realtimeMetrics.memoryUsage.heapUsed > this.config.memoryThreshold) {
      logger.warn(`High memory usage detected: ${realtimeMetrics.memoryUsage.heapUsed}MB`)
      await this.initiateRecovery('high_memory_usage', { memoryUsage: realtimeMetrics.memoryUsage })
    }

    // Check for stuck circuit breaker
    if (circuitBreakerStatus.database.state === 'OPEN') {
      const timeInOpenState = circuitBreakerStatus.database.lastFailure
        ? Date.now() - new Date(circuitBreakerStatus.database.lastFailure).getTime()
        : 0

      // If circuit breaker has been open for more than 10 minutes, try recovery
      if (timeInOpenState > 600000) {
        logger.warn('Circuit breaker stuck in OPEN state for too long, attempting recovery')
        await this.initiateRecovery('stuck_circuit_breaker', { timeInOpenState })
      }
    }

    // Check for high error rate
    const errorRate = parseFloat(realtimeMetrics.errorRate)
    if (errorRate > 15) {
      logger.warn(`High error rate detected: ${errorRate}%`)
      await this.initiateRecovery('high_error_rate', { errorRate })
    }
  }

  /**
   * Initiate recovery process
   */
  async initiateRecovery(reason, context) {
    if (this.isRecovering) {
      logger.info('Recovery already in progress, skipping duplicate attempt')
      return
    }

    // Check recovery cooldown
    if (this.recoveryStats.lastRecovery) {
      const timeSinceLastRecovery = Date.now() - this.recoveryStats.lastRecovery
      if (timeSinceLastRecovery < this.config.recoveryCooldown) {
        logger.info(
          `Recovery cooldown active. Next recovery available in ${Math.round((this.config.recoveryCooldown - timeSinceLastRecovery) / 1000)}s`
        )
        return
      }
    }

    this.isRecovering = true
    this.recoveryStats.totalRecoveries++
    this.recoveryStats.recoveryAttempts++

    try {
      logger.info(`Starting automatic recovery: ${reason}`, { context })

      const recoveryActions = this.determineRecoveryActions(reason, context)
      const results = await this.executeRecoveryActions(recoveryActions)

      if (results.successful.length > 0) {
        this.recoveryStats.successfulRecoveries++
        logger.info(
          `Recovery completed successfully. Actions taken: ${results.successful.join(', ')}`
        )
      }

      if (results.failed.length > 0) {
        this.recoveryStats.failedRecoveries++
        logger.error(`Some recovery actions failed: ${results.failed.join(', ')}`)
      }

      this.recoveryStats.lastRecovery = Date.now()
    } catch (error) {
      logger.error('Recovery process failed', error)
      this.recoveryStats.failedRecoveries++
    } finally {
      this.isRecovering = false
    }
  }

  /**
   * Determine which recovery actions to take based on the issue
   */
  determineRecoveryActions(reason, context) {
    const actions = []

    switch (reason) {
      case 'low_health_score':
        actions.push('reset_circuit_breaker')
        actions.push('reset_rate_limits')
        actions.push('garbage_collection')
        if (context.healthScore < 30) {
          actions.push('memory_cleanup')
        }
        break

      case 'high_memory_usage':
        actions.push('garbage_collection')
        actions.push('memory_cleanup')
        actions.push('reset_rate_limits')
        break

      case 'stuck_circuit_breaker':
        actions.push('reset_circuit_breaker')
        actions.push('garbage_collection')
        break

      case 'high_error_rate':
        actions.push('reset_circuit_breaker')
        actions.push('reset_rate_limits')
        actions.push('garbage_collection')
        break

      default:
        actions.push('garbage_collection')
        actions.push('reset_rate_limits')
    }

    return [...new Set(actions)] // Remove duplicates
  }

  /**
   * Execute recovery actions
   */
  async executeRecoveryActions(actions) {
    const results = {
      successful: [],
      failed: []
    }

    for (const action of actions) {
      try {
        await this.executeRecoveryAction(action)
        results.successful.push(action)
      } catch (error) {
        logger.error(`Recovery action ${action} failed`, error)
        results.failed.push(action)
      }
    }

    return results
  }

  /**
   * Execute a specific recovery action
   */
  async executeRecoveryAction(action) {
    switch (action) {
      case 'reset_circuit_breaker':
        resetCircuitBreaker('database')
        logger.info('Circuit breaker reset during recovery')
        break

      case 'reset_rate_limits':
        resetAllRateLimits()
        logger.info('Rate limits reset during recovery')
        break

      case 'garbage_collection':
        if (global.gc) {
          global.gc()
          logger.info('Manual garbage collection triggered')
        }
        break

      case 'memory_cleanup':
        // Force cleanup of metrics and caches
        metricsCollector.cleanupOldMetrics()
        logger.info('Memory cleanup performed')
        break

      default:
        throw new ValidationError(`Unknown recovery action: ${action}`, { action })
    }

    // Small delay between actions
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  /**
   * Perform routine maintenance recovery
   */
  performMaintenanceRecovery() {
    try {
      logger.debug('Performing routine maintenance recovery')

      // Light maintenance actions
      if (global.gc) {
        global.gc()
      }

      // Clean up old metrics
      metricsCollector.cleanupOldMetrics()

      // Reset circuit breaker if it's been successful for a while
      const cbStatus = getCircuitBreakerStatus()
      if (cbStatus.database.state === 'CLOSED' && cbStatus.database.successCount > 10) {
        // Circuit breaker is healthy, no action needed
      }
    } catch (error) {
      logger.error('Error during maintenance recovery', error)
    }
  }

  /**
   * Get recovery system status
   */
  getRecoveryStatus() {
    return {
      isActive: !this.isRecovering,
      isRecovering: this.isRecovering,
      stats: this.recoveryStats,
      config: this.config,
      lastHealthCheck: new Date().toISOString()
    }
  }

  /**
   * Force immediate recovery (admin function)
   */
  async forceRecovery(reason = 'manual_trigger') {
    logger.info(`Forcing immediate recovery: ${reason}`)
    await this.initiateRecovery(reason, { forced: true })
  }

  /**
   * Update recovery configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    logger.info('Recovery configuration updated', { newConfig })
  }
}

// Global auto recovery system instance
const autoRecoverySystem = new AutoRecoverySystem()

/**
 * Recovery status endpoint
 */
export function getRecoveryStatus(req, res) {
  const status = autoRecoverySystem.getRecoveryStatus()
  res.json({
    success: true,
    data: status
  })
}

/**
 * Force recovery endpoint (admin only)
 */
export async function forceRecovery(req, res) {
  const reason = req.body.reason || 'manual_admin_trigger'

  try {
    await autoRecoverySystem.forceRecovery(reason)
    res.json({
      success: true,
      message: `Recovery initiated: ${reason}`
    })
  } catch (error) {
    logger.error('Failed to force recovery', error)
    res.status(500).json({
      success: false,
      error: 'RecoveryFailed',
      message: 'Failed to initiate recovery'
    })
  }
}

/**
 * Update recovery configuration endpoint (admin only)
 */
export function updateRecoveryConfig(req, res) {
  try {
    autoRecoverySystem.updateConfig(req.body)
    res.json({
      success: true,
      message: 'Recovery configuration updated'
    })
  } catch (error) {
    logger.error('Failed to update recovery config', error)
    res.status(500).json({
      success: false,
      error: 'ConfigUpdateFailed',
      message: 'Failed to update recovery configuration'
    })
  }
}

/**
 * Health check with recovery status
 */
export function comprehensiveHealthCheck(req, res) {
  const healthScore = metricsCollector.calculateHealthScore()
  const realtimeMetrics = metricsCollector.getRealtimeMetrics()
  const circuitBreakerStatus = getCircuitBreakerStatus()
  const recoveryStatus = autoRecoverySystem.getRecoveryStatus()

  const isHealthy =
    healthScore >= 70 && circuitBreakerStatus.database.isHealthy && !recoveryStatus.isRecovering

  res.status(isHealthy ? 200 : 503).json({
    success: true,
    data: {
      healthScore,
      isHealthy,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      metrics: realtimeMetrics,
      circuitBreaker: circuitBreakerStatus,
      recovery: recoveryStatus
    },
    message: isHealthy ? 'All systems healthy' : 'Some systems require attention'
  })
}

/**
 * Export recovery system for direct use
 */
export { autoRecoverySystem }
export default autoRecoverySystem
