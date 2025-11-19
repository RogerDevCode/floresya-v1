/**
 * ExpenseController Tests
 * HTTP layer tests
 * Target: 100% coverage, 0 errors
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import expenseController from '../../api/controllers/expenseController.js'
import { ValidationError, NotFoundError } from '../../api/errors/AppError.js'
import {
  resetAccountingData,
  seedAccountingData,
  createExpense,
  findExpenses,
  findExpenseById,
  updateExpense,
  deleteExpense
} from '../mocks/supabase-accounting.js'

// Mock logger
vi.mock('../../api/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

// Mock expenseService
vi.mock('../../api/services/expenseService.js', () => ({
  default: {
    createExpense: vi.fn(async (data, userId) => {
      const expenseData = { ...data, created_by: userId }
      const result = await createExpense(expenseData)
      if (result.error) throw result.error
      return result.data
    }),
    getExpenseById: vi.fn(async (id) => {
      const result = await findExpenseById(id)
      if (!result.data) throw new NotFoundError('Expense not found')
      return result.data
    }),
    getExpenses: vi.fn(async (filters) => {
      const queryFilters = {}
      if (filters.startDate && filters.endDate) {
        queryFilters.gte_expense_date = filters.startDate.toISOString().split('T')[0]
        queryFilters.lte_expense_date = filters.endDate.toISOString().split('T')[0]
      }
      if (filters.category) queryFilters.eq_category = filters.category

      const options = {}
      if (filters.limit) options.limit = parseInt(filters.limit)
      if (filters.offset) options.offset = parseInt(filters.offset)

      const result = await findExpenses(queryFilters, options)
      return result.data
    }),
    updateExpense: vi.fn(async (id, updates) => {
      const result = await updateExpense(id, updates)
      if (result.error) throw result.error
      if (!result.data) throw new NotFoundError('Expense not found')
      return result.data
    }),
    deleteExpense: vi.fn(async (id) => {
      const result = await deleteExpense(id)
      if (!result.data) throw new NotFoundError('Expense not found')
      return result.data
    }),
    getExpensesByCategory: vi.fn(async (startDate, endDate) => {
      const result = await findExpenses({
        gte_expense_date: startDate.toISOString().split('T')[0],
        lte_expense_date: endDate.toISOString().split('T')[0]
      })

      const grouped = result.data.reduce((acc, exp) => {
        if (!acc[exp.category]) {
          acc[exp.category] = { category: exp.category, total: 0, count: 0 }
        }
        acc[exp.category].total += exp.amount
        acc[exp.category].count += 1
        return acc
      }, {})

      return Object.values(grouped)
    })
  }
}))

describe('ExpenseController - HTTP Layer', () => {
  let req, res, next

  beforeEach(() => {
    resetAccountingData()
    seedAccountingData()

    // Mock request
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 1 }
    }

    // Mock response
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    }

    // Mock next
    next = vi.fn()

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create expense and return 201', async () => {
      req.body = {
        category: 'flores',
        description: 'Test expense',
        amount: 100.00,
        payment_method: 'efectivo'
      }

      await expenseController.create(req, res, next)

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          category: 'flores',
          description: 'Test expense',
          amount: 100.00
        }),
        message: 'Expense created successfully'
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle validation errors', async () => {
      req.body = {
        category: 'invalid_category',
        description: 'Test',
        amount: 100
      }

      await expenseController.create(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(Error))
      expect(res.status).not.toHaveBeenCalled()
    })

    it('should pass user ID from request', async () => {
      req.body = {
        category: 'flores',
        description: 'Test',
        amount: 50
      }
      req.user.id = 999

      await expenseController.create(req, res, next)

      const responseData = res.json.mock.calls[0][0]
      expect(responseData.data.created_by).toBe(999)
    })
  })

  describe('getById', () => {
    it('should return expense by ID', async () => {
      req.params.id = '1'

      await expenseController.getById(req, res, next)

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 1,
          category: 'flores'
        })
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle not found error', async () => {
      req.params.id = '999'

      await expenseController.getById(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError))
      expect(res.json).not.toHaveBeenCalled()
    })
  })

  describe('getAll', () => {
    it('should return all expenses', async () => {
      await expenseController.getAll(req, res, next)

      expect(res.json).toHaveBeenCalled()
      const responseData = res.json.mock.calls[0][0]
      expect(responseData.success).toBe(true)
      expect(Array.isArray(responseData.data)).toBe(true)
      expect(next).not.toHaveBeenCalled()
    })

    it('should filter by category', async () => {
      req.query.category = 'flores'

      await expenseController.getAll(req, res, next)

      const responseData = res.json.mock.calls[0][0]
      expect(responseData.data.every(e => e.category === 'flores')).toBe(true)
    })

    it('should filter by date range', async () => {
      req.query.startDate = '2025-11-15'
      req.query.endDate = '2025-11-17'

      await expenseController.getAll(req, res, next)

      const responseData = res.json.mock.calls[0][0]
      expect(Array.isArray(responseData.data)).toBe(true)
    })

    it('should apply limit and offset', async () => {
      req.query.limit = '1'
      req.query.offset = '0'

      await expenseController.getAll(req, res, next)

      const responseData = res.json.mock.calls[0][0]
      expect(responseData.data.length).toBeLessThanOrEqual(1)
    })
  })

  describe('update', () => {
    it('should update expense successfully', async () => {
      req.params.id = '1'
      req.body = {
        description: 'Updated description',
        amount: 200.00
      }

      await expenseController.update(req, res, next)

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          description: 'Updated description',
          amount: 200.00
        }),
        message: 'Expense updated successfully'
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle not found error', async () => {
      req.params.id = '999'
      req.body = { description: 'Test' }

      await expenseController.update(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError))
      expect(res.json).not.toHaveBeenCalled()
    })

    it('should handle validation errors', async () => {
      req.params.id = '1'
      req.body = {
        category: 'invalid_category'
      }

      await expenseController.update(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('delete', () => {
    it('should delete expense successfully', async () => {
      req.params.id = '1'

      await expenseController.delete(req, res, next)

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Expense deleted successfully'
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle not found error', async () => {
      req.params.id = '999'

      await expenseController.delete(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError))
      expect(res.json).not.toHaveBeenCalled()
    })
  })

  describe('getByCategory', () => {
    it('should return expenses grouped by category', async () => {
      req.query.startDate = '2025-11-15'
      req.query.endDate = '2025-11-17'

      await expenseController.getByCategory(req, res, next)

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array)
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should require startDate', async () => {
      req.query.endDate = '2025-11-17'

      await expenseController.getByCategory(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'startDate and endDate are required'
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should require endDate', async () => {
      req.query.startDate = '2025-11-15'

      await expenseController.getByCategory(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'startDate and endDate are required'
      })
      expect(next).not.toHaveBeenCalled()
    })
  })
})
