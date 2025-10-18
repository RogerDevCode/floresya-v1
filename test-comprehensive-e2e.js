/**
 * Comprehensive E2E Test Script
 * Tests all critical aspects mentioned by the user
 */

import request from 'supertest'
import app from './api/app.js'

const BASE_URL = 'http://localhost:3000'

async function testErrorTypeConsistency() {
  console.log('🔍 Testing Error Type Consistency (PascalCase)')
  console.log('============================================')

  try {
    // Test ValidationError consistency
    const validationResponse = await request(app).post('/api/users').send({
      email: 'invalid-email',
      full_name: ''
    })

    console.log(`ValidationError test - Status: ${validationResponse.status}`)
    console.log(`Error type returned: "${validationResponse.body.error}"`)

    if (validationResponse.body.error === 'ValidationError') {
      console.log('✅ ValidationError returns "ValidationError" (PascalCase)')
    } else {
      console.log(
        `❌ ValidationError returns "${validationResponse.body.error}" (should be ValidationError)`
      )
      return false
    }

    // Test NotFoundError consistency
    const notFoundResponse = await request(app).get('/api/users/999999')

    console.log(`NotFoundError test - Status: ${notFoundResponse.status}`)
    console.log(`Error type returned: "${notFoundResponse.body.error}"`)

    if (notFoundResponse.body.error === 'NotFoundError') {
      console.log('✅ NotFoundError returns "NotFoundError" (PascalCase)')
    } else {
      console.log(
        `❌ NotFoundError returns "${notFoundResponse.body.error}" (should be NotFoundError)`
      )
      return false
    }

    return true
  } catch (error) {
    console.log(`❌ Error consistency test failed: ${error.message}`)
    return false
  }
}

async function testCreateResponsePattern() {
  console.log('\n🔍 Testing createResponse() Pattern Usage')
  console.log('========================================')

  try {
    // Test successful user creation
    const newUser = {
      email: `test${Date.now()}@example.com`,
      full_name: 'Test User',
      phone: '+56987654321',
      password_hash: 'password123'
    }

    const createResponse = await request(app).post('/api/users').send(newUser)

    console.log(`Create user - Status: ${createResponse.status}`)

    // Check response structure
    const hasSuccess = createResponse.body.hasOwnProperty('success')
    const hasData = createResponse.body.hasOwnProperty('data')
    const hasMessage = createResponse.body.hasOwnProperty('message')

    console.log(`Response has 'success': ${hasSuccess}`)
    console.log(`Response has 'data': ${hasData}`)
    console.log(`Response has 'message': ${hasMessage}`)

    if (hasSuccess && hasData && hasMessage) {
      console.log('✅ createResponse() pattern used correctly')
      return true
    } else {
      console.log('❌ createResponse() pattern not used correctly')
      return false
    }
  } catch (error) {
    console.log(`❌ createResponse pattern test failed: ${error.message}`)
    return false
  }
}

async function testHTTPStatusCodes() {
  console.log('\n🔍 Testing HTTP Status Codes')
  console.log('============================')

  try {
    // Test POST (201 Created)
    const newUser = {
      email: `status${Date.now()}@example.com`,
      full_name: 'Status Test User',
      phone: '+56987654321',
      password_hash: 'password123'
    }

    const postResponse = await request(app).post('/api/users').send(newUser)

    console.log(`POST /api/users - Status: ${postResponse.status} (expected: 201)`)

    if (postResponse.status === 201) {
      console.log('✅ POST returns 201 (Created)')
      // Clean up created user
      if (postResponse.body.data && postResponse.body.data.id) {
        await request(app)
          .delete(`/api/users/${postResponse.body.data.id}`)
          .set('Authorization', 'Bearer admin-token')
      }
    } else {
      console.log(`❌ POST returns ${postResponse.status} (should be 201)`)
      return false
    }

    // Test GET (200 OK)
    const getResponse = await request(app)
      .get('/api/users/1')
      .set('Authorization', 'Bearer admin-token')

    console.log(`GET /api/users/1 - Status: ${getResponse.status} (expected: 200 or 404)`)

    if (getResponse.status === 200 || getResponse.status === 404) {
      console.log('✅ GET returns appropriate status code')
    } else {
      console.log(`❌ GET returns ${getResponse.status} (should be 200 or 404)`)
      return false
    }

    return true
  } catch (error) {
    console.log(`❌ HTTP status codes test failed: ${error.message}`)
    return false
  }
}

async function testAllControllers() {
  console.log('\n🔍 Testing All Controllers Integration')
  console.log('=====================================')

  const controllers = [
    { name: 'Users', endpoints: ['/api/users', '/api/users/1'] },
    { name: 'Products', endpoints: ['/api/products', '/api/products/1'] },
    { name: 'Orders', endpoints: ['/api/orders', '/api/orders/1'] },
    { name: 'Occasions', endpoints: ['/api/occasions', '/api/occasions/1'] },
    { name: 'Payment Methods', endpoints: ['/api/payment-methods', '/api/payment-methods/1'] }
  ]

  let allControllersWorking = true

  for (const controller of controllers) {
    console.log(`\n📋 Testing ${controller.name} Controller:`)

    for (const endpoint of controller.endpoints) {
      try {
        let response

        if (endpoint.includes('/1') || endpoint.includes('/1/')) {
          // GET request for specific resource
          response = await request(app).get(endpoint)
        } else {
          // GET request for list
          response = await request(app).get(endpoint)
        }

        console.log(`   ${endpoint} - Status: ${response.status}`)

        if (response.status >= 200 && response.status < 500) {
          console.log(`   ✅ ${controller.name} endpoint responding`)
        } else {
          console.log(`   ❌ ${controller.name} endpoint error: ${response.status}`)
          allControllersWorking = false
        }
      } catch (error) {
        console.log(`   ❌ ${controller.name} endpoint failed: ${error.message}`)
        allControllersWorking = false
      }
    }
  }

  return allControllersWorking
}

async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive E2E Tests')
  console.log('===================================')

  const results = {
    errorConsistency: await testErrorTypeConsistency(),
    responsePattern: await testCreateResponsePattern(),
    httpStatusCodes: await testHTTPStatusCodes(),
    controllersIntegration: await testAllControllers()
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 COMPREHENSIVE TEST RESULTS')
  console.log('='.repeat(50))

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} - ${test}`)
  })

  const allPassed = Object.values(results).every(Boolean)

  if (allPassed) {
    console.log('\n🎉 ALL COMPREHENSIVE TESTS PASSED!')
    console.log('✅ System is ready for production')
  } else {
    console.log('\n❌ SOME TESTS FAILED!')
    console.log('🔧 Issues need to be addressed before production')
  }

  console.log('='.repeat(50))

  return allPassed
}

// Run all tests
runComprehensiveTests().catch(console.error)
