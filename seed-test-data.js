#!/usr/bin/env node

/**
 * Seed Data Script for Tests
 *
 * This script creates test data for integration and E2E tests.
 * It's designed to be idempotent - can be run multiple times without creating duplicates.
 *
 * Usage: node seed-test-data.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env.local') })

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   SUPABASE_URL:', !!SUPABASE_URL)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_ROLE_KEY)
  process.exit(1)
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Test data constants
const TEST_PREFIX = 'test_'
const TEST_PRODUCTS = [
  {
    name: 'Ramo de Rosas Rojas',
    summary: '12 rosas rojas frescas',
    description:
      'Un ramo elegante de 12 rosas rojas seleccionadas a mano, perfectas para expresar amor y pasión.',
    price_usd: 45.99,
    price_ves: 1839.6,
    stock: 50,
    sku: 'TEST-RR-001',
    active: true,
    featured: true,
    carousel_order: 1
  },
  {
    name: 'Ramo Tropical Vibrante',
    summary: 'Exóticas flores tropicales',
    description:
      'Una explosión de colores tropicales con aves del paraíso, heliconias y flores exóticas.',
    price_usd: 55.99,
    price_ves: 2239.6,
    stock: 30,
    sku: 'TEST-RT-002',
    active: true,
    featured: true,
    carousel_order: 2
  },
  {
    name: 'Jardín de Margaritas',
    summary: 'Coloridas margaritas blancas',
    description:
      'Un hermoso arreglo de margaritas blancas con hojas verdes, ideal para decorar cualquier espacio.',
    price_usd: 35.99,
    price_ves: 1439.6,
    stock: 40,
    sku: 'TEST-JM-003',
    active: true,
    featured: false,
    carousel_order: null
  },
  {
    name: 'Elegancia de Orquídeas',
    summary: 'Orquídeas blancas elegantes',
    description: 'Orquídeas blancas de la más alta calidad en una maceta cerámica elegante.',
    price_usd: 75.99,
    price_ves: 3039.6,
    stock: 15,
    sku: 'TEST-EO-004',
    active: true,
    featured: true,
    carousel_order: 3
  },
  {
    name: 'Producto Inactivo de Prueba',
    summary: 'Producto para pruebas de filtrado',
    description: 'Este producto está inactivo y no debería aparecer en búsquedas normales.',
    price_usd: 25.99,
    price_ves: 1039.6,
    stock: 0,
    sku: 'TEST-PI-005',
    active: false,
    featured: false,
    carousel_order: null
  }
]

const TEST_USERS = [
  {
    email: 'test-admin@floresya.test',
    full_name: 'Test Admin User',
    phone: '+58 414 123 4567',
    role: 'admin',
    is_active: true,
    email_verified: true
  },
  {
    email: 'test-user-1@floresya.test',
    full_name: 'Juan Pérez Test',
    phone: '+58 424 987 6543',
    role: 'user',
    is_active: true,
    email_verified: true
  },
  {
    email: 'test-user-2@floresya.test',
    full_name: 'María González Test',
    phone: '+58 412 555 1234',
    role: 'user',
    is_active: true,
    email_verified: false
  },
  {
    email: 'test-inactive@floresya.test',
    full_name: 'Usuario Inactivo',
    phone: '+58 416 777 8888',
    role: 'user',
    is_active: false,
    email_verified: true
  }
]

const TEST_PAYMENT_METHODS = [
  {
    name: 'Transferencia Bancaria Test',
    type: 'bank_transfer',
    description: 'Método de pago de prueba para transferencias bancarias',
    account_info: '0102-1234-5678-9012-3456',
    is_active: true,
    display_order: 1
  },
  {
    name: 'Pago Móvil Test',
    type: 'mobile_payment',
    description: 'Método de pago de prueba para pago móvil',
    account_info: '0414-555-5555',
    is_active: true,
    display_order: 2
  },
  {
    name: 'Zelle Test',
    type: 'international',
    description: 'Método de pago de prueba para Zelle',
    account_info: 'payments@floresya.test',
    is_active: true,
    display_order: 3
  }
]

const TEST_OCCASIONS = [
  {
    name: 'Cumpleaños Test',
    description: 'Ocasión de prueba para cumpleaños',
    is_active: true,
    display_order: 1,
    slug: 'cumpleanos-test'
  },
  {
    name: 'Aniversario Test',
    description: 'Ocasión de prueba para aniversarios',
    is_active: true,
    display_order: 2,
    slug: 'aniversario-test'
  }
]

// Helper functions
async function cleanupTestData(tableName, nameColumn = 'name') {
  console.log(`🧹 Cleaning up existing test data in ${tableName}...`)

  const { data: records, error } = await supabase
    .from(tableName)
    .select('*')
    .like(nameColumn, `${TEST_PREFIX}%`)

  if (error) {
    console.error(`❌ Error querying ${tableName}:`, error)
    return false
  }

  if (records && records.length > 0) {
    const ids = records.map(item => item.id)
    const { error: deleteError } = await supabase.from(tableName).delete().in('id', ids)

    if (deleteError) {
      console.error(`❌ Error deleting from ${tableName}:`, deleteError)
      return false
    }

    console.log(`✅ Deleted ${records.length} test records from ${tableName}`)
  } else {
    console.log(`ℹ️ No existing test data found in ${tableName}`)
  }

  return true
}

async function seedProducts() {
  console.log('🌱 Seeding test products...')

  for (const product of TEST_PRODUCTS) {
    const { data, error } = await supabase
      .from('products')
      .upsert({
        ...product,
        name: `${TEST_PREFIX}${product.name}`,
        sku: `${TEST_PREFIX}${product.sku}`,
        name_normalized: `${TEST_PREFIX}${product.name}`.toLowerCase(),
        description_normalized: product.description.toLowerCase()
      })
      .select()
      .single()

    if (error) {
      console.error(`❌ Error creating product ${product.name}:`, error)
      continue
    }

    console.log(`✅ Created product: ${data.name}`)
  }
}

async function seedUsers() {
  console.log('👥 Seeding test users...')

  for (const user of TEST_USERS) {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single()

    if (existingUser) {
      console.log(`ℹ️ User ${user.email} already exists, skipping...`)
      continue
    }

    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        role: user.role
      }
    })

    if (authError) {
      console.error(`❌ Error creating auth user ${user.email}:`, authError)
      continue
    }

    // Create user record in database
    const { error } = await supabase.from('users').upsert({
      id: authData.user.id,
      ...user,
      full_name_normalized: user.full_name.toLowerCase(),
      email_normalized: user.email.toLowerCase()
    })

    if (error) {
      console.error(`❌ Error creating user record ${user.email}:`, error)
      continue
    }

    console.log(`✅ Created user: ${user.email}`)
  }
}

async function seedPaymentMethods() {
  console.log('💳 Seeding test payment methods...')

  for (const paymentMethod of TEST_PAYMENT_METHODS) {
    const { data: paymentData, error } = await supabase
      .from('payment_methods')
      .upsert({
        ...paymentMethod,
        name: `${TEST_PREFIX}${paymentMethod.name}`
      })
      .select()
      .single()

    if (error) {
      console.error(`❌ Error creating payment method ${paymentMethod.name}:`, error)
      continue
    }

    console.log(`✅ Created payment method: ${paymentData.name}`)
  }
}

async function seedOccasions() {
  console.log('🎉 Seeding test occasions...')

  for (const occasion of TEST_OCCASIONS) {
    const { data: occasionData, error } = await supabase
      .from('occasions')
      .upsert({
        ...occasion,
        name: `${TEST_PREFIX}${occasion.name}`,
        slug: `${TEST_PREFIX}${occasion.slug}`
      })
      .select()
      .single()

    if (error) {
      console.error(`❌ Error creating occasion ${occasion.name}:`, error)
      continue
    }

    console.log(`✅ Created occasion: ${occasionData.name}`)
  }
}

async function createTestOrders() {
  console.log('📦 Creating test orders...')

  // Get test products and users
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .like('name', `${TEST_PREFIX}%`)
    .eq('active', true)

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .like('email', '%@floresya.test')
    .eq('is_active', true)

  if (!products || products.length === 0) {
    console.error('❌ No test products found')
    return
  }

  if (!users || users.length === 0) {
    console.error('❌ No test users found')
    return
  }

  // Create orders with different statuses
  const orderStatuses = ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled']

  for (let i = 0; i < 6; i++) {
    const user = users[i % users.length]
    const product = products[i % products.length]
    const status = orderStatuses[i]

    const orderData = {
      user_id: user.id,
      customer_email: user.email,
      customer_name: user.full_name,
      customer_phone: user.phone,
      delivery_address: `Dirección de prueba ${i + 1}, Urbanización Test`,
      delivery_city: 'Caracas',
      delivery_state: 'Distrito Capital',
      delivery_date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      delivery_time_slot: '10:00-12:00',
      delivery_notes: `Notas de entrega para orden ${i + 1}`,
      status,
      total_amount_usd: product.price_usd * (i + 1),
      total_amount_ves: product.price_ves * (i + 1),
      currency_rate: 40,
      notes: `Orden de prueba ${i + 1} con estado ${status}`,
      customer_name_normalized: user.full_name.toLowerCase(),
      customer_email_normalized: user.email.toLowerCase()
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error(`❌ Error creating order ${i + 1}:`, orderError)
      continue
    }

    // Create order items
    const itemData = {
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      product_summary: product.summary,
      unit_price_usd: product.price_usd,
      unit_price_ves: product.price_ves,
      quantity: i + 1,
      subtotal_usd: product.price_usd * (i + 1),
      subtotal_ves: product.price_ves * (i + 1)
    }

    const { error: itemError } = await supabase.from('order_items').insert(itemData)

    if (itemError) {
      console.error(`❌ Error creating order item for order ${i + 1}:`, itemError)
      continue
    }

    console.log(`✅ Created order ${i + 1}: ${order.id} (${status})`)
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting test data seeding...')
  console.log('=====================================')

  try {
    // Clean up existing test data
    await cleanupTestData('order_items', 'product_name')
    await cleanupTestData('orders', 'notes')
    await cleanupTestData('product_occasions')
    await cleanupTestData('occasions')
    await cleanupTestData('payment_methods')
    await cleanupTestData('products')

    // Note: We don't cleanup users as they're linked to auth
    // Only create new users if they don't exist

    // Seed new test data
    await seedProducts()
    await seedUsers()
    await seedPaymentMethods()
    await seedOccasions()
    await createTestOrders()

    console.log('=====================================')
    console.log('✅ Test data seeding completed successfully!')
    console.log('')
    console.log('📋 Test data summary:')
    console.log(`   - Products: ${TEST_PRODUCTS.length}`)
    console.log(`   - Users: ${TEST_USERS.length}`)
    console.log(`   - Payment Methods: ${TEST_PAYMENT_METHODS.length}`)
    console.log(`   - Occasions: ${TEST_OCCASIONS.length}`)
    console.log(`   - Orders: 6 (one for each status)`)
    console.log('')
    console.log('🔑 Test user credentials:')
    console.log('   Email: test-admin@floresya.test')
    console.log('   Password: testpassword123')
    console.log('')
    console.log('🎯 Data is ready for integration and E2E tests!')
  } catch (error) {
    console.error('❌ Error during test data seeding:', error)
    process.exit(1)
  }
}

// Run the script
main()
