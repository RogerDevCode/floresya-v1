/**
 * Orders Unit Tests - OUrD (Orders Utility & Rendering - Date-focused)
 * Enhanced version with robust date filtering following enterprise testing standards
 *
 * Best Practices Applied:
 * - Dynamic date calculations for reliable tests
 * - Comprehensive edge case coverage
 * - Descriptive test IDs and names
 * - Parametrized tests with describe.each
 * - Clear AAA pattern
 * - Better assertion messages
 * - Time zone aware testing
 */

import { describe, test, expect, vi, beforeAll } from 'vitest'

// Mock global objects properly
beforeAll(() => {
  // Mock DOM elements
  vi.stubGlobal('document', {
    getElementById: vi.fn(),
    addEventListener: vi.fn(),
    createElement: vi.fn(() => ({
      innerHTML: '',
      textContent: '',
      value: '',
      disabled: false,
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn()
      },
      addEventListener: vi.fn()
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    },
    querySelector: vi.fn(),
    querySelectorAll: vi.fn()
  })

  // Mock window
  vi.stubGlobal('window', {
    addEventListener: vi.fn(),
    location: { reload: vi.fn() },
    print: vi.fn(),
    URL: {
      createObjectURL: vi.fn(() => 'mock-url')
    }
  })

  // Mock fetch
  vi.stubGlobal('fetch', vi.fn())

  // Mock console
  vi.stubGlobal('console', {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  })
})

// =============================================================================
// TEXT NORMALIZATION UTILITY
// =============================================================================

describe('normalizeText function - OUrD Enhanced', () => {
  /**
   * @param {string} text - Text to normalize
   * @returns {string} Normalized text (lowercase, no accents)
   */
  function normalizeText(text) {
    if (!text) {
      return ''
    }
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .trim()
  }

  test('OURD-001: should remove accents and convert to lowercase', () => {
    expect(normalizeText('Áéíóú')).toBe('aeiou')
    expect(normalizeText('Ñoño')).toBe('nono')
    expect(normalizeText('Báñez')).toBe('banez')
    expect(normalizeText('Café')).toBe('cafe')
  })

  test('OURD-002: should handle empty and null inputs', () => {
    expect(normalizeText('')).toBe('')
    expect(normalizeText(null)).toBe('')
    expect(normalizeText(undefined)).toBe('')
    expect(normalizeText('   ')).toBe('')
  })

  test('OURD-003: should handle regular text', () => {
    expect(normalizeText('Hello World')).toBe('hello world')
    expect(normalizeText('  Test  ')).toBe('test')
    expect(normalizeText('Test-123')).toBe('test-123')
  })

  test('OURD-004: should handle special characters', () => {
    expect(normalizeText('São Paulo')).toBe('sao paulo')
    expect(normalizeText('México')).toBe('mexico')
    expect(normalizeText('Zürich')).toBe('zurich')
  })

  test('OURD-005: should be case-insensitive', () => {
    const result = normalizeText('HELLO')
    expect(result).toBe('hello')
    expect(result).not.toBe('HELLO')
  })
})

// =============================================================================
// DATE FILTERING UTILITY
// =============================================================================

describe('Date filtering functionality - OUrD Enhanced', () => {
  /**
   * Filter orders by date range (inclusive)
   * @param {Array} orders - Orders array
   * @param {Date} fromDate - Start date (inclusive)
   * @param {Date} toDate - End date (inclusive)
   * @returns {Array} Filtered orders
   */
  function filterOrdersByDateRange(orders, fromDate, toDate) {
    return orders.filter(order => {
      const orderDate = new Date(order.created_at)
      return orderDate >= fromDate && orderDate <= toDate
    })
  }

  /**
   * Filter orders within last N days
   * @param {Array} orders - Orders array
   * @param {number} days - Number of days to look back
   * @returns {Array} Filtered orders
   */
  function filterOrdersByRecentDays(orders, days) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    return orders.filter(order => new Date(order.created_at) >= cutoffDate)
  }

  test('OURD-006: should filter orders by date range - exact match', () => {
    // Arrange
    const orders = [
      { id: 1, created_at: '2025-09-30T10:00:00Z' },
      { id: 2, created_at: '2025-09-25T10:00:00Z' },
      { id: 3, created_at: '2025-09-20T10:00:00Z' },
      { id: 4, created_at: '2025-08-25T10:00:00Z' }
    ]

    const fromDate = new Date('2025-09-20T00:00:00Z')
    const toDate = new Date('2025-09-30T23:59:59Z')

    // Act
    const filtered = filterOrdersByDateRange(orders, fromDate, toDate)

    // Assert
    expect(filtered.length).toBe(3)
    expect(filtered.map(o => o.id)).toEqual([1, 2, 3])
    expect(filtered).toContainEqual(orders[0])
    expect(filtered).toContainEqual(orders[1])
    expect(filtered).toContainEqual(orders[2])
    expect(filtered).not.toContainEqual(orders[3])
  })

  test('OURD-007: should filter orders by custom date range', () => {
    // Arrange
    const orders = [
      { id: 1, created_at: '2025-09-30T10:00:00Z' },
      { id: 2, created_at: '2025-09-25T10:00:00Z' },
      { id: 3, created_at: '2025-09-20T10:00:00Z' }
    ]

    const fromDate = new Date('2025-09-24T00:00:00Z')
    const toDate = new Date('2025-09-30T23:59:59Z')

    // Act
    const filtered = filterOrdersByDateRange(orders, fromDate, toDate)

    // Assert
    expect(filtered.length).toBe(2)
    expect(filtered.map(o => o.id)).toEqual([1, 2])
    expect(filtered).toContainEqual(orders[0])
    expect(filtered).toContainEqual(orders[1])
    expect(filtered).not.toContainEqual(orders[2])
  })

  test('OURD-008: should return empty array when no orders in range', () => {
    // Arrange
    const orders = [
      { id: 1, created_at: '2025-01-01T00:00:00Z' },
      { id: 2, created_at: '2025-01-02T00:00:00Z' }
    ]

    const fromDate = new Date('2025-09-01T00:00:00Z')
    const toDate = new Date('2025-09-30T23:59:59Z')

    // Act
    const filtered = filterOrdersByDateRange(orders, fromDate, toDate)

    // Assert
    expect(filtered.length).toBe(0)
    expect(filtered).toEqual([])
  })

  test('OURD-009: should handle orders at boundary dates', () => {
    // Arrange
    const orders = [
      { id: 1, created_at: '2025-09-20T00:00:00Z' }, // Start boundary
      { id: 2, created_at: '2025-09-25T12:00:00Z' }, // Middle
      { id: 3, created_at: '2025-09-30T23:59:59Z' } // End boundary
    ]

    const fromDate = new Date('2025-09-20T00:00:00Z')
    const toDate = new Date('2025-09-30T23:59:59Z')

    // Act
    const filtered = filterOrdersByDateRange(orders, fromDate, toDate)

    // Assert - Should include all including boundaries
    expect(filtered.length).toBe(3)
    expect(filtered.map(o => o.id)).toEqual([1, 2, 3])
  })

  test('OURD-010: should filter orders by recent days dynamically', () => {
    // Arrange - Create orders with dynamic dates
    const now = new Date()
    const orders = [
      { id: 1, created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() }, // 5 days ago
      { id: 2, created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString() }, // 15 days ago
      { id: 3, created_at: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString() } // 35 days ago
    ]

    // Act
    const filtered = filterOrdersByRecentDays(orders, 30)

    // Assert
    expect(filtered.length).toBe(2) // 5 and 15 days ago
    expect(filtered.map(o => o.id)).toEqual([1, 2])
    expect(filtered).not.toContainEqual(orders[2])
  })

  test('OURD-011: should handle edge case - fromDate after toDate', () => {
    // Arrange
    const orders = [{ id: 1, created_at: '2025-09-30T10:00:00Z' }]

    const fromDate = new Date('2025-09-30T00:00:00Z')
    const toDate = new Date('2025-09-20T00:00:00Z') // Before fromDate

    // Act
    const filtered = filterOrdersByDateRange(orders, fromDate, toDate)

    // Assert
    expect(filtered.length).toBe(0)
  })

  test('OURD-012: should handle same date for from and to', () => {
    // Arrange
    const targetDate = '2025-09-25T00:00:00Z'
    const orders = [
      { id: 1, created_at: targetDate },
      { id: 2, created_at: '2025-09-26T00:00:00Z' }
    ]

    const fromDate = new Date('2025-09-25T00:00:00Z')
    const toDate = new Date('2025-09-25T23:59:59Z')

    // Act
    const filtered = filterOrdersByDateRange(orders, fromDate, toDate)

    // Assert
    expect(filtered.length).toBe(1)
    expect(filtered[0].id).toBe(1)
  })

  test('OURD-013: should handle time zones correctly', () => {
    // Arrange - Orders with different time zones
    const orders = [
      { id: 1, created_at: '2025-09-25T10:00:00Z' }, // UTC
      { id: 2, created_at: '2025-09-25T10:00:00-05:00' }, // EST (UTC-5)
      { id: 3, created_at: '2025-09-25T10:00:00+08:00' } // CST (UTC+8)
    ]

    const fromDate = new Date('2025-09-25T00:00:00Z')
    const toDate = new Date('2025-09-25T23:59:59Z')

    // Act
    const filtered = filterOrdersByDateRange(orders, fromDate, toDate)

    // Assert - All should be included as they're normalized to UTC
    expect(filtered.length).toBe(3)
  })
})

