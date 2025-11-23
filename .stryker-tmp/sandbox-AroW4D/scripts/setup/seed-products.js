/**
 * Seed Script for Products
 * Creates sample flower products for FloresYa
 *
 * Usage: node scripts/seed-products.js
 */
// @ts-nocheck

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
)

const USD_TO_VES = 36.45

const products = [
  {
    name: 'Ramo Tropical Vibrante',
    summary: 'Flores tropicales exóticas vibrantes',
    description:
      'Explosión de colores tropicales con aves del paraíso, heliconias y flores exóticas',
    price_usd: 45.99,
    stock: '25',
    sku: 'FY-001',
    active: true,
    featured: true,
    carousel_order: '1'
  },
  {
    name: 'Bouquet Arcoíris de Rosas',
    summary: 'Rosas multicolores espectaculares',
    description: 'Rosas multicolores que forman un hermoso arcoíris de emociones',
    price_usd: 52.99,
    stock: '30',
    sku: 'FY-002',
    active: true,
    featured: true,
    carousel_order: '2'
  },
  {
    name: 'Girasoles Gigantes Alegres',
    summary: 'Girasoles enormes y radiantes',
    description: 'Girasoles enormes que irradian alegría y energía positiva',
    price_usd: 38.99,
    stock: '20',
    sku: 'FY-003',
    active: true,
    featured: false,
    carousel_order: null
  },
  {
    name: 'Orquídeas Elegantes Premium',
    summary: 'Orquídeas exóticas sofisticadas',
    description: 'Orquídeas exóticas de alta calidad en arreglo sofisticado',
    price_usd: 68.99,
    stock: '15',
    sku: 'FY-004',
    active: true,
    featured: true,
    carousel_order: '3'
  },
  {
    name: 'Lirios Blancos Puros',
    summary: 'Lirios blancos símbolo de pureza',
    description: 'Lirios blancos simbolizando pureza y elegancia',
    price_usd: 42.99,
    stock: '18',
    sku: 'FY-005',
    active: true,
    featured: false,
    carousel_order: null
  },
  {
    name: 'Tulipanes Holandeses Mix',
    summary: 'Tulipanes importados vibrantes',
    description: 'Tulipanes importados en colores vibrantes del valle holandés',
    price_usd: 49.99,
    stock: '22',
    sku: 'FY-006',
    active: true,
    featured: true,
    carousel_order: '4'
  },
  {
    name: 'Rosas Rojas Clásicas',
    summary: 'Rosas rojas símbolo del amor',
    description: 'Docena de rosas rojas, el símbolo eterno del amor',
    price_usd: 55.99,
    stock: '40',
    sku: 'FY-007',
    active: true,
    featured: true,
    carousel_order: '5'
  },
  {
    name: 'Hortensias Azules Románticas',
    summary: 'Hortensias azules delicadas',
    description: 'Hortensias azules en arreglo romántico y delicado',
    price_usd: 46.99,
    stock: '16',
    sku: 'FY-008',
    active: true,
    featured: false,
    carousel_order: null
  },
  {
    name: 'Claveles Multicolor Festivos',
    summary: 'Claveles coloridos alegres',
    description: 'Claveles coloridos perfectos para celebraciones alegres',
    price_usd: 32.99,
    stock: '28',
    sku: 'FY-009',
    active: true,
    featured: false,
    carousel_order: null
  },
  {
    name: 'Ramo Campestre Silvestre',
    summary: 'Flores silvestres naturales',
    description: 'Flores silvestres en arreglo natural y espontáneo',
    price_usd: 39.99,
    stock: '24',
    sku: 'FY-010',
    active: true,
    featured: true,
    carousel_order: '6'
  },
  {
    name: 'Margaritas Blancas Frescas',
    summary: 'Margaritas blancas simples',
    description: 'Margaritas blancas que transmiten frescura y simplicidad',
    price_usd: 29.99,
    stock: '35',
    sku: 'FY-011',
    active: true,
    featured: false,
    carousel_order: null
  },
  {
    name: 'Peonías Rosadas Deluxe',
    summary: 'Peonías rosadas de temporada',
    description: 'Peonías rosadas de temporada, suaves y voluminosas',
    price_usd: 72.99,
    stock: '12',
    sku: 'FY-012',
    active: true,
    featured: true,
    carousel_order: '7'
  }
]

async function seedProducts() {
  try {
    console.log('🌱 Starting product seeding...\n')

    console.log('🧹 Cleaning existing products...')
    const { error: deleteError } = await supabase.from('products').delete().neq('id', 0)

    if (deleteError) {
      console.warn('⚠ Warning: Could not clean existing products:', deleteError.message)
      console.log('Continuing with seeding...\n')
    } else {
      console.log('✓ Products cleaned\n')
    }

    console.log('📦 Inserting products...')

    const productsWithVes = products.map(product => ({
      ...product,
      price_ves: (product.price_usd * USD_TO_VES).toFixed(2)
    }))

    const { data, error } = await supabase.from('products').insert(productsWithVes).select()

    if (error) {
      throw error
    }

    console.log(`✓ Inserted ${data.length} products\n`)

    // Summary
    const totalStock = data.reduce((sum, p) => sum + p.stock, 0)
    const featuredCount = data.filter(p => p.featured).length

    console.log('='.repeat(50))
    console.log('📊 SEEDING SUMMARY')
    console.log('='.repeat(50))
    console.log(`✓ Total Products: ${data.length}`)
    console.log(`✓ Featured Products: ${featuredCount}`)
    console.log(`✓ Total Stock: ${totalStock} units`)
    console.log(
      `✓ Price Range: ${Math.min(...data.map(p => p.price_usd)).toFixed(2)} - ${Math.max(...data.map(p => p.price_usd)).toFixed(2)}`
    )
    console.log('='.repeat(50))
    console.log('\n✅ Product seeding completed successfully!')
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedProducts()
