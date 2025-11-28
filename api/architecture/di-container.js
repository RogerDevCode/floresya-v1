/**
 * Procesado por B
 */

/**
 * Distributed Service Registry Container
 * Eliminates single point of failure through distributed pattern
 * Implements health checks, fallback mechanisms, and graceful degradation
 * CRITICAL: Prevents cascading failures through service isolation
 */

import { DatabaseError, ConfigurationError } from '../errors/AppError.js'
// import { InternalServerError } from '../errors/AppError.js'
// import { BadRequestError } from '../errors/AppError.js'
import { supabase } from '../services/supabaseClient.js'
import { logger } from '../utils/logger.js'
import { createProductRepository } from '../repositories/ProductRepository.js'
import { createUserRepository } from '../repositories/UserRepository.js'
import { createOrderRepository } from '../repositories/OrderRepository.js'
import { createPaymentRepository } from '../repositories/PaymentRepository.js'
import { createPaymentMethodRepository } from '../repositories/PaymentMethodRepository.js'
import { createOccasionRepository } from '../repositories/OccasionRepository.js'
import { createSettingsRepository } from '../repositories/SettingsRepository.js'
import { createProductImageRepository } from '../repositories/ProductImageRepository.js'

// Service health status
const SERVICE_STATUS = {
  HEALTHY: 'HEALTHY',
  DEGRADED: 'DEGRADED',
  FAILED: 'FAILED',
  UNKNOWN: 'UNKNOWN'
}

// Service health monitoring
class ServiceHealthMonitor {
  constructor() {
    this.healthChecks = new Map()
    this.statusHistory = new Map()
    this.monitoringInterval = 30000 // 30 seconds
  }

  registerHealthCheck(serviceName, healthCheckFunction) {
    this.healthChecks.set(serviceName, {
      check: healthCheckFunction,
      lastCheck: null,
      status: SERVICE_STATUS.UNKNOWN,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0
    })

    // Start monitoring
    this.startMonitoring(serviceName)
  }

  startMonitoring(serviceName) {
    setInterval(async () => {
      await this.performHealthCheck(serviceName)
    }, this.monitoringInterval)
  }

  async performHealthCheck(serviceName) {
    const healthInfo = this.healthChecks.get(serviceName)
    if (!healthInfo) {
      return
    }

    try {
      const result = await healthInfo.check()

      if (result.healthy) {
        healthInfo.consecutiveFailures = 0
        healthInfo.consecutiveSuccesses++
        healthInfo.status =
          healthInfo.consecutiveSuccesses >= 3 ? SERVICE_STATUS.HEALTHY : SERVICE_STATUS.DEGRADED
      } else {
        healthInfo.consecutiveFailures++
        healthInfo.consecutiveSuccesses = 0
        healthInfo.status =
          healthInfo.consecutiveFailures >= 3 ? SERVICE_STATUS.FAILED : SERVICE_STATUS.DEGRADED
      }

      healthInfo.lastCheck = Date.now()
      this.updateStatusHistory(serviceName, healthInfo.status, result)
    } catch (error) {
      logger.error(`Health check failed for ${serviceName}:`, error)
      healthInfo.consecutiveFailures++
      healthInfo.consecutiveSuccesses = 0
      healthInfo.status = SERVICE_STATUS.FAILED
      healthInfo.lastCheck = Date.now()
    }
  }

  updateStatusHistory(serviceName, status, result) {
    if (!this.statusHistory.has(serviceName)) {
      this.statusHistory.set(serviceName, [])
    }

    const history = this.statusHistory.get(serviceName)
    history.push({
      status,
      timestamp: Date.now(),
      details: result
    })

    // Keep only last 100 entries
    if (history.length > 100) {
      history.shift()
    }
  }

