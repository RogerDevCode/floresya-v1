/**
 * Expense Category Service
 * Business logic for expense category management
 * @module services/expenseCategoryService
 */

import expenseCategoryRepository from '../repositories/expenseCategoryRepository.js'
import { NotFoundError, ValidationError, ConflictError } from '../errors/AppError.js'
import { withErrorMapping } from '../middleware/error/index.js'
// import { logger } from '../utils/logger.js'

/**
 * Get all categories
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of categories
 */
export const getAllCategories = withErrorMapping(
  async ({ includeInactive = false } = {}) => {
    return await expenseCategoryRepository.findAll({ includeInactive })
  },
  'SELECT',
  'expense_categories'
)

/**
 * Get category by ID
 * @param {number} id - Category ID
 * @returns {Promise<Object>} Category
 */
export const getCategoryById = withErrorMapping(
  async id => {
    const category = await expenseCategoryRepository.findById(id)
    if (!category) {
      throw new NotFoundError(`Category with ID ${id} not found`)
    }
    return category
  },
  'SELECT',
  'expense_categories'
)

/**
 * Create new category
 * @param {Object} categoryData - Category data
 * @param {number} userId - User creating the category
 * @returns {Promise<Object>} Created category
 */
export const createCategory = withErrorMapping(
  async (categoryData, userId) => {
    // Validate required fields
    if (!categoryData.name?.trim()) {
      throw new ValidationError('Category name is required')
    }

    // Validate name format (lowercase, no spaces)
    const name = categoryData.name.toLowerCase().trim().replace(/\s+/g, '_')
    if (!/^[a-z0-9_]+$/.test(name)) {
      throw new ValidationError(
        'Category name must contain only lowercase letters, numbers, and underscores'
      )
    }

    // Check if category already exists
    const existing = await expenseCategoryRepository.findByName(name)
    if (existing) {
      throw new ConflictError(`Category "${name}" already exists`)
    }

    // Validate color (hex format)
    if (categoryData.color && !/^#[0-9A-Fa-f]{6}$/.test(categoryData.color)) {
      throw new ValidationError('Invalid color format. Use hex format (e.g., #ec4899)')
    }

    const newCategory = {
      name,
      description: categoryData.description?.trim() || null,
      icon: categoryData.icon?.trim() || '📁',
      color: categoryData.color || '#6b7280',
      is_default: false,
      active: true,
      created_by: userId
    }

    return await expenseCategoryRepository.create(newCategory)
  },
  'INSERT',
  'expense_categories'
)

/**
 * Update category
 * @param {number} id - Category ID
 * @param {Object} updates - Update data
 * @returns {Promise<Object>} Updated category
 */
export const updateCategory = withErrorMapping(
  async (id, updates) => {
    // Verify category exists
    const category = await expenseCategoryRepository.findById(id)
    if (!category) {
      throw new NotFoundError(`Category with ID ${id} not found`)
    }

    // Cannot modify default categories' core attributes
    if (category.is_default && (updates.name || updates.is_default === false)) {
      throw new ValidationError('Cannot modify name or default status of system categories')
    }

    // Validate name if provided
    if (updates.name) {
      const name = updates.name.toLowerCase().trim().replace(/\s+/g, '_')
      if (!/^[a-z0-9_]+$/.test(name)) {
        throw new ValidationError(
          'Category name must contain only lowercase letters, numbers, and underscores'
        )
      }

      // Check for duplicates
      const existing = await expenseCategoryRepository.findByName(name)
      if (existing && existing.id !== id) {
        throw new ConflictError(`Category "${name}" already exists`)
      }
      updates.name = name
    }

    // Validate color if provided
    if (updates.color && !/^#[0-9A-Fa-f]{6}$/.test(updates.color)) {
      throw new ValidationError('Invalid color format. Use hex format (e.g., #ec4899)')
    }

    const allowedUpdates = {
      description: updates.description?.trim(),
      icon: updates.icon?.trim(),
      color: updates.color,
      active: updates.active
    }

    if (updates.name && !category.is_default) {
      allowedUpdates.name = updates.name
    }

    return await expenseCategoryRepository.update(id, allowedUpdates)
  },
  'UPDATE',
  'expense_categories'
)

/**
 * Delete category (soft delete)
 * @param {number} id - Category ID
 * @returns {Promise<Object>} Deleted category
 */
export const deleteCategory = withErrorMapping(
  async id => {
    const category = await expenseCategoryRepository.findById(id)
    if (!category) {
      throw new NotFoundError(`Category with ID ${id} not found`)
    }

    if (category.is_default) {
      throw new ValidationError('Cannot delete system default categories')
    }

    return await expenseCategoryRepository.delete(id)
  },
  'DELETE',
  'expense_categories'
)
