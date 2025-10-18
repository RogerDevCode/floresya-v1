/**
 * Test script to verify Product Image Controller ID validation fixes
 * Tests various invalid ID scenarios to ensure proper HTTP status codes
 */

import http from 'http'

const BASE_URL = 'http://localhost:3000/api'

/**
 * Test cases for invalid IDs
 */
const testCases = [
  // Invalid product IDs
  {
    method: 'GET',
    url: '/products/abc/images',
    expectedStatus: 400,
    description: 'Non-numeric product ID'
  },
  {
    method: 'GET',
    url: '/products/-1/images',
    expectedStatus: 400,
    description: 'Negative product ID'
  },
  { method: 'GET', url: '/products/0/images', expectedStatus: 400, description: 'Zero product ID' },
  {
    method: 'GET',
    url: '/products/1.5/images',
    expectedStatus: 400,
    description: 'Float product ID'
  },

  // Invalid image index
  {
    method: 'DELETE',
    url: '/products/1/images/abc',
    expectedStatus: 400,
    description: 'Non-numeric image index'
  },
  {
    method: 'DELETE',
    url: '/products/1/images/-1',
    expectedStatus: 400,
    description: 'Negative image index'
  },
  {
    method: 'DELETE',
    url: '/products/1/images/0',
    expectedStatus: 400,
    description: 'Zero image index'
  },

  // Valid IDs that don't exist (should return 404, not 500)
  {
    method: 'GET',
    url: '/products/99999/images',
    expectedStatus: 404,
    description: 'Non-existent product ID'
  },
  {
    method: 'DELETE',
    url: '/products/1/images/99',
    expectedStatus: 404,
    description: 'Non-existent image index'
  }
]

/**
 * Execute a test case using native HTTP module
 */
async function runTest(testCase) {
  const { method, url, expectedStatus, description } = testCase

  return new Promise(resolve => {
    console.log(`\n🧪 Testing: ${description}`)
    console.log(`   ${method} ${BASE_URL}${url}`)

    const parsedUrl = new URL(url, BASE_URL)
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const req = http.request(options, res => {
      let data = ''

      res.on('data', chunk => {
        data += chunk
      })

      res.on('end', () => {
        const actualStatus = res.statusCode
        const isSuccess = actualStatus === expectedStatus

        console.log(
          `   Expected: ${expectedStatus}, Got: ${actualStatus} ${isSuccess ? '✅' : '❌'}`
        )

        if (!isSuccess) {
          console.log(`   ❌ FAILED: Expected ${expectedStatus} but got ${actualStatus}`)
          console.log(`   Response: ${data}`)
        }

        resolve(isSuccess)
      })
    })

    req.on('error', error => {
      console.log(`   ❌ ERROR: ${error.message}`)
      resolve(false)
    })

    req.end()
  })
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Product Image Controller ID validation tests...\n')

  let passed = 0
  let failed = 0

  for (const testCase of testCases) {
    const success = await runTest(testCase)
    if (success) {
      passed++
    } else {
      failed++
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`)

  if (failed === 0) {
    console.log('🎉 All tests passed! ID validation is working correctly.')
    process.exit(0)
  } else {
    console.log('💥 Some tests failed. Please check the implementation.')
    process.exit(1)
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error)
}

export { runAllTests, runTest, testCases }
