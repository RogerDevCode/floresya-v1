/**
 * Vitest test setup file
 * Configures global test environment and utilities
 */
// @ts-nocheck

import { vi } from 'vitest'

// Global test timeout
vi.setConfig({ testTimeout: 10000 })

// Mock performance API if not available
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now()
  }
}

// Global test utilities
global.testUtils = {
  /**
   * Wait for a specified number of milliseconds
   * @param {number} ms - Milliseconds to wait
   */
  waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Generate random test data
   */
  generateTestData: {
    email: () => `test-${Date.now()}@example.com`,
    name: () => `Test User ${Date.now()}`,
    bio: () => `Test bio generated at ${new Date().toISOString()}`
  }
}

// Console override for cleaner test output
const originalConsole = global.console
global.console = {
  ...originalConsole,
  // Keep error and warn logs, but silence log during tests unless explicitly needed
  log: process.env.VERBOSE_TESTS ? originalConsole.log : () => {},
  error: originalConsole.error,
  warn: originalConsole.warn,
  info: process.env.VERBOSE_TESTS ? originalConsole.info : () => {}
}
