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
 * Validates occasion ID parameter (DRY principle)
 * @param {number} id - Occasion ID to validate
 * @param {string} operation - Operation name for error context
 * @throws {BadRequestError} When ID is invalid
 */
function validateOccasionId(id, operation = 'operation') {
  if (!id || typeof id !== 'number') {
    throw new BadRequestError(`Invalid occasion ID: must be a number`, {
      occasionId: id,
      operation
    })
  }
}

/**
 * Enhanced error handler with consistent logging (DRY principle)
 * @param {Function} operation - The async operation to execute
 * @param {string} operationName - Name of the operation for logging
 * @param {Object} context - Additional context for logging
 * @returns {Promise} Result of the operation
 */
async function withErrorHandling(operation, operationName, context = {}) {
  try {
    return await operation()
  } catch (error) {
    console.error(`${operationName} failed:`, { error: error.message, context })
    throw error
  }
}

/**
 * Applies activity filter to query based on permissions (DRY principle)
 * @param {Object} query - Supabase query builder
 * @param {boolean} includeInactive - Whether to include inactive occasions
 * @param {boolean} [explicitFilter] - Explicit is_active filter value
 * @returns {Object} Modified query
 */
function applyActivityFilter(query, includeInactive, explicitFilter) {
  if (explicitFilter !== undefined && includeInactive) {
    // Admins can see occasions based on explicit filter
    return query.eq('is_active', explicitFilter)
  } else if (!includeInactive) {
    // Non-admins always see only active occasions
    return query.eq('is_active', true)
  }
  // Admins with no explicit filter see all occasions
  return query
}

/**
 * Handles database operation results consistently (DRY principle)
 * @param {Object} result - Database operation result
 * @param {string} operation - Operation type for error context
 * @param {string} table - Table name for error context
 * @param {Object} error - Database error object
 * @param {Object} context - Additional context for error
 * @throws {DatabaseError} When operation fails
 * @throws {NotFoundError} When no data is found
 */
function handleDatabaseResult(result, operation, table, error, context = {}) {
  if (error) {
    if (error.code === '23505') {
      throw new DatabaseConstraintError('unique_slug', table, {
        ...context,
        message: `Occasion with slug ${context.slug} already exists`
      })
    }
    throw new DatabaseError(operation, table, error, context)
  }
  if (!result) {
    throw new DatabaseError(operation, table, new InternalServerError('No data returned'), context)
  }
}

/**
 * Creates standardized occasion object from input data (DRY principle)
 * @param {Object} occasionData - Raw occasion data from request
 * @returns {Object} Sanitized occasion object ready for database
 */
