#!/usr/bin/env node

/**
 * Script para eliminar los últimos 120 usuarios de la base de datos
 * Elimina en cascada: órdenes, pagos, items de órden, historial de estados
 * KISS: Script simple, directo y seguro
 */

import { supabase } from './api/services/supabaseClient.js'

// Configuración
const USERS_TO_DELETE = 120
const DRY_RUN = process.argv.includes('--dry-run') || false
const FORCE_DELETE = process.argv.includes('--force') || false

console.log('🧹 Limpieza de Base de Datos - Últimos 120 Usuarios')
console.log('='.repeat(50))
console.log(`🔍 Usuarios a eliminar: ${USERS_TO_DELETE}`)
console.log(`🧪 Dry Run: ${DRY_RUN ? 'SÍ' : 'NO'}`)
console.log(`⚡ Force Delete: ${FORCE_DELETE ? 'SÍ' : 'NO'}`)
console.log('')

/**
 * Obtiene los últimos N usuarios por ID (más recientes)
 */
async function getLastUsers() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, full_name, created_at')
      .order('id', { ascending: false })
      .limit(USERS_TO_DELETE)

    if (error) {
      console.error('❌ Error al obtener usuarios:', error)
      throw error
    }

    console.log(`✅ Encontrados ${users.length} usuarios para eliminar`)
    return users
  } catch (error) {
    console.error('❌ Error en getLastUsers:', error)
    throw error
  }
}

/**
 * Cuenta las relaciones de un usuario antes de eliminar
 */
async function getUserRelations(userId) {
  const relations = {}

  try {
    // Contar órdenes
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    relations.orders = ordersCount || 0

    // Contar pagos
    const { count: paymentsCount } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    relations.payments = paymentsCount || 0

    return relations
  } catch (error) {
    console.error(`❌ Error al obtener relaciones del usuario ${userId}:`, error)
    return { orders: 0, payments: 0 }
  }
}

/**
 * Elimina un usuario y todas sus relaciones en cascada
 */
async function deleteUserWithRelations(userId) {
  const results = { success: false, deleted: {}, errors: [] }

  try {
    console.log(`🗑️  Eliminando usuario ${userId}...`)

    // 1. Obtener órdenes del usuario para eliminar en cascada
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', userId)

    if (ordersError) {
      results.errors.push(`Error obteniendo órdenes: ${ordersError.message}`)
      return results
    }

    const orderIds = orders.map(o => o.id)
    console.log(`   📦 Órdenes a eliminar: ${orderIds.length}`)

    // 2. Eliminar items de órdenes
    if (orderIds.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .in('order_id', orderIds)

      if (itemsError) {
        results.errors.push(`Error eliminando items de órdenes: ${itemsError.message}`)
        return results
      }
      results.deleted.order_items = orderIds.length
    }

    // 3. Eliminar historial de estados de órdenes
    if (orderIds.length > 0) {
      const { error: historyError } = await supabase
        .from('order_status_history')
        .delete()
        .in('order_id', orderIds)

      if (historyError) {
        results.errors.push(`Error eliminando historial: ${historyError.message}`)
        return results
      }
      results.deleted.order_status_history = orderIds.length
    }

    // 4. Eliminar pagos
    const { error: paymentsError } = await supabase.from('payments').delete().eq('user_id', userId)

    if (paymentsError) {
      results.errors.push(`Error eliminando pagos: ${paymentsError.message}`)
      return results
    }
    results.deleted.payments = 1 // placeholder

    // 5. Eliminar órdenes
    if (orderIds.length > 0) {
      const { error: deleteOrdersError } = await supabase
        .from('orders')
        .delete()
        .eq('user_id', userId)

      if (deleteOrdersError) {
        results.errors.push(`Error eliminando órdenes: ${deleteOrdersError.message}`)
        return results
      }
      results.deleted.orders = orderIds.length
    }

    // 6. Eliminar usuario
    const { error: userError } = await supabase.from('users').delete().eq('id', userId)

    if (userError) {
      results.errors.push(`Error eliminando usuario: ${userError.message}`)
      return results
    }

    results.success = true
    results.deleted.users = 1

    console.log(`   ✅ Usuario ${userId} eliminado correctamente`)
    return results
  } catch (error) {
    results.errors.push(`Error inesperado: ${error.message}`)
    console.error(`❌ Error eliminando usuario ${userId}:`, error)
    return results
  }
}

