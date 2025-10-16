#!/usr/bin/env node

/**
 * Standalone Migration Script
 * Adds is_active column to settings table
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY
)

async function addIsActiveToSettings() {
  try {
    console.log('🔧 Starting migration: Adding is_active column to settings table...')

    // Direct SQL execution - try to add the column
    const sql = `
      ALTER TABLE public.settings 
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
      
      COMMENT ON COLUMN public.settings.is_active 
      IS 'Soft-delete flag - false means setting is deactivated';
      
      UPDATE public.settings 
      SET is_active = true 
      WHERE is_active IS NULL;
    `

    // Execute the SQL
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql })

    if (error) {
      console.error('❌ Error executing SQL:', error)
      return
    }

    console.log('✅ Migration completed successfully!')
    console.log('Data:', data)
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Run the migration
addIsActiveToSettings()
