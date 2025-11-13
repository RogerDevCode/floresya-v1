#!/usr/bin/env node

/**
 * Verificador de Preparación para Migración Fase 1
 * Verifica que todos los archivos estén listos antes de ejecutar
 */

import { access, readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function verifyPhase1Readiness() {
  console.log('🔍 Verificando preparación para Migración Fase 1')
  console.log('='.repeat(60))
  console.log()

  let allReady = true
  const checks = []

  // Verificar archivos necesarios
  const requiredFiles = [
    {
      name: 'Archivo de migración SQL',
      path: path.resolve(__dirname, '../../migrations/20251104_database_phase1_constraints.sql'),
      critical: true
    },
    {
      name: 'Guía de migración',
      path: path.resolve(__dirname, '../../MIGRATION_PHASE1_GUIDE.md'),
      critical: true
    },
    {
      name: 'Script ejecutor',
      path: path.resolve(__dirname, './phase1-migration.js'),
      critical: true
    },
    {
      name: 'Reporte de auditoría',
      path: path.resolve(__dirname, '../../DATABASE_AUDIT_REPORT.md'),
      critical: true
    }
  ]

  for (const file of requiredFiles) {
    try {
      await access(file.path)
      checks.push({
        name: file.name,
        status: '✅',
        message: `Encontrado: ${file.path}`,
        critical: file.critical
      })
    } catch (error) {
      console.error('Error:', error)
      allReady = false
      checks.push({
        name: file.name,
        status: '❌',
        message: `FALTANTE: ${file.path}`,
        critical: file.critical
      })
    }
  }

  // Verificar contenido del archivo SQL
  console.log('📖 Verificando contenido del archivo SQL...')
  try {
    const sqlPath = path.resolve(
      __dirname,
      '../../migrations/20251104_database_phase1_constraints.sql'
    )
    const sqlContent = await readFile(sqlPath, 'utf8')

    const checks_sql = [
      { pattern: /CREATE TYPE.*setting_type/, name: 'ENUM setting_type' },
      { pattern: /CREATE TYPE.*query_timeout_estado/, name: 'ENUM query_timeout_estado' },
      { pattern: /CREATE TYPE.*query_timeout_tipo/, name: 'ENUM query_timeout_tipo' },
      { pattern: /ALTER TABLE.*SET NOT NULL/, name: 'Constraints NOT NULL' },
      { pattern: /ADD CONSTRAINT.*CHECK/, name: 'Constraints CHECK' },
      { pattern: /CREATE TRIGGER/, name: 'Triggers' },
      { pattern: /CREATE INDEX/, name: 'Índices' }
    ]

    for (const check of checks_sql) {
      if (check.pattern.test(sqlContent)) {
        checks.push({
          name: `SQL: ${check.name}`,
          status: '✅',
          message: 'Encontrado en el archivo',
          critical: true
        })
      } else {
        allReady = false
        checks.push({
          name: `SQL: ${check.name}`,
          status: '❌',
          message: 'NO encontrado en el archivo',
          critical: true
        })
      }
    }

    // Estadísticas del archivo
    const lineCount = sqlContent.split('\n').length
    checks.push({
      name: 'Tamaño del archivo SQL',
      status: '✅',
      message: `${(sqlContent.length / 1024).toFixed(2)} KB, ${lineCount} líneas`,
      critical: false
    })
  } catch (error) {
    allReady = false
    checks.push({
      name: 'Verificación de contenido SQL',
      status: '❌',
      message: `Error leyendo archivo: ${error.message}`,
      critical: true
    })
  }

  // Verificar variables de entorno
  console.log()
  console.log('🔐 Verificando variables de entorno...')
  const envVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY']

  for (const envVar of envVars) {
    const value = process.env[envVar]
    if (value) {
      const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4)
      checks.push({
        name: `Env: ${envVar}`,
        status: '✅',
        message: `${masked}`,
        critical: false
      })
    } else {
      checks.push({
        name: `Env: ${envVar}`,
        status: '⚠️ ',
        message: 'No configurada (requerida para ejecución automática)',
        critical: false
      })
    }
  }

  // Mostrar resultados
  console.log()
  console.log('📊 Resultados de Verificación:')
  console.log('='.repeat(60))

  for (const check of checks) {
    const icon = check.status
    console.log(`${icon} ${check.name}`)
    console.log(`   ${check.message}`)
    console.log()
  }

  // Resumen
  console.log('='.repeat(60))
  if (allReady) {
    console.log('✅ TODOS LOS ARCHIVOS CRÍTICOS ESTÁN LISTOS')
    console.log()
    console.log('📋 Próximos pasos:')
    console.log()
    console.log('1. EJECUCIÓN AUTOMÁTICA (si tiene variables de entorno configuradas):')
    console.log('   node scripts/database/phase1-migration.js')
    console.log()
    console.log('2. EJECUCIÓN MANUAL via Supabase Dashboard:')
    console.log('   a) Abrir: https://supabase.com/dashboard')
    console.log('   b) Ir a SQL Editor')
    console.log('   c) Ejecutar: migrations/20251104_database_phase1_constraints.sql')
    console.log()
    console.log('3. VERIFICACIÓN POST-MIGRACIÓN:')
    console.log('   Revisar MIGRATION_PHASE1_GUIDE.md para queries de verificación')
    console.log()
  } else {
    console.log('❌ ARCHIVOS FALTANTES O INVÁLIDOS')
    console.log()
    console.log('Por favor, complete la configuración antes de continuar.')
    console.log()
  }

  // Mostrar resumen de cambios
  console.log()
  console.log('📊 Resumen de Cambios a Aplicar:')
  console.log('-'.repeat(60))
  console.log('  ✓ 15+ constraints NOT NULL')
  console.log('  ✓ 12+ constraints CHECK')
  console.log('  ✓ 2 triggers críticos')
  console.log('  ✓ 5+ índices nuevos')
  console.log('  ✓ 3 ENUMs nuevos')
  console.log()
  console.log('⏱️  Tiempo estimado: 2-5 minutos')
  console.log('🔄 Idempotente: Sí, puede ejecutarse múltiples veces')
  console.log()

  return allReady
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyPhase1Readiness()
    .then(ready => process.exit(ready ? 0 : 1))
    .catch(error => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

export { verifyPhase1Readiness }
