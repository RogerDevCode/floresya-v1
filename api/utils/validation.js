/**
 * Centralized Validation - LEGACY COMPATIBILITY LAYER
 *
 * This file provides backward compatibility while using ValidatorService internally.
 * All validation functions are redirected to ValidatorService for consistency.
 *
 * MIGRATION PATH:
 * 1. Use this file as drop-in replacement for utils/validation.js
 * 2. Gradually migrate imports to use ValidatorService directly
 * 3. Remove this file once migration is complete
 */

import ValidatorService from '../services/validation/ValidatorService.js'

// Re-export all ValidatorService methods for backward compatibility
export const validateEmail = ValidatorService.validateEmail.bind(ValidatorService)
export const validateRequired = ValidatorService.validateRequired.bind(ValidatorService)
export const validateMinLength = ValidatorService.validateMinLength.bind(ValidatorService)
export const validateMaxLength = ValidatorService.validateMaxLength.bind(ValidatorService)
export const validateId = ValidatorService.validateId.bind(ValidatorService)
export const validateBoolean = ValidatorService.validateBoolean.bind(ValidatorService)
export const validatePhone = ValidatorService.validatePhone.bind(ValidatorService)
export const validatePassword = ValidatorService.validatePassword.bind(ValidatorService)
export const validatePrice = ValidatorService.validatePrice.bind(ValidatorService)
export const validateEnum = ValidatorService.validateEnum.bind(ValidatorService)
export const validateRequiredProperties =
  ValidatorService.validateRequiredProperties.bind(ValidatorService)
export const validateArrayNotEmpty = ValidatorService.validateArrayNotEmpty.bind(ValidatorService)
export const validateUrl = ValidatorService.validateUrl.bind(ValidatorService)
export const validateDate = ValidatorService.validateDate.bind(ValidatorService)
export const validatePagination = ValidatorService.validatePagination.bind(ValidatorService)
export const sanitizeString = ValidatorService.sanitizeString.bind(ValidatorService)

// Import advanced validations for re-export
import { validateVenezuelanPhone } from '../middleware/validation/advancedValidation.phone.js'
export { validateVenezuelanPhone }

// Additional validation stubs for missing functions
export function validatePaymentMethod(method) {
  if (!method || typeof method !== 'object') {
    throw new Error('Payment method is required')
  }
  ValidatorService.validateRequired(method.type, 'payment method type')
  ValidatorService.validateEnum(
    method.type,
    ['cash', 'card', 'transfer', 'mobile_payment'],
    'payment method type'
  )
  return true
}

export function validateCategory(category) {
  ValidatorService.validateRequired(category, 'category')
  ValidatorService.validateMinLength(category.name, 2, 'category name')
  ValidatorService.validateMaxLength(category.name, 100, 'category name')
  return true
}

// Legacy compatibility functions (maintaining original API)
export function validateString(
  value,
  field = 'field',
  options = { required: false, allowEmpty: false, minLength: 0, maxLength: 255 }
) {
  return ValidatorService.validateStringLegacy(value, field, options)
}

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

  // Skip further validation if not required and empty
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

  // Range checks
  if (options.min !== undefined && value < options.min) {
    errors[field] = `must be at least ${options.min}`
  }

  if (options.max !== undefined && value > options.max) {
    errors[field] = `must not exceed ${options.max}`
  }

  if (options.positive && value <= 0) {
    errors[field] = 'must be positive'
  }

  if (options.nonNegative && value < 0) {
    errors[field] = 'must be non-negative'
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(`${field} validation failed`, errors)
  }
}

// Entity-specific validators (using ValidatorService internally)
export function validateProduct(product) {
  ValidatorService.validateRequired(product, 'product')
  ValidatorService.validateMinLength(product.name, 1, 'name')
  ValidatorService.validateMaxLength(product.name, 255, 'name')
  ValidatorService.validatePrice(product.price_usd)
  ValidatorService.validateEnum(product.active, [true, false], 'active')

  return true
}

export function validateOrder(order) {
  ValidatorService.validateRequired(order, 'order')
  ValidatorService.validateId(order.customer_id, 'customer')
  ValidatorService.validateRequiredProperties(order, ['customer_email', 'total_amount'], 'order')
  ValidatorService.validatePrice(order.total_amount)

  return true
}

export function validateUser(user) {
  ValidatorService.validateRequired(user, 'user')
  ValidatorService.validateEmail(user.email)
  ValidatorService.validateMinLength(user.name, 2, 'name')
  ValidatorService.validateMaxLength(user.name, 100, 'name')

  return true
}

export function validateOccasion(occasion) {
  ValidatorService.validateRequired(occasion, 'occasion')
  ValidatorService.validateMinLength(occasion.name, 2, 'name')
  ValidatorService.validateMaxLength(occasion.name, 100, 'name')
  ValidatorService.validateEnum(occasion.active, [true, false], 'active')

  return true
}

export function validateSetting(setting) {
  ValidatorService.validateRequired(setting, 'setting')
  ValidatorService.validateRequired(setting.key, 'key')
  ValidatorService.validateRequired(setting.value, 'value')
  ValidatorService.validateRequired(setting.type, 'type')

  return true
}

// Product Image validation
export function validateProductImage(data, isUpdate = false) {
  // Required fields for creation
  if (!isUpdate) {
    ValidatorService.validateRequired(data, 'product image')
    ValidatorService.validateId(data.product_id, 'product_id')
    ValidatorService.validateRequired(data.image_index, 'image_index')
    ValidatorService.validateRequired(data.size, 'size')
    ValidatorService.validateRequired(data.url, 'url')
    ValidatorService.validateRequired(data.file_hash, 'file_hash')

    // Additional validations
    ValidatorService.validateMinLength(data.size, 1, 'size')
    ValidatorService.validateMaxLength(data.size, 50, 'size')
    ValidatorService.validateMinLength(data.url, 1, 'url')
    ValidatorService.validateMaxLength(data.url, 1000, 'url')
    ValidatorService.validateMinLength(data.file_hash, 1, 'file_hash')
    ValidatorService.validateMaxLength(data.file_hash, 255, 'file_hash')
  }

  // Optional/update fields
  if (data.image_index !== undefined) {
    ValidatorService.validateRequired(data.image_index, 'image_index')
  }

  if (data.size !== undefined) {
    ValidatorService.validateMinLength(data.size, 1, 'size')
    ValidatorService.validateMaxLength(data.size, 50, 'size')
  }

  if (data.url !== undefined) {
    ValidatorService.validateMinLength(data.url, 1, 'url')
    ValidatorService.validateMaxLength(data.url, 1000, 'url')
  }

  if (data.file_hash !== undefined) {
    ValidatorService.validateMinLength(data.file_hash, 1, 'file_hash')
    ValidatorService.validateMaxLength(data.file_hash, 255, 'file_hash')
  }

  if (data.mime_type !== undefined) {
    ValidatorService.validateMaxLength(data.mime_type, 100, 'mime_type')
  }

  if (data.is_primary !== undefined) {
    ValidatorService.validateEnum(data.is_primary, [true, false], 'is_primary')
  }
}

// Export ValidatorService class for direct usage
export { ValidatorService }
export default ValidatorService
