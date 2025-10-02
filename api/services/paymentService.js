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
 * Create order with items using the database function
 * @param {Object} orderData - Order data with customer info and items
 * @returns {Object} Created order with items
 * @throws {ValidationError} If required fields missing or invalid
 * @throws {DatabaseError} If database operation fails
 */
export async function createOrderWithItems(orderData) {
  try {
    // ENTERPRISE VALIDATION with field-level errors
    const errors = {}

    // Customer info validation
    if (!orderData.customer_email || typeof orderData.customer_email !== 'string') {
      errors.customer_email = 'Customer email is required'
    }
    if (!orderData.customer_name || typeof orderData.customer_name !== 'string') {
      errors.customer_name = 'Customer name is required'
    }
    if (!orderData.customer_phone || typeof orderData.customer_phone !== 'string') {
      errors.customer_phone = 'Customer phone is required'
    }

    // Delivery info validation
    if (!orderData.delivery_address || typeof orderData.delivery_address !== 'string') {
      errors.delivery_address = 'Delivery address is required'
    }
    if (!orderData.delivery_city || typeof orderData.delivery_city !== 'string') {
      errors.delivery_city = 'Delivery city is required'
    }
    if (!orderData.delivery_state || typeof orderData.delivery_state !== 'string') {
      errors.delivery_state = 'Delivery state is required'
    }

    // Order amount validation
    if (
      !orderData.total_amount_usd ||
      typeof orderData.total_amount_usd !== 'number' ||
      orderData.total_amount_usd <= 0
    ) {
      errors.total_amount_usd = 'Total amount USD must be a positive number'
    }

    // Items validation
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      errors.items = 'Order items are required and must be a non-empty array'
    } else {
      // Validate each item
      for (let i = 0; i < orderData.items.length; i++) {
        const item = orderData.items[i]
        if (!item.product_id || typeof item.product_id !== 'number') {
          errors[`items[${i}].product_id`] = 'Product ID is required and must be a number'
        }
        if (!item.product_name || typeof item.product_name !== 'string') {
          errors[`items[${i}].product_name`] = 'Product name is required'
        }
        if (
          !item.unit_price_usd ||
          typeof item.unit_price_usd !== 'number' ||
          item.unit_price_usd < 0
        ) {
          errors[`items[${i}].unit_price_usd`] = 'Unit price USD must be a non-negative number'
        }
        if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
          errors[`items[${i}].quantity`] = 'Quantity must be a positive number'
        }
      }
    }

    // Throw if validation errors exist
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Order validation failed', errors)
    }

    // Prepare order data for the database function
    const orderPayload = {
      user_id: orderData.user_id || null,
      customer_email: orderData.customer_email,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      delivery_address: orderData.delivery_address,
      delivery_city: orderData.delivery_city,
      delivery_state: orderData.delivery_state,
      delivery_zip: orderData.delivery_zip || '',
      delivery_date: orderData.delivery_date || null,
      delivery_time_slot: orderData.delivery_time_slot || '',
      delivery_notes: orderData.delivery_notes || '',
      status: orderData.status || 'pending',
      total_amount_usd: orderData.total_amount_usd,
      total_amount_ves: orderData.total_amount_ves || orderData.total_amount_usd * 40,
      currency_rate: orderData.currency_rate || 40,
      notes: orderData.notes || '',
      admin_notes: orderData.admin_notes || ''
    }

    // Prepare order items for the database function
    const orderItems = orderData.items.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      product_summary: item.product_summary || item.product_name,
      unit_price_usd: item.unit_price_usd,
      unit_price_ves: item.unit_price_ves || item.unit_price_usd * 40,
      quantity: item.quantity,
      subtotal_usd: item.subtotal_usd || item.unit_price_usd * item.quantity,
      subtotal_ves: item.subtotal_ves || item.unit_price_usd * item.quantity * 40
    }))

    // Call the database function
    const { data, error } = await supabase.rpc('create_order_with_items', {
      order_data: orderPayload,
      order_items: orderItems
    })

    if (error) {
      throw new DatabaseError('RPC', 'create_order_with_items', error, {
        orderPayload,
        itemCount: orderItems.length
      })
    }

    if (!data) {
      throw new DatabaseError('RPC', 'create_order_with_items', new Error('No data returned'), {
        orderPayload,
        itemCount: orderItems.length
      })
    }

    return data
  } catch (error) {
    // Re-throw AppError instances as-is (fail-fast)
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error('createOrderWithItems failed:', error)
    throw new DatabaseError('RPC', 'create_order_with_items', error, { orderData })
  }
}

