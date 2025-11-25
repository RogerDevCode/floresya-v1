/**
 * Procesado por B
 */

/**
 * Advanced Circuit Breaker Middleware
 * Protects against cascading failures for all external dependencies
 * Implements CLOSED → OPEN → HALF_OPEN state transitions with recovery mechanisms
 * Supports database, external APIs, cache, and custom services
 *
 * CRITICAL: Provides production-grade fault tolerance with monitoring and alerting
 */

import { ServiceUnavailableError } from '../../errors/AppError.js'
import { logger } from '../../utils/logger.js'

// Circuit breaker states with enhanced states
const STATES = {
  CLOSED: 'CLOSED', // Normal operation
  OPEN: 'OPEN', // Failing, reject requests
  HALF_OPEN: 'HALF_OPEN', // Testing if service recovered
  FORCED_OPEN: 'FORCED_OPEN', // Manually forced open
  DISABLED: 'DISABLED' // Temporarily disabled
}

// Circuit breaker event types
const EVENT_TYPES = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  TIMEOUT: 'TIMEOUT',
  SHORT_CIRCUIT: 'SHORT_CIRCUIT',
  STATE_CHANGE: 'STATE_CHANGE',
  HEALTH_CHECK: 'HEALTH_CHECK'
}

// Default configuration with advanced settings
const DEFAULT_CONFIG = {
  failureThreshold: 5, // Open circuit after 5 failures
  recoveryTimeout: 30000, // Wait 30 seconds before half-open
  monitoringPeriod: 60000, // Reset failure count every minute
  successThreshold: 3, // Close circuit after 3 successes in half-open
  timeout: 30000, // Operation timeout in milliseconds
  slidingWindowSize: 100, // Size of sliding window for failure rate calculation
  minimumNumberOfCalls: 10, // Minimum calls before calculating failure rate
  errorThresholdPercentage: 50, // Error percentage threshold for opening circuit
  waitDurationInOpenState: 30000, // Time to wait in OPEN state before HALF_OPEN
  permittedNumberOfCallsInHalfOpenState: 3, // Number of calls permitted in HALF_OPEN state
  slowCallDurationThreshold: 60000, // Threshold for slow calls in milliseconds
  slowCallRateThreshold: 50, // Percentage threshold for slow calls
  resetTimeout: 60000, // Timeout for automatic reset
  enableMetrics: true, // Enable detailed metrics collection
  alertOnStateChange: true, // Send alerts on state changes
  alertOnFailure: true, // Send alerts on failures
  fallbackFunction: null, // Custom fallback function
  healthCheckFunction: null, // Custom health check function
  healthCheckInterval: 300000 // Health check interval (5 minutes)
}

/**
 * Advanced Circuit Breaker Class with Metrics and Recovery
 */
class CircuitBreaker {
  constructor(name, config = {}) {
    this.name = name
    this.config = { ...DEFAULT_CONFIG, ...config }

    this.state = STATES.CLOSED
    this.failureCount = 0
    this.successCount = 0
    this.lastFailureTime = null
    this.lastSuccessTime = null
    this.nextAttempt = null
    this.attemptCount = 0
    this.lastStateChangeTime = Date.now()

    // Metrics collection
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      timeoutCalls: 0,
      slowCalls: 0,
      shortCircuitedCalls: 0,
      fallbackCalls: 0,
      responseTimeSum: 0,
      responseTimeMin: Infinity,
      responseTimeMax: 0,
      callsInHalfOpenState: 0,
      stateChangeCount: 0,
      lastHourMetrics: {
        calls: 0,
        failures: 0,
        slowCalls: 0
      }
    }

    // Event listeners for monitoring and alerting
    this.eventListeners = new Map()
    this.alertingEnabled = this.config.alertOnStateChange || this.config.alertOnFailure

    // Health monitoring
    this.healthCheckInterval = null
    if (this.config.healthCheckFunction && this.config.healthCheckInterval) {
      this.startHealthCheck()
    }

    // Auto-reset mechanism
    if (this.config.resetTimeout) {
      this.setupAutoReset()
    }

    // Periodic metrics cleanup
    setInterval(() => {
      this.cleanupOldMetrics()
    }, 300000) // Clean every 5 minutes

