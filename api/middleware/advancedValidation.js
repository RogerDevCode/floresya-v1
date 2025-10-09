/**
 * Advanced Validation Middleware
 * Comprehensive input validation with detailed error messages
 * Handles edge cases and provides specific feedback
 */

import { ValidationError, BadRequestError } from '../errors/AppError.js'

// Venezuelan phone number regex patterns
const VENEZUELA_PHONE_PATTERNS = {
  mobile: /^(?:\+58|0)(?:412|414|416|424|426)\d{7}$/,
  landline: /^(?:\+58|0)212\d{7}$/,
  all: /^(?:\+58|0)(?:2\d{2}|4\d{2})\d{7}$/
}

// Email validation with common Venezuelan domains
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const VENEZUELA_EMAIL_DOMAINS = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'live.com'
]

// Venezuelan postal codes for Caracas area

// Business rules constants
const BUSINESS_LIMITS = {
  maxOrderAmount: 10000, // Maximum USD per order
  minOrderAmount: 1, // Minimum USD per order
  maxItemsPerOrder: 50, // Maximum items in one order
  maxQuantityPerItem: 100, // Maximum quantity per item
  maxNameLength: 255, // Maximum length for names
  maxAddressLength: 500, // Maximum length for addresses
  maxNotesLength: 1000 // Maximum length for notes
}

/**
 * Advanced email validation with Venezuelan domain support
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'Email es requerido'
  }

  if (email.length > 254) {
    return 'Email es demasiado largo (máximo 254 caracteres)'
  }

  if (!EMAIL_REGEX.test(email)) {
    return 'Formato de email inválido'
  }

  // Check for suspicious patterns
  const localPart = email.split('@')[0]
  if (localPart.length > 64) {
    return 'Parte local del email es demasiado larga'
  }

  // Warn about unusual but valid emails
  const domain = email.split('@')[1]?.toLowerCase()
  if (domain && !VENEZUELA_EMAIL_DOMAINS.some(valid => domain.includes(valid))) {
    console.warn(`Email con dominio no común: ${domain}`)
  }

  return null
}

/**
 * Advanced Venezuelan phone validation
 * Accepts multiple formats: 04141234567, (+58)-414-7166388, +584141234567, etc.
 */
export function validateVenezuelanPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return 'Teléfono es requerido'
  }

  // Remove all non-digits for validation
  const digitsOnly = phone.replace(/\D/g, '')

  // Check for minimum length (at least 10 digits)
  if (digitsOnly.length < 10) {
    return 'Teléfono debe tener al menos 10 dígitos'
  }

  // Check for maximum reasonable length
  if (digitsOnly.length > 13) {
    return 'Teléfono tiene demasiados dígitos'
  }

  // Normalize to local format for validation
  let normalizedPhone = digitsOnly

  // If starts with 58 (Venezuela country code), remove it and add 0
  if (normalizedPhone.startsWith('58') && normalizedPhone.length >= 12) {
    normalizedPhone = '0' + normalizedPhone.substring(2)
  }

  // Ensure it starts with 0 for local format
  if (!normalizedPhone.startsWith('0') && normalizedPhone.length === 10) {
    // Already 10 digits, might be missing leading 0
    normalizedPhone = '0' + normalizedPhone
  }

  // Take only first 11 digits if longer (Venezuelan numbers are 11 digits with 0)
  if (normalizedPhone.length > 11) {
    normalizedPhone = normalizedPhone.substring(0, 11)
  }

  // Validate against Venezuelan patterns (0412, 0414, 0416, 0424, 0426, or 0212 landlines)
  if (
    !VENEZUELA_PHONE_PATTERNS.mobile.test(normalizedPhone) &&
    !VENEZUELA_PHONE_PATTERNS.landline.test(normalizedPhone)
  ) {
    return 'Número de teléfono venezolano inválido. Debe comenzar con 0412, 0414, 0416, 0424, 0426 o 0212'
  }

  return null
}

/**
 * Advanced amount validation with business rules
 */
export function validateAmount(amount, fieldName = 'monto') {
  if (amount === null || amount === undefined) {
    return `${fieldName} es requerido`
  }

  const numValue = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numValue)) {
    return `${fieldName} debe ser un número válido`
  }

  if (numValue < BUSINESS_LIMITS.minOrderAmount) {
    return `${fieldName} debe ser al menos $${BUSINESS_LIMITS.minOrderAmount}`
  }

  if (numValue > BUSINESS_LIMITS.maxOrderAmount) {
    return `${fieldName} no puede exceder $${BUSINESS_LIMITS.maxOrderAmount}`
  }

  // Check for reasonable decimal places (max 2)
  if (numValue !== Math.round(numValue * 100) / 100) {
    return `${fieldName} no puede tener más de 2 decimales`
  }

  return null
}

/**
 * Advanced text length validation with specific limits
 */
