/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Validation Schemas - Payments
 * Based on OpenAPI 3.1 specifications in api/docs/openapi-annotations.js
 * LEGACY: Modularized from schemas.js (Phase 6)
 */

export const paymentCreateSchema = {
  order_id: {
    type: 'number',
    required: true,
    integer: true,
    min: 1
  },
  amount_usd: {
    type: 'number',
    required: true,
    min: 0
  },
  amount_ves: {
    type: 'number',
    required: false,
    min: 0
  },
  payment_method_id: {
    type: 'number',
    required: true,
    integer: true,
    min: 1
  },
  reference_number: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  notes: {
    type: 'string',
    required: false
  }
}

export const paymentStatusUpdateSchema = {
  status: {
    type: 'string',
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded']
  },
  notes: {
    type: 'string',
    required: false
  }
}

export const paymentConfirmSchema = {
  payment_method: {
    type: 'string',
    required: true,
    enum: ['cash', 'mobile_payment', 'bank_transfer', 'zelle', 'crypto']
  },
  reference_number: {
    type: 'string',
    required: true,
    minLength: 3,
    maxLength: 100
  },
  payment_details: {
    type: 'object',
    required: false
  },
  receipt_image_url: {
    type: 'string',
    required: false,
    pattern: /^https?:\/\/.+/
  }
}
