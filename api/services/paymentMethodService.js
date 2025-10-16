/**
 * Payment Method Service
 * Full CRUD operations for payment method management in Venezuela
 * Uses indexed columns for optimized queries
 * ENTERPRISE FAIL-FAST: Uses custom error classes with metadata
 */

import { supabase, DB_SCHEMA } from './supabaseClient.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  DatabaseConstraintError,
  BadRequestError,
  InternalServerError
} from '../errors/AppError.js'

const TABLE = DB_SCHEMA.payment_methods.table
const VALID_TYPES = DB_SCHEMA.payment_methods.enums.type

/**
 * Validate payment method data (ENTERPRISE FAIL-FAST)
 * @param {Object} data - Payment method data to validate
 * @param {string} [data.name] - Payment method name (required for creation)
 * @param {string} [data.type] - Payment method type (required for creation, must be valid enum value)
 * @param {string} [data.description] - Payment method description
 * @param {string} [data.account_info] - Account information for the payment method
 * @param {boolean} [data.is_active] - Whether the payment method is active
 * @param {number} [data.display_order] - Display order for sorting
 * @param {boolean} isUpdate - Whether this is for an update operation (default: false)
 * @throws {ValidationError} With detailed field-level validation errors
 * @example
 * // For creation
 * validatePaymentMethodData({
 *   name: 'Banco Mercantil',
 *   type: 'bank_transfer',
 *   display_order: 1
 * }, false)
 *
 * // For update
 * validatePaymentMethodData({
 *   display_order: 2
 * }, true)
 */
function validatePaymentMethodData(data, isUpdate = false) {
  const errors = {}

  if (!isUpdate) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      errors.name = 'Name is required and must be a non-empty string'
    }
    if (!data.type || typeof data.type !== 'string') {
      errors.type = 'Type is required and must be a string'
    } else if (!VALID_TYPES.includes(data.type)) {
      errors.type = `Type must be one of ${VALID_TYPES.join(', ')}`
    }
  }

  if (data.name !== undefined && typeof data.name !== 'string') {
    errors.name = 'Name must be a string'
  }

  if (data.type !== undefined && typeof data.type !== 'string') {
    errors.type = 'Type must be a string'
  } else if (data.type !== undefined && !VALID_TYPES.includes(data.type)) {
    errors.type = `Type must be one of ${VALID_TYPES.join(', ')}`
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.description = 'Description must be a string'
  }

  if (data.account_info !== undefined && typeof data.account_info !== 'string') {
    errors.account_info = 'Account info must be a string'
  }

  if (
    data.display_order !== undefined &&
    (typeof data.display_order !== 'number' || data.display_order < 0)
  ) {
    errors.display_order = 'Display order must be a non-negative number'
  }

  if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
    errors.is_active = 'Is active must be a boolean'
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Payment method validation failed', errors)
  }
}

/**
 * Get all payment methods with filters - returns active methods ordered by display_order
 * @param {Object} [filters={}] - Filter options
 * @param {number} [filters.limit] - Maximum number of payment methods to return
 * @param {boolean} includeInactive - Include inactive payment methods (default: false, admin only)
 * @returns {Object[]} - Array of payment methods ordered by display_order
 * @throws {NotFoundError} When no payment methods are found
 * @throws {DatabaseError} When database query fails
 */
export async function getAllPaymentMethods(filters = {}, includeInactive = false) {
  try {
    let query = supabase.from(TABLE).select('*')

    // By default, only return active payment methods
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    query = query.order('display_order', { ascending: true })

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error)
    }
    if (!data) {
      throw new NotFoundError('Payment methods')
    }

    return data
  } catch (error) {
    console.error('getAllPaymentMethods failed:', error)
    throw error
  }
}

/**
 * Get payment method by ID
 * @param {number} id - Payment method ID to retrieve
 * @param {boolean} includeInactive - Include inactive payment methods (default: false, admin only)
 * @returns {Object} - Payment method object
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When payment method is not found
 * @throws {DatabaseError} When database query fails
 */
export async function getPaymentMethodById(id, includeInactive = false) {
  try {
    if (!id || typeof id !== 'number' || id <= 0) {
      throw new BadRequestError('Invalid payment method ID: must be a positive number', {
        paymentMethodId: id
      })
    }

    let query = supabase.from(TABLE).select('*').eq('id', id)

    // By default, only return active payment methods
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Payment method', id, { includeInactive })
      }
      throw new DatabaseError('SELECT', TABLE, error, { paymentMethodId: id })
    }
    if (!data) {
      throw new NotFoundError('Payment method', id, { includeInactive })
    }

    return data
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error(`getPaymentMethodById(${id}) failed:`, error)
    throw new DatabaseError('SELECT', TABLE, error, { paymentMethodId: id })
  }
}

/**
 * Create new payment method
 * @param {Object} paymentMethodData - Payment method data to create
 * @param {string} paymentMethodData.name - Payment method name (required)
 * @param {string} paymentMethodData.type - Payment method type (required, must be valid enum value)
 * @param {string} [paymentMethodData.description] - Payment method description
 * @param {string} [paymentMethodData.account_info] - Account information for the payment method
 * @param {number} [paymentMethodData.display_order=0] - Display order for sorting
 * @returns {Object} - Created payment method
 * @throws {ValidationError} When payment method data is invalid
 * @throws {DatabaseConstraintError} When payment method violates database constraints (e.g., duplicate name)
 * @throws {DatabaseError} When database insert fails
 */
