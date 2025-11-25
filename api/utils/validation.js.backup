/**
 * Procesado por B
 */

/**
 * Centralized Validation Utilities
 * Consolidates all validation logic across services
 * Ensures consistent validation behavior and eliminates code duplication
 *
 * Provides:
 * - Generic validators (ID, email, string, number, etc.)
 * - Entity-specific validators (Product, Order, User, Occasion, Setting)
 * - Validation helpers and utilities
 * - Consistent error reporting pattern
 *
 * Usage:
 *   import { validateId, validateProduct, validateOrder } from '../utils/validation.js'
 */

import { ValidationError, BadRequestError } from '../errors/AppError.js'

// ============================================================================
// GENERIC VALIDATORS
// ============================================================================

/**
 * Validate a positive integer ID
 * @param {number} id - ID to validate
 * @param {string} entity - Entity name for error message
 * @param {string} operation - Operation name for error context
 * @throws {BadRequestError} When ID is invalid
 */
export function validateId(id, entity = 'Entity', operation = 'operation') {
  if (!id || typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
    throw new BadRequestError(`Invalid ${entity} ID: must be a positive integer`, {
      [`${entity.toLowerCase()}Id`]: id,
      operation,
      rule: 'positive integer required'
    })
  }
}

/**
 * Validate an email address
 * @param {string} email - Email to validate
 * @param {string} field - Field name for error messages
 * @throws {ValidationError} When email is invalid
 */
export function validateEmail(email, field = 'email') {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new ValidationError(`${field} validation failed`, {
      [field]: 'must be a valid email address'
    })
  }
}

/**
 * Validate a string field
 * @param {any} value - Value to validate
 * @param {string} field - Field name for error messages
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether field is required
 * @param {number} options.minLength - Minimum length
 * @param {number} options.maxLength - Maximum length
 * @param {boolean} options.allowEmpty - Whether to allow empty strings
 * @throws {ValidationError} When validation fails
 */
export function validateString(
  value,
  field = 'field',
  options = { required: false, allowEmpty: false, minLength: 0, maxLength: 255 }
) {
  const errors = {}

  // Required check
  if (options.required && (value === undefined || value === null)) {
    errors[field] = 'is required'
    throw new ValidationError(`${field} validation failed`, errors)
  }

  // Skip further validation if not required and empty
  if (!options.required && (value === undefined || value === null)) {
    return
  }

  // Type check
  if (typeof value !== 'string') {
    errors[field] = 'must be a string'
    throw new ValidationError(`${field} validation failed`, errors)
  }

  // Empty check
  if (!options.allowEmpty && value.trim() === '') {
    errors[field] = 'cannot be empty'
    throw new ValidationError(`${field} validation failed`, errors)
  }

  // Length checks
  if (options.minLength !== undefined && value.length < options.minLength) {
    errors[field] = `must be at least ${options.minLength} characters`
  }

  if (options.maxLength !== undefined && value.length > options.maxLength) {
    errors[field] = `must not exceed ${options.maxLength} characters`
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(`${field} validation failed`, errors)
  }
}

/**
 * Validate a number field
 * @param {any} value - Value to validate
 * @param {string} field - Field name for error messages
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether field is required
 * @param {boolean} options.integer - Whether must be an integer
 * @param {number} options.min - Minimum value (inclusive)
 * @param {number} options.max - Maximum value (inclusive)
 * @param {boolean} options.positive - Whether must be positive (> 0)
 * @param {boolean} options.nonNegative - Whether must be non-negative (>= 0)
 * @throws {ValidationError} When validation fails
 */
export function validateNumber(
  value,
  field = 'field',
  options = {
    required: false,
    integer: false,
    min: undefined,
    max: undefined,
    positive: false,
    nonNegative: false
  }
) {
  const errors = {}

  // Required check
  if (options.required && (value === undefined || value === null)) {
    errors[field] = 'is required'
    throw new ValidationError(`${field} validation failed`, errors)
  }

  // Skip further validation if not required and null
  if (!options.required && (value === undefined || value === null)) {
    return
  }

  // Type check
  if (typeof value !== 'number' || isNaN(value)) {
    errors[field] = 'must be a number'
    throw new ValidationError(`${field} validation failed`, errors)
  }

  // Integer check
  if (options.integer && !Number.isInteger(value)) {
    errors[field] = 'must be an integer'
  }

  // Positive check
  if (options.positive && value <= 0) {
    errors[field] = 'must be positive (> 0)'
  }

  // Non-negative check
  if (options.nonNegative && value < 0) {
    errors[field] = 'must be non-negative (>= 0)'
  }

  // Min check
  if (options.min !== undefined && value < options.min) {
    errors[field] = `must be at least ${options.min}`
  }

  // Max check
  if (options.max !== undefined && value > options.max) {
    errors[field] = `must not exceed ${options.max}`
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(`${field} validation failed`, errors)
  }
}

