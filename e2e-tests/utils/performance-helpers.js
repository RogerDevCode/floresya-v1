// Performance helpers for Playwright

export const setupPerformanceMonitoring = async (page) => {
  await page.evaluate(() => {
    window.performance.mark('test-start')
    
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.performance.mark(`metric-${entry.name}`)
        }
      })
      
      observer.observe({ entryTypes: ['measure', 'navigation', 'resource', 'paint'] })
      // @ts-ignore
      window.performanceObserver = observer
    }
  })
}

export const measurePageLoadPerformance = async (page) => {
  return await page.evaluate(() => {
    const perfData = window.performance.getEntriesByType('navigation')[0]
    const paintEntries = window.performance.getEntriesByType('paint')

    const metrics = {
      // Navigation timing
      // @ts-ignore
      loadTime: perfData.loadEventEnd - perfData.navigationStart,
      // @ts-ignore
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
      // @ts-ignore
      domInteractive: perfData.domInteractive - perfData.navigationStart,
      // @ts-ignore
      firstByte: perfData.responseStart - perfData.requestStart,

      // Paint timing
      firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime,
      firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime,

      // Resource timing
      resourceCount: window.performance.getEntriesByType('resource').length
    }

    return metrics
  })
}

export const validatePerformanceThresholds = async (page, customThresholds = null) => {
  const metrics = await measurePageLoadPerformance(page)
  // Default thresholds if not provided
  const thresholds = customThresholds || {
    pageLoadTime: 3000,
    domContentLoaded: 1500,
    firstContentfulPaint: 1000
  }

  const violations = []

  if (thresholds.pageLoadTime && metrics.loadTime > thresholds.pageLoadTime) {
    violations.push(`Page load time: ${metrics.loadTime}ms > ${thresholds.pageLoadTime}ms`)
  }

  if (thresholds.domContentLoaded && metrics.domContentLoaded > thresholds.domContentLoaded) {
    violations.push(`DOM content loaded: ${metrics.domContentLoaded}ms > ${thresholds.domContentLoaded}ms`)
  }

  if (thresholds.firstContentfulPaint && metrics.firstContentfulPaint && metrics.firstContentfulPaint > thresholds.firstContentfulPaint) {
    violations.push(`First contentful paint: ${metrics.firstContentfulPaint}ms > ${thresholds.firstContentfulPaint}ms`)
  }

  if (violations.length > 0) {
    throw new Error(`Performance thresholds exceeded: ${violations.join(', ')}`)
  }

  return metrics
}
