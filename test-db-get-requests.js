/**
 * Database GET Requests Test Script
 * Tests all GET endpoints and database tables in the FloresYa application
 */

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import service functions
import {
  getAllProducts,
  getProductById,
  getProductBySku,
  getProductsWithOccasions,
  getProductsByOccasion,
  getCarouselProducts
} from './src/services/productService.js'

import {
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  getOrderStatusHistory
} from './src/services/orderService.js'

import {
  getAllOccasions as getOccasions,
  getOccasionById,
  getOccasionBySlug
} from './src/services/occasionService.js'

import {
  getAllUsers,
  getUserById
} from './src/services/userService.js'

import {
  getOrderStatusHistory as getStatusHistoryByOrder,
  getLatestStatus
} from './src/services/orderStatusService.js'

import {
  getProductImages as getAllProductImages,
  getProductImages
} from './src/services/productImageService.js'

// Test all GET operations
async function runTests() {
  console.log('🧪 Starting database GET requests tests...\n')

  try {
    // Test Product Service
    console.log('🌸 Testing Product Service...')

    // Test getAllProducts
    try {
      const allProducts = await getAllProducts()
      console.log(`  ✅ getAllProducts(): ${allProducts.length} products found`)
    } catch (error) {
      console.log(`  ❌ getAllProducts(): ${error.message}`)
    }

    // Test getCarouselProducts
    try {
      const carouselProducts = await getCarouselProducts()
      console.log(`  ✅ getCarouselProducts(): ${carouselProducts.length} carousel products found`)
    } catch (error) {
      console.log(`  ❌ getCarouselProducts(): ${error.message}`)
    }

    // Test single product by ID (using first product if available)
    try {
      const allProducts = await getAllProducts()
      if (allProducts && allProducts.length > 0) {
        const product = await getProductById(allProducts[0].id)
        console.log(`  ✅ getProductById(): Found product "${product.name}"`)
      } else {
        console.log('  ⚠️  getProductById(): No products to test with')
      }
    } catch (error) {
      console.log(`  ❌ getProductById(): ${error.message}`)
    }

    // Test Product with Occasions
    try {
      const productsWithOccasions = await getProductsWithOccasions()
      console.log(`  ✅ getProductsWithOccasions(): ${productsWithOccasions.length} items found`)
    } catch (error) {
      console.log(`  ❌ getProductsWithOccasions(): ${error.message}`)
    }

    console.log('') // New line

    // Test Occasion Service
    console.log('💐 Testing Occasion Service...')

    try {
      const occasions = await getOccasions()
      console.log(`  ✅ getOccasions(): ${occasions.length} occasions found`)

      // Test getOccasionById (using first occasion if available)
      if (occasions && occasions.length > 0) {
        const occasion = await getOccasionById(occasions[0].id)
        console.log(`  ✅ getOccasionById(): Found occasion "${occasion.name}"`)
      } else {
        console.log('  ⚠️  getOccasionById(): No occasions to test with')
      }
    } catch (error) {
      console.log(`  ❌ getOccasions(): ${error.message}`)
    }

    // Test getOccasionBySlug (using first occasion if available)
    try {
      const occasions = await getOccasions()
      if (occasions && occasions.length > 0) {
        const occasion = await getOccasionBySlug(occasions[0].slug)
        console.log(`  ✅ getOccasionBySlug(): Found occasion "${occasion.name}"`)
      } else {
        console.log('  ⚠️  getOccasionBySlug(): No occasions to test with')
      }
    } catch (error) {
      console.log(`  ❌ getOccasionBySlug(): ${error.message}`)
    }

    console.log('') // New line

    // Test Order Service
    console.log('📦 Testing Order Service...')

    try {
      // We'll likely get an error since no user is specified, but let's see
      const orders = await getAllOrders()
      console.log(`  ✅ getAllOrders(): ${orders.length} orders found`)
    } catch (error) {
      console.log(`  ⚠️  getAllOrders(): ${error.message} (Expected if no filter applied)`)
    }

    // Test getOrdersByUser with a sample user ID (will likely fail without a real user ID)
    try {
      // Using a placeholder user ID - this will likely fail but shows the method
      const orders = await getOrdersByUser(1)
      console.log(`  ⚠️  getOrdersByUser(): ${orders.length} orders found (only if user ID 1 exists)`)
    } catch (error) {
      console.log(`  ⚠️  getOrdersByUser(): ${error.message} (Expected without valid user ID)`)
    }

    console.log('') // New line

    // Test User Service
    console.log('👤 Testing User Service...')

    try {
      const users = await getAllUsers()
      console.log(`  ✅ getAllUsers(): ${users.length} users found`)

      // Test getUserById (using first user if available)
      if (users && users.length > 0) {
        const user = await getUserById(users[0].id)
        console.log(`  ✅ getUserById(): Found user "${user.email || user.id}"`)
      } else {
        console.log('  ⚠️  getUserById(): No users to test with')
      }
    } catch (error) {
      console.log(`  ⚠️  getAllUsers(): ${error.message} (Users might not be implemented yet)`)
    }

    console.log('') // New line

    // Test Order Status Service
    console.log('📋 Testing Order Status Service...')

    // Test Status History
    try {
      // This will likely fail without a real order ID
      const statusHistory = await getStatusHistoryByOrder(1)
      console.log(`  ⚠️  getStatusHistoryByOrder(): ${statusHistory.length} history items found`)
    } catch (error) {
      console.log(`  ⚠️  getStatusHistoryByOrder(): ${error.message} (Expected without valid order ID)`)
    }

    try {
      // This will likely fail without a real order ID
      const latestStatus = await getLatestStatus(1)
      console.log('  ⚠️  getLatestStatus(): Latest status retrieved successfully')
    } catch (error) {
      console.log(`  ⚠️  getLatestStatus(): ${error.message} (Expected without valid order ID)`)
    }

    console.log('') // New line

    // Test Product Image Service
    console.log('🖼️  Testing Product Image Service...')

    try {
      // This will likely fail without a real product ID
      const images = await getAllProductImages(1)
      console.log(`  ⚠️  getAllProductImages(): ${images.length} images found for product`)
    } catch (error) {
      console.log(`  ⚠️  getAllProductImages(): ${error.message} (Expected without valid product ID)`)
    }

    // Test Images by Product
    try {
      // This will likely fail without a real product ID
      const images = await getProductImages(1)
      console.log(`  ⚠️  getProductImages(): ${images.length} images found for product`)
    } catch (error) {
      console.log(`  ⚠️  getProductImages(): ${error.message} (Expected without valid product ID)`)
    }

    console.log('\n🎉 All database GET tests completed!')

  } catch (error) {
    console.error('💥 Test suite failed:', error)
  }
}

// Run the tests
runTests()