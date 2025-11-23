/**
 * Auto Order Generator Service
 * Generates random purchase orders continuously as a service
 *
 * Features:
 * - Generates between 100-300 orders per day (random)
 * - Distributes orders uniformly across 24 hours
 * - Each order has 1-5 randomly selected products
 * - Automatically updates product stock
 * - Automatically confirms payments
 * - Follows Repository/Service Layer pattern
 *
 * Usage as service on Linux (systemd):
 * 1. Install as systemd service:
 *    sudo cp scripts/auto-order-generator.service /etc/systemd/system/
 *    sudo systemctl daemon-reload
 *    sudo systemctl enable auto-order-generator
 *    sudo systemctl start auto-order-generator
 *
 * 2. To view logs:
 *    journalctl -u auto-order-generator -f
 *
 * 3. To stop:
 *    sudo systemctl stop auto-order-generator
 *
 * Manual usage:
 * node scripts/auto-order-generator.js
 *
 * Configuration (in .env.local):
 * ORDER_GENERATOR_MIN_DAILY=100
 * ORDER_GENERATOR_MAX_DAILY=300
 * ORDER_GENERATOR_VERBOSE=true
 * ORDER_GENERATOR_LOG_FILE=/var/log/auto-order-generator.log
 */
// @ts-nocheck

import { createOrderWithItems, updateOrderStatus } from '../api/services/orderService.js'
import { confirmPayment, getPaymentMethods, getBCVRate } from '../api/services/paymentService.js'
import { getAllProducts, decrementStock } from '../api/services/productService.js'
import { initializeDIContainer } from '../api/architecture/di-container.js'
import logger from './shared/logger.js'
import configManager from '../config/config-manager.js'

// Import data from JSON files
import firstNamesData from './data/first-names.es.json'
import lastNamesData from './data/last-names.es.json'

// Import constants
import {
  DELIVERY_SLOTS,
  DELIVERY_NOTES,
  CUSTOMER_NOTES,
  ADDRESSES,
  PHONE_PREFIXES,
  EMAIL_DOMAINS
} from './data/order-generator-constants.js'

// Extract name arrays from JSON data
const FIRST_NAMES = firstNamesData.map(item => item.name)
const LAST_NAMES = lastNamesData.map(item => item.name)

// Load environment configuration
// Load centralized configuration
const ORDER_CONFIG = configManager.getConfig().orderGenerator

// Initialize DI Container - IMPORTANT!
initializeDIContainer()

// ========================================
// DAILY CONFIGURATION
// ========================================

const CONFIG = {
  // Daily targets (orders per day)
  MIN_DAILY_ORDERS: ORDER_CONFIG.minDaily,
  MAX_DAILY_ORDERS: ORDER_CONFIG.maxDaily,

  // Number of items per order
  MIN_ITEMS: ORDER_CONFIG.minItems,
  MAX_ITEMS: ORDER_CONFIG.maxItems,

  // Minimum stock threshold to avoid depletion
  MIN_STOCK_THRESHOLD: 3,

  // Retries in case of error
  MAX_RETRIES: 3,

  // Logs
  VERBOSE: ORDER_CONFIG.verbose,

  // Start and end of day (24h format)
  DAY_START_HOUR: 0, // 00:00
  DAY_END_HOUR: 24 // 24:00
}

// Intervals calculated dynamically
const CURRENT_INTERVALS = {
  MIN_INTERVAL: 0, // en milisegundos
  MAX_INTERVAL: 0, // en milisegundos
  TARGET_INTERVAL: 0 // intervalo promedio en milisegundos
}

// ========================================
// DATA FOR RANDOM GENERATION
// ========================================

// Data loaded from JSON files
// ADDRESSES loaded from constants// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

/**
 * Genera un número entero aleatorio entre min y max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Selecciona un elemento aleatorio de un array
 */
function randomItem(array) {
  return array[randomInt(0, array.length - 1)]
}

/**
 * Genera un teléfono venezolano aleatorio
 */
