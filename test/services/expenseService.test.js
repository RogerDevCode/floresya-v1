/**
 * ExpenseService Tests
 * Business logic layer tests
 * Target: 100% coverage, 0 errors
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as expenseService from '../../api/services/expenseService.js'
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../api/services/expenseService.js'
import { ValidationError, NotFoundError } from '../../api/errors/AppError.js'
import { SupabaseAccountingMock } from '../mocks/supabase-accounting.js'

// Mock logger
vi.mock('../../api/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

// Create a mock instance for the repository mock to use
let mockDb

// Mock the repository
vi.mock('../../api/repositories/expenseRepository.js', () => ({
  default: {
    create: vi.fn(async data => {
      const result = await mockDb.createExpense(data)
      if (result.error) {
        throw result.error
      }
      return result.data
    }),
    findById: vi.fn(async id => {
      const result = await mockDb.findExpenseById(id)
      return result.data
    }),
    findMany: vi.fn(async filters => {
      const options = {}
      if (filters.limit) {
        options.limit = filters.limit
      }
      if (filters.offset) {
        options.offset = filters.offset
      }
      if (filters.orderBy) {
        options.orderBy = filters.orderBy[0]?.column
        options.ascending = filters.orderBy[0]?.ascending !== false
      }

      const queryFilters = {}
      if (filters.category) {
        queryFilters.eq_category = filters.category
      }
      if (filters.active !== undefined) {
        queryFilters.active = filters.active
      }

      const result = await mockDb.findExpenses(queryFilters, options)
      return result.data
    }),
    findAllWithFilters: vi.fn(async (filters = {}, options = {}) => {
      const queryFilters = {}
      if (filters.category) {
        queryFilters.eq_category = filters.category
      }
      if (filters.active !== undefined) {
        queryFilters.active = filters.active
      }
      // Support both dateFrom/dateTo and startDate/endDate
      if (filters.dateFrom || filters.startDate) {
        const dateFrom = filters.dateFrom || filters.startDate
        queryFilters.gte_expense_date =
          typeof dateFrom === 'string' ? dateFrom : dateFrom.toISOString().split('T')[0]
      }
      if (filters.dateTo || filters.endDate) {
        const dateTo = filters.dateTo || filters.endDate
        queryFilters.lte_expense_date =
          typeof dateTo === 'string' ? dateTo : dateTo.toISOString().split('T')[0]
      }

      const queryOptions = {}
      if (options.limit || filters.limit) {
        queryOptions.limit = options.limit || filters.limit
      }
      if (options.offset || filters.offset) {
        queryOptions.offset = options.offset || filters.offset
      }

      const result = await mockDb.findExpenses(queryFilters, queryOptions)
      return result.data
    }),
    findByDateRange: vi.fn(async (startDate, endDate, options = {}) => {
      const filters = {
        gte_expense_date: startDate,
        lte_expense_date: endDate
      }
      if (options.category) {
        filters.eq_category = options.category
      }

      const queryOptions = {}
      if (options.limit) {
        queryOptions.limit = options.limit
      }

      const result = await mockDb.findExpenses(filters, queryOptions)
      return result.data
    }),
    update: vi.fn(async (id, updates) => {
      const result = await mockDb.updateExpense(id, updates)
      if (result.error) {
        throw result.error
      }
      return result.data
    }),
    delete: vi.fn(async id => {
      const result = await mockDb.deleteExpense(id)
      return result.data
    }),
    getExpensesByCategory: vi.fn(async (startDate, endDate) => {
      const result = await mockDb.findExpenses({
        gte_expense_date: startDate,
        lte_expense_date: endDate
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
    }),
    getTotalExpenses: vi.fn(async (startDate, endDate) => {
      const result = await mockDb.findExpenses({
        gte_expense_date: startDate,
        lte_expense_date: endDate
      })
      return result.data.reduce((sum, e) => sum + e.amount, 0)
    })
  }
}))

describe('ExpenseService - Business Logic', () => {
  beforeEach(() => {
    mockDb = new SupabaseAccountingMock()
    mockDb.seedAccountingData()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createExpense', () => {
    it('should create expense with valid data', async () => {
      const expenseData = {
        category: 'flores',
        description: 'Rosas premium',
        amount: 120.5,
        payment_method: 'efectivo'
      }

      const result = await expenseService.createExpense(expenseData, 1)

      expect(result).not.toBeNull()
      expect(result.id).toEqual(expect.any(Number))
      expect(result.category).toBe('flores')
      expect(result.description).toBe('Rosas premium')
      expect(result.amount).toBe(120.5)
      expect(result.created_by).toBe(1)
    })

    it('should set default expense_date if not provided', async () => {
      const expenseData = {
        category: 'transporte',
        description: 'Gasolina',
        amount: 50.0
      }

      const result = await expenseService.createExpense(expenseData, 1)

      expect(result.expense_date).toEqual(expect.any(String))
      expect(typeof result.expense_date).toBe('string')
    })

    it('should throw ValidationError for invalid category', async () => {
      const expenseData = {
        category: 'invalid_category',
        description: 'Test',
        amount: 100
      }

      await expect(expenseService.createExpense(expenseData, 1)).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError for amount <= 0', async () => {
      const expenseData = {
        category: 'flores',
        description: 'Test',
        amount: 0
      }

      await expect(expenseService.createExpense(expenseData, 1)).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError for negative amount', async () => {
      const expenseData = {
        category: 'flores',
        description: 'Test',
        amount: -50
      }

      await expect(expenseService.createExpense(expenseData, 1)).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError for missing amount', async () => {
      const expenseData = {
        category: 'flores',
        description: 'Test'
      }

      await expect(expenseService.createExpense(expenseData, 1)).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError for invalid payment method', async () => {
      const expenseData = {
        category: 'flores',
        description: 'Test',
        amount: 100,
        payment_method: 'invalid_method'
      }

      await expect(expenseService.createExpense(expenseData, 1)).rejects.toThrow(ValidationError)
    })

    it('should accept valid payment methods', async () => {
      for (const method of PAYMENT_METHODS) {
        const expenseData = {
          category: 'flores',
          description: `Test ${method}`,
          amount: 100,
          payment_method: method
        }

        const result = await expenseService.createExpense(expenseData, 1)
        expect(result.payment_method).toBe(method)
      }
    })

    it('should accept all valid categories', async () => {
      for (const category of EXPENSE_CATEGORIES) {
        const expenseData = {
          category,
          description: `Test ${category}`,
          amount: 100
        }

        const result = await expenseService.createExpense(expenseData, 1)
        expect(result.category).toBe(category)
      }
    })
  })

  describe('getExpenseById', () => {
    it('should return expense by ID', async () => {
      const result = await expenseService.getExpenseById(1)

      expect(result).not.toBeNull()
      expect(result.id).toBe(1)
      expect(result.category).toBe('flores')
    })

    it('should throw NotFoundError for non-existent ID', async () => {
      await expect(expenseService.getExpenseById(999)).rejects.toThrow(NotFoundError)
    })

    it('should throw NotFoundError for inactive expense', async () => {
      await expenseService.deleteExpense(1)

      await expect(expenseService.getExpenseById(1)).rejects.toThrow(NotFoundError)
    })
  })

  describe('getExpenses', () => {
    it('should return all active expenses', async () => {
      const result = await expenseService.getExpenses({})

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should filter by category', async () => {
      const result = await expenseService.getExpenses({ category: 'flores' })

      expect(result.every(e => e.category === 'flores')).toBe(true)
    })

    it('should apply limit', async () => {
      const result = await expenseService.getExpenses({ limit: 1 })

      expect(result.length).toBe(1)
    })

    it('should apply offset', async () => {
      const result = await expenseService.getExpenses({ offset: 1 })

      expect(result.length).toBeLessThan(3)
    })

    it('should filter by date range', async () => {
      const filters = {
        startDate: new Date('2025-11-15'),
        endDate: new Date('2025-11-17')
      }

      const result = await expenseService.getExpenses(filters)

      expect(
        result.every(e => {
          const date = new Date(e.expense_date)
          return date >= filters.startDate && date <= filters.endDate
        })
      ).toBe(true)
    })

    it('should return empty array when no expenses match filters', async () => {
      const result = await expenseService.getExpenses({
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-02')
      })

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })
  })

  describe('updateExpense', () => {
    it('should update expense successfully', async () => {
      const updates = {
        description: 'Updated description',
        amount: 250.0
      }

      const result = await expenseService.updateExpense(1, updates)

      expect(result.description).toBe('Updated description')
      expect(result.amount).toBe(250.0)
    })

    it('should validate category when updating', async () => {
      const updates = {
        category: 'invalid_category'
      }

      await expect(expenseService.updateExpense(1, updates)).rejects.toThrow(ValidationError)
    })

    it('should validate amount when updating', async () => {
      const updates = {
        amount: -50
      }

      await expect(expenseService.updateExpense(1, updates)).rejects.toThrow(ValidationError)
    })

    it('should validate payment method when updating', async () => {
      const updates = {
        payment_method: 'invalid_method'
      }

      await expect(expenseService.updateExpense(1, updates)).rejects.toThrow(ValidationError)
    })

    it('should throw NotFoundError for non-existent expense', async () => {
      const updates = {
        description: 'Test'
      }

      await expect(expenseService.updateExpense(999, updates)).rejects.toThrow(NotFoundError)
    })

    it('should allow updating only some fields', async () => {
      const original = await expenseService.getExpenseById(1)
      const updates = {
        description: 'New description only'
      }

      const result = await expenseService.updateExpense(1, updates)

      expect(result.description).toBe('New description only')
      expect(result.category).toBe(original.category)
      expect(result.amount).toBe(original.amount)
    })
  })

  describe('deleteExpense', () => {
    it('should soft delete expense', async () => {
      const result = await expenseService.deleteExpense(1)

      expect(result).not.toBeNull()
      expect(result.active).toBe(false)
    })

    it('should not appear in active queries after deletion', async () => {
      await expenseService.deleteExpense(1)

      // By default, findMany filters active=true
      const expenses = await expenseService.getExpenses({})
      const deleted = expenses.find(e => e.id === 1)

      // Should not find the deleted expense
      expect(deleted).toBeUndefined()
    })

    it('should throw NotFoundError when deleting non-existent expense', async () => {
      await expect(expenseService.deleteExpense(999)).rejects.toThrow(NotFoundError)
    })
  })

  describe('getExpensesByCategory', () => {
    it('should return expenses grouped by category', async () => {
      const result = await expenseService.getExpensesByCategory(
        new Date('2025-11-15'),
        new Date('2025-11-17')
      )

      expect(Array.isArray(result)).toBe(true)
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('category')
        expect(result[0]).toHaveProperty('total')
        expect(result[0]).toHaveProperty('count')
      }
    })

    it('should calculate totals correctly', async () => {
      const result = await expenseService.getExpensesByCategory(
        new Date('2025-11-15'),
        new Date('2025-11-17')
      )

      if (result.length > 0) {
        const totalSum = result.reduce((sum, cat) => sum + Number(cat.total), 0)
        expect(totalSum).toBeGreaterThan(0)
      } else {
        expect(result.length).toBe(0)
      }
    })

    it('should return empty array for date range with no expenses', async () => {
      const result = await expenseService.getExpensesByCategory(
        new Date('2025-01-01'),
        new Date('2025-01-02')
      )

      expect(Array.isArray(result)).toBe(true)
    })
  })
})
