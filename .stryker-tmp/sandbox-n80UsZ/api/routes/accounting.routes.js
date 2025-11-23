/**
 * Accounting Routes
 * Routes for expenses and reports
 * @module routes/accounting
 */
// @ts-nocheck

import express from 'express'
import expenseController from '../controllers/expenseController.js'
import reportController from '../controllers/reportController.js'
import * as categoryController from '../controllers/expenseCategoryController.js'
import { authenticate } from '../middleware/auth/auth.middleware.js'
import requireAdmin from '../middleware/auth/requireAdmin.js'
import { uploadReceipt, handleReceiptUploadError } from '../middleware/utilities/uploadReceipt.js'

const router = express.Router()

// All accounting routes require authentication AND admin role
router.use(authenticate)
router.use(requireAdmin)

// ============================================================================
// CATEGORY ROUTES
// ============================================================================

/**
 * @route   GET /api/accounting/categories
 * @desc    Get all expense categories
 * @query   includeInactive - Include inactive categories
 * @access  Admin only
 */
router.get('/categories', categoryController.getAllCategories)

/**
 * @route   POST /api/accounting/categories
 * @desc    Create new category
 * @access  Admin only
 */
router.post('/categories', categoryController.createCategory)

/**
 * @route   GET /api/accounting/categories/:id
 * @desc    Get category by ID
 * @access  Admin only
 */
router.get('/categories/:id', categoryController.getCategoryById)

/**
 * @route   PUT /api/accounting/categories/:id
 * @desc    Update category
 * @access  Admin only
 */
router.put('/categories/:id', categoryController.updateCategory)

/**
 * @route   DELETE /api/accounting/categories/:id
 * @desc    Delete category (soft delete)
 * @access  Admin only
 */
router.delete('/categories/:id', categoryController.deleteCategory)

// ============================================================================
// EXPENSE ROUTES
// ============================================================================

/**
 * @route   POST /api/accounting/expenses
 * @desc    Create new expense (with optional receipt upload)
 * @access  Admin only
 */
router.post('/expenses', uploadReceipt, handleReceiptUploadError, expenseController.create)

/**
 * @route   GET /api/accounting/expenses
 * @desc    Get all expenses (with optional filters)
 * @query   startDate, endDate, category, limit, offset
 * @access  Admin only
 */
router.get('/expenses', expenseController.getAll)

/**
 * @route   GET /api/accounting/expenses/by-category
 * @desc    Get expenses grouped by category
 * @query   startDate, endDate (required)
 * @access  Admin only
 */
router.get('/expenses/by-category', expenseController.getByCategory)

/**
 * @route   GET /api/accounting/expenses/:id
 * @desc    Get expense by ID
 * @access  Admin only
 */
router.get('/expenses/:id', expenseController.getById)

/**
 * @route   PUT /api/accounting/expenses/:id
 * @desc    Update expense (with optional new receipt upload)
 * @access  Admin only
 */
router.put('/expenses/:id', uploadReceipt, handleReceiptUploadError, expenseController.update)

/**
 * @route   DELETE /api/accounting/expenses/:id
 * @desc    Delete expense
 * @access  Admin only
 */
router.delete('/expenses/:id', expenseController.delete)

// ============================================================================
// REPORT ROUTES
// ============================================================================

/**
 * @route   GET /api/accounting/reports/dashboard
 * @desc    Get dashboard summary (last 7 days)
 * @access  Admin only
 */
router.get('/reports/dashboard', reportController.getDashboardSummary)

/**
 * @route   GET /api/accounting/reports/weekly
 * @desc    Get weekly report
 * @query   weekStart (YYYY-MM-DD) - Monday of the week
 * @access  Admin only
 */
router.get('/reports/weekly', reportController.getWeeklyReport)

/**
 * @route   GET /api/accounting/reports/current-week
 * @desc    Get current week report (helper)
 * @access  Admin only
 */
router.get('/reports/current-week', reportController.getCurrentWeekReport)

/**
 * @route   GET /api/accounting/reports/monthly
 * @desc    Get monthly report
 * @query   year, month (1-12)
 * @access  Admin only
 */
router.get('/reports/monthly', reportController.getMonthlyReport)

/**
 * @route   GET /api/accounting/reports/current-month
 * @desc    Get current month report (helper)
 * @access  Admin only
 */
router.get('/reports/current-month', reportController.getCurrentMonthReport)

export default router