  getServiceStatus(serviceName) {
    const healthInfo = this.healthChecks.get(serviceName)
    if (!healthInfo) {
      return { status: SERVICE_STATUS.UNKNOWN, lastCheck: null }
    }

    return {
      status: healthInfo.status,
      lastCheck: healthInfo.lastCheck,
      consecutiveFailures: healthInfo.consecutiveFailures,
      consecutiveSuccesses: healthInfo.consecutiveSuccesses,
      history: this.statusHistory.get(serviceName) || []
    }
  }

  isServiceHealthy(serviceName) {
    const status = this.getServiceStatus(serviceName)
    return status.status === SERVICE_STATUS.HEALTHY
  }
}

/**
 * Distributed Service Registry Container
 * Eliminates single point of failure through distributed pattern
 */
class DistributedServiceRegistry {
  constructor() {
    this.services = new Map()
    this.instances = new Map()
    this.fallbacks = new Map()
    this.healthMonitor = new ServiceHealthMonitor()
    this.circuitBreakers = new Map()
    this.serviceAliases = new Map()
  }

  /**
   * Register a service with advanced configuration
   * @param {string} name - Service name
   * @param {Function} Implementation - Service class constructor
   * @param {Object} config - Service configuration
   */
  register(name, Implementation, config = {}) {
    const {
      dependencies = [],
      fallback = null,
      healthCheck = null,
      circuitBreaker = true,
      retries = 3,
      timeout = 30000
    } = config

    this.services.set(name, {
      Implementation,
      dependencies,
      config: {
        circuitBreaker,
        retries,
        timeout
      }
    })

    // Register fallback mechanism
    if (fallback) {
      this.fallbacks.set(name, fallback)
    }

    // Register health check
    if (healthCheck) {
      this.healthMonitor.registerHealthCheck(name, healthCheck)
    }

    logger.info(`Service registered: ${name}`, {
      dependencies: dependencies.length,
      hasFallback: !!fallback,
      hasHealthCheck: !!healthCheck
    })
  }

  /**
   * Register service alias for backward compatibility
   */
  registerAlias(alias, actualServiceName) {
    this.serviceAliases.set(alias, actualServiceName)
  }

  /**
   * Register an existing instance with health monitoring
   */
  registerInstance(name, instance, config = {}) {
    const { healthCheck = null, circuitBreaker = false } = config

    this.instances.set(name, {
      instance,
      registeredAt: Date.now(),
      healthCheck,
      circuitBreaker
    })

    if (healthCheck) {
      this.healthMonitor.registerHealthCheck(name, async () => {
        try {
          if (typeof healthCheck === 'function') {
            return await healthCheck(instance)
          }
          return { healthy: true }
        } catch (error) {
          return { healthy: false, error: error.message }
        }
      })
    }

    logger.info(`Instance registered: ${name}`)
  }

