/**
 * Supabase Mock for Accounting Module
 * Realistic mock implementation for expenses table and views
 * Refactored for parallel execution with isolated state
 */

import { POSTGRESQL_ERROR_CODES, AppError } from '../supabase-client/mocks/mocks.js'

export class SupabaseAccountingMock {
  constructor() {
    this.expensesData = []
    this.ordersData = []
    this.nextExpenseId = 1
  }

  /**
   * Reset all data (for test isolation)
   */
  resetAccountingData() {
    this.expensesData = []
    this.ordersData = []
    this.nextExpenseId = 1
  }

  /**
   * Seed initial data
   */
  seedAccountingData() {
    // Seed expenses
    this.expensesData = [
      {
        id: 1,
        category: 'flores',
        description: 'Rosas rojas importadas',
        amount: 180.5,
        expense_date: '2025-11-15',
        payment_method: 'transferencia',
        receipt_url: null,
        notes: 'Proveedor principal',
        created_by: 1,
        created_at: '2025-11-15T10:00:00Z',
        updated_at: '2025-11-15T10:00:00Z',
        active: true
      },
      {
        id: 2,
        category: 'transporte',
        description: 'Gasolina delivery',
        amount: 45.0,
        expense_date: '2025-11-16',
        payment_method: 'efectivo',
        receipt_url: null,
        notes: null,
        created_by: 1,
        created_at: '2025-11-16T11:00:00Z',
        updated_at: '2025-11-16T11:00:00Z',
        active: true
      },
      {
        id: 3,
        category: 'empaque',
        description: 'Cajas decorativas',
        amount: 67.3,
        expense_date: '2025-11-17',
        payment_method: 'tarjeta_credito',
        receipt_url: 'https://example.com/receipt1.pdf',
        notes: 'Stock mensual',
        created_by: 1,
        created_at: '2025-11-17T09:00:00Z',
        updated_at: '2025-11-17T09:00:00Z',
        active: true
      }
    ]

    // Seed orders
    this.ordersData = [
      {
        id: 1,
        customer_email: 'customer1@test.com',
        customer_name: 'Juan Pérez',
        total_amount_usd: 150.0,
        status: 'delivered',
        active: true,
        created_at: '2025-11-15T14:00:00Z'
      },
      {
        id: 2,
        customer_email: 'customer2@test.com',
        customer_name: 'María García',
        total_amount_usd: 200.0,
        status: 'delivered',
        active: true,
        created_at: '2025-11-16T15:00:00Z'
      },
      {
        id: 3,
        customer_email: 'customer3@test.com',
        customer_name: 'Carlos López',
        total_amount_usd: 175.5,
        status: 'verified',
        active: true,
        created_at: '2025-11-17T16:00:00Z'
      }
    ]

    this.nextExpenseId = 4
  }

  /**
   * Validate expense data
   */
  validateExpense(data) {
    const validCategories = [
      'flores',
      'transporte',
      'empaque',
      'personal',
      'servicios',
      'marketing',
      'otros'
    ]
    const validPaymentMethods = [
      'efectivo',
      'transferencia',
      'tarjeta_debito',
      'tarjeta_credito',
      'pago_movil',
      'zelle',
      'otro'
    ]

    if (!data.category) {
      throw new AppError('category is required', 400, POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION)
    }

    if (!validCategories.includes(data.category)) {
      throw new AppError('Invalid category', 400, POSTGRESQL_ERROR_CODES.CHECK_VIOLATION)
    }

    if (!data.description) {
      throw new AppError('description is required', 400, POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION)
    }

    if (!data.amount || data.amount <= 0) {
      throw new AppError(
        'amount must be greater than 0',
        400,
        POSTGRESQL_ERROR_CODES.CHECK_VIOLATION
      )
    }

    if (data.payment_method && !validPaymentMethods.includes(data.payment_method)) {
      throw new AppError('Invalid payment_method', 400, POSTGRESQL_ERROR_CODES.CHECK_VIOLATION)
    }
  }

