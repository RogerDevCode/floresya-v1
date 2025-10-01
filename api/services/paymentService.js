/**
 * Payment Service
 * CRUD operations for payments
 * Uses indexed columns (order_id, status)
 * NO soft-delete (payments are permanent audit records)
 */

import { supabase, DB_SCHEMA } from './supabaseClient.js'

const TABLE = DB_SCHEMA.payments.table
const VALID_STATUSES = DB_SCHEMA.payments.enums.status
const VALID_TYPES = DB_SCHEMA.payment_methods.enums.type

/**
 * Validate payment data
 */
function validatePaymentData(data, isUpdate = false) {
  if (!isUpdate) {
    if (!data.order_id || typeof data.order_id !== 'number') {
      throw new Error('Invalid order_id: must be a number')
    }
    if (!data.amount_usd || typeof data.amount_usd !== 'number' || data.amount_usd <= 0) {
      throw new Error('Invalid amount_usd: must be a positive number')
    }
    if (!data.payment_method_name || typeof data.payment_method_name !== 'string') {
      throw new Error('Invalid payment_method_name: must be a non-empty string')
    }
  }

  if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
    throw new Error(`Invalid status: must be one of ${VALID_STATUSES.join(', ')}`)
  }

  if (
    data.amount_usd !== undefined &&
    (typeof data.amount_usd !== 'number' || data.amount_usd <= 0)
  ) {
    throw new Error('Invalid amount_usd: must be a positive number')
  }
}

/**
 * Get all payments with filters
 */
export async function getAllPayments(filters = {}) {
  try {
    let query = supabase.from(TABLE).select('*')

    // Indexed filters
    if (filters.order_id) {
      query = query.eq('order_id', filters.order_id)
    }

    if (filters.status && VALID_STATUSES.includes(filters.status)) {
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

    const { data, error } = await query

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error('No payments found')
    }

    return data
  } catch (error) {
    console.error('getAllPayments failed:', error)
    throw error
  }
}

/**
 * Get payment by ID
 */
export async function getPaymentById(id) {
  try {
    if (!id || typeof id !== 'number') {
      throw new Error('Invalid payment ID: must be a number')
    }

    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error(`Payment ${id} not found`)
    }

    return data
  } catch (error) {
    console.error(`getPaymentById(${id}) failed:`, error)
    throw error
  }
}

/**
 * Get payments by order (indexed query)
 */
export async function getPaymentsByOrder(orderId) {
  try {
    if (!orderId || typeof orderId !== 'number') {
      throw new Error('Invalid order ID: must be a number')
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error('No payments found for this order')
    }

    return data
  } catch (error) {
    console.error(`getPaymentsByOrder(${orderId}) failed:`, error)
    throw error
  }
}

/**
 * Get payments by user
 */
export async function getPaymentsByUser(userId, filters = {}) {
  try {
    if (!userId || typeof userId !== 'number') {
      throw new Error('Invalid user ID: must be a number')
    }

    let query = supabase.from(TABLE).select('*').eq('user_id', userId)

    if (filters.status && VALID_STATUSES.includes(filters.status)) {
      query = query.eq('status', filters.status)
    }

    query = query.order('created_at', { ascending: false })

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error('No payments found for this user')
    }

    return data
  } catch (error) {
    console.error(`getPaymentsByUser(${userId}) failed:`, error)
    throw error
  }
}

/**
 * Create payment
 */
export async function createPayment(paymentData) {
  try {
    validatePaymentData(paymentData, false)

    const newPayment = {
      order_id: paymentData.order_id,
      payment_method_id: paymentData.payment_method_id || null,
      user_id: paymentData.user_id || null,
      amount_usd: paymentData.amount_usd,
      amount_ves: paymentData.amount_ves || null,
      currency_rate: paymentData.currency_rate || null,
      status: paymentData.status || 'pending',
      payment_method_name: paymentData.payment_method_name,
      transaction_id: paymentData.transaction_id || null,
      reference_number: paymentData.reference_number || null,
      payment_details: paymentData.payment_details || null,
      receipt_image_url: paymentData.receipt_image_url || null,
      admin_notes: paymentData.admin_notes || null,
      payment_date: paymentData.payment_date || null
    }

    const { data, error } = await supabase.from(TABLE).insert(newPayment).select().single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error('Failed to create payment')
    }

    return data
  } catch (error) {
    console.error('createPayment failed:', error)
    throw error
  }
}

/**
 * Update payment
 */
export async function updatePayment(id, updates) {
  try {
    if (!id || typeof id !== 'number') {
      throw new Error('Invalid payment ID: must be a number')
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('No updates provided')
    }

    validatePaymentData(updates, true)

    const allowedFields = [
      'status',
      'transaction_id',
      'reference_number',
      'payment_details',
      'receipt_image_url',
      'admin_notes',
      'payment_date',
      'confirmed_date'
    ]
    const sanitized = {}

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        sanitized[key] = updates[key]
      }
    }

    if (Object.keys(sanitized).length === 0) {
      throw new Error('No valid fields to update')
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(sanitized)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error(`Payment ${id} not found`)
    }

    return data
  } catch (error) {
    console.error(`updatePayment(${id}) failed:`, error)
    throw error
  }
}

/**
 * Confirm payment
 */
export async function confirmPayment(id, adminNotes = null) {
  try {
    if (!id || typeof id !== 'number') {
      throw new Error('Invalid payment ID: must be a number')
    }

    const updates = {
      status: 'completed',
      confirmed_date: new Date().toISOString()
    }

    if (adminNotes) {
      updates.admin_notes = adminNotes
    }

    return await updatePayment(id, updates)
  } catch (error) {
    console.error(`confirmPayment(${id}) failed:`, error)
    throw error
  }
}

/**
 * Mark payment as failed
 */
export async function failPayment(id, reason = null) {
  try {
    if (!id || typeof id !== 'number') {
      throw new Error('Invalid payment ID: must be a number')
    }

    const updates = {
      status: 'failed'
    }

    if (reason) {
      updates.admin_notes = reason
    }

    return await updatePayment(id, updates)
  } catch (error) {
    console.error(`failPayment(${id}) failed:`, error)
    throw error
  }
}

/**
 * Refund payment (partial or full)
 */
export async function refundPayment(id, isPartial = false, refundNotes = null) {
  try {
    if (!id || typeof id !== 'number') {
      throw new Error('Invalid payment ID: must be a number')
    }

    const updates = {
      status: isPartial ? 'partially_refunded' : 'refunded'
    }

    if (refundNotes) {
      updates.admin_notes = refundNotes
    }

    return await updatePayment(id, updates)
  } catch (error) {
    console.error(`refundPayment(${id}) failed:`, error)
    throw error
  }
}

/**
 * Get payment methods (active)
 */
export async function getActivePaymentMethods() {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error('No payment methods found')
    }

    return data
  } catch (error) {
    console.error('getActivePaymentMethods failed:', error)
    throw error
  }
}