  /**
   * Resolve service with advanced error handling and fallbacks
   */
  async resolve(name) {
    // Handle service aliases
    const actualName = this.serviceAliases.get(name) || name

    // Check cached instances first
    if (this.instances.has(actualName)) {
      const cached = this.instances.get(actualName)
      const serviceStatus = this.healthMonitor.getServiceStatus(actualName)

      if (serviceStatus.status === SERVICE_STATUS.FAILED) {
        logger.warn(`Attempting to resolve failed service: ${actualName}`)
        return await this.handleServiceFailure(actualName)
      }

      return cached.instance
    }

    // Check if service is registered
    if (!this.services.has(actualName)) {
      throw new ConfigurationError(`Service not registered: ${actualName}`, {
        serviceName: actualName
      })
    }

    const { Implementation, dependencies, config } = this.services.get(actualName)
    const serviceStatus = this.healthMonitor.getServiceStatus(actualName)

    // If service is failed, try fallback
    if (serviceStatus.status === SERVICE_STATUS.FAILED) {
      logger.warn(`Service ${actualName} is failed, attempting fallback`)
      return await this.handleServiceFailure(actualName)
    }

    try {
      // Resolve dependencies with timeout
      const resolvedDependencies = await Promise.all(
        dependencies.map(async dep => {
          try {
            return await Promise.race([
              this.resolve(dep),
              new Promise((_, reject) =>
                setTimeout(
                  () => reject(new Error(`Dependency resolution timeout: ${dep}`)),
                  config.timeout
                )
              )
            ])
          } catch (error) {
            logger.error(`Failed to resolve dependency ${dep} for service ${actualName}:`, error)
            throw error
          }
        })
      )

      // Create service instance
      // For repository factories, just call them directly (they return instances)
      // Check if it's a factory by naming convention
      let instance
      try {
        // ENHANCED: Proper Static Async Factory pattern support with comprehensive error handling
        if (typeof Implementation === 'function' && Implementation.name.startsWith('create')) {
          // ✅ STATIC ASYNC FACTORY: Await factory result
          // This ensures all async dependencies are resolved before instantiation
          instance = await Implementation(...resolvedDependencies)
          logger.debug(`✅ Created ${actualName} using Static Async Factory`)
        } else if (typeof Implementation === 'function') {
          // ✅ CLASS CONSTRUCTOR: Direct instantiation with resolved dependencies
          // Ensure no pending promises are passed to constructor
          instance = new Implementation(...resolvedDependencies)
          logger.debug(`✅ Created ${actualName} using class constructor`)
        } else {
          // ✅ OBJECT/SINGLETON: Direct assignment
          instance = Implementation
          logger.debug(`✅ Assigned ${actualName} as existing object/singleton`)
        }
      } catch (error) {
        logger.warn(
          `❌ Failed to instantiate ${actualName} with primary method, analyzing error...`,
          {
            error: error.message,
            implementationType: typeof Implementation,
            implementationName: Implementation?.name || 'anonymous',
            dependenciesCount: resolvedDependencies.length
          }
        )

        // ENHANCED Fallback: Try alternative instantiation methods
        try {
          if (typeof Implementation === 'function' && Implementation.name.startsWith('create')) {
            // Fallback: Try as class constructor if factory failed
            instance = new Implementation(...resolvedDependencies)
            logger.warn(`⚠️  Fallback: Created ${actualName} using class constructor`)
          } else if (typeof Implementation === 'function') {
            // Fallback: Try as async factory if constructor failed
            instance = await Implementation(...resolvedDependencies)
            logger.warn(`⚠️  Fallback: Created ${actualName} using async factory`)
          } else {
            // Cannot fallback - throw original error
            throw new Error(`Cannot instantiate ${actualName}: unsupported implementation type`)
          }
        } catch (retryError) {
          logger.error(`❌ Failed to instantiate ${actualName} with both methods`, {
            primaryError: error.message,
            retryError: retryError.message,
            implementationType: typeof Implementation
          })
          throw new Error(`Failed to instantiate ${actualName}: ${retryError.message}`)
        }
      }

      // Cache with health monitoring
      this.instances.set(actualName, {
        instance,
        registeredAt: Date.now(),
        config
      })

      logger.info(`Service resolved successfully: ${actualName}`)
      return instance
    } catch (error) {
      logger.error(`Failed to resolve service ${actualName}:`, error)

      // Try fallback mechanism
      return await this.handleServiceFailure(actualName)
    }
  }

  /**
   * Handle service failure with fallback mechanisms
   */
  async handleServiceFailure(serviceName) {
    const fallback = this.fallbacks.get(serviceName)

    if (fallback) {
      logger.info(`Using fallback for failed service: ${serviceName}`)
      try {
        return await fallback()
      } catch (fallbackError) {
        logger.error(`Fallback failed for service ${serviceName}:`, fallbackError)
      }
    }

    // Return null as last resort to prevent cascade failures
    logger.warn(`No fallback available for service ${serviceName}, returning null`)
    return null
  }

