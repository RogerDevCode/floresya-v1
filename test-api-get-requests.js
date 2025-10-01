/**
 * API GET Requests Test Script
 * Tests all GET endpoints in the FloresYa application via API calls
 */

import dotenv from 'dotenv'
import { spawn } from 'child_process'
import { promisify } from 'util'
import { writeFile, readFile } from 'fs/promises'

dotenv.config({ path: '.env.local' })

// Function to sleep for a specified time
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Function to test API endpoints using curl
async function testAPIEndpoint(endpoint, description) {
  console.log(`🧪 Testing ${description}...`)

  const startTime = Date.now()

  try {
    const { exec } = await import('child_process')
    const execAsync = promisify(exec)

    const result = await execAsync(
      `curl -s -w "HTTPSTATUS:%{http_code}" -o /tmp/curl_output.txt "http://localhost:3000${endpoint}"`
    )

    // Extract HTTP status code from curl output
    const output = result.stdout
    const statusMatch = output.match(/HTTPSTATUS:(\d{3})$/)
    const httpStatus = statusMatch ? statusMatch[1] : 'Unknown'

    // Get response from file
    const fs = await import('fs')
    const response = fs.readFileSync('/tmp/curl_output.txt', 'utf-8')

    // Try to parse as JSON to check if it's a valid API response
    let jsonData = null
    let isValidJson = false
    try {
      jsonData = JSON.parse(response)
      isValidJson = true
    } catch (e) {
      // Response might not be JSON (for HTML pages or errors)
    }

    const responseTime = Date.now() - startTime

    console.log(`  ✅ ${endpoint}: HTTP ${httpStatus} (${responseTime}ms)`)

    if (isValidJson) {
      if (jsonData.success === true) {
        console.log(
          `  💡 Success response with ${jsonData.data ? (Array.isArray(jsonData.data) ? `${jsonData.data.length} items` : '1 item') : 'no data'}`
        )
      } else {
        console.log(`  ⚠️  Response: ${jsonData.error || jsonData.message || 'Unknown error'}`)
      }
    } else {
      // Likely HTML response (like homepage)
      if (response.includes('<!doctype html>') || response.includes('<html')) {
        console.log('  💡 HTML response received (likely homepage or static content)')
      } else {
        console.log(
          `  ⚠️  Non-JSON response: ${response.substring(0, 100)}${response.length > 100 ? '...' : ''}`
        )
      }
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.log(`  ❌ ${endpoint}: Error (${responseTime}ms) - ${error.message}`)
  }
}

// Start the server and run tests
async function runAPITests() {
  console.log('🚀 Starting API GET tests...\n')

  // Start the server in the background
  console.log('🔌 Starting server on port 3000...')
  const server = spawn('node', ['server.js'], {
    cwd: process.cwd(),
    env: process.env
  })

  // Capture server output
  server.stdout.on('data', data => {
    console.log(`Server: ${data}`)
  })

  server.stderr.on('data', data => {
    console.log(`Server error: ${data}`)
  })

  // Wait a bit for server to start
  await sleep(3000)

  try {
    // Test API endpoints
    await testAPIEndpoint('/', 'Homepage')
    await testAPIEndpoint('/api/products', 'Get all products')
    await testAPIEndpoint('/api/products/67', 'Get product by ID (67)')
    await testAPIEndpoint('/api/occasions', 'Get all occasions')
    await testAPIEndpoint('/api/occasions/1', 'Get occasion by ID (1)')
    await testAPIEndpoint('/api/orders?userId=1', 'Get user orders')
    await testAPIEndpoint('/styles/main.css', 'CSS styles')
    await testAPIEndpoint('/images/logoFloresYa.jpeg', 'Logo image')

    console.log('\n🎉 API GET tests completed!')
  } catch (error) {
    console.error('💥 API test suite failed:', error)
  } finally {
    // Kill the server process
    server.kill()
    console.log('🛑 Server stopped')
  }
}

// Run the API tests
runAPITests().catch(console.error)