/**
 * Función principal de limpieza
 */
async function cleanupUsers() {
  try {
    console.log('🚀 Iniciando proceso de limpieza...')

    // 1. Obtener usuarios a eliminar
    const users = await getLastUsers()

    if (users.length === 0) {
      console.log('✅ No hay usuarios para eliminar')
      return
    }

    // 2. Mostrar resumen
    console.log('\n📊 Resumen de Usuarios a Eliminar:')
    console.log('ID\tEmail\t\t\t\tNombre\t\tCreado')
    console.log('-'.repeat(80))

    const totalRelations = { orders: 0, payments: 0 }

    for (const user of users) {
      const relations = await getUserRelations(user.id)
      totalRelations.orders += relations.orders
      totalRelations.payments += relations.payments

      const email = (user.email || '').padEnd(30)
      const name = (user.full_name || 'N/A').padEnd(20)
      console.log(`${user.id}\t${email}\t${name}\t${user.created_at?.split('T')[0]}`)
    }

    console.log('\n📈 Total de Registros Relacionados:')
    console.log(`   Órdenes: ${totalRelations.orders}`)
    console.log(`   Pagos: ${totalRelations.payments}`)

    // 3. Confirmación
    if (!DRY_RUN && !FORCE_DELETE) {
      console.log('\n⚠️  ADVERTENCIA: Esta operación eliminará permanentemente los datos.')
      console.log('   Para continuar, ejecuta con --force')
      console.log('   Para simulación, ejecuta con --dry-run')
      return
    }

    if (DRY_RUN) {
      console.log('\n🧪 MODO SIMULACIÓN - No se eliminarán datos')
      return
    }

    // 4. Ejecutar eliminación
    console.log('\n🗑️  Iniciando eliminación en cascada...')

    const results = {
      successful: 0,
      failed: 0,
      totalDeleted: {
        users: 0,
        orders: 0,
        order_items: 0,
        order_status_history: 0,
        payments: 0
      },
      errors: []
    }

    for (const user of users) {
      const result = await deleteUserWithRelations(user.id)

      if (result.success) {
        results.successful++
        // Acumular totales
        Object.keys(result.deleted).forEach(key => {
          results.totalDeleted[key] = (results.totalDeleted[key] || 0) + (result.deleted[key] || 0)
        })
      } else {
        results.failed++
        results.errors.push(...result.errors)
      }
    }

    // 5. Reporte final
    console.log('\n📋 Reporte Final de Eliminación:')
    console.log('='.repeat(50))
    console.log(`✅ Usuarios eliminados: ${results.successful}`)
    console.log(`❌ Usuarios fallidos: ${results.failed}`)
    console.log('\n📊 Totales Eliminados:')
    Object.entries(results.totalDeleted).forEach(([key, count]) => {
      if (count > 0) {
        console.log(`   ${key}: ${count}`)
      }
    })

    if (results.errors.length > 0) {
      console.log('\n❌ Errores encontrados:')
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`)
      })
    }
  } catch (error) {
    console.error('💥 Error fatal en el proceso de limpieza:', error)
    process.exit(1)
  }
}

// Ejecutar script
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupUsers()
    .then(() => {
      console.log('\n✅ Proceso de limpieza completado')
      process.exit(0)
    })
    .catch(error => {
      console.error('\n💥 Error en el proceso de limpieza:', error)
      process.exit(1)
    })
}

export { cleanupUsers, getLastUsers, deleteUserWithRelations }
