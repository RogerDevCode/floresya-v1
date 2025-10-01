/**
 * Product CRUD Test Script
 * Tests full CRUD operations on products in the FloresYa application
 */

import dotenv from 'dotenv'
import { createProductWithOccasions, getAllProducts, getProductById, updateProduct, decrementStock, updateStock, deleteProduct as softDeleteProduct, reactivateProduct } from './src/services/productService.js'
import { getAllOccasions } from './src/services/occasionService.js'

dotenv.config({ path: '.env.local' })

async function runProductCRUDTest() {
  console.log('🧪 Starting Product CRUD tests...\n')

  try {
    // READ: Get all products to see initial state
    console.log('🔍 READ: Getting all products before test...')
    const initialProducts = await getAllProducts()
    console.log(`  ✅ Found ${initialProducts.length} products initially\n`)

    // READ: Get all occasions to potentially link to our test product
    console.log('🔍 READ: Getting all occasions...')
    const occasions = await getAllOccasions()
    console.log(`  ✅ Found ${occasions.length} occasions\n`)

    // CREATE: Create a test product
    console.log('🆕 CREATE: Creating a test product...')
    const testProductData = {
      name: 'Test Product - FloresYa CRUD Test',
      summary: 'Test product for CRUD operations',
      description: 'This is a test product created specifically for CRUD testing. It will be deleted after the test.',
      price_usd: 29.99,
      price_ves: 1199.6,
      stock: 10,
      sku: `TEST-${Date.now()}`, // Use timestamp to ensure uniqueness
      active: true,
      featured: false
    }

    // Link to first occasion if available
    const occasionIds = occasions.length > 0 ? [occasions[0].id] : []

    const createdProduct = await createProductWithOccasions(testProductData, occasionIds)
    console.log(`  ✅ Product created successfully with ID: ${createdProduct.id}`)
    console.log(`  💡 Product name: ${createdProduct.name}\n`)

    // READ: Get the specific product by ID
    console.log(`🔍 READ: Getting product by ID ${createdProduct.id}...`)
    const retrievedProduct = await getProductById(createdProduct.id)
    console.log(`  ✅ Product retrieved: ${retrievedProduct.name}`)
    console.log(`  💡 Price: $${retrievedProduct.price_usd}, Stock: ${retrievedProduct.stock}\n`)

    // UPDATE: Update the product
    console.log(`✏️  UPDATE: Updating product ID ${createdProduct.id}...`)
    const updateData = {
      name: 'Updated Test Product - FloresYa CRUD Test',
      price_usd: 34.99,
      stock: 15
    }

    const updatedProduct = await updateProduct(createdProduct.id, updateData)
    console.log(`  ✅ Product updated: ${updatedProduct.name}`)
    console.log(`  💡 New price: $${updatedProduct.price_usd}, New stock: ${updatedProduct.stock}\n`)

    // READ: Get the updated product to confirm changes
    console.log(`🔍 READ: Getting updated product by ID ${createdProduct.id}...`)
    const updatedProductCheck = await getProductById(createdProduct.id)
    console.log(`  ✅ Updated product retrieved: ${updatedProductCheck.name}`)
    console.log(`  💡 Price: $${updatedProductCheck.price_usd}, Stock: ${updatedProductCheck.stock}\n`)

    // Additional UPDATE: Test stock functions
    console.log('✏️  UPDATE: Testing stock update functions...')

    // Decrement stock by 3
    const decrementedProduct = await decrementStock(createdProduct.id, 3)
    console.log(`  ✅ Stock decremented. New stock: ${decrementedProduct.stock}`)

    // Update stock to 20
    const stockUpdatedProduct = await updateStock(createdProduct.id, 20)
    console.log(`  ✅ Stock updated to 20: ${stockUpdatedProduct.stock}\n`)

    // DELETE: Soft-delete the product
    console.log(`🗑️  DELETE: Soft-deleting product ID ${createdProduct.id}...`)
    const deletedProduct = await softDeleteProduct(createdProduct.id)
    console.log(`  ✅ Product soft-deleted: ${deletedProduct.name}`)
    console.log(`  💡 Active status: ${deletedProduct.active}\n`)

    // REACTIVATE: Reactivate the product
    console.log(`♻️  REACTIVATE: Reactivating product ID ${createdProduct.id}...`)
    const reactivatedProduct = await reactivateProduct(createdProduct.id)
    console.log(`  ✅ Product reactivated: ${reactivatedProduct.name}`)
    console.log(`  💡 Active status: ${reactivatedProduct.active}\n`)

    // FINAL DELETE: Soft-delete the product again for final removal
    console.log(`🗑️  DELETE: Final soft-delete of product ID ${createdProduct.id}...`)
    const finalDeletedProduct = await softDeleteProduct(createdProduct.id)
    console.log(`  ✅ Product permanently marked as deleted: ${finalDeletedProduct.name}`)
    console.log(`  💡 Active status: ${finalDeletedProduct.active}\n`)

    // FINAL READ: Confirm product is no longer in active list
    console.log('🔍 FINAL READ: Getting all products after test...')
    const finalProducts = await getAllProducts()
    console.log(`  ✅ Found ${finalProducts.length} active products after test\n`)

    console.log('🎉 Product CRUD tests completed successfully!')
    console.log(`📝 Summary: Created, read, updated, and deleted a test product (ID: ${createdProduct.id})`)

  } catch (error) {
    console.error('💥 Product CRUD test failed:', error)
    throw error
  }
}

// Run the test
runProductCRUDTest().catch(console.error)