function createOccasionObject(occasionData) {
  return {
    name: occasionData.name,
    description: occasionData.description !== undefined ? occasionData.description : null,
    slug: occasionData.slug,
    display_order: occasionData.display_order !== undefined ? occasionData.display_order : 0,
    is_active: true
  }
}

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
export function getAllOccasions(filters = {}, includeInactive = false) {
  return withErrorHandling(
    async () => {
      let query = supabase.from(TABLE).select('*')

      // Apply activity filter using DRY helper
      query = applyActivityFilter(query, includeInactive, filters.is_active)

      query = query.order('display_order', { ascending: true })

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) {
        handleDatabaseResult(null, 'SELECT', TABLE, error, { filters })
      }
      if (!data) {
        throw new NotFoundError('Occasions', null)
      }

      return data
    },
    'getAllOccasions',
    { filters, includeInactive }
  )
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
export function getOccasionById(id, includeInactive = false) {
  return withErrorHandling(
    async () => {
      validateOccasionId(id, 'getOccasionById')

      let query = supabase.from(TABLE).select('*').eq('id', id)
      query = applyActivityFilter(query, includeInactive)

      const { data, error } = await query.single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('Occasion', id, { includeInactive })
        }
        handleDatabaseResult(null, 'SELECT', TABLE, error, { occasionId: id })
      }
      if (!data) {
        throw new NotFoundError('Occasion', id, { includeInactive })
      }

      return data
    },
    `getOccasionById(${id})`,
    { occasionId: id, includeInactive }
  )
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
export function getOccasionBySlug(slug, includeInactive = false) {
  return withErrorHandling(
    async () => {
      if (!slug || typeof slug !== 'string') {
        throw new BadRequestError('Invalid slug: must be a string', { slug })
      }

      let query = supabase.from(TABLE).select('*').eq('slug', slug)
      query = applyActivityFilter(query, includeInactive)

      const { data, error } = await query.single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('Occasion', slug, { slug, includeInactive })
        }
        handleDatabaseResult(null, 'SELECT', TABLE, error, { slug })
      }
      if (!data) {
        throw new NotFoundError('Occasion', slug, { slug, includeInactive })
      }

      return data
    },
    `getOccasionBySlug(${slug})`,
    { slug, includeInactive }
  )
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
export function createOccasion(occasionData) {
  return withErrorHandling(
    async () => {
      validateOccasionData(occasionData, false)

      const newOccasion = createOccasionObject(occasionData)

      const { data, error } = await supabase.from(TABLE).insert(newOccasion).select().single()

      handleDatabaseResult(data, 'INSERT', TABLE, error, { slug: occasionData.slug })

      return data
    },
    'createOccasion',
    { slug: occasionData.slug }
  )
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
export function updateOccasion(id, updates) {
  return withErrorHandling(
    async () => {
      validateOccasionId(id, 'updateOccasion')

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
        handleDatabaseResult(null, 'UPDATE', TABLE, error, { occasionId: id })
      }
      if (!data) {
        throw new NotFoundError('Occasion', id, { active: true })
      }

      return data
    },
    `updateOccasion(${id})`,
    { occasionId: id }
  )
}

/**
 * Soft-delete occasion (reverse soft-delete)
 * @param {number} id - Occasion ID to delete
 * @returns {Object} - Deactivated occasion
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When occasion is not found or already inactive
 * @throws {DatabaseError} When database update fails
 */
export function deleteOccasion(id) {
  return withErrorHandling(
    async () => {
      validateOccasionId(id, 'deleteOccasion')

      const { data, error } = await supabase
        .from(TABLE)
        .update({ is_active: false })
        .eq('id', id)
        .eq('is_active', true)
        .select()
        .single()

      if (error) {
        handleDatabaseResult(null, 'UPDATE', TABLE, error, { occasionId: id })
      }
      if (!data) {
        throw new NotFoundError('Occasion', id, { active: true })
      }

      return data
    },
    `deleteOccasion(${id})`,
    { occasionId: id }
  )
}

/**
 * Reactivate occasion (reverse soft-delete)
 * @param {number} id - Occasion ID to reactivate
 * @returns {Object} - Reactivated occasion
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When occasion is not found or already active
 * @throws {DatabaseError} When database update fails
 */
export function reactivateOccasion(id) {
  return withErrorHandling(
    async () => {
      validateOccasionId(id, 'reactivateOccasion')

      const { data, error } = await supabase
        .from(TABLE)
        .update({ is_active: true })
        .eq('id', id)
        .eq('is_active', false)
        .select()
        .single()

      if (error) {
        handleDatabaseResult(null, 'UPDATE', TABLE, error, { occasionId: id })
      }
      if (!data) {
        throw new NotFoundError('Occasion', id, { active: false })
      }

      return data
    },
    `reactivateOccasion(${id})`,
    { occasionId: id }
  )
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
export function updateDisplayOrder(id, newOrder) {
  return withErrorHandling(
    async () => {
      validateOccasionId(id, 'updateDisplayOrder')

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
        handleDatabaseResult(null, 'UPDATE', TABLE, error, { occasionId: id })
      }
      if (!data) {
        throw new NotFoundError('Occasion', id, { active: true })
      }

      return data
    },
    `updateDisplayOrder(${id})`,
    { occasionId: id, newOrder }
  )
}
