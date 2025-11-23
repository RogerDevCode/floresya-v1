/**
 * Enhanced Supabase Client Mock Implementation
 * Provides realistic async behavior, error simulation, and query tracking
 * Based on official Supabase documentation and best practices
 */
// @ts-nocheck

// PostgreSQL error codes for realistic error simulation
// Based on PostgreSQL official documentation and Supabase patterns
export const POSTGRESQL_ERROR_CODES = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
  STRING_DATA_RIGHT_TRUNCATION: '22001',
  NUMERIC_VALUE_OUT_OF_RANGE: '22003',
  INVALID_TEXT_REPRESENTATION: '22P02',
  UNDEFINED_TABLE: '42P01',
  UNDEFINED_COLUMN: '42703',
  DUPLICATE_TABLE: '42P07',
  SYNTAX_ERROR: '42601',
  INSUFFICIENT_PRIVILEGE: '42501',
  CONNECTION_FAILURE: '08006',
  CONNECTION_TIMEOUT: '08001',
  TOO_MANY_CONNECTIONS: '53300',
  INTERNAL_ERROR: 'XX000',
  SERIALIZATION_FAILURE: '40001',
  DEADLOCK_DETECTED: '40P01'
}

// Custom Application Error for better error mapping
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', context = {}) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.context = context
    this.timestamp = new Date().toISOString()
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// Error mapping utilities following official Supabase error patterns
export const ErrorMapper = {
  mapPostgresErrorToAppError: postgresError => {
    const { code: postgresCode, details } = postgresError

    switch (postgresCode) {
      case POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION:
        return new AppError('Resource already exists', 409, 'RESOURCE_CONFLICT', {
          originalError: postgresError,
          field: details?.constraint
        })

      case POSTGRESQL_ERROR_CODES.FOREIGN_KEY_VIOLATION:
        return new AppError('Referenced resource does not exist', 400, 'INVALID_REFERENCE', {
          originalError: postgresError,
          field: details?.constraint
        })

      case POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION:
        return new AppError('Required field is missing', 400, 'REQUIRED_FIELD', {
          originalError: postgresError,
          field: details?.column
        })

      case POSTGRESQL_ERROR_CODES.CHECK_VIOLATION:
        return new AppError('Data validation failed', 400, 'VALIDATION_ERROR', {
          originalError: postgresError,
          field: details?.constraint
        })

      case POSTGRESQL_ERROR_CODES.CONNECTION_FAILURE:
      case POSTGRESQL_ERROR_CODES.CONNECTION_TIMEOUT:
        return new AppError('Database connection error', 503, 'DATABASE_UNAVAILABLE', {
          originalError: postgresError
        })

      case POSTGRESQL_ERROR_CODES.INSUFFICIENT_PRIVILEGE:
        return new AppError('Insufficient permissions', 403, 'PERMISSION_DENIED', {
          originalError: postgresError
        })

      case POSTGRESQL_ERROR_CODES.SERIALIZATION_FAILURE:
      case POSTGRESQL_ERROR_CODES.DEADLOCK_DETECTED:
        return new AppError('Concurrent modification detected', 409, 'CONCURRENCY_ERROR', {
          originalError: postgresError
        })

      default:
        return new AppError('Internal database error', 500, 'DATABASE_ERROR', {
          originalError: postgresError
        })
    }
  }
}

// Enhanced Performance monitoring mock following Supabase patterns
export class PerformanceMonitor {
  constructor(options = {}) {
    this.queries = []
    this.enabled = true
    this.thresholds = {
      slowQueryThreshold: options.slowQueryThreshold || 1000, // 1 second
      verySlowQueryThreshold: options.verySlowQueryThreshold || 5000, // 5 seconds
      maxConcurrentQueries: options.maxConcurrentQueries || 10,
      ...options.thresholds
    }
    this.concurrentQueries = 0
    this.maxConcurrentReached = 0
    this.boundaryViolations = []
  }

  startQuery(query) {
    if (!this.enabled) {
      return null
    }

    this.concurrentQueries++
    this.maxConcurrentReached = Math.max(this.maxConcurrentReached, this.concurrentQueries)

    const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.queries.push({
      id: queryId,
      ...query,
      startTime: performance.now(),
      endTime: null,
      duration: null,
      success: null,
      error: null,
      concurrentCount: this.concurrentQueries,
      thresholdViolation: null
    })
    return queryId
  }

  endQuery(queryId, success = true, error = null) {
    if (!this.enabled || !queryId) {
      return
    }

    this.concurrentQueries = Math.max(0, this.concurrentQueries - 1)

    const query = this.queries.find(q => q.id === queryId)
    if (query) {
      query.endTime = performance.now()
      query.duration = query.endTime - query.startTime
      query.success = success
      query.error = error

      // Check for performance boundary violations
      if (query.duration > this.thresholds.verySlowQueryThreshold) {
        query.thresholdViolation = 'VERY_SLOW'
        this.boundaryViolations.push({
          queryId,
          type: 'VERY_SLOW',
          duration: query.duration,
          threshold: this.thresholds.verySlowQueryThreshold,
          timestamp: new Date().toISOString()
        })
      } else if (query.duration > this.thresholds.slowQueryThreshold) {
        query.thresholdViolation = 'SLOW'
        this.boundaryViolations.push({
          queryId,
          type: 'SLOW',
          duration: query.duration,
          threshold: this.thresholds.slowQueryThreshold,
          timestamp: new Date().toISOString()
        })
      }
    }
  }

  getMetrics() {
    const totalQueries = this.queries.length
    const successfulQueries = this.queries.filter(q => q.success).length
    const failedQueries = totalQueries - successfulQueries
    const avgDuration =
      totalQueries > 0
        ? this.queries.reduce((sum, q) => sum + (q.duration || 0), 0) / totalQueries
        : 0

    const slowQueries = this.queries.filter(
      q => q.thresholdViolation === 'SLOW' || q.thresholdViolation === 'VERY_SLOW'
    ).length

    const verySlowQueries = this.queries.filter(q => q.thresholdViolation === 'VERY_SLOW').length

    return {
      totalQueries,
      successfulQueries,
      failedQueries,
      successRate: totalQueries > 0 ? (successfulQueries / totalQueries) * 100 : 0,
      averageDuration: avgDuration,
      slowQueries,
      verySlowQueries,
      slowQueryRate: totalQueries > 0 ? (slowQueries / totalQueries) * 100 : 0,
      maxConcurrentQueries: this.maxConcurrentReached,
      boundaryViolations: [...this.boundaryViolations],
      queries: [...this.queries]
    }
  }

  getBoundaryViolations() {
    return {
      violations: [...this.boundaryViolations],
      summary: {
        total: this.boundaryViolations.length,
        slow: this.boundaryViolations.filter(v => v.type === 'SLOW').length,
        verySlow: this.boundaryViolations.filter(v => v.type === 'VERY_SLOW').length
      }
    }
  }

  checkPerformanceBoundaries() {
    const metrics = this.getMetrics()
    const issues = []

    if (metrics.slowQueryRate > 20) {
      issues.push({
        type: 'HIGH_SLOW_QUERY_RATE',
        message: `Slow query rate is ${metrics.slowQueryRate.toFixed(2)}% (threshold: 20%)`,
        severity: 'medium'
      })
    }

    if (metrics.maxConcurrentQueries > this.thresholds.maxConcurrentQueries) {
      issues.push({
        type: 'CONCURRENT_QUERY_LIMIT_EXCEEDED',
        message: `Max concurrent queries (${metrics.maxConcurrentQueries}) exceeds threshold (${this.thresholds.maxConcurrentQueries})`,
        severity: 'high'
      })
    }

    if (metrics.averageDuration > this.thresholds.slowQueryThreshold) {
      issues.push({
        type: 'HIGH_AVERAGE_DURATION',
        message: `Average query duration (${metrics.averageDuration.toFixed(2)}ms) exceeds slow threshold (${this.thresholds.slowQueryThreshold}ms)`,
        severity: 'medium'
      })
    }

    return {
      passed: issues.length === 0,
      issues,
      metrics
    }
  }

