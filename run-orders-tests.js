#!/usr/bin/env node

/**
 * Test Runner for Orders Page Tests
 * Executes all orders page tests (unit, integration, and API)
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import _path from 'path'

const execAsync = promisify(exec)

async function checkTestFiles() {
  const testFiles = [
    './tests/orders.unit.test.mjs',
    './tests/orders.integration.test.mjs',
    './tests/orders.api.test.mjs'
  ]

  console.log('🔍 Checking for test files...\n')

  for (const file of testFiles) {
    try {
      await fs.access(file)
      console.log(`✅ Found: ${file}`)
    } catch {
      console.log(`❌ Missing: ${file}`)
      throw new Error(`Test file not found: ${file}`)
    }
  }

  console.log('')
}

async function runTests() {
  console.log('🚀 Starting Orders Page Tests...\n')

  try {
    // Check if test files exist
    await checkTestFiles()

    // Run unit tests
    console.log('🧪 Running Unit Tests...\n')
    try {
      const { stdout, stderr } = await execAsync('node tests/orders.unit.test.mjs')
      console.log('Unit Tests Output:')
      console.log(stdout)
      if (stderr) {
        console.error(stderr)
      }
    } catch (error) {
      console.log('Unit Tests Output (with errors):')
      console.log(error.stdout || error.message)
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Run integration tests
    console.log('🔗 Running Integration Tests...\n')
    try {
      const { stdout, stderr } = await execAsync('node tests/orders.integration.test.mjs')
      console.log('Integration Tests Output:')
      console.log(stdout)
      if (stderr) {
        console.error(stderr)
      }
    } catch (error) {
      console.log('Integration Tests Output (with errors):')
      console.log(error.stdout || error.message)
    }

    console.log('\n' + '='.repeat(50) + '\n')

    // Run API tests
    console.log('📡 Running API Tests...\n')
    try {
      const { stdout, stderr } = await execAsync('node tests/orders.api.test.mjs')
      console.log('API Tests Output:')
      console.log(stdout)
      if (stderr) {
        console.error(stderr)
      }
    } catch (error) {
      console.log('API Tests Output (with errors):')
      console.log(error.stdout || error.message)
    }

    console.log('\n🎉 All test suites completed!')
  } catch (error) {
    console.error('❌ Error running tests:', error.message)
  }
}

// Run the tests
runTests()
