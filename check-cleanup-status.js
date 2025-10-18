#!/usr/bin/env node

/**
 * Script rápido para verificar el estado después de la limpieza
 */

import { supabase } from './api/services/supabaseClient.js'

async function checkStatus() {
  try {
    console.log('🔍 Verificando estado después de la limpieza...')

    // Contar usuarios totales
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (usersError) {
      console.error('❌ Error contando usuarios:', usersError)
      return
    }

    // Obtener últimos usuarios
    const { data: lastUsers, error: lastUsersError } = await supabase
      .from('users')
      .select('id, email, created_at')
      .order('id', { ascending: false })
      .limit(5)

    if (lastUsersError) {
      console.error('❌ Error obteniendo últimos usuarios:', lastUsersError)
      return
    }

    console.log(`✅ Total de usuarios en BD: ${totalUsers}`)
    console.log('\n📊 Últimos 5 usuarios:')
    console.log('ID\tEmail\t\t\t\tCreado')
    console.log('-'.repeat(60))

    lastUsers.forEach(user => {
      const email = (user.email || '').padEnd(30)
      console.log(`${user.id}\t${email}\t${user.created_at?.split('T')[0]}`)
    })
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkStatus()
