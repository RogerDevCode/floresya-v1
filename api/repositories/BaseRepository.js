/**
 * Procesado por B
 */

/**
 * Enhanced Base Repository with Performance Optimization
 * Proporciona operaciones CRUD comunes con optimización de rendimiento
 * Implementa el patrón Repository con query optimization y monitoring
 * @abstract
 */

import { NotFoundError, ConflictError, DatabaseError } from '../errors/AppError.js'
import { executeQuery, getPerformanceStats } from '../config/connectionPool.js'
import { logger } from '../utils/logger.js'
import {
  createSchemaValidationService,
  SchemaValidationError
} from '../architecture/schema-validation-service.js'

export class BaseRepository {
  /**
   * @param {Object} supabaseClient - Cliente de Supabase (debe estar completamente inicializado)
   * @param {string} tableName - Nombre de la tabla
   */
  constructor(supabaseClient, tableName) {
    // ✅ FAIL FAST: Validar que el cliente no sea una promesa pendiente
    if (supabaseClient && typeof supabaseClient.then === 'function') {
      throw new Error(
        `BaseRepository: supabaseClient cannot be a Promise. Use Static Async Factory pattern instead.`
      )
    }

    if (!supabaseClient) {
      throw new Error(`BaseRepository: supabaseClient is required and must be initialized`)
    }

    if (!tableName || typeof tableName !== 'string') {
      throw new Error(`BaseRepository: tableName is required and must be a string`)
    }

    // ✅ ASIGNACIÓN LIMPIA: Solo aceptar cliente completamente resuelto
    this.supabase = supabaseClient
    this.table = tableName
    this.performanceMetrics = {
      totalQueries: 0,
      slowQueries: 0,
      averageResponseTime: 0,
      lastPerformanceCheck: Date.now()
    }
    this.schemaValidator = createSchemaValidationService(supabaseClient)
  }

  /**
   * ✅ STATIC ASYNC FACTORY: Método factory para crear instancias asíncronas
   * Este método debe ser usado por las clases hijas para asegurar inicialización completa
   * @param {Function} getClient - Función asíncrona que retorna el cliente de Supabase
   * @param {string} tableName - Nombre de la tabla
   * @returns {Promise<BaseRepository>} Instancia completamente inicializada
   */
  static async create(getClient, tableName) {
    try {
      // 🚀 ESPERAR INICIALIZACIÓN: Asegurar que el cliente esté completamente resuelto
      const supabaseClient = await getClient()

      // ✅ VALIDACIÓN: Verificar que el cliente esté funcional
      if (!supabaseClient || typeof supabaseClient.from !== 'function') {
        throw new Error(`BaseRepository.create: Invalid Supabase client returned from getClient`)
      }

      // 🏭 FABRICATION: Crear instancia solo con cliente resuelto
      return new this(supabaseClient, tableName)
    } catch (error) {
      throw new Error(`BaseRepository.create failed for table ${tableName}: ${error.message}`)
    }
  }

  /**
   * Record query performance metrics
   */
  recordQueryPerformance(responseTime, operation, queryInfo = {}) {
    this.performanceMetrics.totalQueries++

    // Track slow queries (>1000ms)
    if (responseTime > 1000) {
      this.performanceMetrics.slowQueries++
      logger.warn('Slow database query detected', {
        table: this.table,
        operation,
        responseTime,
        query: queryInfo.query || 'unknown',
        ...queryInfo
      })
    }

    // Update average response time
    const total = this.performanceMetrics.totalQueries
    const currentAvg = this.performanceMetrics.averageResponseTime
    this.performanceMetrics.averageResponseTime = (currentAvg * (total - 1) + responseTime) / total

    // Performance check every 100 queries
    if (this.performanceMetrics.totalQueries % 100 === 0) {
      this.checkPerformanceThresholds()
    }
  }

  /**
   * Check performance thresholds and log warnings
   */
  checkPerformanceThresholds() {
    const { totalQueries, slowQueries, averageResponseTime } = this.performanceMetrics
    const slowQueryRate = (slowQueries / totalQueries) * 100

    if (slowQueryRate > 10) {
      // More than 10% slow queries
      logger.error('High slow query rate detected', {
        table: this.table,
        slowQueryRate: `${slowQueryRate.toFixed(2)}%`,
        slowQueries,
        totalQueries,
        averageResponseTime: `${averageResponseTime.toFixed(2)}ms`
      })
    }

    if (averageResponseTime > 500) {
      // Average response time > 500ms
      logger.warn('High average response time', {
        table: this.table,
        averageResponseTime: `${averageResponseTime.toFixed(2)}ms`,
        totalQueries
      })
    }

    this.performanceMetrics.lastPerformanceCheck = Date.now()
  }

