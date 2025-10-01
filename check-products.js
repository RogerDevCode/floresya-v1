import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
)

async function check() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, sku, active')
    .order('id')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`\n📊 Total productos en DB: ${data.length}\n`)
  data.forEach(p => {
    console.log(`${p.active ? '✅' : '❌'} ID ${p.id}: ${p.sku} - ${p.name}`)
  })
}

check()
