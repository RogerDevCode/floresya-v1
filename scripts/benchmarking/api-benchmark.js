/**
 * API Endpoint Performance Benchmarks
 * Tests key API endpoints for response times, throughput, and error rates
 */

import http from 'http'
import https from 'https'
import { performance } from 'perf_hooks'

class ApiBenchmark {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl
    this.agent = baseUrl.startsWith('https') ? https.globalAgent : http.globalAgent
  }

  async run(options = {}) {
    const { iterations = 100, concurrency = 10, timeout = 30000 } = options

    console.log(
      `🔗 Running API benchmarks: ${iterations} iterations, ${concurrency} concurrent requests`
    )

    const endpoints = [
      { path: '/health', method: 'GET', name: 'Health Check' },
      { path: '/api/products', method: 'GET', name: 'Get Products' },
      { path: '/api/users/profile', method: 'GET', name: 'Get User Profile', auth: true },
      { path: '/api/orders', method: 'GET', name: 'Get Orders', auth: true },
      { path: '/api/occasions', method: 'GET', name: 'Get Occasions' }
    ]

    const results = {
      endpoints: {},
      summary: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        throughput: 0,
        errorRate: 0
      }
    }

    // Test each endpoint
    for (const endpoint of endpoints) {
      console.log(`   Testing ${endpoint.name}...`)
      const endpointResult = await this.benchmarkEndpoint(
        endpoint,
        iterations,
        concurrency,
        timeout
      )
      results.endpoints[endpoint.name] = endpointResult
      results.summary.totalRequests += endpointResult.requests
      results.summary.successfulRequests += endpointResult.successful
      results.summary.failedRequests += endpointResult.failed
    }

    // Calculate summary metrics
    const allResponseTimes = Object.values(results.endpoints).flatMap(
      endpoint => endpoint.responseTimes
    )

    results.summary.averageResponseTime =
      allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length
    results.summary.p95ResponseTime = this.calculatePercentile(allResponseTimes, 95)
    results.summary.throughput = results.summary.totalRequests / (performance.now() / 1000) // requests per second
    results.summary.errorRate = results.summary.failedRequests / results.summary.totalRequests

    // Add operations count for summary
    results.operations = results.summary.totalRequests
    results.averageResponseTime = results.summary.averageResponseTime
    results.throughput = results.summary.throughput
    results.errorRate = results.summary.errorRate
    results.p95ResponseTime = results.summary.p95ResponseTime

    console.log(
      `   ✅ API benchmarks completed: ${results.summary.successfulRequests}/${results.summary.totalRequests} successful`
    )

    return results
  }

  async benchmarkEndpoint(endpoint, iterations, concurrency, timeout) {
    const responseTimes = []
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
        promises.push(this.makeRequest(endpoint, timeout))
      }

      const batchResults = await Promise.allSettled(promises)

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          const { responseTime, statusCode, error } = result.value

          if (error) {
            errors.push(error)
            failed++
          } else if (statusCode >= 200 && statusCode < 400) {
            responseTimes.push(responseTime)
            successful++
          } else {
            failed++
          }
        } else {
          errors.push(result.reason)
          failed++
        }
      }
    }

    return {
      requests: iterations,
      successful,
      failed,
      responseTimes,
      errors,
      averageResponseTime:
        responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          : 0,
      p95ResponseTime: this.calculatePercentile(responseTimes, 95),
      throughput: iterations / (performance.now() / 1000)
    }
  }

  async makeRequest(endpoint, timeout) {
    return new Promise(resolve => {
      const startTime = performance.now()
      const url = new URL(endpoint.path, this.baseUrl)

      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: endpoint.method,
        agent: this.agent,
        timeout,
        headers: {
          'User-Agent': 'Performance-Benchmark/1.0',
          Accept: 'application/json'
        }
      }

      // Add authorization header if needed
      if (endpoint.auth) {
        // Use a test token - in real scenarios, this would be obtained from auth service
        options.headers['Authorization'] = 'Bearer test-token'
      }

      const req = (url.protocol === 'https:' ? https : http).request(options, res => {
        let data = ''

        res.on('data', chunk => {
          data += chunk
        })

        res.on('end', () => {
          const responseTime = performance.now() - startTime
          resolve({
            responseTime,
            statusCode: res.statusCode,
            data: data.length,
            error: null
          })
        })
      })

      req.on('error', error => {
        const responseTime = performance.now() - startTime
        resolve({
          responseTime,
          statusCode: null,
          error: error.message
        })
      })

      req.on('timeout', () => {
        req.destroy()
        const responseTime = performance.now() - startTime
        resolve({
          responseTime,
          statusCode: null,
          error: 'Request timeout'
        })
      })

      req.end()
    })
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
}

const apiBenchmark = new ApiBenchmark()

export { ApiBenchmark, apiBenchmark }
