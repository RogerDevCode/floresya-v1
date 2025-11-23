/**
 * Verificación de Registros Huérfanos - product_occasions
 * Verifica la integridad referencial y busca registros huérfanos
 */
// @ts-nocheck

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '../.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos')
  console.error('   Verifica el archivo .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Verificar si existen restricciones de clave foránea
 */
async function checkForeignKeyConstraints() {
  console.log('\n1️⃣ VERIFICANDO RESTRICCIONES DE CLAVE FORÁNEA')
  console.log('='.repeat(60))

  const { data, error } = await supabase
    .from('information_schema.table_constraints')
    .select('*')
    .eq('table_name', 'product_occasions')
    .eq('constraint_type', 'FOREIGN KEY')

  if (error) {
    console.error('❌ Error al consultar restricciones:', error.message)
    return false
  }

  if (!data || data.length === 0) {
    console.log('⚠️  ADVERTENCIA: No se encontraron restricciones de clave foránea')
    console.log('   Se deben aplicar las restricciones para prevenir registros huérfanos')
    return false
  }

  console.log('✅ Restricciones encontradas:')
  data.forEach(constraint => {
    console.log(`   - ${constraint.constraint_name}`)
  })

  return true
}

/**
 * Buscar registros huérfanos - product_id que no existe en products
 */
async function checkOrphanedProductIds() {
  console.log('\n2️⃣ VERIFICANDO REGISTROS HUÉRFANOS - PRODUCTS')
  console.log('='.repeat(60))

  // Buscar product_occasions con product_id inexistente
  const { data, error } = await supabase.from('product_occasions').select('product_id')

  if (error) {
    console.error('❌ Error al consultar product_occasions:', error.message)
    return
  }

  if (!data || data.length === 0) {
    console.log('ℹ️  No hay registros en product_occasions')
    return { orphaned: 0, total: 0 }
  }

  const total = data.length
  const orphanedProducts = []

  // Verificar cada product_id
  for (const po of data) {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', po.product_id)
      .single()

    if (productError || !product) {
      orphanedProducts.push(po.product_id)
    }
  }

  console.log(`📊 Total de registros en product_occasions: ${total}`)
  console.log(`🔴 Registros huérfanos (product_id inexistente): ${orphanedProducts.length}`)

  if (orphanedProducts.length > 0) {
    console.log('❌ IDs de productos huérfanos:', orphanedProducts.slice(0, 10).join(', '))
    if (orphanedProducts.length > 10) {
      console.log(`   ... y ${orphanedProducts.length - 10} más`)
    }
  } else {
    console.log('✅ No se encontraron registros huérfanos de productos')
  }

  return { orphaned: orphanedProducts.length, total }
}

/**
 * Buscar registros huérfanos - occasion_id que no existe en occasions
 */
async function checkOrphanedOccasionIds() {
  console.log('\n3️⃣ VERIFICANDO REGISTROS HUÉRFANOS - OCCASIONS')
  console.log('='.repeat(60))

  // Buscar product_occasions con occasion_id inexistente
  const { data, error } = await supabase.from('product_occasions').select('occasion_id')

  if (error) {
    console.error('❌ Error al consultar product_occasions:', error.message)
    return
  }

  if (!data || data.length === 0) {
    console.log('ℹ️  No hay registros en product_occasions')
    return { orphaned: 0, total: 0 }
  }

  const total = data.length
  const orphanedOccasions = []

  // Verificar cada occasion_id
  for (const po of data) {
    const { data: occasion, error: occasionError } = await supabase
      .from('occasions')
      .select('id')
      .eq('id', po.occasion_id)
      .single()

    if (occasionError || !occasion) {
      orphanedOccasions.push(po.occasion_id)
    }
  }

  console.log(`📊 Total de registros en product_occasions: ${total}`)
  console.log(`🔴 Registros huérfanos (occasion_id inexistente): ${orphanedOccasions.length}`)

  if (orphanedOccasions.length > 0) {
    console.log('❌ IDs de ocasiones huérfanas:', orphanedOccasions.slice(0, 10).join(', '))
    if (orphanedOccasions.length > 10) {
      console.log(`   ... y ${orphanedOccasions.length - 10} más`)
    }
  } else {
    console.log('✅ No se encontraron registros huérfanos de ocasiones')
  }

  return { orphaned: orphanedOccasions.length, total }
}

/**
 * Verificar duplicados
 */
async function checkDuplicates() {
  console.log('\n4️⃣ VERIFICANDO DUPLICADOS')
  console.log('='.repeat(60))

  const { data, error } = await supabase.from('product_occasions').select('product_id, occasion_id')

  if (error) {
    console.error('❌ Error al consultar product_occasions:', error.message)
    return
  }

  if (!data || data.length === 0) {
    console.log('ℹ️  No hay registros en product_occasions')
    return
  }

  // Contar duplicados
  const counts = {}
  data.forEach(po => {
    const key = `${po.product_id}-${po.occasion_id}`
    counts[key] = (counts[key] || 0) + 1
  })

  const duplicates = Object.entries(counts).filter(([_key, count]) => count > 1)
  const duplicateCount = duplicates.length

  console.log(`📊 Total de registros: ${data.length}`)
  console.log(`🔴 Pares duplicados: ${duplicateCount}`)

  if (duplicateCount > 0) {
    console.log('❌ Duplicados encontrados:')
    duplicates.slice(0, 5).forEach(([key, count]) => {
      const [productId, occasionId] = key.split('-')
      console.log(`   - Product ${productId} + Occasion ${occasionId}: ${count} veces`)
    })
    if (duplicates.length > 5) {
      console.log(`   ... y ${duplicates.length - 5} más`)
    }
  } else {
    console.log('✅ No se encontraron duplicados')
  }
}

/**
 * Mostrar estadísticas generales
 */
async function showGeneralStats() {
  console.log('\n5️⃣ ESTADÍSTICAS GENERALES')
  console.log('='.repeat(60))

  // Contar total en product_occasions
  const { count: totalOccurrences, error: countError } = await supabase
    .from('product_occasions')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('❌ Error al contar registros:', countError.message)
    return
  }

  // Contar productos únicos
  const { count: uniqueProducts, error: productsError } = await supabase
    .from('product_occasions')
    .select('product_id', { count: 'exact', head: true })
    .not('product_id', 'is', null)

  if (productsError) {
    console.error('❌ Error al contar productos únicos:', productsError.message)
    return
  }

  // Contar ocasiones únicas
  const { count: uniqueOccasions, error: occasionsError } = await supabase
    .from('product_occasions')
    .select('occasion_id', { count: 'exact', head: true })
    .not('occasion_id', 'is', null)

  if (occasionsError) {
    console.error('❌ Error al contar ocasiones únicas:', occasionsError.message)
    return
  }

  console.log(`📊 Total de relaciones (product_occasions): ${totalOccurrences}`)
  console.log(`📊 Productos únicos con ocasiones: ${uniqueProducts}`)
  console.log(`📊 Ocasiones únicas con productos: ${uniqueOccasions}`)
}