export function validateTextLength(text, fieldName, minLength = 1, maxLength = 255) {
  if (!text || typeof text !== 'string') {
    return `${fieldName} es requerido`
  }

  if (text.length < minLength) {
    return `${fieldName} debe tener al menos ${minLength} caracteres`
  }

  if (text.length > maxLength) {
    return `${fieldName} no puede exceder ${maxLength} caracteres`
  }

  // Check for suspicious content
  if (text.trim().length === 0) {
    return `${fieldName} no puede estar vacío`
  }

  return null
}

/**
 * Advanced address validation for Venezuelan context
 */
export function validateVenezuelanAddress(address) {
  const error = validateTextLength(address, 'Dirección', 5, BUSINESS_LIMITS.maxAddressLength)
  if (error) {
    return error
  }

  // Basic validation - just ensure it's not empty or whitespace
  if (address.trim().length === 0) {
    return 'Dirección no puede estar vacía'
  }

  return null
}

/**
 * Advanced postal code validation for Caracas
 */

/**
 * Advanced order items validation
 */
export function validateOrderItems(items) {
  if (!Array.isArray(items)) {
    return 'Los items deben ser un array'
  }

  if (items.length === 0) {
    return 'El pedido debe incluir al menos un producto'
  }

  if (items.length > BUSINESS_LIMITS.maxItemsPerOrder) {
    return `No se permiten más de ${BUSINESS_LIMITS.maxItemsPerOrder} productos por pedido`
  }

  let totalAmount = 0

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    if (!item || typeof item !== 'object') {
      return `Item ${i + 1}: debe ser un objeto válido`
    }

    // Validate product_id
    if (!item.product_id || typeof item.product_id !== 'number' || item.product_id <= 0) {
      return `Item ${i + 1}: product_id debe ser un número positivo`
    }

    // Validate product_name
    const nameError = validateTextLength(
      item.product_name,
      `Item ${i + 1}: nombre del producto`,
      2,
      BUSINESS_LIMITS.maxNameLength
    )
    if (nameError) {
      return nameError
    }

    // Validate quantity
    if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
      return `Item ${i + 1}: cantidad debe ser un número positivo`
    }

    if (item.quantity > BUSINESS_LIMITS.maxQuantityPerItem) {
      return `Item ${i + 1}: cantidad no puede exceder ${BUSINESS_LIMITS.maxQuantityPerItem}`
    }

    // Validate unit_price_usd
    const priceError = validateAmount(item.unit_price_usd, `Item ${i + 1}: precio unitario`)
    if (priceError) {
      return priceError
    }

    // Validate subtotal calculation
    const expectedSubtotal = item.quantity * item.unit_price_usd
    const actualSubtotal = item.subtotal_usd || 0

    if (Math.abs(expectedSubtotal - actualSubtotal) > 0.01) {
      return `Item ${i + 1}: subtotal no coincide con cantidad × precio unitario`
    }

    totalAmount += expectedSubtotal
  }

  // Validate total amount
  if (totalAmount > BUSINESS_LIMITS.maxOrderAmount) {
    return `El monto total del pedido ($${totalAmount.toFixed(2)}) excede el límite permitido`
  }

  return null
}

/**
 * Comprehensive order validation
 */
