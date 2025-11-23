import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabase = createClient(
  'https://dcbavpdlkcjdtjdkntde.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjYmF2cGRsa2NqZHRqZGtudGRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njc2Nzg5OSwiZXhwIjoyMDcyMzQzODk5fQ.MwbJfs2vXZJMDXT5bcdYjt0_pZ1OD7V7b_v0q_3tK2Q'
)

console.log('🔍 SCHEMA VERIFICATION\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

// Get all tables from live DB
const { data: tables } = await supabase.rpc('exec_sql', {
  sql_query: `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `
})

if (tables && tables.length > 0) {
  console.log('📊 TABLES IN LIVE DATABASE:\n')
  tables.forEach(t => console.log(`   ✓ ${t.table_name}`))
} else {
  console.log('⚠️  Could not retrieve tables via RPC\n')
}

// Check products table structure
const { data: productCols } = await supabase.rpc('exec_sql', {
  sql_query: `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'products'
    ORDER BY ordinal_position;
  `
})

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
console.log('📋 PRODUCTS TABLE COLUMNS:\n')

if (productCols && productCols.length > 0) {
  productCols.forEach(col => {
    console.log(`   ${col.column_name.padEnd(20)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`)
  })
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
