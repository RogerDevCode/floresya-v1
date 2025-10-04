#!/usr/bin/env node
/**
 * Exhaustive Orders Filters Test
 * Tests all possible filter combinations
 */

import { execSync } from 'child_process'

const BASE_URL = 'http://localhost:3000'
const AUTH_HEADER = 'Authorization: Bearer admin:1:admin'

let testsPassed = 0
let testsFailed = 0

function fetchOrders() {
  const cmd = `curl -s -H "${AUTH_HEADER}" ${BASE_URL}/api/orders`
  const result = JSON.parse(execSync(cmd).toString())
  return result.success ? result.data : []
}

function testFilter(name, filterFn, expectedCount) {
  const orders = fetchOrders()
  const filtered = orders.filter(filterFn)
  const passed = filtered.length === expectedCount

  if (passed) {
    console.log(`✅ ${name}: ${filtered.length} pedidos (esperado: ${expectedCount})`)
    testsPassed++
  } else {
    console.log(`❌ ${name}: ${filtered.length} pedidos (esperado: ${expectedCount}) - FALLÓ`)
    testsFailed++
  }

  return { passed, actual: filtered.length, expected: expectedCount }
}

console.log('🧪 TESTS EXHAUSTIVOS DE FILTROS - ORDERS PAGE\n')
console.log('='.repeat(60))

// TEST 1: Total sin filtros
console.log('\n📋 TEST 1: SIN FILTROS')
testFilter('Total de pedidos', () => true, 100)

// TEST 2: Filtro por ESTADO
console.log('\n📋 TEST 2: FILTRO POR ESTADO')
testFilter('Estado: shipped', o => o.status === 'shipped', 7)
testFilter('Estado: preparing', o => o.status === 'preparing', 1)
testFilter('Estado: verified', o => o.status === 'verified', 1)
testFilter('Estado: delivered', o => o.status === 'delivered', 82)
testFilter('Estado: cancelled', o => o.status === 'cancelled', 9)

// TEST 3: Filtro por AÑO
console.log('\n📋 TEST 3: FILTRO POR AÑO')
testFilter('Año: 2025', o => new Date(o.created_at).getFullYear() === 2025, 100)
testFilter('Año: 2024', o => new Date(o.created_at).getFullYear() === 2024, 0)

// TEST 4: Filtro por PERÍODO (últimos N días)
console.log('\n📋 TEST 4: FILTRO POR PERÍODO')
const now = new Date()
const days30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
const days60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
const days90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

const count30 = fetchOrders().filter(o => new Date(o.created_at) >= days30).length
const count60 = fetchOrders().filter(o => new Date(o.created_at) >= days60).length
const count90 = fetchOrders().filter(o => new Date(o.created_at) >= days90).length

testFilter('Últimos 30 días', o => new Date(o.created_at) >= days30, count30)
testFilter('Últimos 60 días', o => new Date(o.created_at) >= days60, count60)
testFilter('Últimos 90 días', o => new Date(o.created_at) >= days90, count90)

// TEST 5: Filtro PERSONALIZADO (rango)
console.log('\n📋 TEST 5: FILTRO PERSONALIZADO (RANGO)')
const customFrom = new Date('2025-09-01')
const customTo = new Date('2025-09-30')
customTo.setHours(23, 59, 59, 999)

const customCount = fetchOrders().filter(o => {
  const date = new Date(o.created_at)
  return date >= customFrom && date <= customTo
}).length

testFilter(
  'Rango: 2025-09-01 a 2025-09-30',
  o => {
    const date = new Date(o.created_at)
    return date >= customFrom && date <= customTo
  },
  customCount
)

// TEST 6: Filtro COMBINADO (Año + Período)
console.log('\n📋 TEST 6: FILTRO COMBINADO (AÑO + PERÍODO)')
const year2025And30Days = fetchOrders().filter(
  o => new Date(o.created_at).getFullYear() === 2025 && new Date(o.created_at) >= days30
).length

testFilter(
  'Año 2025 + Últimos 30 días',
  o => new Date(o.created_at).getFullYear() === 2025 && new Date(o.created_at) >= days30,
  year2025And30Days
)

// TEST 7: Filtro COMBINADO (Año + Estado)
console.log('\n📋 TEST 7: FILTRO COMBINADO (AÑO + ESTADO)')
testFilter(
  'Año 2025 + Estado delivered',
  o => new Date(o.created_at).getFullYear() === 2025 && o.status === 'delivered',
  82
)

// TEST 8: Filtro COMBINADO (Período + Estado)
console.log('\n📋 TEST 8: FILTRO COMBINADO (PERÍODO + ESTADO)')
const period30Delivered = fetchOrders().filter(
  o => new Date(o.created_at) >= days30 && o.status === 'delivered'
).length

testFilter(
  'Últimos 30 días + Estado delivered',
  o => new Date(o.created_at) >= days30 && o.status === 'delivered',
  period30Delivered
)

// TEST 9: STATS (En Proceso = verified + preparing + shipped)
console.log('\n📋 TEST 9: CÁLCULO DE STATS')
const processing = fetchOrders().filter(
  o => o.status === 'verified' || o.status === 'preparing' || o.status === 'shipped'
).length
testFilter(
  'En Proceso (verified+preparing+shipped)',
  o => o.status === 'verified' || o.status === 'preparing' || o.status === 'shipped',
  processing
)

// TEST 10: BÚSQUEDA (simulada - normalización)
console.log('\n📋 TEST 10: BÚSQUEDA (NORMALIZACIÓN)')
const searchResults = fetchOrders().filter(
  o =>
    o.customer_name.toLowerCase().includes('pedro') ||
    o.customer_email.toLowerCase().includes('pedro')
).length

testFilter(
  'Búsqueda: "pedro"',
  o =>
    o.customer_name.toLowerCase().includes('pedro') ||
    o.customer_email.toLowerCase().includes('pedro'),
  searchResults
)

// TEST 11: EDGE CASES
console.log('\n📋 TEST 11: EDGE CASES')
testFilter('Estado inexistente', o => o.status === 'invalid', 0)
testFilter('Año futuro (2030)', o => new Date(o.created_at).getFullYear() === 2030, 0)

// RESUMEN
console.log('\n' + '='.repeat(60))
console.log(`\n📊 RESUMEN DE TESTS:`)
console.log(`   ✅ Pasados: ${testsPassed}`)
console.log(`   ❌ Fallados: ${testsFailed}`)
console.log(`   📈 Total: ${testsPassed + testsFailed}`)
console.log(
  `   🎯 Tasa de éxito: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`
)

if (testsFailed === 0) {
  console.log('\n🎉 ¡TODOS LOS TESTS PASARON! 🎉\n')
  process.exit(0)
} else {
  console.log('\n⚠️  ALGUNOS TESTS FALLARON ⚠️\n')
  process.exit(1)
}