/**
 * Validate an enum value
 * @param {any} value - Value to validate
 * @param {Array} validValues - Array of valid values
 * @param {string} field - Field name for error messages
 * @throws {ValidationError} When value is not in valid values
 */
export function validateEnum(value, validValues, field = 'field') {
  if (!validValues.includes(value)) {
    throw new ValidationError(`${field} validation failed`, {
      [field]: `must be one of: ${validValues.join(', ')}`
    })
  }
}

/**
 * Validate an array
 * @param {any} value - Value to validate
 * @param {string} field - Field name for error messages
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether field is required
 * @param {number} options.minLength - Minimum array length
 * @param {number} options.maxLength - Maximum array length
 * @param {string} options.itemType - Expected item type for validation
 * @throws {ValidationError} When validation fails
 */
export function validateArray(
  value,
  field = 'field',
  options = { required: false, minLength: 0, maxLength: undefined, itemType: undefined }
) {
  const errors = {}

  // Required check
  if (options.required && (value === undefined || value === null)) {
    errors[field] = 'is required'
    throw new ValidationError(`${field} validation failed`, errors)
  }

  // Skip further validation if not required and empty
  if (!options.required && (value === undefined || value === null)) {
    return
  }

  // Type check
  if (!Array.isArray(value)) {
    errors[field] = 'must be an array'
    throw new ValidationError(`${field} validation failed`, errors)
  }

  // Length checks
  if (options.minLength !== undefined && value.length < options.minLength) {
    errors[field] = `must have at least ${options.minLength} items`
  }

  if (options.maxLength !== undefined && value.length > options.maxLength) {
    errors[field] = `must have at most ${options.maxLength} items`
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(`${field} validation failed`, errors)
  }
}

/**
 * Validate a boolean field
 * @param {any} value - Value to validate
 * @param {string} field - Field name for error messages
 * @param {Object} options - Validation options
 * @param {boolean} options.required - Whether field is required
 * @throws {ValidationError} When validation fails
 */
