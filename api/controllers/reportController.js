/**
 * Report Controller
 * Handles HTTP requests for accounting reports
 * @module controllers/reportController
 */

import reportService from '../services/reportService.js'
import { logger } from '../utils/logger.js'

class ReportController {
  /**
   * Get weekly report
   * GET /api/reports/weekly?weekStart=2025-11-18
   */
  async getWeeklyReport(req, res, next) {
    try {
      const { weekStart } = req.query

      if (!weekStart) {
        return res.status(400).json({
          success: false,
          error: 'weekStart parameter is required (YYYY-MM-DD format)'
        })
      }

      const report = await reportService.getWeeklyReport(new Date(weekStart))

      res.json({
        success: true,
        data: report
      })
    } catch (error) {
      logger.error('Error in getWeeklyReport controller', { error })
      next(error)
    }
  }

  /**
   * Get monthly report
   * GET /api/reports/monthly?year=2025&month=11
   */
  async getMonthlyReport(req, res, next) {
    try {
      const { year, month } = req.query

      if (!year || !month) {
        return res.status(400).json({
          success: false,
          error: 'year and month parameters are required'
        })
      }

      const report = await reportService.getMonthlyReport(parseInt(year), parseInt(month))

      res.json({
        success: true,
        data: report
      })
    } catch (error) {
      logger.error('Error in getMonthlyReport controller', { error })
      next(error)
    }
  }

  /**
   * Get dashboard summary
   * GET /api/reports/dashboard
   */
  async getDashboardSummary(req, res, next) {
    try {
      const summary = await reportService.getDashboardSummary()

      res.json({
        success: true,
        data: summary
      })
    } catch (error) {
      logger.error('Error in getDashboardSummary controller', { error })
      next(error)
    }
  }

  /**
   * Get current week report (helper)
   * GET /api/reports/current-week
   */
  async getCurrentWeekReport(req, res, next) {
    try {
      // Get Monday of current week
      const today = new Date()
      const dayOfWeek = today.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Adjust for Sunday
      const monday = new Date(today)
      monday.setDate(today.getDate() + diff)
      monday.setHours(0, 0, 0, 0)

      const report = await reportService.getWeeklyReport(monday)

      res.json({
        success: true,
        data: report
      })
    } catch (error) {
      logger.error('Error in getCurrentWeekReport controller', { error })
      next(error)
    }
  }

  /**
   * Get current month report (helper)
   * GET /api/reports/current-month
   */
  async getCurrentMonthReport(req, res, next) {
    try {
      const today = new Date()
      const year = today.getFullYear()
      const month = today.getMonth() + 1

      const report = await reportService.getMonthlyReport(year, month)

      res.json({
        success: true,
        data: report
      })
    } catch (error) {
      logger.error('Error in getCurrentMonthReport controller', { error })
      next(error)
    }
  }
}

export default new ReportController()
