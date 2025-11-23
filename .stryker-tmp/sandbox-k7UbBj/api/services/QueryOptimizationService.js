/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Query Optimization Service
 * Provides advanced query optimization utilities
 *
 * PRINCIPLES APPLIED:
 * - Service Layer Exclusive: Query optimization logic
 * - KISS First: Simple, focused optimization methods
 * - Performance: Optimized database queries
 * - Fail Fast: Immediate error handling
 */ function stryNS_9fa48() {
  var g =
    (typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis) ||
    new Function('return this')()
  var ns = g.__stryker__ || (g.__stryker__ = {})
  if (
    ns.activeMutant === undefined &&
    g.process &&
    g.process.env &&
    g.process.env.__STRYKER_ACTIVE_MUTANT__
  ) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__
  }
  function retrieveNS() {
    return ns
  }
  stryNS_9fa48 = retrieveNS
  return retrieveNS()
}
stryNS_9fa48()
function stryCov_9fa48() {
  var ns = stryNS_9fa48()
  var cov =
    ns.mutantCoverage ||
    (ns.mutantCoverage = {
      static: {},
      perTest: {}
    })
  function cover() {
    var c = cov.static
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {}
    }
    var a = arguments
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1
    }
  }
  stryCov_9fa48 = cover
  cover.apply(null, arguments)
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48()
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')')
      }
      return true
    }
    return false
  }
  stryMutAct_9fa48 = isActive
  return isActive(id)
}
import { supabase } from './supabaseClient.js'
import { DatabaseError, BadRequestError } from '../errors/AppError.js'

