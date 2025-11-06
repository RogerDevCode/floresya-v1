/**
 * Validator Service - Centralized Validation
 * Eliminates code duplication and ensures consistency
 * Follows KISS and DRY principles from CLAUDE.md
 */

import { ValidationError } from '../../errors/AppError.js'

/**
import { BadRequestError } from "../errors/AppError.js"
 * Centralized validation service
 * All validations in one place for maintainability
 */
export class ValidatorService {
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @param {string} fieldName - Field name for error messages
   * @returns {boolean} True if valid
   * @throws {ValidationError} If email is invalid
   */
  static validateEmail(email, fieldName = 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email) {
      throw new ValidationError(`${fieldName} is required`, {
        field: fieldName,
        received: email,
        rule: 'required'
      })
    }

    if (typeof email !== 'string') {
      throw new ValidationError(`${fieldName} must be a string`, {
        field: fieldName,
        received: typeof email,
        rule: 'string required'
      })
    }

    if (!emailRegex.test(email)) {
      throw new ValidationError(`${fieldName} format is invalid`, {
        field: fieldName,
        received: email,
        rule: 'valid email format required',
        example: 'user@example.com'
      })
    }

    return true
  }

  /**
   * Validate required field
   * @param {*} value - Value to check
   * @param {string} fieldName - Field name for error messages
   * @returns {boolean} True if valid
   * @throws {ValidationError} If value is empty
   */
  static validateRequired(value, fieldName = 'field') {
    if (value === null || value === undefined) {
      throw new ValidationError(`${fieldName} is required`, {
        field: fieldName,
        received: value,
        rule: 'required'
      })
    }

    if (typeof value === 'string' && value.trim() === '') {
      throw new ValidationError(`${fieldName} cannot be empty`, {
        field: fieldName,
        received: value,
        rule: 'non-empty string'
      })
    }

    if (Array.isArray(value) && value.length === 0) {
      throw new ValidationError(`${fieldName} cannot be empty`, {
        field: fieldName,
        received: value,
        rule: 'non-empty array'
      })
    }

    return true
  }

  /**
   * Validate minimum string length
   * @param {string} value - String to validate
   * @param {number} minLength - Minimum length
   * @param {string} fieldName - Field name for error messages
   * @returns {boolean} True if valid
   * @throws {ValidationError} If string is too short
   */
  static validateMinLength(value, minLength, fieldName = 'field') {
    if (typeof value !== 'string') {
      throw new ValidationError(`${fieldName} must be a string`, {
        field: fieldName,
        received: typeof value,
        rule: 'string required'
      })
    }

    if (value.length < minLength) {
      throw new ValidationError(`${fieldName} must be at least ${minLength} characters`, {
        field: fieldName,
        received: value.length,
        minimum: minLength,
        current: value
      })
    }

    return true
  }

  /**
   * Validate maximum string length
   * @param {string} value - String to validate
   * @param {number} maxLength - Maximum length
   * @param {string} fieldName - Field name for error messages
   * @returns {boolean} True if valid
   * @throws {ValidationError} If string is too long
   */
  static validateMaxLength(value, maxLength, fieldName = 'field') {
    if (typeof value !== 'string') {
      throw new ValidationError(`${fieldName} must be a string`, {
        field: fieldName,
        received: typeof value,
        rule: 'string required'
      })
    }

    if (value.length > maxLength) {
      throw new ValidationError(`${fieldName} must be at most ${maxLength} characters`, {
        field: fieldName,
        received: value.length,
        maximum: maxLength,
        current: value
      })
    }

    return true
  }

  /**
   * Validate numeric ID
   * @param {*} id - ID to validate
   * @param {string} fieldName - Field name for error messages
   * @returns {number} Validated ID
   * @throws {ValidationError} If ID is invalid
   */
  static validateId(id, fieldName = 'id') {
    if (id === null || id === undefined) {
      throw new ValidationError(`${fieldName} is required`, {
        field: fieldName,
        received: id,
        rule: 'required'
      })
    }

    const numericId = Number(id)

    if (isNaN(numericId)) {
      throw new ValidationError(`${fieldName} must be a number`, {
        field: fieldName,
        received: id,
        rule: 'numeric value required'
      })
    }

    if (numericId <= 0) {
      throw new ValidationError(`${fieldName} must be positive`, {
        field: fieldName,
        received: numericId,
        rule: 'positive number required'
      })
    }

    return numericId
  }

  /**
   * Validate boolean value
   * @param {*} value - Value to validate
   * @param {string} fieldName - Field name for error messages
   * @returns {boolean} Validated boolean
   * @throws {ValidationError} If value is not boolean
   */
  static validateBoolean(value, fieldName = 'field') {
    if (typeof value !== 'boolean') {
      throw new ValidationError(`${fieldName} must be a boolean`, {
        field: fieldName,
        received: typeof value,
        rule: 'boolean required'
      })
    }

    return value
  }

  /**
   * Validate phone number (Venezuelan format)
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid
   * @throws {ValidationError} If phone is invalid
   */
  static validatePhone(phone) {
    if (!phone) {
      return true // Phone is optional
    }

    if (typeof phone !== 'string') {
      throw new ValidationError('Phone must be a string', {
        field: 'phone',
        received: typeof phone,
        rule: 'string required'
      })
    }

    // Venezuelan phone validation
    const phoneRegex = /^(?:\+58|0058|58)?[0-9]{10}$/

    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      throw new ValidationError('Invalid Venezuelan phone number format', {
        field: 'phone',
        received: phone,
        rule: 'valid format required',
        examples: ['04141234567', '584141234567', '+584141234567']
      })
    }

    return true
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {boolean} True if valid
   * @throws {ValidationError} If password is too weak
   */
  static validatePassword(password) {
    if (!password) {
      throw new ValidationError('Password is required', {
        field: 'password',
        rule: 'required'
      })
    }

    if (typeof password !== 'string') {
      throw new ValidationError('Password must be a string', {
        field: 'password',
        rule: 'string required'
      })
    }

    // Minimum 8 characters, at least 1 letter and 1 number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/

    if (!passwordRegex.test(password)) {
      throw new ValidationError(
        'Password must be at least 8 characters with at least 1 letter and 1 number',
        {
          field: 'password',
          rule: 'minimum 8 characters, 1 letter, 1 number required'
        }
      )
    }

    return true
  }

  /**
   * Validate price value
   * @param {number} price - Price to validate
   * @returns {boolean} True if valid
   * @throws {ValidationError} If price is invalid
   */
  static validatePrice(price) {
    if (price === null || price === undefined) {
      return true // Price is optional
    }

    const numericPrice = Number(price)

    if (isNaN(numericPrice)) {
      throw new ValidationError('Price must be a number', {
        field: 'price',
        received: price,
        rule: 'numeric value required'
      })
    }

    if (numericPrice < 0) {
      throw new ValidationError('Price cannot be negative', {
        field: 'price',
        received: numericPrice,
        rule: 'non-negative value required'
      })
    }

    if (numericPrice > 999999.99) {
      throw new ValidationError('Price is too high', {
        field: 'price',
        received: numericPrice,
        rule: 'maximum value: 999999.99'
      })
    }

    return true
  }

  /**
   * Validate enum value
   * @param {*} value - Value to validate
   * @param {Array} validValues - Array of valid values
   * @param {string} fieldName - Field name for error messages
   * @returns {boolean} True if valid
   * @throws {ValidationError} If value is not in valid values
   */
  static validateEnum(value, validValues, fieldName = 'field') {
    if (!validValues || !Array.isArray(validValues)) {
      throw new BadRequestError('Valid values array is required')
    }

    if (!validValues.includes(value)) {
      throw new ValidationError(`${fieldName} must be one of: ${validValues.join(', ')}`, {
        field: fieldName,
        received: value,
        validValues
      })
    }

    return true
  }

  /**
   * Validate object has required properties
   * @param {Object} obj - Object to validate
   * @param {Array} requiredProperties - Array of required property names
   * @param {string} objectName - Object name for error messages
   * @returns {boolean} True if valid
   * @throws {ValidationError} If required properties are missing
   */
  static validateRequiredProperties(obj, requiredProperties, objectName = 'object') {
    this.validateRequired(obj, objectName)

    const missing = requiredProperties.filter(prop => {
      return obj[prop] === undefined || obj[prop] === null
    })

    if (missing.length > 0) {
      throw new ValidationError(
        `${objectName} is missing required properties: ${missing.join(', ')}`,
        {
          object: objectName,
          missing,
          received: Object.keys(obj)
        }
      )
    }

    return true
  }

  /**
   * Validate array is not empty
   * @param {Array} arr - Array to validate
   * @param {string} fieldName - Field name for error messages
   * @returns {boolean} True if valid
   * @throws {ValidationError} If array is empty
   */
  static validateArrayNotEmpty(arr, fieldName = 'array') {
    if (!Array.isArray(arr)) {
      throw new ValidationError(`${fieldName} must be an array`, {
        field: fieldName,
        received: typeof arr,
        rule: 'array required'
      })
    }

    if (arr.length === 0) {
      throw new ValidationError(`${fieldName} cannot be empty`, {
        field: fieldName,
        rule: 'non-empty array required'
      })
    }

    return true
  }

  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid
   * @throws {ValidationError} If URL is invalid
   */
  static validateUrl(url) {
    if (!url) {
      return true // URL is optional
    }

    try {
      new URL(url)
      return true
    } catch (_error) {
      throw new ValidationError('Invalid URL format', {
        field: 'url',
        received: url,
        rule: 'valid URL format required',
        example: 'https://example.com'
      })
    }
  }

  /**
   * Validate date format
   * @param {string|Date} date - Date to validate
   * @param {string} fieldName - Field name for error messages
   * @returns {boolean} True if valid
   * @throws {ValidationError} If date is invalid
   */
  static validateDate(date, fieldName = 'date') {
    if (!date) {
      return true // Date is optional
    }

    const dateObj = new Date(date)

    if (isNaN(dateObj.getTime())) {
      throw new ValidationError(`${fieldName} must be a valid date`, {
        field: fieldName,
        received: date,
        rule: 'valid date required'
      })
    }

    return true
  }

  /**
   * Validate pagination parameters
   * @param {Object} params - Pagination parameters
   * @returns {Object} Validated and normalized parameters
   * @throws {ValidationError} If parameters are invalid
   */
  static validatePagination(params = {}) {
    const { limit, offset } = params

    if (limit !== undefined) {
      const numericLimit = Number(limit)
      if (isNaN(numericLimit) || numericLimit < 0 || numericLimit > 100) {
        throw new ValidationError('Limit must be a number between 0 and 100', {
          field: 'limit',
          received: limit,
          rule: '0 <= limit <= 100'
        })
      }
      params.limit = numericLimit
    }

    if (offset !== undefined) {
      const numericOffset = Number(offset)
      if (isNaN(numericOffset) || numericOffset < 0) {
        throw new ValidationError('Offset must be a positive number', {
          field: 'offset',
          received: offset,
          rule: 'offset >= 0'
        })
      }
      params.offset = numericOffset
    }

    return params
  }

  /**
   * Sanitize string (remove dangerous characters)
   * @param {string} str - String to sanitize
   * @returns {string} Sanitized string
   */
  static sanitizeString(str) {
    if (typeof str !== 'string') {
      return str
    }

    return str.trim().replace(/[<>'"]/g, '')
  }
}

export default ValidatorService
