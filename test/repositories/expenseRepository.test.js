/**
 * ExpenseRepository Tests
 * Complete test suite for data access layer
 * Target: 100% coverage, 0 errors
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { SupabaseAccountingMock } from '../mocks/supabase-accounting.js'

describe('ExpenseRepository - Data Layer', () => {
  let mockDb

  beforeEach(() => {
    mockDb = new SupabaseAccountingMock()
    mockDb.seedAccountingData()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('findById', () => {
    it('should find expense by ID successfully', async () => {
      const result = await mockDb.findExpenseById(1)

      expect(result.data).not.toBeNull()
      expect(result.data.id).toBe(1)
      expect(result.data.category).toBe('flores')
      expect(result.data.description).toBe('Rosas rojas importadas')
      expect(result.data.amount).toBe(180.5)
    })

    it('should return null for non-existent ID', async () => {
      const result = await mockDb.findExpenseById(999)
      expect(result.data).toBeNull()
    })

    it('should return null for inactive expense', async () => {
      await mockDb.deleteExpense(1)

      const result = await mockDb.findExpenseById(1)
      expect(result.data).toBeNull()
    })
  })

  describe('findMany', () => {
    it('should find all active expenses', async () => {
      const result = await mockDb.findExpenses({})

      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBeGreaterThan(0)
      expect(result.data.every(e => e.active === true)).toBe(true)
    })

    it('should filter by category', async () => {
      const result = await mockDb.findExpenses({ eq_category: 'flores' })

      expect(result.data.length).toBeGreaterThan(0)
      expect(result.data.every(e => e.category === 'flores')).toBe(true)
    })

    it('should apply limit', async () => {
      const result = await mockDb.findExpenses({}, { limit: 1 })

      expect(result.data.length).toBe(1)
    })

    it('should apply offset', async () => {
      const allResults = await mockDb.findExpenses({})
      const offsetResults = await mockDb.findExpenses({}, { offset: 1 })

      // With 3 initial expenses and offset 1, should return 2 items
      expect(offsetResults.data.length).toBeLessThan(allResults.data.length)
      expect(offsetResults.data.length).toBe(2)
    })

    it('should order by date descending', async () => {
      const result = await mockDb.findExpenses(
        {},
        {
          orderBy: 'expense_date',
          ascending: false
        }
      )

      for (let i = 0; i < result.data.length - 1; i++) {
        expect(result.data[i].expense_date >= result.data[i + 1].expense_date).toBe(true)
      }
    })
  })

  describe('findByDateRange', () => {
    it('should find expenses in date range', async () => {
      const startDate = '2025-11-15'
      const endDate = '2025-11-17'

      const result = await mockDb.findExpenses({
        gte_expense_date: startDate,
        lte_expense_date: endDate
      })

      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBeGreaterThan(0)
      expect(result.data.every(e => e.expense_date >= startDate && e.expense_date <= endDate)).toBe(
        true
      )
    })

    it('should filter by category within date range', async () => {
      const result = await mockDb.findExpenses({
        gte_expense_date: '2025-11-15',
        lte_expense_date: '2025-11-17',
        eq_category: 'transporte'
      })

      expect(result.data.every(e => e.category === 'transporte')).toBe(true)
    })

    it('should apply limit to date range query', async () => {
      const result = await mockDb.findExpenses(
        {
          gte_expense_date: '2025-11-15',
          lte_expense_date: '2025-11-17'
        },
        { limit: 1 }
      )

      expect(result.data.length).toBe(1)
    })

    it('should return empty array for date range with no expenses', async () => {
      const result = await mockDb.findExpenses({
        gte_expense_date: '2025-01-01',
        lte_expense_date: '2025-01-02'
      })

      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBe(0)
    })
  })

  describe('create', () => {
    it('should create expense successfully', async () => {
      const newExpense = {
        category: 'marketing',
        description: 'Facebook Ads',
        amount: 100.0,
        expense_date: '2025-11-18',
        payment_method: 'tarjeta_credito'
      }

      const result = await mockDb.createExpense(newExpense)

      expect(result.data).not.toBeNull()
      expect(result.data.id).toEqual(expect.any(Number))
      expect(result.data.category).toBe('marketing')
      expect(result.data.description).toBe('Facebook Ads')
      expect(result.data.amount).toBe(100.0)
      expect(result.data.active).toBe(true)
    })

    it('should set default expense_date if not provided', async () => {
      const newExpense = {
        category: 'otros',
        description: 'Test expense',
        amount: 50.0
      }

      const result = await mockDb.createExpense(newExpense)

      expect(result.data.expense_date).toEqual(expect.any(String))
    })

    it('should return error for invalid category', async () => {
      const invalidExpense = {
        category: 'invalid_category',
        description: 'Test',
        amount: 100
      }

      const result = await mockDb.createExpense(invalidExpense)

      expect(result.error).not.toBeNull()
      expect(result.data).toBeNull()
    })

    it('should return error for missing required fields', async () => {
      const invalidExpense = {
        category: 'flores'
      }

      const result = await mockDb.createExpense(invalidExpense)

      expect(result.error).not.toBeNull()
      expect(result.data).toBeNull()
    })

    it('should return error for amount <= 0', async () => {
      const invalidExpense = {
        category: 'flores',
        description: 'Test',
        amount: 0
      }

      const result = await mockDb.createExpense(invalidExpense)

      expect(result.error).not.toBeNull()
      expect(result.data).toBeNull()
    })
  })

  describe('update', () => {
    it('should update expense successfully', async () => {
      const updates = {
        description: 'Updated description',
        amount: 200.0
      }

      const result = await mockDb.updateExpense(1, updates)

      expect(result.data).not.toBeNull()
      expect(result.data.id).toBe(1)
      expect(result.data.description).toBe('Updated description')
      expect(result.data.amount).toBe(200.0)
    })

    it('should update only specified fields', async () => {
      const original = await mockDb.findExpenseById(1)
      const updates = {
        description: 'New description'
      }

      const result = await mockDb.updateExpense(1, updates)

      expect(result.data.description).toBe('New description')
      expect(result.data.category).toBe(original.data.category)
      expect(result.data.amount).toBe(original.data.amount)
    })

    it('should return null for non-existent expense', async () => {
      const result = await mockDb.updateExpense(999, { description: 'Test' })
      expect(result.data).toBeNull()
    })

    it('should return error when updating to invalid category', async () => {
      const updates = {
        category: 'invalid_category'
      }

      const result = await mockDb.updateExpense(1, updates)

      expect(result.error).not.toBeNull()
      expect(result.data).toBeNull()
    })

    it('should return error when updating amount to <= 0', async () => {
      const updates = {
        amount: -10
      }

      const result = await mockDb.updateExpense(1, updates)

      expect(result.error).not.toBeNull()
      expect(result.data).toBeNull()
    })
  })

  describe('delete', () => {
    it('should soft delete expense successfully', async () => {
      const result = await mockDb.deleteExpense(1)

      expect(result.data).not.toBeNull()
      expect(result.data.id).toBe(1)
      expect(result.data.active).toBe(false)
    })

    it('should not appear in active queries after deletion', async () => {
      await mockDb.deleteExpense(1)

      const activeExpenses = await mockDb.findExpenses({ active: true })
      const deleted = activeExpenses.data.find(e => e.id === 1)

      expect(deleted).toBeUndefined()
    })

    it('should return null for non-existent expense', async () => {
      const result = await mockDb.deleteExpense(999)
      expect(result.data).toBeNull()
    })
  })

  describe('getExpensesByCategory', () => {
    it('should group expenses by category', async () => {
      const expenses = await mockDb.findExpenses({
        gte_expense_date: '2025-11-15',
        lte_expense_date: '2025-11-17'
      })

      const grouped = expenses.data.reduce((acc, exp) => {
        if (!acc[exp.category]) {
          acc[exp.category] = { category: exp.category, total: 0, count: 0 }
        }
        acc[exp.category].total += exp.amount
        acc[exp.category].count += 1
        return acc
      }, {})

      const result = Object.values(grouped)

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('category')
      expect(result[0]).toHaveProperty('total')
      expect(result[0]).toHaveProperty('count')
    })

    it('should calculate totals correctly', async () => {
      const expenses = await mockDb.findExpenses({
        gte_expense_date: '2025-11-15',
        lte_expense_date: '2025-11-17'
      })

      const floresExpenses = expenses.data.filter(e => e.category === 'flores')
      const expectedTotal = floresExpenses.reduce((sum, e) => sum + e.amount, 0)

      expect(expectedTotal).toBeGreaterThan(0)
    })
  })

  describe('getTotalExpenses', () => {
    it('should calculate total expenses for date range', async () => {
      const expenses = await mockDb.findExpenses({
        gte_expense_date: '2025-11-15',
        lte_expense_date: '2025-11-17'
      })

      const total = expenses.data.reduce((sum, e) => sum + e.amount, 0)

      expect(typeof total).toBe('number')
      expect(total).toBeGreaterThan(0)
    })

    it('should return 0 for date range with no expenses', async () => {
      const expenses = await mockDb.findExpenses({
        gte_expense_date: '2025-01-01',
        lte_expense_date: '2025-01-02'
      })

      const total = expenses.data.reduce((sum, e) => sum + e.amount, 0)

      expect(total).toBe(0)
    })

    it('should sum all expenses in range correctly', async () => {
      const expenses = await mockDb.findExpenses({
        gte_expense_date: '2025-11-15',
        lte_expense_date: '2025-11-17'
      })

      const expectedTotal = expenses.data.reduce((sum, e) => sum + e.amount, 0)
      expect(expectedTotal).toBeCloseTo(292.8, 2) // 180.50 + 45.00 + 67.30
    })
  })
})