export function validateOrderData(orderData) {
  console.log('🔍 VALIDATING ORDER DATA:', JSON.stringify(orderData, null, 2))
  const errors = []

  // Email validation
  console.log('📧 Validating email:', orderData.customer_email)
  const emailError = validateEmail(orderData.customer_email)
  if (emailError) {
    console.log('❌ Email validation failed:', emailError)
    errors.push(emailError)
  } else {
    console.log('✅ Email validation passed')
  }

  // Name validation
  console.log('👤 Validating name:', orderData.customer_name)
  const nameError = validateTextLength(
    orderData.customer_name,
    'Nombre del cliente',
    2,
    BUSINESS_LIMITS.maxNameLength
  )
  if (nameError) {
    console.log('❌ Name validation failed:', nameError)
    errors.push(nameError)
  } else {
    console.log('✅ Name validation passed')
  }

  // Phone validation
  console.log('📱 Validating phone:', orderData.customer_phone)
  const phoneError = validateVenezuelanPhone(orderData.customer_phone)
  if (phoneError) {
    console.log('❌ Phone validation failed:', phoneError)
    errors.push(phoneError)
  } else {
    console.log('✅ Phone validation passed')
  }

  // Address validation
  console.log('🏠 Validating address:', orderData.delivery_address)
  const addressError = validateVenezuelanAddress(orderData.delivery_address)
  if (addressError) {
    console.log('❌ Address validation failed:', addressError)
    errors.push(addressError)
  } else {
    console.log('✅ Address validation passed')
  }

  // Amount validations
  console.log('💵 Validating USD amount:', orderData.total_amount_usd)
  const totalAmountError = validateAmount(orderData.total_amount_usd, 'Monto total')
  if (totalAmountError) {
    console.log('❌ USD amount validation failed:', totalAmountError)
    errors.push(totalAmountError)
  } else {
    console.log('✅ USD amount validation passed')
  }

  // Validate VES amount separately (no max limit since exchange rate varies)
  if (orderData.total_amount_ves !== undefined && orderData.total_amount_ves !== null) {
    console.log('💰 Validating VES amount:', orderData.total_amount_ves)
    const vesValue =
      typeof orderData.total_amount_ves === 'string'
        ? parseFloat(orderData.total_amount_ves)
        : orderData.total_amount_ves

    if (isNaN(vesValue)) {
      console.log('❌ VES amount validation failed: not a number')
      errors.push('Monto total en bolívares debe ser un número válido')
    } else if (vesValue < 0) {
      console.log('❌ VES amount validation failed: negative')
      errors.push('Monto total en bolívares debe ser un número positivo')
    } else {
      console.log('✅ VES amount validation passed')
    }
    // No maximum limit for VES due to varying exchange rates
  }

  // Currency rate validation
  if (orderData.currency_rate) {
    console.log('💱 Validating currency rate:', orderData.currency_rate)
    if (typeof orderData.currency_rate !== 'number' || orderData.currency_rate <= 0) {
      console.log('❌ Currency rate validation failed')
      errors.push('Tasa de cambio debe ser un número positivo')
    } else {
      console.log('✅ Currency rate validation passed')
    }
  }

  // Notes validation (optional)
  if (orderData.notes) {
    console.log('📝 Validating notes:', orderData.notes)
    const notesError = validateTextLength(
      orderData.notes,
      'Notas del pedido',
      0,
      BUSINESS_LIMITS.maxNotesLength
    )
    if (notesError) {
      console.log('❌ Notes validation failed:', notesError)
      errors.push(notesError)
    } else {
      console.log('✅ Notes validation passed')
    }
  }

  // Delivery notes validation (optional)
  if (orderData.delivery_notes) {
    console.log('📦 Validating delivery notes:', orderData.delivery_notes)
    const deliveryNotesError = validateTextLength(
      orderData.delivery_notes,
      'Notas de entrega',
      0,
      BUSINESS_LIMITS.maxNotesLength
    )
    if (deliveryNotesError) {
      console.log('❌ Delivery notes validation failed:', deliveryNotesError)
      errors.push(deliveryNotesError)
    } else {
      console.log('✅ Delivery notes validation passed')
    }
  }

  console.log('🏁 ORDER VALIDATION COMPLETE. Errors:', errors)
  return errors
}

/**
 * Advanced validation middleware
 */
export function advancedValidate(schemaName) {
  return (req, res, next) => {
    try {
      const errors = []

      if (schemaName === 'order') {
        const orderErrors = validateOrderData(req.body.order || {})
        errors.push(...orderErrors)

        if (req.body.items) {
          const itemsError = validateOrderItems(req.body.items)
          if (itemsError) {
            errors.push(itemsError)
          }
        }
      } else if (schemaName === 'product') {
        // Product-specific validations
        if (req.body.price_usd !== undefined) {
          const priceError = validateAmount(req.body.price_usd, 'Precio en dólares')
          if (priceError) {
            errors.push(priceError)
          }
        }

        if (
          req.body.stock !== undefined &&
          (typeof req.body.stock !== 'number' || req.body.stock < 0)
        ) {
          errors.push('Stock debe ser un número no negativo')
        }
      } else {
        return next(new BadRequestError(`Esquema de validación desconocido: ${schemaName}`))
      }

      if (errors.length > 0) {
        return next(new ValidationError('Errores de validación', errors))
      }

      next()
    } catch (error) {
      console.error('Error in advanced validation:', error)
      next(new BadRequestError('Error interno de validación'))
    }
  }
}

/**
 * Validation helper for specific fields
 */
export const fieldValidators = {
  email: validateEmail,
  phone: validateVenezuelanPhone,
  amount: validateAmount,
  text: validateTextLength,
  address: validateVenezuelanAddress,
  orderItems: validateOrderItems,
  orderData: validateOrderData
}

/**
 * Get validation summary for debugging
 */
export function getValidationSummary(data, schemaName) {
  const summary = {
    schema: schemaName,
    timestamp: new Date().toISOString(),
    fields: {},
    errors: []
  }

  try {
    if (schemaName === 'order') {
      summary.errors = validateOrderData(data.order || {})
      if (data.items) {
        const itemsError = validateOrderItems(data.items)
        if (itemsError) {
          summary.errors.push(itemsError)
        }
      }
    }

    summary.valid = summary.errors.length === 0
    summary.errorCount = summary.errors.length

    return summary
  } catch {
    summary.errors.push('Error interno de validación')
    summary.valid = false
    return summary
  }
}
