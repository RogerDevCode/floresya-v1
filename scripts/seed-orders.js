/**
 * Seed Script for Orders, Payments, Order Items and Status History
 * Generates 100 realistic orders distributed over 3 months
 *
 * Usage: node scripts/seed-orders.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Use service role key to bypass RLS like in seed-products.js
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
)

// Venezuelan names (first names)
const firstNames = [
  'María',
  'José',
  'Ana',
  'Carlos',
  'Luis',
  'Carmen',
  'Pedro',
  'Rosa',
  'Antonio',
  'Isabel',
  'Francisco',
  'Elena',
  'Rafael',
  'Sofía',
  'Miguel',
  'Valentina',
  'Diego',
  'Gabriela',
  'Andrés',
  'Laura',
  'Alejandro',
  'Daniela',
  'Fernando',
  'Victoria',
  'Ricardo',
  'Camila',
  'Eduardo',
  'Isabella',
  'Javier',
  'Mariana',
  'Roberto',
  'Paula',
  'Manuel',
  'Andrea',
  'Jorge',
  'Lucía'
]

// Venezuelan last names
const lastNames = [
  'González',
  'Rodríguez',
  'Pérez',
  'Fernández',
  'López',
  'Martínez',
  'Sánchez',
  'García',
  'Ramírez',
  'Torres',
  'Flores',
  'Morales',
  'Jiménez',
  'Hernández',
  'Díaz',
  'Álvarez',
  'Romero',
  'Castro',
  'Suárez',
  'Ortiz',
  'Vargas',
  'Ramos',
  'Silva',
  'Mendoza',
  'Rojas',
  'Gutiérrez',
  'Medina',
  'Vásquez',
  'Salazar'
]

// Caracas and Miranda neighborhoods
const addresses = [
  'Av. Francisco de Miranda, Chacao, Caracas',
  'Calle Principal de Los Palos Grandes, Caracas',
  'Av. Libertador, Altamira, Caracas',
  'Urbanización Las Mercedes, Caracas',
  'Centro Comercial San Ignacio, Caracas',
  'Calle Paris, Las Mercedes, Caracas',
  'Av. Principal de La Castellana, Caracas',
  'Calle Madrid, Las Mercedes, Caracas',
  'Av. Luis Roche, Altamira, Caracas',
  'Urbanización La Florida, Caracas',
  'Residencias El Rosal, Caracas',
  'Av. Orinoco, Las Mercedes, Caracas',
  'Calle Los Samanes, Los Palos Grandes, Caracas',
  'Centro Comercial Sambil, Chacao, Caracas',
  'Av. Abraham Lincoln, Sabana Grande, Caracas',
  'Parque Cristal, Los Palos Grandes, Caracas',
  'Av. Andrés Bello, Los Palos Grandes, Caracas',
  'Urbanización Colinas de Bello Monte, Caracas',
  'Los Dos Caminos, Caracas',
  'La California Norte, Caracas',
  'Calle La Guairita, Chuao, Caracas',
  'Av. Principal de Bello Monte, Caracas',
  'Centro Plaza, Los Palos Grandes, Caracas',
  'Urbanización Santa Fe Norte, Caracas',
  'Av. Principal de Chuao, Caracas',
  'Calle Real de Sabana Grande, Caracas',
  'Los Ruices, Miranda',
  'Lomas de La Lagunita, Miranda',
  'Carretera Baruta-El Hatillo, Miranda',
  'Urbanización La Trinidad, Miranda'
]

// Payment methods
const paymentMethods = ['bank_transfer', 'zelle', 'paypal', 'cash', 'pago_movil', 'binance']

// Order statuses (from DB_SCHEMA.orders.enums.status)
const _orderStatuses = ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled']

// USD to VES exchange rate
const USD_TO_VES = 36.45

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate random item from array
 */
function randomItem(array) {
  return array[randomInt(0, array.length - 1)]
}

/**
 * Generate random date between start and end
 */
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

/**
 * Generate Venezuelan phone number
 */
function generatePhone() {
  const prefixes = ['412', '414', '424', '416', '426']
  const prefix = randomItem(prefixes)
  const number = String(randomInt(1000000, 9999999))
  return `+58 ${prefix}-${number.slice(0, 3)}-${number.slice(3)}`
}

/**
 * Generate realistic email
 */
