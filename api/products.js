/**
 * Vercel Serverless Function: Products API
 * GET /api/products - Get all products
 * GET /api/products?occasion=amor - Filter by occasion
 * GET /api/products?search=rosa - Search products
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check Supabase config
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Supabase not configured'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Build query
    let query = supabase
      .from('products')
      .select('*')
      .eq('active', true)

    // Apply filters
    const { occasion, search, featured } = req.query

    if (occasion) {
      query = query.eq('occasion', occasion)
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Execute query
    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return res.status(200).json({
      success: true,
      data,
      count: data.length
    })
  } catch (error) {
    console.error('Products API error:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}