    // Initialize start time
    this.startTime = Date.now()
  }

  /**
   * Execute operation with advanced circuit breaker protection
   */
  async execute(operation, context = {}) {
    const startTime = Date.now()
    const operationId = `${this.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    this.metrics.totalCalls++
    this.updateHourlyMetrics('calls')

    // Check if request should be allowed through
    if (this.state === STATES.OPEN) {
      if (Date.now() < this.nextAttempt) {
        this.metrics.shortCircuitedCalls++
        this.emitEvent(EVENT_TYPES.SHORT_CIRCUIT, { operationId, context })

        // Try fallback if available
        if (this.config.fallbackFunction) {
          this.metrics.fallbackCalls++
          this.emitEvent('FALLBACK_TRIGGERED', { operationId, context })
          return await this.executeFallback(context)
        }

        throw new ServiceUnavailableError(
          `Circuit breaker is OPEN for ${this.name}. Next attempt at ${new Date(this.nextAttempt).toISOString()}`,
          {
            circuitBreaker: this.name,
            state: this.state,
            nextAttempt: this.nextAttempt,
            operationId
          }
        )
      } else {
        this.transitionToState(STATES.HALF_OPEN, 'Timeout reached, transitioning to HALF_OPEN')
        this.successCount = 0
        this.attemptCount = 0
      }
    }

    if (this.state === STATES.DISABLED) {
      // Bypass circuit breaker for disabled state
      return await operation()
    }

    try {
      // Execute operation with timeout
      const result = await this.executeWithTimeout(operation, context, operationId)
      const responseTime = Date.now() - startTime

      this.updateMetrics(responseTime, true)
      this.onSuccess(responseTime)

      this.emitEvent(EVENT_TYPES.SUCCESS, {
        operationId,
        responseTime,
        context
      })

      return result
    } catch (error) {
      const responseTime = Date.now() - startTime
      this.updateMetrics(responseTime, false, error)

      // Handle timeout specifically
      if (error.name === 'TimeoutError') {
        this.metrics.timeoutCalls++
        this.emitEvent(EVENT_TYPES.TIMEOUT, { operationId, responseTime, context })
      } else {
        this.metrics.failedCalls++
        this.emitEvent(EVENT_TYPES.FAILURE, {
          operationId,
          responseTime,
          error: error.message,
          context
        })
      }

      this.onFailure(error)

      // Try fallback if operation failed and fallback is available
      if (this.config.fallbackFunction && this.shouldUseFallback(error)) {
        this.metrics.fallbackCalls++
        this.emitEvent('FALLBACK_TRIGGERED', { operationId, error: error.message, context })
        return await this.executeFallback(context)
      }

      throw error
    }
  }

  /**
   * Execute operation with timeout protection
   */
  async executeWithTimeout(operation, context, operationId) {
    const { timeout = this.config.timeout } = this.config

    return await Promise.race([
      operation(),
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timeout after ${timeout}ms for ${this.name}`))
        }, timeout)
      })
    ])
  }

  /**
   * Determine if fallback should be used based on error type
   */
  shouldUseFallback(error) {
    const fallbackOnErrors = this.config.fallbackOnErrors || [
      'ServiceUnavailableError',
      'ConnectionError',
      'TimeoutError',
      'NetworkError'
    ]

    return fallbackOnErrors.some(
      errorType => error.name === errorType || error.message.includes(errorType)
    )
  }

  /**
   * Execute fallback function
   */
  async executeFallback(context) {
    if (typeof this.config.fallbackFunction === 'function') {
      return await this.config.fallbackFunction(context)
    }

    // Default fallback - return null for graceful degradation
    return null
  }

  /**
   * Update performance metrics
   */
  updateMetrics(responseTime, success, error = null) {
    if (success) {
      this.metrics.successfulCalls++
      this.lastSuccessTime = Date.now()
    }

    this.metrics.responseTimeSum += responseTime
    this.metrics.responseTimeMin = Math.min(this.metrics.responseTimeMin, responseTime)
    this.metrics.responseTimeMax = Math.max(this.metrics.responseTimeMax, responseTime)

    // Check for slow calls
    if (responseTime > this.config.slowCallDurationThreshold) {
      this.metrics.slowCalls++
      this.updateHourlyMetrics('slowCalls')
    }

    // Update sliding window for failure rate calculation
    this.updateSlidingWindow(responseTime, success, error)
  }

  /**
   * Update hourly metrics for trend analysis
   */
  updateHourlyMetrics(type) {
    if (!this.metrics.lastHourMetrics) {
      return
    }

    switch (type) {
      case 'calls':
        this.metrics.lastHourMetrics.calls++
        break
      case 'failures':
        this.metrics.lastHourMetrics.failures++
        break
      case 'slowCalls':
        this.metrics.lastHourMetrics.slowCalls++
        break
    }
  }

  /**
   * Sliding window for failure rate calculation
   */
  slidingWindow = []

  updateSlidingWindow(responseTime, success, error) {
    this.slidingWindow.push({
      timestamp: Date.now(),
      success,
      responseTime,
      error: error ? error.message : null
    })

    // Keep only recent calls within the window size
    const cutoffTime = Date.now() - 60000 // Last minute
    this.slidingWindow = this.slidingWindow.filter(entry => entry.timestamp > cutoffTime)

    // Limit window size
    if (this.slidingWindow.length > this.config.slidingWindowSize) {
      this.slidingWindow = this.slidingWindow.slice(-this.config.slidingWindowSize)
    }
  }

  /**
   * Calculate current failure rate from sliding window
   */
  getFailureRate() {
    if (this.slidingWindow.length < this.config.minimumNumberOfCalls) {
      return 0
    }

    const failures = this.slidingWindow.filter(entry => !entry.success).length
    return (failures / this.slidingWindow.length) * 100
  }

  /**
   * Calculate slow call rate
   */
  getSlowCallRate() {
    if (this.slidingWindow.length === 0) {
      return 0
    }

    const slowCalls = this.slidingWindow.filter(
      entry => entry.responseTime > this.config.slowCallDurationThreshold
    ).length

    return (slowCalls / this.slidingWindow.length) * 100
  }

  /**
   * Handle successful operation with advanced logic
   */
  onSuccess(responseTime) {
    this.failureCount = 0
    this.lastSuccessTime = Date.now()

    if (this.state === STATES.HALF_OPEN) {
      this.successCount++
      this.attemptCount++

      // Check if we should transition to CLOSED
      if (
        this.successCount >= this.config.permittedNumberOfCallsInHalfOpenState ||
        this.attemptCount >= this.config.successThreshold
      ) {
        this.transitionToState(
          STATES.CLOSED,
          `Successful recovery after ${this.successCount} successes in HALF_OPEN`
        )
      }
    } else if (this.state === STATES.CLOSED) {
      // Reset sliding window metrics in CLOSED state
      this.attemptCount = 0
    }

    // Log successful operation for monitoring
    logger.debug(`Circuit breaker ${this.name} success`, {
      state: this.state,
      responseTime,
      successCount: this.successCount,
      attemptCount: this.attemptCount
    })
  }

  /**
   * Handle failed operation with advanced logic
   */
  onFailure(error) {
    this.failureCount++
    this.lastFailureTime = Date.now()
    this.attemptCount++

    const failureRate = this.getFailureRate()
    const slowCallRate = this.getSlowCallRate()

    // Advanced state transition logic
    if (this.state === STATES.HALF_OPEN) {
      this.transitionToState(
        STATES.OPEN,
        `Failed in HALF_OPEN state - returning to OPEN. Error: ${error.message}`
      )
    } else if (this.state === STATES.CLOSED) {
      // Check multiple conditions for opening circuit
      const shouldOpenByFailures = this.failureCount >= this.config.failureThreshold
      const shouldOpenByRate = failureRate >= this.config.errorThresholdPercentage
      const shouldOpenBySlowCalls = slowCallRate >= this.config.slowCallRateThreshold

      if (shouldOpenByFailures || shouldOpenByRate || shouldOpenBySlowCalls) {
        const reason = shouldOpenByFailures
          ? `${this.failureCount} consecutive failures`
          : shouldOpenByRate
            ? `${failureRate.toFixed(1)}% failure rate`
            : `${slowCallRate.toFixed(1)}% slow call rate`

        this.transitionToState(STATES.OPEN, `Circuit opened due to: ${reason}`)
      }
    }

    // Log failed operation for monitoring
    logger.warn(`Circuit breaker ${this.name} failure`, {
      state: this.state,
      failureCount: this.failureCount,
      failureRate: failureRate.toFixed(2),
      slowCallRate: slowCallRate.toFixed(2),
      error: error.message,
      attemptCount: this.attemptCount
    })
  }

  /**
   * Transition to new state with event emission
   */
  transitionToState(newState, reason) {
    const oldState = this.state
    this.state = newState
    this.lastStateChangeTime = Date.now()

    // Reset counters based on new state
    switch (newState) {
      case STATES.CLOSED:
        this.failureCount = 0
        this.successCount = 0
        this.attemptCount = 0
        this.nextAttempt = null
        break
      case STATES.HALF_OPEN:
        this.successCount = 0
        this.attemptCount = 0
        break
      case STATES.OPEN:
        this.nextAttempt = Date.now() + this.config.waitDurationInOpenState
        break
    }

    this.metrics.stateChangeCount++

    const eventData = {
      oldState,
      newState,
      reason,
      timestamp: this.lastStateChangeTime,
      metrics: this.getCurrentMetrics()
    }

    this.emitEvent(EVENT_TYPES.STATE_CHANGE, eventData)

    // Send alert if enabled
    if (this.alertingEnabled) {
      this.sendStateChangeAlert(eventData)
    }

    logger.info(`Circuit breaker ${this.name} state change`, eventData)
  }

  /**
   * Send state change alert
   */
  sendStateChangeAlert(eventData) {
    const alert = {
      circuitBreaker: this.name,
      alertType: 'CIRCUIT_BREAKER_STATE_CHANGE',
      severity: this.getAlertSeverity(eventData.newState),
      message: `Circuit breaker ${this.name} changed from ${eventData.oldState} to ${eventData.newState}`,
      data: eventData,
      timestamp: new Date().toISOString()
    }

    // In production, this would integrate with your alerting system (e.g., PagerDuty, Slack)
    logger.error('CIRCUIT BREAKER ALERT', alert)

    // Emit alert event for external monitoring systems
    this.emitEvent('ALERT', alert)
  }

  /**
   * Get alert severity based on state
   */
  getAlertSeverity(state) {
    switch (state) {
      case STATES.OPEN:
        return 'HIGH'
      case STATES.FORCED_OPEN:
        return 'CRITICAL'
      case STATES.HALF_OPEN:
        return 'MEDIUM'
      default:
        return 'LOW'
    }
  }

  /**
   * Start health check monitoring
   */
  startHealthCheck() {
    this.healthCheckInterval = setInterval(async () => {
      try {
        if (this.config.healthCheckFunction) {
          const result = await this.config.healthCheckFunction()
          this.emitEvent(EVENT_TYPES.HEALTH_CHECK, { result, timestamp: Date.now() })

          // Auto-recovery based on health check
          if (result.healthy && this.state === STATES.OPEN) {
            logger.info(`Circuit breaker ${this.name} health check passed, attempting recovery`)
            this.transitionToState(STATES.HALF_OPEN, 'Health check passed')
          }
        }
      } catch (error) {
        logger.error(`Health check failed for circuit breaker ${this.name}:`, error)
      }
    }, this.config.healthCheckInterval)
  }

  /**
   * Setup automatic reset mechanism
   */
  setupAutoReset() {
    setInterval(() => {
      if (
        this.state === STATES.OPEN &&
        Date.now() - this.lastStateChangeTime >= this.config.resetTimeout
      ) {
        logger.info(
          `Circuit breaker ${this.name} auto-reset timeout reached, transitioning to HALF_OPEN`
        )
        this.transitionToState(STATES.HALF_OPEN, 'Auto-reset timeout reached')
      }
    }, 60000) // Check every minute
  }

  /**
   * Emit events for monitoring and alerting
   */
  emitEvent(eventType, data) {
    const listeners = this.eventListeners.get(eventType) || []
    listeners.forEach(listener => {
      try {
        listener(data)
      } catch (error) {
        logger.error(`Event listener error for ${eventType}:`, error)
      }
    })

    // Store event for later analysis
    if (!this.eventHistory) {
      this.eventHistory = []
    }
    this.eventHistory.push({
      type: eventType,
      data,
      timestamp: Date.now()
    })

    // Keep only recent events
    if (this.eventHistory.length > 1000) {
      this.eventHistory = this.eventHistory.slice(-1000)
    }
  }

  /**
   * Add event listener
   */
  addEventListener(eventType, listener) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType).push(listener)
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventType, listener) {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * Get comprehensive current metrics
   */
  getCurrentMetrics() {
    const uptime = Date.now() - (this.startTime || Date.now())
    const avgResponseTime = this.metrics.responseTimeSum / Math.max(this.metrics.successfulCalls, 1)
    const failureRate = (this.metrics.failedCalls / Math.max(this.metrics.totalCalls, 1)) * 100
    const slowCallRate = (this.metrics.slowCalls / Math.max(this.metrics.totalCalls, 1)) * 100
    const slidingWindowFailureRate = this.getFailureRate()
    const slidingWindowSlowCallRate = this.getSlowCallRate()

    return {
      ...this.metrics,
      uptime,
      avgResponseTime,
      failureRate,
      slowCallRate,
      slidingWindowFailureRate,
      slidingWindowSlowCallRate,
      isHealthy: this.state === STATES.CLOSED,
      healthScore: this.calculateHealthScore()
    }
  }

  /**
   * Calculate overall health score (0-100)
   */
  calculateHealthScore() {
    const metrics = this.getCurrentMetrics()
    let score = 100

    // Deduct points based on failure rate
    score -= Math.min(metrics.failureRate, 50)

    // Deduct points for slow calls
    score -= Math.min(metrics.slowCallRate * 0.5, 25)

    // Deduct points for being in non-closed state
    if (this.state !== STATES.CLOSED) {
      score -= 20
    }

    return Math.max(0, Math.round(score))
  }

  /**
   * Get current status with comprehensive information
   */
  getStatus() {
    const metrics = this.getCurrentMetrics()
    const failureRate = this.getFailureRate()
    const slowCallRate = this.getSlowCallRate()

    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      nextAttempt: this.nextAttempt,
      lastStateChangeTime: this.lastStateChangeTime,
      isHealthy: this.state === STATES.CLOSED,
      metrics: {
        totalCalls: this.metrics.totalCalls,
        successfulCalls: this.metrics.successfulCalls,
        failedCalls: this.metrics.failedCalls,
        timeoutCalls: this.metrics.timeoutCalls,
        shortCircuitedCalls: this.metrics.shortCircuitedCalls,
        fallbackCalls: this.metrics.fallbackCalls,
        avgResponseTime: metrics.avgResponseTime,
        failureRate: metrics.failureRate,
        slowCallRate: metrics.slowCallRate,
        slidingWindowFailureRate: failureRate,
        slidingWindowSlowCallRate: slowCallRate,
        healthScore: metrics.healthScore
      },
      config: this.config,
      events: this.eventHistory?.slice(-10) || []
    }
  }

  /**
   * Clean up old metrics to prevent memory leaks
   */
  cleanupOldMetrics() {
    const oneHourAgo = Date.now() - 3600000 // 1 hour

    if (this.metrics.lastHourMetrics) {
      // Reset hourly metrics
      this.metrics.lastHourMetrics = {
        calls: 0,
        failures: 0,
        slowCalls: 0
      }
    }

    // Clean old sliding window entries
    this.slidingWindow = this.slidingWindow.filter(entry => entry.timestamp > oneHourAgo)

    // Clean old events
    if (this.eventHistory) {
      this.eventHistory = this.eventHistory.filter(event => event.timestamp > oneHourAgo)
    }
  }

  /**
   * Manual state control methods
   */
  forceOpen(reason = 'Manually forced open') {
    this.transitionToState(STATES.FORCED_OPEN, reason)
  }

  forceClose(reason = 'Manually forced closed') {
    this.transitionToState(STATES.CLOSED, reason)
  }

  disable(reason = 'Manually disabled') {
    this.transitionToState(STATES.DISABLED, reason)
  }

  enable() {
    if (this.state === STATES.DISABLED) {
      this.transitionToState(STATES.CLOSED, 'Manually enabled')
    }
  }

  /**
   * Reset all metrics and state
   */
  reset(reason = 'Manual reset') {
    this.state = STATES.CLOSED
    this.failureCount = 0
    this.successCount = 0
    this.lastFailureTime = null
    this.lastSuccessTime = null
    this.nextAttempt = null
    this.attemptCount = 0
    this.lastStateChangeTime = Date.now()

    // Reset metrics
    Object.keys(this.metrics).forEach(key => {
      if (typeof this.metrics[key] === 'number') {
        this.metrics[key] = 0
      } else if (typeof this.metrics[key] === 'object' && this.metrics[key] !== null) {
        if (key === 'lastHourMetrics') {
          this.metrics[key] = { calls: 0, failures: 0, slowCalls: 0 }
        } else if (key === 'responseTimeSum') {
          this.metrics[key] = 0
        } else if (key === 'responseTimeMin') {
          this.metrics[key] = Infinity
        }
      }
    })

    this.slidingWindow = []
    this.eventHistory = []

    this.transitionToState(STATES.CLOSED, reason)
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }

    this.eventListeners.clear()
    logger.info(`Circuit breaker ${this.name} destroyed`)
  }
}

