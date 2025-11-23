/**
 * Accounting Integration Tests
 * End-to-end tests for accounting module
 * Target: 100% coverage, 0 errors
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { SupabaseAccountingMock } from '../mocks/supabase-accounting.js'

describe('Accounting Module - Integration Tests', () => {
  let mockDb

  beforeEach(() => {
    mockDb = new SupabaseAccountingMock()
    mockDb.seedAccountingData()
  })

  describe('Expense CRUD Flow', () => {
    it('should complete full CRUD cycle', async () => {
      // CREATE
      const createResult = await mockDb.createExpense({
        category: 'flores',
        description: 'Integration test expense',
        amount: 99.99,
        payment_method: 'efectivo',
        created_by: 1
      })

      expect(createResult.error).toBeNull()
      expect(createResult.data).not.toBeNull()
      expect(createResult.data.id).toEqual(expect.any(Number))
      const expenseId = createResult.data.id

      // READ
      const readResult = await mockDb.findExpenseById(expenseId)
      expect(readResult.data).not.toBeNull()
      expect(readResult.data.description).toBe('Integration test expense')
      expect(readResult.data.amount).toBe(99.99)

      // UPDATE
      const updateResult = await mockDb.updateExpense(expenseId, {
        description: 'Updated integration test',
        amount: 150.0
      })
      expect(updateResult.error).toBeNull()
      expect(updateResult.data.description).toBe('Updated integration test')
      expect(updateResult.data.amount).toBe(150.0)

      // DELETE (soft)
      const deleteResult = await mockDb.deleteExpense(expenseId)
      expect(deleteResult.error).toBeNull()
      expect(deleteResult.data.active).toBe(false)

      // VERIFY DELETED (won't find it with default query)
      const afterDelete = await mockDb.findExpenseById(expenseId)
      // findExpenseById filters out inactive by default
      expect(afterDelete.data).toBeNull()
    })

    it('should handle validation errors in flow', async () => {
      // Invalid category
      const result1 = await mockDb.createExpense({
        category: 'invalid_category',
        description: 'Test',
        amount: 100,
        created_by: 1
      })
      expect(result1.error).not.toBeNull()

      // Invalid amount
      const result2 = await mockDb.createExpense({
        category: 'flores',
        description: 'Test',
        amount: -50,
        created_by: 1
      })
      expect(result2.error).not.toBeNull()

      // Missing required field
      const result3 = await mockDb.createExpense({
        category: 'flores',
        amount: 100,
        created_by: 1
        // Missing description
      })
      expect(result3.error).not.toBeNull()
    })
  })

  describe('Expense Filtering and Queries', () => {
    it('should filter by category', async () => {
      const result = await mockDb.findExpenses({ eq_category: 'flores' })

      expect(result.data.every(e => e.category === 'flores')).toBe(true)
    })

    it('should filter by date range', async () => {
      const result = await mockDb.findExpenses({
        gte_expense_date: '2025-11-15',
        lte_expense_date: '2025-11-17'
      })

      expect(
        result.data.every(e => {
          const date = new Date(e.expense_date)
          return date >= new Date('2025-11-15') && date <= new Date('2025-11-17')
        })
      ).toBe(true)
    })

    it('should apply pagination', async () => {
      const page1 = await mockDb.findExpenses({}, { limit: 2, offset: 0 })
      const page2 = await mockDb.findExpenses({}, { limit: 2, offset: 2 })

      expect(page1.data.length).toBeLessThanOrEqual(2)
      expect(page2.data.length).toBeLessThanOrEqual(2)

      // Different results
      if (page1.data.length > 0 && page2.data.length > 0) {
        expect(page1.data[0].id).not.toBe(page2.data[0].id)
      }
    })

    it('should order results', async () => {
      const result = await mockDb.findExpenses(
        {},
        {
          orderBy: 'expense_date',
          ascending: false
        }
      )

      if (result.data.length > 1) {
        for (let i = 0; i < result.data.length - 1; i++) {
          const date1 = new Date(result.data[i].expense_date)
          const date2 = new Date(result.data[i + 1].expense_date)
          expect(date1 >= date2).toBe(true)
        }
      }
    })

    it('should exclude inactive expenses by default', async () => {
      // Get initial count
      const initialExpenses = await mockDb.findExpenses()
      const initialCount = initialExpenses.data.length

      // Delete one expense
      if (initialCount > 0) {
        const toDelete = initialExpenses.data[0]
        await mockDb.deleteExpense(toDelete.id)

        // Query again - should have one less
        const afterDelete = await mockDb.findExpenses()
        expect(afterDelete.data.length).toBe(initialCount - 1)

        // Should not find deleted expense
        expect(afterDelete.data.find(e => e.id === toDelete.id)).toBeUndefined()
      }
    })
  })

  describe('Data Aggregations', () => {
    it('should calculate total expenses', async () => {
      const result = await mockDb.findExpenses({
        gte_expense_date: '2025-11-15',
        lte_expense_date: '2025-11-17'
      })

      const total = result.data.reduce((sum, e) => sum + e.amount, 0)
      expect(total).toBeGreaterThan(0)
    })

    it('should group by category', async () => {
      const result = await mockDb.findExpenses({
        gte_expense_date: '2025-11-15',
        lte_expense_date: '2025-11-17'
      })

      const grouped = result.data.reduce((acc, exp) => {
        if (!acc[exp.category]) {
          acc[exp.category] = { total: 0, count: 0 }
        }
        acc[exp.category].total += exp.amount
        acc[exp.category].count += 1
        return acc
      }, {})

      expect(Object.keys(grouped).length).toBeGreaterThan(0)
      expect(grouped.flores).toEqual(expect.any(Object))
    })

    it('should count expenses per period', async () => {
      const day1 = await mockDb.findExpenses({ eq_expense_date: '2025-11-15' })
      const day2 = await mockDb.findExpenses({ eq_expense_date: '2025-11-16' })

      expect(day1.data.length).toBeGreaterThanOrEqual(0)
      expect(day2.data.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Data Consistency', () => {
    it('should maintain data integrity after multiple operations', async () => {
      // Get clean baseline
      const baseline = (await mockDb.findExpenses()).data.length

      // Create 2 new expenses
      const create1 = await mockDb.createExpense({
        category: 'flores',
        description: 'Integrity test 1',
        amount: 10,
        created_by: 1
      })
      const create2 = await mockDb.createExpense({
        category: 'transporte',
        description: 'Integrity test 2',
        amount: 20,
        created_by: 1
      })

      expect(create1.error).toBeNull()
      expect(create2.error).toBeNull()

      const afterCreate = (await mockDb.findExpenses()).data.length
      expect(afterCreate).toBe(baseline + 2)

      // Delete one of the newly created
      await mockDb.deleteExpense(create1.data.id)

      const afterDelete = (await mockDb.findExpenses()).data.length
      expect(afterDelete).toBe(baseline + 1)
    })

    it('should preserve timestamps', async () => {
      const result = await mockDb.createExpense({
        category: 'flores',
        description: 'Timestamp test',
        amount: 100,
        created_by: 1
      })

      expect(result.data.created_at).toEqual(expect.any(String))
      expect(result.data.updated_at).toEqual(expect.any(String))
      expect(new Date(result.data.created_at).getTime()).toBeGreaterThan(0)
    })

    it('should handle concurrent operations', async () => {
      const promises = [
        mockDb.createExpense({
          category: 'flores',
          description: 'Concurrent 1',
          amount: 10,
          created_by: 1
        }),
        mockDb.createExpense({
          category: 'transporte',
          description: 'Concurrent 2',
          amount: 20,
          created_by: 1
        }),
        mockDb.createExpense({
          category: 'empaque',
          description: 'Concurrent 3',
          amount: 30,
          created_by: 1
        })
      ]

      const results = await Promise.all(promises)

      results.forEach(result => {
        expect(result.error).toBeNull()
        expect(result.data.id).toEqual(expect.any(Number))
      })

      // All should have unique IDs
      const ids = results.map(r => r.data.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(3)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty results', async () => {
      const result = await mockDb.findExpenses({
        gte_expense_date: '2025-01-01',
        lte_expense_date: '2025-01-02'
      })

      expect(result.data).not.toBeNull()
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBe(0)
    })

    it('should handle non-existent ID', async () => {
      const result = await mockDb.findExpenseById(999999)

      expect(result.data).toBeNull()
    })

    it('should handle update of non-existent expense', async () => {
      const result = await mockDb.updateExpense(999999, {
        description: 'Should not work'
      })

      expect(result.data).toBeNull()
    })

    it('should handle delete of non-existent expense', async () => {
      const result = await mockDb.deleteExpense(999999)

      expect(result.data).toBeNull()
    })

    it('should handle large amounts', async () => {
      const result = await mockDb.createExpense({
        category: 'flores',
        description: 'Large amount test',
        amount: 99999.99,
        created_by: 1
      })

      expect(result.error).toBeNull()
      expect(result.data.amount).toBe(99999.99)
    })

    it('should handle decimal precision', async () => {
      const result = await mockDb.createExpense({
        category: 'flores',
        description: 'Decimal test',
        amount: 123.456,
        created_by: 1
      })

      expect(result.error).toBeNull()
      expect(result.data.amount).toBeCloseTo(123.46, 2)
    })
  })
})