export function validateBoolean(value, field = 'field', options = { required: false }) {
  // Required check
  if (options.required && value === undefined) {
    throw new ValidationError(`${field} validation failed`, {
      [field]: 'is required'
    })
  }

  // Skip if not required and undefined
  if (!options.required && value === undefined) {
    return
  }

  // Type check
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${field} validation failed`, {
      [field]: 'must be a boolean'
    })
  }
}

// ============================================================================
// ENTITY-SPECIFIC VALIDATORS
// ============================================================================

/**
 * Validate Product data
 * @param {Object} data - Product data to validate
 * @param {boolean} isUpdate - Whether this is for an update operation (default: false)
 * @throws {ValidationError} With detailed field-level validation errors
 * @example
 * // For creation
 * validateProduct({
 *   name: 'Rosas Rojas',
 *   price_usd: 25.99,
 *   stock: 10
 * }, false)
 */
export function validateProduct(data, isUpdate = false) {
  // Required fields for creation
  if (!isUpdate) {
    validateString(data.name, 'name', {
      required: true,
      allowEmpty: false,
      minLength: 1,
      maxLength: 255
    })

    validateNumber(data.price_usd, 'price_usd', {
      required: true,
      positive: true
    })
  }

  // Optional/update fields
  if (data.name !== undefined) {
    validateString(data.name, 'name', {
      required: false,
      allowEmpty: false,
      minLength: 1,
      maxLength: 255
    })
  }

  if (data.price_usd !== undefined) {
    validateNumber(data.price_usd, 'price_usd', {
      required: false,
      positive: true
    })
  }

  if (data.price_ves !== undefined && data.price_ves !== null) {
    validateNumber(data.price_ves, 'price_ves', {
      required: false,
      nonNegative: true
    })
  }

  if (data.stock !== undefined) {
    validateNumber(data.stock, 'stock', {
      required: false,
      integer: true,
      nonNegative: true
    })
  }

  if (data.sku !== undefined && data.sku !== null) {
    validateString(data.sku, 'sku', {
      required: false,
      allowEmpty: false,
      maxLength: 100
    })
  }

  if (data.summary !== undefined && data.summary !== null) {
    validateString(data.summary, 'summary', {
      required: false,
      allowEmpty: true,
      maxLength: 500
    })
  }

  if (data.description !== undefined && data.description !== null) {
    validateString(data.description, 'description', {
      required: false,
      allowEmpty: true,
      maxLength: 2000
    })
  }

  if (data.featured !== undefined) {
    validateBoolean(data.featured, 'featured', { required: false })
  }

  if (data.active !== undefined) {
    validateBoolean(data.active, 'active', { required: false })
  }

  if (data.carousel_order !== undefined && data.carousel_order !== null) {
    validateNumber(data.carousel_order, 'carousel_order', {
      required: false,
      integer: true,
      positive: true
    })
  }
}

/**
 * Validate Order data
 * @param {Object} data - Order data to validate
 * @param {Array} validStatuses - Array of valid order statuses
 * @param {boolean} isUpdate - Whether this is for an update operation (default: false)
 * @throws {ValidationError} With detailed field-level validation errors
 * @example
 * // For creation
 * validateOrder({
 *   customer_email: 'customer@example.com',
 *   customer_name: 'Juan Pérez',
 *   delivery_address: 'Calle 123',
 *   total_amount_usd: 45.99
 * }, ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled'], false)
 */
export function validateOrder(data, validStatuses, isUpdate = false) {
  // Required fields for creation
  if (!isUpdate) {
    validateEmail(data.customer_email, 'customer_email')
    validateString(data.customer_name, 'customer_name', {
      required: true,
      allowEmpty: false,
      minLength: 1,
      maxLength: 255
    })
    validateString(data.delivery_address, 'delivery_address', {
      required: true,
      allowEmpty: false,
      minLength: 1,
      maxLength: 500
    })
  }

  // Optional/update fields
  if (data.customer_email !== undefined) {
    validateEmail(data.customer_email, 'customer_email')
  }

  if (data.customer_name !== undefined) {
    validateString(data.customer_name, 'customer_name', {
      required: false,
      allowEmpty: false,
      minLength: 1,
      maxLength: 255
    })
  }

  if (data.delivery_address !== undefined) {
    validateString(data.delivery_address, 'delivery_address', {
      required: false,
      allowEmpty: false,
      minLength: 1,
      maxLength: 500
    })
  }

  if (data.customer_phone !== undefined) {
    validateString(data.customer_phone, 'customer_phone', {
      required: false,
      allowEmpty: true,
      maxLength: 50
    })
  }

  if (data.delivery_date !== undefined) {
    validateString(data.delivery_date, 'delivery_date', {
      required: false,
      allowEmpty: true,
      maxLength: 20
    })
  }

  if (data.delivery_time_slot !== undefined) {
    validateString(data.delivery_time_slot, 'delivery_time_slot', {
      required: false,
      allowEmpty: true,
      maxLength: 50
    })
  }

  if (data.delivery_notes !== undefined) {
    validateString(data.delivery_notes, 'delivery_notes', {
      required: false,
      allowEmpty: true,
      maxLength: 1000
    })
  }

  // Total amount validation
  const totalAmountUsd = data.total_amount_usd
  if (!isUpdate || totalAmountUsd !== undefined) {
    // Convert string to number if needed
    const amount = typeof totalAmountUsd === 'string' ? parseFloat(totalAmountUsd) : totalAmountUsd

    validateNumber(amount, 'total_amount_usd', {
      required: !isUpdate,
      positive: true
    })
  }

  // Status validation
  if (data.status !== undefined && validStatuses) {
    validateEnum(data.status, validStatuses, 'status')
  }

  if (data.notes !== undefined) {
    validateString(data.notes, 'notes', {
      required: false,
      allowEmpty: true,
      maxLength: 1000
    })
  }

  if (data.admin_notes !== undefined) {
    validateString(data.admin_notes, 'admin_notes', {
      required: false,
      allowEmpty: true,
      maxLength: 1000
    })
  }
}

/**
 * Validate User data
 * @param {Object} data - User data to validate
 * @param {Array} validRoles - Array of valid user roles
 * @param {boolean} isUpdate - Whether this is for an update operation (default: false)
 * @throws {ValidationError} With detailed field-level validation errors
 */
export function validateUser(data, validRoles, isUpdate = false) {
  // Required fields for creation
  if (!isUpdate) {
    validateEmail(data.email, 'email')
  }

  // Optional/update fields
  if (data.email !== undefined) {
    validateEmail(data.email, 'email')
  }

  if (data.full_name !== undefined) {
    validateString(data.full_name, 'full_name', {
      required: false,
      allowEmpty: false,
      minLength: 1,
      maxLength: 255
    })
  }

  if (data.phone !== undefined && data.phone !== null) {
    validateString(data.phone, 'phone', {
      required: false,
      allowEmpty: true,
      maxLength: 50
    })
  }

  if (data.role !== undefined && validRoles) {
    validateEnum(data.role, validRoles, 'role')
  }

  if (data.email_verified !== undefined) {
    validateBoolean(data.email_verified, 'email_verified', { required: false })
  }

  if (data.active !== undefined) {
    validateBoolean(data.active, 'active', { required: false })
  }
}

/**
 * Validate Occasion data
 * @param {Object} data - Occasion data to validate
 * @param {boolean} isUpdate - Whether this is for an update operation (default: false)
 * @throws {ValidationError} With detailed field-level validation errors
 */
export function validateOccasion(data, isUpdate = false) {
  // Required fields for creation
  if (!isUpdate) {
    validateString(data.name, 'name', {
      required: true,
      allowEmpty: false,
      minLength: 1,
      maxLength: 255
    })

    validateString(data.slug, 'slug', {
      required: true,
      allowEmpty: false,
      minLength: 1,
      maxLength: 255
    })
  }

  // Optional/update fields
  if (data.name !== undefined) {
    validateString(data.name, 'name', {
      required: false,
      allowEmpty: false,
      minLength: 1,
      maxLength: 255
    })
  }

  if (data.slug !== undefined) {
    validateString(data.slug, 'slug', {
      required: false,
      allowEmpty: false,
      minLength: 1,
      maxLength: 255
    })
  }

  if (data.description !== undefined) {
    validateString(data.description, 'description', {
      required: false,
      allowEmpty: true,
      maxLength: 1000
    })
  }

  if (data.display_order !== undefined) {
    validateNumber(data.display_order, 'display_order', {
      required: false,
      integer: true,
      nonNegative: true
    })
  }

  if (data.active !== undefined) {
    validateBoolean(data.active, 'active', { required: false })
  }
}

/**
 * Validate Setting data
 * @param {Object} data - Setting data to validate
 * @param {boolean} isUpdate - Whether this is for an update operation (default: false)
 * @throws {ValidationError} With detailed field-level validation errors
 */
export function validateSetting(data, isUpdate = false) {
  // Required fields for creation
  if (!isUpdate) {
    validateString(data.key, 'key', {
      required: true,
      allowEmpty: false,
      minLength: 1,
      maxLength: 255
    })
  }

  // Optional/update fields
  if (data.key !== undefined) {
    validateString(data.key, 'key', {
      required: false,
      allowEmpty: false,
      minLength: 1,
      maxLength: 255
    })
  }

  if (data.value !== undefined) {
    validateString(data.value, 'value', {
      required: false,
      allowEmpty: true,
      maxLength: 5000
    })
  }

  if (data.description !== undefined) {
    validateString(data.description, 'description', {
      required: false,
      allowEmpty: true,
      maxLength: 1000
    })
  }

  if (data.type !== undefined) {
    const validTypes = ['string', 'number', 'boolean', 'json']
    if (!validTypes.includes(data.type)) {
      throw new ValidationError('type validation failed', {
        type: `must be one of: ${validTypes.join(', ')}`
      })
    }
  }

  if (data.is_public !== undefined) {
    validateBoolean(data.is_public, 'is_public', { required: false })
  }

  if (data.active !== undefined) {
    validateBoolean(data.active, 'active', { required: false })
  }
}

/**
 * Validate Payment Method data
 * @param {Object} data - Payment method data to validate
 * @param {boolean} isUpdate - Whether this is for an update operation (default: false)
 * @throws {ValidationError} With detailed field-level validation errors
 */
export function validatePaymentMethod(data, isUpdate = false) {
  // Required fields for creation
  if (!isUpdate) {
    validateString(data.name, 'name', {
      required: true,
      allowEmpty: false,
      minLength: 1,
      maxLength: 255
    })
  }

  // Optional/update fields
  if (data.name !== undefined) {
    validateString(data.name, 'name', {
      required: false,
      allowEmpty: false,
      minLength: 1,
      maxLength: 255
    })
  }

  if (data.description !== undefined) {
    validateString(data.description, 'description', {
      required: false,
      allowEmpty: true,
      maxLength: 1000
    })
  }

  if (data.instructions !== undefined) {
    validateString(data.instructions, 'instructions', {
      required: false,
      allowEmpty: true,
      maxLength: 2000
    })
  }

  if (data.display_order !== undefined) {
    validateNumber(data.display_order, 'display_order', {
      required: false,
      integer: true,
      nonNegative: true
    })
  }

  if (data.active !== undefined) {
    validateBoolean(data.active, 'active', { required: false })
  }
}

/**
 * Validate Order Item data
 * @param {Object} data - Order item data to validate
 * @param {boolean} isUpdate - Whether this is for an update operation (default: false)
 * @throws {ValidationError} With detailed field-level validation errors
 */
export function validateOrderItem(data, isUpdate = false) {
  // Required fields for creation
  if (!isUpdate) {
    validateNumber(data.product_id, 'product_id', {
      required: true,
      positive: true,
      integer: true
    })

    validateString(data.product_name, 'product_name', {
      required: true,
      allowEmpty: false,
      minLength: 1,
      maxLength: 255
    })

    validateNumber(data.quantity, 'quantity', {
      required: true,
      positive: true,
      integer: true
    })

    validateNumber(data.unit_price_usd, 'unit_price_usd', {
      required: true,
      positive: true
    })
  }

  // Optional/update fields
  if (data.product_id !== undefined) {
    validateNumber(data.product_id, 'product_id', {
      required: false,
      positive: true,
      integer: true
    })
  }

  if (data.quantity !== undefined) {
    validateNumber(data.quantity, 'quantity', {
      required: false,
      positive: true,
      integer: true
    })
  }

  if (data.unit_price_usd !== undefined) {
    validateNumber(data.unit_price_usd, 'unit_price_usd', {
      required: false,
      positive: true
    })
  }

  if (data.unit_price_ves !== undefined && data.unit_price_ves !== null) {
    validateNumber(data.unit_price_ves, 'unit_price_ves', {
      required: false,
      positive: true
    })
  }
}

/**
 * Validate Product Image data
 * @param {Object} data - Product image data to validate
 * @param {boolean} isUpdate - Whether this is for an update operation (default: false)
 * @throws {ValidationError} With detailed field-level validation errors
 */
export function validateProductImage(data, isUpdate = false) {
  // Required fields for creation
  if (!isUpdate) {
    validateNumber(data.product_id, 'product_id', {
      required: true,
      positive: true,
      integer: true
    })

    validateNumber(data.image_index, 'image_index', {
      required: true,
      positive: true,
      integer: true
    })

    validateString(data.size, 'size', {
      required: true,
      allowEmpty: false,
      minLength: 1,
      maxLength: 50
    })

    validateString(data.url, 'url', {
      required: true,
      allowEmpty: false,
      minLength: 1,
      maxLength: 1000
    })

    validateString(data.file_hash, 'file_hash', {
      required: true,
      allowEmpty: false,
      minLength: 1,
      maxLength: 255
    })
  }

  // Optional/update fields
  if (data.image_index !== undefined) {
    validateNumber(data.image_index, 'image_index', {
      required: false,
      positive: true,
      integer: true
    })
  }

  if (data.size !== undefined) {
    validateString(data.size, 'size', {
      required: false,
      allowEmpty: false,
      minLength: 1,
      maxLength: 50
    })
  }

  if (data.url !== undefined) {
    validateString(data.url, 'url', {
      required: false,
      allowEmpty: false,
      minLength: 1,
      maxLength: 1000
    })
  }

  if (data.file_hash !== undefined) {
    validateString(data.file_hash, 'file_hash', {
      required: false,
      allowEmpty: false,
      minLength: 1,
      maxLength: 255
    })
  }

  if (data.mime_type !== undefined) {
    validateString(data.mime_type, 'mime_type', {
      required: false,
      allowEmpty: true,
      maxLength: 100
    })
  }

  if (data.is_primary !== undefined) {
    validateBoolean(data.is_primary, 'is_primary', { required: false })
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate pagination parameters
 * @param {Object} params - Query parameters
 * @throws {ValidationError} When parameters are invalid
 */
export function validatePaginationParams(params = {}) {
  const errors = {}

  if (params.limit !== undefined) {
    const limit = Number(params.limit)
    if (isNaN(limit) || limit <= 0 || limit > 100) {
      errors.limit = 'must be a positive number <= 100'
    }
  }

  if (params.offset !== undefined) {
    const offset = Number(params.offset)
    if (isNaN(offset) || offset < 0) {
      errors.offset = 'must be a non-negative number'
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Pagination parameters validation failed', errors)
  }
}

/**
 * Validate activity filter parameter
 * @param {boolean} includeDeactivated - Include deactivated records flag
 * @throws {BadRequestError} When parameter is invalid
 */
export function validateActivityFilter(includeDeactivated) {
  if (includeDeactivated !== undefined && typeof includeDeactivated !== 'boolean') {
    throw new BadRequestError('includeDeactivated must be a boolean', {
      includeDeactivated,
      rule: 'boolean (true/false) required'
    })
  }
}

/**
 * Validate Venezuelan phone number format
 * @param {string} phone - Phone number to validate
 * @throws {ValidationError} When phone format is invalid
 * @example
 * validateVenezuelanPhone('04141234567') // Valid
 * validateVenezuelanPhone('584141234567') // Valid with country code
 */
export function validateVenezuelanPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    throw new ValidationError('phone validation failed', {
      phone: 'must be a string'
    })
  }

  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, '')

  // Venezuelan phone pattern:
  // - Starts with 0 (national) or 58 (country code)
  // - Followed by 414, 416, 424, 412, 212, etc.
  // - Total length should be 10 (national) or 12 (with country code)
  const venezuelanPhoneRegex = /^(\+58|0)?[124568]\d{9}$/

  if (!venezuelanPhoneRegex.test(cleanPhone)) {
    throw new ValidationError('phone validation failed', {
      phone: 'must be a valid Venezuelan phone number (e.g., 04141234567 or +584141234567)'
    })
  }
}

/**
 * Get payment method display name in Spanish
 * @param {string} method - Payment method code
 * @returns {string} - Localized display name
 * @example
 * getPaymentMethodDisplayName('cash') // Returns: 'Efectivo'
 * getPaymentMethodDisplayName('transfer') // Returns: 'Transferencia Bancaria'
 */
export function getPaymentMethodDisplayName(method) {
  if (!method || typeof method !== 'string') {
    throw new ValidationError('payment method validation failed', {
      method: 'must be a non-empty string'
    })
  }

  const displayNames = {
    // Cash payments
    cash: 'Efectivo',
    cash_delivery: 'Efectivo contra entrega',
    cash_store: 'Efectivo en tienda',

    // Bank transfers
    transfer: 'Transferencia Bancaria',
    bank_transfer: 'Transferencia Bancaria',
    payment_app: 'Aplicación de Pago',
    zelle: 'Zelle',
    binance_pay: 'Binance Pay',
    paypal: 'PayPal',
    cryptocurrencies: 'Criptomonedas',

    // Cards
    card: 'Tarjeta',
    credit_card: 'Tarjeta de Crédito',
    debit_card: 'Tarjeta de Débito'
  }

  const displayName = displayNames[method.toLowerCase()]

  if (!displayName) {
    throw new ValidationError('payment method validation failed', {
      method: `unknown payment method: ${method}`
    })
  }

  return displayName
}