/**
 * Database-specific circuit breaker
 */
class DatabaseCircuitBreaker extends CircuitBreaker {
  constructor(config = {}) {
    super('database', config)
  }

  /**
   * Execute database operation with circuit breaker protection
   */
  async executeDbOperation(operation, context = {}) {
    try {
      return await this.execute(async () => {
        const startTime = Date.now()
        const result = await operation()
        const duration = Date.now() - startTime

        // Log slow queries
        if (duration > 2000) {
          console.warn(`Slow database operation detected: ${duration}ms`, { context })
        }

        return result
      })
    } catch (error) {
      // Enhance error with circuit breaker context
      if (error.name === 'ServiceUnavailableError' && error.context?.circuitBreaker) {
        throw error
      }

      // For other database errors, still count as failure
      this.onFailure()
      throw error
    }
  }
}

// Global database circuit breaker instance
const dbCircuitBreaker = new DatabaseCircuitBreaker()

/**
 * Middleware to wrap database operations with circuit breaker
 *
 * IMPORTANT: This middleware has been modified to comply with the "Service Layer Exclusivo" rule.
 * The original implementation attempted to directly wrap req.supabase methods, which would have
 * bypassed the service layer. Now, services should use the circuit breaker directly when needed.
 */
export function withDatabaseCircuitBreaker(_operationName = 'db_operation') {
  return (req, res, next) => {
    // Add circuit breaker to request object for services to use
    req.dbCircuitBreaker = dbCircuitBreaker

    next()
  }
}