/**
 * Función principal
 */
async function main() {
  console.log('\n')
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║   VERIFICACIÓN DE INTEGRIDAD - TABLA product_occasions    ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')

  try {
    // 1. Verificar restricciones
    const hasConstraints = await checkForeignKeyConstraints()

    // 2. Verificar registros huérfanos
    const productOrphans = await checkOrphanedProductIds()
    const occasionOrphans = await checkOrphanedOccasionIds()

    // 3. Verificar duplicados
    await checkDuplicates()

    // 4. Mostrar estadísticas
    await showGeneralStats()

    // 5. Resumen final
    console.log('\n' + '='.repeat(60))
    console.log('📋 RESUMEN FINAL')
    console.log('='.repeat(60))

    if (!hasConstraints) {
      console.log('⚠️  RESTRICCIONES FALTANTES:')
      console.log('   Ejecuta: apply-product-occasions-constraints.sql')
      console.log('   Esto prevendrá futuros registros huérfanos')
      console.log('')
    }

    const totalOrphans = (productOrphans?.orphaned || 0) + (occasionOrphans?.orphaned || 0)

    if (totalOrphans > 0) {
      console.log('❌ SE ENCONTRARON REGISTROS HUÉRFANOS:')
      console.log(`   - Productos huérfanos: ${productOrphans?.orphaned || 0}`)
      console.log(`   - Ocasiones huérfanas: ${occasionOrphans?.orphaned || 0}`)
      console.log('')
      console.log('🛠️  ACCIÓN REQUERIDA:')
      console.log('   1. Revisa y elimina los registros huérfanos')
      console.log('   2. Aplica las restricciones de clave foránea')
    } else {
      console.log('✅ NO SE ENCONTRARON REGISTROS HUÉRFANOS')
      console.log('✅ La integridad referencial está correcta')
    }

    console.log('')
    console.log('='.repeat(60))
  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await supabase.auth?.signOut()
    process.exit(0)
  }
}

// Ejecutar verificación
main()