  reset() {
    this.queries = []
    this.concurrentQueries = 0
    this.maxConcurrentReached = 0
    this.boundaryViolations = []
  }

  enable() {
    this.enabled = true
  }

  disable() {
    this.enabled = false
  }

  updateThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds }
  }
}

// Mock data storage with realistic Supabase behavior
export class MockDataStore {
  constructor() {
    this.data = new Map()
    this.initializeDefaultData()
  }

  initializeDefaultData() {
    // Initialize all tables from the actual DB_SCHEMA to match production structure
    const now = new Date().toISOString()

    // Users table - enhanced with more realistic data
    this.data.set('users', [
      {
        id: 1,
        email: 'user1@example.com',
        password_hash: '$2a$10$hashedpassword1',
        full_name: 'User One',
        phone: '+1234567890',
        role: 'user',
        active: true,
        email_verified: true,
        created_at: now,
        updated_at: now,
        full_name_normalized: 'user one',
        email_normalized: 'user1@example.com'
      },
      {
        id: 2,
        email: 'user2@example.com',
        password_hash: '$2a$10$hashedpassword2',
        full_name: 'User Two',
        phone: '+0987654321',
        role: 'admin',
        active: true,
        email_verified: false,
        created_at: now,
        updated_at: now,
        full_name_normalized: 'user two',
        email_normalized: 'user2@example.com'
      },
      {
        id: 3,
        email: 'inactive@example.com',
        password_hash: '$2a$10$inactivepassword',
        full_name: 'Inactive User',
        phone: '+1555123456',
        role: 'user',
        active: false,
        email_verified: true,
        created_at: now,
        updated_at: now,
        full_name_normalized: 'inactive user',
        email_normalized: 'inactive@example.com'
      },
      {
        id: 4,
        email: 'unverified@example.com',
        password_hash: '$2a$10$unverifiedpassword',
        full_name: 'Unverified User',
        phone: '+1555987654',
        role: 'user',
        active: true,
        email_verified: false,
        created_at: now,
        updated_at: now,
        full_name_normalized: 'unverified user',
        email_normalized: 'unverified@example.com'
      },
      {
        id: 5,
        email: 'admin2@example.com',
        password_hash: '$2a$10$adminpassword2',
        full_name: 'Admin Two',
        phone: '+1555111111',
        role: 'admin',
        active: true,
        email_verified: true,
        created_at: now,
        updated_at: now,
        full_name_normalized: 'admin two',
        email_normalized: 'admin2@example.com'
      }
    ])

    // Profiles table - matching actual schema
    this.data.set('profiles', [
      {
        id: 1,
        user_id: 1,
        bio: 'User One bio',
        avatar_url: 'https://example.com/avatars/user1.jpg',
        phone: '+1234567890',
        address: 'User Address 1',
        city: 'Caracas',
        country: 'Venezuela',
        date_of_birth: '1990-01-01',
        gender: 'other',
        preferences: {},
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        id: 2,
        user_id: 2,
        bio: 'User Two bio',
        avatar_url: null,
        phone: '+0987654321',
        address: 'User Address 2',
        city: 'Valencia',
        country: 'Venezuela',
        date_of_birth: '1985-05-15',
        gender: 'female',
        preferences: {},
        created_at: now,
        updated_at: now,
        deleted_at: null
      }
    ])

    // Occasions table - matching actual schema
    this.data.set('occasions', [
      {
        id: 1,
        name: 'San Valentín',
        description: 'Día del amor y la amistad',
        active: true,
        display_order: 1,
        created_at: now,
        updated_at: now,
        slug: 'san-valentin'
      },
      {
        id: 2,
        name: 'Cumpleaños',
        description: 'Celebra un cumpleaños especial',
        active: true,
        display_order: 2,
        created_at: now,
        updated_at: now,
        slug: 'cumpleanos'
      }
    ])

    // Products table - matching actual schema
    this.data.set('products', [
      {
        id: 1,
        name: 'Rosas Rojas Premium',
        summary: 'Rosas rojas de la más alta calidad',
        description: 'Hermosas rosas rojas frescas, perfectas para ocasiones especiales',
        price_usd: 29.99,
        price_ves: 750000,
        stock: 50,
        sku: 'ROS-RED-PREM-001',
        active: true,
        featured: true,
        carousel_order: 1,
        created_at: now,
        updated_at: now,
        name_normalized: 'rosas rojas premium',
        description_normalized: 'hermosas rosas rojas frescas perfectas para ocasiones especiales'
      },
      {
        id: 2,
        name: 'Tulipanes Amarillos',
        summary: 'Tulipanes amarillos vibrantes',
        description: 'Tulipanes amarillos frescos que transmiten alegría y optimismo',
        price_usd: 24.99,
        price_ves: 625000,
        stock: 30,
        sku: 'TUL-YEL-VIB-002',
        active: true,
        featured: false,
        carousel_order: null,
        created_at: now,
        updated_at: now,
        name_normalized: 'tulipanes amarillos',
        description_normalized: 'tulipanes amarillos frescos que transmiten alegria y optimismo'
      }
    ])

    // Product occasions junction table
    this.data.set('product_occasions', [
      {
        id: 1,
        product_id: 1,
        occasion_id: 1,
        created_at: now
      },
      {
        id: 2,
        product_id: 1,
        occasion_id: 2,
        created_at: now
      }
    ])

    // Product images table
    this.data.set('product_images', [
      {
        id: 1,
        product_id: 1,
        url: 'https://example.com/images/rosas-rojas-1.jpg',
        image_index: 0,
        size: 'large',
        is_primary: true,
        file_hash: 'abc123def456',
        mime_type: 'image/jpeg',
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        product_id: 1,
        url: 'https://example.com/images/rosas-rojas-thumb.jpg',
        image_index: 0,
        size: 'thumb',
        is_primary: true,
        file_hash: 'def456ghi789',
        mime_type: 'image/jpeg',
        created_at: now,
        updated_at: now
      }
    ])

    // Orders table - matching actual schema
    this.data.set('orders', [
      {
        id: 1,
        user_id: 1,
        customer_email: 'customer1@example.com',
        customer_name: 'Customer One',
        customer_phone: '+1234567890',
        delivery_address: 'Calle Principal 123, Caracas',
        delivery_date: '2024-02-14',
        delivery_time_slot: '10:00-12:00',
        delivery_notes: 'Llamar antes de entregar',
        status: 'pending',
        total_amount_usd: 59.98,
        total_amount_ves: 1500000,
        currency_rate: 25000,
        notes: 'Pedido especial',
        admin_notes: null,
        created_at: now,
        updated_at: now,
        customer_name_normalized: 'customer one',
        customer_email_normalized: 'customer1@example.com'
      }
    ])

    // Order items table
    this.data.set('order_items', [
      {
        id: 1,
        order_id: 1,
        product_id: 1,
        product_name: 'Rosas Rojas Premium',
        product_summary: 'Rosas rojas de la más alta calidad',
        unit_price_usd: 29.99,
        unit_price_ves: 750000,
        quantity: 2,
        subtotal_usd: 59.98,
        subtotal_ves: 1500000,
        created_at: now,
        updated_at: now
      }
    ])

    // Order status history
    this.data.set('order_status_history', [
      {
        id: 1,
        order_id: 1,
        old_status: null,
        new_status: 'pending',
        notes: 'Order created',
        changed_by: 'system',
        created_at: now
      }
    ])

    // Payment methods table
    this.data.set('payment_methods', [
      {
        id: 1,
        name: 'Transferencia Bancaria',
        type: 'bank_transfer',
        description: 'Pago mediante transferencia bancaria',
        account_info: 'Cuenta: 123456789, Banco: XYZ',
        active: true,
        display_order: 1,
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        name: 'Pago Móvil',
        type: 'mobile_payment',
        description: 'Pago a través de billetera móvil',
        account_info: 'Teléfono: +58 123 456 7890',
        active: true,
        display_order: 2,
        created_at: now,
        updated_at: now
      }
    ])

    // Payments table
    this.data.set('payments', [
      {
        id: 1,
        order_id: 1,
        payment_method_id: 1,
        user_id: 1,
        amount_usd: 59.98,
        amount_ves: 1500000,
        currency_rate: 25000,
        status: 'pending',
        payment_method_name: 'Transferencia Bancaria',
        transaction_id: null,
        reference_number: 'REF001',
        payment_details: 'Pago pendiente de confirmación',
        receipt_image_url: null,
        admin_notes: null,
        payment_date: null,
        confirmed_date: null,
        created_at: now,
        updated_at: now
      }
    ])

    // Settings table
    this.data.set('settings', [
      {
        id: 1,
        key: 'site_name',
        value: 'FloresYa',
        description: 'Nombre del sitio web',
        type: 'string',
        is_public: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        key: 'currency_rate',
        value: '25000',
        description: 'Tasa de cambio USD/VES',
        type: 'number',
        is_public: false,
        created_at: now,
        updated_at: now
      }
    ])
  }

