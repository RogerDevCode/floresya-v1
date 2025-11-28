/**
 * Procesado por B
 */

/**
 * Order Service - Cancel Operations
 * Handles order cancellation operations
 * LEGACY: Modularizado desde orderService.js (WEEK 3)
 */

import { getOrderRepository, BadRequestError } from './orderService.helpers.js'

/**
 * Cancel order - wrapper for updateOrderStatus that sets status to 'cancelled'
 * @param {number} orderId - Order ID to cancel
 * @param {string} [notes='Order cancelled'] - Cancellation notes
 * @param {number|null} [_changedBy=null] - User ID who cancelled the order (not used, kept for API compatibility)
 * @returns {Object} - Updated order with cancelled status
 * @throws {BadRequestError} When orderId is invalid
 * @throws {NotFoundError} When order is not found
 * @throws {DatabaseError} When database operation fails
 * @example
 * const order = await cancelOrder(123, 'Cliente solicitó cancelación', 456)
 */
export async function cancelOrder(orderId, notes = 'Order cancelled', _changedBy = null) {
  try {
    const orderRepository = await getOrderRepository()

    if (!orderId || typeof orderId !== 'number') {
      throw new BadRequestError('Invalid order ID: must be a number', { orderId })
    }

    // Use repository's cancel method
    const data = await orderRepository.cancel(orderId, notes)

    return data
  } catch (error) {
    console.error(`cancelOrder(${orderId}) failed:`, error)
    throw error
  }
}
