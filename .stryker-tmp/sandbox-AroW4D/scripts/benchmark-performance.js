#!/usr/bin/env node
// @ts-nocheck

/**
 * Database Performance Benchmark Suite
 * Comprehensive benchmarking for database optimizations
 * Run with: node scripts/benchmark-performance.js
 */

import { createClient } from '@supabase/supabase-js'
import { performance } from 'perf_hooks'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const CONFIG = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  benchmarkRuns: 10,
  concurrentUsers: 5,
  testDuration: 30000, // 30 seconds
  outputFile: path.join(__dirname, '../benchmark-results.json')
}

// Initialize Supabase client
const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey)

/**
 * Benchmark runner class
 */
class PerformanceBenchmark {
  constructor() {
    this.results = {
      metadata: {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      benchmarks: []
    }
  }

  /**
   * Run a single benchmark
   */
  async runBenchmark(name, description, testFunction, options = {}) {
    console.log(`\n🧪 Running benchmark: ${name}`)
    console.log(`📝 ${description}`)

    const runs = options.runs || CONFIG.benchmarkRuns
    const times = []

    for (let i = 0; i < runs; i++) {
      const startTime = performance.now()
      try {
        await testFunction()
        const endTime = performance.now()
        times.push(endTime - startTime)
        process.stdout.write('.')
      } catch (error) {
        console.error(`\n❌ Benchmark ${name} failed on run ${i + 1}:`, error.message)
        times.push(null)
        process.stdout.write('x')
      }
    }

    const validTimes = times.filter(t => t !== null)
    const avgTime = validTimes.reduce((a, b) => a + b, 0) / validTimes.length
    const minTime = Math.min(...validTimes)
    const maxTime = Math.max(...validTimes)
    const p95Time = this.calculatePercentile(validTimes, 95)

    const result = {
      name,
      description,
      runs: validTimes.length,
      totalRuns: runs,
      averageTime: Math.round(avgTime * 100) / 100,
      minTime: Math.round(minTime * 100) / 100,
      maxTime: Math.round(maxTime * 100) / 100,
      p95Time: Math.round(p95Time * 100) / 100,
      throughput:
        Math.round((validTimes.length / (validTimes.reduce((a, b) => a + b, 0) / 1000)) * 100) /
        100,
      successRate: Math.round((validTimes.length / runs) * 10000) / 100,
      timestamp: new Date().toISOString()
    }

    this.results.benchmarks.push(result)

    console.log(`\n✅ Completed: ${result.averageTime}ms avg, ${result.throughput} ops/sec`)
    return result
  }

  /**
   * Calculate percentile from array
   */
  calculatePercentile(arr, percentile) {
    const sorted = arr.sort((a, b) => a - b)
    const index = (percentile / 100) * (sorted.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index % 1

    if (upper >= sorted.length) {
      return sorted[sorted.length - 1]
    }
    return sorted[lower] * (1 - weight) + sorted[upper] * weight
  }

  /**
   * Run concurrent load test
   */
  async runConcurrentTest(name, description, testFunction, userCount = CONFIG.concurrentUsers) {
    console.log(`\n🚀 Running concurrent test: ${name} (${userCount} users)`)
    console.log(`📝 ${description}`)

    const promises = []
    const startTime = performance.now()

    for (let i = 0; i < userCount; i++) {
      promises.push(this.runUserSimulation(testFunction, i))
    }

    const results = await Promise.all(promises)
    const endTime = performance.now()
    const totalTime = endTime - startTime

    const successfulRequests = results.filter(r => r.success).length
    const totalRequests = results.length
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length

    const result = {
      name: `${name}_concurrent`,
      description: `${description} (${userCount} concurrent users)`,
      concurrentUsers: userCount,
      totalRequests,
      successfulRequests,
      failedRequests: totalRequests - successfulRequests,
      totalTime: Math.round(totalTime * 100) / 100,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      requestsPerSecond: Math.round((totalRequests / (totalTime / 1000)) * 100) / 100,
      successRate: Math.round((successfulRequests / totalRequests) * 10000) / 100,
      timestamp: new Date().toISOString()
    }

    this.results.benchmarks.push(result)

    console.log(
      `\n✅ Concurrent test completed: ${result.requestsPerSecond} req/sec, ${result.successRate}% success`
    )
    return result
  }

  /**
   * Simulate user behavior
   */
  async runUserSimulation(testFunction, userId) {
    const startTime = performance.now()
    let success = false

    try {
      await testFunction(userId)
      success = true
    } catch {
      success = false
    }

    const responseTime = performance.now() - startTime

    return { success, responseTime, userId }
  }

  /**
   * Save results to file
   */
  saveResults() {
    try {
      fs.writeFileSync(CONFIG.outputFile, JSON.stringify(this.results, null, 2))
      console.log(`\n💾 Results saved to: ${CONFIG.outputFile}`)
    } catch (error) {
      console.error('❌ Failed to save results:', error.message)
    }
  }

  /**
   * Print summary
   */
  printSummary() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 PERFORMANCE BENCHMARK SUMMARY')
    console.log('='.repeat(60))

    this.results.benchmarks.forEach(benchmark => {
      console.log(`\n🔹 ${benchmark.name}`)
      if (benchmark.concurrentUsers) {
        console.log(`   Concurrent: ${benchmark.concurrentUsers} users`)
        console.log(`   Throughput: ${benchmark.requestsPerSecond} req/sec`)
        console.log(`   Success Rate: ${benchmark.successRate}%`)
        console.log(`   Avg Response: ${benchmark.averageResponseTime}ms`)
      } else {
        console.log(`   Average: ${benchmark.averageTime}ms`)
        console.log(`   P95: ${benchmark.p95Time}ms`)
        console.log(`   Throughput: ${benchmark.throughput} ops/sec`)
        console.log(`   Success Rate: ${benchmark.successRate}%`)
      }
    })

    console.log('\n' + '='.repeat(60))
  }
}

/**
 * Benchmark test functions
 */

// Database query benchmarks
async function benchmarkFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price_usd, price_ves, stock, sku')
    .eq('active', true)
    .eq('featured', true)
    .order('carousel_order', { ascending: true, nullsFirst: false })
    .limit(10)

