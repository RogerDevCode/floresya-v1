/**
 * Advanced Validation - Middleware & Utilities
 * LEGACY: Modularized from advancedValidation.js (Phase 6)
 */

import { BadRequestError, ValidationError } from '../../errors/AppError.js'
import { validateOrderData, validateOrderItems } from './advancedValidation.order.js'
import {
  validateAmount,
  validateTextLength,
  validateVenezuelanAddress
} from './advancedValidation.amount.js'
import { validateEmail } from './advancedValidation.email.js'
import { validateVenezuelanPhone } from './advancedValidation.phone.js'

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
  } catch (error) {
    console.error(error)
    summary.errors.push('Error interno de validación')
    summary.valid = false
    return summary
  }
}
