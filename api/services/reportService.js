/**
 * Report Service
 * Business logic for accounting reports
 * @module services/reportService
 */

import { supabase } from './supabaseClient.js'
import expenseRepository from '../repositories/expenseRepository.js'
import { logger } from '../utils/logger.js'
import { AppError } from '../errors/AppError.js'

class ReportService {
  /**
   * Get daily sales from orders
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Daily sales data
   */
  async getDailySales(startDate, endDate) {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('created_at, total, status')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .in('status', ['confirmed', 'processing', 'delivering', 'delivered'])

      if (error) {throw error}

      // Group by date
      const salesByDate = {}
      data.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0]
        if (!salesByDate[date]) {
          salesByDate[date] = {
            date,
            total: 0,
            count: 0
          }
        }
        salesByDate[date].total += parseFloat(order.total)
        salesByDate[date].count += 1
      })

      return Object.values(salesByDate).sort((a, b) => new Date(b.date) - new Date(a.date))
    } catch (error) {
      logger.error('Error getting daily sales', { error })
      throw new AppError('Failed to get sales data', 500, { originalError: error.message })
    }
  }

  /**
   * Get weekly report
   * @param {Date} weekStart - Week start date (Monday)
   * @returns {Promise<Object>} Weekly report
   */
  async getWeeklyReport(weekStart) {
    try {
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const [sales, expenses] = await Promise.all([
        this.getDailySales(weekStart, weekEnd),
        expenseRepository.findByDateRange(weekStart, weekEnd)
      ])

      // Calculate totals
      const totalSales = sales.reduce((sum, day) => sum + day.total, 0)
      const totalOrders = sales.reduce((sum, day) => sum + day.count, 0)
      const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
      const netProfit = totalSales - totalExpenses
      const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0

      // Group expenses by category
      const expensesByCategory = expenses.reduce((acc, exp) => {
        if (!acc[exp.category]) {
          acc[exp.category] = 0
        }
        acc[exp.category] += parseFloat(exp.amount)
        return acc
      }, {})

      return {
        period: {
          start: weekStart,
          end: weekEnd,
          type: 'weekly'
        },
        sales: {
          total: parseFloat(totalSales.toFixed(2)),
          orders: totalOrders,
          averageTicket: totalOrders > 0 ? parseFloat((totalSales / totalOrders).toFixed(2)) : 0,
          daily: sales
        },
        expenses: {
          total: parseFloat(totalExpenses.toFixed(2)),
          byCategory: expensesByCategory,
          count: expenses.length
        },
        profit: {
          net: parseFloat(netProfit.toFixed(2)),
          margin: parseFloat(profitMargin.toFixed(2))
        }
      }
    } catch (error) {
      logger.error('Error getting weekly report', { error, weekStart })
      throw new AppError('Failed to generate weekly report', 500, { originalError: error.message })
    }
  }

  /**
   * Get monthly report
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Promise<Object>} Monthly report
   */
  async getMonthlyReport(year, month) {
    try {
      const monthStart = new Date(year, month - 1, 1)
      const monthEnd = new Date(year, month, 0) // Last day of month

      const [sales, expenses] = await Promise.all([
        this.getDailySales(monthStart, monthEnd),
        expenseRepository.findByDateRange(monthStart, monthEnd)
      ])

      // Calculate totals
      const totalSales = sales.reduce((sum, day) => sum + day.total, 0)
      const totalOrders = sales.reduce((sum, day) => sum + day.count, 0)
      const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
      const netProfit = totalSales - totalExpenses
      const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0

      // Group expenses by category
      const expensesByCategory = expenses.reduce((acc, exp) => {
        if (!acc[exp.category]) {
          acc[exp.category] = 0
        }
        acc[exp.category] += parseFloat(exp.amount)
        return acc
      }, {})

      // Get top products
      const topProducts = await this.getTopProducts(monthStart, monthEnd, 5)

      return {
        period: {
          year,
          month,
          start: monthStart,
          end: monthEnd,
          type: 'monthly'
        },
        sales: {
          total: parseFloat(totalSales.toFixed(2)),
          orders: totalOrders,
          averageTicket: totalOrders > 0 ? parseFloat((totalSales / totalOrders).toFixed(2)) : 0,
          averageDaily: parseFloat((totalSales / sales.length).toFixed(2)),
          daily: sales
        },
        expenses: {
          total: parseFloat(totalExpenses.toFixed(2)),
          byCategory: expensesByCategory,
          count: expenses.length,
          averageDaily: parseFloat((totalExpenses / sales.length).toFixed(2))
        },
        profit: {
          net: parseFloat(netProfit.toFixed(2)),
          margin: parseFloat(profitMargin.toFixed(2))
        },
        topProducts
      }
    } catch (error) {
      logger.error('Error getting monthly report', { error, year, month })
      throw new AppError('Failed to generate monthly report', 500, { originalError: error.message })
    }
  }

  /**
   * Get top selling products
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {number} limit - Number of products to return
   * @returns {Promise<Array>} Top products
   */
  async getTopProducts(startDate, endDate, limit = 5) {
    try {
      // Get orders in date range
      const { data: orders, error: ordersError } = await supabaseClient
        .from('orders')
        .select('id')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .in('status', ['confirmed', 'processing', 'delivering', 'delivered'])

      if (ordersError) {throw ordersError}

      const orderIds = orders.map(o => o.id)

      if (orderIds.length === 0) {
        return []
      }

      // Get order items for these orders
      const { data: items, error: itemsError } = await supabaseClient
        .from('order_items')
        .select('product_name, quantity, subtotal')
        .in('order_id', orderIds)

      if (itemsError) {throw itemsError}

      // Aggregate by product
      const productStats = items.reduce((acc, item) => {
        if (!acc[item.product_name]) {
          acc[item.product_name] = {
            name: item.product_name,
            quantity: 0,
            revenue: 0
          }
        }
        acc[item.product_name].quantity += item.quantity
        acc[item.product_name].revenue += parseFloat(item.subtotal)
        return acc
      }, {})

      // Sort by revenue and limit
      return Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit)
        .map(p => ({
          ...p,
          revenue: parseFloat(p.revenue.toFixed(2))
        }))
    } catch (error) {
      logger.error('Error getting top products', { error })
      return []
    }
  }

  /**
   * Get dashboard summary
   * @returns {Promise<Object>} Dashboard summary (last 7 days)
   */
  async getDashboardSummary() {
    try {
      const today = new Date()
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)

      const [sales, expenses] = await Promise.all([
        this.getDailySales(weekAgo, today),
        expenseRepository.findByDateRange(weekAgo, today)
      ])

      const totalSales = sales.reduce((sum, day) => sum + day.total, 0)
      const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
      const netProfit = totalSales - totalExpenses

      // Get recent expenses
      const recentExpenses = expenses.slice(0, 5)

      return {
        period: 'last_7_days',
        sales: parseFloat(totalSales.toFixed(2)),
        expenses: parseFloat(totalExpenses.toFixed(2)),
        profit: parseFloat(netProfit.toFixed(2)),
        recentExpenses: recentExpenses.map(exp => ({
          id: exp.id,
          category: exp.category,
          description: exp.description,
          amount: parseFloat(exp.amount),
          date: exp.expense_date
        }))
      }
    } catch (error) {
      logger.error('Error getting dashboard summary', { error })
      throw new AppError('Failed to get dashboard summary', 500, { originalError: error.message })
    }
  }
}

export default new ReportService()
