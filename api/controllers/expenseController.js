/**
 * Expense Controller
 * Handles HTTP requests for expense management
 * @module controllers/expenseController
 */

import expenseService from '../services/expenseService.js'
import receiptStorageService from '../services/receiptStorageService.js'
import { logger } from '../utils/logger.js'

class ExpenseController {
  /**
   * Create new expense
   * POST /api/expenses
   */
  async create(req, res, next) {
    try {
      const userId = req.user.id
      let receiptUrl = null

      // Handle receipt file upload if present
      if (req.file) {
        receiptUrl = await receiptStorageService.uploadReceipt(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          userId
        )
      }

      const expenseData = {
        ...req.body,
        receipt_url: receiptUrl
      }

      const expense = await expenseService.createExpense(expenseData, userId)

      res.status(201).json({
        success: true,
        data: expense,
        message: 'Expense created successfully'
      })
    } catch (error) {
      logger.error('Error in createExpense controller', { error })
      next(error)
    }
  }

  /**
   * Get expense by ID
   * GET /api/expenses/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params
      const expense = await expenseService.getExpenseById(id)

      res.json({
        success: true,
        data: expense
      })
    } catch (error) {
      logger.error('Error in getExpenseById controller', { error })
      next(error)
    }
  }

  /**
   * Get all expenses with filters
   * GET /api/expenses
   */
  async getAll(req, res, next) {
    try {
      const { startDate, endDate, category, limit, offset } = req.query

      const filters = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        category,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined
      }

      const expenses = await expenseService.getExpenses(filters)

      res.json({
        success: true,
        data: expenses,
        message: `Retrieved ${expenses.length} expenses`
      })
    } catch (error) {
      logger.error('Error in getExpenses controller', { error })
      next(error)
    }
  }

  /**
   * Update expense
   * PUT /api/expenses/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params
      const userId = req.user.id
      const updateData = { ...req.body }

      // Handle new receipt upload
      if (req.file) {
        // Get existing expense to delete old receipt
        const existingExpense = await expenseService.getExpenseById(id)

        // Upload new receipt
        const receiptUrl = await receiptStorageService.uploadReceipt(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          userId
        )

        updateData.receipt_url = receiptUrl

        // Delete old receipt if exists
        if (existingExpense.receipt_url) {
          await receiptStorageService.deleteReceipt(existingExpense.receipt_url)
        }
      }

      const expense = await expenseService.updateExpense(id, updateData)

      res.json({
        success: true,
        data: expense,
        message: 'Expense updated successfully'
      })
    } catch (error) {
      logger.error('Error in updateExpense controller', { error })
      next(error)
    }
  }

  /**
   * Delete expense
   * DELETE /api/expenses/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params

      // Get expense to delete receipt
      const expense = await expenseService.getExpenseById(id)

      // Delete receipt if exists
      if (expense.receipt_url) {
        await receiptStorageService.deleteReceipt(expense.receipt_url)
      }

      await expenseService.deleteExpense(id)

      res.json({
        success: true,
        message: 'Expense deleted successfully'
      })
    } catch (error) {
      logger.error('Error in deleteExpense controller', { error })
      next(error)
    }
  }

  /**
   * Get expenses by category
   * GET /api/expenses/by-category
   */
  async getByCategory(req, res, next) {
    try {
      const { startDate, endDate } = req.query

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'startDate and endDate are required'
        })
      }

      const expenses = await expenseService.getExpensesByCategory(
        new Date(startDate),
        new Date(endDate)
      )

      res.json({
        success: true,
        data: expenses
      })
    } catch (error) {
      logger.error('Error in getExpensesByCategory controller', { error })
      next(error)
    }
  }
}

export default new ExpenseController()
