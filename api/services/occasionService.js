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
  BadRequestError
} from '../errors/AppError.js'

const TABLE = DB_SCHEMA.occasions.table

/**
 * Validate occasion data
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
 * Get all occasions with filters
 * @param {Object} filters - Filter options
 * @param {boolean} includeInactive - Include inactive occasions (default: false, admin only)
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
 * @param {number} id - Occasion ID
 * @param {boolean} includeInactive - Include inactive occasions (default: false, admin only)
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
 * @param {string} slug - Occasion slug
 * @param {boolean} includeInactive - Include inactive occasions (default: false, admin only)
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
      throw new DatabaseError('INSERT', TABLE, new Error('No data returned after insert'), {
        occasionData: newOccasion
      })
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
 * Update occasion
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
 * Soft-delete occasion
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
 * Reactivate occasion
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
 * Update display order
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