/**
 * Circuit breaker middleware for specific operations
 */
export function circuitBreaker(name, config = {}) {
  const breaker = new CircuitBreaker(name, config)

  return async (req, res, next) => {
    try {
      await breaker.execute(() => next())
    } catch (error) {
      if (error.name === 'ServiceUnavailableError') {
        return res.status(503).json({
          success: false,
          error: 'ServiceUnavailable',
          message: error.message,
          circuitBreaker: error.context?.circuitBreaker,
          nextAttempt: error.context?.nextAttempt
        })
      }
      throw error
    }
  }
}

/**
 * Legacy circuit breaker reset function for backward compatibility
 */
export function resetCircuitBreakerLegacy(name = 'database') {
  if (name === 'database') {
    dbCircuitBreaker.state = STATES.CLOSED
    dbCircuitBreaker.failureCount = 0
    dbCircuitBreaker.successCount = 0
    dbCircuitBreaker.nextAttempt = null
    console.info('Database circuit breaker reset to CLOSED state')
  }
}

/**
 * Legacy circuit breaker force open function for backward compatibility
 */
export function forceCircuitBreakerOpenLegacy(name = 'database', duration = 30000) {
  if (name === 'database') {
    dbCircuitBreaker.state = STATES.OPEN
    dbCircuitBreaker.nextAttempt = Date.now() + duration
    console.warn(`Database circuit breaker forced to OPEN state for ${duration}ms`)
  }
}

