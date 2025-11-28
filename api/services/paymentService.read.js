/**
 * Procesado por B
 */

/**
 * Payment Service - Read Operations
 * Handles all payment retrieval operations
 * LEGACY: Modularizado desde paymentService.js (PHASE 5)
 */

import {
  getPaymentMethodRepository,
  getSettingsRepository,
  getPaymentRepository,
  NotFoundError
} from './paymentService.helpers.js'

/**
 * Get available payment methods for Venezuela
 * @returns {Array} Active payment methods sorted by display_order
 * @throws {DatabaseError} If database query fails
 * @throws {NotFoundError} If no payment methods found
 */
export async function getPaymentMethods() {
  try {
    const paymentMethodRepository = await getPaymentMethodRepository()

    // Use repository to get active payment methods
    const data = await paymentMethodRepository.findActive()

    if (!data || data.length === 0) {
      throw new NotFoundError('Payment Methods', 'active', { active: true })
    }

    return data
  } catch (error) {
    // Re-throw AppError instances as-is (fail-fast)
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error('getPaymentMethods failed:', error)
    throw error
  }
}

/**
 * Get delivery cost from settings (FAIL-FAST - no fallback)
 * @returns {number} Delivery cost in USD
 * @throws {DatabaseError} If settings query fails
 * @throws {NotFoundError} If delivery cost setting is not found
 * @throws {ValidationError} If delivery cost value is invalid
 */
export async function getDeliveryCost() {
  try {
    const settingsRepository = await getSettingsRepository()
    const data = await settingsRepository.findByKey('DELIVERY_COST_USD')

    if (!data) {
      throw new NotFoundError('Setting', 'DELIVERY_COST_USD')
    }

    const cost = parseFloat(data.value)
    if (isNaN(cost) || cost < 0) {
      throw new ValidationError('Invalid DELIVERY_COST_USD value', { value: data.value })
    }

    return cost
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error('getDeliveryCost failed:', error)
    throw error
  }
}

/**
 * Get USD to VES exchange rate from settings (FAIL-FAST - no fallback)
 * @returns {number} Exchange rate from USD to VES
 * @throws {DatabaseError} If settings query fails
 * @throws {NotFoundError} If exchange rate setting is not found
 * @throws {ValidationError} If exchange rate value is invalid
 */
export async function getBCVRate() {
  try {
    const settingsRepository = await getSettingsRepository()
    const data = await settingsRepository.findByKey('USD_VES_BCV_RATE')

    if (!data) {
      throw new NotFoundError('Setting', 'USD_VES_BCV_RATE')
    }

    const rate = parseFloat(data.value)
    if (isNaN(rate) || rate <= 0) {
      throw new ValidationError('Invalid USD_VES_BCV_RATE value', { value: data.value })
    }

    return rate
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error('getBCVRate failed:', error)
    throw error
  }
}

/**
 * Get all payments for an order
 * @param {number} orderId - Order ID to get payments for
 * @returns {Array} Array of payments for the order
 * @throws {BadRequestError} If orderId is invalid
 * @throws {NotFoundError} If no payments found for the order
 * @throws {DatabaseError} If database query fails
 */
export async function getOrderPayments(orderId) {
  try {
    if (!orderId || typeof orderId !== 'number') {
      throw new BadRequestError('Invalid order ID: must be a number', { orderId })
    }

    const paymentRepository = await getPaymentRepository()
    const data = await paymentRepository.findByOrderId(orderId)

    if (!data || data.length === 0) {
      throw new NotFoundError('Payments for order', orderId, { orderId })
    }

    return data
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error(`getOrderPayments(${orderId}) failed:`, error)
    throw error
  }
}