function generateEmail(firstName, lastName) {
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com']
  const name = firstName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const last = lastName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const variants = [
    `${name}.${last}`,
    `${name}${last}`,
    `${name}_${last}`,
    `${name}${randomInt(10, 99)}`
  ]
  return `${randomItem(variants)}@${randomItem(domains)}`
}

/**
 * Get order status based on age
 */
function getOrderStatus(orderDate, now) {
  const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24))

  if (daysDiff > 3) {
    // Old orders: mostly delivered, few cancelled
    const rand = Math.random()
    if (rand < 0.85) {
      return 'delivered'
    }
    if (rand < 0.95) {
      return 'cancelled'
    }
    return 'shipped'
  } else {
    // Recent orders (last 3 days): varied states
    const rand = Math.random()
    if (rand < 0.2) {
      return 'pending'
    }
    if (rand < 0.4) {
      return 'verified'
    }
    if (rand < 0.6) {
      return 'preparing'
    }
    if (rand < 0.8) {
      return 'shipped'
    }
    if (rand < 0.95) {
      return 'delivered'
    }
    return 'cancelled'
  }
}

/**
 * Generate status history for an order
 * Schema: order_status_history (id, order_id, old_status, new_status, notes, changed_by INTEGER, created_at)
 */
function generateStatusHistory(orderId, orderDate, finalStatus, userId) {
  const history = []
  let currentDate = new Date(orderDate)

  // Always starts as pending
  history.push({
    order_id: orderId,
    old_status: null,
    new_status: 'pending',
    created_at: currentDate.toISOString(),
    changed_by: userId,
    notes: 'Pedido creado'
  })

  if (finalStatus === 'pending') {
    return history
  }

  // Add hours randomly (1-6 hours)
  currentDate = new Date(currentDate.getTime() + randomInt(1, 6) * 60 * 60 * 1000)

  if (finalStatus === 'cancelled') {
    history.push({
      order_id: orderId,
      old_status: 'pending',
      new_status: 'cancelled',
      created_at: currentDate.toISOString(),
      changed_by: userId,
      notes: randomItem([
        'Cliente canceló el pedido',
        'Producto no disponible',
        'Cliente no respondió',
        'Cambio de dirección no disponible'
      ])
    })
    return history
  }

  // Pending -> Verified
  history.push({
    order_id: orderId,
    old_status: 'pending',
    new_status: 'verified',
    created_at: currentDate.toISOString(),
    changed_by: userId,
    notes: 'Pago confirmado'
  })

  if (finalStatus === 'verified') {
    return history
  }

  // Add 1-3 hours
  currentDate = new Date(currentDate.getTime() + randomInt(1, 3) * 60 * 60 * 1000)

  // Verified -> Preparing
  history.push({
    order_id: orderId,
    old_status: 'verified',
    new_status: 'preparing',
    created_at: currentDate.toISOString(),
    changed_by: userId,
    notes: 'Preparando pedido'
  })

  if (finalStatus === 'preparing') {
    return history
  }

  // Add 2-12 hours
  currentDate = new Date(currentDate.getTime() + randomInt(2, 12) * 60 * 60 * 1000)

  // Preparing -> Shipped
  history.push({
    order_id: orderId,
    old_status: 'preparing',
    new_status: 'shipped',
    created_at: currentDate.toISOString(),
    changed_by: userId,
    notes: 'Pedido enviado'
  })

  if (finalStatus === 'shipped') {
    return history
  }

  // Add 2-24 hours
  currentDate = new Date(currentDate.getTime() + randomInt(2, 24) * 60 * 60 * 1000)

  // Shipped -> Delivered
  history.push({
    order_id: orderId,
    old_status: 'shipped',
    new_status: 'delivered',
    created_at: currentDate.toISOString(),
    changed_by: userId,
    notes: 'Pedido entregado exitosamente'
  })

  return history
}

/**
 * Clean existing data and reset sequences
 */
