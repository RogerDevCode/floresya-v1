/**
 * ReportService Tests
 * Business logic for accounting reports
 * Target: 100% coverage, 0 errors
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import reportService from '../../api/services/reportService.js'
import { AppError } from '../../api/errors/AppError.js'
import {
  resetAccountingData,
  seedAccountingData,
  findExpenses
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

// Mock supabase client
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabaseClient: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            in: vi.fn(() => ({
              data: [
                {
                  created_at: '2025-11-15T10:00:00Z',
                  total: '150.50',
                  status: 'delivered'
                },
                {
                  created_at: '2025-11-16T11:00:00Z',
                  total: '200.00',
                  status: 'confirmed'
                },
                {
                  created_at: '2025-11-16T15:00:00Z',
                  total: '75.25',
                  status: 'delivered'
                }
              ],
              error: null
            }))
          }))
        }))
      }))
    }))
  }
}))

// Mock expenseRepository
vi.mock('../../api/repositories/expenseRepository.js', () => ({
  default: {
    findByDateRange: vi.fn(async (startDate, endDate) => {
      const filters = {
        gte_expense_date: startDate.toISOString().split('T')[0],
        lte_expense_date: endDate.toISOString().split('T')[0]
      }
      const result = await findExpenses(filters)
      return result.data
    }),
    getTotalExpenses: vi.fn(async (startDate, endDate) => {
      const filters = {
        gte_expense_date: startDate.toISOString().split('T')[0],
        lte_expense_date: endDate.toISOString().split('T')[0]
      }
      const result = await findExpenses(filters)
      return result.data.reduce((sum, e) => sum + e.amount, 0)
    })
  }
}))

describe('ReportService - Accounting Reports', () => {
  beforeEach(() => {
    resetAccountingData()
    seedAccountingData()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getDailySales', () => {
    it('should return sales grouped by day', async () => {
      const startDate = new Date('2025-11-15')
      const endDate = new Date('2025-11-17')

      const result = await reportService.getDailySales(startDate, endDate)

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('date')
      expect(result[0]).toHaveProperty('total')
      expect(result[0]).toHaveProperty('count')
    })

    it('should calculate totals correctly', async () => {
      const startDate = new Date('2025-11-15')
      const endDate = new Date('2025-11-17')

      const result = await reportService.getDailySales(startDate, endDate)

      const totalSales = result.reduce((sum, day) => sum + day.total, 0)
      expect(totalSales).toBeGreaterThan(0)
    })

    it('should sort by date descending', async () => {
      const startDate = new Date('2025-11-15')
      const endDate = new Date('2025-11-17')

      const result = await reportService.getDailySales(startDate, endDate)

      if (result.length > 1) {
        const dates = result.map(r => new Date(r.date))
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i] >= dates[i + 1]).toBe(true)
        }
      }
    })
  })

  describe('getWeeklyReport', () => {
    it('should return complete weekly report', async () => {
      const weekStart = new Date('2025-11-11') // Monday

      const result = await reportService.getWeeklyReport(weekStart)

      expect(result).toHaveProperty('period')
      expect(result).toHaveProperty('sales')
      expect(result).toHaveProperty('expenses')
      expect(result).toHaveProperty('profit')
      expect(result.period.type).toBe('weekly')
    })

    it('should calculate profit correctly', async () => {
      const weekStart = new Date('2025-11-11')

      const result = await reportService.getWeeklyReport(weekStart)

      const expectedProfit = result.sales.total - result.expenses.total
      expect(result.profit.net).toBeCloseTo(expectedProfit, 2)
    })

    it('should calculate profit margin correctly', async () => {
      const weekStart = new Date('2025-11-11')

      const result = await reportService.getWeeklyReport(weekStart)

      if (result.sales.total > 0) {
        const expectedMargin = (result.profit.net / result.sales.total) * 100
        expect(result.profit.margin).toBeCloseTo(expectedMargin, 1)
      }
    })

    it('should handle week with sales', async () => {
      const weekStart = new Date('2025-11-11')

      const result = await reportService.getWeeklyReport(weekStart)

      expect(result.sales.total).toBeGreaterThanOrEqual(0)
      expect(result.expenses.total).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getMonthlyReport', () => {
    it('should return complete monthly report', async () => {
      const year = 2025
      const month = 11 // November (1-indexed)

      const result = await reportService.getMonthlyReport(year, month)

      expect(result).toHaveProperty('period')
      expect(result).toHaveProperty('sales')
      expect(result).toHaveProperty('expenses')
      expect(result).toHaveProperty('profit')
    })

    it('should have valid period', async () => {
      const year = 2025
      const month = 11

      const result = await reportService.getMonthlyReport(year, month)

      expect(result.period.type).toBe('monthly')
      expect(result.period.year).toBe(year)
      expect(result.period.month).toBe(month)
    })

    it('should calculate totals correctly', async () => {
      const year = 2025
      const month = 11

      const result = await reportService.getMonthlyReport(year, month)

      const expectedProfit = result.sales.total - result.expenses.total
      expect(result.profit.net).toBeCloseTo(expectedProfit, 2)
    })
  })
})
