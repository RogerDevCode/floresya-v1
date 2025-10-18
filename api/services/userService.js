/**
 * User Service
 * Business logic for user operations
 * KISS implementation - simple and direct
 */

import { supabase, DB_SCHEMA } from './supabaseClient.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  BadRequestError
} from '../errors/AppError.js'

const TABLE = DB_SCHEMA.users.table
const VALID_ROLES = DB_SCHEMA.users.enums.role

/**
 * Validate user ID (KISS principle)
 */
function validateUserId(id, operation = 'operation') {
  if (!id || typeof id !== 'number') {
    throw new BadRequestError(`Invalid user ID: must be a number`, { userId: id, operation })
  }
}

/**
 * Enhanced error handler (KISS principle)
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
 * Apply activity filter (FAIL FAST - no fallback)
 */
function applyActivityFilter(query, includeInactive) {
  if (includeInactive === true) {
    return query
  }
  if (includeInactive === false) {
    return query.eq('is_active', true)
  }
  // FAIL FAST - no fallback, explicit boolean required
  throw new BadRequestError('includeInactive must be boolean (true/false)', { includeInactive })
}

/**
 * Get all users with simple filters (KISS principle)
 * - Shows ALL users by default (no pagination required)
 * - Only applies filters when explicitly provided
 */
export function getAllUsers(filters = {}, includeInactive = false) {
  return withErrorHandling(
    async () => {
      let query = supabase.from(TABLE).select('*')

      // Apply activity filter
      query = applyActivityFilter(query, includeInactive)

      // Apply filters ONLY when explicitly provided (no default filtering)
      if (filters.role && VALID_ROLES.includes(filters.role)) {
        query = query.eq('role', filters.role)
      }

      if (filters.email_verified !== undefined) {
        query = query.eq('email_verified', filters.email_verified)
      }

      // Apply search filter (simple, no regex)
      if (filters.search) {
        const searchTerm = filters.search
        query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
      }

      query = query.order('created_at', { ascending: false })

      // Pagination: Optional - only when limit is provided
      if (filters.limit !== undefined) {
        // Validate limit
        if (typeof filters.limit !== 'number' || filters.limit <= 0 || filters.limit > 100) {
          throw new BadRequestError('Invalid limit: must be a positive number <= 100', {
            limit: filters.limit,
            rule: 'positive number <= 100 required'
          })
        }

        // Validate and sanitize offset
        let offset = filters.offset ?? 0
        // Convert to number if it's a string (common from query params)
        offset = Number(offset)
        if (isNaN(offset) || offset < 0) {
          // Default to 0 if invalid
          offset = 0
        }

        query = query.range(offset, offset + filters.limit - 1)
      }

      const { data, error } = await query

      if (error) {
        throw new DatabaseError('SELECT', TABLE, error, { filters })
      }

      // Don't throw error if no users found - return empty array
      return data || []
    },
    'getAllUsers',
    { filters, includeInactive }
  )
}

/**
 * Get user by ID
 */
export function getUserById(id, includeInactive = false) {
  return withErrorHandling(
    async () => {
      validateUserId(id, 'getUserById')

      let query = supabase.from(TABLE).select('*').eq('id', id)
      query = applyActivityFilter(query, includeInactive)

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
    },
    `getUserById(${id})`,
    { userId: id, includeInactive }
  )
}

/**
 * Get user by email
 */
export function getUserByEmail(email, includeInactive = false) {
  return withErrorHandling(
    async () => {
      // FAIL FAST - Validate email parameter
      if (!email) {
        throw new BadRequestError('Email is required', { email })
      }

      if (typeof email !== 'string') {
        throw new BadRequestError('Email must be a string', { email, type: typeof email })
      }

      // FAIL FAST - Basic email format validation
      if (!email.includes('@') || !email.includes('.')) {
        throw new ValidationError('Invalid email format', {
          field: 'email',
          value: email,
          rule: 'valid email format required'
        })
      }

      let query = supabase.from(TABLE).select('*').eq('email', email)
      query = applyActivityFilter(query, includeInactive)

      const { data, error } = await query.single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('User', email, { email, includeInactive })
        }
        throw new DatabaseError('SELECT', TABLE, error, { email })
      }

      if (!data) {
        throw new NotFoundError('User', email, { email, includeInactive })
      }

      return data
    },
    `getUserByEmail(${email})`,
    { email, includeInactive }
  )
}

/**
 * Get users by intelligent filter (role, state, email-verified)
 * This is the smart filter function - combines multiple criteria
 */
export function getUsersByFilter(filters = {}) {
  return withErrorHandling(
    async () => {
      let query = supabase.from(TABLE).select('*')

      // Apply all filters intelligently
      if (filters.role && VALID_ROLES.includes(filters.role)) {
        query = query.eq('role', filters.role)
      }

      if (filters.state !== undefined) {
        query = query.eq('is_active', filters.state)
      }

      if (filters.email_verified !== undefined) {
        query = query.eq('email_verified', filters.email_verified)
      }

      // FAIL FAST - Require at least one filter
      if (!filters.role && filters.state === undefined && filters.email_verified === undefined) {
        throw new BadRequestError(
          'At least one filter must be specified: role, state, or email_verified',
          {
            providedFilters: Object.keys(filters),
            rule: 'filter required'
          }
        )
      }

      query = query.order('created_at', { ascending: false })

      // FAIL FAST - Require explicit pagination parameters
      if (filters.limit === undefined || filters.offset === undefined) {
        throw new BadRequestError('Pagination parameters limit and offset are required', {
          limit: filters.limit,
          offset: filters.offset,
          rule: 'Both limit and offset must be provided'
        })
      }

      // Validate pagination parameters
      if (typeof filters.limit !== 'number' || filters.limit <= 0 || filters.limit > 100) {
        throw new BadRequestError('Invalid limit: must be a positive number <= 100', {
          limit: filters.limit,
          rule: 'positive number <= 100 required'
        })
      }

      if (typeof filters.offset !== 'number' || filters.offset < 0) {
        throw new BadRequestError('Invalid offset: must be a non-negative number', {
          offset: filters.offset,
          rule: 'non-negative number required'
        })
      }

      query = query.range(filters.offset, filters.offset + filters.limit - 1)

      const { data, error } = await query

      if (error) {
        throw new DatabaseError('SELECT', TABLE, error, { filters })
      }

      if (!data) {
        throw new NotFoundError('Users', null)
      }

      return data
    },
    'getUsersByFilter',
    { filters }
  )
}