/**
 * Advanced Circuit Breaker Registry
 * Manages multiple circuit breakers with centralized monitoring
 */
class CircuitBreakerRegistry {
  constructor() {
    this.breakers = new Map()
    this.globalConfig = { ...DEFAULT_CONFIG }
    this.monitoringInterval = null
    this.alertHandlers = new Map()

    this.startGlobalMonitoring()
  }

  /**
   * Create or get existing circuit breaker
   */
  getOrCreate(name, config = {}) {
    if (!this.breakers.has(name)) {
      const breakerConfig = { ...this.globalConfig, ...config }
      const breaker = new CircuitBreaker(name, breakerConfig)

      // Add event listeners for global monitoring
      breaker.addEventListener(EVENT_TYPES.STATE_CHANGE, data => {
        this.onCircuitBreakerEvent(name, 'STATE_CHANGE', data)
      })

      breaker.addEventListener(EVENT_TYPES.FAILURE, data => {
        this.onCircuitBreakerEvent(name, 'FAILURE', data)
      })

      breaker.addEventListener('ALERT', data => {
        this.onCircuitBreakerAlert(name, data)
      })

      this.breakers.set(name, breaker)
      logger.info(`Circuit breaker created: ${name}`)
    }

    return this.breakers.get(name)
  }

  /**
   * Remove circuit breaker
   */
  remove(name) {
    const breaker = this.breakers.get(name)
    if (breaker) {
      breaker.destroy()
      this.breakers.delete(name)
      logger.info(`Circuit breaker removed: ${name}`)
    }
  }

