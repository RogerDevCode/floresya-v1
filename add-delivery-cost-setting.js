/**
 * Add DELIVERY_COST_USD setting to Supabase
 * Run: node add-delivery-cost-setting.js
 */

import { supabase } from './api/services/supabaseClient.js'

async function addDeliveryCostSetting() {
  try {
    console.log('Adding DELIVERY_COST_USD setting...')

    const { data, error } = await supabase
      .from('settings')
      .upsert(
        {
          key: 'DELIVERY_COST_USD',
          value: '5.00',
          description: 'Costo de envío a domicilio en USD',
          is_public: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'key'
        }
      )
      .select()

    if (error) {
      throw error
    }

    console.log('✅ DELIVERY_COST_USD setting added successfully:', data)
  } catch (error) {
    console.error('❌ Error adding setting:', error.message)
    process.exit(1)
  }
}

addDeliveryCostSetting()
