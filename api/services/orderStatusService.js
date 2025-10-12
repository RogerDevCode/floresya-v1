/**
 * OrderStatusService
 * Business logic for order_status_history table
 */

import { supabase } from './supabaseClient.js'
import { BadRequestError, DatabaseError } from '../errors/AppError.js'
import { QUERY_LIMITS } from '../config/constants.js'

/**
 * Get status history for an order
 * @param {string} orderId
 * @returns {Promise<Array>}
 */
export async function getOrderStatusHistory(orderId) {
  try {
    if (!orderId) {
      throw new BadRequestError('Order ID required', { orderId })
    }

    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new DatabaseError('SELECT', 'order_status_history', error, { orderId })
    }

    return data || []
  } catch (error) {
    console.error(`orderStatusService.getOrderStatusHistory(${orderId}) falló:`, error)
    throw error
  }
}

/**
 * Add status update to order history
 * @param {string} orderId
 * @param {Object} statusData - {status, notes, changed_by}
 * @returns {Promise<Object>}
 */
export async function addStatusUpdate(orderId, statusData) {
  try {
    if (!orderId) {
      throw new BadRequestError('Order ID required', { orderId })
    }
    if (!statusData.status) {
      throw new BadRequestError('Status required', { statusData })
    }

    const { data, error } = await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status: statusData.status,
        notes: statusData.notes || null,
        changed_by: statusData.changed_by || null
      })
      .select()
      .single()

    if (error) {
      throw new DatabaseError('INSERT', 'order_status_history', error, { orderId, statusData })
    }

    return data
  } catch (error) {
    console.error('orderStatusService.addStatusUpdate() falló:', error)
    throw error
  }
}

/**
 * Get latest status for an order
 * @param {string} orderId
 * @returns {Promise<Object|null>}
 */
export async function getLatestStatus(orderId) {
  try {
    if (!orderId) {
      throw new BadRequestError('Order ID required', { orderId })
    }

    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(QUERY_LIMITS.SINGLE_RECORD)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new DatabaseError('SELECT', 'order_status_history', error, { orderId })
    }

    return data || null
  } catch (error) {
    console.error(`orderStatusService.getLatestStatus(${orderId}) falló:`, error)
    throw error
  }
}
