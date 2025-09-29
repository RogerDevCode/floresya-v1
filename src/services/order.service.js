/**
 * OrderService
 * Business logic for order operations
 * @typedef {import('../types/index.js').Order} Order
 */

import { supabase, isSupabaseConfigured } from './supabase.js'

export class OrderService {
  /**
   * Create new order
   * @param {Object} orderData
   * @returns {Promise<Order>}
   */
  async createOrder(orderData) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured - orders require backend')
    }

    try {
      // Validate required fields
      if (!orderData.userId || !orderData.items || orderData.items.length === 0) {
        throw new Error('Invalid order data')
      }

      // Calculate total
      const total = orderData.items.reduce((sum, item) =>
        sum + (item.price * item.quantity), 0
      )

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.userId,
          total,
          delivery_address: orderData.deliveryAddress,
          delivery_notes: orderData.deliveryNotes || null,
          phone: orderData.phone,
          recipient_name: orderData.recipientName || null,
          status: 'pending'
        })
        .select()
        .single()

      if (orderError) {
        throw orderError
      }

      // Create order items
      const orderItems = orderData.items.map(item => ({
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

      return order
    } catch (error) {
      console.error('Failed to create order:', error)
      throw error
    }
  }

  /**
   * Get user orders
   * @param {string} userId
   * @returns {Promise<Order[]>}
   */
  async getUserOrders(userId) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured')
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to get user orders:', error)
      throw error
    }
  }

  /**
   * Get order by ID
   * @param {string} orderId
   * @returns {Promise<Order>}
   */
  async getOrderById(orderId) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured')
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to get order:', error)
      throw error
    }
  }

  /**
   * Update order status
   * @param {string} orderId
   * @param {string} status
   * @returns {Promise<Order>}
   */
  async updateOrderStatus(orderId, status) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured')
    }

    try {
      const updates = { status }

      // If status is delivered, set delivered_at
      if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to update order status:', error)
      throw error
    }
  }

  /**
   * Cancel order
   * @param {string} orderId
   * @returns {Promise<Order>}
   */
  async cancelOrder(orderId) {
    return this.updateOrderStatus(orderId, 'cancelled')
  }
}