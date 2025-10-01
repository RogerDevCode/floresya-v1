/**
 * Product Cleanup Script
 * Cleans up test products created during testing
 */

import dotenv from 'dotenv'
import {
  getAllProducts,
  deleteProduct as softDeleteProduct
} from './src/services/productService.js'

dotenv.config({ path: '.env.local' })

async function cleanupTestProducts() {
  console.log('🧹 Starting product cleanup...\n')

  try {
    // Get all products
    const allProducts = await getAllProducts()
    console.log(`🔍 Found ${allProducts.length} total products`)

    // Find and delete test products
    const testProducts = allProducts.filter(
      product =>
        product.name.includes('Test Product - FloresYa CRUD Test') ||
        product.name.includes('API Test Product - FloresYa CRUD Test') ||
        product.sku.includes('TEST-') ||
        product.sku.includes('API-TEST-')
    )

    console.log(`🗑️  Found ${testProducts.length} test products to clean up\n`)

    for (const product of testProducts) {
      console.log(`🗑️  Deleting test product ID ${product.id}: ${product.name}`)
      const deletedProduct = await softDeleteProduct(product.id)
      console.log(`  ✅ Product ${deletedProduct.id} marked as inactive`)
    }

    console.log(`\n✅ Cleanup completed! ${testProducts.length} test products deleted.`)

    // Verify cleanup
    const remainingProducts = await getAllProducts()
    console.log(`📋 Remaining active products: ${remainingProducts.length}`)
  } catch (error) {
    console.error('💥 Cleanup failed:', error)
    throw error
  }
}

// Run cleanup
cleanupTestProducts().catch(console.error)