// =============================================================================
// SEARCH FUNCTIONALITY
// =============================================================================

describe('Search functionality - OUrD Enhanced', () => {
  /**
   * @param {string} text - Text to normalize
   * @returns {string} Normalized text
   */
  function normalizeText(text) {
    if (!text) {
      return ''
    }
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
  }

  /**
   * Filter orders by search term
   * @param {Array} orders - Orders array
   * @param {string} searchTerm - Search term
   * @returns {Array} Filtered orders
   */
  function searchOrders(orders, searchTerm) {
    const normalizedQuery = normalizeText(searchTerm)

    return orders.filter(order => {
      const normalizedName = normalizeText(order.customer_name)
      const normalizedEmail = normalizeText(order.customer_email)
      const orderId = order.id.toString()

      return (
        normalizedName.includes(normalizedQuery) ||
        normalizedEmail.includes(normalizedQuery) ||
        orderId.includes(searchTerm)
      )
    })
  }

  test('OURD-014: should filter orders by customer name', () => {
    // Arrange
    const orders = [
      { id: 1, customer_name: 'Juan Pérez', customer_email: 'juan@example.com' },
      { id: 2, customer_name: 'María González', customer_email: 'maria@example.com' },
      { id: 3, customer_name: 'Carlos López', customer_email: 'carlos@example.com' }
    ]

    // Act
    const filtered = searchOrders(orders, 'maria')

    // Assert
    expect(filtered.length).toBe(1)
    expect(filtered[0].id).toBe(2)
    expect(filtered[0].customer_name).toBe('María González')
  })

  test('OURD-015: should filter orders by customer email', () => {
    // Arrange
    const orders = [
      { id: 1, customer_name: 'Juan Pérez', customer_email: 'juan@example.com' },
      { id: 2, customer_name: 'María González', customer_email: 'maria@example.com' },
      { id: 3, customer_name: 'Carlos López', customer_email: 'carlos@example.com' }
    ]

    // Act
    const filtered = searchOrders(orders, 'juan@example.com')

    // Assert
    expect(filtered.length).toBe(1)
    expect(filtered[0].id).toBe(1)
  })

  test('OURD-016: should be accent-insensitive', () => {
    // Arrange
    const orders = [
      { id: 1, customer_name: 'José García', customer_email: 'jose@example.com' },
      { id: 2, customer_name: 'Jose Garcia', customer_email: 'jose2@example.com' }
    ]

    // Act
    const filtered = searchOrders(orders, 'jose')

    // Assert
    expect(filtered.length).toBe(2)
  })

  test('OURD-017: should search by order ID', () => {
    // Arrange
    const orders = [
      { id: 1, customer_name: 'Juan Pérez', customer_email: 'juan@example.com' },
      { id: 2, customer_name: 'María González', customer_email: 'maria@example.com' },
      { id: 3, customer_name: 'Carlos López', customer_email: 'carlos@example.com' }
    ]

    // Act
    const filtered = searchOrders(orders, '2')

    // Assert
    expect(filtered.length).toBe(1)
    expect(filtered[0].id).toBe(2)
  })

  test('OURD-018: should handle partial matches', () => {
    // Arrange
    const orders = [
      { id: 1, customer_name: 'Juan Pérez', customer_email: 'juan@example.com' },
      { id: 2, customer_name: 'Juan Carlos', customer_email: 'jc@example.com' }
    ]

    // Act
    const filtered = searchOrders(orders, 'juan')

    // Assert
    expect(filtered.length).toBe(2)
  })

  test('OURD-019: should return empty for no matches', () => {
    // Arrange
    const orders = [
      { id: 1, customer_name: 'Juan Pérez', customer_email: 'juan@example.com' },
      { id: 2, customer_name: 'María González', customer_email: 'maria@example.com' }
    ]

    // Act
    const filtered = searchOrders(orders, 'xxxxxxxx')

    // Assert
    expect(filtered.length).toBe(0)
    expect(filtered).toEqual([])
  })
})