/**
 * Analyze query performance
 * @param {string} table - Table name
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeQueryPerformance(table, filters = {}) {
  if (stryMutAct_9fa48('195')) {
    {
    }
  } else {
    stryCov_9fa48('195')
    try {
      if (stryMutAct_9fa48('196')) {
        {
        }
      } else {
        stryCov_9fa48('196')
        const start = Date.now()

        // Execute query with EXPLAIN
        const { error } = await supabase
          .from(table)
          .select(stryMutAct_9fa48('197') ? '' : (stryCov_9fa48('197'), '*'))
          .limit(1)
        const duration = stryMutAct_9fa48('198')
          ? Date.now() + start
          : (stryCov_9fa48('198'), Date.now() - start)
        if (
          stryMutAct_9fa48('200')
            ? false
            : stryMutAct_9fa48('199')
              ? true
              : (stryCov_9fa48('199', '200'), error)
        ) {
          if (stryMutAct_9fa48('201')) {
            {
            }
          } else {
            stryCov_9fa48('201')
            throw new DatabaseError(
              stryMutAct_9fa48('202') ? '' : (stryCov_9fa48('202'), 'Query analysis failed'),
              stryMutAct_9fa48('203') ? '' : (stryCov_9fa48('203'), 'ANALYZE_QUERY'),
              stryMutAct_9fa48('204')
                ? {}
                : (stryCov_9fa48('204'),
                  {
                    table,
                    filters,
                    error
                  })
            )
          }
        }
        return stryMutAct_9fa48('205')
          ? {}
          : (stryCov_9fa48('205'),
            {
              success: stryMutAct_9fa48('206') ? false : (stryCov_9fa48('206'), true),
              table,
              duration: stryMutAct_9fa48('207') ? `` : (stryCov_9fa48('207'), `${duration}ms`),
              hasIndexes: stryMutAct_9fa48('208') ? false : (stryCov_9fa48('208'), true),
              // Would check in real implementation
              recommendations: generateRecommendations(table, filters, duration)
            })
      }
    } catch (error) {
      if (stryMutAct_9fa48('209')) {
        {
        }
      } else {
        stryCov_9fa48('209')
        console.error(
          stryMutAct_9fa48('210')
            ? ''
            : (stryCov_9fa48('210'), 'QueryOptimizationService.analyzeQueryPerformance failed:'),
          error
        )
        throw error
      }
    }
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
  if (stryMutAct_9fa48('211')) {
    {
    }
  } else {
    stryCov_9fa48('211')
    const recommendations = stryMutAct_9fa48('212')
      ? ['Stryker was here']
      : (stryCov_9fa48('212'), [])
    if (
      stryMutAct_9fa48('216')
        ? duration <= 100
        : stryMutAct_9fa48('215')
          ? duration >= 100
          : stryMutAct_9fa48('214')
            ? false
            : stryMutAct_9fa48('213')
              ? true
              : (stryCov_9fa48('213', '214', '215', '216'), duration > 100)
    ) {
      if (stryMutAct_9fa48('217')) {
        {
        }
      } else {
        stryCov_9fa48('217')
        recommendations.push(
          stryMutAct_9fa48('218')
            ? {}
            : (stryCov_9fa48('218'),
              {
                severity: stryMutAct_9fa48('219') ? '' : (stryCov_9fa48('219'), 'high'),
                message: stryMutAct_9fa48('220')
                  ? ``
                  : (stryCov_9fa48('220'), `Query is slow (${duration}ms)`),
                suggestion: stryMutAct_9fa48('221')
                  ? ''
                  : (stryCov_9fa48('221'), 'Consider adding indexes or optimizing filters')
              })
        )
      }
    }
    if (
      stryMutAct_9fa48('223')
        ? false
        : stryMutAct_9fa48('222')
          ? true
          : (stryCov_9fa48('222', '223'), filters.search)
    ) {
      if (stryMutAct_9fa48('224')) {
        {
        }
      } else {
        stryCov_9fa48('224')
        recommendations.push(
          stryMutAct_9fa48('225')
            ? {}
            : (stryCov_9fa48('225'),
              {
                severity: stryMutAct_9fa48('226') ? '' : (stryCov_9fa48('226'), 'medium'),
                message: stryMutAct_9fa48('227') ? '' : (stryCov_9fa48('227'), 'Using text search'),
                suggestion: stryMutAct_9fa48('228')
                  ? ''
                  : (stryCov_9fa48('228'), 'Consider using full-text search indexes')
              })
        )
      }
    }
    if (
      stryMutAct_9fa48('232')
        ? Object.keys(filters).length <= 3
        : stryMutAct_9fa48('231')
          ? Object.keys(filters).length >= 3
          : stryMutAct_9fa48('230')
            ? false
            : stryMutAct_9fa48('229')
              ? true
              : (stryCov_9fa48('229', '230', '231', '232'), Object.keys(filters).length > 3)
    ) {
      if (stryMutAct_9fa48('233')) {
        {
        }
      } else {
        stryCov_9fa48('233')
        recommendations.push(
          stryMutAct_9fa48('234')
            ? {}
            : (stryCov_9fa48('234'),
              {
                severity: stryMutAct_9fa48('235') ? '' : (stryCov_9fa48('235'), 'low'),
                message: stryMutAct_9fa48('236')
                  ? ''
                  : (stryCov_9fa48('236'), 'Multiple filters applied'),
                suggestion: stryMutAct_9fa48('237')
                  ? ''
                  : (stryCov_9fa48('237'), 'Consider composite indexes')
              })
        )
      }
    }
    return recommendations
  }
}

/**
 * Check if query uses indexes efficiently
 * @param {string} table - Table name
 * @param {Array} filterColumns - Columns used in WHERE clause
 * @returns {Promise<Object>} Index analysis
 */