  getTable(tableName) {
    return this.data.get(tableName) || []
  }

  setTable(tableName, records) {
    this.data.set(tableName, records)
  }

  addRecord(tableName, record) {
    const table = this.getTable(tableName)
    const now = new Date().toISOString()
    const newId = this.generateId(table)
    const baseRecord = {
      ...record,
      id: newId,
      created_at: now,
      updated_at: now
    }

    // Add table-specific system fields
    let enhancedRecord = { ...baseRecord }

    if (tableName === 'users') {
      enhancedRecord = {
        ...baseRecord,
        full_name_normalized: record.full_name ? record.full_name.toLowerCase() : null,
        email_normalized: record.email ? record.email.toLowerCase() : null
      }
    } else if (tableName === 'profiles') {
      enhancedRecord = {
        ...baseRecord,
        deleted_at: null
      }
    }

    table.push(enhancedRecord)
    return enhancedRecord
  }

  updateRecord(tableName, id, updates) {
    const table = this.getTable(tableName)
    const index = table.findIndex(record => record.id === id)
    if (index !== -1) {
      // Use provided updated_at if present, otherwise generate new timestamp with offset
      let newTimestamp
      if (updates.updated_at) {
        newTimestamp = updates.updated_at
      } else {
        // Ensure timestamp is always different by using current timestamp plus random offset
        const now = new Date()
        const currentTimestamp = now.getTime()
        // Add random offset between 2-10ms to ensure different timestamp
        const randomOffset = Math.floor(Math.random() * 8) + 2
        newTimestamp = new Date(currentTimestamp + randomOffset).toISOString()
      }

      const baseUpdate = { ...updates, updated_at: newTimestamp }

      // Update normalized fields for users table
      let enhancedUpdate = { ...baseUpdate }
      if (tableName === 'users') {
        enhancedUpdate = {
          ...baseUpdate,
          ...(updates.full_name && { full_name_normalized: updates.full_name.toLowerCase() }),
          ...(updates.email && { email_normalized: updates.email.toLowerCase() })
        }
      }

      table[index] = { ...table[index], ...enhancedUpdate }
      return table[index]
    }
    return null
  }

  deleteRecord(tableName, id) {
    const table = this.getTable(tableName)
    const index = table.findIndex(record => record.id === id)
    if (index !== -1) {
      return table.splice(index, 1)[0]
    }
    return null
  }

  generateId(table) {
    if (table.length === 0) {
      return 1
    }
    return Math.max(...table.map(record => record.id)) + 1
  }

  reset() {
    this.data.clear()
    this.initializeDefaultData()
  }
}

// Enhanced Query builder with realistic Supabase behavior
export class MockQueryBuilder {
  constructor(tableName, mockDataStore, performanceMonitor) {
    this.tableName = tableName
    this.mockDataStore = mockDataStore
    this.performanceMonitor = performanceMonitor
    this.queryId = null

    // Query tracking
    this.filters = []
    this.selectColumns = '*'
    this.orderBy = undefined
    this._limit = undefined
    this._offset = undefined
    this._single = false
    this._maybeSingle = false

    // Advanced query features
    this.joins = []
    this.groupBy = null
    this.having = []
    this.distinct = false
    this.count = false
    this.avg = null
    this.sum = null
    this.min = null
    this.max = null

    // Error simulation
    this.simulatedError = null
    this.simulatedDelay = 0
    this.simulatedTimeout = false
    this.simulatedConnectionError = false
  }

  // Method chaining support
  select(columns = '*', options = {}) {
    // Handle count/head options - check if this is a count/head query
    if (typeof columns === 'string' && options && (options.count || options.head)) {
      this._count = options.count
      this._head = options.head
      this.selectColumns = columns
      return this
    }

    // Parse the select string for relations
    if (typeof columns === 'string') {
      // Clean up the string and parse for relations
      const cleanedSelect = columns.replace(/\s+/g, ' ').trim()

      // Look for relation patterns like "profiles (*)", "product_images (*)", etc.
      // Also handle nested patterns like "product_occasions (occasions (*))"
      const relationPattern = /(\w+)\s*\(\s*([^)]+)\s*\)/g
      const foundRelations = []
      let match

      while ((match = relationPattern.exec(cleanedSelect)) !== null) {
        const relation = match[1]
        const innerContent = match[2].trim()

        // Parse nested relations
        const nestedPattern = /(\w+)\s*\(\s*\*\s*\)/g
        let nestedMatch
        const nestedRelations = []

        while ((nestedMatch = nestedPattern.exec(innerContent)) !== null) {
          nestedRelations.push({
            relation: nestedMatch[1],
            columns: '*'
          })
        }

        foundRelations.push({
          relation,
          columns: innerContent.includes('*') ? '*' : innerContent,
          nestedRelations: nestedRelations.length > 0 ? nestedRelations : undefined
        })
      }

      // Add found relations to joins
      if (foundRelations.length > 0) {
        this.joins.push(...foundRelations)
      }

      // For simple cases, keep the original columns
      // For complex cases with relations, we'll handle them in applyJoins
      if (foundRelations.length > 0) {
        this.selectColumns = '*'
      } else {
        this.selectColumns = columns
      }
    } else {
      this.selectColumns = columns
    }

