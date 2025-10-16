/**
 * Migration Controller
 * Temporary endpoint for database migrations
 * ONLY FOR DEVELOPMENT USE
 */

import { supabase } from '../services/supabaseClient.js'
import { DatabaseError } from '../errors/AppError.js'

/**
 * Execute migration to add is_active column to settings table
 * TEMPORARY ENDPOINT - ONLY FOR DEVELOPMENT
 */
export const addIsActiveToSettings = async (req, res) => {
  try {
    console.log('🔧 Executing migration: Adding is_active column to settings table...')

    // Check if column exists
    const { data: columnExists, error: checkError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'is_active'
      `
    })

    if (checkError) {
      console.error('❌ Error checking column existence:', checkError)
      throw new DatabaseError('CHECK_COLUMN', 'information_schema', checkError)
    }

    if (columnExists && columnExists.length > 0) {
      console.log('✅ Column is_active already exists in settings table')
      return res.status(200).json({
        success: true,
        message: 'Column is_active already exists in settings table'
      })
    }

    // Add is_active column
    const { error: addColumnError } = await supabase.rpc('execute_sql', {
      sql_query: `
        ALTER TABLE public.settings 
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
        
        COMMENT ON COLUMN public.settings.is_active 
        IS 'Soft-delete flag - false means setting is deactivated';
      `
    })

    if (addColumnError) {
      console.error('❌ Error adding is_active column:', addColumnError)
      throw new DatabaseError('ALTER_TABLE', 'settings', addColumnError)
    }

    // Update existing records
    const { error: updateError } = await supabase.rpc('execute_sql', {
      sql_query: `
        UPDATE public.settings 
        SET is_active = true 
        WHERE is_active IS NULL;
      `
    })

    if (updateError) {
      console.error('❌ Error updating existing records:', updateError)
      throw new DatabaseError('UPDATE', 'settings', updateError)
    }

    console.log('✅ Successfully added is_active column to settings table')

    res.status(200).json({
      success: true,
      message: 'Successfully added is_active column to settings table'
    })
  } catch (error) {
    console.error('❌ Migration failed:', error)
    res.status(500).json({
      success: false,
      error: 'MigrationError',
      message: 'Failed to execute migration: ' + error.message
    })
  }
}
