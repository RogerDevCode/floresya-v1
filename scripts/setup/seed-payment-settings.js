/**
 * Seed Payment Settings
 * Configura los valores iniciales para delivery cost y tasa BCV
 */

import { supabase } from '../api/services/supabaseClient.js'

const PAYMENT_SETTINGS = [
  {
    key: 'DELIVERY_COST_USD',
    value: '7.00',
    type: 'string',
    description: 'Costo de delivery en USD para Gran Caracas',
    is_public: true
  },
  {
    key: 'bcv_usd_rate',
    value: '40.00',
    type: 'string',
    description: 'Tasa de cambio BCV (USD a VES) actualizada diariamente',
    is_public: true
  }
]

async function seedSettings() {
  console.log('🌱 Seeding payment settings...')

  for (const setting of PAYMENT_SETTINGS) {
    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('settings')
        .select('*')
        .eq('key', setting.key)
        .single()

      if (existing) {
        console.log(`✅ Setting "${setting.key}" already exists: ${existing.value}`)

        // Update value if different
        if (existing.value !== setting.value) {
          const { error: updateError } = await supabase
            .from('settings')
            .update({ value: setting.value })
            .eq('key', setting.key)

          if (updateError) {
            console.error(`❌ Error updating "${setting.key}":`, updateError.message)
          } else {
            console.log(`🔄 Updated "${setting.key}": ${existing.value} → ${setting.value}`)
          }
        }
        continue
      }

      // Insert new setting
      const { data, error } = await supabase.from('settings').insert(setting).select().single()

      if (error) {
        console.error(`❌ Error inserting "${setting.key}":`, error.message)
        continue
      }

      console.log(`✅ Created setting "${setting.key}": ${data.value}`)
    } catch (error) {
      console.error(`❌ Error processing "${setting.key}":`, error)
    }
  }

  console.log('✅ Payment settings seeding completed!')
}

seedSettings()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
