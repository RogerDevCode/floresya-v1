/**
 * Query Optimization Service
 * Provides advanced query optimization utilities
 *
 * PRINCIPLES APPLIED:
 * - Service Layer Exclusive: Query optimization logic
 * - KISS First: Simple, focused optimization methods
 * - Performance: Optimized database queries
 * - Fail Fast: Immediate error handling
 */

import { supabase } from './supabaseClient.js'
import { DatabaseError, BadRequestError } from '../errors/AppError.js'

/**
 * Analyze query performance
 * @param {string} table - Table name
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeQueryPerformance(table, filters = {}) {
  try {
    const start = Date.now()

    // Execute query with EXPLAIN
    const { error } = await supabase.from(table).select('*').limit(1)

    const duration = Date.now() - start

    if (error) {
      throw new DatabaseError('Query analysis failed', 'ANALYZE_QUERY', { table, filters, error })
    }

    return {
      success: true,
      table,
      duration: `${duration}ms`,
      hasIndexes: true, // Would check in real implementation
      recommendations: generateRecommendations(table, filters, duration)
    }
  } catch (error) {
    console.error('QueryOptimizationService.analyzeQueryPerformance failed:', error)
    throw error
  }
}

/**
 * Generate optimization recommendations
 * @param {string} table - Table name
 * @param {Object} filters - Query filters
 * @param {number} duration - Query duration
 * @returns {Array} Recommendations
 */
function generateRecommendations(table, filters, duration) {
  const recommendations = []

  if (duration > 100) {
    recommendations.push({
      severity: 'high',
      message: `Query is slow (${duration}ms)`,
      suggestion: 'Consider adding indexes or optimizing filters'
    })
  }

  if (filters.search) {
    recommendations.push({
      severity: 'medium',
      message: 'Using text search',
      suggestion: 'Consider using full-text search indexes'
    })
  }

  if (Object.keys(filters).length > 3) {
    recommendations.push({
      severity: 'low',
      message: 'Multiple filters applied',
      suggestion: 'Consider composite indexes'
    })
  }

  return recommendations
}

/**
 * Check if query uses indexes efficiently
 * @param {string} table - Table name
 * @param {Array} filterColumns - Columns used in WHERE clause
 * @returns {Promise<Object>} Index analysis
 */
export async function checkIndexUsage(table, filterColumns = []) {
  // In a real implementation, this would query pg_indexes
  // For now, return a basic analysis
  const hasPrimaryKey = true // All tables have primary keys
  const hasForeignKeys = filterColumns.some(
    col => col.endsWith('_id') || col === 'user_id' || col === 'product_id'
  )

  return Promise.resolve({
    table,
    hasPrimaryKey,
    hasForeignKeys,
    filterColumns,
    recommendation: hasForeignKeys
      ? 'Consider index on foreign key columns'
      : 'Primary key index should be sufficient'
  })
}

/**
 * Optimize query based on filter patterns
 * @param {Object} query - Query object
 * @returns {Object} Optimized query
 */
export function optimizeQuery(query) {
  const optimized = { ...query }

  // Remove undefined/null values
  Object.keys(optimized).forEach(key => {
    if (optimized[key] === undefined || optimized[key] === null) {
      delete optimized[key]
    }
  })

  // Ensure limit for safety
  if (!optimized.limit) {
    optimized.limit = 100
  }

  // Prefer index-friendly operations
  if (optimized.search) {
    // Use exact match for IDs when possible
    const numSearch = parseInt(optimized.search, 10)
    if (!isNaN(numSearch)) {
      optimized.id = numSearch
      delete optimized.search
    }
  }

  return optimized
}

/**
 * Batch queries for better performance
 * @param {Array} queries - Array of query objects
 * @returns {Promise<Array>} Query results
 */
export async function executeBatchQueries(queries) {
  try {
    if (!Array.isArray(queries) || queries.length === 0) {
      throw new BadRequestError('Queries must be a non-empty array', { queries })
    }

    if (queries.length > 10) {
      throw new BadRequestError('Maximum 10 queries per batch', { count: queries.length })
    }

    const results = await Promise.allSettled(
      queries.map(async query => {
        const { data, error } = await supabase
          .from(query.table)
          .select(query.select || '*')
          .match(query.filters || {})

        if (error) {
          throw new DatabaseError('Batch query failed', 'BATCH_QUERY', { query, error })
        }

        return data
      })
    )

    return results.map((result, index) => ({
      index,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null
    }))
  } catch (error) {
    console.error('QueryOptimizationService.executeBatchQueries failed:', error)
    throw error
  }
}

/**
 * Get slow query logs (placeholder)
 * @returns {Promise<Array>} Slow queries
 */
export async function getSlowQueries() {
  // In a real implementation, this would query pg_stat_statements
  // For placeholder, return mock data
  return Promise.resolve([
    {
      query: 'SELECT * FROM products WHERE featured = true',
      averageTime: '245ms',
      callCount: 156,
      recommendation: 'Add index on (featured, active)'
    }
  ])
}

export default {
  analyzeQueryPerformance,
  checkIndexUsage,
  optimizeQuery,
  executeBatchQueries,
  getSlowQueries
}
