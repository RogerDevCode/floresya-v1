/**
 * Test Script: Critical User Errors (404 vs 500)
 * Tests the specific endpoints mentioned by the user
 */

import request from 'supertest'
import app from './api/app.js'

const BASE_URL = 'http://localhost:3000'

async function testCriticalUserErrors() {
  console.log('🔍 Testing Critical User Errors (404 vs 500)')
  console.log('============================================')

  const testCases = [
    {
      method: 'PATCH',
      endpoint: '/api/users/999999/verify-email',
      description: 'Verify email for non-existent user'
    },
    {
      method: 'PATCH',
      endpoint: '/api/users/999999/reactivate',
      description: 'Reactivate non-existent user'
    }
  ]

  let allTestsPassed = true

  for (const testCase of testCases) {
    try {
      console.log(`\n📋 Testing: ${testCase.description}`)
      console.log(`   ${testCase.method} ${testCase.endpoint}`)

      const startTime = Date.now()

      let response
      if (testCase.method === 'PATCH') {
        response = await request(app).patch(testCase.endpoint).expect(404) // Should return 404, not 500
      }

      const responseTime = Date.now() - startTime

      console.log(`   ✅ Status: ${response.status}`)
      console.log(`   ⏱️  Response time: ${responseTime}ms`)
      console.log(`   📦 Response body:`, JSON.stringify(response.body, null, 2))

      // Verify error type consistency
      if (response.body.error === 'NotFoundError') {
        console.log(`   ✅ Error type: ${response.body.error} (PascalCase)`)
      } else {
        console.log(`   ❌ Error type: ${response.body.error} (should be NotFoundError)`)
        allTestsPassed = false
      }

      // Verify it's not a 500 error
      if (response.status !== 500) {
        console.log(`   ✅ Correct HTTP status: ${response.status} (not 500)`)
      } else {
        console.log(`   ❌ Wrong HTTP status: ${response.status} (should be 404)`)
        allTestsPassed = false
      }
    } catch (error) {
      console.log(`   ❌ Test failed: ${error.message}`)
      allTestsPassed = false
    }
  }

  console.log('\n' + '='.repeat(50))
  if (allTestsPassed) {
    console.log('🎉 All critical user error tests PASSED!')
    console.log('✅ 404 errors returned correctly')
    console.log('✅ Error types are consistent (PascalCase)')
    console.log('✅ No 500 errors found')
  } else {
    console.log('❌ Some tests FAILED!')
    console.log('🔧 Issues found that need to be addressed')
  }
  console.log('='.repeat(50))

  return allTestsPassed
}

// Run the tests
testCriticalUserErrors().catch(console.error)
