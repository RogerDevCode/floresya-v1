/**
 * Expense Repository
 * Data access layer for expenses table
 * @module repositories/expenseRepository
 */

import { BaseRepository } from './baseRepository.js'
import { logger } from '../config/logger.js'

class ExpenseRepository extends BaseRepository {
  constructor() {
    super('expenses')
  }

  /**
   * Find expenses by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Expenses
   */
  async findByDateRange(startDate, endDate, options = {}) {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .gte('expense_date', startDate)
        .lte('expense_date', endDate)
        .order('expense_date', { ascending: false })

      if (options.category) {
        query = query.eq('category', options.category)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) {throw error}
      return data || []
    } catch (error) {
      logger.error('Error finding expenses by date range', { error, startDate, endDate })
      throw error
    }
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
