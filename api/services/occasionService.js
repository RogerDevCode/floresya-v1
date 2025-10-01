/**
 * Occasion Service
 * Full CRUD operations with soft-delete (is_active flag)
 * Uses indexed slug column for SEO-friendly lookups
 */

import { supabase, DB_SCHEMA } from './supabaseClient.js'

const TABLE = DB_SCHEMA.occasions.table

/**
 * Validate occasion data
 */
function validateOccasionData(data, isUpdate = false) {
  if (!isUpdate) {
    if (!data.name || typeof data.name !== 'string') {
      throw new Error('Invalid name: must be a non-empty string')
    }
    if (!data.slug || typeof data.slug !== 'string') {
      throw new Error('Invalid slug: must be a non-empty string')
    }
  }

  if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim() === '')) {
    throw new Error('Invalid name: must be a non-empty string')
  }

  if (
    data.slug !== undefined &&
    (typeof data.slug !== 'string' || !/^[a-z0-9-]+$/.test(data.slug))
  ) {
    throw new Error('Invalid slug: must be lowercase alphanumeric with hyphens')
  }

  if (
    data.display_order !== undefined &&
    (typeof data.display_order !== 'number' || data.display_order < 0)
  ) {
    throw new Error('Invalid display_order: must be a non-negative number')
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
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error('No occasions found')
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
      throw new Error('Invalid occasion ID: must be a number')
    }

    let query = supabase.from(TABLE).select('*').eq('id', id)

    // By default, only return active occasions
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error(`Occasion ${id} not found`)
    }

    return data
  } catch (error) {
    console.error(`getOccasionById(${id}) failed:`, error)
    throw error
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
      throw new Error('Invalid slug: must be a string')
    }

    let query = supabase.from(TABLE).select('*').eq('slug', slug)

    // By default, only return active occasions
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`Occasion with slug "${slug}" not found`)
      }
      throw new Error(`Database error: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error(`getOccasionBySlug(${slug}) failed:`, error)
    throw error
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
        throw new Error(`Occasion with slug "${occasionData.slug}" already exists`)
      }
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data) {
      throw new Error('Failed to create occasion')
    }

    return data
  } catch (error) {
    console.error('createOccasion failed:', error)
    throw error
  }
}

/**
 * Update occasion
 */
export async function updateOccasion(id, updates) {
  try {
    if (!id || typeof id !== 'number') {
      throw new Error('Invalid occasion ID: must be a number')
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('No updates provided')
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
      throw new Error('No valid fields to update')
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
        throw new Error(`Occasion with slug "${updates.slug}" already exists`)
      }
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data) {
      throw new Error(`Occasion ${id} not found or inactive`)
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
      throw new Error('Invalid occasion ID: must be a number')
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ is_active: false })
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error(`Occasion ${id} not found or already inactive`)
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
      throw new Error('Invalid occasion ID: must be a number')
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ is_active: true })
      .eq('id', id)
      .eq('is_active', false)
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error(`Occasion ${id} not found or already active`)
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
      throw new Error('Invalid occasion ID: must be a number')
    }

    if (typeof newOrder !== 'number' || newOrder < 0) {
      throw new Error('Invalid display_order: must be a non-negative number')
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ display_order: newOrder })
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
    if (!data) {
      throw new Error(`Occasion ${id} not found or inactive`)
    }

    return data
  } catch (error) {
    console.error(`updateDisplayOrder(${id}) failed:`, error)
    throw error
  }
}
