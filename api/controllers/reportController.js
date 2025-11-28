/**
 * Report Controller
 * Handles HTTP requests for accounting reports
 * @module controllers/reportController
 */

import * as reportService from '../services/reportService.js'
import { asyncHandler } from '../middleware/error/index.js'
import { BadRequestError } from '../errors/AppError.js'

class ReportController {
  /**
   * Get weekly report
   * GET /api/reports/weekly?weekStart=2025-11-18
   */
  getWeeklyReport = asyncHandler(async (req, res) => {
    const { weekStart } = req.query

    if (!weekStart) {
      throw new BadRequestError('weekStart parameter is required (YYYY-MM-DD format)')
    }

    const report = await reportService.getWeeklyReport(new Date(weekStart))

    res.json({
      success: true,
      data: report
    })
  })

  /**
   * Get monthly report
   * GET /api/reports/monthly?year=2025&month=11
   */
  getMonthlyReport = asyncHandler(async (req, res) => {
    const { year, month } = req.query

    if (!year || !month) {
      throw new BadRequestError('year and month parameters are required')
    }

    const report = await reportService.getMonthlyReport(parseInt(year), parseInt(month))

    res.json({
      success: true,
      data: report
    })
  })

  /**
   * Get dashboard summary
   * GET /api/reports/dashboard
   */
  getDashboardSummary = asyncHandler(async (req, res) => {
    const summary = await reportService.getDashboardSummary()

    res.json({
      success: true,
      data: summary
    })
  })

  /**
   * Get current week report (helper)
   * GET /api/reports/current-week
   */
  getCurrentWeekReport = asyncHandler(async (req, res) => {
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
  })

  /**
   * Get current month report (helper)
   * GET /api/reports/current-month
   */
  getCurrentMonthReport = asyncHandler(async (req, res) => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1

    const report = await reportService.getMonthlyReport(year, month)

    res.json({
      success: true,
      data: report
    })
  })
}

export default new ReportController()