  /**
   * Filter data based on query
   */
  applyFilters(data, filters = {}) {
    let filtered = [...data]

    // IMPORTANT: Filter by active (default true unless explicitly false)
    const activeFilter = filters.active !== undefined ? filters.active : true
    filtered = filtered.filter(item => item.active === activeFilter)

    // Filter by date range (gte) - normalize dates for comparison
    if (filters.gte_expense_date) {
      const minDate =
        typeof filters.gte_expense_date === 'string'
          ? filters.gte_expense_date
          : filters.gte_expense_date.toISOString().split('T')[0]
      filtered = filtered.filter(item => {
        const itemDate =
          typeof item.expense_date === 'string'
            ? item.expense_date
            : item.expense_date.toISOString().split('T')[0]
        return itemDate >= minDate
      })
    }

    // Filter by date range (lte) - normalize dates for comparison
    if (filters.lte_expense_date) {
      const maxDate =
        typeof filters.lte_expense_date === 'string'
          ? filters.lte_expense_date
          : filters.lte_expense_date.toISOString().split('T')[0]
      filtered = filtered.filter(item => {
        const itemDate =
          typeof item.expense_date === 'string'
            ? item.expense_date
            : item.expense_date.toISOString().split('T')[0]
        return itemDate <= maxDate
      })
    }

    // Filter by category
    if (filters.eq_category) {
      filtered = filtered.filter(item => item.category === filters.eq_category)
    }

    // Filter by id
    if (filters.eq_id) {
      filtered = filtered.filter(item => item.id === filters.eq_id)
    }

    return filtered
  }

  /**
   * Apply order
   */
  applyOrder(data, orderBy, ascending = true) {
    if (!orderBy) {
      return data
    }

    return [...data].sort((a, b) => {
      const aVal = a[orderBy]
      const bVal = b[orderBy]

      if (aVal < bVal) {
        return ascending ? -1 : 1
      }
      if (aVal > bVal) {
        return ascending ? 1 : -1
      }
      return 0
    })
  }

  /**
   * Apply pagination
   */
  applyPagination(data, limit, offset = 0) {
    let result = data

    // Apply offset first
    if (offset > 0) {
      result = result.slice(offset)
    }

    // Then apply limit
    if (limit) {
      result = result.slice(0, limit)
    }

    return result
  }

  /**
   * Create expense
   */
  createExpense(data) {
    try {
      this.validateExpense(data)

      const newExpense = {
        id: this.nextExpenseId++,
        category: data.category,
        description: data.description,
        amount: parseFloat(data.amount),
        expense_date: data.expense_date || new Date().toISOString().split('T')[0],
        payment_method: data.payment_method || null,
        receipt_url: data.receipt_url || null,
        notes: data.notes || null,
        created_by: data.created_by || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active: true
      }

      this.expensesData.push(newExpense)
      return Promise.resolve({ data: newExpense, error: null })
    } catch (error) {
      return Promise.resolve({ data: null, error })
    }
  }

  /**
   * Find expenses
   */
  findExpenses(filters = {}, options = {}) {
    try {
      let result = this.applyFilters(this.expensesData, filters)

      if (options.orderBy) {
        result = this.applyOrder(result, options.orderBy, options.ascending !== false)
      }

      result = this.applyPagination(result, options.limit, options.offset)

      return Promise.resolve({ data: result, error: null })
    } catch (error) {
      return Promise.resolve({ data: null, error })
    }
  }

  /**
   * Find expense by ID
   */
  findExpenseById(id) {
    try {
      const expense = this.expensesData.find(e => e.id === parseInt(id) && e.active)
      return Promise.resolve({ data: expense || null, error: null })
    } catch (error) {
      return Promise.resolve({ data: null, error })
    }
  }

  /**
   * Update expense
   */
  updateExpense(id, updates) {
    try {
      const index = this.expensesData.findIndex(e => e.id === parseInt(id))

      if (index === -1) {
        return Promise.resolve({ data: null, error: null })
      }

      const updatedExpense = {
        ...this.expensesData[index],
        ...updates,
        id: this.expensesData[index].id,
        updated_at: new Date().toISOString()
      }

      if (updates.category || updates.amount) {
        this.validateExpense(updatedExpense)
      }

      this.expensesData[index] = updatedExpense
      return Promise.resolve({ data: updatedExpense, error: null })
    } catch (error) {
      return Promise.resolve({ data: null, error })
    }
  }

