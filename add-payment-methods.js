/**
 * Add Venezuelan Payment Methods to Database
 * Seeds the payment_methods table with common Venezuelan payment options
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const paymentMethods = [
  {
    name: 'Efectivo',
    type: 'cash',
    description: 'Pago en efectivo contra entrega',
    is_active: true,
    display_order: 1
  },
  {
    name: 'Pago Móvil',
    type: 'mobile_payment',
    description: 'Transferencia bancaria por número de teléfono',
    is_active: true,
    display_order: 2
  },
  {
    name: 'Transferencia Bancaria',
    type: 'bank_transfer',
    description: 'Transferencia desde cuenta bancaria',
    is_active: true,
    display_order: 3
  },
  {
    name: 'Zelle',
    type: 'international',
    description: 'Pago internacional por email',
    is_active: true,
    display_order: 4
  },
  {
    name: 'Binance Pay',
    type: 'crypto',
    description: 'Pago con criptomonedas',
    is_active: true,
    display_order: 5
  }
]

async function addPaymentMethods() {
  try {
    console.log('🌱 Seeding Venezuelan payment methods...')

    // Insert new payment methods (without clearing existing ones to avoid RLS issues)
    const { data, error } = await supabase.from('payment_methods').insert(paymentMethods).select()

    if (error) {
      throw new Error(`Failed to insert payment methods: ${error.message}`)
    }

    console.log(`✅ Successfully added ${data.length} payment methods:`)
    data.forEach(method => {
      console.log(`   • ${method.name} (${method.type}) - Order: ${method.display_order}`)
    })

    console.log('\n🎉 Payment methods seeded successfully!')
    console.log('You can now test the payment page at: http://localhost:3000/pages/payment.html')
  } catch (error) {
    console.error('❌ Error seeding payment methods:', error.message)
    process.exit(1)
  }
}

// Run the seeder
addPaymentMethods()
