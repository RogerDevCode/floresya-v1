/**
 * @file Seed Product Prices
 * @description Populate products with random prices for testing sort filters
 */

import { api } from '../api/index.js'
import logger from '../config/logger.js'

const MIN_PRICE = 20
const MAX_PRICE = 150
const MIN_RATING = 3.5
const MAX_RATING = 5.0

async function seedPrices() {
  try {
    logger.info('🌱 Starting price seeding...')

    // Get all active products
    const result = await api.products.getAll({ limit: 1000 })
    const products = result.data

    logger.info(`📦 Found ${products.length} products to update`)

    let updated = 0
    let failed = 0

    for (const product of products) {
      try {
        // Generate random price and rating
        const price = parseFloat((Math.random() * (MAX_PRICE - MIN_PRICE) + MIN_PRICE).toFixed(2))
        const rating = parseFloat(
          (Math.random() * (MAX_RATING - MIN_RATING) + MIN_RATING).toFixed(1)
        )

        // Update product
        await api.products.update(product.id, {
          price,
          base_price: price, // Set base_price same as price
          rating
        })

        updated++
        logger.info(`✅ Updated product ${product.id} (${product.name}): $${price}, ⭐${rating}`)
      } catch (error) {
        failed++
        logger.error(`❌ Failed to update product ${product.id}:`, error.message)
      }
    }

    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    logger.info(`✅ Price seeding complete!`)
    logger.info(`   Updated: ${updated}`)
    logger.info(`   Failed: ${failed}`)
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  } catch (error) {
    logger.error('❌ Price seeding failed:', error)
    process.exit(1)
  }
}

seedPrices()