export async function checkIndexUsage(
  table,
  filterColumns = stryMutAct_9fa48('238') ? ['Stryker was here'] : (stryCov_9fa48('238'), [])
) {
  if (stryMutAct_9fa48('239')) {
    {
    }
  } else {
    stryCov_9fa48('239')
    // In a real implementation, this would query pg_indexes
    // For now, return a basic analysis
    const hasPrimaryKey = stryMutAct_9fa48('240') ? false : (stryCov_9fa48('240'), true) // All tables have primary keys
    const hasForeignKeys = stryMutAct_9fa48('241')
      ? filterColumns.every(col => col.endsWith('_id') || col === 'user_id' || col === 'product_id')
      : (stryCov_9fa48('241'),
        filterColumns.some(
          stryMutAct_9fa48('242')
            ? () => undefined
            : (stryCov_9fa48('242'),
              col =>
                stryMutAct_9fa48('245')
                  ? (col.endsWith('_id') || col === 'user_id') && col === 'product_id'
                  : stryMutAct_9fa48('244')
                    ? false
                    : stryMutAct_9fa48('243')
                      ? true
                      : (stryCov_9fa48('243', '244', '245'),
                        (stryMutAct_9fa48('247')
                          ? col.endsWith('_id') && col === 'user_id'
                          : stryMutAct_9fa48('246')
                            ? false
                            : (stryCov_9fa48('246', '247'),
                              (stryMutAct_9fa48('248')
                                ? col.startsWith('_id')
                                : (stryCov_9fa48('248'),
                                  col.endsWith(
                                    stryMutAct_9fa48('249') ? '' : (stryCov_9fa48('249'), '_id')
                                  ))) ||
                                (stryMutAct_9fa48('251')
                                  ? col !== 'user_id'
                                  : stryMutAct_9fa48('250')
                                    ? false
                                    : (stryCov_9fa48('250', '251'),
                                      col ===
                                        (stryMutAct_9fa48('252')
                                          ? ''
                                          : (stryCov_9fa48('252'), 'user_id')))))) ||
                          (stryMutAct_9fa48('254')
                            ? col !== 'product_id'
                            : stryMutAct_9fa48('253')
                              ? false
                              : (stryCov_9fa48('253', '254'),
                                col ===
                                  (stryMutAct_9fa48('255')
                                    ? ''
                                    : (stryCov_9fa48('255'), 'product_id'))))))
        ))
    return Promise.resolve(
      stryMutAct_9fa48('256')
        ? {}
        : (stryCov_9fa48('256'),
          {
            table,
            hasPrimaryKey,
            hasForeignKeys,
            filterColumns,
            recommendation: hasForeignKeys
              ? stryMutAct_9fa48('257')
                ? ''
                : (stryCov_9fa48('257'), 'Consider index on foreign key columns')
              : stryMutAct_9fa48('258')
                ? ''
                : (stryCov_9fa48('258'), 'Primary key index should be sufficient')
          })
    )
  }
}

/**
 * Optimize query based on filter patterns
 * @param {Object} query - Query object
 * @returns {Object} Optimized query
 */
export function optimizeQuery(query) {
  if (stryMutAct_9fa48('259')) {
    {
    }
  } else {
    stryCov_9fa48('259')
    const optimized = stryMutAct_9fa48('260')
      ? {}
      : (stryCov_9fa48('260'),
        {
          ...query
        })

    // Remove undefined/null values
    Object.keys(optimized).forEach(key => {
      if (stryMutAct_9fa48('261')) {
        {
        }
      } else {
        stryCov_9fa48('261')
        if (
          stryMutAct_9fa48('264')
            ? optimized[key] === undefined && optimized[key] === null
            : stryMutAct_9fa48('263')
              ? false
              : stryMutAct_9fa48('262')
                ? true
                : (stryCov_9fa48('262', '263', '264'),
                  (stryMutAct_9fa48('266')
                    ? optimized[key] !== undefined
                    : stryMutAct_9fa48('265')
                      ? false
                      : (stryCov_9fa48('265', '266'), optimized[key] === undefined)) ||
                    (stryMutAct_9fa48('268')
                      ? optimized[key] !== null
                      : stryMutAct_9fa48('267')
                        ? false
                        : (stryCov_9fa48('267', '268'), optimized[key] === null)))
        ) {
          if (stryMutAct_9fa48('269')) {
            {
            }
          } else {
            stryCov_9fa48('269')
            delete optimized[key]
          }
        }
      }
    })

    // Ensure limit for safety
    if (
      stryMutAct_9fa48('272')
        ? false
        : stryMutAct_9fa48('271')
          ? true
          : stryMutAct_9fa48('270')
            ? optimized.limit
            : (stryCov_9fa48('270', '271', '272'), !optimized.limit)
    ) {
      if (stryMutAct_9fa48('273')) {
        {
        }
      } else {
        stryCov_9fa48('273')
        optimized.limit = 100
      }
    }

    // Prefer index-friendly operations
    if (
      stryMutAct_9fa48('275')
        ? false
        : stryMutAct_9fa48('274')
          ? true
          : (stryCov_9fa48('274', '275'), optimized.search)
    ) {
      if (stryMutAct_9fa48('276')) {
        {
        }
      } else {
        stryCov_9fa48('276')
        // Use exact match for IDs when possible
        const numSearch = parseInt(optimized.search, 10)
        if (
          stryMutAct_9fa48('279')
            ? false
            : stryMutAct_9fa48('278')
              ? true
              : stryMutAct_9fa48('277')
                ? isNaN(numSearch)
                : (stryCov_9fa48('277', '278', '279'), !isNaN(numSearch))
        ) {
          if (stryMutAct_9fa48('280')) {
            {
            }
          } else {
            stryCov_9fa48('280')
            optimized.id = numSearch
            delete optimized.search
          }
        }
      }
    }
    return optimized
  }
}