  /**
   * Get all circuit breakers status
   */
  getAllStatus() {
    const status = {
      breakers: {},
      summary: {
        total: this.breakers.size,
        healthy: 0,
        open: 0,
        halfOpen: 0,
        disabled: 0,
        forcedOpen: 0
      },
      timestamp: new Date().toISOString()
    }

    for (const [name, breaker] of this.breakers) {
      const breakerStatus = breaker.getStatus()
      status.breakers[name] = breakerStatus

      // Update summary
      switch (breakerStatus.state) {
        case STATES.CLOSED:
          status.summary.healthy++
          break
        case STATES.OPEN:
          status.summary.open++
          break
        case STATES.HALF_OPEN:
          status.summary.halfOpen++
          break
        case STATES.DISABLED:
          status.summary.disabled++
          break
        case STATES.FORCED_OPEN:
          status.summary.forcedOpen++
          break
      }
    }

    return status
  }

  /**
   * Global circuit breaker event handler
   */
  onCircuitBreakerEvent(name, eventType, data) {
    logger.debug(`Circuit breaker event: ${name} - ${eventType}`, data)

    // Emit to registered alert handlers
    const handlers = this.alertHandlers.get(eventType) || []
    handlers.forEach(handler => {
      try {
        handler(name, data)
      } catch (error) {
        logger.error(`Alert handler error for ${eventType}:`, error)
      }
    })
  }

