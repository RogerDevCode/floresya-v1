/**
 * Expense Service
 * Business logic for expense management
 * @module services/expenseService
 */

import expenseRepository from '../repositories/expenseRepository.js'
import { NotFoundError, ValidationError } from '../errors/AppError.js'
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

class ExpenseService {
  /**
   * Create a new expense
   * @param {Object} expenseData - Expense data
   * @param {string} userId - User ID creating the expense
   * @returns {Promise<Object>} Created expense
   */
  async createExpense(expenseData, userId) {
    try {
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
    } catch (error) {
      logger.error('Error creating expense', { error, expenseData })
      throw error
    }
  }

  /**
   * Get expense by ID
   * @param {string} id - Expense ID
   * @returns {Promise<Object>} Expense
   */
  async getExpenseById(id) {
    try {
      const expense = await expenseRepository.findById(id)
      if (!expense) {
        throw new NotFoundError('Expense not found')
      }
      return expense
    } catch (error) {
      logger.error('Error getting expense by ID', { error, id })
      throw error
    }
  }

  /**
   * Get all expenses with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Expenses
   */
  async getExpenses(filters = {}) {
    try {
      const { startDate, endDate, category, limit, offset } = filters

      if (startDate && endDate) {
        return await expenseRepository.findByDateRange(startDate, endDate, {
          category,
          limit,
          offset
        })
      }

      return await expenseRepository.findMany({
        category,
        active: true,
        limit: limit || 50,
        offset: offset || 0,
        orderBy: [{ column: 'expense_date', ascending: false }]
      })
    } catch (error) {
      logger.error('Error getting expenses', { error, filters })
      throw error
    }
  }

  /**
   * Update expense
   * @param {string} id - Expense ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated expense
   */
  async updateExpense(id, updates) {
    try {
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
    } catch (error) {
      logger.error('Error updating expense', { error, id, updates })
      throw error
    }
  }

  /**
   * Delete expense (soft delete)
   * @param {string} id - Expense ID
   * @returns {Promise<Object>} Deleted expense
   */
  async deleteExpense(id) {
    try {
      const deleted = await expenseRepository.delete(id)
      if (!deleted) {
        throw new NotFoundError('Expense not found')
      }

      logger.info('Expense deleted', { expenseId: id })
      return deleted
    } catch (error) {
      logger.error('Error deleting expense', { error, id })
      throw error
    }
  }

  /**
   * Get expenses by category for date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Expenses grouped by category
   */
  async getExpensesByCategory(startDate, endDate) {
    try {
      return await expenseRepository.getExpensesByCategory(startDate, endDate)
    } catch (error) {
      logger.error('Error getting expenses by category', { error })
      throw error
    }
  }

  /**
   * Get total expenses for date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<number>} Total expenses
   */
  async getTotalExpenses(startDate, endDate) {
    try {
      return await expenseRepository.getTotalExpenses(startDate, endDate)
    } catch (error) {
      logger.error('Error getting total expenses', { error })
      throw error
    }
  }
}

export default new ExpenseService()
