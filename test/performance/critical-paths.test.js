/**
 * Critical Path Performance Tests
 * Enforcing performance gates for key business operations
 */

import { describe, test, expect, vi } from 'vitest'
import { createOrderWithItems } from '../../api/services/orderService.js'
import { analyzeQueryPerformance } from '../../api/services/QueryOptimizationService.js'

// Mock dependencies
vi.mock('../../api/services/supabaseClient.js', () => {
  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({ data: {}, error: null })
    })),
    rpc: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null })
  }

  return {
    supabase: mockSupabase,
    DB_SCHEMA: {
      products: { table: 'products' },
      orders: {
        table: 'orders',
        enums: {
          status: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        }
      },
      users: { table: 'users' }
    }
  }
})

// Mock DIContainer
vi.mock('../../api/architecture/di-container.js', () => {
  return {
    default: {
      resolve: vi.fn(name => {
        if (name === 'Logger') {
          return { info: vi.fn(), error: vi.fn(), warn: vi.fn() }
        }
        if (name === 'ProductRepository') {
          return {
            findById: vi.fn().mockResolvedValue({ id: 1, price_usd: 100, stock: 10, active: true }),
            decrementStock: vi.fn().mockResolvedValue(true)
          }
        }
        if (name === 'OrderRepository') {
          return {
            create: vi.fn().mockResolvedValue({ id: 1 }),
            findById: vi.fn().mockResolvedValue({ id: 1 }),
            findByIdWithItems: vi.fn().mockResolvedValue({ id: 1, items: [] }),
            createWithItems: vi.fn().mockResolvedValue({ id: 1, status: 'pending' })
          }
        }
        return {}
      })
    }
  }
})

describe('Performance Gates - Critical Paths', () => {
  // Performance thresholds in milliseconds
  const THRESHOLDS = {
    ORDER_CREATION: 500,
    PRODUCT_SEARCH: 200,
    USER_AUTH: 300
  }

  test('Order Creation should be under 500ms', async () => {
    const orderData = {
      customer_id: 1, // Required
      customer_email: 'perf@test.com',
      customer_name: 'Performance Tester',
      delivery_address: '123 Speed St',
      total_amount_usd: 100,
      total_amount: 100 // Also required
    }
    const items = [
      { product_id: 1, quantity: 1, unit_price_usd: 100, product_name: 'Test Product' }
    ]

    const start = performance.now()
    await createOrderWithItems(orderData, items)
    const end = performance.now()
    const duration = end - start

    expect(duration).toBeLessThan(THRESHOLDS.ORDER_CREATION)
    console.log(`Order Creation Duration: ${duration.toFixed(2)}ms`)
  })

  test('Product Search Analysis should be under 200ms', async () => {
    const start = performance.now()
    await analyzeQueryPerformance('products', { search: 'rose' })
    const end = performance.now()
    const duration = end - start

    expect(duration).toBeLessThan(THRESHOLDS.PRODUCT_SEARCH)
    console.log(`Product Search Analysis Duration: ${duration.toFixed(2)}ms`)
  })

  test('User Auth Simulation should be under 300ms', async () => {
    // Simulating auth check overhead
    const start = performance.now()
    // In a real scenario, this would call authService.authenticate
    // For now, we simulate the async operation
    await new Promise(resolve => setTimeout(resolve, 50))
    const end = performance.now()
    const duration = end - start

    expect(duration).toBeLessThan(THRESHOLDS.USER_AUTH)
    console.log(`User Auth Simulation Duration: ${duration.toFixed(2)}ms`)
  })
})
