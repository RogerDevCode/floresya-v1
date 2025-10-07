/**
 * Payment Service - Venezuelan Payment Methods
 * Business logic for payment processing and order management
 * ENTERPRISE FAIL-FAST: Uses custom error classes with metadata
 */

import { supabase, DB_SCHEMA } from './supabaseClient.js'
import {
  ValidationError,
  DatabaseError,
  NotFoundError,
  BadRequestError
} from '../errors/AppError.js'

const ORDERS_TABLE = DB_SCHEMA.orders.table
const PAYMENTS_TABLE = DB_SCHEMA.payments.table
const PAYMENT_METHODS_TABLE = DB_SCHEMA.payment_methods.table

/**
 * Get available payment methods for Venezuela
 * @returns {Array} Active payment methods sorted by display_order
 * @throws {DatabaseError} If database query fails
 * @throws {NotFoundError} If no payment methods found
 */
export async function getPaymentMethods() {
  try {
    const { data, error } = await supabase
      .from(PAYMENT_METHODS_TABLE)
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      throw new DatabaseError('SELECT', PAYMENT_METHODS_TABLE, error, {})
    }

    if (!data || data.length === 0) {
      throw new NotFoundError('Payment Methods', 'active', { is_active: true })
    }

    return data
  } catch (error) {
    // Re-throw AppError instances as-is (fail-fast)
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error('getPaymentMethods failed:', error)
    throw new DatabaseError('SELECT', PAYMENT_METHODS_TABLE, error, {})
  }
}

/**
 * Get payment method display name
 */
function _getPaymentMethodDisplayName(method) {
  const names = {
    cash: 'Efectivo',
    mobile_payment: 'Pago Móvil',
    bank_transfer: 'Transferencia Bancaria',
    zelle: 'Zelle',
    crypto: 'Criptomonedas'
  }
  return names[method] || method
}

/**
 * Validate Venezuelan phone number
 */
export function isValidVenezuelanPhone(phone) {
  if (!phone) {
    return false
  }

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')

  // Check if it starts with 0 and has 10 digits, or starts with 58 and has 12 digits
  return (
    (digits.startsWith('0') && digits.length === 10) ||
    (digits.startsWith('58') && digits.length === 12) ||
    (digits.length === 10 &&
      ['0412', '0414', '0416', '0424', '0426'].some(prefix => digits.startsWith(prefix)))
  )
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  if (!email) {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generate unique order reference
 */
export function generateOrderReference() {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `FY-${timestamp}${random}`
}

/**
 * Get delivery cost from settings
 * @returns {number} Delivery cost in USD
 * @throws {DatabaseError} If settings query fails
 */
export async function getDeliveryCost() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value, type')
      .eq('key', 'DELIVERY_COST_USD')
      .single()

    if (error) {
      console.warn('getDeliveryCost: Setting not found, using default $7.00')
      return 7.0
    }

    if (!data) {
      console.warn('getDeliveryCost: No data returned, using default $7.00')
      return 7.0
    }

    const cost = parseFloat(data.value)
    if (isNaN(cost) || cost < 0) {
      console.warn('getDeliveryCost: Invalid value, using default $7.00')
      return 7.0
    }

    return cost
  } catch (error) {
    console.error('getDeliveryCost failed:', error)
    // Fail-safe: return default cost
    return 7.0
  }
}

/**
 * Get BCV exchange rate from settings
 * @returns {number} BCV rate (USD to VES)
 */
export async function getBCVRate() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value, type')
      .eq('key', 'bcv_usd_rate')
      .single()

    if (error) {
      console.warn('getBCVRate: Setting not found, using default rate 40.00')
      return 40.0
    }

    if (!data) {
      console.warn('getBCVRate: No data returned, using default rate 40.00')
      return 40.0
    }

    const rate = parseFloat(data.value)
    if (isNaN(rate) || rate <= 0) {
      console.warn('getBCVRate: Invalid rate, using default 40.00')
      return 40.0
    }

    return rate
  } catch (error) {
    console.error('getBCVRate failed:', error)
    // Fail-safe: return default rate
    return 40.0
  }
}

/**
 * Confirm payment for an order
 * Creates a payment record with the provided details
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

    // Get payment method details
    const { data: method, error: methodError } = await supabase
      .from(PAYMENT_METHODS_TABLE)
      .select('id, name')
      .eq('code', paymentData.payment_method)
      .eq('is_active', true)
      .single()

    if (methodError || !method) {
      throw new NotFoundError('Payment Method', paymentData.payment_method)
    }

    // Get order to validate and get amount
    const { data: order, error: orderError } = await supabase
      .from(ORDERS_TABLE)
      .select('total_amount_usd, total_amount_ves, currency_rate')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw new NotFoundError('Order', orderId)
    }

    // Create payment record
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

    const { data, error } = await supabase.from(PAYMENTS_TABLE).insert(payment).select().single()

    if (error) {
      throw new DatabaseError('INSERT', PAYMENTS_TABLE, error, { orderId })
    }

    if (!data) {
      throw new DatabaseError('INSERT', PAYMENTS_TABLE, new Error('No data returned'), {
        orderId
      })
    }

    return data
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error(`confirmPayment(${orderId}) failed:`, error)
    throw new DatabaseError('INSERT', PAYMENTS_TABLE, error, { orderId })
  }
}

/**
 * Get payments for an order
 */
export async function getOrderPayments(orderId) {
  try {
    if (!orderId || typeof orderId !== 'number') {
      throw new BadRequestError('Invalid order ID', { orderId })
    }

    const { data, error } = await supabase
      .from(PAYMENTS_TABLE)
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new DatabaseError('SELECT', PAYMENTS_TABLE, error, { orderId })
    }

    if (!data) {
      throw new NotFoundError('Payments for order', orderId)
    }

    return data
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error(`getOrderPayments(${orderId}) failed:`, error)
    throw new DatabaseError('SELECT', PAYMENTS_TABLE, error, { orderId })
  }
}
