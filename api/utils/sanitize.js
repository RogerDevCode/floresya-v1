/**
 * Procesado por B
 */

/**
 * Data Sanitization Utilities
 * Ensures data integrity before database operations
 * Converts null/undefined/NaN values to appropriate defaults based on field type
 */

/**
 * Sanitize data based on field type definitions
 * @param {Object} data - Data object to sanitize
 * @param {Object} fieldTypes - Field type definitions { fieldName: 'string'|'number'|'boolean' }
 * @returns {Object} Sanitized data object
 */
export function sanitizeData(data, fieldTypes) {
  if (!data || typeof data !== 'object') {
    return data
  }

  const sanitized = { ...data }

  for (const [field, value] of Object.entries(sanitized)) {
    // Skip if field type not defined
    const expectedType = fieldTypes[field]
    if (!expectedType) {
      continue
    }

    // Handle null, undefined, NaN
    if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
      switch (expectedType) {
        case 'string':
          sanitized[field] = ''
          break
        case 'number':
        case 'integer':
          sanitized[field] = 0
          break
        case 'boolean':
          sanitized[field] = false
          break
        default:
          // For other types, keep as null if the database supports it
          sanitized[field] = null
      }
    }
  }

  return sanitized
}

/**
 * Common field type definitions for database tables
 */
export const FIELD_TYPES = {
  // Products table
  products: {
    name: 'string',
    summary: 'string',
    description: 'string',
    price_usd: 'number',
    price_ves: 'number',
    stock: 'number',
    sku: 'string',
    active: 'boolean',
    featured: 'boolean',
    carousel_order: 'number'
  },

  // Users table
  users: {
    email: 'string',
    password_hash: 'string',
    full_name: 'string',
    phone: 'string',
    role: 'string',
    active: 'boolean',
    email_verified: 'boolean'
  },

  // Orders table
  orders: {
    user_id: 'number',
    customer_email: 'string',
    customer_name: 'string',
    customer_phone: 'string',
    delivery_address: 'string',
    delivery_date: 'string',
    delivery_time_slot: 'string',
    delivery_notes: 'string',
    total_amount_usd: 'number',
    total_amount_ves: 'number',
    currency_rate: 'number',
    status: 'string',
    notes: 'string',
    admin_notes: 'string'
  },

  // Order items table
  order_items: {
    order_id: 'number',
    product_id: 'number',
    product_name: 'string',
    product_summary: 'string',
    unit_price_usd: 'number',
    unit_price_ves: 'number',
    quantity: 'number',
    subtotal_usd: 'number',
    subtotal_ves: 'number'
  },

  // Product images table
  product_images: {
    product_id: 'number',
    url: 'string',
    image_index: 'number',
    size: 'string',
    is_primary: 'boolean',
    file_hash: 'string',
    mime_type: 'string'
  },

  // Occasions table
  occasions: {
    name: 'string',
    description: 'string',
    slug: 'string',
    active: 'boolean',
    display_order: 'number'
  },

  // Settings table
  settings: {
    key: 'string',
    value: 'string',
    description: 'string',
    type: 'string',
    is_public: 'boolean'
  },

  // Payment methods table
  payment_methods: {
    name: 'string',
    type: 'string',
    description: 'string',
    account_info: 'string',
    active: 'boolean',
    display_order: 'number'
  },

  // Payments table
  payments: {
    order_id: 'number',
    payment_method_id: 'number',
    user_id: 'number',
    amount_usd: 'number',
    amount_ves: 'number',
    currency_rate: 'number',
    status: 'string',
    payment_method_name: 'string',
    transaction_id: 'string',
    reference_number: 'string',
    payment_details: 'string',
    receipt_image_url: 'string',
    admin_notes: 'string',
    payment_date: 'string'
  }
}

/**
 * Sanitize product data before database operations
 * @param {Object} productData - Product data to sanitize
 * @returns {Object} Sanitized product data
 */
export function sanitizeProductData(productData) {
  return sanitizeData(productData, FIELD_TYPES.products)
}

/**
 * Sanitize user data before database operations
 * @param {Object} userData - User data to sanitize
 * @returns {Object} Sanitized user data
 */
export function sanitizeUserData(userData) {
  return sanitizeData(userData, FIELD_TYPES.users)
}

/**
 * Sanitize order data before database operations
 * @param {Object} orderData - Order data to sanitize
 * @returns {Object} Sanitized order data
 */
export function sanitizeOrderData(orderData) {
  return sanitizeData(orderData, FIELD_TYPES.orders)
}

/**
 * Sanitize order item data before database operations
 * @param {Object} itemData - Order item data to sanitize
 * @returns {Object} Sanitized order item data
 */
export function sanitizeOrderItemData(itemData) {
  return sanitizeData(itemData, FIELD_TYPES.order_items)
}

/**
 * Validate and sanitize numeric fields
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {number} Sanitized number or 0
 */
export function sanitizeNumber(value, options = {}) {
  const { min = 0, max = Number.MAX_SAFE_INTEGER, defaultValue = 0 } = options

  if (value === null || value === undefined || isNaN(value)) {
    return defaultValue
  }

  const num = Number(value)

  if (isNaN(num)) {
    return defaultValue
  }

  // Apply min/max constraints
  if (num < min) {
    return min
  }
  if (num > max) {
    return max
  }

  return num
}

/**
 * Validate and sanitize string fields
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {string} Sanitized string or empty string
 */
export function sanitizeString(value, options = {}) {
  const { maxLength = 255, defaultValue = '' } = options

  if (value === null || value === undefined) {
    return defaultValue
  }

  const str = String(value)

  // Apply max length constraint
  if (str.length > maxLength) {
    return str.substring(0, maxLength)
  }

  return str
}

/**
 * Validate and sanitize boolean fields
 * @param {any} value - Value to validate
 * @param {boolean} defaultValue - Default value if invalid
 * @returns {boolean} Sanitized boolean
 */
export function sanitizeBoolean(value, defaultValue = false) {
  if (value === null || value === undefined) {
    return defaultValue
  }

  // Handle string representations
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }

  return Boolean(value)
}