/**
 * Batch queries for better performance
 * @param {Array} queries - Array of query objects
 * @returns {Promise<Array>} Query results
 */
export async function executeBatchQueries(queries) {
  if (stryMutAct_9fa48('281')) {
    {
    }
  } else {
    stryCov_9fa48('281')
    try {
      if (stryMutAct_9fa48('282')) {
        {
        }
      } else {
        stryCov_9fa48('282')
        if (
          stryMutAct_9fa48('285')
            ? !Array.isArray(queries) && queries.length === 0
            : stryMutAct_9fa48('284')
              ? false
              : stryMutAct_9fa48('283')
                ? true
                : (stryCov_9fa48('283', '284', '285'),
                  (stryMutAct_9fa48('286')
                    ? Array.isArray(queries)
                    : (stryCov_9fa48('286'), !Array.isArray(queries))) ||
                    (stryMutAct_9fa48('288')
                      ? queries.length !== 0
                      : stryMutAct_9fa48('287')
                        ? false
                        : (stryCov_9fa48('287', '288'), queries.length === 0)))
        ) {
          if (stryMutAct_9fa48('289')) {
            {
            }
          } else {
            stryCov_9fa48('289')
            throw new BadRequestError(
              stryMutAct_9fa48('290')
                ? ''
                : (stryCov_9fa48('290'), 'Queries must be a non-empty array'),
              stryMutAct_9fa48('291')
                ? {}
                : (stryCov_9fa48('291'),
                  {
                    queries
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('295')
            ? queries.length <= 10
            : stryMutAct_9fa48('294')
              ? queries.length >= 10
              : stryMutAct_9fa48('293')
                ? false
                : stryMutAct_9fa48('292')
                  ? true
                  : (stryCov_9fa48('292', '293', '294', '295'), queries.length > 10)
        ) {
          if (stryMutAct_9fa48('296')) {
            {
            }
          } else {
            stryCov_9fa48('296')
            throw new BadRequestError(
              stryMutAct_9fa48('297') ? '' : (stryCov_9fa48('297'), 'Maximum 10 queries per batch'),
              stryMutAct_9fa48('298')
                ? {}
                : (stryCov_9fa48('298'),
                  {
                    count: queries.length
                  })
            )
          }
        }
        const results = await Promise.allSettled(
          queries.map(async query => {
            if (stryMutAct_9fa48('299')) {
              {
              }
            } else {
              stryCov_9fa48('299')
              const { data, error } = await supabase
                .from(query.table)
                .select(
                  stryMutAct_9fa48('302')
                    ? query.select && '*'
                    : stryMutAct_9fa48('301')
                      ? false
                      : stryMutAct_9fa48('300')
                        ? true
                        : (stryCov_9fa48('300', '301', '302'),
                          query.select ||
                            (stryMutAct_9fa48('303') ? '' : (stryCov_9fa48('303'), '*')))
                )
                .match(
                  stryMutAct_9fa48('306')
                    ? query.filters && {}
                    : stryMutAct_9fa48('305')
                      ? false
                      : stryMutAct_9fa48('304')
                        ? true
                        : (stryCov_9fa48('304', '305', '306'), query.filters || {})
                )
              if (
                stryMutAct_9fa48('308')
                  ? false
                  : stryMutAct_9fa48('307')
                    ? true
                    : (stryCov_9fa48('307', '308'), error)
              ) {
                if (stryMutAct_9fa48('309')) {
                  {
                  }
                } else {
                  stryCov_9fa48('309')
                  throw new DatabaseError(
                    stryMutAct_9fa48('310') ? '' : (stryCov_9fa48('310'), 'Batch query failed'),
                    stryMutAct_9fa48('311') ? '' : (stryCov_9fa48('311'), 'BATCH_QUERY'),
                    stryMutAct_9fa48('312')
                      ? {}
                      : (stryCov_9fa48('312'),
                        {
                          query,
                          error
                        })
                  )
                }
              }
              return data
            }
          })
        )
        return results.map(
          stryMutAct_9fa48('313')
            ? () => undefined
            : (stryCov_9fa48('313'),
              (result, index) =>
                stryMutAct_9fa48('314')
                  ? {}
                  : (stryCov_9fa48('314'),
                    {
                      index,
                      success: stryMutAct_9fa48('317')
                        ? result.status !== 'fulfilled'
                        : stryMutAct_9fa48('316')
                          ? false
                          : stryMutAct_9fa48('315')
                            ? true
                            : (stryCov_9fa48('315', '316', '317'),
                              result.status ===
                                (stryMutAct_9fa48('318')
                                  ? ''
                                  : (stryCov_9fa48('318'), 'fulfilled'))),
                      data: (
                        stryMutAct_9fa48('321')
                          ? result.status !== 'fulfilled'
                          : stryMutAct_9fa48('320')
                            ? false
                            : stryMutAct_9fa48('319')
                              ? true
                              : (stryCov_9fa48('319', '320', '321'),
                                result.status ===
                                  (stryMutAct_9fa48('322')
                                    ? ''
                                    : (stryCov_9fa48('322'), 'fulfilled')))
                      )
                        ? result.value
                        : null,
                      error: (
                        stryMutAct_9fa48('325')
                          ? result.status !== 'rejected'
                          : stryMutAct_9fa48('324')
                            ? false
                            : stryMutAct_9fa48('323')
                              ? true
                              : (stryCov_9fa48('323', '324', '325'),
                                result.status ===
                                  (stryMutAct_9fa48('326')
                                    ? ''
                                    : (stryCov_9fa48('326'), 'rejected')))
                      )
                        ? result.reason.message
                        : null
                    }))
        )
      }
    } catch (error) {
      if (stryMutAct_9fa48('327')) {
        {
        }
      } else {
        stryCov_9fa48('327')
        console.error(
          stryMutAct_9fa48('328')
            ? ''
            : (stryCov_9fa48('328'), 'QueryOptimizationService.executeBatchQueries failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get slow query logs (placeholder)
 * @returns {Promise<Array>} Slow queries
 */
export async function getSlowQueries() {
  if (stryMutAct_9fa48('329')) {
    {
    }
  } else {
    stryCov_9fa48('329')
    // In a real implementation, this would query pg_stat_statements
    // For placeholder, return mock data
    return Promise.resolve(
      stryMutAct_9fa48('330')
        ? []
        : (stryCov_9fa48('330'),
          [
            stryMutAct_9fa48('331')
              ? {}
              : (stryCov_9fa48('331'),
                {
                  query: stryMutAct_9fa48('332')
                    ? ''
                    : (stryCov_9fa48('332'), 'SELECT * FROM products WHERE featured = true'),
                  averageTime: stryMutAct_9fa48('333') ? '' : (stryCov_9fa48('333'), '245ms'),
                  callCount: 156,
                  recommendation: stryMutAct_9fa48('334')
                    ? ''
                    : (stryCov_9fa48('334'), 'Add index on (featured, active)')
                })
          ])
    )
  }
}
export default stryMutAct_9fa48('335')
  ? {}
  : (stryCov_9fa48('335'),
    {
      analyzeQueryPerformance,
      checkIndexUsage,
      optimizeQuery,
      executeBatchQueries,
      getSlowQueries
    })
