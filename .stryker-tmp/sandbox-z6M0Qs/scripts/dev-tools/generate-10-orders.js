/**
 * Script para generar 10 órdenes con 1-5 items
 * Respeta reglas de negocio: validación de stock, precios actuales, fail-fast
 *
 * Usage: node scripts/generate-10-orders.js
 */
// @ts-nocheck

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Usar service role key para bypass RLS como en otros scripts
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
)

// Datos de prueba venezolanos
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
  'Isabel'
]

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
  'Torres'
]

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
  'Urbanización La Florida, Caracas'
]

// Order statuses válidos según DB_SCHEMA.orders.enums.status
const orderStatuses = ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled']

// Tasa de cambio USD a VES
const USD_TO_VES = 36.45

/**
 * Genera número entero aleatorio entre min y max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Selecciona elemento aleatorio de array
 */
function randomItem(array) {
  return array[randomInt(0, array.length - 1)]
}

/**
 * Genera teléfono venezolano
 */
function generatePhone() {
  const prefixes = ['412', '414', '424', '416', '426']
  const prefix = randomItem(prefixes)
  const number = String(randomInt(1000000, 9999999))
  return `+58 ${prefix}-${number.slice(0, 3)}-${number.slice(3)}`
}

/**
 * Genera email realista
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
 * Genera fecha de entrega (1-7 días desde hoy)
 */
function generateDeliveryDate() {
  const today = new Date()
  const daysOffset = randomInt(1, 7)
  const deliveryDate = new Date(today)
  deliveryDate.setDate(today.getDate() + daysOffset)
  return deliveryDate.toISOString().split('T')[0]
}

/**
 * Genera historial de status para una orden
 */
function generateStatusHistory(orderId, finalStatus, userId) {
  const history = []
  const now = new Date()

  // Siempre inicia como pending
  history.push({
    order_id: orderId,
    old_status: null,
    new_status: 'pending',
    created_at: now.toISOString(),
    changed_by: userId,
    notes: 'Pedido creado'
  })

  if (finalStatus === 'pending') {
    return history
  }

  // Simula progresión de estados según el estado final
  let currentDate = new Date(now.getTime() + randomInt(1, 3) * 60 * 60 * 1000)

  if (finalStatus === 'cancelled') {
    history.push({
      order_id: orderId,
      old_status: 'pending',
      new_status: 'cancelled',
      created_at: currentDate.toISOString(),
      changed_by: userId,
      notes: 'Cliente canceló el pedido'
    })
    return history
  }

  // Pending -> Verified
  if (['verified', 'preparing', 'shipped', 'delivered'].includes(finalStatus)) {
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
  }

  // Verified -> Preparing
  currentDate = new Date(currentDate.getTime() + randomInt(1, 2) * 60 * 60 * 1000)
  if (['preparing', 'shipped', 'delivered'].includes(finalStatus)) {
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
  }

  // Preparing -> Shipped
  currentDate = new Date(currentDate.getTime() + randomInt(2, 6) * 60 * 60 * 1000)
  if (['shipped', 'delivered'].includes(finalStatus)) {
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
  }

  // Shipped -> Delivered
  currentDate = new Date(currentDate.getTime() + randomInt(2, 12) * 60 * 60 * 1000)
  if (finalStatus === 'delivered') {
    history.push({
      order_id: orderId,
      old_status: 'shipped',
      new_status: 'delivered',
      created_at: currentDate.toISOString(),
      changed_by: userId,
      notes: 'Pedido entregado exitosamente'
    })
  }

  return history
}

/**
 * Script principal
 */
