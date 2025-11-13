/**
 * Payment Service - Venezuelan Payment Methods
 * Business logic for payment processing and order management
 * ENTERPRISE FAIL-FAST: Uses custom error classes with metadata
 *
 * REPOSITORY PATTERN: Uses PaymentRepository and PaymentMethodRepository for data access
 * Following Service Layer Exclusive principle
 */

import DIContainer from '../architecture/di-container.js'
import {
  ValidationError,
  DatabaseError,
  NotFoundError,
  BadRequestError,
  InternalServerError
} from '../errors/AppError.js'
import { validateEmail, validateVenezuelanPhone } from '../utils/validation.js'

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

/**
 * Get available payment methods for Venezuela
 * @returns {Array} Active payment methods sorted by display_order
 * @throws {DatabaseError} If database query fails
 * @throws {NotFoundError} If no payment methods found
 */
export async function getPaymentMethods() {
  try {
    const paymentMethodRepository = getPaymentMethodRepository()

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
 * Validate Venezuelan phone number format (FAIL-FAST version)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if phone number is valid Venezuelan format
 * @throws {ValidationError} When phone format is invalid
 * @example
 * isValidVenezuelanPhone('04141234567') // Returns: true
 * isValidVenezuelanPhone('584141234567') // Returns: true
 * isValidVenezuelanPhone('123456789') // Throws ValidationError
 */
export function isValidVenezuelanPhone(phone) {
  try {
    validateVenezuelanPhone(phone)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 * Validate email format using regex pattern (FAIL-FAST version)
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email format is valid
 * @throws {ValidationError} When email format is invalid
 * @example
 * isValidEmail('user@example.com') // Returns: true
 * isValidEmail('invalid-email') // Returns: false
 */
export function isValidEmail(email) {
  try {
    validateEmail(email)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 * Generate unique order reference with timestamp and random component
 * @returns {string} - Unique order reference in format FY-{timestamp}{random}
 * @example
 * generateOrderReference() // Returns: 'FY-123456789'
 */
export function generateOrderReference() {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `FY-${timestamp}${random}`
}

/**
 * Get delivery cost from settings (FAIL-FAST - no fallback)
 * @returns {number} Delivery cost in USD
 * @throws {DatabaseError} If settings query fails
 * @throws {NotFoundError} If delivery cost setting is not found
 * @throws {ValidationError} If delivery cost value is invalid
 * @example
 * const cost = await getDeliveryCost() // Returns configured value or throws error
 */
export async function getDeliveryCost() {
  try {
    const settingsRepository = getSettingsRepository()
    const data = await settingsRepository.findByKey('DELIVERY_COST_USD')

    if (!data) {
      throw new NotFoundError('Setting', 'DELIVERY_COST_USD', { key: 'DELIVERY_COST_USD' })
    }

    const cost = parseFloat(data.value)
    if (isNaN(cost) || cost < 0) {
      throw new ValidationError('Invalid delivery cost value', {
        key: 'DELIVERY_COST_USD',
        value: data.value,
        rule: 'must be a non-negative number'
      })
    }

    return cost
  } catch (error) {
    // Re-throw AppError instances as-is (fail-fast)
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error('getDeliveryCost failed:', error)
    throw new DatabaseError('SELECT', 'settings', error, { key: 'DELIVERY_COST_USD' })
  }
}

/**
 * Get BCV exchange rate from settings (FAIL-FAST - no fallback)
 * @returns {number} BCV rate (USD to VES)
 * @throws {DatabaseError} If settings query fails
 * @throws {NotFoundError} If BCV rate setting is not found
 * @throws {ValidationError} If BCV rate value is invalid
 * @example
 * const rate = await getBCVRate() // Returns configured value or throws error
 */
export async function getBCVRate() {
  try {
    const settingsRepository = getSettingsRepository()
    const data = await settingsRepository.findByKey('bcv_usd_rate')

    if (!data) {
      throw new NotFoundError('Setting', 'bcv_usd_rate', { key: 'bcv_usd_rate' })
    }

    const rate = parseFloat(data.value)
    if (isNaN(rate) || rate <= 0) {
      throw new ValidationError('Invalid BCV rate value', {
        key: 'bcv_usd_rate',
        value: data.value,
        rule: 'must be a positive number'
      })
    }

    return rate
  } catch (error) {
    // Re-throw AppError instances as-is (fail-fast)
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error('getBCVRate failed:', error)
    throw new DatabaseError('SELECT', 'settings', error, { key: 'bcv_usd_rate' })
  }
}

/**
 * Confirm payment for an order - creates a payment record with the provided details
 * @param {number} orderId - Order ID to confirm payment for
 * @param {Object} paymentData - Payment confirmation data
 * @param {string} paymentData.payment_method - Payment method code (e.g., 'cash', 'mobile_payment')
 * @param {string} paymentData.reference_number - Payment reference number
 * @param {string} [paymentData.payment_details] - Additional payment details
 * @param {string} [paymentData.receipt_image_url] - Receipt image URL
 * @param {number} [paymentData.confirmed_by] - User ID who confirmed the payment
 * @returns {Object} - Created payment record
 * @throws {BadRequestError} When orderId or payment data is invalid
 * @throws {ValidationError} When payment method or reference is missing
 * @throws {NotFoundError} When order or payment method is not found
 * @throws {DatabaseError} When payment record creation fails
 * @example
 * const payment = await confirmPayment(123, {
 *   payment_method: 'mobile_payment',
 *   reference_number: 'REF123456',
 *   payment_details: 'Pago móvil desde Banco XYZ',
 *   confirmed_by: 456
 * })
 */
export async function confirmPayment(orderId, paymentData) {
  try {
    if (!orderId || typeof orderId !== 'number') {
      throw new BadRequestError('Invalid order ID', { orderId })
    }

    if (!paymentData.payment_method) {
      throw new ValidationError('Payment method is required', { orderId })
    }

    if (!paymentData.reference_number) {
      throw new ValidationError('Reference number is required', { orderId })
    }

    // Get payment method details using repository
    const paymentMethodRepository = getPaymentMethodRepository()
    const methods = await paymentMethodRepository.findAllWithFilters(
      { type: paymentData.payment_method, active: true },
      { limit: 1 }
    )

    if (!methods || methods.length === 0) {
      throw new NotFoundError('Payment Method', paymentData.payment_method)
    }

    const method = methods[0]

    // Get order to validate and get amount using repository
    const orderRepository = getOrderRepository()
    const order = await orderRepository.findByIdWithItems(orderId)

    if (!order) {
      throw new NotFoundError('Order', orderId)
    }

    // Create payment record using repository
    const payment = {
      order_id: orderId,
      payment_method_id: method.id,
      payment_method_name: method.name,
      amount_usd: order.total_amount_usd,
      amount_ves: order.total_amount_ves,
      currency_rate: order.currency_rate,
      reference_number: paymentData.reference_number,
      payment_details: paymentData.payment_details || null,
      receipt_image_url: paymentData.receipt_image_url || null,
      status: 'pending',
      user_id: paymentData.confirmed_by || null,
      payment_date: new Date().toISOString()
    }

    const paymentRepository = getPaymentRepository()
    const data = await paymentRepository.create(payment)

    if (!data) {
      throw new DatabaseError('INSERT', 'payments', new InternalServerError('No data returned'), {
        orderId
      })
    }

    return data
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error(`confirmPayment(${orderId}) failed:`, error)
    throw new DatabaseError('INSERT', 'payments', error, { orderId })
  }
}

/**
 * Get payments for an order - retrieves all payment records for a specific order
 * @param {number} orderId - Order ID to get payments for
 * @returns {Object[]} - Array of payment records ordered by creation date (newest first)
 * @throws {BadRequestError} When orderId is invalid
 * @throws {NotFoundError} When order or payments are not found
 * @throws {DatabaseError} When database query fails
 * @example
 * const payments = await getOrderPayments(123)
 * // Returns: [{ id: 1, order_id: 123, payment_method_name: 'Pago Móvil', amount_usd: 45.99, ... }]
 */
export async function getOrderPayments(orderId) {
  try {
    if (!orderId || typeof orderId !== 'number') {
      throw new BadRequestError('Invalid order ID', { orderId })
    }

    const paymentRepository = getPaymentRepository()
    const data = await paymentRepository.findByOrderId(orderId)

    if (!data || data.length === 0) {
      throw new NotFoundError('Payments for order', orderId)
    }

    return data
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error(`getOrderPayments(${orderId}) failed:`, error)
    throw new DatabaseError('SELECT', 'payments', error, { orderId })
  }
}
