/**
 * Expense Category Controller
 * RESTful API endpoints for expense category management
 * @module controllers/expenseCategoryController
 */
// @ts-nocheck

import expenseCategoryService from '../services/expenseCategoryService.js'
import { logger } from '../utils/logger.js'

/**
 * Get all expense categories
 * @route GET /api/accounting/categories
 */
export const getAllCategories = async (req, res, next) => {
  try {
    const includeInactive = req.query.includeInactive === 'true'
    const categories = await expenseCategoryService.getAllCategories({ includeInactive })

    res.json({
      success: true,
      data: categories,
      message: 'Categories retrieved successfully'
    })
  } catch (error) {
    logger.error('getAllCategories error:', error)
    next(error)
  }
}

/**
 * Get category by ID
 * @route GET /api/accounting/categories/:id
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params
    const category = await expenseCategoryService.getCategoryById(parseInt(id))

    res.json({
      success: true,
      data: category,
      message: 'Category retrieved successfully'
    })
  } catch (error) {
    logger.error('getCategoryById error:', error)
    next(error)
  }
}

/**
 * Create new category (Admin only)
 * @route POST /api/accounting/categories
 */
export const createCategory = async (req, res, next) => {
  try {
    const userId = req.user.id
    const category = await expenseCategoryService.createCategory(req.body, userId)

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    })
  } catch (error) {
    logger.error('createCategory error:', error)
    next(error)
  }
}

/**
 * Update category (Admin only)
 * @route PUT /api/accounting/categories/:id
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params
    const category = await expenseCategoryService.updateCategory(parseInt(id), req.body)

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    })
  } catch (error) {
    logger.error('updateCategory error:', error)
    next(error)
  }
}

/**
 * Delete category (Admin only, soft delete)
 * @route DELETE /api/accounting/categories/:id
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params
    const category = await expenseCategoryService.deleteCategory(parseInt(id))

    res.json({
      success: true,
      data: category,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    logger.error('deleteCategory error:', error)
    next(error)
  }
}
