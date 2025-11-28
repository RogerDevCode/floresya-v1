/**
 * Expense Category Controller
 * RESTful API endpoints for expense category management
 * @module controllers/expenseCategoryController
 */

import * as expenseCategoryService from '../services/expenseCategoryService.js'
import { asyncHandler } from '../middleware/error/index.js'

/**
 * Get all expense categories
 * @route GET /api/accounting/categories
 */
export const getAllCategories = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true'
  const categories = await expenseCategoryService.getAllCategories({ includeInactive })

  res.json({
    success: true,
    data: categories,
    message: 'Categories retrieved successfully'
  })
})

/**
 * Get category by ID
 * @route GET /api/accounting/categories/:id
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const category = await expenseCategoryService.getCategoryById(parseInt(id))

  res.json({
    success: true,
    data: category,
    message: 'Category retrieved successfully'
  })
})

/**
 * Create new category (Admin only)
 * @route POST /api/accounting/categories
 */
export const createCategory = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const category = await expenseCategoryService.createCategory(req.body, userId)

  res.status(201).json({
    success: true,
    data: category,
    message: 'Category created successfully'
  })
})

/**
 * Update category (Admin only)
 * @route PUT /api/accounting/categories/:id
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  const category = await expenseCategoryService.updateCategory(parseInt(id), req.body)

  res.json({
    success: true,
    data: category,
    message: 'Category updated successfully'
  })
})

/**
 * Delete category (Admin only, soft delete)
 * @route DELETE /api/accounting/categories/:id
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  const category = await expenseCategoryService.deleteCategory(parseInt(id))

  res.json({
    success: true,
    data: category,
    message: 'Category deleted successfully'
  })
})
