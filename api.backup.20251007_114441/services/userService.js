/**
 * User Service
 * Full CRUD operations with soft-delete (is_active flag)
 * Uses indexed columns for optimized queries
 */

import { supabase, DB_SCHEMA } from './supabaseClient.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  DatabaseConstraintError,
  BadRequestError
} from '../errors/AppError.js'
import { buildSearchCondition } from '../utils/normalize.js'

const TABLE = DB_SCHEMA.users.table
const VALID_ROLES = DB_SCHEMA.users.enums.role
const SEARCH_COLUMNS = DB_SCHEMA.users.search

/**
 * Validate user data
 * @param {Object} data - User data
 * @param {boolean} isUpdate - Whether this is an update
 */
function validateUserData(data, isUpdate = false) {
  if (!isUpdate) {
    if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
      throw new ValidationError('Invalid email: must be valid email string', {
        field: 'email',
        value: data.email,
        rule: 'valid email format required'
      })
    }
  }

  if (data.email !== undefined && (typeof data.email !== 'string' || !data.email.includes('@'))) {
    throw new ValidationError('Invalid email format', {
      field: 'email',
      value: data.email,
      rule: 'valid email format required'
    })
  }

  if (data.role !== undefined && !VALID_ROLES.includes(data.role)) {
    throw new ValidationError(`Invalid role: must be one of ${VALID_ROLES.join(', ')}`, {
      field: 'role',
      value: data.role,
      validValues: VALID_ROLES
    })
  }

  if (data.phone !== undefined && data.phone !== null && typeof data.phone !== 'string') {
    throw new ValidationError('Invalid phone: must be a string', {
      field: 'phone',
      value: data.phone,
      rule: 'string type required'
    })
  }
}

/**
 * Get all users with filters
 * Supports accent-insensitive search via normalized columns
 * @param {Object} filters - Filter options
 * @param {boolean} includeInactive - Include inactive users (default: false, admin only)
 */
export async function getAllUsers(filters = {}, includeInactive = false) {
  try {
    let query = supabase.from(TABLE).select('*')

    // Search filter (uses indexed normalized columns)
    const searchCondition = buildSearchCondition(SEARCH_COLUMNS, filters.search)
    if (searchCondition) {
      query = query.or(searchCondition)
    }

    // By default, only return active users
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    if (filters.role && VALID_ROLES.includes(filters.role)) {
      query = query.eq('role', filters.role)
    }

    if (filters.email_verified !== undefined) {
      query = query.eq('email_verified', filters.email_verified)
    }

    query = query.order('created_at', { ascending: false }).limit(filters.limit || 50)

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error)
    }
    if (!data) {
      throw new NotFoundError('Users', null)
    }

    return data
  } catch (error) {
    console.error('getAllUsers failed:', error)
    throw error
  }
}

/**
 * Get user by ID
 * @param {number} id - User ID
 * @param {boolean} includeInactive - Include inactive users (default: false, admin only)
 */
export async function getUserById(id, includeInactive = false) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid user ID: must be a number', { userId: id })
    }

    let query = supabase.from(TABLE).select('*').eq('id', id)

    // By default, only return active users
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      throw new DatabaseError('SELECT', TABLE, error, { userId: id })
    }
    if (!data) {
      throw new NotFoundError('User', id, { includeInactive })
    }

    return data
  } catch (error) {
    console.error(`getUserById(${id}) failed:`, error)
    throw error
  }
}

/**
 * Get user by email (indexed column)
 * @param {string} email - User email
 * @param {boolean} includeInactive - Include inactive users (default: false, admin only)
 */
export async function getUserByEmail(email, includeInactive = false) {
  try {
    if (!email || typeof email !== 'string') {
      throw new BadRequestError('Invalid email: must be a string', { email })
    }

    let query = supabase.from(TABLE).select('*').eq('email', email)

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('User', email, { email })
      }
      throw new DatabaseError('SELECT', TABLE, error, { email })
    }

    return data
  } catch (error) {
    console.error(`getUserByEmail(${email}) failed:`, error)
    throw error
  }
}

/**
 * Create new user
 */
export async function createUser(userData) {
  try {
    validateUserData(userData, false)

    const newUser = {
      email: userData.email,
      full_name: userData.full_name || null,
      phone: userData.phone || null,
      role: userData.role || 'user',
      password_hash: userData.password_hash || null,
      is_active: true,
      email_verified: userData.email_verified || false
    }

    const { data, error } = await supabase.from(TABLE).insert(newUser).select().single()

    if (error) {
      if (error.code === '23505') {
        throw new DatabaseConstraintError('unique_email', TABLE, {
          email: userData.email,
          message: `User with email ${userData.email} already exists`
        })
      }
      throw new DatabaseError('INSERT', TABLE, error, { userData: newUser })
    }

    if (!data) {
      throw new DatabaseError('INSERT', TABLE, new Error('No data returned'), { userData: newUser })
    }

    return data
  } catch (error) {
    console.error('createUser failed:', error)
    throw error
  }
}

/**
 * Update user
 */
export async function updateUser(id, updates) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid user ID: must be a number', { userId: id })
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new BadRequestError('No updates provided', { userId: id })
    }

    validateUserData(updates, true)

    const allowedFields = ['full_name', 'phone', 'role', 'email_verified', 'password_hash']
    const sanitized = {}

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        sanitized[key] = updates[key]
      }
    }

    if (Object.keys(sanitized).length === 0) {
      throw new BadRequestError('No valid fields to update', { userId: id })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(sanitized)
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { userId: id })
    }
    if (!data) {
      throw new NotFoundError('User', id, { active: true })
    }

    return data
  } catch (error) {
    console.error(`updateUser(${id}) failed:`, error)
    throw error
  }
}

/**
 * Soft-delete user
 */
export async function deleteUser(id) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid user ID: must be a number', { userId: id })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ is_active: false })
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { userId: id })
    }
    if (!data) {
      throw new NotFoundError('User', id, { active: true })
    }

    return data
  } catch (error) {
    console.error(`deleteUser(${id}) failed:`, error)
    throw error
  }
}

/**
 * Reactivate user
 */
export async function reactivateUser(id) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid user ID: must be a number', { userId: id })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ is_active: true })
      .eq('id', id)
      .eq('is_active', false)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { userId: id })
    }
    if (!data) {
      throw new NotFoundError('User', id, { active: false })
    }

    return data
  } catch (error) {
    console.error(`reactivateUser(${id}) failed:`, error)
    throw error
  }
}

/**
 * Verify user email
 */
export async function verifyUserEmail(id) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid user ID: must be a number', { userId: id })
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ email_verified: true })
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single()

    if (error) {
      throw new DatabaseError('UPDATE', TABLE, error, { userId: id })
    }
    if (!data) {
      throw new NotFoundError('User', id, { active: true })
    }

    return data
  } catch (error) {
    console.error(`verifyUserEmail(${id}) failed:`, error)
    throw error
  }
}
