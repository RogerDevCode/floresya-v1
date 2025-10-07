/**
 * System Stress Test
 * Monitors system behavior under extreme load
 * Tracks memory usage, response times, and failure patterns
 */

import { performance } from 'perf_hooks'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
import http from 'http'

const STRESS_CONFIG = {
  duration: 300000, // 5 minutes
  maxConcurrent: 500,
  requestsPerSecond: 100,
  endpoints: [
    { path: '/health', method: 'GET', weight: 20 },
    { path: '/api/orders', method: 'GET', weight: 30 },
    { path: '/api/orders', method: 'POST', weight: 50 }
  ]
}

class SystemStressTester {
  constructor(config = STRESS_CONFIG) {
    this.config = config
    this.startTime = null
    this.endTime = null
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      memoryUsage: [],
      activeConnections: 0,
      errors: []
    }

    this.endpoints = this.prepareEndpoints()
  }

  prepareEndpoints() {
    const totalWeight = this.config.endpoints.reduce((sum, ep) => sum + ep.weight, 0)
    return this.config.endpoints.map(ep => ({
      ...ep,
      probability: ep.weight / totalWeight
    }))
  }

  selectRandomEndpoint() {
    const random = Math.random()
    let cumulativeProbability = 0

    for (const endpoint of this.endpoints) {
      cumulativeProbability += endpoint.probability
      if (random <= cumulativeProbability) {
        return endpoint
      }
    }

    return this.endpoints[0]
  }

  generateOrderData() {
    const orderId = Math.floor(Math.random() * 1000000)
    return {
      order: {
        customer_email: `stress${orderId}@test.com`,
        customer_name: `Stress User ${orderId}`,
        customer_phone: `0414${Math.floor(Math.random() * 9000000) + 1000000}`,
        delivery_address: `Caracas, Avenida ${Math.floor(Math.random() * 20) + 1}`,
        delivery_city: 'Caracas',
        total_amount_usd: Math.floor(Math.random() * 500) + 25,
        total_amount_ves: (Math.floor(Math.random() * 500) + 25) * 36,
        currency_rate: 36.0
      },
      items: [
        {
          product_id: Math.floor(Math.random() * 50) + 1,
          product_name: `Stress Product ${Math.floor(Math.random() * 100)}`,
          quantity: Math.floor(Math.random() * 5) + 1,
          unit_price_usd: Math.floor(Math.random() * 100) + 10,
          subtotal_usd: Math.floor(Math.random() * 500) + 25
        }
      ]
    }
  }

  async makeRequest() {
    return new Promise(resolve => {
      const endpoint = this.selectRandomEndpoint()
      const startTime = performance.now()

      const options = {
        hostname: 'localhost',
        port: 3000,
        path: endpoint.path,
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }

      const req = http.request(options, res => {
        let data = ''
        res.on('data', chunk => (data += chunk))
        res.on('end', () => {
          const responseTime = performance.now() - startTime
          this.metrics.totalRequests++
          this.metrics.responseTimes.push(responseTime)

          if (res.statusCode >= 200 && res.statusCode < 400) {
            this.metrics.successfulRequests++
          } else {
            this.metrics.failedRequests++
            this.metrics.errors.push({
              statusCode: res.statusCode,
              responseTime,
              endpoint: endpoint.path,
              timestamp: new Date().toISOString()
            })
          }

          resolve({ statusCode: res.statusCode, responseTime })
        })
      })

      req.on('error', error => {
        const responseTime = performance.now() - startTime
        this.metrics.totalRequests++
        this.metrics.failedRequests++
        this.metrics.errors.push({
          error: error.message,
          responseTime,
          endpoint: endpoint.path,
          timestamp: new Date().toISOString()
        })
        resolve({ error: error.message, responseTime })
      })

      req.on('timeout', () => {
        const responseTime = performance.now() - startTime
        this.metrics.totalRequests++
        this.metrics.failedRequests++
        this.metrics.errors.push({
          error: 'Request timeout',
          responseTime,
          endpoint: endpoint.path,
          timestamp: new Date().toISOString()
        })
        req.destroy()
        resolve({ error: 'timeout', responseTime })
      })

      // Send request body for POST requests
      if (endpoint.method === 'POST') {
        const orderData = JSON.stringify(this.generateOrderData())
        req.setHeader('Content-Length', Buffer.byteLength(orderData))
        req.write(orderData)
      }

      req.end()
    })
  }

  collectSystemMetrics() {
    const memUsage = process.memoryUsage()
    this.metrics.memoryUsage.push({
      timestamp: new Date().toISOString(),
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024) // MB
    })
  }

  calculatePercentiles(values, percentiles) {
    const sorted = [...values].sort((a, b) => a - b)
    const results = {}

    for (const p of percentiles) {
      const index = Math.ceil((p / 100) * sorted.length) - 1
      results[p] = sorted[Math.max(0, index)]
    }

    return results
  }

  generateReport() {
    const duration = this.endTime - this.startTime
    const avgResponseTime =
      this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length
    const percentiles = this.calculatePercentiles(this.metrics.responseTimes, [50, 95, 99])
    const successRate = (this.metrics.successfulRequests / this.metrics.totalRequests) * 100

    const finalMemoryUsage = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1]
    const initialMemoryUsage = this.metrics.memoryUsage[0]
    const memoryIncrease =
      finalMemoryUsage && initialMemoryUsage
        ? finalMemoryUsage.heapUsed - initialMemoryUsage.heapUsed
        : 0

    return {
      summary: {
        duration: `${Math.round(duration / 1000)}s`,
        totalRequests: this.metrics.totalRequests,
        successfulRequests: this.metrics.successfulRequests,
        failedRequests: this.metrics.failedRequests,
        successRate: `${successRate.toFixed(2)}%`,
        averageResponseTime: `${Math.round(avgResponseTime)}ms`,
        memoryIncrease: `${memoryIncrease}MB`
      },
      responseTimes: {
        average: `${Math.round(avgResponseTime)}ms`,
        min: `${Math.round(Math.min(...this.metrics.responseTimes))}ms`,
        max: `${Math.round(Math.max(...this.metrics.responseTimes))}ms`,
        percentiles: {
          p50: `${Math.round(percentiles[50])}ms`,
          p95: `${Math.round(percentiles[95])}ms`,
          p99: `${Math.round(percentiles[99])}ms`
        }
      },
      memory: {
        final: finalMemoryUsage,
        initial: initialMemoryUsage,
        increase: `${memoryIncrease}MB`
      },
      errors: {
        total: this.metrics.errors.length,
        byType: this.metrics.errors.reduce((acc, error) => {
          const type = error.statusCode || error.error || 'unknown'
          acc[type] = (acc[type] || 0) + 1
          return acc
        }, {}),
        recent: this.metrics.errors.slice(-10) // Last 10 errors
      },
      recommendations: this.generateRecommendations(successRate, avgResponseTime, memoryIncrease)
    }
  }

  generateRecommendations(successRate, avgResponseTime, memoryIncrease) {
    const recommendations = []

    if (successRate < 95) {
      recommendations.push(
        '⚠️  Low success rate detected. Consider optimizing error handling and resource allocation.'
      )
    }

    if (avgResponseTime > 1000) {
      recommendations.push(
        '⚠️  High average response time. Consider database optimization and caching strategies.'
      )
    }

    if (memoryIncrease > 100) {
      recommendations.push('⚠️  Significant memory increase detected. Review for memory leaks.')
    }

    if (this.metrics.errors.some(e => e.statusCode === 503)) {
      recommendations.push(
        '🔧 Circuit breaker activated. Monitor database health and connection pooling.'
      )
    }

    if (this.metrics.errors.some(e => e.statusCode === 429)) {
      recommendations.push(
        '🔧 Rate limiting activated. Consider optimizing concurrent request handling.'
      )
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ System performed well under stress. No immediate issues detected.')
    }

    return recommendations
  }

  async run() {
    console.log('🚀 Starting System Stress Test...')
    console.log(`Duration: ${this.config.duration / 1000}s`)
    console.log(`Max concurrent: ${this.config.maxConcurrent}`)
    console.log(`Target RPS: ${this.config.requestsPerSecond}`)

    this.startTime = performance.now()

    // Start system metrics collection
    const metricsInterval = setInterval(() => {
      this.collectSystemMetrics()
    }, 1000)

    // Run stress test
    const promises = []
    const endTime = Date.now() + this.config.duration

    while (Date.now() < endTime) {
      if (promises.length < this.config.maxConcurrent) {
        promises.push(this.makeRequest())
      }

      // Clean up completed promises
      if (promises.length >= this.config.maxConcurrent) {
        await Promise.all(promises.splice(0, this.config.maxConcurrent))
      }

      // Small delay to prevent overwhelming the event loop
      await new Promise(resolve => setImmediate(resolve))
    }

    // Wait for remaining requests to complete
    await Promise.all(promises)
    clearInterval(metricsInterval)

    this.endTime = performance.now()

    const report = this.generateReport()

    console.log('\n📊 Stress Test Results:')
    console.log(JSON.stringify(report, null, 2))

    return report
  }
}

// CLI runner
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new SystemStressTester()
  tester.run().catch(console.error)
}

export { SystemStressTester, STRESS_CONFIG }
