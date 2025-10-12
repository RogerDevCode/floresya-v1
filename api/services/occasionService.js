/**
 * Occasion Service
 * Full CRUD operations with soft-delete (is_active flag)
 * Uses indexed slug column for SEO-friendly lookups
 * ENTERPRISE FAIL-FAST: Uses custom error classes with metadata
 */

import { supabase, DB_SCHEMA } from './supabaseClient.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  DatabaseConstraintError,
  BadRequestError,
  InternalServerError
} from '../errors/AppError.js'

const TABLE = DB_SCHEMA.occasions.table

/**
 * Validate occasion data (ENTERPRISE FAIL-FAST)
 * @param {Object} data - Occasion data to validate
 * @param {string} [data.name] - Occasion name (required for creation)
 * @param {string} [data.slug] - Occasion slug (required for creation, must be lowercase alphanumeric with hyphens)
 * @param {string} [data.description] - Occasion description
 * @param {number} [data.display_order] - Display order for sorting
 * @param {boolean} isUpdate - Whether this is for an update operation (default: false)
 * @throws {ValidationError} With detailed field-level validation errors
 * @example
 * // For creation
 * validateOccasionData({
 *   name: 'Día de la Madre',
 *   slug: 'dia-de-la-madre',
 *   display_order: 1
 * }, false)
 *
 * // For update
 * validateOccasionData({
 *   display_order: 2
 * }, true)
 */
function validateOccasionData(data, isUpdate = false) {
  const errors = {}

  if (!isUpdate) {
    if (!data.name || typeof data.name !== 'string') {
      errors.name = 'Name is required and must be a non-empty string'
    }
    if (!data.slug || typeof data.slug !== 'string') {
      errors.slug = 'Slug is required and must be a non-empty string'
    }
  }

  if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim() === '')) {
    errors.name = 'Name must be a non-empty string'
  }

  if (
    data.slug !== undefined &&
    (typeof data.slug !== 'string' || !/^[a-z0-9-]+$/.test(data.slug))
  ) {
    errors.slug = 'Slug must be lowercase alphanumeric with hyphens'
  }

  if (
    data.display_order !== undefined &&
    (typeof data.display_order !== 'number' || data.display_order < 0)
  ) {
    errors.display_order = 'Display order must be a non-negative number'
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Occasion validation failed', errors)
  }
}

/**
 * Get all occasions with filters - returns active occasions ordered by display_order
 * @param {Object} [filters={}] - Filter options
 * @param {number} [filters.limit] - Maximum number of occasions to return
 * @param {boolean} includeInactive - Include inactive occasions (default: false, admin only)
 * @returns {Object[]} - Array of occasions ordered by display_order
 * @throws {NotFoundError} When no occasions are found
 * @throws {DatabaseError} When database query fails
 */
export async function getAllOccasions(filters = {}, includeInactive = false) {
  try {
    let query = supabase.from(TABLE).select('*')

    // By default, only return active occasions
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    query = query.order('display_order', { ascending: true })

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error)
    }
    if (!data) {
      throw new NotFoundError('Occasions')
    }

    return data
  } catch (error) {
    console.error('getAllOccasions failed:', error)
    throw error
  }
}

/**
 * Get occasion by ID
 * @param {number} id - Occasion ID to retrieve
 * @param {boolean} includeInactive - Include inactive occasions (default: false, admin only)
 * @returns {Object} - Occasion object
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When occasion is not found
 * @throws {DatabaseError} When database query fails
 */
export async function getOccasionById(id, includeInactive = false) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid occasion ID: must be a number', { occasionId: id })
    }

    let query = supabase.from(TABLE).select('*').eq('id', id)

    // By default, only return active occasions
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Occasion', id, { includeInactive })
      }
      throw new DatabaseError('SELECT', TABLE, error, { occasionId: id })
    }
    if (!data) {
      throw new NotFoundError('Occasion', id, { includeInactive })
    }

    return data
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error(`getOccasionById(${id}) failed:`, error)
    throw new DatabaseError('SELECT', TABLE, error, { occasionId: id })
  }
}

/**
 * Get occasion by slug (indexed column for SEO)
 * @param {string} slug - Occasion slug to search for
 * @param {boolean} includeInactive - Include inactive occasions (default: false, admin only)
 * @returns {Object} - Occasion object
 * @throws {BadRequestError} When slug is invalid
 * @throws {NotFoundError} When occasion with slug is not found
 * @throws {DatabaseError} When database query fails
 */
export async function getOccasionBySlug(slug, includeInactive = false) {
  try {
    if (!slug || typeof slug !== 'string') {
      throw new BadRequestError('Invalid slug: must be a string', { slug })
    }

    let query = supabase.from(TABLE).select('*').eq('slug', slug)

    // By default, only return active occasions
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Occasion', slug, { slug, includeInactive })
      }
      throw new DatabaseError('SELECT', TABLE, error, { slug })
    }
    if (!data) {
      throw new NotFoundError('Occasion', slug, { slug, includeInactive })
    }

    return data
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error(`getOccasionBySlug(${slug}) failed:`, error)
    throw new DatabaseError('SELECT', TABLE, error, { slug })
  }
}

