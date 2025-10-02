/**
 * Validation Schemas
 * Based on OpenAPI 3.1 specifications in api/docs/openapi-annotations.js
 * SSOT for request validation - must match OpenAPI contract exactly
 */

// ==================== PRODUCTS ====================

export const productCreateSchema = {
  // Required fields (from OpenAPI line 168)
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 255
  },
  price_usd: {
    type: 'number',
    required: true,
    min: 0
  },
  // Optional fields (from OpenAPI lines 171-177)
  description: {
    type: 'string',
    required: false
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
    min: 0
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
  featured: {
    type: 'boolean',
    required: false
  },
  sku: {
    type: 'string',
    required: false
  },
  search: {
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
  // Required fields
  user_id: {
    type: 'number',
    required: true,
    integer: true,
    min: 1
  },
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
        if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
          return `items[${i}].quantity must be a positive number`
        }
        if (!item.price_usd || typeof item.price_usd !== 'number' || item.price_usd < 0) {
          return `items[${i}].price_usd must be a non-negative number`
        }
      }
      return null
    }
  },
  // Optional fields
  delivery_address: {
    type: 'string',
    required: false
  },
  delivery_date: {
    type: 'string',
    required: false,
    pattern: /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD
  },
  notes: {
    type: 'string',
    required: false
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
    pattern: /^[A-Z_]+$/ // UPPERCASE_SNAKE_CASE
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