    return this
  }

  // Advanced select with relations (simplified join simulation)
  selectRelation(relation, columns = '*') {
    this.joins.push({ relation, columns })
    return this
  }

  filter(column, operator, value) {
    this.filters.push({ column, operator, value })
    return this
  }

  eq(column, value) {
    return this.filter(column, 'eq', value)
  }

  neq(column, value) {
    return this.filter(column, 'neq', value)
  }

  gt(column, value) {
    return this.filter(column, 'gt', value)
  }

  gte(column, value) {
    return this.filter(column, 'gte', value)
  }

  lt(column, value) {
    return this.filter(column, 'lt', value)
  }

  lte(column, value) {
    return this.filter(column, 'lte', value)
  }

  like(column, pattern) {
    return this.filter(column, 'like', pattern)
  }

  ilike(column, pattern) {
    return this.filter(column, 'ilike', pattern)
  }

  in(column, values) {
    return this.filter(column, 'in', values)
  }

  is(column, value) {
    return this.filter(column, 'is', value)
  }

  order(column, { ascending = true } = {}) {
    this.orderBy = { column, ascending }
    return this
  }

  limit(count) {
    this._limit = count
    return this
  }

  range(from, to) {
    this._offset = from
    this._limit = to - from + 1
    return this
  }

  single() {
    this._single = true
    return this
  }

  maybeSingle() {
    this._maybeSingle = true
    return this
  }

  // INSERT operation
  insert(records) {
    this.operation = 'insert'
    this.insertData = records
    return this
  }

  // UPDATE operation
  update(updates) {
    this.operation = 'update'
    this.updateData = updates
    return this
  }

  // DELETE operation
  delete() {
    this.operation = 'delete'
    return this
  }

  // Error simulation methods
  simulateError(errorCode = POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION, message = 'Simulated error') {
    this.simulatedError = { code: errorCode, message, details: 'Simulated error details' }
    return this
  }

  simulateDelay(ms = 100) {
    this.simulatedDelay = ms
    return this
  }

  simulateTimeout() {
    this.simulatedTimeout = true
    return this
  }

  simulateConnectionError() {
    this.simulatedConnectionError = true
    return this
  }

  // Execute query with realistic async behavior
  async execute() {
    this.queryId = this.performanceMonitor
      ? this.performanceMonitor.startQuery({
          table: this.tableName,
          operation: this.operation || 'select',
          filters: this.filters,
          select: this.selectColumns,
          orderBy: this.orderBy,
          limit: this._limit,
          offset: this._offset,
          insertData: this.insertData,
          updateData: this.updateData,
          function: this.operation || 'select'
        })
      : null

    try {
      // Simulate network delay
      if (this.simulatedDelay > 0) {
        await this.delay(this.simulatedDelay)
      }

      // Add small random delay to simulate real concurrent execution
      // This helps ensure that concurrent queries actually overlap in time
      if (this.simulatedDelay === 0) {
        const randomDelay = Math.random() * 10 // 0-10ms random delay
        if (randomDelay > 1) {
          // Only add delay for some queries to create overlap
          await this.delay(randomDelay)
        }
      }

      // Simulate timeout
      if (this.simulatedTimeout) {
        await this.delay(30000) // 30 second timeout
        throw new Error('Connection timeout')
      }

      // Simulate connection error
      if (this.simulatedConnectionError) {
        throw new Error('Connection failed: Unable to connect to database')
      }

      // Simulate database error
      if (this.simulatedError) {
        throw this.simulatedError
      }

      // Execute the query based on operation type
      let data

      switch (this.operation) {
        case 'insert':
          data = this.executeInsert()
          break
        case 'update':
          data = this.executeUpdate()
          break
        case 'delete':
          data = this.executeDelete()
          break
        default:
          // SELECT operation
          data = this.mockDataStore.getTable(this.tableName)

          // Apply filters
          data = this.applyFilters(data)

          // Apply column selection
          if (this.selectColumns !== '*') {
            const columns = this.selectColumns.split(',').map(col => col.trim())
            data = data.map(record => {
              const result = {}
              columns.forEach(col => {
                if (Object.prototype.hasOwnProperty.call(record, col)) {
                  result[col] = record[col]
                }
              })
              return result
            })
          }

          // Apply joins/relations
          if (this.joins.length > 0) {
            data = this.applyJoins(data)
          }

          // Apply ordering
          if (this.orderBy) {
            data = this.applyOrdering(data)
          }

          // Apply pagination
          if (this._offset !== undefined) {
            data = data.slice(this._offset)
          }

          if (this._limit !== undefined) {
            data = data.slice(0, this._limit)
          }
          break
      }

      // Handle count/head options
      if (this._count || this._head) {
        const count = data.length
        if (this.performanceMonitor) {
          this.performanceMonitor.endQuery(this.queryId, true)
        }
        return { data: this._head ? null : data, count, error: null }
      }

      // Handle single/maybeSingle
      if (this._single || this._maybeSingle) {
        if (data.length === 0) {
          if (this._single) {
            const error = new Error('No rows returned')
            error.code = 'PGRST116'
            throw error
          }
          // maybeSingle returns null for no rows
          if (this.performanceMonitor) {
            this.performanceMonitor.endQuery(this.queryId, true)
          }
          return { data: null, error: null }
        }
        if (data.length > 1 && this._single) {
          const error = new Error('Multiple rows returned')
          error.code = 'PGRST117'
          throw error
        }
        data = data[0]
      }

      if (this.performanceMonitor) {
        this.performanceMonitor.endQuery(this.queryId, true)
      }
      return { data, error: null }
    } catch (error) {
      if (this.performanceMonitor) {
        this.performanceMonitor.endQuery(this.queryId, false, error)
      }
      return { data: null, error }
    }
  }

  // Make the query builder thenable for async/await
  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected)
  }

  catch(onRejected) {
    return this.execute().catch(onRejected)
  }

  finally(onFinally) {
    return this.execute().finally(onFinally)
  }

  // Helper methods
  applyFilters(data) {
    return data.filter(record => {
      return this.filters.every(filter => {
        const { column, operator, value } = filter
        const recordValue = record[column]

        switch (operator) {
          case 'eq':
            return recordValue === value
          case 'neq':
            return recordValue !== value
          case 'gt':
            return recordValue > value
          case 'gte':
            return recordValue >= value
          case 'lt':
            return recordValue < value
          case 'lte':
            return recordValue <= value
          case 'like': {
            if (typeof recordValue !== 'string' || typeof value !== 'string') {
              return false
            }
            // Convert SQL LIKE pattern to JavaScript regex
            let pattern = value
              .replace(/%/g, '.*') // % becomes .* (any chars)
              .replace(/_/g, '.') // _ becomes . (single char)
            // Add start and end anchors if not already present
            if (!pattern.startsWith('^')) {
              pattern = '^' + pattern
            }
            if (!pattern.endsWith('$')) {
              pattern = pattern + '$'
            }
            const regex = new RegExp(pattern)
            return regex.test(recordValue)
          }
          case 'ilike': {
            if (typeof recordValue !== 'string' || typeof value !== 'string') {
              return false
            }
            // Convert SQL LIKE pattern to JavaScript regex (case insensitive)
            let caseInsensitivePattern = value.replace(/%/g, '.*').replace(/_/g, '.')
            if (!caseInsensitivePattern.startsWith('^')) {
              caseInsensitivePattern = '^' + caseInsensitivePattern
            }
            if (!caseInsensitivePattern.endsWith('$')) {
              caseInsensitivePattern = caseInsensitivePattern + '$'
            }
            const caseInsensitiveRegex = new RegExp(caseInsensitivePattern, 'i')
            return caseInsensitiveRegex.test(recordValue)
          }
          case 'in':
            return Array.isArray(value) && value.includes(recordValue)
          case 'is':
            return (
              (value === null && recordValue === null) || (value !== null && recordValue !== null)
            )
          default:
            return true
        }
      })
    })
  }

  applyOrdering(data) {
    const { column, ascending } = this.orderBy
    return [...data].sort((a, b) => {
      const aVal = a[column]
      const bVal = b[column]

      if (aVal === null) {
        return ascending ? -1 : 1
      }
      if (bVal === null) {
        return ascending ? 1 : -1
      }

      if (aVal < bVal) {
        return ascending ? -1 : 1
      }
      if (aVal > bVal) {
        return ascending ? 1 : -1
      }
      return 0
    })
  }

  applyJoins(data) {
    // Simulate joins for related data based on the actual schema relationships
    return data.map(record => {
      const result = { ...record }

      this.joins.forEach(join => {
        const { relation, columns, nestedRelations } = join

        switch (relation) {
          case 'profiles':
            if (this.tableName === 'users') {
              const profile = this.mockDataStore
                .getTable('profiles')
                .find(p => p.user_id === record.id)
              if (profile) {
                // Always return profiles as an array for consistency
                result.profiles =
                  columns === '*' ? [profile] : [this.selectColumnsFromObject(profile, columns)]
              }
            }
            break

          case 'product_images':
            if (this.tableName === 'products') {
              const images = this.mockDataStore
                .getTable('product_images')
                .filter(img => img.product_id === record.id)
              if (images.length > 0) {
                result.product_images =
                  columns === '*'
                    ? images
                    : images.map(img => this.selectColumnsFromObject(img, columns))
              }
            }
            break

          case 'product_occasions':
            if (this.tableName === 'products') {
              const productOccasions = this.mockDataStore
                .getTable('product_occasions')
                .filter(po => po.product_id === record.id)
              if (productOccasions.length > 0) {
                // Keep original product_occasions structure
                const occasions = this.mockDataStore.getTable('occasions')

                // If we have nestedRelations like 'occasions (*)', join with occasions
                if (nestedRelations && nestedRelations.some(nr => nr.relation === 'occasions')) {
                  const enhancedProductOccasions = productOccasions
                    .map(po => {
                      const occasion = occasions.find(o => o.id === po.occasion_id)
                      return {
                        ...po,
                        occasions: occasion ? this.selectColumnsFromObject(occasion, '*') : null
                      }
                    })
                    .filter(po => po.occasions) // Keep only those with valid occasions
                  result.product_occasions = enhancedProductOccasions
                } else {
                  // For simple case, just return product_occasions with occasions info
                  const joinedData = productOccasions.map(po => {
                    const occasion = occasions.find(o => o.id === po.occasion_id)
                    return occasion ? { ...po, occasion } : po
                  })
                  result.product_occasions = joinedData
                }
              }
            }
            break

          case 'order_items':
            if (this.tableName === 'orders') {
              const items = this.mockDataStore
                .getTable('order_items')
                .filter(item => item.order_id === record.id)
              if (items.length > 0) {
                result.order_items =
                  columns === '*'
                    ? items
                    : items.map(item => this.selectColumnsFromObject(item, columns))
              }
            }
            break

          case 'payments':
            if (this.tableName === 'orders') {
              const payment = this.mockDataStore
                .getTable('payments')
                .find(p => p.order_id === record.id)
              if (payment) {
                result.payments =
                  columns === '*' ? payment : this.selectColumnsFromObject(payment, columns)
              }
            }
            break

          default:
            // For unknown relations, return empty array/object
            result[relation] = []
        }
      })

      return result
    })
  }

  selectColumnsFromObject(obj, columns) {
    if (typeof columns === 'string') {
      columns = columns.split(',').map(col => col.trim())
    }

    const result = {}
    columns.forEach(col => {
      if (Object.prototype.hasOwnProperty.call(obj, col)) {
        result[col] = obj[col]
      }
    })
    return result
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // INSERT operation implementation
  executeInsert() {
    const records = Array.isArray(this.insertData) ? this.insertData : [this.insertData]
    const insertedRecords = []

    for (const record of records) {
      const newRecord = this.mockDataStore.addRecord(this.tableName, record)
      insertedRecords.push(newRecord)
    }

    // Apply filters if any (for SELECT after INSERT)
    let result = insertedRecords
    if (this.filters.length > 0) {
      result = this.applyFilters(result)
    }

    return result
  }

  // UPDATE operation implementation
  executeUpdate() {
    const table = this.mockDataStore.getTable(this.tableName)
    const updatedRecords = []

    // Find records to update based on filters
    const recordsToUpdate = this.filters.length > 0 ? this.applyFilters([...table]) : [...table]

    // Update each record
    for (const record of recordsToUpdate) {
      const updatedRecord = this.mockDataStore.updateRecord(
        this.tableName,
        record.id,
        this.updateData
      )
      if (updatedRecord) {
        updatedRecords.push(updatedRecord)
      }
    }

    return updatedRecords
  }

  // DELETE operation implementation
  executeDelete() {
    const table = this.mockDataStore.getTable(this.tableName)
    const deletedRecords = []

    // Find records to delete based on filters
    const recordsToDelete = this.filters.length > 0 ? this.applyFilters([...table]) : [...table]

    // Delete each record
    for (const record of recordsToDelete) {
      const deletedRecord = this.mockDataStore.deleteRecord(this.tableName, record.id)
      if (deletedRecord) {
        deletedRecords.push(deletedRecord)
      }
    }

    return deletedRecords
  }
}