// =============================================================================
// STATUS FILTERING
// =============================================================================

describe('Status filtering - OUrD Enhanced', () => {
  const ORDER_STATUSES = {
    pending: {
      label: 'Pendiente',
      color: 'blue',
      bgClass: 'bg-blue-100',
      textClass: 'text-blue-800'
    },
    verified: {
      label: 'Verificado',
      color: 'indigo',
      bgClass: 'bg-indigo-100',
      textClass: 'text-indigo-800'
    },
    preparing: {
      label: 'Preparando',
      color: 'yellow',
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-800'
    },
    shipped: {
      label: 'Enviado',
      color: 'purple',
      bgClass: 'bg-purple-100',
      textClass: 'text-purple-800'
    },
    delivered: {
      label: 'Entregado',
      color: 'green',
      bgClass: 'bg-green-100',
      textClass: 'text-green-800'
    },
    cancelled: {
      label: 'Cancelado',
      color: 'red',
      bgClass: 'bg-red-100',
      textClass: 'text-red-800'
    }
  }

  /**
   * Filter orders by status
   * @param {Array} orders - Orders array
   * @param {string} status - Status to filter by
   * @returns {Array} Filtered orders
   */
  function filterOrdersByStatus(orders, status) {
    if (!status || status === 'all') {
      return orders
    }
    return orders.filter(order => order.status === status)
  }

  test('OURD-020: should filter orders by status', () => {
    // Arrange
    const orders = [
      { id: 1, status: 'pending' },
      { id: 2, status: 'delivered' },
      { id: 3, status: 'pending' }
    ]

    // Act
    const filtered = filterOrdersByStatus(orders, 'pending')

    // Assert
    expect(filtered.length).toBe(2)
    expect(filtered.map(o => o.id)).toEqual([1, 3])
  })

  test('OURD-021: should not filter when status is "all"', () => {
    // Arrange
    const orders = [
      { id: 1, status: 'pending' },
      { id: 2, status: 'delivered' }
    ]

    // Act
    const filtered = filterOrdersByStatus(orders, 'all')

    // Assert
    expect(filtered.length).toBe(2)
    expect(filtered).toEqual(orders)
  })

  test('OURD-022: should return all when status is undefined', () => {
    // Arrange
    const orders = [
      { id: 1, status: 'pending' },
      { id: 2, status: 'delivered' }
    ]

    // Act
    const filtered = filterOrdersByStatus(orders, undefined)

    // Assert
    expect(filtered.length).toBe(2)
  })

  test('OURD-023: should have correct status definitions', () => {
    // Assert
    expect(Object.keys(ORDER_STATUSES)).toEqual([
      'pending',
      'verified',
      'preparing',
      'shipped',
      'delivered',
      'cancelled'
    ])
  })

  test('OURD-024: should have all 6 status types', () => {
    // Assert
    expect(Object.keys(ORDER_STATUSES).length).toBe(6)
    expect(Object.values(ORDER_STATUSES).every(status => status.label)).toBe(true)
  })
})

