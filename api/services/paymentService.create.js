/**
 * Payment Service - Create Operations
 * Handles payment creation and confirmation
 * LEGACY: Modularizado desde paymentService.js (PHASE 5)
 */

import { getPaymentRepository, ValidationError } from './paymentService.helpers.js'

/**
 * Confirm payment for an order (marks as paid)
 * @param {number} orderId - Order ID to confirm payment for
 * @param {Object} paymentData - Payment confirmation data
 * @returns {Object} - Updated payment record
 * @throws {BadRequestError} If orderId or paymentData is invalid
 * @throws {NotFoundError} If payment is not found
 * @throws {ValidationError} If payment data is invalid
 * @throws {DatabaseError} If database update fails
 */
export async function confirmPayment(orderId, paymentData) {
  try {
    if (!orderId || typeof orderId !== 'number') {
      throw new BadRequestError('Invalid order ID: must be a number', { orderId })
    }

    if (!paymentData || typeof paymentData !== 'object') {
      throw new BadRequestError('Payment data is required', { orderId })
    }

    const paymentRepository = getPaymentRepository()

    // Validate payment method
    if (!paymentData.payment_method_id) {
      throw new ValidationError('Payment method ID is required', { paymentData })
    }

    // Validate reference if provided
    if (paymentData.reference && typeof paymentData.reference !== 'string') {
      throw new ValidationError('Payment reference must be a string', { paymentData })
    }

    // Prepare update data
    const updateData = {
      status: 'confirmed',
      payment_method_id: paymentData.payment_method_id,
      reference: paymentData.reference || null,
      confirmed_at: new Date().toISOString()
    }

    // Use repository to confirm payment
    const data = await paymentRepository.confirmPayment(orderId, updateData)

    return data
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error(`confirmPayment(${orderId}) failed:`, error)
    throw error
  }
}
