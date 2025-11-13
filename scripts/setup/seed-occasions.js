/**
 * Seed Script for Occasions
 * Creates sample occasions for FloresYa
 *
 * Usage: node scripts/setup/seed-occasions.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
)

const occasions = [
  { slug: 'cumpleanos', name: 'Cumpleaños', description: 'Flores para cumpleaños', active: true },
  {
    slug: 'aniversario',
    name: 'Aniversario',
    description: 'Flores para aniversarios',
    active: true
  },
  {
    slug: 'dia-de-la-madre',
    name: 'Día de la Madre',
    description: 'Flores para el día de la madre',
    active: true
  },
  {
    slug: 'san-valentin',
    name: 'San Valentín',
    description: 'Flores para san valentín',
    active: true
  },
  { slug: 'boda', name: 'Boda', description: 'Flores para bodas', active: true },
  { slug: 'graduacion', name: 'Graduación', description: 'Flores para graduaciones', active: true },
  { slug: 'felicidades', name: 'Felicidades', description: 'Flores para felicitar', active: true }
]

async function seedOccasions() {
  try {
    console.log('🌱 Starting occasions seeding...\n')

    console.log('🧹 Cleaning existing occasions...')
    const { error: deleteError } = await supabase.from('occasions').delete().neq('id', 0)

    if (deleteError) {
      console.warn('⚠ Warning: Could not clean existing occasions:', deleteError.message)
    } else {
      console.log('✓ Occasions cleaned\n')
    }

    console.log('📦 Inserting occasions...')
    const { data, error } = await supabase.from('occasions').insert(occasions).select()

    if (error) {
      throw error
    }

    console.log(`✓ Inserted ${data.length} occasions\n`)

    // Summary
    console.log('='.repeat(50))
    console.log('📊 SEEDING SUMMARY')
    console.log('='.repeat(50))
    console.log(`✓ Total Occasions: ${data.length}`)
    console.log(`✓ All Active: ${data.every(o => o.active) ? 'Yes' : 'No'}`)
    console.log('='.repeat(50))
    console.log('\n✅ Occasions seeding completed successfully!')
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedOccasions()
