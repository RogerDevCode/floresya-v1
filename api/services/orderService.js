/**
 * Order Service
 * CRUD operations with atomic order creation (stored function)
 * Uses indexed columns (user_id, status, created_at)
 * NO soft-delete (orders are permanent records)
 */

import { supabase, DB_SCHEMA } from './supabaseClient.js'
import { buildSearchCondition } from '../utils/normalize.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  BadRequestError
} from '../errors/AppError.js'

const TABLE = DB_SCHEMA.orders.table
const VALID_STATUSES = DB_SCHEMA.orders.enums.status
const SEARCH_COLUMNS = DB_SCHEMA.orders.search

/**
 * Validate order data
 */
function validateOrderData(data, isUpdate = false) {
  if (!isUpdate) {
    if (
      !data.customer_email ||
      typeof data.customer_email !== 'string' ||
      !data.customer_email.includes('@')
    ) {
      throw new ValidationError('Order validation failed', {
        customer_email: 'must be valid email'
      })
    }
    if (!data.customer_name || typeof data.customer_name !== 'string') {
      throw new ValidationError('Order validation failed', {
        customer_name: 'must be a non-empty string'
      })
    }
    if (!data.delivery_address || typeof data.delivery_address !== 'string') {
      throw new ValidationError('Order validation failed', {
        delivery_address: 'must be a non-empty string'
      })
    }
    if (
      !data.total_amount_usd ||
      typeof data.total_amount_usd !== 'number' ||
      data.total_amount_usd <= 0
    ) {
      throw new ValidationError('Order validation failed', {
        total_amount_usd: 'must be a positive number'
      })
    }
  }

  if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
    throw new ValidationError('Order validation failed', {
      status: `must be one of ${VALID_STATUSES.join(', ')}`
    })
  }
}

/**
 * Get all orders with filters
 * Supports accent-insensitive search via normalized columns
 * Includes order_items with product details
 */
export async function getAllOrders(filters = {}) {
  try {
    let query = supabase.from(TABLE).select(`
      *,
      order_items (
        id,
        product_id,
        product_name,
        quantity,
        unit_price_usd,
        subtotal_usd
      )
    `)

    // Search filter (uses indexed normalized columns)
    const searchCondition = buildSearchCondition(SEARCH_COLUMNS, filters.search)
    if (searchCondition) {
      query = query.or(searchCondition)
    }

    // Indexed filters
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }

    if (filters.status && VALID_STATUSES.includes(filters.status)) {
      query = query.eq('status', filters.status)
    }

    // Date range filter (uses indexed created_at)
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from)
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to)
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
      throw new DatabaseError('SELECT', TABLE, error)
    }
    if (!data) {
      throw new NotFoundError('Orders')
    }

    return data
  } catch (error) {
    console.error('getAllOrders failed:', error)
    throw error
  }
}

/**
 * Get order by ID with items
 */
