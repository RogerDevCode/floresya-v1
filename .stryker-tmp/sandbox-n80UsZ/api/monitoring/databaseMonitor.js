/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Database Query Monitoring Middleware
 * Intercepts and monitors Supabase/PostgreSQL queries for performance tracking
 * Integrates with metricsCollector for slow query logging and performance analysis
 */

import { recordDatabaseQuery } from './metricsCollector.js'
import { logger } from '../utils/logger.js'

/**
 * Database monitoring middleware factory
 * Wraps Supabase client methods to track query performance
 */
export function createDatabaseMonitoringMiddleware(supabaseClient) {
  const monitoredClient = {}

  // Methods to monitor
  const methodsToMonitor = [
    'select',
    'insert',
    'update',
    'delete',
    'upsert',
    'from',
    'rpc',
    'storage' // Include storage operations
  ]

  // Wrap the main query builder methods
  methodsToMonitor.forEach(method => {
    if (typeof supabaseClient[method] === 'function') {
      monitoredClient[method] = function (...args) {
        const startTime = Date.now()

        try {
          const result = supabaseClient[method].apply(this, args)

          // For query builder methods, wrap the execution
          if (result && typeof result === 'object') {
            // Intercept common query execution methods
            const executionMethods = ['single', 'maybeSingle', 'csv', 'explain']

            executionMethods.forEach(execMethod => {
              if (result[execMethod] && typeof result[execMethod] === 'function') {
                const originalExec = result[execMethod].bind(result)
                result[execMethod] = async function (...execArgs) {
                  const execStartTime = Date.now()
                  try {
                    const execResult = await originalExec(...execArgs)
                    const execTime = Date.now() - execStartTime

                    // Record the query execution
                    recordDatabaseQuery(
                      `${method}.${execMethod}`,
                      execTime,
                      `${method}(${args.join(', ')}).${execMethod}(${execArgs.join(', ')})`,
                      1000 // 1 second threshold for slow queries
                    )

                    return execResult
                  } catch (error) {
                    const execTime = Date.now() - execStartTime
                    recordDatabaseQuery(
                      `${method}.${execMethod}`,
                      execTime,
                      `${method}(${args.join(', ')}).${execMethod}(${execArgs.join(', ')}) - ERROR: ${error.message}`,
                      1000
                    )
                    throw error
                  }
                }
              }
            })

            // Also wrap the main execution (when no specific method is called)
            const originalThen = result.then
            if (originalThen) {
              result.then = function (onFulfilled, onRejected) {
                const queryStartTime = Date.now()

                return originalThen.call(
                  this,
                  function (value) {
                    const queryTime = Date.now() - queryStartTime
                    recordDatabaseQuery(method, queryTime, `${method}(${args.join(', ')})`, 1000)
                    return onFulfilled ? onFulfilled(value) : value
                  },
                  function (error) {
                    const queryTime = Date.now() - queryStartTime
                    recordDatabaseQuery(
                      method,
                      queryTime,
                      `${method}(${args.join(', ')}) - ERROR: ${error.message}`,
                      1000
                    )
                    return onRejected ? onRejected(error) : Promise.reject(error)
                  }
                )
              }
            }
          }

          return result
        } catch (error) {
          const totalTime = Date.now() - startTime
          recordDatabaseQuery(
            method,
            totalTime,
            `${method}(${args.join(', ')}) - SETUP ERROR: ${error.message}`,
            1000
          )
          throw error
        }
      }
    } else {
      // If method doesn't exist, just copy it over
      monitoredClient[method] = supabaseClient[method]
    }
  })

  // Copy over any other properties/methods
  Object.keys(supabaseClient).forEach(key => {
    if (!monitoredClient[key]) {
      monitoredClient[key] = supabaseClient[key]
    }
  })

  return monitoredClient
}

/**
 * Enhanced Supabase client with monitoring
 * Wraps the original client to track all database operations
 */
export function createMonitoredSupabaseClient(originalClient) {
  logger.info('Creating monitored Supabase client for database query tracking')

  const monitoredClient = createDatabaseMonitoringMiddleware(originalClient)

  // Add monitoring metadata
  monitoredClient._monitoring = {
    enabled: true,
    slowQueryThreshold: 1000, // ms
    createdAt: new Date().toISOString()
  }

  return monitoredClient
}

/**
 * Database performance report generator
 */
export function generateDatabasePerformanceReport() {
  // This will be called by the metrics endpoints
  // The actual data comes from metricsCollector.getDatabaseMetrics()
  return {
    message: 'Database performance report generated',
    note: 'Use /health/metrics endpoint for detailed metrics'
  }
}
