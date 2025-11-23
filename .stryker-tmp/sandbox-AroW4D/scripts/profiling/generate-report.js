#!/usr/bin/env node
// @ts-nocheck

/**
 * Profiling Report Generator
 * Generates comprehensive performance reports from Clinic.js data and metrics
 */

import { metricsCollector } from '../../api/monitoring/metricsCollector.js'
import { clinicProfiler } from '../../api/monitoring/clinicIntegration.js'
import { logger } from '../../api/utils/logger.js'
import { promises as fs } from 'fs'
import path from 'path'

async function generatePerformanceReport() {
  console.log('📊 Generating comprehensive performance report...')

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportDir = './performance-reports'
    const reportPath = path.join(reportDir, `performance-report-${timestamp}.json`)

    // Ensure report directory exists
    await fs.mkdir(reportDir, { recursive: true })

    // Gather all metrics
    const realtimeMetrics = metricsCollector.getRealtimeMetrics()
    const endpointMetrics = metricsCollector.getEndpointMetrics()
    const errorStats = metricsCollector.getErrorStats()
    const databaseMetrics = metricsCollector.getDatabaseMetrics()
    const healthScore = metricsCollector.calculateHealthScore()
    const profilingStatus = clinicProfiler.getProfilingStatus()

    // Generate recommendations based on metrics
    const recommendations = generateRecommendations(realtimeMetrics, healthScore)

    const report = {
      generatedAt: new Date().toISOString(),
      period: {
        start: new Date(Date.now() - realtimeMetrics.uptime).toISOString(),
        end: new Date().toISOString(),
        uptime: realtimeMetrics.uptime
      },
      system: {
        healthScore,
        status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical',
        monitoringOverheadAcceptable: realtimeMetrics.cpu.isOverheadAcceptable
      },
      performance: realtimeMetrics.performance,
      cpu: realtimeMetrics.cpu,
      memory: realtimeMetrics.memoryUsage,
      database: databaseMetrics,
      endpoints: endpointMetrics,
      errors: errorStats,
      business: realtimeMetrics.business,
      profiling: {
        status: profilingStatus,
        recommendations: recommendations.profiling
      },
      recommendations: recommendations.general,
      alerts: generateAlerts(realtimeMetrics, healthScore)
    }

    // Write report to file
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))

    console.log('✅ Performance report generated successfully')
    console.log(`📁 Report saved to: ${reportPath}`)
    console.log(`🏥 System Health Score: ${healthScore}/100`)
    console.log(
      `⚡ CPU Usage: ${realtimeMetrics.cpu.usage}% (Overhead: ${realtimeMetrics.cpu.monitoringOverhead}%)`
    )

    if (recommendations.general.length > 0) {
      console.log('\n💡 Recommendations:')
      recommendations.general.forEach(rec => console.log(`   • ${rec}`))
    }

    return {
      success: true,
      reportPath,
      healthScore,
      recommendations: recommendations.general.length
    }
  } catch (error) {
    console.error('💥 Error generating performance report:', error.message)
    logger.error('Performance report generation error', error)
    return {
      success: false,
      error: error.message
    }
  }
}

function generateRecommendations(metrics, healthScore) {
  const recommendations = {
    general: [],
    profiling: []
  }

  // CPU recommendations
  if (metrics.cpu.usage > 80) {
    recommendations.general.push(
      'High CPU usage detected. Consider optimizing compute-intensive operations.'
    )
  }

  if (!metrics.cpu.isOverheadAcceptable) {
    recommendations.general.push(
      'Monitoring overhead exceeds 50% CPU limit. Reduce monitoring frequency or optimize metrics collection.'
    )
  }

  // Memory recommendations
  if (metrics.memoryUsage.heapUsed > 500) {
    recommendations.general.push(
      'High memory usage detected. Consider implementing memory optimizations or increasing server resources.'
    )
    recommendations.profiling.push('Run memory profiling: npm run profile:memory')
  }

  // Performance recommendations
  if (metrics.performance.averageResponseTime > 1000) {
    recommendations.general.push(
      'High response times detected. Optimize database queries and application logic.'
    )
    recommendations.profiling.push('Run CPU profiling: npm run profile:cpu')
  }

  if (metrics.performance.errorRate > 5) {
    recommendations.general.push('High error rate detected. Review error logs and implement fixes.')
    recommendations.profiling.push('Run async profiling: npm run profile:async')
  }

  // Database recommendations
  if (metrics.database.slowQueriesCount > 0) {
    recommendations.general.push(
      `${metrics.database.slowQueriesCount} slow database queries detected. Review query optimization.`
    )
  }

  // Health score based recommendations
  if (healthScore < 60) {
    recommendations.general.push(
      'Critical health score. Immediate performance optimization required.'
    )
    recommendations.profiling.push('Run comprehensive profiling: npm run profile')
  } else if (healthScore < 80) {
    recommendations.general.push('Moderate performance issues detected. Consider optimization.')
    recommendations.profiling.push('Run automated profiling: npm run profile:auto')
  }

  return recommendations
}

function generateAlerts(metrics, healthScore) {
  const alerts = []

  if (healthScore < 50) {
    alerts.push({
      level: 'critical',
      message: 'System health critically low',
      metric: 'healthScore',
      value: healthScore,
      threshold: 50
    })
  }

  if (metrics.cpu.monitoringOverhead > 50) {
    alerts.push({
      level: 'warning',
      message: 'Monitoring overhead exceeds CLAUDE.md limits',
      metric: 'cpuMonitoringOverhead',
      value: metrics.cpu.monitoringOverhead,
      threshold: 50
    })
  }

  if (metrics.memoryUsage.heapUsed > 600) {
    alerts.push({
      level: 'warning',
      message: 'Memory usage critically high',
      metric: 'heapUsed',
      value: metrics.memoryUsage.heapUsed,
      threshold: 600
    })
  }

  if (metrics.performance.errorRate > 10) {
    alerts.push({
      level: 'error',
      message: 'Error rate critically high',
      metric: 'errorRate',
      value: metrics.performance.errorRate,
      threshold: 10
    })
  }

  return alerts
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generatePerformanceReport()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { generatePerformanceReport }
