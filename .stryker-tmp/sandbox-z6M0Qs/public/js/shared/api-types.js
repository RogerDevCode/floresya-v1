/**
 * TypeScript Types for FloresYa API
 * Auto-generated from OpenAPI specification
 * Generated: 2025-11-19T22:08:53.046Z
 * Spec Version: 1.0.0
 */
// @ts-nocheck


// Base response types
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
}

export interface ApiError {
  success: false
  error: string
  message: string
  details?: string[]
}

export interface SuccessResponse {
  success?: boolean
  data?: object
  message?: string
}

export interface ErrorResponse {
  success: boolean
  error: string
  message: string
  details?: object
  code: number
  category?: 'validation' | 'authentication' | 'not_found' | 'business' | 'server'
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  timestamp?: string
  path?: string
  requestId?: string
  errors?: object
}

export interface User {
  id?: number
  email?: string
  full_name?: string
  phone?: string
  role?: 'user' | 'admin'
  email_verified?: boolean
  active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Product {
  id?: number
  name?: string
  summary?: string
  description?: string
  price_usd?: number
  price_ves?: number
  stock?: number
  sku?: string
  featured?: boolean
  carousel_order?: number
  active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Occasion {
  id?: number
  name?: string
  description?: string
  slug?: string
  display_order?: number
  active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Productimage {
  id?: number
  product_id?: number
  image_index?: number
  size?: 'thumb' | 'small' | 'medium' | 'large'
  url?: string
  file_hash?: string
  mime_type?: string
  is_primary?: boolean
  created_at?: string
  updated_at?: string
}

export interface Order {
  id?: number
  user_id?: number
  customer_email?: string
  customer_name?: string
  customer_phone?: string
  delivery_address?: string
  delivery_date?: string
  delivery_time_slot?: string
  delivery_notes?: string
  status?: 'pending' | 'verified' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount_usd?: number
  total_amount_ves?: number
  currency_rate?: number
  notes?: string
  admin_notes?: string
  created_at?: string
  updated_at?: string
}

export interface OrderItem {
  id?: number
  order_id?: number
  product_id?: number
  product_name?: string
  product_summary?: string
  unit_price_usd?: number
  unit_price_ves?: number
  quantity?: number
  subtotal_usd?: number
  subtotal_ves?: number
  created_at?: string
  updated_at?: string
}

export interface OrderStatusHistory {
  id?: number
  order_id?: number
  old_status?: 'pending' | 'verified' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
  new_status?: 'pending' | 'verified' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
  notes?: string
  changed_by?: number
  created_at?: string
}

export interface Payment {
  id?: number
  order_id?: number
  user_id?: number
  amount_usd?: number
  amount_ves?: number
  payment_method_name?: string
  transaction_id?: string
  reference_number?: string
  status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded'
  created_at?: string
  updated_at?: string
}

export interface Settings {
  key?: string
  value?: string
  description?: string
  is_public?: boolean
  created_at?: string
  updated_at?: string
}

export interface PaginationParams {
  limit?: number
  offset?: number
  page?: number
}

export interface OrderStatusUpdate {
  status: 'pending' | 'verified' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
  notes?: string
}

export interface PaymentConfirm {
  payment_method: 'cash' | 'mobile_payment' | 'bank_transfer' | 'zelle' | 'crypto'
  reference_number: string
  payment_details?: object
  receipt_image_url?: string
}

export interface OrderCreate {
  order: object
  items: Array<object>
}

export interface ErrorCode {
  code?: number
  name?: string
  category?: 'validation' | 'authentication' | 'not_found' | 'business' | 'server'
  httpStatus?: number
  description?: string
}

export interface PaymentMethod {
  id?: number
  name?: string
  type?: 'bank_transfer' | 'mobile_payment' | 'cash' | 'crypto' | 'international'
  description?: string
  account_info?: string
  active?: boolean
  display_order?: number
  created_at?: string
  updated_at?: string
}

