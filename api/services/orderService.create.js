/**
 * Procesado por B
 */

/**
 * Order Service - Create Operations
 * Handles order creation with items and atomic stored functions
 * LEGACY: Modularizado desde orderService.js (WEEK 3)
 */

import {
  getProductRepository,
  VALID_STATUSES,
  ValidationError,
  NotFoundError,
  DatabaseError,
  InternalServerError
} from './orderService.helpers.js'
import { supabase } from './supabaseClient.js'
import { sanitizeOrderData, sanitizeOrderItemData } from '../utils/sanitize.js'
import { validateOrder } from '../utils/validation.js'

/**
 * Create order with items (uses atomic stored function)
 * Validates all items, checks stock, and creates order atomically
 * @param {Object} orderData - Order data
 * @param {Array} orderItems - Array of order items
 * @returns {Object} - Created order
 * @throws {ValidationError} When order or items are invalid
 * @throws {NotFoundError} When product is not found
 * @throws {DatabaseError} When database operation fails
 */
export async function createOrderWithItems(orderData, orderItems) {
  try {
    validateOrder(orderData, VALID_STATUSES, false)

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      throw new ValidationError('Order validation failed', {
        orderItems: 'must be a non-empty array'
      })
    }

    // Validate each item and check stock
    for (const item of orderItems) {
      // Convert string IDs to numbers if needed
      let productId = item.product_id
      if (typeof productId === 'string') {
        productId = parseInt(productId, 10)
      }

      if (!productId || typeof productId !== 'number' || isNaN(productId)) {
        throw new ValidationError('Order validation failed', {
          'orderItems.product_id': 'must be a number'
        })
      }
      if (!item.product_name || typeof item.product_name !== 'string') {
        throw new ValidationError('Order validation failed', {
          'orderItems.product_name': 'must be a string'
        })
      }

      // Convert string quantities to numbers if needed
      let quantity = item.quantity
      if (typeof quantity === 'string') {
        quantity = parseInt(quantity, 10)
      }

      if (!quantity || typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
        throw new ValidationError('Order validation failed', {
          'orderItems.quantity': 'must be positive'
        })
      }

      // Convert string prices to numbers if needed
      let unitPriceUsd = item.unit_price_usd
      if (typeof unitPriceUsd === 'string') {
        unitPriceUsd = parseFloat(unitPriceUsd)
      }

      if (
        !unitPriceUsd ||
        typeof unitPriceUsd !== 'number' ||
        isNaN(unitPriceUsd) ||
        unitPriceUsd <= 0
      ) {
        throw new ValidationError('Order validation failed', {
          'orderItems.unit_price_usd': 'must be positive'
        })
      }

      // Validate stock availability using ProductRepository
      const productRepository = getProductRepository()
      const product = await productRepository.findById(item.product_id, true)

      if (!product) {
        throw new NotFoundError('Product', item.product_id, { productId: item.product_id })
      }

      if (!product.active) {
        throw new ValidationError('Product is not active', {
          productId: item.product_id,
          productName: product.name
        })
      }

      if (product.stock < item.quantity) {
        throw new ValidationError('Insufficient stock', {
          productId: item.product_id,
          productName: product.name,
          requested: item.quantity,
          available: product.stock
        })
      }
    }

    // Sanitize order data before database operations
    const sanitizedOrderData = sanitizeOrderData(orderData, false)

    // Convert string amounts to numbers if needed for the order payload
    let totalAmountVes = sanitizedOrderData.total_amount_ves
    if (typeof totalAmountVes === 'string') {
      totalAmountVes = parseFloat(totalAmountVes)
    }

    let currencyRate = sanitizedOrderData.currency_rate
    if (typeof currencyRate === 'string') {
      currencyRate = parseFloat(currencyRate)
    }

    const orderPayload = {
      user_id: sanitizedOrderData.user_id !== undefined ? sanitizedOrderData.user_id : null,
      customer_email: sanitizedOrderData.customer_email,
      customer_name: sanitizedOrderData.customer_name,
      customer_phone:
        sanitizedOrderData.customer_phone !== undefined ? sanitizedOrderData.customer_phone : null,
      delivery_address: sanitizedOrderData.delivery_address,
      delivery_date:
        sanitizedOrderData.delivery_date !== undefined ? sanitizedOrderData.delivery_date : null,
      delivery_time_slot:
        sanitizedOrderData.delivery_time_slot !== undefined
          ? sanitizedOrderData.delivery_time_slot
          : null,
      delivery_notes:
        sanitizedOrderData.delivery_notes !== undefined ? sanitizedOrderData.delivery_notes : null,
      status: sanitizedOrderData.status !== undefined ? sanitizedOrderData.status : 'pending',
      total_amount_usd:
        typeof sanitizedOrderData.total_amount_usd === 'string'
          ? parseFloat(sanitizedOrderData.total_amount_usd)
          : sanitizedOrderData.total_amount_usd,
      total_amount_ves:
        totalAmountVes !== null && totalAmountVes !== undefined ? Math.round(totalAmountVes) : null,
      currency_rate: currencyRate !== undefined ? currencyRate : null,
      notes: sanitizedOrderData.notes !== undefined ? sanitizedOrderData.notes : null,
      admin_notes:
        sanitizedOrderData.admin_notes !== undefined ? sanitizedOrderData.admin_notes : null
    }

    const itemsPayload = orderItems.map(item => {
      // Sanitize item data before database operations
      const sanitizedItem = sanitizeOrderItemData(item)

      // Ensure numeric values are properly converted
      const productId =
        typeof sanitizedItem.product_id === 'string'
          ? parseInt(sanitizedItem.product_id, 10)
          : sanitizedItem.product_id
      const unitPriceUsd =
        typeof sanitizedItem.unit_price_usd === 'string'
          ? parseFloat(sanitizedItem.unit_price_usd)
          : sanitizedItem.unit_price_usd
      const unitPriceVes =
        typeof sanitizedItem.unit_price_ves === 'string'
          ? parseFloat(sanitizedItem.unit_price_ves)
          : sanitizedItem.unit_price_ves
      const quantity =
        typeof sanitizedItem.quantity === 'string'
          ? parseInt(sanitizedItem.quantity, 10)
          : sanitizedItem.quantity

      // Apply intelligent rounding to VES values (round to nearest integer)
      const roundedUnitPriceVes =
        unitPriceVes !== null && unitPriceVes !== undefined ? Math.round(unitPriceVes) : null
      const roundedSubtotalVes =
        unitPriceVes !== null && unitPriceVes !== undefined
          ? Math.round(unitPriceVes * quantity)
          : null

      return {
        product_id: productId,
        product_name: sanitizedItem.product_name,
        product_summary:
          sanitizedItem.product_summary !== undefined ? sanitizedItem.product_summary : null,
        unit_price_usd: unitPriceUsd,
        unit_price_ves: roundedUnitPriceVes,
        quantity: quantity,
        subtotal_usd: unitPriceUsd * quantity,
        subtotal_ves: roundedSubtotalVes
      }
    })

    // Use atomic stored function (SSOT: DB_FUNCTIONS.createOrderWithItems)
    const result = await supabase.rpc('create_order_with_items', {
      order_data: orderPayload,
      order_items: itemsPayload
    })

    const data = result?.data ?? result
    const error = result?.error

    if (error) {
      throw new DatabaseError('RPC', 'create_order_with_items', error, {
        orderData,
        itemCount: orderItems.length
      })
    }

    // RPC functions return single values, not arrays
    if (data === null || (Array.isArray(data) && data.length === 0)) {
      throw new DatabaseError(
        'RPC',
        'create_order_with_items',
        new InternalServerError('No data returned'),
        {
          orderData,
          itemCount: orderItems.length
        }
      )
    }

    return data
  } catch (error) {
    console.error('createOrderWithItems failed:', error)
    throw error
  }
}
