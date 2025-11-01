/**
 * Order Service
 * CRUD operations with atomic order creation (stored function)
 * Uses indexed columns (user_id, status, created_at)
 * Soft-delete implementation using status field (cancelled orders excluded by default)
 */

import { supabase, DB_SCHEMA } from './supabaseClient.js'
import { buildSearchCondition } from '../utils/normalize.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  BadRequestError,
  InternalServerError
} from '../errors/AppError.js'
import { sanitizeOrderData, sanitizeOrderItemData } from '../utils/sanitize.js'
import { PAGINATION } from '../config/constants.js'
import { withErrorMapping } from '../middleware/error/index.js'
import { validateOrder, validateId } from '../utils/validation.js'

const TABLE = DB_SCHEMA.orders.table
const VALID_STATUSES = DB_SCHEMA.orders.enums.status
const SEARCH_COLUMNS = DB_SCHEMA.orders.search

/**
 * Validate order ID (ENTERPRISE FAIL-FAST)
 * @param {number} id - Order ID to validate
 * @param {string} operation - Operation name for error context
 */
function _validateOrderId(id, operation = 'operation') {
  validateId(id, 'Order', operation)
}

/**
 * Get all orders with filters
 * Supports accent-insensitive search via normalized columns
 * Includes order_items with product details
 * @param {Object} filters - Filter options
 * @param {number} [filters.user_id] - Filter by user ID
 * @param {string} [filters.status] - Filter by order status (pending, verified, preparing, shipped, delivered, cancelled)
 * @param {string} [filters.date_from] - Filter orders from date
 * @param {string} [filters.date_to] - Filter orders to date
 * @param {string} [filters.search] - Search in customer_name and customer_email (accent-insensitive)
 * @param {number} [filters.limit] - Number of items to return
 * @param {number} [filters.offset] - Number of items to skip
 * @param {boolean} includeInactive - Include cancelled orders (default: false, admin only)
 * @returns {Object[]} - Array of orders with items
 * @throws {NotFoundError} When no orders are found
 * @throws {DatabaseError} When database query fails
 */
export const getAllOrders = withErrorMapping(
  async (filters = {}, includeInactive = false) => {
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

    // By default, exclude cancelled orders (business rule: "venta cancelada no es venta")
    if (!includeInactive) {
      query = query.neq('status', 'cancelled')
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
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || PAGINATION.DEFAULT_LIMIT) - 1
      )
    }

    const { data, error } = await query

    if (error) {
      // Map Supabase error automatically
      throw error
    }
    if (!data) {
      throw new NotFoundError('Orders')
    }

    return data
  },
  'SELECT',
  TABLE
)

/**
 * Get order by ID with items and product details
 * @param {number} id - Order ID to retrieve
 * @param {boolean} includeInactive - Include cancelled orders (default: false, admin only)
 * @returns {Object} - Order object with order_items array
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When order is not found
 * @throws {DatabaseError} When database query fails
 * @example
 * const order = await getOrderById(123)
 */