  /**
   * Delete expense (soft delete)
   */
  deleteExpense(id) {
    try {
      const index = this.expensesData.findIndex(e => e.id === parseInt(id))

      if (index === -1) {
        return Promise.resolve({ data: null, error: null })
      }

      this.expensesData[index] = {
        ...this.expensesData[index],
        active: false,
        updated_at: new Date().toISOString()
      }

      return Promise.resolve({ data: this.expensesData[index], error: null })
    } catch (error) {
      return Promise.resolve({ data: null, error })
    }
  }

  /**
   * Find orders (for reports)
   */
  findOrders(filters = {}) {
    try {
      let result = [...this.ordersData]

      if (filters.active !== undefined) {
        result = result.filter(o => o.active === filters.active)
      }

      if (filters.status_in) {
        result = result.filter(o => filters.status_in.includes(o.status))
      }

      if (filters.gte_created_at) {
        result = result.filter(o => o.created_at >= filters.gte_created_at)
      }

      if (filters.lte_created_at) {
        result = result.filter(o => o.created_at <= filters.lte_created_at)
      }

      return Promise.resolve({ data: result, error: null })
    } catch (error) {
      return Promise.resolve({ data: null, error })
    }
  }

  /**
   * Mock Supabase client for accounting
   */
  createClient() {
    const self = this
    return {
      from: table => {
        const queryBuilder = {
          _table: table,
          _select: '*',
          _filters: {},
          _order: null,
          _ascending: true,
          _limit: null,
          _offset: 0,

          select(columns = '*') {
            this._select = columns
            return this
          },

          insert(data) {
            if (this._table === 'expenses') {
              return {
                then: resolve => {
                  self.createExpense(data).then(result => {
                    resolve(
                      result.data
                        ? { data: result.data, error: null }
                        : { data: null, error: result.error }
                    )
                  })
                  return this
                }
              }
            }
            return { data: null, error: new Error('Table not mocked') }
          },

          eq(column, value) {
            this._filters[`eq_${column}`] = value
            return this
          },

          gte(column, value) {
            this._filters[`gte_${column}`] = value
            return this
          },

          lte(column, value) {
            this._filters[`lte_${column}`] = value
            return this
          },

          in(column, values) {
            this._filters[`${column}_in`] = values
            return this
          },

          order(column, options = {}) {
            this._order = column
            this._ascending = options.ascending !== false
            return this
          },

          limit(count) {
            this._limit = count
            return this
          },

          range(from, to) {
            this._offset = from
            this._limit = to - from + 1
            return this
          },

          async then(resolve) {
            let result

            if (this._table === 'expenses') {
              result = await self.findExpenses(this._filters, {
                orderBy: this._order,
                ascending: this._ascending,
                limit: this._limit,
                offset: this._offset
              })
            } else if (this._table === 'orders') {
              result = await self.findOrders(this._filters)
            } else {
              result = { data: null, error: new Error('Table not mocked') }
            }

            resolve(result)
            return result
          }
        }

        return queryBuilder
      }
    }
  }
}

// Export a default instance for backward compatibility if needed,
// but tests should instantiate their own.
const defaultInstance = new SupabaseAccountingMock()

export const resetAccountingData = () => defaultInstance.resetAccountingData()
export const seedAccountingData = () => defaultInstance.seedAccountingData()
export const createExpense = data => defaultInstance.createExpense(data)
export const findExpenses = (filters, options) => defaultInstance.findExpenses(filters, options)
export const findExpenseById = id => defaultInstance.findExpenseById(id)
export const updateExpense = (id, updates) => defaultInstance.updateExpense(id, updates)
export const deleteExpense = id => defaultInstance.deleteExpense(id)
export const findOrders = filters => defaultInstance.findOrders(filters)
export const createAccountingSupabaseMock = () => defaultInstance.createClient()

export default {
  SupabaseAccountingMock,
  createAccountingSupabaseMock,
  resetAccountingData,
  seedAccountingData,
  createExpense,
  findExpenses,
  findExpenseById,
  updateExpense,
  deleteExpense,
  findOrders
}