// Main Supabase client mock following official API patterns
export class SupabaseClientMock {
  constructor(options = {}) {
    this.url = options.url || 'https://mock-supabase.supabase.co'
    this.anonKey = options.anonKey || 'mock-anon-key'
    this.mockDataStore = new MockDataStore()
    this.performanceMonitor = new PerformanceMonitor()
    this.auth = new MockAuth(this)
  }

  from(tableName) {
    const queryBuilder = new MockQueryBuilder(
      tableName,
      this.mockDataStore,
      this.performanceMonitor
    )

    // Create a wrapper object that ensures proper method chaining
    const wrapper = {
      // Store reference to queryBuilder
      _queryBuilder: queryBuilder,

      // Forward all method calls to the query builder and return the wrapper for chaining
      select: (columns, options) => {
        queryBuilder.select(columns, options)
        return wrapper
      },
      selectRelation: (relation, columns) => {
        queryBuilder.selectRelation(relation, columns)
        return wrapper
      },
      filter: (column, operator, value) => {
        queryBuilder.filter(column, operator, value)
        return wrapper
      },
      eq: (column, value) => {
        queryBuilder.eq(column, value)
        return wrapper
      },
      neq: (column, value) => {
        queryBuilder.neq(column, value)
        return wrapper
      },
      gt: (column, value) => {
        queryBuilder.gt(column, value)
        return wrapper
      },
      gte: (column, value) => {
        queryBuilder.gte(column, value)
        return wrapper
      },
      lt: (column, value) => {
        queryBuilder.lt(column, value)
        return wrapper
      },
      lte: (column, value) => {
        queryBuilder.lte(column, value)
        return wrapper
      },
      like: (column, pattern) => {
        queryBuilder.like(column, pattern)
        return wrapper
      },
      ilike: (column, pattern) => {
        queryBuilder.ilike(column, pattern)
        return wrapper
      },
      in: (column, values) => {
        queryBuilder.in(column, values)
        return wrapper
      },
      is: (column, value) => {
        queryBuilder.is(column, value)
        return wrapper
      },
      order: (column, options) => {
        queryBuilder.order(column, options)
        return wrapper
      },
      limit: count => {
        queryBuilder.limit(count)
        return wrapper
      },
      range: (from, to) => {
        queryBuilder.range(from, to)
        return wrapper
      },
      single: () => {
        queryBuilder.single()
        return wrapper
      },
      maybeSingle: () => {
        queryBuilder.maybeSingle()
        return wrapper
      },
      insert: records => {
        queryBuilder.insert(records)
        return wrapper
      },
      update: updates => {
        queryBuilder.update(updates)
        return wrapper
      },
      delete: () => {
        queryBuilder.delete()
        return wrapper
      },

      // Error simulation methods
      simulateError: (errorCode, message) => {
        queryBuilder.simulateError(errorCode, message)
        return wrapper
      },
      simulateDelay: ms => {
        queryBuilder.simulateDelay(ms)
        return wrapper
      },
      simulateTimeout: () => {
        queryBuilder.simulateTimeout()
        return wrapper
      },
      simulateConnectionError: () => {
        queryBuilder.simulateConnectionError()
        return wrapper
      },

      // Execute method for direct execution
      execute: () => queryBuilder.execute(),

      // Promise methods for async/await
      then: (onFulfilled, onRejected) => queryBuilder.execute().then(onFulfilled, onRejected),
      catch: onRejected => queryBuilder.execute().catch(onRejected),
      finally: onFinally => queryBuilder.execute().finally(onFinally)
    }

    return wrapper
  }

