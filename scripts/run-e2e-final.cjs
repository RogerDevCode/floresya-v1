#!/usr/bin/env node

/**
 * Final Solution: Clean E2E Execution
 * Creates temporary clean environment with only Playwright dependencies
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Starting Final Clean E2E Solution...')

const tempDir = path.join(process.cwd(), '.temp-e2e')
const originalCwd = process.cwd

try {
  // Create temporary directory
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
  fs.mkdirSync(tempDir, { recursive: true })

  console.log('📁 Created temporary clean directory')

  // Copy only necessary files to temp directory
  const filesToCopy = [
    'playwright.config.isolated.cjs',
    'tests/e2e/',
    '.env.local'
  ]

  filesToCopy.forEach(file => {
    const src = path.join(process.cwd(), file)
    const dest = path.join(tempDir, file)

    if (fs.existsSync(src)) {
      if (fs.statSync(src).isDirectory()) {
        fs.cpSync(src, dest, { recursive: true })
      } else {
        fs.copyFileSync(src, dest)
      }
      console.log(`📋 Copied ${file}`)
    }
  })

  // Copy package.e2e.json as package.json in temp directory
  fs.copyFileSync(
    path.join(process.cwd(), 'package.e2e.json'),
    path.join(tempDir, 'package.json')
  )

  // Change to temp directory
  process.chdir(tempDir)
  console.log('📂 Changed to temporary directory')

  // Install only Playwright dependencies
  console.log('📦 Installing only Playwright dependencies...')
  execSync('npm install', { stdio: 'inherit' })

  // Install Playwright browsers
  console.log('🌐 Installing Playwright browsers...')
  execSync('npx playwright install', { stdio: 'inherit' })

  // Run E2E tests in completely clean environment
  console.log('🎭 Running E2E tests in clean environment...')
  execSync('npm run test:e2e', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PLAYWRIGHT_CI: 'true',
      CI: 'true'
    }
  })

  console.log('✅ E2E tests completed successfully!')

} catch (error) {
  console.error(`❌ E2E tests failed:`, error.message)
  process.exit(1)
} finally {
  // Return to original directory
  process.chdir(originalCwd)

  // Clean up temporary directory
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true })
    console.log('🧹 Cleaned up temporary directory')
  }
}