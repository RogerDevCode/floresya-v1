#!/usr/bin/env node
// @ts-nocheck

/**
 * Direct PostgreSQL Migration Script
 * Adds is_active column to settings table using pg client
 */

import { Client } from 'pg'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function addIsActiveToSettings() {
  let client

  try {
    console.log('🔧 Starting direct PostgreSQL migration...')

    // Create client with database URL from .env
    client = new Client({
      connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
      ssl: false // Try without SSL first
    })

    await client.connect()
    console.log('✅ Connected to PostgreSQL database')

    // Add is_active column
    const queries = [
      `ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;`,
      `COMMENT ON COLUMN public.settings.is_active IS 'Soft-delete flag - false means setting is deactivated';`,
      `UPDATE public.settings SET is_active = true WHERE is_active IS NULL;`,
      `CREATE INDEX IF NOT EXISTS idx_settings_is_active ON public.settings (is_active);`
    ]

    for (const query of queries) {
      console.log(`Executing: ${query.substring(0, 50)}...`)
      const result = await client.query(query)
      console.log(`✅ Query executed successfully. Rows affected: ${result.rowCount || 0}`)
    }

    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    if (client) {
      await client.end()
    }
  }
}

// Run the migration
addIsActiveToSettings()