/**
 * Create new occasion
 * @param {Object} occasionData - Occasion data to create
 * @param {string} occasionData.name - Occasion name (required)
 * @param {string} occasionData.slug - Occasion slug (required, must be lowercase alphanumeric with hyphens)
 * @param {string} [occasionData.description] - Occasion description
 * @param {number} [occasionData.display_order=0] - Display order for sorting
 * @returns {Object} - Created occasion
 * @throws {ValidationError} When occasion data is invalid
 * @throws {DatabaseConstraintError} When occasion violates database constraints (e.g., duplicate slug)
 * @throws {DatabaseError} When database insert fails
 */
export async function createOccasion(occasionData) {
  try {
    validateOccasionData(occasionData, false)

    const newOccasion = {
      name: occasionData.name,
      description: occasionData.description || null,
      slug: occasionData.slug,
      display_order: occasionData.display_order || 0,
      is_active: true
    }

    const { data, error } = await supabase.from(TABLE).insert(newOccasion).select().single()

    if (error) {
      if (error.code === '23505') {
        throw new DatabaseConstraintError('unique_slug', TABLE, {
          slug: occasionData.slug,
          message: `Occasion with slug "${occasionData.slug}" already exists`
        })
      }
      throw new DatabaseError('INSERT', TABLE, error, { occasionData: newOccasion })
    }

    if (!data) {
      throw new DatabaseError(
        'INSERT',
        TABLE,
        new InternalServerError('No data returned after insert'),
        {
          occasionData: newOccasion
        }
      )
    }

    return data
  } catch (error) {
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    console.error('createOccasion failed:', error)
    throw new DatabaseError('INSERT', TABLE, error, { occasionData })
  }
}

/**
 * Update occasion (limited fields) - only allows updating specific occasion fields
 * @param {number} id - Occasion ID to update
 * @param {Object} updates - Updated occasion data
 * @param {string} [updates.name] - Occasion name
 * @param {string} [updates.description] - Occasion description
 * @param {string} [updates.slug] - Occasion slug
 * @param {number} [updates.display_order] - Display order for sorting
 * @returns {Object} - Updated occasion
 * @throws {BadRequestError} When ID is invalid or no valid updates are provided
 * @throws {ValidationError} When occasion data is invalid
 * @throws {NotFoundError} When occasion is not found
 * @throws {DatabaseConstraintError} When occasion violates database constraints (e.g., duplicate slug)
 * @throws {DatabaseError} When database update fails
 */
export async function updateOccasion(id, updates) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid occasion ID: must be a number', { occasionId: id })
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new BadRequestError('No updates provided', { occasionId: id })
    }

    validateOccasionData(updates, true)

    const allowedFields = ['name', 'description', 'slug', 'display_order']
    const sanitized = {}

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        sanitized[key] = updates[key]
      }
    }

    if (Object.keys(sanitized).length === 0) {
      throw new BadRequestError('No valid fields to update', { occasionId: id })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(sanitized)
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new DatabaseConstraintError('unique_slug', TABLE, {
          slug: updates.slug,
          message: `Occasion with slug "${updates.slug}" already exists`
        })
      }
      throw new DatabaseError('UPDATE', TABLE, error, { occasionId: id })
    }

    if (!data) {
      throw new NotFoundError('Occasion', id, { is_active: true })
    }

    return data
  } catch (error) {
    console.error(`updateOccasion(${id}) failed:`, error)
    throw error
  }
}

/**
 * Soft-delete occasion (reverse soft-delete)
 * @param {number} id - Occasion ID to delete
 * @returns {Object} - Deactivated occasion
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When occasion is not found or already inactive
 * @throws {DatabaseError} When database update fails
 */
export async function deleteOccasion(id) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid occasion ID: must be a number', { occasionId: id })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ is_active: false })
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { occasionId: id })
    }
    if (!data) {
      throw new NotFoundError('Occasion', id, { is_active: true })
    }

    return data
  } catch (error) {
    console.error(`deleteOccasion(${id}) failed:`, error)
    throw error
  }
}

/**
 * Reactivate occasion (reverse soft-delete)
 * @param {number} id - Occasion ID to reactivate
 * @returns {Object} - Reactivated occasion
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When occasion is not found or already active
 * @throws {DatabaseError} When database update fails
 */
export async function reactivateOccasion(id) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid occasion ID: must be a number', { occasionId: id })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ is_active: true })
      .eq('id', id)
      .eq('is_active', false)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { occasionId: id })
    }
    if (!data) {
      throw new NotFoundError('Occasion', id, { is_active: false })
    }

    return data
  } catch (error) {
    console.error(`reactivateOccasion(${id}) failed:`, error)
    throw error
  }
}

/**
 * Update display order for occasion sorting
 * @param {number} id - Occasion ID to update
 * @param {number} newOrder - New display order (must be non-negative)
 * @returns {Object} - Updated occasion
 * @throws {BadRequestError} When ID is invalid or newOrder is negative
 * @throws {NotFoundError} When occasion is not found or inactive
 * @throws {DatabaseError} When database update fails
 */
export async function updateDisplayOrder(id, newOrder) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid occasion ID: must be a number', { occasionId: id })
    }

    if (typeof newOrder !== 'number' || newOrder < 0) {
      throw new BadRequestError('Invalid display_order: must be a non-negative number', {
        newOrder
      })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ display_order: newOrder })
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { occasionId: id })
    }
    if (!data) {
      throw new NotFoundError('Occasion', id, { is_active: true })
    }

    return data
  } catch (error) {
    console.error(`updateDisplayOrder(${id}) failed:`, error)
    throw error
  }
}
