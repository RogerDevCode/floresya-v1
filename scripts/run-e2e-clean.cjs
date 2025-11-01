#!/usr/bin/env node

/**
 * Ultimate Clean E2E Runner
 * Executes Playwright in a completely isolated process
 * No module loading conflicts, no Symbol conflicts
 */

const { spawn } = require('child_process')

console.log('🎯 Starting Ultimate Clean E2E Test Runner...')

// Set environment variables for complete isolation
const cleanEnv = {
  ...process.env,
  NODE_ENV: 'test',
  PLAYWRIGHT_CI: 'true',
  CI: 'true',
  // Remove any test-related environment variables
  NODE_OPTIONS: '--no-warnings',
  // Clear module cache path
  NODE_PATH: '',
  // Prevent any auto-loading of test frameworks
  PLAYWRIGHT_TEST: 'false'
}

// Start a completely fresh Node process
const playwrightProcess = spawn('node', [
  '--no-warnings',
  '--no-deprecation',
  './node_modules/.bin/playwright',
  'test',
  '--config=playwright.config.isolated.cjs'
], {
  stdio: 'inherit',
  shell: false,
  env: cleanEnv,
  cwd: process.cwd()
})

playwrightProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ E2E tests completed successfully in clean environment')
    process.exit(0)
  } else {
    console.error(`❌ E2E tests failed with exit code ${code}`)
    process.exit(code)
  }
})

playwrightProcess.on('error', (error) => {
  console.error('❌ Failed to start Playwright process:', error.message)
  process.exit(1)
})