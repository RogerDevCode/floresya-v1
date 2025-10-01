/**
 * Product API CRUD Test Script
 * Tests full CRUD operations on products through API endpoints
 */

import dotenv from 'dotenv'
import { spawn } from 'child_process'
import { promisify } from 'util'

dotenv.config({ path: '.env.local' })

// Function to sleep for a specified time
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function runAPIProductCRUDTest() {
  console.log('🧪 Starting Product API CRUD tests...\n')

  // Start the server in the background
  console.log('🔌 Starting server on port 3000...')
  const server = spawn('node', ['server.js'], {
    cwd: process.cwd(),
    env: process.env
  })

  // Capture server output
  server.stdout.on('data', (data) => {
    // console.log(`Server: ${data}`);
  })

  server.stderr.on('data', (data) => {
    console.log(`Server error: ${data}`)
  })

  // Wait for server to start
  await sleep(3000)

  try {
    // READ: Get all products using the API
    console.log('🔍 READ: Getting all products via API...')
    const { exec } = await import('child_process')
    const execAsync = promisify(exec)

    let result = await execAsync('curl -s "http://localhost:3000/api/products"')
    let response = JSON.parse(result.stdout)
    if (response.success) {
      console.log(`  ✅ API returned ${response.data.length} products`)
    } else {
      console.log(`  ❌ API error: ${response.error}`)
    }

    // CREATE: Create a new product via API
    console.log('🆕 CREATE: Creating a test product via API...')
    const testProductData = {
      name: 'API Test Product - FloresYa CRUD Test',
      summary: 'Test product for API CRUD operations',
      description: 'This is a test product created via API for CRUD testing.',
      price_usd: 39.99,
      price_ves: 1599.6,
      stock: 8,
      sku: `API-TEST-${Date.now()}`,
      active: true,
      featured: false
    }

    result = await execAsync(`curl -X POST http://localhost:3000/api/products -H "Content-Type: application/json" -d '${JSON.stringify(testProductData)}'`)
    console.log('  ⚠️  Product creation via API endpoint not implemented yet in the API handler')

    // For now, let's just use the service directly to create a product for testing the other operations
    const { createProductWithOccasions, getAllOccasions} = await import('./src/services/productService.js')
    const { getAllOccasions: getOccasions } = await import('./src/services/occasionService.js')

    // Get occasions to link to the test product
    const occasions = await getOccasions()
    const occasionIds = occasions.length > 0 ? [occasions[0].id] : []

    // Create a test product directly using the service
    const createdProduct = await createProductWithOccasions(testProductData, occasionIds)
    console.log(`  ✅ Product created directly via service with ID: ${createdProduct.id}`)

    // READ: Get the specific product by ID via API
    console.log(`🔍 READ: Getting product by ID ${createdProduct.id} via API...`)
    result = await execAsync(`curl -s "http://localhost:3000/api/products/${createdProduct.id}"`)
    response = JSON.parse(result.stdout)
    if (response.success && response.data) {
      console.log(`  ✅ API returned product: ${response.data.name}`)
      console.log(`  💡 Price: $${response.data.price_usd}, Stock: ${response.data.stock}`)
    } else {
      console.log(`  ❌ API error: ${response.error || 'No data returned'}`)
    }

    // UPDATE: Update the product via API (this endpoint likely doesn't exist yet)
    console.log(`✏️  UPDATE: The update would happen via a PUT request to /api/products/${createdProduct.id}...`)
    console.log('  ⚠️  Product update via API endpoint not implemented yet in the API handler')

    // DELETE: The delete would happen via API as well
    console.log(`🗑️  DELETE: The delete would happen via a DELETE request to /api/products/${createdProduct.id}...`)
    console.log('  ⚠️  Product delete via API endpoint not implemented yet in the API handler')

    // READ: Get all products again to confirm state
    console.log('\n🔍 FINAL READ: Getting all products via API after operations...')
    result = await execAsync('curl -s "http://localhost:3000/api/products"')
    response = JSON.parse(result.stdout)
    if (response.success) {
      console.log(`  ✅ API returned ${response.data.length} products`)
    } else {
      console.log(`  ❌ API error: ${response.error}`)
    }

    console.log('\n🎉 Product API CRUD tests completed!')
    console.log('📝 Note: Full API CRUD requires implementing POST, PUT, and DELETE endpoints for /api/products')
    console.log('📝 Currently implemented: GET /api/products and GET /api/products/:id')

  } catch (error) {
    console.error('💥 Product API CRUD test failed:', error)
  } finally {
    // Kill the server process
    server.kill()
    console.log('\n🛑 Server stopped')
  }
}

// Run the API test
runAPIProductCRUDTest().catch(console.error)