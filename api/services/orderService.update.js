/**
 * Procesado por B
 */

/**
 * Order Service - Update Operations
 * Handles all order update operations
 * LEGACY: Modularizado desde orderService.js (WEEK 3)
 */

import {
  getOrderRepository,
  VALID_STATUSES,
  BadRequestError
} from './orderService.helpers.js'
import { validateOrder } from '../utils/validation.js'

/**
 * Update order status with history (uses atomic stored function)
 * @param {number} orderId - Order ID to update
 * @param {string} newStatus - New status for the order
 * @param {string} [notes] - Optional notes for the status change
 * @param {number} [changedBy] - User ID who changed the status
 * @returns {Object} - Updated order with status history
 * @throws {BadRequestError} When orderId or status is invalid
 * @throws {NotFoundError} When order is not found
 * @throws {DatabaseError} When database operation fails
 */
export async function updateOrderStatus(orderId, newStatus, notes = null, changedBy = null) {
  try {
    const orderRepository = await getOrderRepository()

    if (!orderId || typeof orderId !== 'number') {
      throw new BadRequestError('Invalid order ID: must be a number', { orderId })
    }

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      throw new BadRequestError(`Invalid status: must be one of ${VALID_STATUSES.join(', ')}`, {
        newStatus
      })
    }

    // Use atomic stored function (SSOT: DB_FUNCTIONS.updateOrderStatusWithHistory)
    const data = await orderRepository.updateStatusWithHistory(orderId, newStatus, notes, changedBy)

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
    const orderRepository = await getOrderRepository()

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

    // Use repository's update method
    const data = await orderRepository.update(id, sanitized)

    return data
  } catch (error) {
    console.error(`updateOrder(${id}) failed:`, error)
    throw error
  }
}
