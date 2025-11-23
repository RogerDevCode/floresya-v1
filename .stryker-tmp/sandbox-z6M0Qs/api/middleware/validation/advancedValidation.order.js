/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Advanced Validation - Order & Order Items Validation
 * LEGACY: Modularized from advancedValidation.js (Phase 6)
 */

import { BUSINESS_LIMITS } from './advancedValidation.helpers.js'
import { validateEmail } from './advancedValidation.email.js'
import {
  validateTextLength,
  validateAmount,
  validateVenezuelanAddress
} from './advancedValidation.amount.js'
import { validateVenezuelanPhone } from './advancedValidation.phone.js'
import { logger } from '../../utils/logger.js'

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
  logger.debug('🔍 VALIDATING ORDER DATA:', { orderData })
  const errors = []

  // Email validation
  logger.debug('📧 Validating email:', { email: orderData.customer_email })
  const emailError = validateEmail(orderData.customer_email)
  if (emailError) {
    logger.debug('❌ Email validation failed:', { error: emailError })
    errors.push(emailError)
  } else {
    logger.debug('✅ Email validation passed')
  }

  // Name validation
  logger.debug('👤 Validating name:', { name: orderData.customer_name })
  const nameError = validateTextLength(
    orderData.customer_name,
    'Nombre del cliente',
    2,
    BUSINESS_LIMITS.maxNameLength
  )
  if (nameError) {
    logger.debug('❌ Name validation failed:', { error: nameError })
    errors.push(nameError)
  } else {
    logger.debug('✅ Name validation passed')
  }

  // Phone validation
  logger.debug('📱 Validating phone:', { phone: orderData.customer_phone })
  const phoneError = validateVenezuelanPhone(orderData.customer_phone)
  if (phoneError) {
    logger.debug('❌ Phone validation failed:', { error: phoneError })
    errors.push(phoneError)
  } else {
    logger.debug('✅ Phone validation passed')
  }

  // Address validation
  logger.debug('🏠 Validating address:', { address: orderData.delivery_address })
  const addressError = validateVenezuelanAddress(orderData.delivery_address)
  if (addressError) {
    logger.debug('❌ Address validation failed:', { error: addressError })
    errors.push(addressError)
  } else {
    logger.debug('✅ Address validation passed')
  }

  // Amount validations
  logger.debug('💵 Validating USD amount:', { amount: orderData.total_amount_usd })
  const totalAmountError = validateAmount(orderData.total_amount_usd, 'Monto total')
  if (totalAmountError) {
    logger.debug('❌ USD amount validation failed:', { error: totalAmountError })
    errors.push(totalAmountError)
  } else {
    logger.debug('✅ USD amount validation passed')
  }

  // Validate VES amount separately (no max limit since exchange rate varies)
  if (orderData.total_amount_ves !== undefined && orderData.total_amount_ves !== null) {
    logger.debug('💰 Validating VES amount:', { amount: orderData.total_amount_ves })
    const vesValue =
      typeof orderData.total_amount_ves === 'string'
        ? parseFloat(orderData.total_amount_ves)
        : orderData.total_amount_ves

    if (isNaN(vesValue)) {
      logger.debug('❌ VES amount validation failed: not a number')
      errors.push('Monto total en bolívares debe ser un número válido')
    } else if (vesValue < 0) {
      logger.debug('❌ VES amount validation failed: negative')
      errors.push('Monto total en bolívares debe ser un número positivo')
    } else {
      logger.debug('✅ VES amount validation passed')
    }
    // No maximum limit for VES due to varying exchange rates
  }

  // Currency rate validation
  if (orderData.currency_rate) {
    logger.debug('💱 Validating currency rate:', { rate: orderData.currency_rate })
    if (typeof orderData.currency_rate !== 'number' || orderData.currency_rate <= 0) {
      logger.debug('❌ Currency rate validation failed')
      errors.push('Tasa de cambio debe ser un número positivo')
    } else {
      logger.debug('✅ Currency rate validation passed')
    }
  }

  // Notes validation (optional)
  if (orderData.notes) {
    logger.debug('📝 Validating notes:', { notes: orderData.notes })
    const notesError = validateTextLength(
      orderData.notes,
      'Notas del pedido',
      0,
      BUSINESS_LIMITS.maxNotesLength
    )
    if (notesError) {
      logger.debug('❌ Notes validation failed:', { error: notesError })
      errors.push(notesError)
    } else {
      logger.debug('✅ Notes validation passed')
    }
  }

  // Delivery notes validation (optional)
  if (orderData.delivery_notes) {
    logger.debug('📦 Validating delivery notes:', { notes: orderData.delivery_notes })
    const deliveryNotesError = validateTextLength(
      orderData.delivery_notes,
      'Notas de entrega',
      0,
      BUSINESS_LIMITS.maxNotesLength
    )
    if (deliveryNotesError) {
      logger.debug('❌ Delivery notes validation failed:', { error: deliveryNotesError })
      errors.push(deliveryNotesError)
    } else {
      logger.debug('✅ Delivery notes validation passed')
    }
  }

  logger.debug('🏁 ORDER VALIDATION COMPLETE. Errors:', { errors })
  return errors
}