  // Storage mock following Supabase Storage API patterns
  storage = {
    from: bucketName => ({
      upload: async (path, file, options = {}) => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return {
          data: {
            path,
            id: `mock-upload-${Date.now()}`,
            bucket: bucketName
          },
          error: null
        }
      },

      download: async path => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return {
          data: new Blob(['mock file content']),
          error: null
        }
      },

      getPublicUrl: path => ({
        data: { publicUrl: `${this.url}/storage/v1/object/public/${bucketName}/${path}` },
        error: null
      }),

      remove: async paths => {
        await new Promise(resolve => setTimeout(resolve, 80))
        return {
          data: paths.map(path => ({ path })),
          error: null
        }
      },

      list: async (path = '', options = {}) => {
        await new Promise(resolve => setTimeout(resolve, 60))
        return {
          data: [
            { name: 'file1.jpg', id: '1', created_at: new Date().toISOString() },
            { name: 'file2.jpg', id: '2', created_at: new Date().toISOString() }
          ],
          error: null
        }
      }
    })
  }

  // RPC mock with realistic behavior
  rpc = async (functionName, params = {}) => {
    const queryId = this.performanceMonitor.startQuery({
      operation: 'rpc',
      function: functionName,
      params
    })

    try {
      await new Promise(resolve => setTimeout(resolve, 150))

      // Mock some common RPC functions following Supabase patterns
      switch (functionName) {
        case 'get_user_profile': {
          const result = {
            data: {
              id: params.user_id || 1,
              name: 'Mock User',
              email: 'mock@example.com'
            },
            error: null
          }
          this.performanceMonitor.endQuery(queryId, true)
          return result
        }
        case 'create_order_with_items': {
          const result = {
            data: {
              order_id: Date.now(),
              items_count: params.items?.length || 0
            },
            error: null
          }
          this.performanceMonitor.endQuery(queryId, true)
          return result
        }
        case 'update_order_status_with_history': {
          const result = {
            data: { success: true },
            error: null
          }
          this.performanceMonitor.endQuery(queryId, true)
          return result
        }
        case 'create_product_with_occasions': {
          const result = {
            data: {
              product_id: Date.now(),
              occasions_added: params.occasion_ids?.length || 0
            },
            error: null
          }
          this.performanceMonitor.endQuery(queryId, true)
          return result
        }
        default: {
          const defaultResult = {
            data: { result: `Mock result for ${functionName}` },
            error: null
          }
          this.performanceMonitor.endQuery(queryId, true)
          return defaultResult
        }
      }
    } catch (error) {
      this.performanceMonitor.endQuery(queryId, false, error)
      return { data: null, error }
    }
  }

  // Reset all mocks
  reset() {
    this.mockDataStore.reset()
    this.performanceMonitor.reset()
    this.auth.reset()
  }

  // Get performance metrics
  getPerformanceMetrics() {
    return this.performanceMonitor.getMetrics()
  }

  // Enable/disable performance monitoring
  enablePerformanceMonitoring() {
    this.performanceMonitor.enable()
  }

  disablePerformanceMonitoring() {
    this.performanceMonitor.disable()
  }
}

// Auth mock following Supabase Auth patterns
export class MockAuth {
  constructor(supabaseClient) {
    this.client = supabaseClient
    this.currentUser = null
    this.session = null
  }

  signUp = async credentials => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const user = {
      id: `user-${Date.now()}`,
      email: credentials.email,
      created_at: new Date().toISOString()
    }

    this.currentUser = user
    this.session = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user,
      expires_at: Date.now() + 3600000 // 1 hour
    }

    return {
      data: { user, session: this.session },
      error: null
    }
  }

  signIn = async credentials => {
    await new Promise(resolve => setTimeout(resolve, 150))

    // Mock successful sign in
    const user = {
      id: 'mock-user-id',
      email: credentials.email,
      created_at: new Date().toISOString()
    }

    this.currentUser = user
    this.session = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user,
      expires_at: Date.now() + 3600000
    }

    return {
      data: { user, session: this.session },
      error: null
    }
  }

  signOut = async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
    this.currentUser = null
    this.session = null
    return { data: {}, error: null }
  }

  getCurrentUser = async () => {
    await new Promise(resolve => setTimeout(resolve, 50))
    return {
      data: this.currentUser,
      error: null
    }
  }

  getSession = async () => {
    await new Promise(resolve => setTimeout(resolve, 50))
    return {
      data: this.session,
      error: null
    }
  }

  onAuthStateChange = callback => {
    // Return unsubscribe function
    return () => {}
  }

  reset() {
    this.currentUser = null
    this.session = null
  }
}

// Repository pattern implementation following Supabase best practices
export class BaseRepository {
  constructor(client, tableName) {
    this.client = client
    this.tableName = tableName
  }

  async findById(id) {
    const { data, error } = await this.client.from(this.tableName).select().eq('id', id).single()

    if (error) {
      throw ErrorMapper.mapPostgresErrorToAppError(error)
    }

    return data
  }

  async findOne(filters = {}) {
    let query = this.client.from(this.tableName).select()

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    const { data, error } = await query.single()

    if (error) {
      throw ErrorMapper.mapPostgresErrorToAppError(error)
    }

    return data
  }

  async findMany(filters = {}, options = {}) {
    let query = this.client.from(this.tableName).select()

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        query = query.in(key, value)
      } else {
        query = query.eq(key, value)
      }
    })

    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending !== false })
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw ErrorMapper.mapPostgresErrorToAppError(error)
    }

    return data || []
  }

  async create(data) {
    const { data: result, error } = await this.client.from(this.tableName).insert(data).select()

    if (error) {
      throw ErrorMapper.mapPostgresErrorToAppError(error)
    }

    return Array.isArray(data) ? result : result[0]
  }

  async update(id, data) {
    const { data: result, error } = await this.client
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()

    if (error) {
      throw ErrorMapper.mapPostgresErrorToAppError(error)
    }

    return result && result.length > 0 ? result[0] : null
  }

  async updateMany(filters, data) {
    let query = this.client.from(this.tableName).update(data)

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })

    const { data: result, error } = await query.select()

    if (error) {
      throw ErrorMapper.mapPostgresErrorToAppError(error)
    }

    return result || []
  }

  async delete(id) {
    const { data, error } = await this.client.from(this.tableName).delete().eq('id', id).select()

    if (error) {
      throw ErrorMapper.mapPostgresErrorToAppError(error)
    }

    return data && data.length > 0 ? data[0] : null
  }

  softDelete(id) {
    return this.update(id, { deleted_at: new Date().toISOString() })
  }

  findActive(filters = {}, options = {}) {
    return this.findMany({ ...filters, deleted_at: null }, options)
  }
}

// User repository with specific business logic
export class UserRepository extends BaseRepository {
  constructor(client) {
    super(client, 'users')
  }

  findByEmail(email) {
    return this.findOne({ email })
  }