  if (error) {
    throw error
  }
  return data
}

async function benchmarkPriceRangeQuery() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price_usd, stock')
    .eq('active', true)
    .gte('price_usd', 10)
    .lte('price_usd', 100)
    .order('price_usd', { ascending: true })
    .limit(20)

  if (error) {
    throw error
  }
  return data
}

async function benchmarkProductSearch() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, summary, price_usd')
    .eq('active', true)
    .ilike('name', '%flor%')
    .limit(15)

  if (error) {
    throw error
  }
  return data
}

async function benchmarkProductWithImages() {
  const productId = '00000000-0000-0000-0000-000000000001' // Use a test ID
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      id, name, price_usd, stock,
      product_images(id, url, size, image_index)
    `
    )
    .eq('id', productId)
    .eq('active', true)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }
  return data
}

// Stored function benchmarks
async function benchmarkDecrementStock() {
  // Use RPC call for stored function
  const { data, error } = await supabase.rpc('decrement_product_stock', {
    p_product_id: '00000000-0000-0000-0000-000000000001',
    p_quantity: 1
  })

  if (error) {
    throw error
  }
  return data
}

async function benchmarkCachedFeaturedProducts() {
  // Use RPC call for cached query
  const { data, error } = await supabase.rpc('get_cached_featured_products', {
    p_limit: 10
  })

  if (error) {
    throw error
  }
  return data
}

// Complex query benchmarks
async function benchmarkComplexProductQuery() {
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      id, name, price_usd, stock, featured,
      product_occasions(
        occasions(id, name, slug)
      )
    `
    )
    .eq('active', true)
    .eq('featured', true)
    .limit(5)

  if (error) {
    throw error
  }
  return data
}

/**
 * Main benchmark execution
 */
async function runBenchmarks() {
  console.log('🚀 Starting FloresYa Database Performance Benchmarks')
  console.log('='.repeat(60))

  const benchmark = new PerformanceBenchmark()

  try {
    // Individual query benchmarks
    await benchmark.runBenchmark(
      'featured_products_query',
      'Query featured products with ordering',
      benchmarkFeaturedProducts
    )

    await benchmark.runBenchmark(
      'price_range_query',
      'Query products within price range',
      benchmarkPriceRangeQuery
    )

    await benchmark.runBenchmark(
      'product_search_query',
      'Search products by name pattern',
      benchmarkProductSearch
    )

    await benchmark.runBenchmark(
      'product_with_images_query',
      'Query product with related images',
      benchmarkProductWithImages
    )

    // Stored function benchmarks
    await benchmark.runBenchmark(
      'decrement_stock_function',
      'Atomic stock decrement operation',
      benchmarkDecrementStock
    )

    await benchmark.runBenchmark(
      'cached_featured_products',
      'Cached featured products query',
      benchmarkCachedFeaturedProducts
    )

    // Complex query benchmarks
    await benchmark.runBenchmark(
      'complex_product_join',
      'Complex query with product-occasion joins',
      benchmarkComplexProductQuery
    )

    // Concurrent load tests
    await benchmark.runConcurrentTest(
      'featured_products_load',
      'Concurrent featured products queries',
      () => benchmarkFeaturedProducts(),
      10
    )

    await benchmark.runConcurrentTest(
      'mixed_queries_load',
      'Mixed concurrent database operations',
      async userId => {
        // Simulate different user behaviors
        const operations = [
          benchmarkFeaturedProducts,
          benchmarkPriceRangeQuery,
          benchmarkProductSearch,
          benchmarkProductWithImages
        ]
        const randomOp = operations[userId % operations.length]
        await randomOp()
      },
      15
    )

    // Save and display results
    benchmark.saveResults()
    benchmark.printSummary()

    console.log('\n🎉 All benchmarks completed successfully!')
    console.log('📈 Check benchmark-results.json for detailed results')
  } catch (error) {
    console.error('❌ Benchmark suite failed:', error)
    process.exit(1)
  }
}

// Run benchmarks if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Check environment variables
  if (!CONFIG.supabaseUrl || !CONFIG.supabaseKey) {
    console.error('❌ Missing required environment variables:')
    console.error('   SUPABASE_URL')
    console.error('   SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  runBenchmarks()
}

export { PerformanceBenchmark, runBenchmarks }
