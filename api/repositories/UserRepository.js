/**
 * Procesado por B
 */

/**
 * User Repository
 * Gestiona el acceso a datos de usuarios
 * Extiende BaseRepository con operaciones específicas de usuarios
 */

import { BaseRepository } from './BaseRepository.js'
import { ConflictError } from '../errors/AppError.js'
import { DB_SCHEMA } from '../services/supabaseClient.js'

export class UserRepository extends BaseRepository {
  constructor(supabaseClient) {
    super(supabaseClient, DB_SCHEMA.users.table)
  }

  /**
   * Obtener usuario por email
   * @param {string} email - Email del usuario
   * @param {boolean} includeInactive - Incluir usuarios inactivos
   * @returns {Promise<Object|null>} Usuario encontrado
   */
  async findByEmail(email, includeInactive = false) {
    let query = this.supabase
      .from(this.table)
      .select(
        'id, email, password_hash, full_name, phone, role, active, email_verified, created_at, updated_at, full_name_normalized, email_normalized'
      )
      .eq('email', email)

    if (!includeInactive) {
      query = query.eq('active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw this.handleError(error, 'findByEmail', { email, includeInactive })
    }

    return data
  }

  /**
   * Obtener usuarios con filtros
   * @param {Object} filters - Filtros específicos para usuarios
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de usuarios
   */
  async findAllWithFilters(filters = {}, options = {}) {
    let query = this.supabase
      .from(this.table)
      .select(
        'id, email, password_hash, full_name, phone, role, active, email_verified, created_at, updated_at, full_name_normalized, email_normalized'
      )

    // Aplicar filtros específicos
    if (filters.role) {
      query = query.eq('role', filters.role)
    }

    if (filters.email_verified !== undefined) {
      query = query.eq('email_verified', filters.email_verified)
    }

    if (filters.search) {
      query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`)
    }

    // Incluir usuarios inactivos solo si se especifica
    if (!filters.includeDeactivated) {
      query = query.eq('active', true)
    }

    // Aplicar ordenamiento
    const orderBy = options.orderBy || 'created_at'
    const ascending = options.ascending || false
    query = query.order(orderBy, { ascending })

    // Aplicar límites
    if (options.limit !== undefined) {
      const offset = options.offset || 0
      query = query.range(offset, offset + options.limit - 1)
    }

    const { data, error } = await query

    if (error) {
      throw this.handleError(error, 'findAllWithFilters', { filters, options })
    }

    return data || []
  }

  /**
   * Obtener usuarios con filtros inteligentes (con estado)
   * @param {Object} filters - Filtros que incluyen 'state'
   * @returns {Promise<Array>} Lista de usuarios
   */
  async findByFilter(filters) {
    let query = this.supabase
      .from(this.table)
      .select(
        'id, email, password_hash, full_name, phone, role, active, email_verified, created_at, updated_at, full_name_normalized, email_normalized'
      )

    // Aplicar filtros
    if (filters.role) {
      query = query.eq('role', filters.role)
    }

    if (filters.state !== undefined) {
      // state: true = activos, false = inactivos
      query = query.eq('active', filters.state)
    }

    if (filters.email_verified !== undefined) {
      query = query.eq('email_verified', filters.email_verified)
    }

    // Aplicar límites obligatorios
    query = query.range(filters.offset, filters.offset + filters.limit - 1)

    const { data, error } = await query

    if (error) {
      throw this.handleError(error, 'findByFilter', { filters })
    }

    return data || []
  }

  /**
   * Crear usuario (con reactivación automática si existe inactivo)
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado o reactivado
   */
  async createWithReactivation(userData) {
    // Verificar si ya existe (incluso si está inactivo)
    const { data: existingUser } = await this.supabase
      .from(this.table)
      .select('id, active')
      .eq('email', userData.email)
      .maybeSingle()

    if (existingUser && existingUser.active) {
      throw new ConflictError('User with this email already exists', { email: userData.email })
    }

    // Si existe pero está inactivo, reactivar
    if (existingUser && !existingUser.active) {
      console.log(`Reactivating inactive user: ${userData.email}`)
      const reactivatedUser = await this.reactivate(existingUser.id, null)
      return reactivatedUser
    }

    // Crear nuevo usuario
    return await this.create(userData)
  }

  /**
   * Verificar email
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} Usuario con email verificado
   */
  async verifyEmail(id) {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw this.handleError(error, 'verifyEmail', { id })
    }

    return data
  }

  /**
   * Obtener auditoría de usuario
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} Información de auditoría
   */
  async getAuditHistory(id) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        'id, deleted_at, deleted_by, deletion_reason, deletion_ip, reactivated_at, reactivated_by'
      )
      .eq('id', id)
      .single()

    if (error) {
      throw this.handleError(error, 'getAuditHistory', { id })
    }

    return data
  }

  /**
   * Verificar si usuario tiene permiso
   * @param {Object} user - Usuario a verificar
   * @param {string} requiredRole - Rol requerido
   * @returns {boolean} True si tiene permiso
   */
  hasPermission(user, requiredRole) {
    const roleHierarchy = {
      user: 1,
      admin: 2,
      super_admin: 3
    }

    const userLevel = roleHierarchy[user.role] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 999

    return userLevel >= requiredLevel
  }

  /**
   * Obtener usuarios por rol
   * @param {string} role - Rol a filtrar
   * @param {boolean} includeInactive - Incluir inactivos
   * @returns {Promise<Array>} Lista de usuarios
   */
  async findByRole(role, includeInactive = false) {
    let query = this.supabase
      .from(this.table)
      .select(
        'id, email, password_hash, full_name, phone, role, active, email_verified, created_at, updated_at, full_name_normalized, email_normalized'
      )
      .eq('role', role)

    if (!includeInactive) {
      query = query.eq('active', true)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw this.handleError(error, 'findByRole', { role, includeInactive })
    }

    return data || []
  }

  /**
   * Obtener usuarios por estado de verificación de email
   * @param {boolean} verified - Estado de verificación
   * @param {boolean} includeInactive - Incluir inactivos
   * @returns {Promise<Array>} Lista de usuarios
   */
  async findByEmailVerificationStatus(verified, includeInactive = false) {
    let query = this.supabase
      .from(this.table)
      .select(
        'id, email, password_hash, full_name, phone, role, active, email_verified, created_at, updated_at, full_name_normalized, email_normalized'
      )
      .eq('email_verified', verified)

    if (!includeInactive) {
      query = query.eq('active', true)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw this.handleError(error, 'findByEmailVerificationStatus', { verified, includeInactive })
    }

    return data || []
  }

  /**
   * Buscar usuarios por término de búsqueda
   * @param {string} searchTerm - Término de búsqueda
   * @param {boolean} includeInactive - Incluir inactivos
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Lista de usuarios
   */
  async searchUsers(searchTerm, includeInactive = false, limit = 50) {
    let query = this.supabase
      .from(this.table)
      .select(
        'id, email, password_hash, full_name, phone, role, active, email_verified, created_at, updated_at, full_name_normalized, email_normalized'
      )
      .or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)

    if (!includeInactive) {
      query = query.eq('active', true)
    }

    query = query.limit(limit)

    const { data, error } = await query.order('full_name', { ascending: true })

    if (error) {
      throw this.handleError(error, 'searchUsers', { searchTerm, includeInactive, limit })
    }

    return data || []
  }

  /**
   * Actualizar último acceso
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updateLastAccess(id) {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        last_access: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw this.handleError(error, 'updateLastAccess', { id })
    }

    return data
  }

  /**
   * Obtener estadísticas de usuarios
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats() {
    const { data, error } = await this.supabase
      .from(this.table)
      .select('role, email_verified, active')

    if (error) {
      throw this.handleError(error, 'getStats')
    }

    // Calcular estadísticas
    const stats = {
      total: data.length,
      active: data.filter(u => u.active).length,
      inactive: data.filter(u => !u.active).length,
      verified: data.filter(u => u.email_verified).length,
      unverified: data.filter(u => !u.email_verified).length,
      byRole: {
        user: data.filter(u => u.role === 'user').length,
        admin: data.filter(u => u.role === 'admin').length,
        super_admin: data.filter(u => u.role === 'super_admin').length
      }
    }

    return stats
  }
}

/**
 * Factory function to create UserRepository instance
 * @param {Object} supabaseClient - Supabase client
 * @returns {UserRepository} Repository instance
 */
export function createUserRepository(supabaseClient = null) {
  return new UserRepository(supabaseClient)
}