export async function getOrderById(id, includeInactive = false) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid order ID: must be a number', { orderId: id })
    }

    let query = supabase
      .from(TABLE)
      .select(
        `
        *,
        order_items (*)
      `
      )
      .eq('id', id)

    // By default, exclude cancelled orders (business rule: "venta cancelada no es venta")
    if (!includeInactive) {
      query = query.neq('status', 'cancelled')
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('Row not found')) {
        throw new NotFoundError('Order', id)
      }
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
 * Get orders by user (indexed query) with optional status filtering
 * @param {number} userId - User ID to filter orders by
 * @param {Object} [filters={}] - Filter options
 * @param {string} [filters.status] - Filter by order status
 * @param {number} [filters.limit] - Maximum number of orders to return
 * @returns {Object[]} - Array of orders for the user
 * @throws {BadRequestError} When userId is invalid
 * @throws {NotFoundError} When no orders are found for the user
 * @throws {DatabaseError} When database query fails
 * @example
 * const orders = await getOrdersByUser(123, { status: 'delivered', limit: 10 })
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
    validateOrder(orderData, VALID_STATUSES, false)

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      throw new ValidationError('Order validation failed', {
        orderItems: 'must be a non-empty array'
      })
    }

    // Validate each item and check stock
    for (const item of orderItems) {
      // Convert string IDs to numbers if needed
      let productId = item.product_id
      if (typeof productId === 'string') {
        productId = parseInt(productId, 10)
      }

      if (!productId || typeof productId !== 'number' || isNaN(productId)) {
        throw new ValidationError('Order validation failed', {
          'orderItems.product_id': 'must be a number'
        })
      }
      if (!item.product_name || typeof item.product_name !== 'string') {
        throw new ValidationError('Order validation failed', {
          'orderItems.product_name': 'must be a string'
        })
      }

      // Convert string quantities to numbers if needed
      let quantity = item.quantity
      if (typeof quantity === 'string') {
        quantity = parseInt(quantity, 10)
      }

      if (!quantity || typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
        throw new ValidationError('Order validation failed', {
          'orderItems.quantity': 'must be positive'
        })
      }

      // Convert string prices to numbers if needed
      let unitPriceUsd = item.unit_price_usd
      if (typeof unitPriceUsd === 'string') {
        unitPriceUsd = parseFloat(unitPriceUsd)
      }

      if (
        !unitPriceUsd ||
        typeof unitPriceUsd !== 'number' ||
        isNaN(unitPriceUsd) ||
        unitPriceUsd <= 0
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

    // Sanitize order data before database operations
    const sanitizedOrderData = sanitizeOrderData(orderData, false)

    // Convert string amounts to numbers if needed for the order payload
    let totalAmountVes = sanitizedOrderData.total_amount_ves
    if (typeof totalAmountVes === 'string') {
      totalAmountVes = parseFloat(totalAmountVes)
    }

    let currencyRate = sanitizedOrderData.currency_rate
    if (typeof currencyRate === 'string') {
      currencyRate = parseFloat(currencyRate)
    }

    const orderPayload = {
      user_id: sanitizedOrderData.user_id !== undefined ? sanitizedOrderData.user_id : null,
      customer_email: sanitizedOrderData.customer_email,
      customer_name: sanitizedOrderData.customer_name,
      customer_phone:
        sanitizedOrderData.customer_phone !== undefined ? sanitizedOrderData.customer_phone : null,
      delivery_address: sanitizedOrderData.delivery_address,
      delivery_date:
        sanitizedOrderData.delivery_date !== undefined ? sanitizedOrderData.delivery_date : null,
      delivery_time_slot:
        sanitizedOrderData.delivery_time_slot !== undefined
          ? sanitizedOrderData.delivery_time_slot
          : null,
      delivery_notes:
        sanitizedOrderData.delivery_notes !== undefined ? sanitizedOrderData.delivery_notes : null,
      status: sanitizedOrderData.status !== undefined ? sanitizedOrderData.status : 'pending',
      total_amount_usd:
        typeof sanitizedOrderData.total_amount_usd === 'string'
          ? parseFloat(sanitizedOrderData.total_amount_usd)
          : sanitizedOrderData.total_amount_usd,
      total_amount_ves:
        totalAmountVes !== null && totalAmountVes !== undefined ? Math.round(totalAmountVes) : null,
      currency_rate: currencyRate !== undefined ? currencyRate : null,
      notes: sanitizedOrderData.notes !== undefined ? sanitizedOrderData.notes : null,
      admin_notes:
        sanitizedOrderData.admin_notes !== undefined ? sanitizedOrderData.admin_notes : null
    }

    const itemsPayload = orderItems.map(item => {
      // Sanitize item data before database operations
      const sanitizedItem = sanitizeOrderItemData(item)

      // Ensure numeric values are properly converted
      const productId =
        typeof sanitizedItem.product_id === 'string'
          ? parseInt(sanitizedItem.product_id, 10)
          : sanitizedItem.product_id
      const unitPriceUsd =
        typeof sanitizedItem.unit_price_usd === 'string'
          ? parseFloat(sanitizedItem.unit_price_usd)
          : sanitizedItem.unit_price_usd
      const unitPriceVes =
        typeof sanitizedItem.unit_price_ves === 'string'
          ? parseFloat(sanitizedItem.unit_price_ves)
          : sanitizedItem.unit_price_ves
      const quantity =
        typeof sanitizedItem.quantity === 'string'
          ? parseInt(sanitizedItem.quantity, 10)
          : sanitizedItem.quantity

      // Apply intelligent rounding to VES values (round to nearest integer)
      const roundedUnitPriceVes =
        unitPriceVes !== null && unitPriceVes !== undefined ? Math.round(unitPriceVes) : null
      const roundedSubtotalVes =
        unitPriceVes !== null && unitPriceVes !== undefined
          ? Math.round(unitPriceVes * quantity)
          : null

      return {
        product_id: productId,
        product_name: sanitizedItem.product_name,
        product_summary:
          sanitizedItem.product_summary !== undefined ? sanitizedItem.product_summary : null,
        unit_price_usd: unitPriceUsd,
        unit_price_ves: roundedUnitPriceVes,
        quantity: quantity,
        subtotal_usd: unitPriceUsd * quantity,
        subtotal_ves: roundedSubtotalVes
      }
    })

    // Use atomic stored function (SSOT: DB_FUNCTIONS.createOrderWithItems)
    const result = await supabase.rpc('create_order_with_items', {
      order_data: orderPayload,
      order_items: itemsPayload
    })

    const data = result?.data ?? result
    const error = result?.error

    if (error) {
      throw new DatabaseError('RPC', 'create_order_with_items', error, {
        orderData,
        itemCount: orderItems.length
      })
    }

    // RPC functions return single values, not arrays
    if (data === null || (Array.isArray(data) && data.length === 0)) {
      throw new DatabaseError(
        'RPC',
        'create_order_with_items',
        new InternalServerError('No data returned'),
        {
          orderData,
          itemCount: orderItems.length
        }
      )
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
        new InternalServerError('No data returned'),
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
 * Update order (limited fields) - only allows updating delivery and note fields
 * @param {number} id - Order ID to update
 * @param {Object} updates - Updated order data
 * @param {string} [updates.delivery_address] - Delivery address
 * @param {string} [updates.delivery_date] - Delivery date
 * @param {string} [updates.delivery_time_slot] - Delivery time slot
 * @param {string} [updates.delivery_notes] - Delivery notes
 * @param {string} [updates.notes] - Customer notes
 * @param {string} [updates.admin_notes] - Admin notes
 * @returns {Object} - Updated order
 * @throws {BadRequestError} When ID is invalid or no valid updates are provided
 * @throws {ValidationError} When order data is invalid
 * @throws {NotFoundError} When order is not found
 * @throws {DatabaseError} When database update fails
 * @example
 * const order = await updateOrder(123, {
 *   delivery_address: 'Nueva dirección 456',
 *   delivery_notes: 'Llamar al timbre'
 * })
 */
export async function updateOrder(id, updates) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid order ID: must be a number', { orderId: id })
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new BadRequestError('No updates provided', { orderId: id })
    }

    validateOrder(updates, VALID_STATUSES, true)

    const allowedFields = [
      'delivery_address',
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
 * Cancel order - wrapper for updateOrderStatus that sets status to 'cancelled'
 * @param {number} orderId - Order ID to cancel
 * @param {string} [notes='Order cancelled'] - Cancellation notes
 * @param {number|null} [changedBy=null] - User ID who cancelled the order
 * @returns {Object} - Updated order with cancelled status
 * @throws {BadRequestError} When orderId is invalid
 * @throws {NotFoundError} When order is not found
 * @throws {DatabaseError} When database operation fails
 * @example
 * const order = await cancelOrder(123, 'Cliente solicitó cancelación', 456)
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
 * Get order status history - chronological record of all status changes
 * @param {number} orderId - Order ID to get history for
 * @returns {Object[]} - Array of status history records ordered by creation date
 * @throws {BadRequestError} When orderId is invalid
 * @throws {NotFoundError} When order or history is not found
 * @throws {DatabaseError} When database query fails
 * @example
 * const history = await getOrderStatusHistory(123)
 * // Returns: [{ id: 1, order_id: 123, old_status: 'pending', new_status: 'verified', created_at: '...' }]
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