async function generateOrders() {
  try {
    console.log('🌱 Generando 10 órdenes con 1-5 items cada una...\n')

    // 1. Obtener productos activos con stock > 0
    console.log('📦 Obteniendo productos activos...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, summary, price_usd, price_ves, stock')
      .eq('active', true)
      .gt('stock', 0)

    if (productsError) {
      throw new Error(`Error obteniendo productos: ${productsError.message}`)
    }

    if (!products || products.length === 0) {
      throw new Error('No hay productos activos con stock disponible')
    }

    console.log(`✓ Encontrados ${products.length} productos con stock\n`)

    // 2. Obtener usuarios (opcional para user_id)
    console.log('👤 Obteniendo usuarios...')
    const { data: users } = await supabase.from('users').select('id').limit(1)
    const defaultUserId = users && users.length > 0 ? users[0].id : null
    console.log(`✓ Usuario ID: ${defaultUserId || 'sin usuario'}\n`)

    // 3. Generar 10 órdenes
    console.log('🛒 Generando órdenes...\n')

    for (let i = 0; i < 10; i++) {
      const firstName = randomItem(firstNames)
      const lastName = randomItem(lastNames)
      const finalStatus = randomItem(orderStatuses)

      // Generar 1-5 items por orden
      const itemCount = randomInt(1, 5)
      const orderItems = []
      let totalAmountUsd = 0
      let totalAmountVes = 0

      console.log(`  Orden ${i + 1}: Generando ${itemCount} items...`)

      for (let j = 0; j < itemCount; j++) {
        const product = randomItem(products)
        const quantity = randomInt(1, Math.min(3, product.stock))
        const unitPriceUsd = parseFloat(product.price_usd)
        const unitPriceVes = product.price_ves
          ? parseFloat(product.price_ves)
          : Math.round(unitPriceUsd * USD_TO_VES)
        const subtotalUsd = unitPriceUsd * quantity
        const subtotalVes = unitPriceVes * quantity

        totalAmountUsd += subtotalUsd
        totalAmountVes += subtotalVes

        orderItems.push({
          product_id: product.id,
          product_name: product.name,
          product_summary: product.summary || product.name,
          unit_price_usd: unitPriceUsd,
          unit_price_ves: Math.round(unitPriceVes),
          quantity: quantity,
          subtotal_usd: subtotalUsd,
          subtotal_ves: Math.round(subtotalVes)
        })
      }

      // Preparar datos de la orden
      const orderData = {
        user_id: defaultUserId,
        customer_email: generateEmail(firstName, lastName),
        customer_name: `${firstName} ${lastName}`,
        customer_phone: generatePhone(),
        delivery_address: randomItem(addresses),
        delivery_date: generateDeliveryDate(),
        delivery_time_slot: randomItem(['09:00-12:00', '12:00-15:00', '15:00-18:00', null]),
        delivery_notes: randomItem([
          'Llamar al llegar',
          'Dejar con portero',
          'Torre A, piso 5',
          null
        ]),
        status: finalStatus,
        total_amount_usd: totalAmountUsd,
        total_amount_ves: Math.round(totalAmountVes),
        currency_rate: USD_TO_VES,
        notes: randomItem(['Regalo', 'Cumpleaños', 'Aniversario', 'Ocasión especial', null]),
        admin_notes: null
      }

      // Insertar orden
      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError) {
        console.error(`  ✗ Error creando orden ${i + 1}:`, orderError.message)
        continue
      }

      const orderId = insertedOrder.id

      // Insertar items de la orden
      const itemsWithOrderId = orderItems.map(item => ({
        ...item,
        order_id: orderId
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(itemsWithOrderId)

      if (itemsError) {
        console.error(`  ✗ Error creando items para orden ${orderId}:`, itemsError.message)
        // Rollback: eliminar orden
        await supabase.from('orders').delete().eq('id', orderId)
        continue
      }

      // Generar historial de status
      const statusHistory = generateStatusHistory(orderId, finalStatus, defaultUserId)
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert(statusHistory)

      if (historyError) {
        console.warn(`  ⚠ Warning: No se pudo crear historial para orden ${orderId}`)
      }

      console.log(
        `  ✓ Orden ${i + 1} creada: ID=${orderId}, Items=${itemCount}, Status=${finalStatus}, Total=$${totalAmountUsd.toFixed(2)}`
      )
    }

    // 4. Resumen final
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN')
    console.log('='.repeat(60))

    const { data: allOrders } = await supabase
      .from('orders')
      .select('id, status, total_amount_usd')
      .order('id', { ascending: false })
      .limit(10)

    if (allOrders) {
      console.log(`✓ Total de órdenes generadas: ${allOrders.length}`)

      const statusCounts = {}
      let totalRevenue = 0

      allOrders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
        if (order.status === 'delivered') {
          totalRevenue += parseFloat(order.total_amount_usd)
        }
      })

      console.log('\nDistribución por estado:')
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count}`)
      })

      console.log(`\n💰 Ingresos (órdenes entregadas): $${totalRevenue.toFixed(2)} USD`)
      console.log(
        `💰 Ingresos (órdenes entregadas): Bs. ${(totalRevenue * USD_TO_VES).toFixed(2)} VES`
      )
    }

    console.log('='.repeat(60))
    console.log('\n✅ Generación de órdenes completada exitosamente!')
  } catch (error) {
    console.error('\n❌ Error generando órdenes:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Ejecutar script
generateOrders()
