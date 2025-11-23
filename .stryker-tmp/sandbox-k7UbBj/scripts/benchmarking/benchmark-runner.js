#!/usr/bin/env node
// @ts-nocheck

/**
 * Performance Benchmark Runner
 * Executes comprehensive performance benchmarks for API endpoints, database queries, and caching
 * Generates detailed reports and integrates with CI/CD for regression detection
 */

import { performance } from 'perf_hooks'
import { promises as fs } from 'fs'
import path from 'path'
import { logger } from '../../api/utils/logger.js'
import { apiBenchmark } from './api-benchmark.js'
import { databaseBenchmark } from './database-benchmark.js'
import { generateBenchmarkReport } from './benchmark-report.js'
import { performanceAlerts } from './performance-alerts.js'

class BenchmarkRunner {
  constructor(options = {}) {
    this.options = {
      iterations: options.iterations || 100,
      concurrency: options.concurrency || 10,
      warmupIterations: options.warmupIterations || 10,
      outputDir: options.outputDir || './benchmark-results',
      baselineFile: options.baselineFile || './benchmark-baseline.json',
      regressionThreshold: options.regressionThreshold || 0.1, // 10% degradation threshold
      ...options
    }

    this.results = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cpus: require('os').cpus().length
      },
      benchmarks: {},
      summary: {}
    }
  }

  async runAllBenchmarks() {
    console.log('🚀 Starting comprehensive performance benchmarks...')
    console.log(
      `📊 Configuration: ${this.options.iterations} iterations, ${this.options.concurrency} concurrency`
    )

    try {
      // Ensure output directory exists
      await fs.mkdir(this.options.outputDir, { recursive: true })

      // Run API benchmarks
      console.log('\n🔗 Running API endpoint benchmarks...')
      this.results.benchmarks.api = await this.runBenchmarkWithWarmup(
        () => apiBenchmark.run(this.options),
        'API'
      )

      // Run database benchmarks
      console.log('\n🗄️  Running database query benchmarks...')
      this.results.benchmarks.database = await this.runBenchmarkWithWarmup(
        () => databaseBenchmark.run(this.options),
        'Database'
      )

      // Generate summary and check for regressions
      this.results.summary = await this.generateSummary()

      // Save results
      const resultFile = path.join(this.options.outputDir, `benchmark-${Date.now()}.json`)
      await fs.writeFile(resultFile, JSON.stringify(this.results, null, 2))

      // Generate HTML report
      const htmlReport = await generateBenchmarkReport(this.results)
      const htmlFile = path.join(this.options.outputDir, `benchmark-report-${Date.now()}.html`)
      await fs.writeFile(htmlFile, htmlReport)

      console.log('\n✅ Benchmark suite completed successfully')
      console.log(`📁 Results saved to: ${resultFile}`)
      console.log(`📊 HTML report: ${htmlFile}`)

      // Check for regressions
      const regressionCheck = await this.checkForRegressions()
      if (regressionCheck.hasRegressions) {
        console.log('\n⚠️  PERFORMANCE REGRESSIONS DETECTED!')
        regressionCheck.regressions.forEach(regression => {
          console.log(
            `   ❌ ${regression.benchmark}: ${regression.metric} degraded by ${regression.degradation.toFixed(1)}%`
          )
        })

        // Send alerts for regressions
        try {
          await performanceAlerts.sendRegressionAlerts(regressionCheck.regressions, this.results, {
            environment: process.env.NODE_ENV || 'development',
            runId: process.env.GITHUB_RUN_ID,
            commit: process.env.GITHUB_SHA,
            reportUrl: `benchmark-results/benchmark-report-${Date.now()}.html`
          })
        } catch (alertError) {
          console.error('Failed to send regression alerts:', alertError.message)
          // Error is used in console.error
        }

        return { success: false, regressions: regressionCheck.regressions, results: this.results }
      }

      return { success: true, results: this.results }
    } catch (error) {
      console.error('💥 Benchmark suite failed:', error.message)
      logger.error('Benchmark runner error', error)
      return { success: false, error: error.message }
    }
  }

  async runBenchmarkWithWarmup(benchmarkFn, name) {
    console.log(`🔥 Warming up ${name} benchmark...`)

    // Warmup phase
    for (let i = 0; i < this.options.warmupIterations; i++) {
      try {
        await benchmarkFn()
      } catch (error) {
        console.log(`   Warmup iteration ${i + 1} failed (expected): ${error.message}`)
      }
    }

    console.log(`   ✅ Warmup completed`)

    // Actual benchmark
    const startTime = performance.now()
    const result = await benchmarkFn()
    const totalTime = performance.now() - startTime

    return {
      ...result,
      totalExecutionTime: totalTime,
      timestamp: new Date().toISOString()
    }
  }

  async generateSummary() {
    const summary = {
      totalBenchmarks: 0,
      totalOperations: 0,
      averageResponseTime: 0,
      throughput: 0,
      errorRate: 0,
      benchmarks: {}
    }

    let totalResponseTime = 0
    let totalOperations = 0

    for (const [category, results] of Object.entries(this.results.benchmarks)) {
      summary.benchmarks[category] = {
        operations: results.operations || 0,
        averageResponseTime: results.averageResponseTime || 0,
        throughput: results.throughput || 0,
        errorRate: results.errorRate || 0,
        p95ResponseTime: results.p95ResponseTime || 0
      }

      totalOperations += results.operations || 0
      totalResponseTime += (results.averageResponseTime || 0) * (results.operations || 1)
      summary.totalBenchmarks++
    }

    summary.totalOperations = totalOperations
    summary.averageResponseTime = totalOperations > 0 ? totalResponseTime / totalOperations : 0
    summary.throughput = totalOperations / (performance.now() / 1000) // ops per second

    return summary
  }

  async checkForRegressions() {
    const regressions = []
    let hasRegressions = false

    try {
      // Load baseline if exists
      const baselinePath = this.options.baselineFile
      let baseline = null

      try {
        const baselineData = await fs.readFile(baselinePath, 'utf8')
        baseline = JSON.parse(baselineData)
      } catch {
        console.log('📝 No baseline file found, creating new baseline')
        await fs.writeFile(baselinePath, JSON.stringify(this.results, null, 2))
        return { hasRegressions: false, regressions: [] }
      }

      // Compare with baseline
      for (const [category, currentResults] of Object.entries(this.results.benchmarks)) {
        if (!baseline.benchmarks[category]) {
          continue
        }

        const baselineResults = baseline.benchmarks[category]

        // Check response time regression
        if (currentResults.averageResponseTime && baselineResults.averageResponseTime) {
          const degradation =
            (currentResults.averageResponseTime - baselineResults.averageResponseTime) /
            baselineResults.averageResponseTime

          if (degradation > this.options.regressionThreshold) {
            regressions.push({
              benchmark: category,
              metric: 'averageResponseTime',
              baseline: baselineResults.averageResponseTime,
              current: currentResults.averageResponseTime,
              degradation: degradation * 100
            })
            hasRegressions = true
          }
        }

        // Check throughput regression
        if (currentResults.throughput && baselineResults.throughput) {
          const throughputChange =
            (baselineResults.throughput - currentResults.throughput) / baselineResults.throughput

          if (throughputChange > this.options.regressionThreshold) {
            regressions.push({
              benchmark: category,
              metric: 'throughput',
              baseline: baselineResults.throughput,
              current: currentResults.throughput,
              degradation: throughputChange * 100
            })
            hasRegressions = true
          }
        }

        // Check error rate increase
        if (currentResults.errorRate !== undefined && baselineResults.errorRate !== undefined) {
          const errorIncrease = currentResults.errorRate - baselineResults.errorRate

          if (errorIncrease > 0.05) {
            // 5% error rate increase
            regressions.push({
              benchmark: category,
              metric: 'errorRate',
              baseline: baselineResults.errorRate,
              current: currentResults.errorRate,
              degradation: errorIncrease * 100
            })
            hasRegressions = true
          }
        }
      }

      // Update baseline if no regressions
      if (!hasRegressions) {
        await fs.writeFile(baselinePath, JSON.stringify(this.results, null, 2))
        console.log('📈 Baseline updated with new results')
      }
    } catch (error) {
      console.error('Error checking for regressions:', error.message)
      // Error is used in console.error
    }

    return { hasRegressions, regressions }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const options = {}

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--iterations':
        options.iterations = parseInt(args[++i])
        break
      case '--concurrency':
        options.concurrency = parseInt(args[++i])
        break
      case '--output-dir':
        options.outputDir = args[++i]
        break
      case '--baseline-file':
        options.baselineFile = args[++i]
        break
      case '--regression-threshold':
        options.regressionThreshold = parseFloat(args[++i])
        break
    }
  }

  const runner = new BenchmarkRunner(options)
  const result = await runner.runAllBenchmarks()

  if (!result.success) {
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Benchmark runner failed:', error)
    process.exit(1)
  })
}

export { BenchmarkRunner }