// =============================================================================
// PAGINATION UTILITY
// =============================================================================

describe('Pagination functionality - OUrD Enhanced', () => {
  /**
   * Calculate page boundaries for pagination
   * @param {number} page - Current page (1-indexed)
   * @param {number} limit - Items per page
   * @param {number} totalItems - Total number of items
   * @returns {Object} Page boundaries
   */
  function calculatePageBoundaries(page, limit, totalItems) {
    const totalPages = Math.ceil(totalItems / limit)
    const startIndex = (page - 1) * limit
    const endIndex = Math.min(startIndex + limit, totalItems)

    return {
      totalPages,
      startIndex,
      endIndex,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }

  test('OURD-025: should calculate correct page boundaries', () => {
    // Arrange
    const totalItems = 50
    const page = 2
    const limit = 10

    // Act
    const boundaries = calculatePageBoundaries(page, limit, totalItems)

    // Assert
    expect(boundaries.totalPages).toBe(5)
    expect(boundaries.startIndex).toBe(10)
    expect(boundaries.endIndex).toBe(20)
    expect(boundaries.hasNext).toBe(true)
    expect(boundaries.hasPrev).toBe(true)
  })

  test('OURD-026: should calculate total pages correctly', () => {
    // Arrange & Act & Assert
    expect(calculatePageBoundaries(1, 10, 100).totalPages).toBe(10)
    expect(calculatePageBoundaries(1, 10, 101).totalPages).toBe(11)
    expect(calculatePageBoundaries(1, 10, 99).totalPages).toBe(10)
  })

  test('OURD-027: should handle edge cases in pagination', () => {
    // Arrange & Act & Assert
    // Page 1 of 1
    expect(calculatePageBoundaries(1, 10, 5).hasNext).toBe(false)
    expect(calculatePageBoundaries(1, 10, 5).hasPrev).toBe(false)

    // Last page
    expect(calculatePageBoundaries(10, 10, 100).hasNext).toBe(false)
    expect(calculatePageBoundaries(10, 10, 100).hasPrev).toBe(true)

    // Edge case: single item
    expect(calculatePageBoundaries(1, 1, 1).totalPages).toBe(1)
  })
})

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

describe('Utility functions - OUrD Enhanced', () => {
  test('OURD-028: should format currency correctly', () => {
    // Arrange
    const formatCurrency = (amount, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
      }).format(amount)
    }

    // Act & Assert
    expect(formatCurrency(29.99)).toBe('$29.99')
    expect(formatCurrency(45.5)).toBe('$45.50')
    expect(formatCurrency(0)).toBe('$0.00')
  })

  test('OURD-029: should format dates correctly', () => {
    // Arrange
    const formatDate = date => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    // Act & Assert
    const date = new Date('2025-09-30T10:00:00Z')
    const formatted = formatDate(date)
    expect(formatted).toMatch(/[A-Za-z]{3}\s\d{1,2},\s\d{4}/)
  })
})