async function cleanDatabase() {
  console.log('🧹 Cleaning existing order data...\n')

  try {
    // Delete in correct order (respecting foreign keys)
    console.log('  - Deleting order_status_history...')
    await supabase.from('order_status_history').delete().neq('id', 0)

    console.log('  - Deleting order_items...')
    await supabase.from('order_items').delete().neq('id', 0)

    console.log('  - Deleting payments...')
    await supabase.from('payments').delete().neq('id', 0)

    console.log('  - Deleting orders...')
    await supabase.from('orders').delete().neq('id', 0)

    console.log('\n🔄 Resetting sequences...')

    // Reset sequences to 1
    const sequences = [
      'orders_id_seq',
      'order_items_id_seq',
      'payments_id_seq',
      'order_status_history_id_seq'
    ]

    for (const seq of sequences) {
      const { error } = await supabase.rpc('reset_sequence', {
        sequence_name: seq
      })

      if (error) {
        console.log(`  ⚠ Warning: Could not reset ${seq} (may not exist or need manual reset)`)
      } else {
        console.log(`  ✓ Reset ${seq}`)
      }
    }

    console.log('\n✓ Database cleaned successfully\n')
  } catch (error) {
    console.error('⚠ Warning during cleanup:', error.message)
    console.log('Continuing with seeding...\n')
  }
}

/**
 * Main seeding function
 */