  async findWithProfile(userId) {
    const { data, error } = await this.client
      .from('users')
      .select(
        `
        *,
        profiles (*)
      `
      )
      .eq('id', userId)
      .single()

    if (error) {
      throw ErrorMapper.mapPostgresErrorToAppError(error)
    }

    return data
  }

  async createUserWithProfile(userData, profileData) {
    // Start transaction simulation
    // Create user
    const user = await this.create(userData)

    // Create profile
    const profile = await this.client
      .from('profiles')
      .insert({ ...profileData, user_id: user.id })
      .select()

    if (profile.error) {
      throw ErrorMapper.mapPostgresErrorToAppError(profile.error)
    }

    return { user, profile: profile.data[0] }
  }
}

// Profile repository with specific business logic
export class ProfileRepository extends BaseRepository {
  constructor(client) {
    super(client, 'profiles')
  }

  findByUserId(userId) {
    return this.findOne({ user_id: userId })
  }

  async updateByUserId(userId, data) {
    const { data: result, error } = await this.client
      .from('profiles')
      .update(data)
      .eq('user_id', userId)
      .select()

    if (error) {
      throw ErrorMapper.mapPostgresErrorToAppError(error)
    }

    return result && result.length > 0 ? result[0] : null
  }
}

// Simple Dependency Injection Container
export class DIContainer {
  constructor() {
    this.services = new Map()
    this.singletons = new Map()
  }

  register(name, factory, options = {}) {
    this.services.set(name, {
      factory,
      singleton: options.singleton || false,
      dependencies: options.dependencies || []
    })
  }

  get(name) {
    const service = this.services.get(name)
    if (!service) {
      throw new AppError(`Service '${name}' not found`, 404, 'SERVICE_NOT_FOUND')
    }

    if (service.singleton && this.singletons.has(name)) {
      return this.singletons.get(name)
    }

    // Resolve dependencies
    const dependencies = service.dependencies.map(dep => this.get(dep))

    // Create instance
    const instance = service.factory(...dependencies)

    if (service.singleton) {
      this.singletons.set(name, instance)
    }

    return instance
  }

  has(name) {
    return this.services.has(name)
  }

  clear() {
    this.services.clear()
    this.singletons.clear()
  }
}

// Service layer with DI integration
export class UserService {
  constructor(userRepository, profileRepository, performanceMonitor) {
    this.userRepository = userRepository
    this.profileRepository = profileRepository
    this.performanceMonitor = performanceMonitor
  }

  async getUserWithProfile(userId) {
    const queryId = this.performanceMonitor.startQuery({
      operation: 'service',
      service: 'UserService',
      method: 'getUserWithProfile',
      params: { userId }
    })

    try {
      const result = await this.userRepository.findWithProfile(userId)
      this.performanceMonitor.endQuery(queryId, true)
      return result
    } catch (error) {
      this.performanceMonitor.endQuery(queryId, false, error)
      throw error
    }
  }

  async createUserWithProfile(userData, profileData) {
    const queryId = this.performanceMonitor.startQuery({
      operation: 'service',
      service: 'UserService',
      method: 'createUserWithProfile',
      params: { userData, profileData }
    })

    try {
      const result = await this.userRepository.createUserWithProfile(userData, profileData)
      this.performanceMonitor.endQuery(queryId, true)
      return result
    } catch (error) {
      this.performanceMonitor.endQuery(queryId, false, error)
      throw error
    }
  }

  async softDeleteUser(userId) {
    const queryId = this.performanceMonitor.startQuery({
      operation: 'service',
      service: 'UserService',
      method: 'softDeleteUser',
      params: { userId }
    })

    try {
      // Soft delete user
      await this.userRepository.softDelete(userId)

      // Soft delete associated profile
      await this.profileRepository.updateByUserId(userId, {
        deleted_at: new Date().toISOString()
      })

      this.performanceMonitor.endQuery(queryId, true)
      return true
    } catch (error) {
      this.performanceMonitor.endQuery(queryId, false, error)
      throw error
    }
  }
}

// Schema validation utilities
export const SchemaValidator = {
  validateTableSchema: (tableName, expectedSchema) => {
    // Mock schema validation - in real implementation would check actual DB schema
    const mockSchemas = {
      users: {
        id: 'integer',
        email: 'varchar',
        name: 'varchar',
        created_at: 'timestamp',
        deleted_at: 'timestamp'
      },
      profiles: {
        id: 'integer',
        user_id: 'integer',
        bio: 'text',
        avatar_url: 'varchar',
        deleted_at: 'timestamp'
      },
      products: {
        id: 'integer',
        name: 'varchar',
        description: 'text',
        price: 'decimal',
        category: 'varchar',
        stock_quantity: 'integer',
        is_active: 'boolean'
      },
      orders: {
        id: 'integer',
        user_id: 'integer',
        status: 'varchar',
        total_amount: 'decimal',
        delivery_address: 'text'
      }
    }

    const actualSchema = mockSchemas[tableName]
    if (!actualSchema) {
      throw new AppError(`Table '${tableName}' not found in schema`, 404, 'TABLE_NOT_FOUND')
    }

    const errors = []
    Object.entries(expectedSchema).forEach(([column, expectedType]) => {
      if (actualSchema[column] !== expectedType) {
        errors.push({
          column,
          expected: expectedType,
          actual: actualSchema[column] || 'MISSING'
        })
      }
    })

    if (errors.length > 0) {
      throw new AppError(
        `Schema validation failed for table '${tableName}'`,
        400,
        'SCHEMA_VALIDATION_ERROR',
        { errors }
      )
    }

    return true
  },

  validateDataIntegrity: (tableName, data) => {
    // Mock data integrity validation
    const requiredFields = {
      users: ['email', 'name'],
      profiles: ['user_id'],
      products: ['name', 'price'],
      orders: ['user_id', 'total_amount']
    }

    const required = requiredFields[tableName] || []
    const missing = required.filter(field => data[field] === undefined || data[field] === null)

    if (missing.length > 0) {
      throw new AppError(
        `Required fields missing for table '${tableName}'`,
        400,
        'DATA_INTEGRITY_ERROR',
        { missingFields: missing }
      )
    }

    return true
  }
}

