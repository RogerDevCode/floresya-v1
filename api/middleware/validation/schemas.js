/**
 * Validation Schemas
 * Based on OpenAPI 3.1 specifications in api/docs/openapi-annotations.js
 * SSOT for request validation - must match OpenAPI contract exactly
 */

// ==================== PRODUCTS ====================

export const productCreateSchema = {
  // Product object (required)
  product: {
    type: 'object',
    required: true,
    custom: (value, _data) => {
      if (!value || typeof value !== 'object') {
        return 'product must be an object'
      }
      if (!value.name || typeof value.name !== 'string') {
        return 'product.name is required and must be a string'
      }
      if (!value.price_usd || typeof value.price_usd !== 'number') {
        return 'product.price_usd is required and must be a number'
      }
      return null
    }
  },
  // Optional top-level fields that mirror product object for backward compatibility
  name: {
    type: 'string',
    required: false,
    minLength: 2,
    maxLength: 255
  },
  summary: {
    type: 'string',
    required: false
  },
  description: {
    type: 'string',
    required: false
  },
  price_usd: {
    type: 'number',
    required: false,
    min: 0
  },
  price_ves: {
    type: 'number',
    required: false,
    min: 0
  },
  stock: {
    type: 'number',
    required: false,
    integer: true,
    min: 0
  },
  sku: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  featured: {
    type: 'boolean',
    required: false
  },
  carousel_order: {
    type: 'number',
    required: false,
    integer: true,
    min: 0,
    max: 7
  }
}

export const productUpdateSchema = {
  // All fields optional for update (from OpenAPI line 234)
  name: {
    type: 'string',
    required: false,
    minLength: 2,
    maxLength: 255
  },
  summary: {
    type: 'string',
    required: false
  },
  description: {
    type: 'string',
    required: false
  },
  price_usd: {
    type: 'number',
    required: false,
    min: 0,
    custom: (value, _data) => {
      if (value !== undefined && value !== null && (typeof value !== 'number' || isNaN(value))) {
        return 'price_usd must be a valid number'
      }
      return null
    }
  },
  price_ves: {
    type: 'number',
    required: false,
    min: 0
  },
  stock: {
    type: 'number',
    required: false,
    integer: true,
    min: 0
  },
  sku: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  active: {
    type: 'boolean',
    required: false
  },
  featured: {
    type: 'boolean',
    required: false
  },
  carousel_order: {
    type: 'number',
    required: false,
    integer: true,
    min: 0
  }
}

export const productFilterSchema = {
  // Query params (from OpenAPI lines 15-32)
  limit: {
    type: 'number',
    required: false,
    integer: true,
    min: 1,
    max: 100
  },
  offset: {
    type: 'number',
    required: false,
    integer: true,
    min: 0
  },
  search: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 255
  },
  featured: {
    type: 'boolean',
    required: false
  },
  sku: {
    type: 'string',
    required: false
  },
  sortBy: {
    type: 'string',
    required: false,
    enum: ['name', 'price_usd', 'created_at', 'carousel_order']
  }
}

// ==================== ORDERS ====================

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

// ==================== USERS ====================

export const userCreateSchema = {
  // Required (from OpenAPI line 705)
  email: {
    type: 'string',
    required: true,
    email: true
  },
  // Optional (from OpenAPI lines 706-708)
  full_name: {
    type: 'string',
    required: false,
    minLength: 2,
    maxLength: 255
  },
  phone: {
    type: 'string',
    required: false,
    pattern: /^\+?[\d\s-()]+$/
  },
  password_hash: {
    type: 'string',
    required: false
  }
}

export const userUpdateSchema = {
  // All optional (from OpenAPI lines 732-735)
  full_name: {
    type: 'string',
    required: false,
    minLength: 2,
    maxLength: 255
  },
  phone: {
    type: 'string',
    required: false,
    pattern: /^\+?[\d\s-()]+$/
  },
  role: {
    type: 'string',
    required: false,
    enum: ['user', 'admin']
  }
}

// ==================== OCCASIONS ====================

export const occasionCreateSchema = {
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100
  },
  description: {
    type: 'string',
    required: false
  },
  slug: {
    type: 'string',
    required: false,
    pattern: /^[a-z0-9-]+$/
  },
  display_order: {
    type: 'number',
    required: false,
    integer: true,
    min: 0
  }
}

export const occasionUpdateSchema = {
  name: {
    type: 'string',
    required: false,
    minLength: 2,
    maxLength: 100
  },
  description: {
    type: 'string',
    required: false
  },
  slug: {
    type: 'string',
    required: false,
    pattern: /^[a-z0-9-]+$/
  },
  is_active: {
    type: 'boolean',
    required: false
  },
  display_order: {
    type: 'number',
    required: false,
    integer: true,
    min: 0
  }
}

// ==================== SETTINGS ====================

export const settingCreateSchema = {
  key: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-z0-9_]+$/ // lowercase_snake_case (matches DB and OpenAPI)
  },
  value: {
    type: 'string',
    required: true
  },
  description: {
    type: 'string',
    required: false
  },
  is_public: {
    type: 'boolean',
    required: false
  }
}

export const settingUpdateSchema = {
  value: {
    type: 'string',
    required: false
  },
  description: {
    type: 'string',
    required: false
  },
  is_public: {
    type: 'boolean',
    required: false
  }
}

// ==================== PAYMENTS ====================

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

// ==================== PRODUCT IMAGES ====================

export const productImageCreateSchema = {
  product_id: {
    type: 'number',
    required: true,
    integer: true,
    min: 1
  },
  image_index: {
    type: 'number',
    required: true,
    integer: true,
    min: 1
  },
  size: {
    type: 'string',
    required: true,
    enum: ['thumb', 'small', 'medium', 'large']
  },
  url: {
    type: 'string',
    required: true,
    pattern: /^https?:\/\/.+/
  },
  file_hash: {
    type: 'string',
    required: true,
    minLength: 10
  },
  mime_type: {
    type: 'string',
    required: false,
    pattern: /^image\/(jpeg|jpg|png|webp|gif)$/
  },
  is_primary: {
    type: 'boolean',
    required: false
  }
}

export const productImageFilterSchema = {
  size: {
    type: 'string',
    required: false,
    enum: ['thumb', 'small', 'medium', 'large']
  },
  is_primary: {
    type: 'boolean',
    required: false
  }
}
