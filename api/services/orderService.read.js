/**
 * Order Service - Read Operations
 * Handles all order retrieval operations
 * LEGACY: Modularizado desde orderService.js (WEEK 3)
 */

import {
  getOrderRepository,
  NotFoundError,
  BadRequestError,
  withErrorMapping
} from './orderService.helpers.js'

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
 * @param {boolean} includeDeactivated - Include cancelled orders (default: false, admin only)
 * @returns {Object[]} - Array of orders with items
 * @throws {NotFoundError} When no orders are found
 * @throws {DatabaseError} When database query fails
 */
export const getAllOrders = withErrorMapping(
  async (filters = {}, includeDeactivated = false) => {
    const orderRepository = getOrderRepository()

    // Use repository to get orders with filters
    const data = await orderRepository.findAllWithFilters(filters, { includeDeactivated })

    if (!data) {
      throw new NotFoundError('Orders')
    }

    return data
  },
  'SELECT',
  'orders'
)

/**
 * Get order by ID with items and product details
 * @param {number} id - Order ID to retrieve
 * @param {boolean} includeDeactivated - Include cancelled orders (default: false, admin only)
 * @returns {Object} - Order object with order_items array
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When order is not found
 * @throws {DatabaseError} When database query fails
 * @example
 * const order = await getOrderById(123)
 */
export async function getOrderById(id, includeDeactivated = false) {
  try {
    const orderRepository = getOrderRepository()

    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid order ID: must be a number', { orderId: id })
    }

    // Use repository to get order
    const data = await orderRepository.findByIdWithItems(id, includeDeactivated)

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
    const orderRepository = getOrderRepository()

    if (!userId || typeof userId !== 'number') {
      throw new BadRequestError('Invalid user ID: must be a number', { userId })
    }

    // Use repository to get orders by user
    const data = await orderRepository.findByUserId(userId, filters)

    if (!data) {
      throw new NotFoundError('Orders for user', userId, { userId })
    }

    return data
  } catch (error) {
    console.error(`getOrdersByUser(${userId}) failed:`, error)
    throw error
  }
}
