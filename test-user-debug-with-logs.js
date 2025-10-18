/**
 * Debug Script: Agregar logs detallados para validar diagnóstico
 * Este script agrega logs comprehensivos al proceso de carga de usuarios
 * para identificar exactamente dónde ocurre el problema de datos falsos
 */

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env.local') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugWithDetailedLogs() {
  console.log('🔍 DEBUG CON LOGS DETALLADOS: Datos falsos en columna is_active')
  console.log('='.repeat(80))

  try {
    // 1. Datos reales de la BD con logs detallados
    console.log('\n📊 PASO 1: EXTRACCIÓN DE DATOS DE LA BD')
    console.log('-'.repeat(60))

    const { data: allUsersFromDB, error: dbError } = await supabase
      .from('users')
      .select('*')
      .order('id', { ascending: true })

    if (dbError) {
      console.error('❌ Error querying database:', dbError)
      return
    }

    console.log(`✅ Usuarios encontrados en BD: ${allUsersFromDB.length}`)

    // Log detallado de cada usuario
    console.log('\n📋 LOG DETALLADO DE USUARIOS EN BD:')
    console.log('-'.repeat(60))

    const usersByStatus = {
      active: [],
      inactive: []
    }

    allUsersFromDB.forEach((user, index) => {
      const userInfo = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_active: user.is_active,
        role: user.role,
        email_verified: user.email_verified
      }

      usersByStatus[user.is_active ? 'active' : 'inactive'].push(userInfo)

      console.log(
        `[${index + 1}] ID:${user.id} | Email:${user.email} | Nombre:${user.full_name || 'N/A'} | is_active:${user.is_active} | Role:${user.role} | Verificado:${user.email_verified}`
      )
    })

    // 2. Estadísticas detalladas
    console.log('\n📈 PASO 2: ESTADÍSTICAS DETALLADAS')
    console.log('-'.repeat(60))

    const totalUsers = allUsersFromDB.length
    const activeUsers = usersByStatus.active.length
    const inactiveUsers = usersByStatus.inactive.length
    const adminUsers = allUsersFromDB.filter(u => u.role === 'admin').length
    const verifiedUsers = allUsersFromDB.filter(u => u.email_verified).length

    console.log(`👥 Total usuarios: ${totalUsers}`)
    console.log(
      `✅ Usuarios activos: ${activeUsers} (${((activeUsers / totalUsers) * 100).toFixed(1)}%)`
    )
    console.log(
      `❌ Usuarios inactivos: ${inactiveUsers} (${((inactiveUsers / totalUsers) * 100).toFixed(1)}%)`
    )
    console.log(`🛡️ Administradores: ${adminUsers}`)
    console.log(
      `📧 Emails verificados: ${verifiedUsers} (${((verifiedUsers / totalUsers) * 100).toFixed(1)}%)`
    )

    // 3. Análisis de usuarios sospechosos
    console.log('\n🔍 PASO 3: ANÁLISIS DE USUARIOS SOSPECHOSOS')
    console.log('-'.repeat(60))

    const suspiciousUsers = allUsersFromDB.filter(
      user => user.is_active && (!user.email_verified || user.role === 'admin')
    )

    console.log(`⚠️ Usuarios activos sospechosos encontrados: ${suspiciousUsers.length}`)

    if (suspiciousUsers.length > 0) {
      console.log('\n📋 DETALLE DE USUARIOS SOSPECHOSOS:')
      suspiciousUsers.forEach((user, index) => {
        console.log(`[${index + 1}] ID:${user.id} | ${user.email}`)
        console.log(`    - Nombre: ${user.full_name || 'SIN NOMBRE'}`)
        console.log(`    - Estado activo: ${user.is_active}`)
        console.log(`    - Rol: ${user.role}`)
        console.log(`    - Email verificado: ${user.email_verified}`)
        console.log(
          `    - ¿Problema potencial? ${!user.email_verified ? 'Email no verificado' : 'Admin activo'}`
        )
        console.log('    ---')
      })
    }

    // 4. Simulación de diferentes escenarios de API
    console.log('\n🌐 PASO 4: SIMULACIÓN DE ESCENARIOS DE API')
    console.log('-'.repeat(60))

    // Escenario 1: Consulta sin filtros (como admin)
    console.log('\n📡 Escenario 1: Consulta sin filtros (admin view)')
    const { data: adminView, error: adminError } = await supabase
      .from('users')
      .select('*')
      .order('id')

    if (!adminError && adminView) {
      console.log(`   ✅ Admin vería: ${adminView.length} usuarios`)
      console.log(`   📊 Activos: ${adminView.filter(u => u.is_active).length}`)
      console.log(`   📊 Inactivos: ${adminView.filter(u => !u.is_active).length}`)

      // Comparar con datos originales
      const activeDiff = adminView.filter(u => u.is_active).length - activeUsers
      const inactiveDiff = adminView.filter(u => !u.is_active).length - inactiveUsers

      if (activeDiff !== 0 || inactiveDiff !== 0) {
        console.log(`   ⚠️ DISCREPANCIA DETECTADA:`)
        console.log(
          `      - Activos: BD=${activeUsers}, API=${adminView.filter(u => u.is_active).length}, Diff=${activeDiff}`
        )
        console.log(
          `      - Inactivos: BD=${inactiveUsers}, API=${adminView.filter(u => !u.is_active).length}, Diff=${inactiveDiff}`
        )
      } else {
        console.log(`   ✅ CONSISTENCIA CONFIRMADA`)
      }
    }

    // Escenario 2: Consulta solo activos (como usuario normal)
    console.log('\n📡 Escenario 2: Consulta solo activos (user view)')
    const { data: activeOnly, error: activeError } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .order('id')

    if (!activeError && activeOnly) {
      console.log(`   ✅ Usuario normal vería: ${activeOnly.length} usuarios activos`)

      // Comparar con datos originales
      const activeDiff = activeOnly.length - activeUsers
      if (activeDiff !== 0) {
        console.log(`   ⚠️ DISCREPANCIA EN ACTIVOS:`)
        console.log(`      - BD=${activeUsers}, API=${activeOnly.length}, Diff=${activeDiff}`)
      } else {
        console.log(`   ✅ CONSISTENCIA CONFIRMADA`)
      }
    }

    // 5. Análisis específico del problema de is_active
    console.log('\n🎯 PASO 5: ANÁLISIS ESPECÍFICO DEL PROBLEMA is_active')
    console.log('-'.repeat(60))

    console.log(`🔍 VERIFICACIÓN DE CONSISTENCIA:`)
    console.log(
      `   - ¿Los datos de BD son consistentes? ${activeUsers + inactiveUsers === totalUsers ? '✅ SÍ' : '❌ NO'}`
    )
    console.log(
      `   - ¿La consulta de activos es consistente? ${activeOnly?.length === activeUsers ? '✅ SÍ' : '❌ NO'}`
    )
    console.log(
      `   - ¿La consulta de inactivos es consistente? ${inactiveUsers === totalUsers - activeUsers ? '✅ SÍ' : '❌ NO'}`
    )

    // 6. Posibles puntos de fallo
    console.log('\n💡 PASO 6: POSIBLES PUNTOS DE FALLO IDENTIFICADOS')
    console.log('-'.repeat(60))

    console.log(`🔍 PUNTO DE FALLO 1: Base de datos`)
    console.log(
      `   - ¿Datos consistentes en BD? ${activeUsers + inactiveUsers === totalUsers ? '✅ SÍ' : '❌ NO'}`
    )
    console.log(
      `   - ¿Usuarios con datos nulos? ${allUsersFromDB.filter(u => u.is_active === null).length}`
    )
    console.log(
      `   - ¿Usuarios con datos undefined? ${allUsersFromDB.filter(u => u.is_active === undefined).length}`
    )

    console.log(`\n🔍 PUNTO DE FALLO 2: Consultas API`)
    console.log(
      `   - ¿Consulta general consistente? ${adminView?.length === totalUsers ? '✅ SÍ' : '❌ NO'}`
    )
    console.log(
      `   - ¿Consulta de activos consistente? ${activeOnly?.length === activeUsers ? '✅ SÍ' : '❌ NO'}`
    )
    console.log(
      `   - ¿Consulta de inactivos consistente? ${inactiveUsers === totalUsers - activeUsers ? '✅ SÍ' : '❌ NO'}`
    )

    console.log(`\n🔍 PUNTO DE FALLO 3: Lógica de filtros`)
    console.log(`   - ¿Usuarios activos sospechosos? ${suspiciousUsers.length} encontrados`)
    console.log(
      `   - ¿Usuarios sin verificar? ${allUsersFromDB.filter(u => !u.email_verified).length} encontrados`
    )
    console.log(
      `   - ¿Relación activo/no verificado? ${((suspiciousUsers.length / activeUsers) * 100).toFixed(1)}%`
    )

    // 7. Resumen y diagnóstico
    console.log('\n📋 PASO 7: RESUMEN Y DIAGNÓSTICO')
    console.log('='.repeat(60))

    console.log(`🎯 DIAGNÓSTICO PRELIMINAR:`)
    console.log(
      `   - Base de datos: ${activeUsers + inactiveUsers === totalUsers ? '✅ CONSISTENTE' : '❌ INCONSISTENTE'}`
    )
    console.log(
      `   - Consultas API: ${adminView?.length === totalUsers && activeOnly?.length === activeUsers ? '✅ CONSISTENTES' : '❌ INCONSISTENTES'}`
    )
    console.log(
      `   - Datos sospechosos: ${suspiciousUsers.length} usuarios (${((suspiciousUsers.length / activeUsers) * 100).toFixed(1)}% de activos)`
    )

    if (suspiciousUsers.length > 0) {
      console.log(`\n⚠️ PROBLEMA IDENTIFICADO:`)
      console.log(`   - ${suspiciousUsers.length} usuarios activos con datos sospechosos`)
      console.log(`   - Principalmente emails no verificados`)
      console.log(`   - Podría indicar problema en lógica de verificación o visualización`)

      console.log(`\n🔧 POSIBLES SOLUCIONES:`)
      console.log(`   1. Verificar lógica de filtros en frontend`)
      console.log(`   2. Revisar procesamiento de datos en dashboard.js`)
      console.log(`   3. Verificar permisos de usuario aplicándose correctamente`)
      console.log(`   4. Revisar lógica especial para usuarios admin`)
    } else {
      console.log(`\n✅ NO SE DETECTARON PROBLEMAS SIGNIFICATIVOS`)
      console.log(`   - Los datos son consistentes en todos los niveles`)
      console.log(`   - El problema podría estar en la interfaz de usuario`)
    }

    console.log('\n✅ DEBUG CON LOGS COMPLETADO')
  } catch (error) {
    console.error('❌ Error durante el debug con logs:', error)
  }
}

// Ejecutar el debug con logs detallados
debugWithDetailedLogs()