function generatePhone() {
  const prefixes = PHONE_PREFIXES
  const prefix = randomItem(prefixes)
  const number = String(randomInt(1000000, 9999999))
  return `+58 ${prefix}-${number.slice(0, 3)}-${number.slice(3)}`
}

/**
 * Genera un email realista
 */
function generateEmail(firstName, lastName) {
  const domains = EMAIL_DOMAINS
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
  const now = new Date()
  const offset = randomInt(1, 7)
  const deliveryDate = new Date(now)
  deliveryDate.setDate(now.getDate() + offset)
  return deliveryDate.toISOString().split('T')[0]
}

/**
 * Espera el tiempo especificado en milisegundos
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Using unified logger from scripts/shared/logger.js

/**
 * Calcula el número objetivo de órdenes para hoy
 */
function getTodayTargetOrders() {
  return randomInt(CONFIG.MIN_DAILY_ORDERS, CONFIG.MAX_DAILY_ORDERS)
}

/**
 * Calcula intervalos basados en el objetivo diario
 */
function calculateIntervals() {
  const targetOrders = getTodayTargetOrders()
  const dayDuration = (CONFIG.DAY_END_HOUR - CONFIG.DAY_START_HOUR) * 60 * 60 * 1000 // ms
  const avgInterval = dayDuration / targetOrders

  // Intervalo base ± 50% para variación
  CURRENT_INTERVALS.TARGET_INTERVAL = avgInterval
  CURRENT_INTERVALS.MIN_INTERVAL = Math.floor(avgInterval * 0.5) // 50% menos
  CURRENT_INTERVALS.MAX_INTERVAL = Math.floor(avgInterval * 1.5) // 50% más

  return targetOrders
}

/**
 * Calcula el siguiente intervalo aleatorio basado en distribución normal
 */
function getNextInterval() {
  // Usar distribución normal centrada en TARGET_INTERVAL
  const target = CURRENT_INTERVALS.TARGET_INTERVAL
  const min = CURRENT_INTERVALS.MIN_INTERVAL
  const max = CURRENT_INTERVALS.MAX_INTERVAL

  // Generar número aleatorio con distribución normal aproximada
  // Usando el método de Box-Muller (simplificado)
  let u = 0,
    v = 0
  while (u === 0) {
    u = Math.random()
  }
  while (v === 0) {
    v = Math.random()
  }
  const num = Math.sqrt(-2.0 * Math.logger.info(u)) * Math.cos(2.0 * Math.PI * v)

  // Normalizar a rango 0.5 - 1.5
  const normalized = (num + 3) / 6 // Aproxima distribución normal a rango 0-1
  const interval = target * (0.5 + normalized)

  return Math.floor(Math.max(min, Math.min(max, interval)))
}

