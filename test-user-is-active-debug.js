/**
 * Debug Script: Verificar datos reales de usuarios en BD vs interfaz
 * Este script verifica específicamente el problema de datos falsos en columna is_active
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

async function debugUserIsActiveIssue() {
  console.log('🔍 DEBUG: Verificando problema de datos falsos en columna is_active')
  console.log('='.repeat(70))

  try {
    // 1. Obtener TODOS los usuarios de la base de datos directamente
    console.log('\n1️⃣ CONSULTA DIRECTA A LA BASE DE DATOS:')
    console.log('-'.repeat(50))

    const { data: allUsersFromDB, error: dbError } = await supabase
      .from('users')
      .select('*')
      .order('id', { ascending: true })

    if (dbError) {
      console.error('❌ Error querying database:', dbError)
      return
    }

    console.log(`✅ Usuarios encontrados en BD: ${allUsersFromDB.length}`)
    console.log('\n📊 DATOS REALES EN BASE DE DATOS:')
    console.log('-'.repeat(50))

    allUsersFromDB.forEach(user => {
      console.log(
        `ID: ${user.id} | Email: ${user.email} | Nombre: ${user.full_name || 'N/A'} | is_active: ${user.is_active} | Role: ${user.role} | Email Verificado: ${user.email_verified}`
      )
    })

    // 2. Estadísticas reales de la BD
    console.log('\n📈 ESTADÍSTICAS REALES DE LA BD:')
    console.log('-'.repeat(50))

    const totalUsers = allUsersFromDB.length
    const activeUsers = allUsersFromDB.filter(u => u.is_active).length
    const inactiveUsers = allUsersFromDB.filter(u => !u.is_active).length
    const adminUsers = allUsersFromDB.filter(u => u.role === 'admin').length
    const verifiedUsers = allUsersFromDB.filter(u => u.email_verified).length

    console.log(`👥 Total usuarios: ${totalUsers}`)
    console.log(`✅ Usuarios activos: ${activeUsers}`)
    console.log(`❌ Usuarios inactivos: ${inactiveUsers}`)
    console.log(`🛡️ Administradores: ${adminUsers}`)
    console.log(`📧 Emails verificados: ${verifiedUsers}`)

    // 3. Verificar usuarios específicos que podrían tener problemas
    console.log('\n🔍 VERIFICACIÓN DE USUARIOS ESPECÍFICOS:')
    console.log('-'.repeat(50))

    // Buscar usuarios activos que podrían estar marcados incorrectamente
    const suspiciousUsers = allUsersFromDB.filter(user => {
      // Usuarios activos pero con datos sospechosos
      return user.is_active && (!user.email_verified || !user.full_name)
    })

    if (suspiciousUsers.length > 0) {
      console.log(`⚠️ Usuarios activos sospechosos encontrados: ${suspiciousUsers.length}`)
      suspiciousUsers.forEach(user => {
        console.log(
          `  ID: ${user.id} | Email: ${user.email} | Nombre: ${user.full_name || 'SIN NOMBRE'} | Email Verificado: ${user.email_verified}`
        )
      })
    } else {
      console.log('✅ No se encontraron usuarios sospechosos')
    }

    // 4. Comparar con diferentes filtros
    console.log('\n🔄 COMPARACIÓN CON DIFERENTES FILTROS:')
    console.log('-'.repeat(50))

    // Solo usuarios activos
    const { data: activeOnly, error: activeError } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .order('id')

    if (!activeError && activeOnly) {
      console.log(`👤 Usuarios activos (is_active=true): ${activeOnly.length}`)
      console.log('   IDs:', activeOnly.map(u => u.id).join(', '))
    }

    // Solo usuarios inactivos
    const { data: inactiveOnly, error: inactiveError } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', false)
      .order('id')

    if (!inactiveError && inactiveOnly) {
      console.log(`👤 Usuarios inactivos (is_active=false): ${inactiveOnly.length}`)
      console.log('   IDs:', inactiveOnly.map(u => u.id).join(', '))
    }

    // 5. Verificar permisos de admin vs usuario normal
    console.log('\n🔐 VERIFICACIÓN DE PERMISOS:')
    console.log('-'.repeat(50))

    // Simular consulta como admin (sin filtros de actividad)
    const { data: adminView, error: adminError } = await supabase
      .from('users')
      .select('*')
      .order('id')

    if (!adminError && adminView) {
      console.log(`👑 Vista admin (todos los usuarios): ${adminView.length}`)
      console.log(`   Activos: ${adminView.filter(u => u.is_active).length}`)
      console.log(`   Inactivos: ${adminView.filter(u => !u.is_active).length}`)
    }

    // 6. Resumen del problema potencial
    console.log('\n🚨 ANÁLISIS DEL PROBLEMA:')
    console.log('-'.repeat(50))

    if (activeUsers !== activeOnly?.length) {
      console.log(`❌ DISCREPANCIA DETECTADA:`)
      console.log(`   - BD total activos: ${activeUsers}`)
      console.log(`   - Consulta filtrada activos: ${activeOnly?.length}`)
      console.log(`   - Diferencia: ${Math.abs(activeUsers - (activeOnly?.length || 0))}`)
    } else {
      console.log(`✅ CONSISTENCIA CONFIRMADA:`)
      console.log(`   - BD total activos: ${activeUsers}`)
      console.log(`   - Consulta filtrada activos: ${activeOnly?.length}`)
    }

    console.log('\n📋 RESUMEN EJECUTIVO:')
    console.log('='.repeat(50))
    console.log(`• Usuarios en BD: ${totalUsers}`)
    console.log(
      `• Usuarios activos: ${activeUsers} (${((activeUsers / totalUsers) * 100).toFixed(1)}%)`
    )
    console.log(
      `• Usuarios inactivos: ${inactiveUsers} (${((inactiveUsers / totalUsers) * 100).toFixed(1)}%)`
    )
    console.log(`• Administradores: ${adminUsers}`)
    console.log(
      `• Emails verificados: ${verifiedUsers} (${((verifiedUsers / totalUsers) * 100).toFixed(1)}%)`
    )

    if (suspiciousUsers.length > 0) {
      console.log(
        `\n⚠️ USUARIOS SOSPECHOSOS: ${suspiciousUsers.length} usuarios activos con datos inconsistentes`
      )
    }

    console.log('\n✅ DEBUG COMPLETADO')
  } catch (error) {
    console.error('❌ Error durante el debug:', error)
  }
}

// Ejecutar el debug
debugUserIsActiveIssue()
