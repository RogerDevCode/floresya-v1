/**
 * Vercel Serverless Function: Orders API
 * POST /api/orders - Create new order
 * GET /api/orders - Get user orders (requires auth)
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
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

    // Verify user token
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization required'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      })
    }

    // Handle POST - Create order
    if (req.method === 'POST') {
      const { items, deliveryAddress, deliveryNotes, phone, recipientName } = req.body

      // Validate
      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Order items required'
        })
      }

      if (!deliveryAddress || !phone) {
        return res.status(400).json({
          success: false,
          error: 'Delivery address and phone required'
        })
      }

      // Calculate total
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total,
          delivery_address: deliveryAddress,
          delivery_notes: deliveryNotes || null,
          phone,
          recipient_name: recipientName || null,
          status: 'pending'
        })
        .select()
        .single()

      if (orderError) {
        throw orderError
      }

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        throw itemsError
      }

      return res.status(201).json({
        success: true,
        data: order
      })
    }

    // Handle GET - Get user orders
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return res.status(200).json({
        success: true,
        data,
        count: data.length
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Orders API error:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}