/**
 * OrderStatusService
 * Business logic for order_status_history table
 */

import { supabase } from './supabaseClient.js'

/**
 * Get status history for an order
 * @param {string} orderId
 * @returns {Promise<Array>}
 */
export async function getOrderStatusHistory(orderId) {
  try {
    if (!orderId) {
      throw new Error('ID de orden requerido')
    }

    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Error en BD: ${error.message}`)
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
      throw new Error('ID de orden requerido')
    }
    if (!statusData.status) {
      throw new Error('Status requerido')
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
      throw new Error(`Error al agregar status: ${error.message}`)
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
      throw new Error('ID de orden requerido')
    }

    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error en BD: ${error.message}`)
    }

    return data || null
  } catch (error) {
    console.error(`orderStatusService.getLatestStatus(${orderId}) falló:`, error)
    throw error
  }
}