  /**
   * Execute query with performance monitoring and retry logic
   */
  async executeOptimizedQuery(queryFn, operation, queryInfo = {}) {
    const startTime = Date.now()

    try {
      const result = await executeQuery(
        async () => {
          return await queryFn()
        },
        {
          retries: 3,
          timeout: 30000
        }
      )

      const responseTime = Date.now() - startTime
      this.recordQueryPerformance(responseTime, operation, queryInfo)

      return result
    } catch (error) {
      const responseTime = Date.now() - startTime
      this.recordQueryPerformance(responseTime, operation, { ...queryInfo, error: true })
      throw error
    }
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      slowQueryRate:
        this.performanceMetrics.totalQueries > 0
          ? (
              (this.performanceMetrics.slowQueries / this.performanceMetrics.totalQueries) *
              100
            ).toFixed(2) + '%'
          : '0%'
    }
  }

  /**
   * Crear nuevo registro con optimización
   * @param {Object} data - Datos del registro
   * @returns {Promise<Object>} Registro creado
   */
  async create(data) {
    const queryInfo = {
      operation: 'create',
      table: this.table,
      query: `INSERT INTO ${this.table}`,
      recordCount: 1
    }

    return await this.executeOptimizedQuery(
      async () => {
        const { data: result, error } = await this.supabase
          .from(this.table)
          .insert(data)
          .select()
          .single()

        if (error) {
          throw this.handleError(error, 'create')
        }

        return result
      },
      'create',
      queryInfo
    )
  }

  /**
   * Obtener registro por ID
   * @param {number} id - ID del registro
   * @param {boolean} includeInactive - Incluir registros inactivos
   * @returns {Promise<Object>} Registro encontrado
   * @note ASSUMES table has 'active' column. Override in repositories where this doesn't apply.
   */
  async findById(id, includeInactive = false) {
    let query = this.supabase.from(this.table).select('*').eq('id', id)

    if (!includeInactive) {
      query = query.eq('active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw this.handleError(error, 'findById', { id })
    }

    return data
  }

  /**
   * Obtener todos los registros con filtros y optimización
   * @param {Object} filters - Filtros a aplicar
   * @param {Object} options - Opciones adicionales (orden, límites)
   * @returns {Promise<Array>} Lista de registros
   */
  async findAll(filters = {}, options = {}) {
    const queryInfo = {
      operation: 'findAll',
      table: this.table,
      filters: Object.keys(filters).length,
      hasLimit: !!options.limit,
      orderBy: options.orderBy || 'created_at'
    }

    return await this.executeOptimizedQuery(
      async () => {
        let query = this.supabase.from(this.table).select('*')

        // Aplicar filtros con optimización
        if (filters.role) {
          query = query.eq('role', filters.role)
        }

        if (filters.email_verified !== undefined) {
          query = query.eq('email_verified', filters.email_verified)
        }

        if (filters.search) {
          // Optimized search with proper indexing assumptions
          query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`)
        }

        if (filters.featured !== undefined) {
          query = query.eq('featured', filters.featured)
        }

        // Incluir inactivos solo si se especifica explícitamente
        // @note ASSUMES 'active' column exists
        if (!filters.includeDeactivated) {
          query = query.eq('active', true)
        }

        // Aplicar ordenamiento
        const orderBy = options.orderBy || 'created_at'
        query = query.order(orderBy, { ascending: options.ascending || false })

        // Aplicar límites con optimizaciones
        if (options.limit !== undefined) {
          const offset = options.offset || 0
          query = query.range(offset, offset + options.limit - 1)

          // Log large queries for optimization review
          if (options.limit > 1000) {
            logger.warn('Large query limit detected', {
              table: this.table,
              limit: options.limit,
              offset,
              filters
            })
          }
        }

        const { data, error } = await query

        if (error) {
          throw this.handleError(error, 'findAll', { filters, options })
        }

        return data || []
      },
      'findAll',
      queryInfo
    )
  }

  /**
   * Batch operations for multiple records
   * @param {Array} operations - Array of operation objects { action, data, id }
   * @returns {Promise<Object>} Results summary
   */
  async batchOperations(operations) {
    const results = {
      successful: [],
      failed: [],
      total: operations.length
    }

    const startTime = Date.now()

    for (const operation of operations) {
      try {
        let result
        switch (operation.action) {
          case 'create':
            result = await this.create(operation.data)
            break
          case 'update':
            result = await this.update(operation.id, operation.data)
            break
          case 'delete':
            result = await this.delete(operation.id, operation.auditInfo)
            break
          default:
            throw new Error(`Unknown batch operation: ${operation.action}`)
        }
        results.successful.push({ operation, result })
      } catch (error) {
        results.failed.push({ operation, error: error.message })
      }
    }

    const responseTime = Date.now() - startTime
    this.recordQueryPerformance(responseTime, 'batchOperations', {
      totalOperations: operations.length,
      successful: results.successful.length,
      failed: results.failed.length
    })

    logger.info('Batch operations completed', {
      table: this.table,
      total: results.total,
      successful: results.successful.length,
      failed: results.failed.length,
      responseTime
    })

    return results
  }

  /**
   * Actualizar registro por ID
   * @param {number} id - ID del registro
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Registro actualizado
   */
  async update(id, data) {
    const { data: result, error } = await this.supabase
      .from(this.table)
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw this.handleError(error, 'update', { id, data })
    }

    return result
  }

  /**
   * Soft delete (marcar como inactivo)
   * @param {number} id - ID del registro
   * @param {Object} auditInfo - Información de auditoría
   * @returns {Promise<Object>} Registro eliminado
   * @note Validates 'active' column exists before proceeding
   */
  async delete(id, auditInfo = {}) {
    // Validate schema before proceeding
    await this.validateSoftDeleteSchema()
    const updateData = {
      active: false,
      deleted_at: new Date().toISOString(),
      deleted_by: auditInfo.deletedBy || null,
      deletion_reason: auditInfo.reason || 'Not specified',
      deletion_ip: auditInfo.ipAddress || null
    }

    const { data, error } = await this.supabase
      .from(this.table)
      .update(updateData)
      .eq('id', id)
      .eq('active', true)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError(`${this.table} not found`, { table: this.table })
      }
      throw this.handleError(error, 'delete', { id, auditInfo })
    }

    return data
  }

  /**
   * Reactivar registro soft-deleted
   * @param {number} id - ID del registro
   * @param {number} reactivatedBy - ID del usuario que reactiva
   * @returns {Promise<Object>} Registro reactivado
   * @note Validates 'active' column exists before proceeding
   */
  async reactivate(id, reactivatedBy = null) {
    // Validate schema before proceeding
    await this.validateSoftDeleteSchema()
    const updateData = {
      active: true,
      deleted_at: null,
      deleted_by: null,
      deletion_reason: null,
      deletion_ip: null,
      reactivated_at: new Date().toISOString(),
      reactivated_by: reactivatedBy
    }

    const { data, error } = await this.supabase
      .from(this.table)
      .update(updateData)
      .eq('id', id)
      .eq('active', false)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ConflictError(`${this.table} already active`, { table: this.table })
      }
      throw this.handleError(error, 'reactivate', { id, reactivatedBy })
    }

    return data
  }

  /**
   * Verificar si existe un registro
   * @param {Object} criteria - Criterios de búsqueda
   * @returns {Promise<boolean>} True si existe
   */
  async exists(criteria) {
    let query = this.supabase.from(this.table).select('id', { count: 'exact', head: true })

    Object.keys(criteria).forEach(key => {
      query = query.eq(key, criteria[key])
    })

    const { count, error } = await query

    if (error) {
      throw this.handleError(error, 'exists', { criteria })
    }

    return count > 0
  }

  /**
   * Contar registros con filtros
   * @param {Object} filters - Filtros a aplicar
   * @returns {Promise<number>} Número de registros
   */
  async count(filters = {}) {
    let query = this.supabase.from(this.table).select('*', { count: 'exact', head: true })

    Object.keys(filters).forEach(key => {
      query = query.eq(key, filters[key])
    })

    const { count, error } = await query

    if (error) {
      throw this.handleError(error, 'count', { filters })
    }

    return count
  }

  /**
   * Manejar errores de Supabase con enhanced logging
   * @param {Object} error - Error de Supabase
   * @param {string} operation - Operación que falló
   * @param {Object} context - Contexto adicional
   * @returns {Error} Error formateado
   */
  handleError(error, operation, context = {}) {
    // Enhanced error logging
    logger.error(`Database error in ${this.table}.${operation}`, {
      error: error.message,
      code: error.code,
      operation,
      context,
      table: this.table,
      timestamp: new Date().toISOString()
    })

    // Personalizar mensajes de error según el código
    if (error.code === '23505') {
      // Unique violation
      return new Error(`Duplicate entry in ${this.table}: ${error.message}`)
    }

    if (error.code === '23503') {
      // Foreign key violation
      return new Error(`Referenced record not found in ${this.table}: ${error.message}`)
    }

    if (error.code === '23502') {
      // Not null violation
      return new Error(`Required field missing in ${this.table}: ${error.message}`)
    }

    // Error genérico
    return new Error(`Database error in ${this.table}.${operation}: ${error.message}`)
  }

  /**
   * Get comprehensive optimization report
   */
  getOptimizationReport() {
    const performanceMetrics = this.getPerformanceMetrics()
    const connectionStats = getPerformanceStats()

    return {
      table: this.table,
      performance: performanceMetrics,
      connection: connectionStats,
      recommendations: this.generateRecommendations(),
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = []
    const { totalQueries, slowQueryRate, averageResponseTime } = this.performanceMetrics

    if (totalQueries === 0) {
      return recommendations
    }

    // Slow query recommendations
    if (slowQueryRate > 10) {
      recommendations.push({
        type: 'PERFORMANCE',
        priority: 'HIGH',
        issue: `High slow query rate: ${slowQueryRate}%`,
        recommendation: 'Consider adding database indexes or optimizing query structure',
        impact: 'High'
      })
    }

    // Response time recommendations
    if (averageResponseTime > 500) {
      recommendations.push({
        type: 'RESPONSE_TIME',
        priority: 'MEDIUM',
        issue: `High average response time: ${averageResponseTime.toFixed(2)}ms`,
        recommendation: 'Review query complexity and consider caching frequently accessed data',
        impact: 'Medium'
      })
    }

    // Query volume recommendations
    if (totalQueries > 10000) {
      recommendations.push({
        type: 'VOLUME',
        priority: 'LOW',
        issue: `High query volume: ${totalQueries} queries`,
        recommendation: 'Consider implementing query result caching or batch operations',
        impact: 'Low'
      })
    }

    return recommendations
  }

  /**
   * Reset performance metrics
   */
  resetMetrics() {
    this.performanceMetrics = {
      totalQueries: 0,
      slowQueries: 0,
      averageResponseTime: 0,
      lastPerformanceCheck: Date.now()
    }

    logger.info(`Performance metrics reset for table: ${this.table}`)
  }

  /**
   * Validate that table supports soft delete operations
   * @throws {SchemaValidationError} When table doesn't support soft delete
   * @throws {DatabaseError} When schema validation fails
   */
  async validateSoftDeleteSchema() {
    try {
      const validation = await this.schemaValidator.getSoftDeleteValidation(this.table)

      if (!validation.tableExists) {
        throw new SchemaValidationError(
          `Table ${this.table} does not exist`,
          this.table,
          validation
        )
      }

      if (!validation.canPerformSoftDelete) {
        const missingCols = validation.missingColumns.join(', ')
        throw new SchemaValidationError(
          `Table ${this.table} does not support soft delete operations. Missing columns: ${missingCols}`,
          this.table,
          validation
        )
      }

      // Log warnings for incomplete audit support
      if (!validation.hasFullAuditSupport) {
        logger.warn(`Table ${this.table} has incomplete audit support`, {
          table: this.table,
          missingAuditColumns: validation.missingColumns.filter(col =>
            ['deleted_at', 'deleted_by', 'deletion_reason', 'deletion_ip'].includes(col)
          ),
          recommendations: validation.recommendations
        })
      }

      return validation
    } catch (error) {
      if (error instanceof SchemaValidationError) {
        throw error
      }

      logger.error(`Schema validation failed for ${this.table}:`, error)
      throw new DatabaseError('SCHEMA_VALIDATION', this.table, error)
    }
  }

  /**
   * Get schema validation information for the table
   * @returns {Promise<Object>} Schema validation result
   */
  async getSchemaValidation() {
    return await this.schemaValidator.getSoftDeleteValidation(this.table)
  }

  /**
   * Check if table supports soft delete without throwing errors
   * @returns {Promise<boolean>} True if soft delete is supported
   */
  async hasSoftDeleteSupport() {
    try {
      const validation = await this.schemaValidator.getSoftDeleteValidation(this.table)
      return validation.canPerformSoftDelete
    } catch (error) {
      logger.warn(`Error checking soft delete support for ${this.table}:`, error)
      return false
    }
  }
}