export async function createPaymentMethod(paymentMethodData) {
  try {
    validatePaymentMethodData(paymentMethodData, false)

    const newPaymentMethod = {
      name: paymentMethodData.name,
      type: paymentMethodData.type,
      description: paymentMethodData.description || null,
      account_info: paymentMethodData.account_info || null,
      is_active: paymentMethodData.is_active !== undefined ? paymentMethodData.is_active : true,
      display_order: paymentMethodData.display_order || 0
    }

    const { data, error } = await supabase.from(TABLE).insert(newPaymentMethod).select().single()

    if (error) {
      if (error.code === '23505') {
        throw new DatabaseConstraintError('unique_name', TABLE, {
          name: paymentMethodData.name,
          message: `Payment method with name "${paymentMethodData.name}" already exists`
        })
      }
      throw new DatabaseError('INSERT', TABLE, error, { paymentMethodData: newPaymentMethod })
    }

    if (!data) {
      throw new DatabaseError(
        'INSERT',
        TABLE,
        new InternalServerError('No data returned after insert'),
        {
          paymentMethodData: newPaymentMethod
        }
      )
    }

    return data
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error('createPaymentMethod failed:', error)
    throw new DatabaseError('INSERT', TABLE, error, { paymentMethodData })
  }
}

/**
 * Update payment method (limited fields) - only allows updating specific payment method fields
 * @param {number} id - Payment method ID to update
 * @param {Object} updates - Updated payment method data
 * @param {string} [updates.name] - Payment method name
 * @param {string} [updates.type] - Payment method type
 * @param {string} [updates.description] - Payment method description
 * @param {string} [updates.account_info] - Account information for the payment method
 * @param {boolean} [updates.is_active] - Whether the payment method is active
 * @param {number} [updates.display_order] - Display order for sorting
 * @returns {Object} - Updated payment method
 * @throws {BadRequestError} When ID is invalid or no valid updates are provided
 * @throws {ValidationError} When payment method data is invalid
 * @throws {NotFoundError} When payment method is not found
 * @throws {DatabaseConstraintError} When payment method violates database constraints (e.g., duplicate name)
 * @throws {DatabaseError} When database update fails
 */
export async function updatePaymentMethod(id, updates) {
  try {
    if (!id || typeof id !== 'number' || id <= 0) {
      throw new BadRequestError('Invalid payment method ID: must be a positive number', {
        paymentMethodId: id
      })
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new BadRequestError('No updates provided', { paymentMethodId: id })
    }

    validatePaymentMethodData(updates, true)

    const allowedFields = [
      'name',
      'type',
      'description',
      'account_info',
      'is_active',
      'display_order'
    ]
    const sanitized = {}

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        sanitized[key] = updates[key]
      }
    }

    if (Object.keys(sanitized).length === 0) {
      throw new BadRequestError('No valid fields to update', { paymentMethodId: id })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(sanitized)
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new DatabaseConstraintError('unique_name', TABLE, {
          name: updates.name,
          message: `Payment method with name "${updates.name}" already exists`
        })
      }
      throw new DatabaseError('UPDATE', TABLE, error, { paymentMethodId: id })
    }

    if (!data) {
      throw new NotFoundError('Payment method', id, { is_active: true })
    }

    return data
  } catch (error) {
    console.error(`updatePaymentMethod(${id}) failed:`, error)
    throw error
  }
}

/**
 * Soft-delete payment method (reverse soft-delete)
 * @param {number} id - Payment method ID to delete
 * @returns {Object} - Deactivated payment method
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When payment method is not found or already inactive
 * @throws {DatabaseError} When database update fails
 */
export async function deletePaymentMethod(id) {
  try {
    if (!id || typeof id !== 'number' || id <= 0) {
      throw new BadRequestError('Invalid payment method ID: must be a positive number', {
        paymentMethodId: id
      })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ is_active: false })
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { paymentMethodId: id })
    }
    if (!data) {
      throw new NotFoundError('Payment method', id, { is_active: true })
    }

    return data
  } catch (error) {
    console.error(`deletePaymentMethod(${id}) failed:`, error)
    throw error
  }
}

/**
 * Reactivate payment method (reverse soft-delete)
 * @param {number} id - Payment method ID to reactivate
 * @returns {Object} - Reactivated payment method
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When payment method is not found or already active
 * @throws {DatabaseError} When database update fails
 */
export async function reactivatePaymentMethod(id) {
  try {
    if (!id || typeof id !== 'number' || id <= 0) {
      throw new BadRequestError('Invalid payment method ID: must be a positive number', {
        paymentMethodId: id
      })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ is_active: true })
      .eq('id', id)
      .eq('is_active', false)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { paymentMethodId: id })
    }
    if (!data) {
      throw new NotFoundError('Payment method', id, { is_active: false })
    }

    return data
  } catch (error) {
    console.error(`reactivatePaymentMethod(${id}) failed:`, error)
    throw error
  }
}

/**
 * Update display order for payment method sorting
 * @param {number} id - Payment method ID to update
 * @param {number} newOrder - New display order (must be non-negative)
 * @returns {Object} - Updated payment method
 * @throws {BadRequestError} When ID is invalid or newOrder is negative
 * @throws {NotFoundError} When payment method is not found or inactive
 * @throws {DatabaseError} When database update fails
 */
export async function updateDisplayOrder(id, newOrder) {
  try {
    if (!id || typeof id !== 'number' || id <= 0) {
      throw new BadRequestError('Invalid payment method ID: must be a positive number', {
        paymentMethodId: id
      })
    }

    if (typeof newOrder !== 'number' || newOrder < 0) {
      throw new BadRequestError('Invalid display_order: must be a non-negative number', {
        newOrder
      })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ display_order: newOrder })
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { paymentMethodId: id })
    }
    if (!data) {
      throw new NotFoundError('Payment method', id, { is_active: true })
    }

    return data
  } catch (error) {
    console.error(`updateDisplayOrder(${id}) failed:`, error)
    throw error
  }
}
