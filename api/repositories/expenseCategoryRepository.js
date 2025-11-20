/**
 * Expense Category Repository
 * Database access layer for expense categories
 * @module repositories/expenseCategoryRepository
 */

import { supabase } from '../services/supabaseClient.js'
import { logger } from '../utils/logger.js'
import { DatabaseError } from '../errors/AppError.js'

class ExpenseCategoryRepository {
  /**
   * Find all categories
   * @param {Object} options - Query options
   * @param {boolean} options.includeInactive - Include inactive categories
   * @returns {Promise<Array>} List of categories
   */
  async findAll({ includeInactive = false } = {}) {
    try {
      let query = supabase.from('expense_categories').select('*').order('name', { ascending: true })

      if (!includeInactive) {
        query = query.eq('active', true)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }
      return data || []
    } catch (error) {
      logger.error('ExpenseCategoryRepository.findAll error:', error)
      throw new DatabaseError(`Failed to fetch categories: ${error.message}`)
    }
  }

  /**
   * Find category by ID
   * @param {number} id - Category ID
   * @returns {Promise<Object|null>} Category or null
   */
  async findById(id) {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('id', id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }
      return data
    } catch (error) {
      logger.error(`ExpenseCategoryRepository.findById(${id}) error:`, error)
      throw new DatabaseError(`Failed to fetch category: ${error.message}`)
    }
  }

  /**
   * Find category by name
   * @param {string} name - Category name
   * @returns {Promise<Object|null>} Category or null
   */
  async findByName(name) {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('name', name)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }
      return data
    } catch (error) {
      logger.error(`ExpenseCategoryRepository.findByName(${name}) error:`, error)
      throw new DatabaseError(`Failed to fetch category: ${error.message}`)
    }
  }

  /**
   * Create new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category
   */
  async create(categoryData) {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .insert([categoryData])
        .select()
        .single()

      if (error) {
        throw error
      }
      return data
    } catch (error) {
      logger.error('ExpenseCategoryRepository.create error:', error)
      throw new DatabaseError(`Failed to create category: ${error.message}`)
    }
  }

  /**
   * Update category
   * @param {number} id - Category ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated category
   */
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }
      return data
    } catch (error) {
      logger.error(`ExpenseCategoryRepository.update(${id}) error:`, error)
      throw new DatabaseError(`Failed to update category: ${error.message}`)
    }
  }

  /**
   * Soft delete category (only if not default)
   * @param {number} id - Category ID
   * @returns {Promise<Object>} Deleted category
   */
  async delete(id) {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .update({ active: false })
        .eq('id', id)
        .eq('is_default', false) // Cannot delete default categories
        .select()
        .single()

      if (error) {
        throw error
      }
      return data
    } catch (error) {
      logger.error(`ExpenseCategoryRepository.delete(${id}) error:`, error)
      throw new DatabaseError(`Failed to delete category: ${error.message}`)
    }
  }
}

export default new ExpenseCategoryRepository()
