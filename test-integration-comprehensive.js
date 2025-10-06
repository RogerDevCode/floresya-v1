/**
 * Comprehensive Integration Test Suite
 * Validates end-to-end functionality and data reliability
 */

import dotenv from 'dotenv'
dotenv.config()

console.log('🚀 Running Comprehensive Integration Tests\n')

async function runIntegrationTests() {
  console.log('🏥 Health Check...')
  try {
    const healthResponse = await fetch('http://localhost:3000/health')
    const health = await healthResponse.json()
    if (health.success) {
      console.log('   ✅ Server health: OK')
    } else {
      console.log('   ❌ Server health: FAILED')
      return
    }
  } catch (error) {
    console.log(`   ❌ Server health: Error - ${error.message}`)
    return
  }

  console.log('\n🔍 Testing Product Operations...')

  // Test 1: Get all products without image size (backward compatibility)
  console.log('\n   Test 1: Get products without image size (backward compatibility)')
  try {
    const response = await fetch('http://localhost:3000/api/products?limit=3')
    const data = await response.json()

    if (response.status === 200 && Array.isArray(data.data) && data.data.length > 0) {
      console.log(`   ✅ Products retrieved: ${data.data.length}`)

      // Verify no image_url_* fields are added when imageSize is not specified
      const product = data.data[0]
      const hasImageFields = Object.keys(product).some(key => key.startsWith('image_url_'))
      if (!hasImageFields) {
        console.log(
          '   ✅ No image fields added when imageSize not specified (backward compatibility)'
        )
      } else {
        console.log(
          `   ⚠️ Image fields present: ${Object.keys(product)
            .filter(k => k.startsWith('image_url_'))
            .join(', ')}`
        )
      }
    } else {
      console.log(`   ❌ Failed to get products: ${response.status}`)
    }
  } catch (error) {
    console.log(`   ❌ Error getting products: ${error.message}`)
  }

  // Test 2: Get products with image size
  console.log('\n   Test 2: Get products with image size')
  try {
    const response = await fetch('http://localhost:3000/api/products?limit=3&imageSize=small')
    const data = await response.json()

    if (response.status === 200 && Array.isArray(data.data) && data.data.length > 0) {
      console.log(`   ✅ Products with images: ${data.data.length}`)

      // Verify image_url_small fields are added
      const product = data.data[0]
      if (product.image_url_small !== undefined) {
        console.log('   ✅ image_url_small field present')
        if (product.image_url_small) {
          console.log(`   ✅ Image URL: ${product.image_url_small.substring(0, 50)}...`)
        } else {
          console.log('   ⚠️ Image URL is null (product may not have this image size)')
        }
      } else {
        console.log('   ❌ image_url_small field missing')
      }
    } else {
      console.log(`   ❌ Failed to get products with images: ${response.status}`)
    }
  } catch (error) {
    console.log(`   ❌ Error getting products with images: ${error.message}`)
  }

  // Test 3: Get single product with and without image size
  console.log('\n   Test 3: Single product consistency')
  try {
    const response1 = await fetch('http://localhost:3000/api/products/83')
    const data1 = await response1.json()

    const response2 = await fetch('http://localhost:3000/api/products/83?imageSize=medium')
    const data2 = await response2.json()

    if (response1.status === 200 && response2.status === 200 && data1.data && data2.data) {
      if (data1.data.id === data2.data.id && data1.data.name === data2.data.name) {
        console.log('   ✅ Product details consistent across requests')

        // Check that the second response has the image field
        if (data2.data.image_url_medium !== undefined) {
          console.log('   ✅ Image field added to single product request')
        } else {
          console.log('   ❌ Image field missing from single product request')
        }
      } else {
        console.log('   ❌ Product details inconsistent')
      }
    } else {
      console.log(`   ❌ Failed to get product: ${response1.status}, ${response2.status}`)
    }
  } catch (error) {
    console.log(`   ❌ Error testing single product: ${error.message}`)
  }

  // Test 4: Carousel functionality
  console.log('\n   Test 4: Carousel functionality')
  try {
    const response = await fetch('http://localhost:3000/api/products/carousel')
    const data = await response.json()

    if (response.status === 200 && Array.isArray(data.data) && data.data.length > 0) {
      console.log(`   ✅ Carousel products: ${data.data.length}`)

      // Verify all carousel products have required fields
      const allValid = data.data.every(
        product =>
          product.id &&
          product.name &&
          typeof product.carousel_order === 'number' &&
          product.image_url_small // Carousel should include small images
      )

      if (allValid) {
        console.log('   ✅ All carousel products have required fields')
      } else {
        console.log('   ❌ Some carousel products missing required fields')
      }

      // Check carousel order validity
      const validOrders = data.data.every(p => p.carousel_order >= 1 && p.carousel_order <= 7)

      if (validOrders) {
        console.log('   ✅ All carousel products have valid carousel_order')
      } else {
        console.log('   ❌ Some carousel products have invalid carousel_order')
      }
    } else {
      console.log(`   ❌ Carousel failed: ${response.status}`)
    }
  } catch (error) {
    console.log(`   ❌ Error testing carousel: ${error.message}`)
  }

  // Test 5: Error handling
  console.log('\n   Test 5: Error handling')
  try {
    // Test invalid product ID
    const invalidResponse = await fetch('http://localhost:3000/api/products/999999')
    if (invalidResponse.status === 404) {
      console.log('   ✅ Invalid product ID properly returns 404')
    } else {
      console.log(`   ❌ Invalid product ID: Expected 404, got ${invalidResponse.status}`)
    }

    // Test invalid image size
    const invalidSizeResponse = await fetch('http://localhost:3000/api/products?imageSize=invalid')
    if (invalidSizeResponse.status === 422) {
      console.log('   ✅ Invalid image size properly returns 422')
    } else {
      console.log(`   ❌ Invalid image size: Expected 422, got ${invalidSizeResponse.status}`)
    }

    // Test invalid product ID format
    const invalidFormatResponse = await fetch('http://localhost:3000/api/products/invalid')
    if (invalidFormatResponse.status === 400) {
      console.log('   ✅ Invalid ID format properly returns 400')
    } else {
      console.log(`   ❌ Invalid ID format: Expected 400, got ${invalidFormatResponse.status}`)
    }
  } catch (error) {
    console.log(`   ❌ Error testing error handling: ${error.message}`)
  }

  // Test 6: Performance - batch operations
  console.log('\n   Test 6: Performance with batch operations')
  try {
    // Get multiple products with images - should be efficient
    const startTime = Date.now()
    const response = await fetch('http://localhost:3000/api/products?limit=10&imageSize=small')
    const data = await response.json()
    const duration = Date.now() - startTime

    if (response.status === 200 && Array.isArray(data.data)) {
      console.log(`   ✅ Batch operation: ${data.data.length} products in ${duration}ms`)

      if (duration < 2000) {
        // Should complete in under 2 seconds
        console.log('   ✅ Performance within acceptable range')
      } else {
        console.log(`   ⚠️ Performance might be slow: ${duration}ms`)
      }
    } else {
      console.log(`   ❌ Batch operation failed: ${response.status}`)
    }
  } catch (error) {
    console.log(`   ❌ Error testing performance: ${error.message}`)
  }

  console.log('\n🎯 Integration Tests Completed!')
}

runIntegrationTests()
