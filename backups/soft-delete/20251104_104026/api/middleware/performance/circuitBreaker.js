/**
 * Circuit Breaker Middleware
 * Protects against cascading failures when database is down
 * Implements CLOSED → OPEN → HALF_OPEN state transitions
 *
 * IMPORTANT: This middleware is designed to work with the Service Layer Exclusivo pattern.
 * It provides a circuit breaker instance that services can use to wrap their database operations.
 * Controllers and routes should NOT directly access database; only services should use this.
 */

import { ServiceUnavailableError } from '../../errors/AppError.js'

// Circuit breaker states
const STATES = {
  CLOSED: 'CLOSED', // Normal operation
  OPEN: 'OPEN', // Failing, reject requests
  HALF_OPEN: 'HALF_OPEN' // Testing if service recovered
}

// Default configuration
const DEFAULT_CONFIG = {
  failureThreshold: 5, // Open circuit after 5 failures
  recoveryTimeout: 30000, // Wait 30 seconds before half-open
  monitoringPeriod: 60000, // Reset failure count every minute
  successThreshold: 3 // Close circuit after 3 successes in half-open
}

/**
 * Circuit Breaker Class
 */
class CircuitBreaker {
  constructor(name, config = {}) {
    this.name = name
    this.config = { ...DEFAULT_CONFIG, ...config }

    this.state = STATES.CLOSED
    this.failureCount = 0
    this.successCount = 0
    this.lastFailureTime = null
    this.nextAttempt = null

    // Reset failure count periodically
    setInterval(() => {
      this.resetFailureCount()
    }, this.config.monitoringPeriod)
  }

  /**
   * Check if request should be allowed through
   */
  async execute(operation) {
    if (this.state === STATES.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new ServiceUnavailableError(
          `Circuit breaker is OPEN for ${this.name}. Next attempt at ${new Date(this.nextAttempt).toISOString()}`,
          { circuitBreaker: this.name, state: this.state, nextAttempt: this.nextAttempt }
        )
      } else {
        this.state = STATES.HALF_OPEN
        this.successCount = 0
        console.warn(`Circuit breaker ${this.name} transitioning to HALF_OPEN`)
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  /**
   * Handle successful operation
   */
  onSuccess() {
    this.failureCount = 0

    if (this.state === STATES.HALF_OPEN) {
      this.successCount++

      if (this.successCount >= this.config.successThreshold) {
        this.state = STATES.CLOSED
        console.info(
          `Circuit breaker ${this.name} transitioned to CLOSED after ${this.successCount} successes`
        )
      }
    }
  }

  /**
   * Handle failed operation
   */
  onFailure() {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.state === STATES.HALF_OPEN) {
      this.state = STATES.OPEN
      this.nextAttempt = Date.now() + this.config.recoveryTimeout
      console.error(`Circuit breaker ${this.name} transitioned to OPEN after failure in HALF_OPEN`)
    } else if (this.state === STATES.CLOSED && this.failureCount >= this.config.failureThreshold) {
      this.state = STATES.OPEN
      this.nextAttempt = Date.now() + this.config.recoveryTimeout
      console.error(
        `Circuit breaker ${this.name} transitioned to OPEN after ${this.failureCount} failures`
      )
    }
  }

  /**
   * Reset failure count (called periodically)
   */
  resetFailureCount() {
    if (this.failureCount > 0 && Date.now() - this.lastFailureTime > this.config.monitoringPeriod) {
      console.info(
        `Circuit breaker ${this.name} resetting failure count from ${this.failureCount} to 0`
      )
      this.failureCount = 0
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.nextAttempt,
      isHealthy: this.state === STATES.CLOSED
    }
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
 * Get circuit breaker status for monitoring
 */
export function getCircuitBreakerStatus() {
  return {
    database: dbCircuitBreaker.getStatus(),
    timestamp: new Date().toISOString()
  }
}

/**
 * Reset circuit breaker (admin function)
 */
export function resetCircuitBreaker(name = 'database') {
  if (name === 'database') {
    dbCircuitBreaker.state = STATES.CLOSED
    dbCircuitBreaker.failureCount = 0
    dbCircuitBreaker.successCount = 0
    dbCircuitBreaker.nextAttempt = null
    console.info('Database circuit breaker reset to CLOSED state')
  }
}

/**
 * Force circuit breaker to open (for testing)
 */
export function forceCircuitBreakerOpen(name = 'database', duration = 30000) {
  if (name === 'database') {
    dbCircuitBreaker.state = STATES.OPEN
    dbCircuitBreaker.nextAttempt = Date.now() + duration
    console.warn(`Database circuit breaker forced to OPEN state for ${duration}ms`)
  }
}

/**
 * Health check endpoint for circuit breakers
 */
export function circuitBreakerHealthCheck(req, res) {
  const status = getCircuitBreakerStatus()

  const isHealthy = status.database.isHealthy

  res.status(isHealthy ? 200 : 503).json({
    success: true,
    data: status,
    message: isHealthy ? 'All circuit breakers healthy' : 'Some circuit breakers are open'
  })
}
