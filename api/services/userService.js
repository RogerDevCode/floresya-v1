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
import { PAGINATION } from '../config/constants.js'

const TABLE = DB_SCHEMA.users.table
const VALID_ROLES = DB_SCHEMA.users.enums.role
const SEARCH_COLUMNS = DB_SCHEMA.users.search

/**
 * Validate user data (ENTERPRISE FAIL-FAST)
 * @param {Object} data - User data to validate
 * @param {string} [data.email] - User email address (required for creation)
 * @param {string} [data.full_name] - User's full name
 * @param {string} [data.phone] - User phone number
 * @param {string} [data.role] - User role (must be valid enum value)
 * @param {string} [data.password_hash] - Password hash
 * @param {boolean} [data.email_verified] - Email verification status
 * @param {boolean} isUpdate - Whether this is for an update operation (default: false)
 * @throws {ValidationError} With detailed field-level validation errors
 * @example
 * // For creation
 * validateUserData({
 *   email: 'user@example.com',
 *   full_name: 'Juan Pérez',
 *   role: 'user'
 * }, false)
 *
 * // For update
 * validateUserData({
 *   role: 'admin'
 * }, true)
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
 * @param {Object} [filters={}] - Filter options
 * @param {string} [filters.search] - Search in full_name and email (accent-insensitive)
 * @param {string} [filters.role] - Filter by user role
 * @param {boolean} [filters.email_verified] - Filter by email verification status
 * @param {number} [filters.limit] - Maximum number of users to return
 * @param {number} [filters.offset] - Number of users to skip
 * @param {boolean} includeInactive - Include inactive users (default: false, admin only)
 * @returns {Object[]} - Array of users
 * @throws {NotFoundError} When no users are found
 * @throws {DatabaseError} When database query fails
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

    query = query
      .order('created_at', { ascending: false })
      .limit(filters.limit || PAGINATION.DEFAULT_LIMIT)

    if (filters.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || PAGINATION.DEFAULT_LIMIT) - 1
      )
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
 * @param {number} id - User ID to retrieve
 * @param {boolean} includeInactive - Include inactive users (default: false, admin only)
 * @returns {Object} - User object
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When user is not found
 * @throws {DatabaseError} When database query fails
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
      if (error.code === 'PGRST116') {
        throw new NotFoundError('User', id, { includeInactive })
      }
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
 * @param {string} email - User email to search for
 * @param {boolean} includeInactive - Include inactive users (default: false, admin only)
 * @returns {Object} - User object
 * @throws {BadRequestError} When email is invalid
 * @throws {NotFoundError} When user with email is not found
 * @throws {DatabaseError} When database query fails
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
 * @param {Object} userData - User data to create
 * @param {string} userData.email - User email (required)
 * @param {string} [userData.full_name] - User's full name
 * @param {string} [userData.phone] - User phone number
 * @param {string} [userData.role='user'] - User role
 * @param {string} [userData.password_hash] - Password hash
 * @param {boolean} [userData.email_verified=false] - Email verification status
 * @returns {Object} - Created user
 * @throws {ValidationError} When user data is invalid
 * @throws {DatabaseConstraintError} When user violates database constraints (e.g., duplicate email)
 * @throws {DatabaseError} When database insert fails
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
 * Update user (limited fields) - only allows updating specific user fields
 * @param {number} id - User ID to update
 * @param {Object} updates - Updated user data
 * @param {string} [updates.full_name] - User's full name
 * @param {string} [updates.phone] - User phone number
 * @param {string} [updates.role] - User role
 * @param {boolean} [updates.email_verified] - Email verification status
 * @param {string} [updates.password_hash] - Password hash
 * @returns {Object} - Updated user
 * @throws {BadRequestError} When ID is invalid or no valid updates are provided
 * @throws {ValidationError} When user data is invalid
 * @throws {NotFoundError} When user is not found
 * @throws {DatabaseError} When database update fails
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
 * Soft-delete user (reverse soft-delete)
 * @param {number} id - User ID to delete
 * @returns {Object} - Deactivated user
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When user is not found or already inactive
 * @throws {DatabaseError} When database update fails
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
 * Reactivate user (reverse soft-delete)
 * @param {number} id - User ID to reactivate
 * @returns {Object} - Reactivated user
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When user is not found or already active
 * @throws {DatabaseError} When database update fails
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
 * Verify user email - sets email_verified to true
 * @param {number} id - User ID to verify email for
 * @returns {Object} - Updated user with verified email
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When user is not found or inactive
 * @throws {DatabaseError} When database update fails
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
