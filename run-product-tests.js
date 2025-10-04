#!/usr/bin/env node

/**
 * Test Suite Runner for Product Image and Form Tests
 * Executes all product-related tests (unit and integration)
 */

import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

async function checkTestFiles() {
  const testFiles = [
    './tests/product-image-controller.unit.test.mjs',
    './tests/product-image-controller.integration.test.mjs',
    './tests/product-form.unit.test.mjs',
    './tests/product-form.integration.test.mjs'
  ]

  console.log('🔍 Checking for test files...\n')

  for (const file of testFiles) {
    try {
      await fs.access(file)
      console.log(`✅ Found: ${file}`)
    } catch (error) {
      console.log(`❌ Missing: ${file}`)
      throw new Error(`Test file not found: ${file}`)
    }
  }

  console.log('')
}

async function runTestSuite() {
  console.log('🚀 Starting Product Tests Suite...\n')

  try {
    // Check if test files exist
    await checkTestFiles()

    // Run product image controller unit tests
    console.log('🧪 Running Product Image Controller Unit Tests...\n')
    try {
      const { stdout, stderr } = await execAsync(
        'node tests/product-image-controller.unit.test.mjs'
      )
      console.log('Product Image Controller Unit Tests Output:')
      console.log(stdout)
      if (stderr) {
        console.error(stderr)
      }
    } catch (error) {
      console.log('Product Image Controller Unit Tests Output (with errors):')
      console.log(error.stdout || error.message)
    }

    console.log('\n' + '='.repeat(70) + '\n')

    // Run product image controller integration tests
    console.log('🔗 Running Product Image Controller Integration Tests...\n')
    try {
      const { stdout, stderr } = await execAsync(
        'node tests/product-image-controller.integration.test.mjs'
      )
      console.log('Product Image Controller Integration Tests Output:')
      console.log(stdout)
      if (stderr) {
        console.error(stderr)
      }
    } catch (error) {
      console.log('Product Image Controller Integration Tests Output (with errors):')
      console.log(error.stdout || error.message)
    }

    console.log('\n' + '='.repeat(70) + '\n')

    // Run product form unit tests
    console.log('📝 Running Product Form Unit Tests...\n')
    try {
      const { stdout, stderr } = await execAsync('node tests/product-form.unit.test.mjs')
      console.log('Product Form Unit Tests Output:')
      console.log(stdout)
      if (stderr) {
        console.error(stderr)
      }
    } catch (error) {
      console.log('Product Form Unit Tests Output (with errors):')
      console.log(error.stdout || error.message)
    }

    console.log('\n' + '='.repeat(70) + '\n')

    // Run product form integration tests
    console.log('🔄 Running Product Form Integration Tests...\n')
    try {
      const { stdout, stderr } = await execAsync('node tests/product-form.integration.test.mjs')
      console.log('Product Form Integration Tests Output:')
      console.log(stdout)
      if (stderr) {
        console.error(stderr)
      }
    } catch (error) {
      console.log('Product Form Integration Tests Output (with errors):')
      console.log(error.stdout || error.message)
    }

    console.log('\n🎉 All test suites completed!')
  } catch (error) {
    console.error('❌ Error running tests:', error.message)
  }
}

// Run the tests
runTestSuite()