// =============================================================================
// CSV EXPORT FUNCTIONALITY
// =============================================================================

describe('CSV export functionality - OUrD Enhanced', () => {
  /**
   * Generate CSV header
   * @param {Array} fields - Field names
   * @returns {string} CSV header
   */
  function generateCSVHeader(fields) {
    return fields.join(',')
  }

  /**
   * Format order data for CSV
   * @param {Object} order - Order object
   * @param {Array} fields - Fields to include
   * @returns {string} CSV row
   */
  function formatOrderForCSV(order, fields) {
    return fields
      .map(field => {
        const value = order[field]
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      .join(',')
  }

  test('OURD-030: should generate correct CSV header', () => {
    // Arrange
    const fields = ['id', 'customer_name', 'status', 'total_amount']

    // Act
    const header = generateCSVHeader(fields)

    // Assert
    expect(header).toBe('id,customer_name,status,total_amount')
  })

  test('OURD-031: should format order data for CSV', () => {
    // Arrange
    const order = {
      id: 1,
      customer_name: 'Juan Pérez',
      status: 'pending',
      total_amount: 29.99
    }
    const fields = ['id', 'customer_name', 'status', 'total_amount']

    // Act
    const csvRow = formatOrderForCSV(order, fields)

    // Assert
    expect(csvRow).toBe('1,Juan Pérez,pending,29.99')
  })

  test('OURD-032: should escape commas and quotes in CSV', () => {
    // Arrange
    const order = {
      id: 1,
      customer_name: 'Juan, Jr.',
      status: 'pending'
    }
    const fields = ['id', 'customer_name', 'status']

    // Act
    const csvRow = formatOrderForCSV(order, fields)

    // Assert
    expect(csvRow).toBe('1,"Juan, Jr.",pending')
  })
})

// =============================================================================
// ORDER STATUS CONSTANTS
// =============================================================================

describe('Order status constants - OUrD Enhanced', () => {
  const ORDER_STATUSES = {
    pending: 'pending',
    verified: 'verified',
    preparing: 'preparing',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled'
  }

  test('OURD-033: should have correct status definitions', () => {
    // Assert
    expect(ORDER_STATUSES.pending).toBe('pending')
    expect(ORDER_STATUSES.verified).toBe('verified')
    expect(ORDER_STATUSES.preparing).toBe('preparing')
    expect(ORDER_STATUSES.shipped).toBe('shipped')
    expect(ORDER_STATUSES.delivered).toBe('delivered')
    expect(ORDER_STATUSES.cancelled).toBe('cancelled')
  })

  test('OURD-034: should have all 6 status types', () => {
    // Assert
    const statusValues = Object.values(ORDER_STATUSES)
    expect(statusValues).toContain('pending')
    expect(statusValues).toContain('verified')
    expect(statusValues).toContain('preparing')
    expect(statusValues).toContain('shipped')
    expect(statusValues).toContain('delivered')
    expect(statusValues).toContain('cancelled')
    expect(statusValues).toHaveLength(6)
  })
})