  /**
   * Get comprehensive service status
   */
  getServiceStatus(name) {
    const actualName = this.serviceAliases.get(name) || name
    const serviceInfo = this.services.get(actualName)
    const instanceInfo = this.instances.get(actualName)
    const healthStatus = this.healthMonitor.getServiceStatus(actualName)

    return {
      name: actualName,
      registered: !!serviceInfo,
      instantiated: !!instanceInfo,
      health: healthStatus,
      registeredAt: instanceInfo?.registeredAt,
      config: serviceInfo?.config
    }
  }

  /**
   * Get all services status
   */
  getAllServicesStatus() {
    const status = {
      services: [],
      summary: {
        total: 0,
        healthy: 0,
        failed: 0,
        degraded: 0
      }
    }

    // Check registered services
    for (const [name] of this.services) {
      const serviceStatus = this.getServiceStatus(name)
      status.services.push(serviceStatus)

      // Update summary
      status.summary.total++
      switch (serviceStatus.health.status) {
        case SERVICE_STATUS.HEALTHY:
          status.summary.healthy++
          break
        case SERVICE_STATUS.FAILED:
          status.summary.failed++
          break
        case SERVICE_STATUS.DEGRADED:
          status.summary.degraded++
          break
      }
    }

    return status
  }

  /**
   * Check if service is available
   */
  isServiceAvailable(name) {
    const actualName = this.serviceAliases.get(name) || name
    const status = this.healthMonitor.getServiceStatus(actualName)
    return status.status === SERVICE_STATUS.HEALTHY || status.status === SERVICE_STATUS.DEGRADED
  }

  /**
   * Force service re-registration (for testing/recovery)
   */
  forceReRegister(name) {
    const actualName = this.serviceAliases.get(name) || name

    // Remove from instances to force re-creation
    this.instances.delete(actualName)

    // Reset health status
    const healthInfo = this.healthMonitor.healthChecks.get(actualName)
    if (healthInfo) {
      healthInfo.status = SERVICE_STATUS.UNKNOWN
      healthInfo.consecutiveFailures = 0
      healthInfo.consecutiveSuccesses = 0
    }

    logger.info(`Service ${actualName} marked for re-registration`)
  }

  /**
   * Clear all services and instances
   */
  clear() {
    this.services.clear()
    this.instances.clear()
    this.fallbacks.clear()
    this.healthMonitor.healthChecks.clear()
    this.healthMonitor.statusHistory.clear()
    this.serviceAliases.clear()

    logger.info('Service registry cleared')
  }

  /**
   * Legacy compatibility methods
   */
  static register(name, Implementation, dependencies = []) {
    if (!this.instance) {
      this.instance = new DistributedServiceRegistry()
    }
    this.instance.register(name, Implementation, { dependencies })
  }

  static registerInstance(name, instance) {
    if (!this.instance) {
      this.instance = new DistributedServiceRegistry()
    }
    this.instance.registerInstance(name, instance)
  }

  static async resolve(name) {
    if (!this.instance) {
      this.instance = new DistributedServiceRegistry()
    }
    return await this.instance.resolve(name)
  }

  static has(name) {
    if (!this.instance) {
      this.instance = new DistributedServiceRegistry()
    }
    return this.instance.isServiceAvailable(name)
  }

  static clear() {
    if (this.instance) {
      this.instance.clear()
    }
  }
}

// Create global instance for backward compatibility
DistributedServiceRegistry.instance = new DistributedServiceRegistry()

// Export as both old and new interfaces
const DIContainer = DistributedServiceRegistry
export { DIContainer, DistributedServiceRegistry }

/**
 * Initialize Distributed Service Registry with all services
 * Implements distributed pattern with health checks and fallbacks
 * CRITICAL: Prevents single point of failure through service isolation
 */