export async function getOrderById(id) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid order ID: must be a number', { orderId: id })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select(
        `
        *,
        order_items (*)
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error, { orderId: id })
    }
    if (!data) {
      throw new NotFoundError('Order', id)
    }

    return data
  } catch (error) {
    console.error(`getOrderById(${id}) failed:`, error)
    throw error
  }
}

/**
 * Get orders by user (indexed query)
 */
export async function getOrdersByUser(userId, filters = {}) {
  try {
    if (!userId || typeof userId !== 'number') {
      throw new BadRequestError('Invalid user ID: must be a number', { userId })
    }

    let query = supabase
      .from(TABLE)
      .select(
        `
        *,
        order_items (*)
      `
      )
      .eq('user_id', userId)

    if (filters.status && VALID_STATUSES.includes(filters.status)) {
      query = query.eq('status', filters.status)
    }

    query = query.order('created_at', { ascending: false })

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error, { userId })
    }
    if (!data) {
      throw new NotFoundError('Orders for user', userId, { userId })
    }

    return data
  } catch (error) {
    console.error(`getOrdersByUser(${userId}) failed:`, error)
    throw error
  }
}

/**
 * Create order with items (uses atomic stored function)
 */
export async function createOrderWithItems(orderData, orderItems) {
  try {
    validateOrderData(orderData, false)

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      throw new ValidationError('Order validation failed', {
        orderItems: 'must be a non-empty array'
      })
    }

    // Validate each item and check stock
    for (const item of orderItems) {
      if (!item.product_id || typeof item.product_id !== 'number') {
        throw new ValidationError('Order validation failed', {
          'orderItems.product_id': 'must be a number'
        })
      }
      if (!item.product_name || typeof item.product_name !== 'string') {
        throw new ValidationError('Order validation failed', {
          'orderItems.product_name': 'must be a string'
        })
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        throw new ValidationError('Order validation failed', {
          'orderItems.quantity': 'must be positive'
        })
      }
      if (
        !item.unit_price_usd ||
        typeof item.unit_price_usd !== 'number' ||
        item.unit_price_usd <= 0
      ) {
        throw new ValidationError('Order validation failed', {
          'orderItems.unit_price_usd': 'must be positive'
        })
      }

      // Validate stock availability
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, stock, active')
        .eq('id', item.product_id)
        .single()

      if (productError || !product) {
        throw new NotFoundError('Product', item.product_id, { productId: item.product_id })
      }

      if (!product.active) {
        throw new ValidationError('Product is not active', {
          productId: item.product_id,
          productName: product.name
        })
      }

      if (product.stock < item.quantity) {
        throw new ValidationError('Insufficient stock', {
          productId: item.product_id,
          productName: product.name,
          requested: item.quantity,
          available: product.stock
        })
      }
    }

    const orderPayload = {
      user_id: orderData.user_id || null,
      customer_email: orderData.customer_email,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone || null,
      delivery_address: orderData.delivery_address,
      delivery_city: orderData.delivery_city || null,
      delivery_state: orderData.delivery_state || null,
      delivery_zip: orderData.delivery_zip || null,
      delivery_date: orderData.delivery_date || null,
      delivery_time_slot: orderData.delivery_time_slot || null,
      delivery_notes: orderData.delivery_notes || null,
      status: orderData.status || 'pending',
      total_amount_usd: orderData.total_amount_usd,
      total_amount_ves: orderData.total_amount_ves || null,
      currency_rate: orderData.currency_rate || null,
      notes: orderData.notes || null,
      admin_notes: orderData.admin_notes || null
    }

    const itemsPayload = orderItems.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      product_summary: item.product_summary || null,
      unit_price_usd: item.unit_price_usd,
      unit_price_ves: item.unit_price_ves || null,
      quantity: item.quantity,
      subtotal_usd: item.unit_price_usd * item.quantity,
      subtotal_ves: item.unit_price_ves ? item.unit_price_ves * item.quantity : null
    }))

    // Use atomic stored function (SSOT: DB_FUNCTIONS.createOrderWithItems)
    const { data, error } = await supabase.rpc('create_order_with_items', {
      order_data: orderPayload,
      order_items: itemsPayload
    })

    if (error) {
      throw new DatabaseError('RPC', 'create_order_with_items', error, {
        orderData,
        itemCount: orderItems.length
      })
    }

    if (!data) {
      throw new DatabaseError('RPC', 'create_order_with_items', new Error('No data returned'), {
        orderData,
        itemCount: orderItems.length
      })
    }

    return data
  } catch (error) {
    console.error('createOrderWithItems failed:', error)
    throw error
  }
}

/**
 * Update order status with history (uses atomic stored function)
 */
export async function updateOrderStatus(orderId, newStatus, notes = null, changedBy = null) {
  try {
    if (!orderId || typeof orderId !== 'number') {
      throw new BadRequestError('Invalid order ID: must be a number', { orderId })
    }

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      throw new BadRequestError(`Invalid status: must be one of ${VALID_STATUSES.join(', ')}`, {
        newStatus
      })
    }

    // Use atomic stored function (SSOT: DB_FUNCTIONS.updateOrderStatusWithHistory)
    const { data, error } = await supabase.rpc('update_order_status_with_history', {
      order_id: orderId,
      new_status: newStatus,
      notes: notes,
      changed_by: changedBy
    })

    if (error) {
      if (error.message?.includes('not found')) {
        throw new NotFoundError('Order', orderId)
      }
      throw new DatabaseError('RPC', 'update_order_status_with_history', error, {
        orderId,
        newStatus
      })
    }

    if (!data) {
      throw new DatabaseError(
        'RPC',
        'update_order_status_with_history',
        new Error('No data returned'),
        {
          orderId,
          newStatus
        }
      )
    }

    return data
  } catch (error) {
    console.error(`updateOrderStatus(${orderId}) failed:`, error)
    throw error
  }
}

/**
 * Update order (limited fields)
 */
export async function updateOrder(id, updates) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid order ID: must be a number', { orderId: id })
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new BadRequestError('No updates provided', { orderId: id })
    }

    validateOrderData(updates, true)

    const allowedFields = [
      'delivery_address',
      'delivery_city',
      'delivery_state',
      'delivery_zip',
      'delivery_date',
      'delivery_time_slot',
      'delivery_notes',
      'notes',
      'admin_notes'
    ]
    const sanitized = {}

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        sanitized[key] = updates[key]
      }
    }

    if (Object.keys(sanitized).length === 0) {
      throw new BadRequestError('No valid fields to update', { orderId: id })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(sanitized)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { orderId: id })
    }
    if (!data) {
      throw new NotFoundError('Order', id)
    }

    return data
  } catch (error) {
    console.error(`updateOrder(${id}) failed:`, error)
    throw error
  }
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId, notes = 'Order cancelled', changedBy = null) {
  try {
    return await updateOrderStatus(orderId, 'cancelled', notes, changedBy)
  } catch (error) {
    console.error(`cancelOrder(${orderId}) failed:`, error)
    throw error
  }
}

/**
 * Get order status history
 */
export async function getOrderStatusHistory(orderId) {
  try {
    if (!orderId || typeof orderId !== 'number') {
      throw new BadRequestError('Invalid order ID: must be a number', { orderId })
    }

    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new DatabaseError('SELECT', 'order_status_history', error, { orderId })
    }
    if (!data) {
      throw new NotFoundError('Order status history', orderId, { orderId })
    }

    return data
  } catch (error) {
    console.error(`getOrderStatusHistory(${orderId}) failed:`, error)
    throw error
  }
}
