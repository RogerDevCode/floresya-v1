/**
 * Data Sanitization Middleware
 * Converts null/undefined values based on PostgreSQL column types
 * Applied before validation to ensure data consistency
 */

// Database column type mappings for orders and order_items
const ORDERS_COLUMN_TYPES = {
  // String/varchar columns - convert null/undefined to empty string
  customer_email: 'string',
  customer_name: 'string',
  customer_phone: 'string',
  delivery_address: 'string',
  delivery_time_slot: 'string',
  delivery_notes: 'string',
  notes: 'string',
  admin_notes: 'string',

  // Date columns - convert null/undefined to current date
  delivery_date: 'date',

  // Integer columns - convert null/undefined to 0
  user_id: 'integer',
  id: 'integer',

  // Numeric/decimal columns - convert null/undefined to 0.00
  total_amount_usd: 'numeric',
  total_amount_ves: 'numeric',
  currency_rate: 'numeric',

  // Enum columns - use default values
  status: 'enum'
}

const ORDER_ITEMS_COLUMN_TYPES = {
  // String/varchar columns - convert null/undefined to empty string
  product_name: 'string',
  product_summary: 'string',

  // Integer columns - convert null/undefined to 0
  product_id: 'integer',
  quantity: 'integer',
  id: 'integer',
  order_id: 'integer',

  // Numeric/decimal columns - convert null/undefined to 0.00
  unit_price_usd: 'numeric',
  unit_price_ves: 'numeric',
  subtotal_usd: 'numeric',
  subtotal_ves: 'numeric',

  // Date columns - convert null/undefined to current date
  created_at: 'date',
  updated_at: 'date'
}

/**
 * Get current timestamp in ISO format
 */
function getCurrentTimestamp() {
  return new Date().toISOString()
}

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate() {
  return new Date().toISOString().split('T')[0]
}

/**
 * Sanitize a value based on its column type
 */
function sanitizeValue(value, columnType) {
  // Handle null/undefined values based on type
  if (value === null || value === undefined) {
    switch (columnType) {
      case 'string':
        return ''
      case 'integer':
        return 0
      case 'numeric':
        return 0.0
      case 'date':
        return getCurrentDate()
      case 'timestamp':
        return getCurrentTimestamp()
      case 'boolean':
        return false
      case 'enum':
        return 'pending' // Default order status
      default:
        return ''
    }
  }

  // Convert empty strings for required string fields
  if (columnType === 'string' && typeof value === 'string' && value.trim() === '') {
    return ''
  }

  // Convert string numbers to actual numbers for numeric fields
  if (columnType === 'numeric' && typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0.0 : parsed
  }

  if (columnType === 'integer' && typeof value === 'string') {
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? 0 : parsed
  }

  // Convert string booleans to actual booleans
  if (columnType === 'boolean' && typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }

  return value
}

/**
 * Sanitize order data
 */
export function sanitizeOrderData(orderData) {
  if (!orderData) {
    return {}
  }

  const sanitized = { ...orderData }

  // Apply sanitization for each field based on column type
  for (const [key, columnType] of Object.entries(ORDERS_COLUMN_TYPES)) {
    if (key in sanitized) {
      sanitized[key] = sanitizeValue(sanitized[key], columnType)
    }
  }

  return sanitized
}

/**
 * Sanitize order items array
 */
export function sanitizeOrderItems(items) {
  if (!Array.isArray(items)) {
    return []
  }

  return items.map(item => {
    if (!item || typeof item !== 'object') {
      return {}
    }

    const sanitized = { ...item }

    // Apply sanitization for each field based on column type
    for (const [key, columnType] of Object.entries(ORDER_ITEMS_COLUMN_TYPES)) {
      if (key in sanitized) {
        sanitized[key] = sanitizeValue(sanitized[key], columnType)
      }
    }

    return sanitized
  })
}

/**
 * Main sanitization middleware
 * Applied before validation to ensure consistent data types
 */
export function sanitizeRequestData(req, res, next) {
  try {
    // Sanitize order data if present
    if (req.body.order) {
      req.body.order = sanitizeOrderData(req.body.order)
    }

    // Sanitize order items if present
    if (req.body.items) {
      req.body.items = sanitizeOrderItems(req.body.items)
    }

    // Also sanitize at the top level for other endpoints
    if (req.body && typeof req.body === 'object') {
      // Apply general sanitization for common fields that might not be in order/items
      for (const [key, value] of Object.entries(req.body)) {
        // Skip order and items as they're already sanitized above
        if (key === 'order' || key === 'items') {
          continue
        }

        if (value === null || value === undefined) {
          // Determine type based on common patterns or default to string
          if (key.includes('amount') || key.includes('price') || key.includes('rate')) {
            req.body[key] = 0.0
          } else if (key.includes('quantity') || key.includes('count') || key.includes('id')) {
            req.body[key] = 0
          } else if (key.includes('date') || key.includes('time')) {
            req.body[key] = getCurrentDate()
          } else {
            req.body[key] = ''
          }
        }
      }
    }

    next()
  } catch (error) {
    console.error('Error in sanitization middleware:', error)
    next(error)
  }
}

/**
 * Helper function to check if a value needs sanitization
 */
export function needsSanitization(value, columnType) {
  if (value === null || value === undefined) {
    return true
  }

  if (columnType === 'string' && typeof value === 'string' && value.trim() === '') {
    return false // Empty strings are valid for optional string fields
  }

  return false
}

/**
 * Get sanitization info for debugging
 */
export function getSanitizationInfo(data, columnTypes) {
  const info = {}

  for (const [key, columnType] of Object.entries(columnTypes)) {
    if (key in data) {
      const originalValue = data[key]
      const sanitizedValue = sanitizeValue(originalValue, columnType)
      const wasSanitized = originalValue !== sanitizedValue

      info[key] = {
        original: originalValue,
        sanitized: sanitizedValue,
        type: columnType,
        wasSanitized
      }
    }
  }

  return info
}
