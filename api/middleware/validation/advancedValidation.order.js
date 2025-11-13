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
