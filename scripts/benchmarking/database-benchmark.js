/**
 * Database Query Performance Benchmarks
 * Tests key database operations for query performance, indexing efficiency, and connection pooling
 */

import { performance } from 'perf_hooks'
import { createClient } from '@supabase/supabase-js'

class DatabaseBenchmark {
  constructor(options = {}) {
    this.supabaseUrl = options.supabaseUrl || process.env.SUPABASE_URL
    this.supabaseKey = options.supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY
    this.client = null
  }

  async initialize() {
    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('Supabase URL and service role key are required for database benchmarks')
    }

    this.client = createClient(this.supabaseUrl, this.supabaseKey, {
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-application-name': 'performance-benchmark'
        }
      }
    })

    // Test connection
    const { error } = await this.client.from('products').select('count').limit(1)
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`)
    }
  }

  async run(options = {}) {
    const { iterations = 50, concurrency = 5 } = options

    if (!this.client) {
      await this.initialize()
    }

    console.log(
      `🗄️  Running database benchmarks: ${iterations} iterations, ${concurrency} concurrent queries`
    )

    const queries = [
      {
        name: 'Simple Product Select',
        query: () => this.client.from('products').select('id, name, price').limit(10),
        description: 'Basic product listing query'
      },
      {
        name: 'Product with Category Join',
        query: () => this.client.from('products').select('*, categories(name)').limit(10),
        description: 'Product query with category join'
      },
      {
        name: 'Complex Product Filter',
        query: () =>
          this.client
            .from('products')
            .select('*, categories(name)')
            .gte('price', 10)
            .lte('price', 100)
            .eq('active', true)
            .order('price', { ascending: false })
            .limit(20),
        description: 'Complex filtering and sorting'
      },
      {
        name: 'User Orders Query',
        query: () =>
          this.client.from('orders').select('*, order_items(*, products(name, price))').limit(5),
        description: 'Orders with items and product details'
      },
      {
        name: 'Search Query',
        query: () => this.client.from('products').select('*').ilike('name', '%flower%').limit(10),
        description: 'Text search query'
      }
    ]

    const results = {
      queries: {},
      summary: {
        totalQueries: 0,
        successfulQueries: 0,
        failedQueries: 0,
        averageQueryTime: 0,
        p95QueryTime: 0,
        throughput: 0,
        errorRate: 0
      }
    }

    // Test each query type
    for (const queryConfig of queries) {
      console.log(`   Testing ${queryConfig.name}...`)
      const queryResult = await this.benchmarkQuery(queryConfig, iterations, concurrency)
      results.queries[queryConfig.name] = queryResult
      results.summary.totalQueries += queryResult.queries
      results.summary.successfulQueries += queryResult.successful
      results.summary.failedQueries += queryResult.failed
    }

    // Calculate summary metrics
    const allQueryTimes = Object.values(results.queries).flatMap(query => query.queryTimes)

    results.summary.averageQueryTime =
      allQueryTimes.reduce((a, b) => a + b, 0) / allQueryTimes.length
    results.summary.p95QueryTime = this.calculatePercentile(allQueryTimes, 95)
    results.summary.throughput = results.summary.totalQueries / (performance.now() / 1000) // queries per second
    results.summary.errorRate = results.summary.failedQueries / results.summary.totalQueries

    // Add operations count for summary
    results.operations = results.summary.totalQueries
    results.averageResponseTime = results.summary.averageQueryTime
    results.throughput = results.summary.throughput
    results.errorRate = results.summary.errorRate
    results.p95ResponseTime = results.summary.p95QueryTime

    console.log(
      `   ✅ Database benchmarks completed: ${results.summary.successfulQueries}/${results.summary.totalQueries} successful`
    )

    return results
  }

  async benchmarkQuery(queryConfig, iterations, concurrency) {
    const queryTimes = []
    const errors = []
    let successful = 0
    let failed = 0

    // Create batches for concurrent execution
    const batches = []
    for (let i = 0; i < iterations; i += concurrency) {
      batches.push(iterations - i >= concurrency ? concurrency : iterations - i)
    }

    for (const batchSize of batches) {
      const promises = []

      for (let i = 0; i < batchSize; i++) {
        promises.push(this.executeQuery(queryConfig))
      }

      const batchResults = await Promise.allSettled(promises)

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          const { queryTime, error } = result.value

          if (error) {
            errors.push(error)
            failed++
          } else {
            queryTimes.push(queryTime)
            successful++
          }
        } else {
          errors.push(result.reason.message || result.reason)
          failed++
        }
      }
    }

    return {
      queries: iterations,
      successful,
      failed,
      queryTimes,
      errors,
      averageQueryTime:
        queryTimes.length > 0 ? queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length : 0,
      p95QueryTime: this.calculatePercentile(queryTimes, 95),
      throughput: iterations / (performance.now() / 1000)
    }
  }

  async executeQuery(queryConfig) {
    const startTime = performance.now()

    try {
      const { error } = await queryConfig.query()

      const queryTime = performance.now() - startTime

      if (error) {
        return { queryTime, error: error.message, data: null }
      }

      return { queryTime, error: null, data: null }
    } catch (error) {
      const queryTime = performance.now() - startTime
      return { queryTime, error: error.message, data: null }
    }
  }

  calculatePercentile(values, percentile) {
    if (values.length === 0) {
      return 0
    }

    const sorted = [...values].sort((a, b) => a - b)
    const index = (percentile / 100) * (sorted.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)

    if (lower === upper) {
      return sorted[lower]
    }

    return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
  }

  async cleanup() {
    if (this.client) {
      // Close any open connections if needed
      this.client = null
    }
  }
}

const databaseBenchmark = new DatabaseBenchmark()

export { DatabaseBenchmark, databaseBenchmark }