/**
 * Create new user (client registration - no password required)
 */
export function createUser(userData) {
  return withErrorHandling(
    async () => {
      // Validate required fields for client registration
      if (!userData.email || typeof userData.email !== 'string') {
        throw new ValidationError('Email is required and must be a string', {
          field: 'email',
          value: userData.email,
          rule: 'required string'
        })
      }

      // Validate email format (simple check - no regex as requested)
      if (!userData.email.includes('@') || !userData.email.includes('.')) {
        throw new ValidationError('Invalid email format', {
          field: 'email',
          value: userData.email,
          rule: 'valid email format required'
        })
      }

      // For client registration, password is optional
      // For admin creation, password is required
      if (userData.role === 'admin' && !userData.password_hash) {
        throw new ValidationError('Password is required for admin users', {
          field: 'password_hash',
          rule: 'required for admin role'
        })
      }

      // Validate role if provided
      if (userData.role && !VALID_ROLES.includes(userData.role)) {
        throw new ValidationError(`Invalid role: must be one of ${VALID_ROLES.join(', ')}`, {
          field: 'role',
          value: userData.role,
          validValues: VALID_ROLES
        })
      }

      // FAIL FAST - Explicit field requirements
      const newUser = {
        email: userData.email,
        full_name: userData.full_name ?? null,
        phone: userData.phone ?? null,
        role: userData.role ?? 'user',
        password_hash: userData.password_hash ?? null,
        is_active: true,
        email_verified: userData.email_verified ?? false
      }

      const { data, error } = await supabase.from(TABLE).insert(newUser).select().single()

      if (error) {
        throw new DatabaseError('INSERT', TABLE, error, { email: userData.email })
      }

      return data
    },
    'createUser',
    { email: userData.email }
  )
}

/**
 * Update user
 */
export function updateUser(id, updates) {
  return withErrorHandling(
    async () => {
      validateUserId(id, 'updateUser')

      if (!updates || Object.keys(updates).length === 0) {
        throw new BadRequestError('No updates provided', { userId: id })
      }

      // Validate role if being updated
      if (updates.role && !VALID_ROLES.includes(updates.role)) {
        throw new ValidationError(`Invalid role: must be one of ${VALID_ROLES.join(', ')}`, {
          field: 'role',
          value: updates.role,
          validValues: VALID_ROLES
        })
      }

      const { data, error } = await supabase
        .from(TABLE)
        .update(updates)
        .eq('id', id)
        .eq('is_active', true)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('User', id, { active: true })
        }
        throw new DatabaseError('UPDATE', TABLE, error, { userId: id })
      }

      if (!data) {
        throw new NotFoundError('User', id, { active: true })
      }

      return data
    },
    `updateUser(${id})`,
    { userId: id }
  )
}

/**
 * Soft-delete user
 */
export function deleteUser(id) {
  return withErrorHandling(
    async () => {
      validateUserId(id, 'deleteUser')

      const { data, error } = await supabase
        .from(TABLE)
        .update({ is_active: false })
        .eq('id', id)
        .eq('is_active', true)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('User', id, { active: true })
        }
        throw new DatabaseError('UPDATE', TABLE, error, { userId: id })
      }

      if (!data) {
        throw new NotFoundError('User', id, { active: true })
      }

      return data
    },
    `deleteUser(${id})`,
    { userId: id }
  )
}

/**
 * Reactivate user (undo soft-delete)
 * @param {number} id - User ID to reactivate
 * @returns {Promise<Object>} Reactivated user data
 */
export function reactivateUser(id) {
  return withErrorHandling(
    async () => {
      validateUserId(id, 'reactivateUser')

      const { data, error } = await supabase
        .from(TABLE)
        .update({ is_active: true })
        .eq('id', id)
        .eq('is_active', false)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('User', id, { active: false })
        }
        throw new DatabaseError('UPDATE', TABLE, error, { userId: id })
      }

      if (!data) {
        throw new NotFoundError('User', id, { active: false })
      }

      return data
    },
    `reactivateUser(${id})`,
    { userId: id }
  )
}

/**
 * Verify user email
 * @param {number} id - User ID to verify email for
 * @returns {Promise<Object>} Updated user data with verified email
 */
export function verifyUserEmail(id) {
  return withErrorHandling(
    async () => {
      validateUserId(id, 'verifyUserEmail')

      const { data, error } = await supabase
        .from(TABLE)
        .update({ email_verified: true })
        .eq('id', id)
        .eq('is_active', true)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('User', id, { active: true })
        }
        throw new DatabaseError('UPDATE', TABLE, error, { userId: id })
      }

      if (!data) {
        throw new NotFoundError('User', id, { active: true })
      }

      return data
    },
    `verifyUserEmail(${id})`,
    { userId: id }
  )
}