/**
 * Formatea milisegundos a HH:MM:SS
 */
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ${hours % 24}h`
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

// ========================================
// GENERACIÓN DE DATOS ALEATORIOS
// ========================================

/**
 * Genera datos de cliente aleatorios
 */
function generateCustomerData() {
  const firstName = randomItem(FIRST_NAMES)
  const lastName = randomItem(LAST_NAMES)

  return {
    customer_name: `${firstName} ${lastName}`,
    customer_email: generateEmail(firstName, lastName),
    customer_phone: generatePhone(),
    delivery_address: randomItem(ADDRESSES),
    delivery_date: generateDeliveryDate(),
    delivery_time_slot: randomItem(DELIVERY_SLOTS),
    delivery_notes: randomItem(DELIVERY_NOTES)
  }
}

/**
 * Selecciona productos aleatorios disponibles
 */
function selectRandomProducts(products) {
  // Filtrar productos con stock suficiente
  const availableProducts = products.filter(
    p => p.active !== false && p.stock >= CONFIG.MIN_STOCK_THRESHOLD
  )

  if (availableProducts.length === 0) {
    throw new Error('No hay productos disponibles con stock suficiente')
  }

  // Seleccionar cantidad aleatoria de productos
  const itemCount = Math.min(
    randomInt(CONFIG.MIN_ITEMS, CONFIG.MAX_ITEMS),
    availableProducts.length
  )

  // Mezclar array y tomar los primeros N elementos
  const shuffled = [...availableProducts].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, itemCount)
}

/**
 * Genera items de orden para los productos seleccionados
 */
function generateOrderItems(products) {
  const items = []
  let totalUsd = 0

  for (const product of products) {
    const quantity = randomInt(1, Math.min(3, product.stock))
    const unitPriceUsd = parseFloat(product.price_usd)
    const unitPriceVes = parseFloat(product.price_ves) || unitPriceUsd * 36.45
    const subtotalUsd = unitPriceUsd * quantity
    const subtotalVes = unitPriceVes * quantity

    totalUsd += subtotalUsd

    items.push({
      product_id: product.id,
      product_name: product.name,
      product_summary: product.summary || product.name,
      unit_price_usd: unitPriceUsd,
      unit_price_ves: unitPriceVes,
      quantity: quantity,
      subtotal_usd: subtotalUsd,
      subtotal_ves: subtotalVes
    })
  }

  return { items, totalUsd }
}

// ========================================
// LÓGICA PRINCIPAL
// ========================================

/**
 * Genera una orden aleatoria
 */
async function generateRandomOrder() {
  try {
    logger.info('Iniciando generación de orden aleatoria...')

    // 1. Obtener productos disponibles
    logger.info('Obteniendo productos disponibles...')
    const products = await getAllProducts({}, false)

    if (!products || products.length === 0) {
      throw new Error('No hay productos disponibles en la base de datos')
    }

    logger.info(`Encontrados ${products.length} productos`)

    // 2. Seleccionar productos aleatorios
    const selectedProducts = await selectRandomProducts(products)
    logger.info(`Seleccionados ${selectedProducts.length} productos para la orden`)

    // 3. Generar datos del cliente
    const customerData = generateCustomerData()
    logger.info(`Cliente: ${customerData.customer_name}`)

    // 4. Generar items de orden
    const { items, totalUsd } = generateOrderItems(selectedProducts)

    // 5. Crear orden con items
    logger.info('Creando orden en la base de datos...')

    // Calcular total en VES usando BCV rate
    let bcvRate = 36.45 // Valor por defecto
    try {
      bcvRate = await getBCVRate()
    } catch (error) {
      console.error('Error:', error)
      logger.info(`No se pudo obtener tasa BCV, usando valor por defecto: ${bcvRate}`, 'warning')
    }

    const orderData = {
      customer_email: customerData.customer_email,
      customer_name: customerData.customer_name,
      customer_phone: customerData.customer_phone,
      delivery_address: customerData.delivery_address,
      delivery_date: customerData.delivery_date,
      delivery_time_slot: customerData.delivery_time_slot,
      delivery_notes: customerData.delivery_notes,
      status: 'pending',
      total_amount_usd: totalUsd,
      total_amount_ves: Math.round(totalUsd * bcvRate),
      currency_rate: bcvRate,
      notes: randomItem(CUSTOMER_NOTES)
    }

    const newOrder = await createOrderWithItems(orderData, items)
    logger.info(`✓ Orden creada exitosamente: ID ${newOrder.id}`)

    // 6. Confirmar pago automáticamente
    logger.info('Confirmando pago...')

    let paymentMethods
    try {
      paymentMethods = await getPaymentMethods()
    } catch (error) {
      console.error('Error:', error)
      logger.info('No se pudieron obtener métodos de pago, usando métodos genéricos', 'warning')
      paymentMethods = [
        { type: 'bank_transfer', name: 'Transferencia Bancaria' },
        { type: 'mobile_payment', name: 'Pago Móvil' },
        { type: 'international', name: 'Pago Internacional' }
      ]
    }

    const paymentMethod = randomItem(paymentMethods)
    const referenceNumber = `AUTO-${Date.now()}-${randomInt(1000, 9999)}`

    await confirmPayment(newOrder.id, {
      payment_method: paymentMethod.type,
      reference_number: referenceNumber,
      payment_details: `Pago automático generado por servicio de testing`
    })

    logger.info(`✓ Pago confirmado: ${paymentMethod.name}`)

    // 7. Actualizar estado de la orden a 'verified' (pago confirmado)
    await updateOrderStatus(newOrder.id, 'verified', 'Pago confirmado automáticamente')
    logger.info(`✓ Estado de orden actualizado a 'verified'`)

    // 8. Decrementar stock de productos
    logger.info('Decrementando stock de productos...')
    for (const item of items) {
      try {
        await decrementStock(item.product_id, item.quantity)
        logger.info(`✓ Stock actualizado para producto ${item.product_id}: -${item.quantity}`)
      } catch (error) {
        logger.info(
          `⚠ Error decrementando stock para producto ${item.product_id}: ${error.message}`,
          'warning'
        )
      }
    }

    // 9. Resumen de la orden
    logger.info('=== RESUMEN DE ORDEN ===')
    logger.info(`ID: ${newOrder.id}`)
    logger.info(`Cliente: ${customerData.customer_name}`)
    logger.info(`Email: ${customerData.customer_email}`)
    logger.info(`Items: ${items.length}`)
    logger.info(`Total USD: $${totalUsd.toFixed(2)}`)
    logger.info(`Total VES: Bs. ${(totalUsd * bcvRate).toFixed(2)}`)
    logger.info(`Método de Pago: ${paymentMethod.name}`)
    logger.info('========================')

    return newOrder
  } catch (error) {
    logger.error(`Error generando orden: ${error.message}`)
    throw error
  }
}

/**
 * Calcula estadísticas del día
 */
function calculateDailyStats(orderCount, targetOrders) {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  const progress = (orderCount / targetOrders) * 100
  const remaining = targetOrders - orderCount

  return {
    orderCount,
    targetOrders,
    progress: progress.toFixed(1),
    remaining,
    startTime: startOfDay.toISOString(),
    endTime: endOfDay.toISOString()
  }
}

/**
 * Ciclo principal del generador
 */
async function runGenerator() {
  // Calcular objetivos del día
  const dailyTarget = calculateIntervals()

  logger.info('🚀 Auto Order Generator iniciado')
  logger.info('========================================')
  logger.info('   CONFIGURACIÓN DIARIA')
  logger.info('========================================')
  logger.info(`📅 Fecha: ${new Date().toLocaleDateString()}`)
  logger.info(`🎯 Objetivo diario: ${CONFIG.MIN_DAILY_ORDERS} - ${CONFIG.MAX_DAILY_ORDERS} órdenes`)
  logger.info(`📊 Meta de hoy: ${dailyTarget} órdenes`)
  logger.info(`⏱️  Intervalo promedio: ${formatDuration(CURRENT_INTERVALS.TARGET_INTERVAL)}`)
  logger.info(
    `🔄 Rango: ${formatDuration(CURRENT_INTERVALS.MIN_INTERVAL)} - ${formatDuration(CURRENT_INTERVALS.MAX_INTERVAL)}`,
    'info'
  )
  logger.info(`📦 Items por orden: ${CONFIG.MIN_ITEMS} - ${CONFIG.MAX_ITEMS}`)
  logger.info(`📉 Umbral stock: ${CONFIG.MIN_STOCK_THRESHOLD}`)
  logger.info('========================================')

  let orderCount = 0
  let errorCount = 0
  let lastStatsUpdate = Date.now()

  // Bucle principal
  while (true) {
    try {
      // Verificar si es un nuevo día (reiniciar contador)
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const dayStartTimestamp = startOfDay.getTime()

      // Si pasaron más de 24 horas, recalcular objetivos
      if (orderCount > 0 && Date.now() - dayStartTimestamp > 24 * 60 * 60 * 1000) {
        logger.info('🔄 Nuevo día detectado, recalculando objetivos...', 'info')
        const newDailyTarget = calculateIntervals()
        orderCount = 0
        logger.info(`📊 Nueva meta: ${newDailyTarget} órdenes`)
      }

      // Calcular próximo intervalo
      const interval = getNextInterval()
      const nextRunTime = new Date(Date.now() + interval)

      logger.info(
        `⏰ Próxima orden en ${formatDuration(interval)} (${nextRunTime.toLocaleTimeString()})`,
        'info'
      )

      // Esperar el intervalo aleatorio
      await sleep(interval)

      // Generar orden
      logger.info('--- Iniciando ciclo de generación ---')
      await generateRandomOrder()
      orderCount++

      // Estadísticas cada 10 órdenes o cada 5 minutos
      const shouldShowStats = orderCount % 10 === 0 || Date.now() - lastStatsUpdate > 5 * 60 * 1000
      if (shouldShowStats) {
        const stats = calculateDailyStats(orderCount, dailyTarget)
        logger.info('📊 ESTADÍSTICAS DIARIAS:')
        logger.info(
          `  - Órdenes generadas: ${stats.orderCount}/${stats.targetOrders} (${stats.progress}%)`,
          'info'
        )
        logger.info(`  - Órdenes restantes: ${stats.remaining}`)
        logger.info(`  - Promedio requerido: ${formatDuration(CURRENT_INTERVALS.TARGET_INTERVAL)}`)
        logger.info('----------------------------------------')
        lastStatsUpdate = Date.now()
      }

      logger.info(`✓ Orden #${orderCount} generada exitosamente`)
    } catch (error) {
      logger.error(`❌ Error en ciclo (error #${++errorCount}): ${error.message}`)
      logger.error(`Stack trace: ${error.stack}`)

      // Esperar antes del siguiente intento
      const retryDelay = 30000 // 30 segundos
      logger.info(`🔄 Reintentando en ${formatDuration(retryDelay)}...`)
      await sleep(retryDelay)
    }
  }
}

