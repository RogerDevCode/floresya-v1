/**
 * Debug Script: Comparar respuestas API con datos reales de BD
 * Este script verifica si hay discrepancias entre la API y la base de datos
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

async function compareApiVsDatabase() {
  console.log('🔍 COMPARACIÓN API vs BASE DE DATOS')
  console.log('='.repeat(60))

  try {
    // 1. Datos reales de la BD
    console.log('\n1️⃣ DATOS REALES DE LA BASE DE DATOS:')
    console.log('-'.repeat(50))

    const { data: allUsersFromDB, error: dbError } = await supabase
      .from('users')
      .select('*')
      .order('id', { ascending: true })

    if (dbError) {
      console.error('❌ Error querying database:', dbError)
      return
    }

    const dbStats = {
      total: allUsersFromDB.length,
      active: allUsersFromDB.filter(u => u.is_active).length,
      inactive: allUsersFromDB.filter(u => !u.is_active).length,
      admins: allUsersFromDB.filter(u => u.role === 'admin').length,
      verified: allUsersFromDB.filter(u => u.email_verified).length
    }

    console.log(
      `📊 BD - Total: ${dbStats.total}, Activos: ${dbStats.active}, Inactivos: ${dbStats.inactive}`
    )
    console.log(`🛡️ BD - Admins: ${dbStats.admins}, Verificados: ${dbStats.verified}`)

    // 2. Simular diferentes escenarios de API
    console.log('\n2️⃣ SIMULACIÓN DE DIFERENTES ESCENARIOS DE API:')
    console.log('-'.repeat(50))

    // Escenario 1: Usuario normal (no admin) - solo debería ver usuarios activos
    console.log('\n📋 ESCENARIO 1: Usuario Normal (role=user)')
    console.log('   Debería ver SOLO usuarios activos')

    const { data: nonAdminView, error: nonAdminError } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .order('id')

    if (!nonAdminError && nonAdminView) {
      console.log(`   ✅ Usuario normal vería: ${nonAdminView.length} usuarios activos`)
      console.log(`   📋 IDs: ${nonAdminView.map(u => u.id).join(', ')}`)
    }

    // Escenario 2: Admin - debería ver todos los usuarios
    console.log('\n👑 ESCENARIO 2: Administrador (role=admin)')
    console.log('   Debería ver TODOS los usuarios')

    const { data: adminView, error: adminError } = await supabase
      .from('users')
      .select('*')
      .order('id')

    if (!adminError && adminView) {
      console.log(`   ✅ Admin vería: ${adminView.length} usuarios totales`)
      console.log(`   📋 Activos: ${adminView.filter(u => u.is_active).length}`)
      console.log(`   📋 Inactivos: ${adminView.filter(u => !u.is_active).length}`)
    }

    // 3. Verificar filtros específicos
    console.log('\n3️⃣ VERIFICACIÓN DE FILTROS ESPECÍFICOS:')
    console.log('-'.repeat(50))

    // Filtro: solo activos
    const { data: activeOnly, error: activeError } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .order('id')

    if (!activeError && activeOnly) {
      console.log(`🎯 Solo activos (is_active=true): ${activeOnly.length}`)
      console.log(
        `   IDs: ${activeOnly
          .map(u => u.id)
          .slice(0, 10)
          .join(', ')}${activeOnly.length > 10 ? '...' : ''}`
      )
    }

    // Filtro: solo inactivos
    const { data: inactiveOnly, error: inactiveError } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', false)
      .order('id')

    if (!inactiveError && inactiveOnly) {
      console.log(`🎯 Solo inactivos (is_active=false): ${inactiveOnly.length}`)
      console.log(
        `   IDs: ${inactiveOnly
          .map(u => u.id)
          .slice(0, 10)
          .join(', ')}${inactiveOnly.length > 10 ? '...' : ''}`
      )
    }

    // Filtro: solo admins
    const { data: adminOnly, error: adminFilterError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .order('id')

    if (!adminFilterError && adminOnly) {
      console.log(`🎯 Solo admins (role=admin): ${adminOnly.length}`)
      console.log(`   IDs: ${adminOnly.map(u => u.id).join(', ')}`)
    }

    // 4. Verificar usuarios específicos que podrían causar problemas
    console.log('\n4️⃣ VERIFICACIÓN DE USUARIOS PROBLEMÁTICOS:')
    console.log('-'.repeat(50))

    // Usuario admin principal (ID 3)
    const { data: adminUser, error: adminUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', 3)
      .single()

    if (!adminUserError && adminUser) {
      console.log(`👤 Admin principal (ID 3):`)
      console.log(`   Email: ${adminUser.email}`)
      console.log(`   Nombre: ${adminUser.full_name}`)
      console.log(`   is_active: ${adminUser.is_active}`)
      console.log(`   role: ${adminUser.role}`)
      console.log(`   email_verified: ${adminUser.email_verified}`)
    }

    // Usuarios con datos sospechosos
    const suspiciousUsers = allUsersFromDB.filter(
      user => user.is_active && (!user.email_verified || user.role === 'admin')
    )

    if (suspiciousUsers.length > 0) {
      console.log(`\n⚠️ USUARIOS SOSPECHOSOS (${suspiciousUsers.length}):`)
      suspiciousUsers.slice(0, 5).forEach(user => {
        console.log(
          `   ID: ${user.id} | ${user.email} | Activo: ${user.is_active} | Admin: ${user.role === 'admin'} | Verificado: ${user.email_verified}`
        )
      })
      if (suspiciousUsers.length > 5) {
        console.log(`   ... y ${suspiciousUsers.length - 5} más`)
      }
    }

    // 5. Análisis de posibles fuentes de problema
    console.log('\n5️⃣ ANÁLISIS DE POSIBLES FUENTES DE PROBLEMA:')
    console.log('-'.repeat(50))

    console.log(`🔍 POSIBLE PROBLEMA 1: Filtros de permisos`)
    console.log(`   - BD total activos: ${dbStats.active}`)
    console.log(`   - Consulta filtrada activos: ${activeOnly?.length || 0}`)
    console.log(
      `   - ¿Consistente? ${dbStats.active === (activeOnly?.length || 0) ? '✅ SÍ' : '❌ NO'}`
    )

    console.log(`\n🔍 POSIBLE PROBLEMA 2: Datos sospechosos`)
    console.log(
      `   - Usuarios activos sin verificar: ${allUsersFromDB.filter(u => u.is_active && !u.email_verified).length}`
    )
    console.log(
      `   - Admins activos: ${allUsersFromDB.filter(u => u.is_active && u.role === 'admin').length}`
    )
    console.log(`   - Usuarios activos sospechosos: ${suspiciousUsers.length}`)

    console.log(`\n🔍 POSIBLE PROBLEMA 3: Inconsistencias estructurales`)
    console.log(`   - Usuarios sin nombre: ${allUsersFromDB.filter(u => !u.full_name).length}`)
    console.log(
      `   - Usuarios sin email verificado: ${allUsersFromDB.filter(u => !u.email_verified).length}`
    )
    console.log(
      `   - Usuarios con datos nulos: ${allUsersFromDB.filter(u => !u.email || !u.full_name).length}`
    )

    // 6. Resumen ejecutivo
    console.log('\n📋 RESUMEN EJECUTIVO:')
    console.log('='.repeat(50))
    console.log(`• Base de datos: ${dbStats.total} usuarios totales`)
    console.log(
      `• Usuarios activos: ${dbStats.active} (${((dbStats.active / dbStats.total) * 100).toFixed(1)}%)`
    )
    console.log(
      `• Usuarios inactivos: ${dbStats.inactive} (${((dbStats.inactive / dbStats.total) * 100).toFixed(1)}%)`
    )
    console.log(`• Administradores: ${dbStats.admins}`)
    console.log(
      `• Emails verificados: ${dbStats.verified} (${((dbStats.verified / dbStats.total) * 100).toFixed(1)}%)`
    )

    if (suspiciousUsers.length > 0) {
      console.log(`\n⚠️ ATENCIÓN: ${suspiciousUsers.length} usuarios activos con datos sospechosos`)
      console.log(`   - Principalmente emails no verificados`)
      console.log(`   - Podría indicar problema en lógica de verificación`)
    }

    console.log('\n🎯 POSIBLES FUENTES DEL PROBLEMA:')
    console.log('   1. Filtros de permisos aplicándose incorrectamente')
    console.log('   2. Lógica de verificación de emails defectuosa')
    console.log('   3. Procesamiento de datos en el frontend')
    console.log('   4. Sincronización entre servicios')

    console.log('\n✅ COMPARACIÓN COMPLETADA')
  } catch (error) {
    console.error('❌ Error durante la comparación:', error)
  }
}

// Ejecutar la comparación
compareApiVsDatabase()
