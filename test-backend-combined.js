/**
 * Comprehensive Backend Testing Script
 * Validates product endpoints and ensures data reliability across different scenarios
 */

import dotenv from 'dotenv'
dotenv.config()

// Define test cases with different parameters
const TEST_CASES = [
  {
    name: 'Get all products with no filters',
    endpoint: '/api/products',
    method: 'GET',
    expectedStatus: 200,
    description: 'Should return all active products'
  },
  {
    name: 'Get products with small image size',
    endpoint: '/api/products?imageSize=small',
    method: 'GET',
    expectedStatus: 200,
    description: 'Should return products with small images attached'
  },
  {
    name: 'Get products with medium image size',
    endpoint: '/api/products?imageSize=medium',
    method: 'GET',
    expectedStatus: 200,
    description: 'Should return products with medium images attached'
  },
  {
    name: 'Get products with invalid image size',
    endpoint: '/api/products?imageSize=invalid',
    method: 'GET',
    expectedStatus: 200, // Should still work but not attach images
    description: 'Should work with invalid size parameter (fallback to default)'
  },
  {
    name: 'Get products with filtering',
    endpoint: '/api/products?featured=true&limit=5',
    method: 'GET',
    expectedStatus: 200,
    description: 'Should return featured products with limit'
  },
  {
    name: 'Get specific product by ID',
    endpoint: '/api/products/83',
    method: 'GET',
    expectedStatus: 200,
    description: 'Should return specific product'
  },
  {
    name: 'Get specific product with image size',
    endpoint: '/api/products/83?imageSize=small',
    method: 'GET',
    expectedStatus: 200,
    description: 'Should return product with small image attached'
  },
  {
    name: 'Get carousel products',
    endpoint: '/api/products/carousel',
    method: 'GET',
    expectedStatus: 200,
    description: 'Should return carousel products with small images'
  },
  {
    name: 'Get non-existent product',
    endpoint: '/api/products/999999',
    method: 'GET',
    expectedStatus: 404,
    description: 'Should return 404 for non-existent product'
  },
  {
    name: 'Get product with invalid ID',
    endpoint: '/api/products/invalid',
    method: 'GET',
    expectedStatus: 400,
    description: 'Should return 400 for invalid product ID'
  },
  {
    name: 'Get product images by size',
    endpoint: '/api/products/83/images?size=small',
    method: 'GET',
    expectedStatus: 200,
    description: 'Should return product images filtered by size'
  },
  {
    name: 'Get primary image',
    endpoint: '/api/products/83/images/primary',
    method: 'GET',
    expectedStatus: 200,
    description: 'Should return primary image for product'
  }
]

let totalTests = 0
let passedTests = 0
let failedTests = 0

console.log('🚀 Starting Backend Reliability Tests\n')

async function runTest(testCase) {
  totalTests++
  console.log(`\n🔍 Test: ${testCase.name}`)
  console.log(`   Description: ${testCase.description}`)
  console.log(`   Endpoint: ${testCase.endpoint}`)

  try {
    const response = await fetch(`http://localhost:3000${testCase.endpoint}`)
    const data = await response.json()

    if (response.status === testCase.expectedStatus) {
      console.log(`   ✅ Status: ${response.status} (Expected: ${testCase.expectedStatus})`)

      // Additional validations based on endpoint
      if (testCase.endpoint.includes('/api/products/carousel')) {
        if (Array.isArray(data.data) && data.data.length > 0) {
          const hasImages = data.data.every(p => p.image_url_small)
          if (hasImages) {
            console.log(`   ✅ Carousel: All products have small images`)
          } else {
            console.log(`   ⚠️ Carousel: Some products missing image_url_small`)
          }
        } else {
          console.log(`   ⚠️ Carousel: Expected array with products, got ${typeof data.data}`)
        }
      }

      if (testCase.endpoint.includes('?imageSize=')) {
        const imageSize = new URLSearchParams(
          new URL(`http://localhost:3000${testCase.endpoint}`).search
        ).get('imageSize')
        if (imageSize && ['thumb', 'small', 'medium', 'large'].includes(imageSize)) {
          const hasCorrectImage =
            data.data &&
            (Array.isArray(data.data)
              ? data.data.every(p => p[`image_url_${imageSize}`] !== undefined)
              : data.data[`image_url_${imageSize}`] !== undefined)
          if (hasCorrectImage) {
            console.log(`   ✅ Image Size: Products have image_url_${imageSize} field`)
          } else {
            console.log(`   ⚠️ Image Size: Products missing image_url_${imageSize} field`)
          }
        }
      }

      passedTests++
      console.log(`   🟢 PASSED`)
    } else {
      console.log(`   ❌ Status: ${response.status} (Expected: ${testCase.expectedStatus})`)
      console.log(`   🟠 FAILED: ${data.message || data.error || 'Unknown error'}`)
      failedTests++
    }
  } catch (error) {
    console.log(`   🛑 ERROR: ${error.message}`)
    failedTests++
  }
}

