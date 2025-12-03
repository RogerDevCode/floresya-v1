#!/usr/bin/env node

/**
 * Enhanced CI Environment Diagnostic Script
 * Helps diagnose common issues in GitHub Actions CI environment with comprehensive checks
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

console.log('🔍 Enhanced CI Environment Diagnostic Tool')
console.log('==========================================')

// Configuration
const REQUIRED_FILES = [
  { path: 'package.json', description: 'Package configuration' },
  { path: 'api/server.js', description: 'Server entry point' },
  { path: 'api/app.js', description: 'Express app' },
  { path: 'public/index.html', description: 'Frontend entry point' },
  { path: 'playwright.config.js', description: 'Playwright configuration' },
  { path: 'seed-test-data-improved.js', description: 'Improved seed script' }
]

const REQUIRED_DIRECTORIES = [
  { path: 'api', description: 'API directory' },
  { path: 'public', description: 'Public directory' },
  { path: 'e2e-tests', description: 'E2E tests directory' },
  { path: 'test', description: 'Unit tests directory' },
  { path: 'scripts', description: 'Scripts directory' }
]

const REQUIRED_ENV_VARS = [
  { name: 'NODE_ENV', required: true, description: 'Node environment' },
  { name: 'CI', required: true, description: 'CI flag' },
  { name: 'HOME', required: true, description: 'Home directory' }
]

const CI_SECRETS = [
  { name: 'SUPABASE_URL', required: true, description: 'Supabase URL' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Supabase Service Role Key' },
  { name: 'SUPABASE_KEY', required: true, description: 'Supabase Key' },
  { name: 'JWT_SECRET', required: true, description: 'JWT Secret' },
  { name: 'SESSION_SECRET', required: true, description: 'Session Secret' }
]

let diagnosticResults = {
  files: { passed: 0, failed: 0, details: [] },
  directories: { passed: 0, failed: 0, details: [] },
  environment: { passed: 0, failed: 0, details: [] },
  dependencies: { passed: 0, failed: 0, details: [] },
  build: { passed: 0, failed: 0, details: [] },
  network: { passed: 0, failed: 0, details: [] }
}

function checkFile(filePath, description) {
  try {
    const exists = fs.existsSync(filePath)
    const stats = exists ? fs.statSync(filePath) : null
    const size = stats ? `${(stats.size / 1024).toFixed(2)}KB` : 'N/A'
    
    if (exists && stats.isFile()) {
      console.log(`✅ ${description}: Found (${size})`)
      diagnosticResults.files.passed++
      diagnosticResults.files.details.push({ path: filePath, status: 'PASS', size })
      return true
    } else {
      console.log(`❌ ${description}: Missing or not a file`)
      diagnosticResults.files.failed++
      diagnosticResults.files.details.push({ path: filePath, status: 'FAIL', reason: 'Missing or not a file' })
      return false
    }
  } catch (error) {
    console.log(`❌ ${description}: Error checking - ${error.message}`)
    diagnosticResults.files.failed++
    diagnosticResults.files.details.push({ path: filePath, status: 'ERROR', reason: error.message })
    return false
  }
}

function checkDirectory(dirPath, description) {
  try {
    const exists = fs.existsSync(dirPath)
    const stats = exists ? fs.statSync(dirPath) : null
    const files = exists && stats.isDirectory() ? fs.readdirSync(dirPath).length : 0
    
    if (exists && stats.isDirectory()) {
      console.log(`✅ ${description}: Found (${files} items)`)
      diagnosticResults.directories.passed++
      diagnosticResults.directories.details.push({ path: dirPath, status: 'PASS', items: files })
      return true
    } else {
      console.log(`❌ ${description}: Missing or not a directory`)
      diagnosticResults.directories.failed++
      diagnosticResults.directories.details.push({ path: dirPath, status: 'FAIL', reason: 'Missing or not a directory' })
      return false
    }
  } catch (error) {
    console.log(`❌ ${description}: Error checking - ${error.message}`)
    diagnosticResults.directories.failed++
    diagnosticResults.directories.details.push({ path: dirPath, status: 'ERROR', reason: error.message })
    return false
  }
}

function checkEnvironmentVariable(varName, required = true, description = '') {
  try {
    const value = process.env[varName]
    if (value) {
      const maskedValue = varName.includes('SECRET') || varName.includes('KEY') || varName.includes('TOKEN')
        ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
        : value
      console.log(`✅ ${varName}: ${maskedValue}`)
      diagnosticResults.environment.passed++
      diagnosticResults.environment.details.push({ name: varName, status: 'PASS', description })
      return true
    } else if (required) {
      console.log(`❌ ${varName}: Missing (required) - ${description}`)
      diagnosticResults.environment.failed++
      diagnosticResults.environment.details.push({ name: varName, status: 'FAIL', reason: 'Missing', description })
      return false
    } else {
      console.log(`⚠️ ${varName}: Missing (optional) - ${description}`)
      diagnosticResults.environment.passed++
      diagnosticResults.environment.details.push({ name: varName, status: 'WARN', reason: 'Missing but optional', description })
      return true
    }
  } catch (error) {
    console.log(`❌ ${varName}: Error checking - ${error.message}`)
    diagnosticResults.environment.failed++
    diagnosticResults.environment.details.push({ name: varName, status: 'ERROR', reason: error.message })
    return false
  }
}

function runCommand(command, description, timeout = 30000) {
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      timeout,
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim()
    console.log(`✅ ${description}: ${output}`)
    diagnosticResults.dependencies.passed++
    diagnosticResults.dependencies.details.push({ command, status: 'PASS', output })
    return true
  } catch (error) {
    const errorMsg = error.status ? `Exit code: ${error.status}` : error.message
    console.log(`❌ ${description}: Failed - ${errorMsg}`)
    diagnosticResults.dependencies.failed++
    diagnosticResults.dependencies.details.push({ command, status: 'FAIL', reason: errorMsg })
    return false
  }
}

function checkPackageJson() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    console.log(`✅ Package name: ${packageJson.name}`)
    console.log(`✅ Package version: ${packageJson.version}`)
    
    // Check for required scripts
    const requiredScripts = ['start', 'test', 'lint', 'build:css']
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts || !packageJson.scripts[script])
    
    if (missingScripts.length > 0) {
      console.log(`⚠️ Missing scripts: ${missingScripts.join(', ')}`)
      diagnosticResults.dependencies.failed++
      diagnosticResults.dependencies.details.push({ 
        check: 'package.json scripts', 
        status: 'WARN', 
        reason: `Missing scripts: ${missingScripts.join(', ')}` 
      })
    } else {
      console.log('✅ All required scripts present')
      diagnosticResults.dependencies.passed++
      diagnosticResults.dependencies.details.push({ 
        check: 'package.json scripts', 
        status: 'PASS', 
        reason: 'All required scripts present' 
      })
    }
    
    return true
  } catch (error) {
    console.log(`❌ Failed to read package.json: ${error.message}`)
    diagnosticResults.dependencies.failed++
    diagnosticResults.dependencies.details.push({ 
      check: 'package.json', 
      status: 'FAIL', 
      reason: error.message 
    })
    return false
  }
}

async function checkNetworkConnectivity() {
  if (process.env.NODE_ENV === 'test') {
    console.log('⏭️ Skipping network checks in test environment')
    return true
  }
  
  try {
    const urls = [
      { url: 'https://httpbin.org/get', description: 'Basic internet connectivity' },
      { url: 'https://api.github.com', description: 'GitHub API connectivity' }
    ]
    
    for (const { url, description } of urls) {
      try {
        const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10000) })
        if (response.ok) {
          console.log(`✅ ${description}: OK`)
          diagnosticResults.network.passed++
          diagnosticResults.network.details.push({ url, status: 'PASS', description })
        } else {
          console.log(`⚠️ ${description}: Limited (HTTP ${response.status})`)
          diagnosticResults.network.passed++
          diagnosticResults.network.details.push({ url, status: 'WARN', reason: `HTTP ${response.status}`, description })
        }
      } catch (error) {
        console.log(`❌ ${description}: Failed - ${error.message}`)
        diagnosticResults.network.failed++
        diagnosticResults.network.details.push({ url, status: 'FAIL', reason: error.message, description })
      }
    }
    
    return true
  } catch (error) {
    console.log(`❌ Network connectivity check failed: ${error.message}`)
    diagnosticResults.network.failed++
    diagnosticResults.network.details.push({ check: 'network', status: 'ERROR', reason: error.message })
    return false
  }
}

function checkBuildArtifacts() {
  const buildFiles = [
    { path: 'public/css/input.css', description: 'CSS input file' },
    { path: 'public/css/tailwind.css', description: 'CSS build output' },
    { path: 'api/docs/openapi-spec.json', description: 'OpenAPI specification (JSON)' },
    { path: 'api/docs/openapi-spec.yaml', description: 'OpenAPI specification (YAML)' }
  ]
  
  for (const { path, description } of buildFiles) {
    try {
      const exists = fs.existsSync(path)
      if (exists) {
        const stats = fs.statSync(path)
        const size = `${(stats.size / 1024).toFixed(2)}KB`
        console.log(`✅ ${description}: Found (${size})`)
        diagnosticResults.build.passed++
        diagnosticResults.build.details.push({ path, status: 'PASS', size })
      } else {
        console.log(`⚠️ ${description}: Missing (may be generated during build)`)
        diagnosticResults.build.passed++
        diagnosticResults.build.details.push({ path, status: 'WARN', reason: 'Missing (may be generated during build)' })
      }
    } catch (error) {
      console.log(`❌ ${description}: Error checking - ${error.message}`)
      diagnosticResults.build.failed++
      diagnosticResults.build.details.push({ path, status: 'ERROR', reason: error.message })
    }
  }
}

function generateDiagnosticReport() {
  console.log('\n📊 Enhanced Diagnostic Report')
  console.log('============================')
  
  const categories = [
    { name: 'Files', data: diagnosticResults.files },
    { name: 'Directories', data: diagnosticResults.directories },
    { name: 'Environment', data: diagnosticResults.environment },
    { name: 'Dependencies', data: diagnosticResults.dependencies },
    { name: 'Build Artifacts', data: diagnosticResults.build },
    { name: 'Network', data: diagnosticResults.network }
  ]
  
  let totalPassed = 0
  let totalFailed = 0
  
  for (const { name, data } of categories) {
    const total = data.passed + data.failed
    const percentage = total > 0 ? ((data.passed / total) * 100).toFixed(1) : '0.0'
    console.log(`${name}: ${data.passed}/${total} (${percentage}%)`)
    totalPassed += data.passed
    totalFailed += data.failed
  }
  
  const overallTotal = totalPassed + totalFailed
  const overallPercentage = overallTotal > 0 ? ((totalPassed / overallTotal) * 100).toFixed(1) : '0.0'
  
  console.log(`\nOverall: ${totalPassed}/${overallTotal} (${overallPercentage}%)`)
  
  if (totalFailed === 0) {
    console.log('\n✅ All diagnostic checks passed!')
    console.log('The CI environment appears to be properly configured.')
    return true
  } else {
    console.log(`\n❌ ${totalFailed} diagnostic check(s) failed.`)
    console.log('Please review the issues above and fix them before running the CI pipeline.')
    
    // Show failed items for easy reference
    console.log('\n🔧 Failed Items Summary:')
    console.log('=========================')
    
    for (const { name, data } of categories) {
      const failedItems = data.details.filter(item => item.status === 'FAIL' || item.status === 'ERROR')
      if (failedItems.length > 0) {
        console.log(`\n${name}:`)
        for (const item of failedItems) {
          const identifier = item.path || item.name || item.command || item.check
          const reason = item.reason || 'Unknown reason'
          console.log(`  ❌ ${identifier}: ${reason}`)
        }
      }
    }
    
    return false
  }
}

async function diagnose() {
  const startTime = Date.now()
  
  console.log('\n📁 File System Checks')
  console.log('---------------------')
  
  for (const { path, description } of REQUIRED_FILES) {
    checkFile(path, description)
  }
  
  console.log('\n📂 Directory Checks')
  console.log('-------------------')
  
  for (const { path, description } of REQUIRED_DIRECTORIES) {
    checkDirectory(path, description)
  }
  
  console.log('\n🌍 Environment Variables')
  console.log('------------------------')
  
  for (const { name, required, description } of REQUIRED_ENV_VARS) {
    checkEnvironmentVariable(name, required, description)
  }
  
  // Check secrets only in CI environment
  if (process.env.CI) {
    console.log('\n🔐 Secrets (CI Environment)')
    console.log('------------------------------')
    
    for (const { name, required, description } of CI_SECRETS) {
      checkEnvironmentVariable(name, required, description)
    }
  }
  
  console.log('\n📦 Dependencies')
  console.log('---------------')
  
  // Check if node_modules exists
  const nodeModulesExists = checkDirectory('node_modules', 'Node modules')
  
  if (nodeModulesExists) {
    runCommand('npm --version', 'npm version')
    runCommand('node --version', 'Node.js version')
    checkPackageJson()
  }
  
  console.log('\n🔧 Build Artifacts')
  console.log('------------------')
  
  checkBuildArtifacts()
  
  console.log('\n🌐 Network Checks')
  console.log('-----------------')
  
  await checkNetworkConnectivity()
  
  console.log('\n⏱️ Diagnostic completed in', ((Date.now() - startTime) / 1000).toFixed(2), 'seconds')
  
  const allChecksPassed = generateDiagnosticReport()
  process.exit(allChecksPassed ? 0 : 1)
}

// Run the diagnostic
diagnose().catch(error => {
  console.error('❌ Diagnostic script failed:', error.message)
  console.error('Stack trace:', error.stack)
  process.exit(1)
})