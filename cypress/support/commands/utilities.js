/**
 * Utility Commands for Cypress Testing
 * Test-Driven Development Implementation
 * Logging, debugging, and helper functions
 */

// Enhanced logging command
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

  // No return value - Cypress commands should not return mixed values
})

// Custom assertion with better error messages
Cypress.Commands.add('shouldBe', { prevSubject: true }, (subject, condition, message = '') => {
  const subjectString = Cypress._.isObject(subject) ? JSON.stringify(subject) : String(subject)

  if (!condition) {
    const errorMessage = message || `Assertion failed: expected "${subjectString}" to be true`
    cy.testLog(errorMessage, 'error')
    throw new Error(errorMessage)
  }

  cy.testLog(`Assertion passed: ${message || subjectString}`)
  return cy.wrap(subject)
})

// Wait for element to be ready with timeout
Cypress.Commands.add('waitForElement', (selector, options = {}) => {
  const { timeout = 10000, state = 'visible' } = options

  cy.testLog(`Waiting for element: ${selector}`)

  return cy.get(selector, { timeout }).should(state)
})

// Test cleanup helper
Cypress.Commands.add('cleanupTestArtifacts', () => {
  cy.testLog('Cleaning up test artifacts...')

  // Close any remaining modals or overlays
  cy.get('body').then($body => {
    const modals = $body.find('.modal, .overlay, [role="dialog"], .popup, [aria-modal="true"]')

    if (modals.length > 0) {
      cy.testLog(`Found ${modals.length} modal(s) to clean up`)

      // Try to close modals gracefully
      cy.get('.modal-close, [aria-label="Close"], .close, [data-dismiss="modal"]')
        .click({ multiple: true, force: true })
        .then(() => {
          // Force remove if still present
          cy.get('.modal, .overlay').should('not.exist', { timeout: 2000 })
        })
    }
  })
})

// Network request helper
Cypress.Commands.add('waitForNetworkIdle', (timeout = 5000) => {
  cy.testLog('Waiting for network idle...')

  let networkRequests = 0
  const originalFetch = window.fetch

  cy.window().then(win => {
    win.fetch = (...args) => {
      networkRequests++
      return originalFetch.apply(win, args).finally(() => {
        networkRequests--
      })
    }
  })

  // Wait for no active network requests
  cy.wait(timeout).then(() => {
    if (networkRequests > 0) {
      cy.testLog(`Still ${networkRequests} network requests active after ${timeout}ms`, 'warn')
    }
  })
})

// Environment-specific helpers
Cypress.Commands.add('isDevelopment', () => {
  return (
    Cypress.config('baseUrl').includes('localhost') ||
    Cypress.config('baseUrl').includes('127.0.0.1') ||
    Cypress.config('baseUrl').includes('dev')
  )
})

Cypress.Commands.add('isProduction', () => {
  return !Cypress.isDevelopment()
})

// Test data helpers
Cypress.Commands.add('getTestData', key => {
  const testData = {
    validUser: {
      email: 'test@example.com',
      password: 'testPassword123'
    },
    sampleProduct: {
      name: 'Ramo de Rosas',
      price: 2500,
      description: 'Hermoso ramo de rosas rojas'
    },
    validFormFields: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+584141234567',
      message: 'Test message for form submission'
    }
  }

  return testData[key] || null
})

// Retry helper for flaky operations (minimal usage in TDD)
Cypress.Commands.add('retryOperation', (operation, maxRetries = 2, delay = 100) => {
  let attempts = 0

  const tryOperation = () => {
    attempts++

    return cy
      .wrap(operation())
      .then(result => {
        cy.testLog(`Operation succeeded on attempt ${attempts}`)
        return result
      })
      .catch(error => {
        if (attempts < maxRetries) {
          cy.testLog(`Retrying operation, attempt ${attempts + 1}/${maxRetries}: ${error.message}`)
          cy.wait(delay)
          return tryOperation()
        }

        cy.testLog(`Operation failed after ${maxRetries} attempts: ${error.message}`, 'error')
        throw error
      })
  }

  return tryOperation()
})

// Performance measurement helper
Cypress.Commands.add('measureTime', (operation, label = 'Operation') => {
  cy.testLog(`Starting time measurement: ${label}`)

  const startTime = Date.now()

  return cy.wrap(operation()).then(result => {
    const endTime = Date.now()
    const duration = endTime - startTime

    cy.testLog(`${label} completed in ${duration}ms`)

    return {
      result,
      duration,
      startTime,
      endTime
    }
  })
})

// File operation helpers
Cypress.Commands.add('uploadFile', (selector, fileName, mimeType = 'application/octet-stream') => {
  cy.fixture(fileName).then(fileContent => {
    cy.get(selector).selectFile({
      contents: Cypress.Buffer.from(fileContent),
      fileName,
      mimeType
    })
  })
})

// Screenshot helper with descriptive names
Cypress.Commands.add('takeScreenshot', (name = null) => {
  const testName = Cypress.currentTest ? Cypress.currentTest.title : 'unknown'
  const screenshotName = name || `${testName}-${Date.now()}`

  cy.testLog(`Taking screenshot: ${screenshotName}`)
  cy.screenshot(screenshotName, { capture: 'viewport' })
})

// Console output capture
Cypress.Commands.add('captureConsoleLogs', () => {
  const logs = {
    error: [],
    warn: [],
    log: []
  }

  cy.window().then(win => {
    // Capture console output
    const originalError = win.console.error
    const originalWarn = win.console.warn
    const originalLog = win.console.log

    win.console.error = (...args) => {
      logs.error.push(args.join(' '))
      originalError.apply(win.console, args)
    }

    win.console.warn = (...args) => {
      logs.warn.push(args.join(' '))
      originalWarn.apply(win.console, args)
    }

    win.console.log = (...args) => {
      logs.log.push(args.join(' '))
      originalLog.apply(win.console, args)
    }

    // Store logs for test verification
    win.testLogs = logs
  })

  return cy.wrap(logs)
})

// Test environment validation
Cypress.Commands.add('validateTestEnvironment', () => {
  cy.testLog('Validating test environment...')

  return cy.window().then(win => {
    const env = {
      userAgent: win.navigator.userAgent,
      viewport: {
        width: win.innerWidth,
        height: win.innerHeight
      },
      url: win.location.href,
      timestamp: new Date().toISOString()
    }

    cy.testLog('Test environment validated', 'success')
    cy.log('Environment:', env)

    return env
  })
})

export {}
