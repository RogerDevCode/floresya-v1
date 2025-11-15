/**
 * Procesado por B
 */

/**
 * Migration Service
 * Handles database schema migrations
 * Service Layer Exclusivo: Only service that can access supabaseClient
 *
 * Uses centralized structured logging
 */

import { supabase } from './supabaseClient.js'
import { log as logger } from '../utils/logger.js'
import { DatabaseError } from '../errors/AppError.js'

/**
 * Execute migration to add active column to settings table
 * @returns {Object} Migration result
 * @throws {DatabaseError} If migration fails
 */
export async function addIsActiveToSettings() {
  logger.info('Executing migration: Adding active column to settings table')

  try {
    // Check if column exists
    const { data: columnExists, error: checkError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'settings' AND column_name = 'active'
      `
    })

    if (checkError) {
      logger.error('Error checking column existence', checkError)
      throw new DatabaseError('CHECK_COLUMN', 'information_schema', checkError)
    }

    if (columnExists && columnExists.length > 0) {
      logger.info('Column active already exists in settings table')
      return {
        success: true,
        message: 'Column active already exists in settings table',
        columnExisted: true
      }
    }

    // Add active column
    const { error: addColumnError } = await supabase.rpc('execute_sql', {
      sql_query: `
        ALTER TABLE public.settings
        ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

        COMMENT ON COLUMN public.settings.active
        IS 'Soft-delete flag - false means setting is deactivated';
      `
    })

    if (addColumnError) {
      logger.error('Error adding active column', addColumnError)
      throw new DatabaseError('ALTER_TABLE', 'settings', addColumnError)
    }

    // Update existing records
    const { error: updateError } = await supabase.rpc('execute_sql', {
      sql_query: `
        UPDATE public.settings
        SET active = true
        WHERE active IS NULL;
      `
    })

    if (updateError) {
      logger.error('Error updating existing records', updateError)
      throw new DatabaseError('UPDATE', 'settings', updateError)
    }

    logger.info('Successfully added active column to settings table')

    return {
      success: true,
      message: 'Successfully added active column to settings table',
      columnExisted: false
    }
  } catch (error) {
    logger.error('Migration failed', error)
    if (error instanceof DatabaseError) {
      throw error
    }
    throw new DatabaseError('MIGRATION', 'settings', error)
  }
}