async function seedOrders() {
  try {
    console.log('🌱 Starting order seeding...\n')

    // Clean existing data first
    await cleanDatabase()

    // Get existing products
    console.log('📦 Fetching products...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price_usd, stock')
      .eq('active', true)

    if (productsError) {
      throw productsError
    }
    if (!products || products.length === 0) {
      throw new Error('No active products found. Please seed products first.')
    }
    console.log(`✓ Found ${products.length} products\n`)

    // Get existing users (we'll use first user as default, or create orders without user_id)
    console.log('👤 Fetching users...')
    const { data: users, error: usersError } = await supabase.from('users').select('id').limit(1)

    if (usersError) {
      throw usersError
    }
    const defaultUserId = users && users.length > 0 ? users[0].id : null
    console.log(`✓ Using ${defaultUserId ? 'existing' : 'no'} user for orders\n`)

    // Date ranges
    const now = new Date()
    const threeMonthsAgo = new Date(now)
    threeMonthsAgo.setMonth(now.getMonth() - 3)

    console.log(
      `📅 Generating 100 orders from ${threeMonthsAgo.toLocaleDateString()} to ${now.toLocaleDateString()}\n`
    )

    const orders = []
    const payments = []
    const orderItems = []
    const statusHistories = []

    for (let i = 0; i < 100; i++) {
      const orderDate = randomDate(threeMonthsAgo, now)
      const firstName = randomItem(firstNames)
      const lastName = randomItem(lastNames)

      // Determine final status based on order age
      const finalStatus = getOrderStatus(orderDate, now)

      // Generate order (complete schema from supabase_schema.sql)
      const address = randomItem(addresses)
      const _addressParts = address.split(', ')
      const deliveryDateOffset = randomInt(1, 7) // 1-7 days from order date
      const deliveryDate = new Date(orderDate)
      deliveryDate.setDate(deliveryDate.getDate() + deliveryDateOffset)

      const order = {
        user_id: defaultUserId,
        customer_email: generateEmail(firstName, lastName),
        customer_name: `${firstName} ${lastName}`,
        customer_phone: generatePhone(),
        delivery_address: address,
        delivery_date: deliveryDate.toISOString().split('T')[0],
        delivery_time_slot: randomItem(['09:00-12:00', '12:00-15:00', '15:00-18:00', '']),
        delivery_notes: randomItem([
          'Llamar al llegar',
          'Dejar con portero',
          'Torre A, piso 5',
          ''
        ]),
        status: finalStatus,
        total_amount_usd: 0, // Will be calculated
        total_amount_ves: 0, // Will be calculated
        currency_rate: USD_TO_VES,
        notes: randomItem(['Regalo', 'Cumpleaños', 'Aniversario', 'Ocasión especial', '']),
        admin_notes: null,
        created_at: orderDate.toISOString(),
        updated_at: orderDate.toISOString()
      }

      // Insert order to get ID
      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single()

      if (orderError) {
        console.error(`✗ Error creating order ${i + 1}:`, orderError)
        continue
      }

      const orderId = insertedOrder.id
      orders.push(insertedOrder)

      // Generate 1-3 items per order
      const itemCount = randomInt(1, 3)
      let orderTotal = 0

      for (let j = 0; j < itemCount; j++) {
        const product = randomItem(products)
        const quantity = randomInt(1, 3)
        const unitPriceUsd = parseFloat(product.price_usd)
        const unitPriceVes = unitPriceUsd * USD_TO_VES
        const subtotalUsd = unitPriceUsd * quantity
        const subtotalVes = subtotalUsd * USD_TO_VES
        orderTotal += subtotalUsd

        orderItems.push({
          order_id: orderId,
          product_id: product.id,
          product_name: product.name,
          product_summary: product.name,
          unit_price_usd: unitPriceUsd.toFixed(2),
          unit_price_ves: unitPriceVes.toFixed(2),
          quantity: quantity,
          subtotal_usd: subtotalUsd.toFixed(2),
          subtotal_ves: subtotalVes.toFixed(2)
        })
      }

      // Update order totals
      const totalVes = (orderTotal * USD_TO_VES).toFixed(2)
      await supabase
        .from('orders')
        .update({
          total_amount_usd: orderTotal.toFixed(2),
          total_amount_ves: totalVes
        })
        .eq('id', orderId)

      // Generate payment (schema: payments table)
      const paymentMethod = randomItem(paymentMethods)
      const paymentStatus =
        finalStatus === 'cancelled' ? 'failed' : finalStatus === 'pending' ? 'pending' : 'completed'

      const paymentDate =
        paymentStatus === 'completed'
          ? new Date(orderDate.getTime() + randomInt(1, 6) * 60 * 60 * 1000)
          : null
      const confirmedDate =
        paymentStatus === 'completed'
          ? new Date(paymentDate.getTime() + randomInt(10, 60) * 60 * 1000)
          : null

      payments.push({
        order_id: orderId,
        payment_method_id: null, // Will be set if payment_methods table exists
        user_id: defaultUserId,
        amount_usd: orderTotal.toFixed(2),
        amount_ves: totalVes,
        currency_rate: USD_TO_VES,
        status: paymentStatus,
        payment_method_name: paymentMethod,
        transaction_id: `TXN-${Date.now()}-${randomInt(1000, 9999)}`,
        reference_number: `REF-${randomInt(100000, 999999)}`,
        payment_details: null,
        receipt_image_url: null,
        admin_notes: paymentStatus === 'completed' ? 'Pago verificado' : null,
        payment_date: paymentDate ? paymentDate.toISOString() : null,
        confirmed_date: confirmedDate ? confirmedDate.toISOString() : null
      })

      // Generate status history (pass userId for changed_by field)
      const history = generateStatusHistory(orderId, orderDate, finalStatus, defaultUserId)
      statusHistories.push(...history)

      // Progress indicator
      if ((i + 1) % 10 === 0) {
        console.log(`✓ Generated ${i + 1}/100 orders...`)
      }
    }

    console.log('\n📦 Inserting order items...')
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      throw itemsError
    }
    console.log(`✓ Inserted ${orderItems.length} order items`)

    console.log('\n💳 Inserting payments...')
    const { error: paymentsError } = await supabase.from('payments').insert(payments)

    if (paymentsError) {
      throw paymentsError
    }
    console.log(`✓ Inserted ${payments.length} payments`)

    console.log('\n📊 Inserting status histories...')
    const { error: historiesError } = await supabase
      .from('order_status_history')
      .insert(statusHistories)

    if (historiesError) {
      throw historiesError
    }
    console.log(`✓ Inserted ${statusHistories.length} status history records`)

    // Summary statistics
    const statusCounts = {}
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
    })

    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + parseFloat(o.total_amount_usd), 0)

    console.log('\n' + '='.repeat(50))
    console.log('📊 SEEDING SUMMARY')
    console.log('='.repeat(50))
    console.log(`✓ Total Orders: ${orders.length}`)
    console.log(`  - Delivered: ${statusCounts.delivered || 0}`)
    console.log(`  - Shipped: ${statusCounts.shipped || 0}`)
    console.log(`  - Preparing: ${statusCounts.preparing || 0}`)
    console.log(`  - Verified: ${statusCounts.verified || 0}`)
    console.log(`  - Pending: ${statusCounts.pending || 0}`)
    console.log(`  - Cancelled: ${statusCounts.cancelled || 0}`)
    console.log(`✓ Total Items: ${orderItems.length}`)
    console.log(`✓ Total Payments: ${payments.length}`)
    console.log(`✓ Total Status Changes: ${statusHistories.length}`)
    console.log(`💰 Revenue (Delivered): $${totalRevenue.toFixed(2)} USD`)
    console.log(`💰 Revenue (Delivered): Bs. ${(totalRevenue * USD_TO_VES).toFixed(2)} VES`)
    console.log('='.repeat(50))
    console.log('\n✅ Seeding completed successfully!')
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run seeding
seedOrders()
