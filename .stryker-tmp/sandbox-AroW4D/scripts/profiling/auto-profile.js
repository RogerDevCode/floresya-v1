#!/usr/bin/env node
// @ts-nocheck

/**
 * Automated Profiling Script
 * Runs Clinic.js profiling based on system health metrics
 * Ensures profiling overhead stays within CLAUDE.md limits
 */

import { clinicProfiler } from '../../api/monitoring/clinicIntegration.js'
import { metricsCollector } from '../../api/monitoring/metricsCollector.js'
import { logger } from '../../api/utils/logger.js'

async function runAutomatedProfiling() {
  console.log('🔍 Starting automated profiling analysis...')

  try {
    // Get current system metrics
    const metrics = metricsCollector.getRealtimeMetrics()
    const healthScore = metricsCollector.calculateHealthScore()

    console.log(`📊 Current Health Score: ${healthScore}/100`)
    console.log(`🖥️  CPU Usage: ${metrics.cpu.usage}%`)
    console.log(`💾 Memory Usage: ${metrics.memoryUsage.heapUsed} MB`)
    console.log(`⚡ Response Time: ${metrics.performance.averageResponseTime}ms`)
    console.log(`📈 Error Rate: ${metrics.performance.errorRate}%`)

    // Determine if profiling is needed
    if (healthScore >= 80) {
      console.log('✅ System health is excellent. Profiling not necessary.')
      return
    }

    if (!metrics.cpu.isOverheadAcceptable) {
      console.log(
        '⚠️  CPU overhead too high for profiling. Current overhead:',
        metrics.cpu.monitoringOverhead + '%'
      )
      return
    }

    console.log('🔬 Running automated profiling...')

    const result = await clinicProfiler.runAutomatedProfiling()

    if (result.success) {
      console.log('✅ Automated profiling completed successfully')
      console.log(
        '📁 Report generated:',
        result.stopResult?.reportPath || 'Check clinic-reports directory'
      )
    } else {
      console.log('❌ Automated profiling failed:', result.message)
    }
  } catch (error) {
    console.error('💥 Error during automated profiling:', error.message)
    logger.error('Automated profiling error', error)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAutomatedProfiling()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { runAutomatedProfiling }
