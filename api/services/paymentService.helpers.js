/**
 * Payment Service - Helper Functions & Shared Imports
 * LEGACY: Modularizado desde paymentService.js (PHASE 5)
 */

import DIContainer from '../architecture/di-container.js'
import {
  ValidationError,
  DatabaseError,
  NotFoundError,
  BadRequestError,
  InternalServerError
} from '../errors/AppError.js'

/**
 * Get PaymentMethodRepository instance from DI Container
 * @returns {PaymentMethodRepository} Repository instance
 */
function getPaymentMethodRepository() {
  return DIContainer.resolve('PaymentMethodRepository')
}

/**
 * Get PaymentRepository instance from DI Container
 * @returns {PaymentRepository} Repository instance
 */
function getPaymentRepository() {
  return DIContainer.resolve('PaymentRepository')
}

/**
 * Get SettingsRepository instance from DI Container
 * @returns {SettingsRepository} Repository instance
 */
function getSettingsRepository() {
  return DIContainer.resolve('SettingsRepository')
}

/**
 * Get OrderRepository instance from DI Container
 * @returns {OrderRepository} Repository instance
 */
function getOrderRepository() {
  return DIContainer.resolve('OrderRepository')
}

export {
  getPaymentMethodRepository,
  getPaymentRepository,
  getSettingsRepository,
  getOrderRepository,
  ValidationError,
  DatabaseError,
  NotFoundError,
  BadRequestError,
  InternalServerError
}