  /**
   * Handle circuit breaker alerts
   */
  onCircuitBreakerAlert(name, alertData) {
    logger.error(`Circuit breaker alert for ${name}:`, alertData)

    // In production, integrate with alerting systems
    // e.g., PagerDuty, Slack, email, etc.
  }

  /**
   * Start global monitoring
   */
  startGlobalMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.performGlobalHealthCheck()
    }, 60000) // Check every minute
  }

  /**
   * Perform global health check
   */
  performGlobalHealthCheck() {
    const status = this.getAllStatus()

    // Check for critical conditions
    const criticalBreakers = Object.entries(status.breakers)
      .filter(([_, breaker]) => breaker.state === STATES.FORCED_OPEN)
      .map(([name]) => name)

    if (criticalBreakers.length > 0) {
      logger.warn(`Critical circuit breakers in FORCED_OPEN state: ${criticalBreakers.join(', ')}`)
    }

    // Calculate overall system health
    const healthScore = this.calculateSystemHealthScore(status)

    if (healthScore < 50) {
      logger.error(`System health score critical: ${healthScore}`, status)
    }
  }

  /**
   * Calculate overall system health score
   */
  calculateSystemHealthScore(status) {
    if (status.summary.total === 0) {
      return 100
    }

    let totalScore = 100
    const breakers = Object.values(status.breakers)

    breakers.forEach(breaker => {
      const breakerScore = breaker.metrics.healthScore || 0
      totalScore += breakerScore
    })

    return Math.round(totalScore / (status.summary.total + 1))
  }

  /**
   * Add alert handler
   */
  addAlertHandler(eventType, handler) {
    if (!this.alertHandlers.has(eventType)) {
      this.alertHandlers.set(eventType, [])
    }
    this.alertHandlers.get(eventType).push(handler)
  }

  /**
   * Remove alert handler
   */
  removeAlertHandler(eventType, handler) {
    const handlers = this.alertHandlers.get(eventType)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(reason = 'Global reset') {
    for (const [, breaker] of this.breakers) {
      breaker.reset(`Global reset triggered: ${reason}`)
    }
    logger.info(`All circuit breakers reset: ${reason}`)
  }

  /**
   * Force open specific circuit breakers
   */
  forceOpen(names, reason = 'Manual force open') {
    const nameArray = Array.isArray(names) ? names : [names]
    nameArray.forEach(name => {
      const breaker = this.breakers.get(name)
      if (breaker) {
        breaker.forceOpen(reason)
      }
    })
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    for (const [, breaker] of this.breakers) {
      breaker.destroy()
    }

    this.breakers.clear()
    this.alertHandlers.clear()
    logger.info('Circuit breaker registry destroyed')
  }
}

