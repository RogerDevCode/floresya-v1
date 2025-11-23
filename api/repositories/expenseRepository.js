/**
 * Expense Repository
 * Data access layer for expenses table
 * @module repositories/expenseRepository
 */

import { BaseRepository } from './BaseRepository.js'
import { logger } from '../utils/logger.js'

class ExpenseRepository extends BaseRepository {
  constructor() {
    super('expenses')
  }

  /**
   * Find expenses with filters
   * ✅ OPTIMIZED: 100% SQL filtering using get_expenses_filtered()
   * NO JavaScript filtering - everything done in PostgreSQL with indexes
   * @param {Object} filters - Filter options
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Filtered expenses
   */
  async findAllWithFilters(filters = {}, options = {}) {
    // ✅ OPTIMIZATION: Use get_expenses_filtered() RPC for complete SQL filtering

    let sortBy = 'expense_date'
    let sortOrder = 'DESC'

    if (options.orderBy) {
      sortBy = options.orderBy
      sortOrder = options.ascending ? 'ASC' : 'DESC'
    }

    const { data, error } = await this.supabase.rpc('get_expenses_filtered', {
      p_category: filters.category || null,
      p_date_from: filters.startDate
        ? new Date(filters.startDate).toISOString().split('T')[0]
        : null,
      p_date_to: filters.endDate ? new Date(filters.endDate).toISOString().split('T')[0] : null,
      p_payment_method: filters.paymentMethod || null,
      p_sort_by: sortBy,
      p_sort_order: sortOrder,
      p_limit: options.limit || 50,
      p_offset: options.offset || 0
    })

    if (error) {
      logger.error('Error in findAllWithFilters (get_expenses_filtered RPC)', {
        error,
        filters,
        options
      })
      throw error
    }

    return data || []
  }

  /**
   * Find expenses by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Expenses
   */
  async findByDateRange(startDate, endDate, options = {}) {
    // Use findAllWithFilters for consistency
    return this.findAllWithFilters(
      {
        startDate,
        endDate,
        category: options.category
      },
      {
        limit: options.limit
      }
    )
  }

  /**
   * Get expenses grouped by category
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Expenses grouped by category
   */
  async getExpensesByCategory(startDate, endDate) {
    try {
      const { data, error } = await this.supabase.rpc('get_expenses_by_category', {
        start_date: startDate,
        end_date: endDate
      })

      if (error) {
        // Fallback to manual grouping if RPC doesn't exist
        const expenses = await this.findByDateRange(startDate, endDate)
        return this.groupByCategory(expenses)
      }

      return data || []
    } catch (error) {
      logger.error('Error getting expenses by category', { error })
      throw error
    }
  }

  /**
   * Group expenses by category (fallback)
   * @param {Array} expenses - Array of expenses
   * @returns {Array} Grouped expenses
   */
  groupByCategory(expenses) {
    const grouped = expenses.reduce((acc, expense) => {
      const category = expense.category
      if (!acc[category]) {
        acc[category] = {
          category,
          total: 0,
          count: 0
        }
      }
      acc[category].total += parseFloat(expense.amount)
      acc[category].count += 1
      return acc
    }, {})

    return Object.values(grouped)
  }

  /**
   * Get total expenses for date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<number>} Total expenses
   */
  async getTotalExpenses(startDate, endDate) {
    try {
      const expenses = await this.findByDateRange(startDate, endDate)
      return expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)
    } catch (error) {
      logger.error('Error getting total expenses', { error })
      throw error
    }
  }
}

export default new ExpenseRepository()
