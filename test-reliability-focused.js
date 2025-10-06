/**
 * Focused Reliability Tests for Product Image Functionality
 * Tests the specific functionality added around image size parameters
 */

import dotenv from 'dotenv'
dotenv.config()

console.log('🧪 Running Focused Reliability Tests for Product Image Functionality\n')

let testCount = 0
let passedCount = 0
let failedCount = 0

async function runTest(name, testFunction) {
  testCount++
  try {
    console.log(`\n🔍 ${name}`)
    await testFunction()
    console.log(`   ✅ PASSED`)
    passedCount++
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`)
    failedCount++
  }
}

// Test the product carousel functionality specifically
async function testCarousel() {
  const response = await fetch('http://localhost:3000/api/products/carousel')
  const data = await response.json()

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${data.message}`)
  }

  if (!Array.isArray(data.data) || data.data.length === 0) {
    throw new Error(`Expected array of products, got ${typeof data.data}`)
  }

  // All carousel products should have image_url_small
  const allHaveImages = data.data.every(
    product => product.image_url_small && typeof product.image_url_small === 'string'
  )

  if (!allHaveImages) {
    throw new Error('Not all carousel products have image_url_small')
  }

  console.log(`   📦 Carousel: ${data.data.length} products with images`)
}

// Test image size parameter functionality
async function testImageSizeParameter() {
  // Test with valid image sizes
  const sizes = ['small', 'medium', 'large', 'thumb']

  for (const size of sizes) {
    const response = await fetch(`http://localhost:3000/api/products?limit=1&imageSize=${size}`)
    const data = await response.json()

    if (response.status !== 200) {
      throw new Error(`Size ${size}: Expected 200, got ${response.status}`)
    }

    // Check that the response includes the expected image field
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      const hasImageField = data.data[0][`image_url_${size}`] !== undefined
      if (!hasImageField) {
        console.log(
          `   ⚠️ Size ${size}: Product doesn't have image_url_${size} field (may not have image)`
        )
      } else {
        console.log(`   ✅ Size ${size}: Product has image_url_${size} field`)
      }
    }
  }
}

// Test single product with image size
async function testSingleProductWithImageSize() {
  const response = await fetch('http://localhost:3000/api/products/83?imageSize=small')
  const data = await response.json()

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`)
  }

  if (!data.data) {
    throw new Error('No product data returned')
  }

  // The product should have an image_url_small field
  if (data.data.image_url_small === undefined) {
    throw new Error('Product does not have image_url_small field')
  }

  console.log(`   🆔 Product 83 has image_url_small: ${!!data.data.image_url_small}`)
}

// Test valid image size validation
async function testValidImageSizeValidation() {
  // Valid sizes should work
  const validSizes = ['small', 'medium', 'large', 'thumb']
  for (const size of validSizes) {
    const response = await fetch(`http://localhost:3000/api/products?limit=1&imageSize=${size}`)
    if (response.status !== 200) {
      const data = await response.json()
      throw new Error(`Valid size ${size} failed: ${response.status} - ${data.message}`)
    }
  }

  console.log(`   ✅ All valid image sizes accepted`)
}

// Test invalid image size validation
async function testInvalidImageSizeValidation() {
  // Invalid sizes should return validation error
  const response = await fetch('http://localhost:3000/api/products?imageSize=invalid')
  if (response.status !== 422) {
    throw new Error(`Expected 422 for invalid size, got ${response.status}`)
  }

  console.log(`   ✅ Invalid image size properly rejected with 422`)
}

// Test data consistency between endpoints
async function testDataConsistency() {
  // Get the same product via different methods and compare
  const response1 = await fetch('http://localhost:3000/api/products/83')
  const data1 = await response1.json()

  const response2 = await fetch('http://localhost:3000/api/products/83?imageSize=small')
  const data2 = await response2.json()

  if (response1.status !== 200 || response2.status !== 200) {
    throw new Error(`One or both requests failed`)
  }

  // Product ID should be the same
  if (data1.data.id !== data2.data.id) {
    throw new Error(`Product IDs don't match: ${data1.data.id} vs ${data2.data.id}`)
  }

  // Basic properties should be the same
  if (data1.data.name !== data2.data.name) {
    throw new Error(`Product names don't match`)
  }

  // Second response should have image_url_small field
  if (data2.data.image_url_small === undefined) {
    throw new Error(`Second response missing image_url_small field`)
  }

  console.log(`   ✅ Data consistency: Product details match across endpoints`)
}

// Run all tests
async function runAllTests() {
  console.log('🏥 Checking server health...')
  try {
    const healthResponse = await fetch('http://localhost:3000/health')
    const health = await healthResponse.json()
    if (!health.success) {
      console.log('❌ Server is not healthy')
      return
    }
    console.log('✅ Server is healthy')
  } catch (error) {
    console.log(`❌ Server health check failed: ${error.message}`)
    return
  }

  await runTest('Carousel functionality with images', testCarousel)
  await runTest('Image size parameter functionality', testImageSizeParameter)
  await runTest('Single product with image size', testSingleProductWithImageSize)
  await runTest('Valid image size validation', testValidImageSizeValidation)
  await runTest('Invalid image size validation', testInvalidImageSizeValidation)
  await runTest('Data consistency across endpoints', testDataConsistency)

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 FOCUSED RELIABILITY TEST RESULTS')
  console.log('='.repeat(60))
  console.log(`Total Tests: ${testCount}`)
  console.log(`Passed: ${passedCount}`)
  console.log(`Failed: ${failedCount}`)
  console.log(`Success Rate: ${((passedCount / testCount) * 100).toFixed(2)}%`)

  if (failedCount === 0) {
    console.log('\n🎉 All focused tests passed! Backend image functionality is reliable.')
  } else {
    console.log(`\n⚠️ ${failedCount} focused test(s) failed.`)
  }

  console.log('='.repeat(60))
}

runAllTests()
