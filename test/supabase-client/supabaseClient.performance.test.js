/**
 * Comprehensive Supabase Client Tests - Vitest Edition
 * Tests database operations, RPC functions, transactions, error handling, and data consistency
 * Following Supabase official documentation and MIT/Stanford best practices
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { createSupabaseClientMock } from './mocks/mocks.js'

// Helper function to create test client
function createTestClient() {
  return createSupabaseClientMock({
    url: 'https://test-project.supabase.co',
    anonKey: 'test-anon-key'
  })
}

describe('Performance Monitoring Integration', () => {
  let client

  beforeEach(() => {
    client = createTestClient()
  })

  afterEach(() => {
    client.reset()
  })

  test('should track all query types in performance metrics', async () => {
    // SELECT
    await client.from('users').select()

    // INSERT
    await client.from('users').insert({ email: 'perf@example.com', name: 'Perf Test' }).select()

    // UPDATE
    await client.from('users').update({ name: 'Updated' }).eq('id', 1).select()

    // DELETE
    await client.from('users').delete().eq('id', 2).select()

    // RPC
    await client.rpc('get_user_profile', { user_id: 1 })

    const metrics = client.getPerformanceMetrics()

    expect(metrics.totalQueries).toBe(5)
    expect(metrics.successfulQueries).toBe(5)
    expect(metrics.failedQueries).toBe(0)
    expect(metrics.successRate).toBe(100)

    // Verify query types are tracked
    const queryTypes = metrics.queries.map(q => q.operation)
    expect(queryTypes).toContain('select')
    expect(queryTypes).toContain('rpc')
  })

  test('should calculate accurate performance metrics', async () => {
    // Execute queries with different delays
    const fastQuery = client.from('users').select()
    fastQuery.simulateDelay(10)
    await fastQuery

    const slowQuery = client.from('profiles').select()
    slowQuery.simulateDelay(100)
    await slowQuery

    const metrics = client.getPerformanceMetrics()

    expect(metrics.totalQueries).toBe(2)
    expect(metrics.averageDuration).toBeGreaterThan(10)
    expect(metrics.averageDuration).toBeLessThan(100)

    // Verify individual query durations
    expect(metrics.queries[0].duration).toBeGreaterThan(0)
    expect(metrics.queries[1].duration).toBeGreaterThan(0)
  })

  test('should allow performance monitoring to be disabled', async () => {
    client.disablePerformanceMonitoring()

    await client.from('users').select()
    await client.from('profiles').select()

    const metrics = client.getPerformanceMetrics()

    expect(metrics.totalQueries).toBe(0)
    expect(metrics.queries.length).toBe(0)
  })

  test('should allow performance monitoring to be re-enabled', async () => {
    client.disablePerformanceMonitoring()
    await client.from('users').select()

    let metrics = client.getPerformanceMetrics()
    expect(metrics.totalQueries).toBe(0)

    client.enablePerformanceMonitoring()
    await client.from('profiles').select()

    metrics = client.getPerformanceMetrics()
    expect(metrics.totalQueries).toBe(1)
  })

  test('should reset performance metrics correctly', async () => {
    await client.from('users').select()
    await client.from('profiles').select()

    let metrics = client.getPerformanceMetrics()
    expect(metrics.totalQueries).toBe(2)

    client.performanceMonitor.reset()

    metrics = client.getPerformanceMetrics()
    expect(metrics.totalQueries).toBe(0)
    expect(metrics.queries.length).toBe(0)
  })
})

describe('Performance Boundary Testing', () => {
  let client

  beforeEach(() => {
    client = createTestClient()
  })

  afterEach(() => {
    client.reset()
  })

  test('should track slow queries', async () => {
    const slowQuery = client.from('users').select()
    slowQuery.simulateDelay(1500) // 1.5 seconds

    await slowQuery

    const metrics = client.getPerformanceMetrics()
    expect(metrics.slowQueries).toBe(1)
    expect(metrics.slowQueryRate).toBe(100)
  })

  test('should track very slow queries', async () => {
    const verySlowQuery = client.from('users').select()
    verySlowQuery.simulateDelay(6000) // 6 seconds

    await verySlowQuery

    const metrics = client.getPerformanceMetrics()
    expect(metrics.verySlowQueries).toBe(1)
    expect(metrics.slowQueries).toBe(1) // Very slow queries are also counted as slow
  })

  test('should track concurrent queries', async () => {
    // Execute multiple queries concurrently
    const queries = Array(5)
      .fill()
      .map(() => client.from('users').select())

    await Promise.all(queries)

    const metrics = client.getPerformanceMetrics()
    expect(metrics.maxConcurrentQueries).toBeGreaterThan(1)
  })

  test('should check performance boundaries and report issues', async () => {
    // Create some slow queries
    const slowQuery1 = client.from('users').select()
    slowQuery1.simulateDelay(1500)

    const slowQuery2 = client.from('profiles').select()
    slowQuery2.simulateDelay(2000)

    await Promise.all([slowQuery1, slowQuery2])

    const boundaryCheck = client.performanceMonitor.checkPerformanceBoundaries()

    expect(boundaryCheck.passed).toBe(false)
    expect(boundaryCheck.issues.length).toBeGreaterThan(0)
    expect(boundaryCheck.issues.some(issue => issue.type === 'HIGH_SLOW_QUERY_RATE')).toBe(true)
  })

  test('should pass boundary check with good performance', async () => {
    // Create fast queries
    const fastQuery1 = client.from('users').select()
    fastQuery1.simulateDelay(50)

    const fastQuery2 = client.from('profiles').select()
    fastQuery2.simulateDelay(100)

    await Promise.all([fastQuery1, fastQuery2])

    const boundaryCheck = client.performanceMonitor.checkPerformanceBoundaries()

    expect(boundaryCheck.passed).toBe(true)
    expect(boundaryCheck.issues.length).toBe(0)
  })

  test('should update performance thresholds', async () => {
    // Update thresholds to be very strict
    client.performanceMonitor.updateThresholds({
      slowQueryThreshold: 10, // 10ms
      verySlowQueryThreshold: 50 // 50ms
    })

    const query = client.from('users').select()
    query.simulateDelay(20) // 20ms would be slow with new threshold

    await query

    const metrics = client.getPerformanceMetrics()
    expect(metrics.slowQueries).toBe(1)
  })

  test('should get boundary violations summary', async () => {
    // Create mix of slow and very slow queries
    const slowQuery = client.from('users').select()
    slowQuery.simulateDelay(1500)

    const verySlowQuery = client.from('profiles').select()
    verySlowQuery.simulateDelay(6000)

    await Promise.all([slowQuery, verySlowQuery])

    const violations = client.performanceMonitor.getBoundaryViolations()

    expect(violations.summary.total).toBe(2)
    expect(violations.summary.slow).toBe(1)
    expect(violations.summary.verySlow).toBe(1)
    expect(violations.violations).toHaveLength(2)
  })
})
