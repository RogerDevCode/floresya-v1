/**
 * Procesado por B
 */

/**
 * Payment Method Service
 * Full CRUD operations for payment method management in Venezuela
 * Uses indexed columns for optimized queries
 * ENTERPRISE FAIL-FAST: Uses custom error classes with metadata
 *
 * REPOSITORY PATTERN: Uses PaymentMethodRepository for data access
 * Following Service Layer Exclusive principle
 */

import DIContainer from '../architecture/di-container.js'
import {
  NotFoundError,
  DatabaseError,
  BadRequestError,
  InternalServerError
} from '../errors/AppError.js'
import { validatePaymentMethod } from '../utils/validation.js'
import { withErrorMapping } from '../middleware/error/index.js'

const TABLE = 'payment_methods'

/**
 * Get PaymentMethodRepository instance from DI Container
 * @returns {PaymentMethodRepository} Repository instance
 */
function getPaymentMethodRepository() {
  return DIContainer.resolve('PaymentMethodRepository')
}

/**
 * Get all payment methods with filters - returns active methods ordered by display_order
 * @param {Object} [filters={}] - Filter options
 * @param {number} [filters.limit] - Maximum number of payment methods to return
 * @param {boolean} includeDeactivated - Include inactive payment methods (default: false, admin only)
 * @returns {Object[]} - Array of payment methods ordered by display_order
 * @throws {NotFoundError} When no payment methods are found
 * @throws {DatabaseError} When database query fails
 */
export const getAllPaymentMethods = withErrorMapping(
  async (filters = {}, includeDeactivated = false) => {
    const paymentMethodRepository = await getPaymentMethodRepository()

    const data = await paymentMethodRepository.findAllWithFilters(
      { ...filters, includeDeactivated },
      {
        orderBy: 'display_order',
        ascending: true,
        limit: filters.limit
      }
    )

    if (!data || data.length === 0) {
      throw new NotFoundError('Payment methods')
    }

    return data
  },
  'SELECT',
  TABLE
)

/**
 * Get payment method by ID
 * @param {number} id - Payment method ID to retrieve
 * @param {boolean} includeDeactivated - Include inactive payment methods (default: false, admin only)
 * @returns {Object} - Payment method object
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When payment method is not found
 * @throws {DatabaseError} When database query fails
 */
export const getPaymentMethodById = withErrorMapping(
  async (id, includeDeactivated = false) => {
    if (!id || typeof id !== 'number' || id <= 0) {
      throw new BadRequestError('Invalid payment method ID: must be a positive number', {
        paymentMethodId: id
      })
    }

    const paymentMethodRepository = await getPaymentMethodRepository()
    const data = await paymentMethodRepository.findById(id, includeDeactivated)

    if (!data) {
      throw new NotFoundError('Payment method', id, { includeDeactivated })
    }

    return data
  },
  'SELECT',
  TABLE
)

/**
 * Create new payment method
 * @param {Object} paymentMethodData - Payment method data to create
 * @param {string} paymentMethodData.name - Payment method name (required)
 * @param {string} paymentMethodData.type - Payment method type (required, must be valid enum value)
 * @param {string} [paymentMethodData.description] - Payment method description
 * @param {string} [paymentMethodData.account_info] - Account information for payment method
 * @param {number} [paymentMethodData.display_order=0] - Display order for sorting
 * @returns {Object} - Created payment method
 * @throws {ValidationError} When payment method data is invalid
 * @throws {DatabaseConstraintError} When payment method violates database constraints (e.g., duplicate name)
 * @throws {DatabaseError} When database insert fails
 */
export const createPaymentMethod = withErrorMapping(
  async paymentMethodData => {
    validatePaymentMethod(paymentMethodData, false)

    const newPaymentMethod = {
      name: paymentMethodData.name,
      type: paymentMethodData.type,
      description: paymentMethodData.description || null,
      account_info: paymentMethodData.account_info || null,
      active: paymentMethodData.active !== undefined ? paymentMethodData.active : true,
      display_order: paymentMethodData.display_order || 0
    }

    const paymentMethodRepository = await getPaymentMethodRepository()
    const data = await paymentMethodRepository.create(newPaymentMethod)

    if (!data) {
      throw new DatabaseError(
        'INSERT',
        'payment_methods',
        new InternalServerError('No data returned after insert'),
        {
          paymentMethodData: newPaymentMethod
        }
      )
    }

    return data
  },
  'INSERT',
  TABLE
)