// ========================================
// MANEJO DE SEÑALES PARA SERVICIO
// ========================================

function shutdown(signal) {
  logger.warn(`📴 Recibida señal ${signal}. Cerrando servicio...`)

  // Aquí podrías agregar lógica de cleanup si fuera necesario
  // Por ejemplo: cerrar conexiones, guardar estado, etc.

  logger.info('✓ Servicio cerrado correctamente')
  process.exit(0)
}

// Capturar señales de terminación
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGUSR2', () => shutdown('SIGUSR2')) // Para nodemon

// Capturar errores no manejados
process.on('uncaughtException', error => {
  logger.error(`Excepción no capturada: ${error.message}`)
  logger.error(`Stack: ${error.stack}`)
  shutdown('UNCAUGHT_EXCEPTION')
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Promesa rechazada no manejada en: ${promise}`)
  logger.error(`Razón: ${reason}`)
  shutdown('UNHANDLED_REJECTION')
})

// ========================================
// INICIO
// ========================================

async function main() {
  try {
    logger.info('========================================')
    logger.info('   AUTO ORDER GENERATOR SERVICE')
    logger.info('========================================')
    logger.info(`Versión: 2.0 - Generador Diario`)
    logger.info(`========================================`)

    // Verificar configuración
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      logger.error('❌ Error: Variables de entorno no configuradas')
      logger.error('Asegúrese de configurar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
      process.exit(1)
    }

    // Validar configuración
    if (CONFIG.MIN_DAILY_ORDERS < 1 || CONFIG.MAX_DAILY_ORDERS < CONFIG.MIN_DAILY_ORDERS) {
      logger.error('❌ Error: Configuración de órdenes diaria inválida')
      logger.info(`MIN: ${CONFIG.MIN_DAILY_ORDERS}, MAX: ${CONFIG.MAX_DAILY_ORDERS}`, 'error')
      process.exit(1)
    }

    logger.info('✓ Configuración validada correctamente')

    // Ejecutar generador
    await runGenerator()
  } catch (error) {
    logger.error(`❌ Error fatal: ${error.message}`)
    logger.error(`Stack: ${error.stack}`)
    process.exit(1)
  }
}

// Iniciar servicio
main()