/**
 * Confirm payment for an order
 * @param {number} orderId - Order ID
 * @param {Object} paymentData - Payment confirmation data
 * @returns {Object} Updated order with payment
 * @throws {BadRequestError} If invalid input
 * @throws {NotFoundError} If order not found
 * @throws {DatabaseError} If database operation fails
 */
export async function confirmPayment(orderId, paymentData) {
  try {
    // Validation
    if (!orderId || typeof orderId !== 'number') {
      throw new BadRequestError('Invalid order ID: must be a number', { orderId })
    }

    if (!paymentData.payment_method || typeof paymentData.payment_method !== 'string') {
      throw new BadRequestError('Payment method is required', { paymentData })
    }

    if (!paymentData.reference_number || typeof paymentData.reference_number !== 'string') {
      throw new BadRequestError('Reference number is required', { paymentData })
    }

    // Validate order exists
    const { data: order, error: orderError } = await supabase
      .from(ORDERS_TABLE)
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError) {
      throw new Error(`Order not found: ${orderError.message}`)
    }

    // Create payment record
    const paymentPayload = {
      order_id: orderId,
      user_id: order.user_id,
      amount_usd: order.total_amount_usd,
      amount_ves: order.total_amount_ves,
      currency_rate: order.currency_rate,
      status: 'completed',
      payment_method_name: getPaymentMethodDisplayName(paymentData.payment_method),
      transaction_id: `TXN-${Date.now()}`,
      reference_number: paymentData.reference_number,
      payment_details: paymentData.payment_details || {},
      receipt_image_url: paymentData.receipt_image_url || null,
      admin_notes: `Payment confirmed via ${paymentData.payment_method}`,
      payment_date: new Date().toISOString(),
      confirmed_date: new Date().toISOString()
    }

    const { data: payment, error: paymentError } = await supabase
      .from(PAYMENTS_TABLE)
      .insert(paymentPayload)
      .select()
      .single()

    if (paymentError) {
      throw new Error(`Payment creation failed: ${paymentError.message}`)
    }

    // Update order status to verified
    await updateOrderStatus(
      orderId,
      'verified',
      `Payment confirmed via ${paymentData.payment_method}`
    )

    return payment
  } catch (error) {
    console.error('confirmPayment failed:', error)
    throw error
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId, includeInactive = false) {
  try {
    if (!orderId || typeof orderId !== 'number') {
      throw new Error('Invalid order ID')
    }

    let query = supabase
      .from(ORDERS_TABLE)
      .select(
        `
        *,
        order_items (*),
        payments (*)
      `
      )
      .eq('id', orderId)

    if (!includeInactive) {
      query = query.neq('status', 'cancelled')
    }

    const { data, error } = await query.single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data) {
      throw new Error(`Order ${orderId} not found`)
    }

    return data
  } catch (error) {
    console.error(`getOrderById(${orderId}) failed:`, error)
    throw error
  }
}

/**
 * Get all orders with filters
 */
export async function getAllOrders(filters = {}, includeInactive = false) {
  try {
    let query = supabase.from(ORDERS_TABLE).select(
      `
        *,
        order_items (*)
      `,
      { count: 'exact' }
    )

    if (!includeInactive) {
      query = query.neq('status', 'cancelled')
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }

    query = query.order('created_at', { ascending: false })

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data) {
      throw new Error('No orders found')
    }

    return {
      orders: data,
      total: count
    }
  } catch (error) {
    console.error('getAllOrders failed:', error)
    throw error
  }
}

/**
 * Update order status with history
 */
export async function updateOrderStatus(orderId, newStatus, notes = null, changedBy = null) {
  try {
    if (!orderId || typeof orderId !== 'number') {
      throw new Error('Invalid order ID')
    }

    // Call the database function to update status with history
    const { data, error } = await supabase.rpc('update_order_status_with_history', {
      order_id: orderId,
      new_status: newStatus,
      notes: notes,
      changed_by: changedBy
    })

    if (error) {
      throw new Error(`Status update failed: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error(`updateOrderStatus(${orderId}, ${newStatus}) failed:`, error)
    throw error
  }
}

/**
 * Get payment method display name
 */
function getPaymentMethodDisplayName(method) {
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
