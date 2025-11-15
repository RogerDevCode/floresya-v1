/**
 * Procesado por B
 */

/**
 * Validation Schemas - Orders
 * Based on OpenAPI 3.1 specifications in api/docs/openapi-annotations.js
 * LEGACY: Modularized from schemas.js (Phase 6)
 */

export const orderCreateSchema = {
  // Order object (required)
  order: {
    type: 'object',
    required: true,
    custom: (value, _data) => {
      if (!value || typeof value !== 'object') {
        return 'order must be an object'
      }
      if (!value.customer_email || typeof value.customer_email !== 'string') {
        return 'order.customer_email is required and must be a string'
      }
      if (!value.customer_name || typeof value.customer_name !== 'string') {
        return 'order.customer_name is required and must be a string'
      }
      if (!value.customer_phone || typeof value.customer_phone !== 'string') {
        return 'order.customer_phone is required and must be a string'
      }
      if (!value.delivery_address || typeof value.delivery_address !== 'string') {
        return 'order.delivery_address is required and must be a string'
      }
      if (!value.total_amount_usd || typeof value.total_amount_usd !== 'number') {
        return 'order.total_amount_usd is required and must be a number'
      }
      return null
    }
  },
  // Items array (required)
  items: {
    type: 'array',
    required: true,
    minLength: 1,
    custom: (value, _data) => {
      if (!Array.isArray(value)) {
        return 'items must be an array'
      }
      for (let i = 0; i < value.length; i++) {
        const item = value[i]
        if (!item.product_id || typeof item.product_id !== 'number') {
          return `items[${i}].product_id is required and must be a number`
        }
        if (!item.product_name || typeof item.product_name !== 'string') {
          return `items[${i}].product_name is required and must be a string`
        }
        if (!item.unit_price_usd || typeof item.unit_price_usd !== 'number') {
          return `items[${i}].unit_price_usd is required and must be a number`
        }
        if (!item.quantity || typeof item.quantity !== 'number') {
          return `items[${i}].quantity is required and must be a number`
        }
      }
      return null
    }
  },
  // Optional top-level fields that mirror order object for backward compatibility
  customer_email: {
    type: 'string',
    required: false,
    email: true
  },
  customer_name: {
    type: 'string',
    required: false,
    minLength: 2,
    maxLength: 255
  },
  customer_phone: {
    type: 'string',
    required: false,
    pattern: /^\+?[\d\s-()]+$/
  },
  delivery_address: {
    type: 'string',
    required: false,
    minLength: 10,
    maxLength: 500
  },
  delivery_date: {
    type: 'string',
    required: false,
    pattern: /^\d{4}-\d{2}-\d{2}$/
  },
  delivery_time_slot: {
    type: 'string',
    required: false,
    pattern: /^\d{2}:\d{2}-\d{2}:\d{2}$/
  },
  delivery_notes: {
    type: 'string',
    required: false,
    maxLength: 1000
  },
  total_amount_usd: {
    type: 'number',
    required: false,
    min: 0,
    custom: (value, _data) => {
      if (value !== undefined && value !== null && (typeof value !== 'number' || isNaN(value))) {
        return 'total_amount_usd must be a valid number'
      }
      return null
    }
  },
  total_amount_ves: {
    type: 'number',
    required: false,
    min: 0
  },
  currency_rate: {
    type: 'number',
    required: false,
    min: 0
  },
  status: {
    type: 'string',
    required: false,
    enum: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled']
  },
  notes: {
    type: 'string',
    required: false,
    maxLength: 1000
  }
}

export const orderStatusUpdateSchema = {
  status: {
    type: 'string',
    required: true,
    enum: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled']
  },
  notes: {
    type: 'string',
    required: false
  }
}
