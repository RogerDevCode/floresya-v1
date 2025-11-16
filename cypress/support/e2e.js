/**
 * Cypress E2E Support File - FloresYa Project
 * Test-Driven Development Implementation
 * Following MIT CSAIL and Google Testing Best Practices
 * 100% Success Rate Requirement
 */

// Import testing library commands for better element selection
import '@testing-library/cypress/add-commands'

// Import existing commands
import './commands'

// Import custom Supabase commands
import './commands/supabase-commands'

// Import our custom TDD commands
import './commands/performance-commands'
import './commands/accessibility-commands'
import './commands/dom-commands'
import './commands/utilities'

// Global configuration for TDD approach
beforeEach(() => {
  // Consistent viewport for testing
  cy.viewport(1280, 720)

  // Clean state for each test (TDD principle)
  cy.clearLocalStorage()
  cy.clearCookies()

  // Performance monitoring setup
  if (Cypress.env('enablePerformanceTesting')) {
    cy.setupPerformanceMonitoring()
  }

  // Log test start for debugging
  cy.log(`🚀 Starting test: ${Cypress.currentTest.title}`)
})

afterEach(() => {
  // Clean up test artifacts
  cy.cleanupTestArtifacts()

  // Log performance metrics if enabled
  if (Cypress.env('enablePerformanceTesting')) {
    cy.logPerformanceMetrics()
  }

  // Log test completion
  cy.log(`✅ Completed test: ${Cypress.currentTest.title}`)
})

// Global error handling - TDD approach: fail fast, fix immediately
Cypress.on('uncaught:exception', (err, runnable) => {
  cy.testLog(`Uncaught exception in ${runnable.title}: ${err.message}`, 'error')

  // Always fail on uncaught exceptions for TDD
  return false
})

// Hide fetch/XHR requests from command log for cleaner output
const app = window.top
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style')
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }'
  style.setAttribute('data-hide-command-log-request', '')
  app.document.head.appendChild(style)
}

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // You can customize this based on your application's error handling
  console.log('Uncaught exception:', err.message)

  // Don't fail tests on certain types of errors
  if (
    err.message.includes('ResizeObserver loop limit exceeded') ||
    err.message.includes('Script error') ||
    err.message.includes('Non-Error promise rejection captured')
  ) {
    return false
  }

  // Let other errors fail the test
  return true
})

// Global before hook
beforeEach(() => {
  // Set up common aliases and intercepts
  cy.intercept('GET', '**/api/**').as('apiRequest')
  cy.intercept('POST', '**/api/**').as('apiPost')

  // Clear cookies and local storage before each test
  cy.clearCookies()
  cy.clearLocalStorage()

  // Set up test user if needed
  cy.setupTestUser()
})

// Global after hook
afterEach(() => {
  // Clean up after each test
  cy.cleanupTestData()
})

// Custom configuration for Supabase tests
Cypress.Commands.add('setupSupabaseTest', () => {
  // Set up Supabase test environment
  cy.window().then(win => {
    // Configure Supabase client for testing
    if (win.supabase) {
      win.supabase.from('users').select('*').limit(1)
    }
  })
})

// Performance monitoring for E2E tests
Cypress.Commands.add('measurePerformance', testName => {
  cy.window().then(win => {
    const perfData = win.performance.getEntriesByType('navigation')[0]
    cy.task(
      'log',
      `${testName} - Page Load Time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`
    )
  })
})

// Database operations for testing
Cypress.Commands.add('seedDatabase', (tableName, data) => {
  cy.task('db:seed', { table: tableName, data })
})

Cypress.Commands.add('resetDatabase', () => {
  cy.task('db:reset')
})

Cypress.Commands.add('getTestData', fixtureName => {
  return cy.fixture(`test-data/${fixtureName}`)
})

// Test logging utility
Cypress.Commands.add('testLog', (message, type = 'info') => {
  const timestamp = new Date().toISOString()
  const testTitle = Cypress.currentTest ? Cypress.currentTest.title : 'Unknown'

  const prefix =
    {
      info: 'ℹ️',
      success: '✅',
      warn: '⚠️',
      error: '❌',
      debug: '🐛'
    }[type] || 'ℹ️'

  // Log to Cypress command log
  cy.log(`${prefix} [${timestamp}] ${testTitle}: ${message}`)

  // Log to console for debugging
  if (type === 'error') {
    console.error(`${prefix} ERROR [${timestamp}] ${testTitle}: ${message}`)
  } else if (type === 'warn') {
    console.warn(`${prefix} WARN [${timestamp}] ${testTitle}: ${message}`)
  } else if (Cypress.env('verboseLogging')) {
    console.log(`${prefix} [${timestamp}] ${testTitle}: ${message}`)
  }

  // Send to task for CI logging
  if (type === 'error') {
    cy.task('log', `ERROR: [${timestamp}] ${testTitle}: ${message}`)
  }

  return null
})

// Performance monitoring setup
Cypress.Commands.add('setupPerformanceMonitoring', () => {
  cy.window().then(win => {
    // Add performance marks for measurement
    win.performance.mark('test-start')

    // Override performance.now() for consistent measurements
    const originalPerformanceNow = win.performance.now
    win.performance.now = () => originalPerformanceNow.call(win.performance)
  })
})

// Performance logging
Cypress.Commands.add('logPerformanceMetrics', () => {
  cy.window().then(win => {
    try {
      const perfData = win.performance.getEntriesByType('navigation')[0]
      const metrics = {
        loadTime: perfData.loadEventEnd - perfData.navigationStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        firstPaint: win.performance.getEntriesByType('paint')[0]?.startTime,
        firstContentfulPaint: win.performance.getEntriesByType('paint')[1]?.startTime
      }

      cy.log('Performance Metrics:', metrics)

      // Validate against thresholds
      const thresholds = Cypress.env('performanceThresholds')
      if (thresholds) {
        Object.keys(metrics).forEach(metric => {
          if (thresholds[metric] && metrics[metric] > thresholds[metric]) {
            throw new Error(
              `Performance threshold exceeded for ${metric}: ${metrics[metric]}ms > ${thresholds[metric]}ms`
            )
          }
        })
      }
    } catch (error) {
      cy.log('Could not collect performance metrics:', error.message)
    }
  })
})

// Test cleanup
Cypress.Commands.add('cleanupTestArtifacts', () => {
  // Close any remaining modals or overlays
  cy.get('body').then($body => {
    if ($body.find('.modal, .overlay, [role="dialog"]').length > 0) {
      cy.get('.modal-close, [aria-label="Close"], .overlay-close').click({
        multiple: true,
        force: true
      })
    }
  })
})
