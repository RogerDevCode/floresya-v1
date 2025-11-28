/**
 * Expense Service
 * Business logic for expense management
 * @module services/expenseService
 */

import expenseRepository from '../repositories/expenseRepository.js'
import { NotFoundError, ValidationError } from '../errors/AppError.js'
import { withErrorMapping } from '../middleware/error/index.js'
import { logger } from '../utils/logger.js'

/**
 * Expense categories
 */
export const EXPENSE_CATEGORIES = [
  'flores',
  'transporte',
  'empaque',
  'personal',
  'servicios',
  'marketing',
  'otros'
]

/**
 * Payment methods
 */
export const PAYMENT_METHODS = [
  'efectivo',
  'transferencia',
  'tarjeta_debito',
  'tarjeta_credito',
  'pago_movil',
  'otro'
]

/**
 * Create a new expense
 * @param {Object} expenseData - Expense data
 * @param {string} userId - User ID creating the expense
 * @returns {Promise<Object>} Created expense
 */
export const createExpense = withErrorMapping(
  async (expenseData, userId) => {
    // Validate category
    if (!EXPENSE_CATEGORIES.includes(expenseData.category)) {
      throw new ValidationError(
        `Invalid category. Must be one of: ${EXPENSE_CATEGORIES.join(', ')}`
      )
    }

    // Validate amount
    if (!expenseData.amount || expenseData.amount <= 0) {
      throw new ValidationError('Amount must be greater than 0')
    }

    // Validate payment method if provided
    if (expenseData.payment_method && !PAYMENT_METHODS.includes(expenseData.payment_method)) {
      throw new ValidationError(
        `Invalid payment method. Must be one of: ${PAYMENT_METHODS.join(', ')}`
      )
    }

    const expense = {
      ...expenseData,
      created_by: userId,
      expense_date: expenseData.expense_date || new Date().toISOString().split('T')[0]
    }

    const created = await expenseRepository.create(expense)
    logger.info('Expense created', { expenseId: created.id, userId })

    return created
  },
  'INSERT',
  'expenses'
)

/**
 * Get expense by ID
 * @param {string} id - Expense ID
 * @returns {Promise<Object>} Expense
 */
export const getExpenseById = withErrorMapping(
  async id => {
    const expense = await expenseRepository.findById(id)
    if (!expense) {
      throw new NotFoundError('Expense not found')
    }
    return expense
  },
  'SELECT',
  'expenses'
)

/**
 * Get all expenses with filters
 * ✅ OPTIMIZADO: Usa findAllWithFilters con RPC
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Expenses
 */
export const getExpenses = withErrorMapping(
  async (filters = {}) => {
    // ✅ OPTIMIZACIÓN: Usar findAllWithFilters que usa get_expenses_filtered RPC
    return await expenseRepository.findAllWithFilters(filters, {
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      orderBy: 'expense_date'
    })
  },
  'SELECT',
  'expenses'
)

/**
 * Update expense
 * @param {string} id - Expense ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated expense
 */
export const updateExpense = withErrorMapping(
  async (id, updates) => {
    // Validate category if provided
    if (updates.category && !EXPENSE_CATEGORIES.includes(updates.category)) {
      throw new ValidationError(
        `Invalid category. Must be one of: ${EXPENSE_CATEGORIES.join(', ')}`
      )
    }

    // Validate amount if provided
    if (updates.amount !== undefined && updates.amount <= 0) {
      throw new ValidationError('Amount must be greater than 0')
    }

    // Validate payment method if provided
    if (updates.payment_method && !PAYMENT_METHODS.includes(updates.payment_method)) {
      throw new ValidationError(
        `Invalid payment method. Must be one of: ${PAYMENT_METHODS.join(', ')}`
      )
    }

    const updated = await expenseRepository.update(id, updates)
    if (!updated) {
      throw new NotFoundError('Expense not found')
    }

    logger.info('Expense updated', { expenseId: id })
    return updated
  },
  'UPDATE',
  'expenses'
)

/**
 * Delete expense (soft delete)
 * @param {string} id - Expense ID
 * @returns {Promise<Object>} Deleted expense
 */
export const deleteExpense = withErrorMapping(
  async id => {
    const deleted = await expenseRepository.delete(id)
    if (!deleted) {
      throw new NotFoundError('Expense not found')
    }

    logger.info('Expense deleted', { expenseId: id })
    return deleted
  },
  'DELETE',
  'expenses'
)

/**
 * Get expenses by category for date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Expenses grouped by category
 */
export const getExpensesByCategory = withErrorMapping(
  async (startDate, endDate) => {
    return await expenseRepository.getExpensesByCategory(startDate, endDate)
  },
  'SELECT',
  'expenses'
)

/**
 * Get total expenses for date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<number>} Total expenses
 */
export const getTotalExpenses = withErrorMapping(
  async (startDate, endDate) => {
    return await expenseRepository.getTotalExpenses(startDate, endDate)
  },
  'SELECT',
  'expenses'
)