async function runHealthCheck() {
  console.log('\n🏥 Running health check...')
  try {
    const response = await fetch('http://localhost:3000/health')
    const health = await response.json()

    if (health.success) {
      console.log('   ✅ Health check: Server is running')
      return true
    } else {
      console.log('   ❌ Health check failed')
      return false
    }
  } catch (error) {
    console.log(`   🛑 Health check error: ${error.message}`)
    return false
  }
}

async function runTests() {
  // First check if server is running
  const isHealthy = await runHealthCheck()
  if (!isHealthy) {
    console.log('\n❌ Server is not running. Please start it first.')
    return
  }

  // Run all test cases
  for (const testCase of TEST_CASES) {
    await runTest(testCase)
  }

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST RESULTS SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total Tests: ${totalTests}`)
  console.log(`Passed: ${passedTests}`)
  console.log(`Failed: ${failedTests}`)
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`)

  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! Backend is reliable and functioning correctly.')
  } else {
    console.log(`\n⚠️ ${failedTests} test(s) failed. Please review the issues above.`)
  }

  console.log('='.repeat(60))

  // Additional data consistency checks
  console.log('\n🔍 Running Data Consistency Checks...')
  await runDataConsistencyChecks()
}

async function runDataConsistencyChecks() {
  try {
    // Test carousel consistency
    const carouselResponse = await fetch('http://localhost:3000/api/products/carousel')
    const carouselData = await carouselResponse.json()

    if (carouselResponse.status === 200 && Array.isArray(carouselData.data)) {
      console.log(`   ✅ Carousel: ${carouselData.data.length} products returned`)

      // Check that all carousel products have required fields
      const hasRequiredFields = carouselData.data.every(
        p => p.id && p.name && p.image_url_small && p.carousel_order !== undefined
      )

      if (hasRequiredFields) {
        console.log(`   ✅ Carousel: All products have required fields`)
      } else {
        console.log(`   ❌ Carousel: Some products missing required fields`)
      }

      // Check that carousel order is properly set
      const hasValidOrder = carouselData.data.every(
        p => typeof p.carousel_order === 'number' && p.carousel_order >= 1 && p.carousel_order <= 7
      )

      if (hasValidOrder) {
        console.log(`   ✅ Carousel: All products have valid carousel_order (1-7)`)
      } else {
        console.log(`   ❌ Carousel: Some products have invalid carousel_order`)
      }
    } else {
      console.log(`   ❌ Carousel: Unexpected response format`)
    }

    // Test image size consistency
    console.log(`\n   Testing image size consistency...`)
    const productWithSmall = await fetch('http://localhost:3000/api/products/83?imageSize=small')
    const productWithSmallData = await productWithSmall.json()

    if (productWithSmall.status === 200 && productWithSmallData.data) {
      if (productWithSmallData.data.image_url_small) {
        console.log(`   ✅ Product with small image: Field present`)
      } else {
        console.log(`   ❌ Product with small image: Field missing`)
      }
    }

    const productWithMedium = await fetch('http://localhost:3000/api/products/83?imageSize=medium')
    const productWithMediumData = await productWithMedium.json()

    if (productWithMedium.status === 200 && productWithMediumData.data) {
      if (productWithMediumData.data.image_url_medium) {
        console.log(`   ✅ Product with medium image: Field present`)
      } else {
        console.log(`   ❌ Product with medium image: Field missing`)
      }
    }

    // Test that products without specific image size still return properly
    const regularProduct = await fetch('http://localhost:3000/api/products/83')
    const _regularProductData = await regularProduct.json()

    if (regularProduct.status === 200) {
      console.log(`   ✅ Regular product request: Works without image size parameter`)
    } else {
      console.log(`   ❌ Regular product request: Failed`)
    }
  } catch (error) {
    console.log(`   🛑 Data consistency check error: ${error.message}`)
  }
}

// Start the tests
runTests()
