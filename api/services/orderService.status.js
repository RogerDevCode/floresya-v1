/**
 * Procesado por B
 */

/**
 * Order Service - Status Operations
 * Handles order status history and status-related operations
 * LEGACY: Modularizado desde orderService.js (WEEK 3)
 */

import { getOrderRepository, BadRequestError, NotFoundError } from './orderService.helpers.js'

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

    const orderRepository = await getOrderRepository()
    const data = await orderRepository.findStatusHistoryByOrderId(orderId)

    if (!data || data.length === 0) {
      throw new NotFoundError('Order status history', orderId, { orderId })
    }

    return data
  } catch (error) {
    console.error(`getOrderStatusHistory(${orderId}) failed:`, error)
    throw error
  }
}