// Global registry instance
const circuitBreakerRegistry = new CircuitBreakerRegistry()

/**
 * Get circuit breaker from registry
 */
export function getCircuitBreaker(name, config = {}) {
  return circuitBreakerRegistry.getOrCreate(name, config)
}

/**
 * Get comprehensive circuit breaker status for monitoring
 */
export function getCircuitBreakerStatus() {
  return circuitBreakerRegistry.getAllStatus()
}

/**
 * Health check endpoint for circuit breakers with enhanced monitoring
 */
export function circuitBreakerHealthCheck(req, res) {
  const status = getCircuitBreakerStatus()
  const isHealthy = status.summary.healthy === status.summary.total && status.summary.open === 0

  res.status(isHealthy ? 200 : 503).json({
    success: true,
    data: status,
    message: isHealthy ? 'All circuit breakers healthy' : 'Some circuit breakers are open',
    healthScore: circuitBreakerRegistry.calculateSystemHealthScore(status)
  })
}

/**
 * Reset circuit breaker (admin function) - Enhanced
 */
export function resetCircuitBreaker(name = 'database') {
  if (name === 'all') {
    circuitBreakerRegistry.resetAll('Admin request')
    return { success: true, message: 'All circuit breakers reset' }
  }

  const breaker = circuitBreakerRegistry.breakers.get(name)
  if (breaker) {
    breaker.reset('Admin request')
    return { success: true, message: `Circuit breaker ${name} reset` }
  }

  return { success: false, message: `Circuit breaker ${name} not found` }
}

/**
 * Force circuit breaker to open (for testing) - Enhanced
 */
export function forceCircuitBreakerOpen(name = 'database', duration = 30000, reason = 'Testing') {
  if (name === 'all') {
    circuitBreakerRegistry.forceOpen(Array.from(circuitBreakerRegistry.breakers.keys()), reason)
    return { success: true, message: 'All circuit breakers forced open' }
  }

  const breaker = circuitBreakerRegistry.breakers.get(name)
  if (breaker) {
    breaker.forceOpen(reason)
    if (duration > 0) {
      setTimeout(() => {
        breaker.forceClose('Auto recovery after force open')
      }, duration)
    }
    return { success: true, message: `Circuit breaker ${name} forced open` }
  }

  return { success: false, message: `Circuit breaker ${name} not found` }
}

/**
 * Add custom alert handler for circuit breaker events
 */
export function addCircuitBreakerAlertHandler(eventType, handler) {
  circuitBreakerRegistry.addAlertHandler(eventType, handler)
}

/**
 * Remove custom alert handler
 */
export function removeCircuitBreakerAlertHandler(eventType, handler) {
  circuitBreakerRegistry.removeAlertHandler(eventType, handler)
}
