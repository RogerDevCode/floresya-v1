/**
 * Seed Product Prices - Simple version without logger
 */

import fetch from 'node-fetch'

const API_BASE = 'http://localhost:3000/api'
const MIN_PRICE = 25
const MAX_PRICE = 120

async function seedPrices() {
  console.log('🌱 Starting price seeding...')

  try {
    // Get all products
    const response = await fetch(`${API_BASE}/products?limit=100`)
    const result = await response.json()
    const products = result.data

    console.log(`📦 Found ${products.length} products`)

    for (const product of products) {
      const price = parseFloat((Math.random() * (MAX_PRICE - MIN_PRICE) + MIN_PRICE).toFixed(2))
      const rating = parseFloat((Math.random() * 1.5 + 3.5).toFixed(1))

      const updateResponse = await fetch(`${API_BASE}/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price, base_price: price, rating })
      })

      if (updateResponse.ok) {
        console.log(`✅ ${product.id}: $${price}, ⭐${rating}`)
      } else {
        console.log(`❌ Failed: ${product.id}`)
      }
    }

    console.log('\n✅ Seeding complete!')
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

seedPrices()
