/**
 * Procesado por B
 */

/**
 * Clinic.js Integration for Runtime Profiling
 * Provides automated profiling capabilities with CPU and memory monitoring
 * Ensures profiling overhead stays within CLAUDE.md limits (≤50% CPU)
 */

import { logger } from '../utils/logger.js'
import { metricsCollector } from './metricsCollector.js'

// In test environment, provide mock profiler
const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.VITEST

class ClinicProfiler {
  constructor() {
    this.isProfiling = false
    this.profilingSession = null
    this.profilingStartTime = null
    this.maxProfilingDuration = 300000 // 5 minutes max
    this.cpuOverheadThreshold = 50 // Max 50% CPU overhead
  }

  /**
   * Start Clinic.js profiling session
   * Automatically selects appropriate profiler based on current metrics
   */
  async startProfiling(options = {}) {
    if (this.isProfiling) {
      logger.warn('Profiling already in progress')
      return { success: false, message: 'Profiling already running' }
    }

    // Check CPU overhead before starting
    const currentMetrics = metricsCollector.getRealtimeMetrics()
    if (!currentMetrics.cpu.isOverheadAcceptable) {
      logger.warn('Cannot start profiling: CPU overhead too high', {
        currentOverhead: currentMetrics.cpu.monitoringOverhead
      })
      return {
        success: false,
        message: 'CPU overhead too high for profiling',
        currentOverhead: currentMetrics.cpu.monitoringOverhead
      }
    }

    try {
      // Skip profiling in test environment
      if (isTestEnvironment) {
        return {
          success: false,
          message: 'Profiling disabled in test environment'
        }
      }

      // Dynamically import clinic modules to avoid loading them unnecessarily
      // Use eval to prevent static analysis in test environments
      let Clinic
      try {
        const clinicModule = await eval(`import('clinic')`)
        Clinic = clinicModule.default
      } catch (importError) {
        logger.warn('Clinic.js not available, profiling disabled', { error: importError.message })
        return {
          success: false,
          message: 'Clinic.js not available'
        }
      }

      this.isProfiling = true
      this.profilingStartTime = Date.now()

      // Determine which profiler to use based on current system state
      const profilerType = this.selectProfilerType(currentMetrics)

      logger.info(`Starting Clinic.js profiling with ${profilerType}`, {
        options,
        systemState: currentMetrics
      })

      // Create profiling session
      this.profilingSession = Clinic(profilerType, {
        ...options,
        // Limit profiling duration to prevent excessive overhead
        timeout: Math.min(options.timeout || this.maxProfilingDuration, this.maxProfilingDuration),
        // Configure output directory
        outputDir: options.outputDir || './clinic-reports',
        // Ensure we don't exceed CPU limits
        sampleInterval: options.sampleInterval || 10 // 10ms sampling
      })

      return {
        success: true,
        message: `Profiling started with ${profilerType}`,
        profilerType,
        startTime: new Date(this.profilingStartTime).toISOString()
      }
    } catch (error) {
      this.isProfiling = false
      logger.error('Failed to start Clinic.js profiling', error)
      return {
        success: false,
        message: 'Failed to start profiling',
        error: error.message
      }
    }
  }

  /**
   * Stop current profiling session
   */
  async stopProfiling() {
    if (!this.isProfiling || !this.profilingSession) {
      return { success: false, message: 'No profiling session active' }
    }

    try {
      const duration = Date.now() - this.profilingStartTime

      // Stop the profiling session
      await new Promise((resolve, reject) => {
        this.profilingSession.on('stop', () => resolve())
        this.profilingSession.on('error', reject)

        // Force stop after timeout
        setTimeout(() => {
          this.profilingSession.destroy()
          resolve()
        }, 10000) // 10 second timeout
      })

      this.isProfiling = false
      const session = this.profilingSession
      this.profilingSession = null

      logger.info('Clinic.js profiling stopped', {
        duration,
        reportPath: session.outputPath
      })

      return {
        success: true,
        message: 'Profiling stopped successfully',
        duration,
        reportPath: session.outputPath,
        endTime: new Date().toISOString()
      }
    } catch (error) {
      this.isProfiling = false
      this.profilingSession = null
      logger.error('Failed to stop profiling', error)
      return {
        success: false,
        message: 'Failed to stop profiling',
        error: error.message
      }
    }
  }

  /**
   * Get profiling status
   */
  getProfilingStatus() {
    const currentMetrics = metricsCollector.getRealtimeMetrics()

    return {
      isActive: this.isProfiling,
      startTime: this.profilingStartTime ? new Date(this.profilingStartTime).toISOString() : null,
      duration: this.profilingStartTime ? Date.now() - this.profilingStartTime : 0,
      canStart: currentMetrics.cpu.isOverheadAcceptable,
      currentCpuOverhead: currentMetrics.cpu.monitoringOverhead,
      maxAllowedOverhead: this.cpuOverheadThreshold
    }
  }

  /**
   * Select appropriate profiler based on system metrics
   */
  selectProfilerType(metrics) {
    const { memoryUsage, performance } = metrics

    // High memory usage -> use heap profiler
    if (memoryUsage.heapUsed > 200) {
      // 200MB
      return 'heap-profiler'
    }

    // High error rate -> use bubbleprof for async issues
    if (performance.errorRate > 5) {
      return 'bubbleprof'
    }

    // High response times -> use flame graph for CPU bottlenecks
    if (performance.averageResponseTime > 1000) {
      return 'flame'
    }

    // Default to doctor for general diagnosis
    return 'doctor'
  }

  /**
   * Run automated profiling based on health score
   */
  async runAutomatedProfiling() {
    const healthScore = metricsCollector.calculateHealthScore()

    // Only run profiling if health score is poor (< 70)
    if (healthScore >= 70) {
      return {
        success: false,
        message: 'System health is good, profiling not needed',
        healthScore
      }
    }

    logger.info('Running automated profiling due to poor health score', { healthScore })

    const result = await this.startProfiling({
      timeout: 60000, // 1 minute for automated profiling
      automated: true
    })

    if (result.success) {
      // Wait for profiling to complete
      await new Promise(resolve => setTimeout(resolve, 65000))

      const stopResult = await this.stopProfiling()

      return {
        ...result,
        stopResult,
        triggeredBy: 'automated',
        healthScore
      }
    }

    return result
  }
}

// Create singleton instance
const clinicProfiler = new ClinicProfiler()

/**
 * Profiling middleware for conditional profiling
 */
function profilingMiddleware(req, res, next) {
  // Skip profiling in test environment
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
    return next()
  }

  // Only profile if system health is poor and no profiling is active
  const healthScore = metricsCollector.calculateHealthScore()
  const profilingStatus = clinicProfiler.getProfilingStatus()

  if (healthScore < 60 && !profilingStatus.isActive && profilingStatus.canStart) {
    // Start background profiling for poor health
    clinicProfiler.runAutomatedProfiling().catch(error => {
      logger.error('Automated profiling failed', error)
    })
  }

  next()
}

export { clinicProfiler, profilingMiddleware, ClinicProfiler }