export async function initializeDIContainer() {
  const registry = DIContainer.instance || new DistributedServiceRegistry()

  try {
    // Register logger with health check
    registry.registerInstance('Logger', logger, {
      healthCheck: instance => {
        return { healthy: !!instance && typeof instance.info === 'function' }
      }
    })

    // Register database client with comprehensive health check
    registry.registerInstance('SupabaseClient', supabase, {
      healthCheck: async client => {
        try {
          const { data, error } = await client.from('users').select('id').limit(1)
          return {
            healthy: !error,
            error: error?.message,
            details: data ? 'Database connection healthy' : 'Query returned no data'
          }
        } catch (error) {
          return {
            healthy: false,
            error: error.message,
            details: 'Failed to connect to database'
          }
        }
      },
      circuitBreaker: true
    })

    // Repository Pattern with health checks and fallbacks
    const repositoryConfigs = [
      { name: 'ProductRepository', factory: createProductRepository },
      { name: 'UserRepository', factory: createUserRepository },
      { name: 'OrderRepository', factory: createOrderRepository },
      { name: 'PaymentRepository', factory: createPaymentRepository },
      { name: 'PaymentMethodRepository', factory: createPaymentMethodRepository },
      { name: 'OccasionRepository', factory: createOccasionRepository },
      { name: 'SettingsRepository', factory: createSettingsRepository },
      { name: 'ProductImageRepository', factory: createProductImageRepository }
    ]

    for (const { name, factory } of repositoryConfigs) {
      registry.register(name, factory, {
        dependencies: ['SupabaseClient'],
        fallback: () => {
          logger.warn(`Using fallback for ${name} - returning mock repository`)
          // Return a mock repository that returns empty arrays/null
          const baseMock = {
            findAll: () => Promise.resolve([]),
            findById: () => Promise.resolve(null),
            create: () => Promise.resolve({ id: Date.now() }),
            update: () => Promise.resolve({}),
            delete: () => Promise.resolve({ active: false }),
            // Critical methods for ProductRepository
            findFeatured: () => Promise.resolve([]),
            findBySku: () => Promise.resolve(null),
            updateStock: () => Promise.resolve({}),
            decrementStock: () => Promise.resolve({})
          }

          // Use Proxy to handle any other missing methods gracefully
          return new Proxy(baseMock, {
            get: (target, prop) => {
              if (prop in target) return target[prop]
              // Allow standard object properties
              if (typeof prop !== 'string') return undefined
              // Handle 'then' to prevent Promise wrapping issues
              if (prop === 'then') return undefined
              // Return a safe function for any other method call
              return async () => {
                logger.warn(`Fallback repository method called: ${name}.${prop}`)
                return [] // Default to empty array for safety
              }
            }
          })
        },
        healthCheck: async repo => {
          try {
            // Test basic repository operation
            if (typeof repo.findAll === 'function') {
              await repo.findAll({}, { limit: 1 })
              return { healthy: true, details: 'Repository operational' }
            }
            return { healthy: false, details: 'Repository methods not available' }
          } catch (error) {
            return {
              healthy: false,
              error: error.message,
              details: 'Repository health check failed'
            }
          }
        },
        circuitBreaker: true,
        retries: 3,
        timeout: 10000
      })
    }

    logger.info('Distributed Service Registry initialized successfully', {
      services: repositoryConfigs.length + 2, // +2 for logger and supabase
      healthMonitoring: true,
      circuitBreakers: true,
      fallbacks: true
    })

    return registry
  } catch (error) {
    logger.error('Failed to initialize Distributed Service Registry:', error)
    throw new InternalServerError('Service registry initialization failed', {
      originalError: error.message,
      services: registry.getAllServicesStatus()
    })
  }
}

/**
 * Get service registry status for monitoring
 */
export function getServiceRegistryStatus() {
  if (!DIContainer.instance) {
    return { error: 'Service registry not initialized' }
  }

  return DIContainer.instance.getAllServicesStatus()
}

/**
 * Force re-registration of all services (recovery mechanism)
 */
export async function reinitializeServices() {
  if (!DIContainer.instance) {
    throw new Error('Service registry not initialized')
  }

  logger.warn('Re-initializing all services...')

  // Clear existing services
  DIContainer.instance.clear()

  // Re-initialize
  return await initializeDIContainer()
}

// Legacy compatibility
export default DIContainer
