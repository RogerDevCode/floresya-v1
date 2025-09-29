/**
 * Supabase Client Configuration
 * Connects to Supabase backend for database operations
 */

import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not configured. Using local data only.')
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
  : null

// Helper to check if Supabase is configured
export function isSupabaseConfigured() {
  return supabase !== null
}

// Log initialization status
if (supabase) {
  console.log('✅ Supabase client initialized')
} else {
  console.log('ℹ️ Running in local mode (no Supabase)')
}