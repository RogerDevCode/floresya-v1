/**
 * Expense Controller
 * Handles HTTP requests for expense management
 * @module controllers/expenseController
 */

import * as expenseService from '../services/expenseService.js'
import * as receiptStorageService from '../services/receiptStorageService.js'
import { asyncHandler } from '../middleware/error/index.js'
import { BadRequestError } from '../errors/AppError.js'

class ExpenseController {
  /**
   * Create new expense
   * POST /api/expenses
   */
  create = asyncHandler(async (req, res) => {
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
  })

  /**
   * Get expense by ID
   * GET /api/expenses/:id
   */
  getById = asyncHandler(async (req, res) => {
    const { id } = req.params
    const expense = await expenseService.getExpenseById(id)

    res.json({
      success: true,
      data: expense
    })
  })

  /**
   * Get all expenses with filters
   * GET /api/expenses
   */
  getAll = asyncHandler(async (req, res) => {
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
  })

  /**
   * Update expense
   * PUT /api/expenses/:id
   */
  update = asyncHandler(async (req, res) => {
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
  })

  /**
   * Delete expense
   * DELETE /api/expenses/:id
   */
  delete = asyncHandler(async (req, res) => {
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
  })

  /**
   * Get expenses by category
   * GET /api/expenses/by-category
   */
  getByCategory = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query

    if (!startDate || !endDate) {
      throw new BadRequestError('startDate and endDate are required')
    }

    const expenses = await expenseService.getExpensesByCategory(
      new Date(startDate),
      new Date(endDate)
    )

    res.json({
      success: true,
      data: expenses
    })
  })
}

export default new ExpenseController()
