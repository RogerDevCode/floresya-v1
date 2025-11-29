/**
 * JSDoc Types for FloresYa API
 * Auto-generated from OpenAPI specification
 * Generated: 2025-11-29T13:28:25.488Z
 * Spec Version: 1.0.0
 */

// Base response types

/**
 * @template T
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {T} data
 * @property {string} message
 */

/**
 * @typedef {Object} ApiError
 * @property {false} success
 * @property {string} error
 * @property {string} message
 * @property {string[]} [details]
 */

/**
 * @typedef {Object} SuccessResponse
 * @property {boolean} [success]
 * @property {object} [data]
 * @property {string} [message]
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {boolean} success
 * @property {string} error
 * @property {string} message
 * @property {object} [details]
 * @property {number} code
 * @property {'validation' | 'authentication' | 'not_found' | 'business' | 'server'} [category]
 * @property {string} [type]
 * @property {string} [title]
 * @property {number} [status]
 * @property {string} [detail]
 * @property {string} [instance]
 * @property {string} [timestamp]
 * @property {string} [path]
 * @property {string} [requestId]
 * @property {object} [errors]
 */

/**
 * @typedef {Object} User
 * @property {number} [id]
 * @property {string} [email]
 * @property {string} [full_name]
 * @property {string} [phone]
 * @property {'user' | 'admin'} [role]
 * @property {boolean} [email_verified]
 * @property {boolean} [active]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} Product
 * @property {number} [id]
 * @property {string} [name]
 * @property {string} [summary]
 * @property {string} [description]
 * @property {number} [price_usd]
 * @property {number} [price_ves]
 * @property {number} [stock]
 * @property {string} [sku]
 * @property {boolean} [featured]
 * @property {number} [carousel_order]
 * @property {boolean} [active]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} Occasion
 * @property {number} [id]
 * @property {string} [name]
 * @property {string} [description]
 * @property {string} [slug]
 * @property {number} [display_order]
 * @property {boolean} [active]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} Productimage
 * @property {number} [id]
 * @property {number} [product_id]
 * @property {number} [image_index]
 * @property {'thumb' | 'small' | 'medium' | 'large'} [size]
 * @property {string} [url]
 * @property {string} [file_hash]
 * @property {string} [mime_type]
 * @property {boolean} [is_primary]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} Order
 * @property {number} [id]
 * @property {number} [user_id]
 * @property {string} [customer_email]
 * @property {string} [customer_name]
 * @property {string} [customer_phone]
 * @property {string} [delivery_address]
 * @property {string} [delivery_date]
 * @property {string} [delivery_time_slot]
 * @property {string} [delivery_notes]
 * @property {'pending' | 'verified' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'} [status]
 * @property {number} [total_amount_usd]
 * @property {number} [total_amount_ves]
 * @property {number} [currency_rate]
 * @property {string} [notes]
 * @property {string} [admin_notes]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} OrderItem
 * @property {number} [id]
 * @property {number} [order_id]
 * @property {number} [product_id]
 * @property {string} [product_name]
 * @property {string} [product_summary]
 * @property {number} [unit_price_usd]
 * @property {number} [unit_price_ves]
 * @property {number} [quantity]
 * @property {number} [subtotal_usd]
 * @property {number} [subtotal_ves]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} OrderStatusHistory
 * @property {number} [id]
 * @property {number} [order_id]
 * @property {'pending' | 'verified' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'} [old_status]
 * @property {'pending' | 'verified' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'} [new_status]
 * @property {string} [notes]
 * @property {number} [changed_by]
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} Payment
 * @property {number} [id]
 * @property {number} [order_id]
 * @property {number} [user_id]
 * @property {number} [amount_usd]
 * @property {number} [amount_ves]
 * @property {string} [payment_method_name]
 * @property {string} [transaction_id]
 * @property {string} [reference_number]
 * @property {'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded'} [status]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} Settings
 * @property {string} [key]
 * @property {string} [value]
 * @property {string} [description]
 * @property {boolean} [is_public]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} PaginationParams
 * @property {number} [limit]
 * @property {number} [offset]
 * @property {number} [page]
 */

/**
 * @typedef {Object} OrderStatusUpdate
 * @property {'pending' | 'verified' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'} status
 * @property {string} [notes]
 */

/**
 * @typedef {Object} PaymentConfirm
 * @property {'cash' | 'mobile_payment' | 'bank_transfer' | 'zelle' | 'crypto'} payment_method
 * @property {string} reference_number
 * @property {object} [payment_details]
 * @property {string} [receipt_image_url]
 */

/**
 * @typedef {Object} OrderCreate
 * @property {object} order
 * @property {Array<object>} items
 */

/**
 * @typedef {Object} ErrorCode
 * @property {number} [code]
 * @property {string} [name]
 * @property {'validation' | 'authentication' | 'not_found' | 'business' | 'server'} [category]
 * @property {number} [httpStatus]
 * @property {string} [description]
 */

/**
 * @typedef {Object} PaymentMethod
 * @property {number} [id]
 * @property {string} [name]
 * @property {'bank_transfer' | 'mobile_payment' | 'cash' | 'crypto' | 'international'} [type]
 * @property {string} [description]
 * @property {string} [account_info]
 * @property {boolean} [active]
 * @property {number} [display_order]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

export {}