/**
 * Update payment method (limited fields) - only allows updating specific payment method fields
 * @param {number} id - Payment method ID to update
 * @param {Object} updates - Updated payment method data
 * @param {string} [updates.name] - Payment method name
 * @param {string} [updates.type] - Payment method type
 * @param {string} [updates.description] - Payment method description
 * @param {string} [updates.account_info] - Account information for payment method
 * @param {boolean} [updates.active] - Whether payment method is active
 * @param {number} [updates.display_order] - Display order for sorting
 * @returns {Object} - Updated payment method
 * @throws {BadRequestError} When ID is invalid or no valid updates are provided
 * @throws {ValidationError} When payment method data is invalid
 * @throws {NotFoundError} When payment method is not found
 * @throws {DatabaseConstraintError} When payment method violates database constraints (e.g., duplicate name)
 * @throws {DatabaseError} When database update fails
 */
export const updatePaymentMethod = withErrorMapping(
  async (id, updates) => {
    if (!id || typeof id !== 'number' || id <= 0) {
      throw new BadRequestError('Invalid payment method ID: must be a positive number', {
        paymentMethodId: id
      })
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new BadRequestError('No updates provided', { paymentMethodId: id })
    }

    validatePaymentMethod(updates, true)

    const allowedFields = ['name', 'type', 'description', 'account_info', 'active', 'display_order']
    const sanitized = {}

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        sanitized[key] = updates[key]
      }
    }

    if (Object.keys(sanitized).length === 0) {
      throw new BadRequestError('No valid fields to update', { paymentMethodId: id })
    }

    const paymentMethodRepository = await getPaymentMethodRepository()
    const data = await paymentMethodRepository.update(id, sanitized)

    if (!data) {
      throw new NotFoundError('Payment method', id, { active: true })
    }

    return data
  },
  'UPDATE',
  TABLE
)

/**
 * Soft-delete payment method (reverse soft-delete)
 * @param {number} id - Payment method ID to delete
 * @returns {Object} - Deactivated payment method
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When payment method is not found or already inactive
 * @throws {DatabaseError} When database update fails
 */
export const deletePaymentMethod = withErrorMapping(
  async id => {
    if (!id || typeof id !== 'number' || id <= 0) {
      throw new BadRequestError('Invalid payment method ID: must be a positive number', {
        paymentMethodId: id
      })
    }

    const paymentMethodRepository = await getPaymentMethodRepository()
    const data = await paymentMethodRepository.update(id, { active: false })

    if (!data) {
      throw new NotFoundError('Payment method', id, { active: true })
    }

    return data
  },
  'DELETE',
  TABLE
)

/**
 * Reactivate payment method (reverse soft-delete)
 * @param {number} id - Payment method ID to reactivate
 * @returns {Object} - Reactivated payment method
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When payment method is not found or already active
 * @throws {DatabaseError} When database update fails
 */
export const reactivatePaymentMethod = withErrorMapping(
  async id => {
    if (!id || typeof id !== 'number' || id <= 0) {
      throw new BadRequestError('Invalid payment method ID: must be a positive number', {
        paymentMethodId: id
      })
    }

    const paymentMethodRepository = await getPaymentMethodRepository()
    const data = await paymentMethodRepository.update(id, { active: true })

    if (!data) {
      throw new NotFoundError('Payment method', id, { active: false })
    }

    return data
  },
  'UPDATE',
  TABLE
)

/**
 * Update display order for payment method sorting
 * @param {number} id - Payment method ID to update
 * @param {number} newOrder - New display order (must be non-negative)
 * @returns {Object} - Updated payment method
 * @throws {BadRequestError} When ID is invalid or newOrder is negative
 * @throws {NotFoundError} When payment method is not found or inactive
 * @throws {DatabaseError} When database update fails
 */
export const updateDisplayOrder = withErrorMapping(
  async (id, newOrder) => {
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

    const paymentMethodRepository = await getPaymentMethodRepository()
    const data = await paymentMethodRepository.updateDisplayOrder(id, newOrder)

    if (!data) {
      throw new NotFoundError('Payment method', id, { active: true })
    }

    return data
  },
  'UPDATE',
  TABLE
)
