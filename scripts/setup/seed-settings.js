/**
 * Seed Settings Script
 * Adds missing settings to the database
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Settings to seed
const settingsToSeed = [
  {
    key: 'hero_image',
    value: null,
    description: 'URL de la imagen hero de la página principal',
    type: 'string',
    is_public: true
  },
  {
    key: 'site_logo',
    value: null,
    description: 'URL del logo del sitio',
    type: 'string',
    is_public: true
  },
  {
    key: 'bcv_usd_rate',
    value: null,
    description: 'Tipo de cambio USD según BCV (Banco Central de Venezuela)',
    type: 'string',
    is_public: true
  }
]

async function seedSettings() {
  console.log('🌱 Seeding settings...')

  for (const setting of settingsToSeed) {
    try {
      // Check if setting already exists
      const { data: existing, error: checkError } = await supabase
        .from('settings')
        .select('id')
        .eq('key', setting.key)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Error checking setting ${setting.key}: ${checkError.message}`)
      }

      if (existing) {
        console.log(`⚠️  Setting ${setting.key} already exists, skipping...`)
        continue
      }

      // Insert new setting
      const { error: insertError } = await supabase.from('settings').insert(setting).select()

      if (insertError) {
        throw new Error(`Error inserting setting ${setting.key}: ${insertError.message}`)
      }

      console.log(`✅ Setting ${setting.key} inserted successfully`)
    } catch (error) {
      console.error(`❌ Error seeding setting ${setting.key}:`, error.message)
    }
  }

  console.log('✨ Settings seeding completed!')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSettings()
}

export { seedSettings }
