/**
 * Dependency Injection Container
 * Implements IoC (Inversion of Control) for clean architecture
 * Following SOLID principles and Dependency Inversion Principle
 */

import { InternalServerError } from '../errors/AppError.js'
import { supabase } from '../services/supabaseClient.js'
import { createProductRepository } from '../repositories/ProductRepository.js'
import { createUserRepository } from '../repositories/UserRepository.js'
import { createOrderRepository } from '../repositories/OrderRepository.js'
import { createPaymentRepository } from '../repositories/PaymentRepository.js'
import { createPaymentMethodRepository } from '../repositories/PaymentMethodRepository.js'

/**
 * DI Container following Service Locator pattern
 * Provides centralized dependency management
 */
class DIContainer {
  static services = new Map()
  static instances = new Map()

  /**
   * Register a service class with its dependencies
   * @param {string} name - Service name (key)
   * @param {Function} Implementation - Service class constructor
   * @param {Array} dependencies - Array of dependency names
   */
  static register(name, Implementation, dependencies = []) {
    this.services.set(name, {
      Implementation,
      dependencies
    })
  }

  /**
   * Register an existing instance (singleton pattern)
   * @param {string} name - Service name
   * @param {Object} instance - Pre-created instance
   */
  static registerInstance(name, instance) {
    this.instances.set(name, instance)
  }

  /**
   * Resolve and get service instance
   * Creates instance if not exists (singleton for services)
   * @param {string} name - Service name to resolve
   * @returns {Object} Service instance
   */
  static resolve(name) {
    // Check if already instantiated (singleton)
    if (this.instances.has(name)) {
      return this.instances.get(name)
    }

    // Check if service is registered
    if (!this.services.has(name)) {
      throw new InternalServerError(`Service not registered: ${name}`, { serviceName: name })
    }

    const { Implementation, dependencies } = this.services.get(name)

    // Resolve dependencies recursively
    const resolvedDependencies = dependencies.map(dep => this.resolve(dep))

    // Create instance with dependencies
    const instance = new Implementation(...resolvedDependencies)

    // Cache instance (singleton pattern)
    this.instances.set(name, instance)

    return instance
  }

  /**
   * Clear all registered services and instances
   * Useful for testing
   */
  static clear() {
    this.services.clear()
    this.instances.clear()
  }

  /**
   * Check if service is registered
   * @param {string} name - Service name
   * @returns {boolean} True if registered
   */
  static has(name) {
    return this.services.has(name) || this.instances.has(name)
  }
}

/**
 * Initialize DI Container with all services
 * Call this once in app initialization
 */
export function initializeDIContainer() {
  // Register database client as singleton
  DIContainer.registerInstance('SupabaseClient', supabase)

  // Register Repositories (ACTIVE - Repository Pattern in use)
  // Repository Pattern provides abstraction layer between Services and Database
  DIContainer.register('ProductRepository', createProductRepository, ['SupabaseClient'])
  DIContainer.register('UserRepository', createUserRepository, ['SupabaseClient'])
  DIContainer.register('OrderRepository', createOrderRepository, ['SupabaseClient'])
  DIContainer.register('PaymentRepository', createPaymentRepository, ['SupabaseClient'])
  DIContainer.register('PaymentMethodRepository', createPaymentMethodRepository, ['SupabaseClient'])

  return DIContainer
}

export default DIContainer