// Enhanced random data generators for more realistic testing
export const DataGenerators = {
  // Generate realistic user data
  generateUser: (overrides = {}) => {
    const firstNames = [
      'Juan',
      'María',
      'Carlos',
      'Ana',
      'Luis',
      'Sofía',
      'Pedro',
      'Elena',
      'Miguel',
      'Lucía'
    ]
    const lastNames = [
      'García',
      'Rodríguez',
      'Martínez',
      'López',
      'Sánchez',
      'Pérez',
      'Gómez',
      'Díaz',
      'Hernández',
      'Martín'
    ]
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com']

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const domain = domains[Math.floor(Math.random() * domains.length)]
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}@${domain}`

    const now = new Date().toISOString()
    const createdDate = new Date(
      Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
    ).toISOString()

    return {
      id: Math.floor(Math.random() * 1000000) + 1,
      email,
      password_hash: '$2a$10$' + Math.random().toString(36).substring(2, 15),
      full_name: `${firstName} ${lastName}`,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      role: Math.random() > 0.9 ? 'admin' : 'user',
      active: Math.random() > 0.1,
      email_verified: Math.random() > 0.2,
      created_at: createdDate,
      updated_at: now,
      full_name_normalized: `${firstName.toLowerCase()} ${lastName.toLowerCase()}`,
      email_normalized: email,
      ...overrides
    }
  },

  // Generate realistic product data
  generateProduct: (overrides = {}) => {
    const productNames = [
      'Rosa Roja Elegante',
      'Lirio Blanco Puro',
      'Tulipán Holandés',
      'Orquídea Exótica',
      'Girasol Radiante',
      'Margarita Silvestre',
      'Clavel Classic',
      'Dalia Vibrante',
      'Peonía Primavera',
      'Amapola Delicada',
      'Azucena Fragante',
      'Iris Real'
    ]

    const descriptions = [
      'Una flor elegante y sofisticada perfecta para ocasiones especiales',
      'Fresca y vibrante, ideal para expresar sentimientos genuinos',
      'Clásica y atemporal, símbolo de amor y tradición',
      'Exótica y misteriosa, captura miradas con su belleza única',
      'Radiante y alegre, ilumina cualquier espacio con su presencia',
      'Delicada y ligera, perfecto para momentos sutiles y románticos'
    ]

    const name = productNames[Math.floor(Math.random() * productNames.length)]
    const description = descriptions[Math.floor(Math.random() * descriptions.length)]
    const priceUSD = (Math.random() * 95 + 5).toFixed(2)
    const priceVES = (parseFloat(priceUSD) * (Math.random() * 1000 + 3000)).toFixed(2)

    const now = new Date().toISOString()
    const createdDate = new Date(
      Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000
    ).toISOString()

    return {
      id: Math.floor(Math.random() * 100000) + 1,
      name,
      summary: description.substring(0, 50) + '...',
      description,
      price_usd: parseFloat(priceUSD),
      price_ves: parseFloat(priceVES),
      stock: Math.floor(Math.random() * 100),
      sku: `FLR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      active: true, // Products are active by default for test reliability
      featured: Math.random() > 0.8, // 20% chance to be featured
      carousel_order: Math.random() > 0.8 ? Math.floor(Math.random() * 7) + 1 : null,
      created_at: createdDate,
      updated_at: now,
      ...overrides
    }
  },

  // Generate realistic order data
  generateOrder: (userId, productIds, overrides = {}) => {
    const customerNames = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez']
    const addresses = [
      'Av. Principal #123, Col. Centro, CP. 12345',
      'Calle Secundaria #456, Fracc. Las Flores, CP. 67890',
      'Blvd. Universidad #789, Residencial Universitaria, CP. 11111',
      'Callejón del Arte #321, Zona Histórica, CP. 22222'
    ]

    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)]
    const address = addresses[Math.floor(Math.random() * addresses.length)]
    const email = `customer${Math.floor(Math.random() * 9999)}@example.com`

    const statuses = ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled']
    const weights = [0.3, 0.2, 0.2, 0.15, 0.1, 0.05] // More likely to be pending/verified
    const status =
      Math.random() < weights[0]
        ? statuses[0]
        : Math.random() < weights[0] + weights[1]
          ? statuses[1]
          : statuses[Math.floor(Math.random() * statuses.length)]

    const now = new Date().toISOString()
    const createdDate = new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ).toISOString()

    // Calculate total amount based on products
    let totalAmount = 0
    const orderItems = productIds.map((productId, index) => {
      const price = (Math.random() * 50 + 10).toFixed(2)
      const quantity = Math.floor(Math.random() * 3) + 1
      totalAmount += parseFloat(price) * quantity

      return {
        product_id: productId,
        product_name: `Producto ${index + 1}`,
        unit_price_usd: parseFloat(price),
        quantity,
        total_price_usd: parseFloat(price) * quantity
      }
    })

    return {
      id: Math.floor(Math.random() * 50000) + 1,
      user_id: userId,
      customer_email: email,
      customer_name: customerName,
      delivery_address: address,
      status,
      total_amount_usd: parseFloat(totalAmount.toFixed(2)),
      order_items: orderItems,
      active: status !== 'cancelled',
      created_at: createdDate,
      updated_at: now,
      ...overrides
    }
  },

  // Generate realistic address data
  generateAddress: () => {
    const streets = [
      'Av. Principal',
      'Calle Secundaria',
      'Blvd. Universidad',
      'Callejón del Arte',
      'Plaza Mayor'
    ]
    const neighborhoods = [
      'Col. Centro',
      'Fracc. Las Flores',
      'Residencial Universitaria',
      'Zona Histórica',
      'Zona Norte'
    ]
    const cities = [
      'Ciudad Central',
      'Villa Hermosa',
      'Puerto Bonito',
      'Sierra Alta',
      'Valle Verde'
    ]

    const street = streets[Math.floor(Math.random() * streets.length)]
    const number = Math.floor(Math.random() * 9999) + 1
    const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)]
    const zipCode = Math.floor(Math.random() * 90000) + 10000
    const city = cities[Math.floor(Math.random() * cities.length)]

    return `${street} #${number}, ${neighborhood}, ${city}, CP. ${zipCode}`
  },

  // Generate realistic payment data
  generatePayment: (orderId, overrides = {}) => {
    const paymentMethods = ['card', 'paypal', 'transfer', 'cash']
    const statuses = ['pending', 'completed', 'failed', 'refunded']
    const providers = {
      card: ['stripe', 'visa', 'mastercard'],
      paypal: ['paypal'],
      transfer: ['bank_transfer', 'wire'],
      cash: ['cash_on_delivery']
    }

    const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
    const provider = providers[method][Math.floor(Math.random() * providers[method].length)]
    const status = Math.random() > 0.8 ? statuses[1] : statuses[Math.floor(Math.random() * 3)]

    const amount = (Math.random() * 500 + 20).toFixed(2)

    const now = new Date().toISOString()
    const createdDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()

    return {
      id: Math.floor(Math.random() * 100000) + 1,
      order_id: orderId,
      amount_usd: parseFloat(amount),
      currency: 'USD',
      status,
      payment_method: method,
      provider,
      transaction_id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      payment_date: status === 'completed' ? now : null,
      created_at: createdDate,
      updated_at: now,
      ...overrides
    }
  }
}

// Advanced mock scenarios for complex testing scenarios
export const MockScenarios = {
  // Simulate network latency and connection issues
  simulateNetworkLatency: (minMs = 50, maxMs = 500) => {
    const delay = Math.random() * (maxMs - minMs) + minMs
    return new Promise(resolve => setTimeout(resolve, delay))
  },

  // Simulate connection timeouts
  simulateConnectionTimeout: () => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new AppError('Connection timeout', 503, 'CONNECTION_TIMEOUT', {
            code: POSTGRESQL_ERROR_CODES.CONNECTION_TIMEOUT
          })
        )
      }, 30000) // 30 second timeout
    })
  },

  // Simulate concurrent modification conflicts
  simulateConcurrencyConflict: () => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new AppError('Concurrent modification detected', 409, 'CONCURRENCY_ERROR', {
            code: POSTGRESQL_ERROR_CODES.SERIALIZATION_FAILURE
          })
        )
      }, 100)
    })
  },

  // Simulate deadlocks
  simulateDeadlock: () => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new AppError('Deadlock detected', 409, 'DEADLOCK_ERROR', {
            code: POSTGRESQL_ERROR_CODES.DEADLOCK_DETECTED
          })
        )
      }, 150)
    })
  },

  // Simulate gradual database performance degradation
  simulatePerformanceDegradation: async queries => {
    const baseDelay = 10
    const results = []

    for (let i = 0; i < queries.length; i++) {
      // Gradually increase delay to simulate performance degradation
      const delay = baseDelay + i * 50
      await new Promise(resolve => setTimeout(resolve, delay))

      try {
        const result = await queries[i]()
        results.push({ success: true, result, delay })
      } catch (error) {
        results.push({ success: false, error, delay })
      }
    }

    return results
  }
}

// Factory function to create Supabase client mock
export const createSupabaseClientMock = (options = {}) => {
  return new SupabaseClientMock(options)
}
