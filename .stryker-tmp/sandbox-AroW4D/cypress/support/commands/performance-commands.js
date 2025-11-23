/**
 * Performance Monitoring Commands for Cypress Testing
 * Test-Driven Development Implementation
 * Following Google Web Vitals and Performance Best Practices
 */
// @ts-nocheck

Cypress.Commands.add('setupPerformanceMonitoring', () => {
  cy.testLog('Setting up performance monitoring...')

  return cy.window().then(win => {
    // Add performance marks for measurement
    win.performance.mark('test-start')

    // Create performance observer for Core Web Vitals
    if ('PerformanceObserver' in win) {
      const observer = new win.PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          win.performance.mark(`metric-${entry.name}`)
        }
      })

      observer.observe({ entryTypes: ['measure', 'navigation', 'resource', 'paint'] })
      win.performanceObserver = observer
    }
  })
})

Cypress.Commands.add('measurePageLoadPerformance', () => {
  cy.testLog('Measuring page load performance...')

  return cy.window().then(win => {
    const perfData = win.performance.getEntriesByType('navigation')[0]
    const paintEntries = win.performance.getEntriesByType('paint')

    const metrics = {
      // Navigation timing
      loadTime: perfData.loadEventEnd - perfData.navigationStart,
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
      domInteractive: perfData.domInteractive - perfData.navigationStart,
      firstByte: perfData.responseStart - perfData.requestStart,

      // Paint timing
      firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime,
      firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')
        ?.startTime,

      // Resource timing
      resourceCount: win.performance.getEntriesByType('resource').length
    }

    cy.log('Performance Metrics:', metrics)

    return metrics
  })
})

Cypress.Commands.add('validatePerformanceThresholds', (customThresholds = null) => {
  cy.testLog('Validating performance thresholds...')

  return cy.measurePageLoadPerformance().then(metrics => {
    const thresholds = customThresholds || Cypress.env('performanceThresholds')

    if (!thresholds) {
      cy.testLog('No performance thresholds configured')
      return metrics
    }

    const violations = []

    // Check each metric against thresholds
    if (thresholds.pageLoadTime && metrics.loadTime > thresholds.pageLoadTime) {
      violations.push(`Page load time: ${metrics.loadTime}ms > ${thresholds.pageLoadTime}ms`)
    }

    if (thresholds.domContentLoaded && metrics.domContentLoaded > thresholds.domContentLoaded) {
      violations.push(
        `DOM content loaded: ${metrics.domContentLoaded}ms > ${thresholds.domContentLoaded}ms`
      )
    }

    if (
      thresholds.firstContentfulPaint &&
      metrics.firstContentfulPaint > thresholds.firstContentfulPaint
    ) {
      violations.push(
        `First contentful paint: ${metrics.firstContentfulPaint}ms > ${thresholds.firstContentfulPaint}ms`
      )
    }

    if (thresholds.largestContentfulPaint) {
      // LCP measurement requires additional observer setup
      cy.log('LCP threshold set but not measured in current implementation')
    }

    if (thresholds.cumulativeLayoutShift) {
      // CLS measurement requires additional observer setup
      cy.log('CLS threshold set but not measured in current implementation')
    }

    if (thresholds.firstInputDelay) {
      // FID measurement requires additional observer setup
      cy.log('FID threshold set but not measured in current implementation')
    }

    if (violations.length > 0) {
      cy.testLog(`Performance threshold violations: ${violations.join(', ')}`, 'error')
      throw new Error(`Performance thresholds exceeded: ${violations.join(', ')}`)
    }

    cy.testLog('All performance thresholds passed')
    return metrics
  })
})

Cypress.Commands.add('measureResourceLoadTiming', () => {
  cy.testLog('Measuring resource load timing...')

  return cy.window().then(win => {
    const resources = win.performance.getEntriesByType('resource')
    const resourceTypes = {}

    resources.forEach(resource => {
      const type = resource.initiatorType
      if (!resourceTypes[type]) {
        resourceTypes[type] = {
          count: 0,
          totalSize: 0,
          totalDuration: 0
        }
      }

      resourceTypes[type].count++
      resourceTypes[type].totalDuration += resource.duration - resource.requestStart

      if (resource.transferSize) {
        resourceTypes[type].totalSize += resource.transferSize
      }
    })

    // Calculate averages
    Object.keys(resourceTypes).forEach(type => {
      const typeData = resourceTypes[type]
      typeData.averageDuration = typeData.count > 0 ? typeData.totalDuration / typeData.count : 0
      typeData.averageSize = typeData.count > 0 ? typeData.totalSize / typeData.count : 0
    })

    cy.log('Resource timing:', resourceTypes)
    return resourceTypes
  })
})

Cypress.Commands.add('checkMemoryUsage', () => {
  cy.testLog('Checking memory usage...')

  return cy.window().then(win => {
    if (win.performance && win.performance.memory) {
      const memory = {
        used: Math.round(win.performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(win.performance.memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(win.performance.memory.jsHeapSizeLimit / 1048576) // MB
      }

      cy.log('Memory usage (MB):', memory)

      // Basic memory usage validation
      if (memory.used > memory.total * 0.9) {
        cy.testLog(`High memory usage: ${memory.used}/${memory.total} MB`, 'warn')
      }

      return memory
    } else {
      cy.testLog('Memory information not available')
      return null
    }
  })
})

// Custom performance assertion
Cypress.Commands.add(
  'shouldPerformBetterThan',
  { prevSubject: true },
  (subject, threshold, metric) => {
    const value = typeof subject === 'object' ? subject[metric] : subject

    if (value > threshold) {
      throw new Error(`Performance metric ${metric} (${value}) exceeds threshold (${threshold})`)
    }

    cy.log(`Performance metric ${metric}: ${value} <= ${threshold} ✓`)
  }
)

export {}
